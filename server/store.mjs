// Key-value store: Netlify Blobs in production, plain JSON files for local dev.
import { getStore } from '@netlify/blobs';
import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const STORE_NAME = 'hoi-muon-nghi';
const pendingWrites = new Map();

export function getKV() {
  if (process.env.HMN_FILE_STORE) return fileKV(process.env.HMN_FILE_STORE);
  // Created per request: Netlify injects the Blobs context per invocation.
  const store = getStore({ name: STORE_NAME, consistency: 'strong' });
  return {
    get: (key) => store.get(key, { type: 'json' }),
    async read(key) {
      const entry = await store.getWithMetadata(key, { type: 'json' });
      return entry && { data: entry.data, revision: entry.etag };
    },
    async set(key, value, revision) {
      const condition = revision === null ? { onlyIfNew: true } : { onlyIfMatch: revision };
      const result = await store.setJSON(key, value, condition);
      return result.modified;
    },
    async list(prefix) {
      const { blobs } = await store.list({ prefix });
      return blobs.map((b) => b.key);
    },
    // Binary blobs (chat images). Kept in a separate store so they never show up in JSON listings.
    async setBinary(key, bytes, metadata) {
      const media = getStore({ name: `${STORE_NAME}-media`, consistency: 'strong' });
      await media.set(key, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), { metadata });
    },
    async getBinary(key) {
      const media = getStore({ name: `${STORE_NAME}-media`, consistency: 'strong' });
      const entry = await media.getWithMetadata(key, { type: 'arrayBuffer' });
      return entry && { bytes: new Uint8Array(entry.data), metadata: entry.metadata };
    },
  };
}

function fileKV(dir) {
  const fileFor = (key) => path.join(dir, encodeURIComponent(key) + '.json');
  async function read(key) {
    try {
      const bytes = await fs.readFile(fileFor(key));
      return { data: JSON.parse(bytes), revision: createHash('sha256').update(bytes).digest('hex') };
    } catch (err) {
      if (err.code === 'ENOENT') return null;
      throw err;
    }
  }
  const mediaFor = (key) => path.join(dir, 'media', encodeURIComponent(key));
  return {
    read,
    get: async (key) => (await read(key))?.data ?? null,
    async setBinary(key, bytes, metadata) {
      await fs.mkdir(path.join(dir, 'media'), { recursive: true });
      await fs.writeFile(mediaFor(key) + '.meta', JSON.stringify(metadata));
      await fs.writeFile(mediaFor(key) + '.bin', bytes);
    },
    async getBinary(key) {
      try {
        const [bytes, meta] = await Promise.all([fs.readFile(mediaFor(key) + '.bin'), fs.readFile(mediaFor(key) + '.meta', 'utf8')]);
        return { bytes: new Uint8Array(bytes), metadata: JSON.parse(meta) };
      } catch (err) {
        if (err.code === 'ENOENT') return null;
        throw err;
      }
    },
    async set(key, value, revision) {
      const file = fileFor(key);
      const previous = pendingWrites.get(file) ?? Promise.resolve();
      const write = previous.catch(() => {}).then(async () => {
        const current = await read(key);
        if ((current?.revision ?? null) !== revision) return false;
        await fs.mkdir(dir, { recursive: true });
        const temporary = `${file}.${randomUUID()}.tmp`;
        try {
          await fs.writeFile(temporary, JSON.stringify(value));
          await fs.rename(temporary, file);
        } finally {
          await fs.rm(temporary, { force: true });
        }
        return true;
      });
      pendingWrites.set(file, write);
      try {
        return await write;
      } finally {
        if (pendingWrites.get(file) === write) pendingWrites.delete(file);
      }
    },
    async list(prefix) {
      let names = [];
      try {
        names = await fs.readdir(dir);
      } catch (err) {
        if (err.code !== 'ENOENT') throw err;
      }
      return names
        .filter((n) => n.endsWith('.json'))
        .map((n) => decodeURIComponent(n.slice(0, -5)))
        .filter((k) => k.startsWith(prefix));
    },
  };
}
