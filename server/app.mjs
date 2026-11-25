// Hội Cá Bị Trừ KPI — API.
// Members: one JSON document each ("users/<username>"), only ever written by its owner,
// with optimistic concurrency (revision check + retry) for the same member in two tabs.
// Chat: one blob per message ("chat/<day>/<id>"), so writers never conflict.
// Quotes and daily missions live only on the server: the client gets today's one, never the bank.
import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { getKV } from './store.mjs';
import { QUOTES } from './quotes/index.mjs';
import { MISSIONS } from './missions.mjs';

const scrypt = promisify(crypto.scrypt);

const VN_OFFSET_MS = 7 * 3600 * 1000; // Asia/Ho_Chi_Minh, no DST
const TOKEN_TTL_MS = 60 * 24 * 3600 * 1000;
const ROTATION_EPOCH = '2026-01-01';
const CHAT_MAX_LEN = 500;
const CHAT_HISTORY = 150;

export const REACTIONS = ['😂', '🤗', '🔥', '✊', '💀'];
export const AVATARS = ['🦊', '🐼', '🐸', '🐧', '🦉', '🐙', '🦖', '🐱', '🐶', '🐹', '🦄', '🐢', '🐝', '🦥', '🐻', '🐵'];

// ---------- dates (all keys are Vietnam calendar days, YYYY-MM-DD) ----------
export const todayKey = (now = Date.now()) => new Date(now + VN_OFFSET_MS).toISOString().slice(0, 10);
export const addDays = (key, n) => {
  const d = new Date(key + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const isWeekend = (key) => {
  const wd = new Date(key + 'T00:00:00Z').getUTCDay();
  return wd === 0 || wd === 6;
};
const dayNumber = (key) => Math.round((Date.parse(key + 'T00:00:00Z') - Date.parse(ROTATION_EPOCH + 'T00:00:00Z')) / 86400000);
const mod = (n, m) => ((n % m) + m) % m;

// ---------- daily rotation ----------
// A fixed shuffle of each bank: one item per day, every item used once before any repeats.
function seededOrder(length, seed) {
  const order = Array.from({ length }, (_, i) => i);
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}
const QUOTE_ORDER = seededOrder(QUOTES.length, 0x4e4c);
const MISSION_ORDER = seededOrder(MISSIONS.length, 0x7a11);

export function quoteOf(day) {
  const slot = mod(dayNumber(day), QUOTES.length);
  return { no: slot + 1, of: QUOTES.length, text: QUOTES[QUOTE_ORDER[slot]] };
}
export function missionOf(day) {
  const [title, hint] = MISSIONS[MISSION_ORDER[mod(dayNumber(day), MISSIONS.length)]];
  return { title, hint };
}

// ---------- http helpers ----------
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new HttpError(status, message);
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
const cleanText = (value, max) =>
  String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

// ---------- auth ----------
let secretPromise = null;
function getSecret(kv) {
  if (process.env.HMN_SECRET) return Promise.resolve(process.env.HMN_SECRET);
  secretPromise ??= (async () => {
    let meta = await kv.get('meta/secret');
    if (!meta?.secret) {
      const candidate = { secret: crypto.randomBytes(32).toString('hex') };
      meta = (await kv.set('meta/secret', candidate, null)) ? candidate : await kv.get('meta/secret');
    }
    return meta.secret;
  })().catch((err) => {
    secretPromise = null;
    throw err;
  });
  return secretPromise;
}

const sign = (secret, payload) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');

async function makeToken(kv, username) {
  const payload = `${username}.${Date.now() + TOKEN_TTL_MS}`;
  return `${payload}.${sign(await getSecret(kv), payload)}`;
}

async function authUser(req, kv) {
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const [username, exp, sig] = token.split('.');
  if (!username || !exp || !sig) fail(401, 'Chưa trình diện. Đăng nhập đi đồng chí.');
  const expected = Buffer.from(sign(await getSecret(kv), `${username}.${exp}`));
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) fail(401, 'Thẻ ra vào không hợp lệ.');
  if (Number(exp) < Date.now()) fail(401, 'Thẻ ra vào hết hạn, trình diện lại nhé.');
  const entry = await kv.read(`users/${username}`);
  if (!entry) fail(401, 'Đồng chí này không có trong danh sách hội.');
  return entry;
}

async function hashPassword(password, salt) {
  return (await scrypt(password, salt, 32)).toString('hex');
}

// ---------- streaks & the group fire ----------
// "Góp củi" = answering the day's mission.
const fueled = (day) => Boolean(day?.challenge?.at);

function streakOf(days, today) {
  const done = Object.keys(days).filter((d) => fueled(days[d])).sort();
  if (!done.length) return { current: 0, best: 0 };
  let run = 0;
  let best = 0;
  // Weekends never break a streak, and today isn't over yet.
  for (let d = done[0]; d <= today; d = addDays(d, 1)) {
    if (fueled(days[d])) best = Math.max(best, ++run);
    else if (!isWeekend(d) && d !== today) run = 0;
  }
  return { current: run, best };
}

// Logs needed per day to keep the fire alive: a third of the members, at least 1, at most 6.
export const fireThreshold = (members) => Math.min(members, Math.max(1, Math.min(6, Math.ceil(members / 3))));

function fireOf(users, today) {
  const joined = users.map((u) => todayKey(u.createdAt || 0)).sort();
  const need = fireThreshold(users.length);
  const fuel = users.filter((u) => fueled(u.days?.[today])).length;
  let current = 0;
  let best = 0;
  let deaths = 0;
  let lastDeath = null;
  for (let d = joined[0]; joined.length && d <= today; d = addDays(d, 1)) {
    const members = joined.filter((j) => j <= d).length;
    const logs = users.filter((u) => fueled(u.days?.[d])).length;
    if (logs >= fireThreshold(members)) best = Math.max(best, ++current);
    else if (d !== today && !isWeekend(d)) {
      // A workday ended without enough logs: the fire dies and has to be lit again from zero.
      if (current > 0) {
        deaths++;
        lastDeath = d;
      }
      current = 0;
    }
  }
  return { current, best, deaths, lastDeath, need, fuel, litToday: users.length > 0 && fuel >= need, weekend: isWeekend(today) };
}

// ---------- state ----------
async function loadAllUsers(kv) {
  const keys = await kv.list('users/');
  const users = await Promise.all(keys.map((k) => kv.get(k)));
  return users.filter(Boolean);
}

// For other viewers, an anonymous answer today is not shown (no "fueled today", no streak bump)
// until the day is over, otherwise the leaderboard would reveal who wrote it.
function publicMember(u, today, hideAnonToday) {
  let days = u.days || {};
  if (hideAnonToday && days[today]?.challenge?.anon) {
    days = { ...days };
    delete days[today];
  }
  const { current, best } = streakOf(days, today);
  return { username: u.username, name: u.name, avatar: u.avatar, streak: current, best, fueledToday: fueled(days[today]) };
}

async function buildState(kv, me) {
  const today = todayKey();
  const users = (await loadAllUsers(kv)).filter((u) => u.username !== me.username);
  users.push(me);

  // Reactions live in the reactor's document: tally them per answer id.
  const tally = new Map();
  for (const u of users) {
    for (const [id, emoji] of Object.entries(u.reactions || {})) {
      if (!REACTIONS.includes(emoji)) continue;
      if (!tally.has(id)) tally.set(id, {});
      const counts = tally.get(id);
      counts[emoji] = (counts[emoji] || 0) + 1;
    }
  }

  const answers = [];
  for (const u of users) {
    const c = u.days?.[today]?.challenge;
    if (!c) continue;
    answers.push({
      id: c.id,
      text: c.text,
      at: c.at,
      author: c.anon ? null : { name: u.name, avatar: u.avatar },
      own: u.username === me.username,
      reactions: tally.get(c.id) || {},
      mine: me.reactions?.[c.id] || null,
    });
  }
  answers.sort((a, b) => b.at - a.at);

  const members = users.map((u) => publicMember(u, today, u.username !== me.username));
  const fire = fireOf(users, today);
  // Anonymous answers stay anonymous here too, otherwise the list would give their authors away.
  fire.fuelers = users
    .map((u) => u.days?.[today]?.challenge && (u.days[today].challenge.anon ? { name: null, avatar: '🐟' } : { name: u.name, avatar: u.avatar }))
    .filter(Boolean);
  const myDay = me.days?.[today] || {};
  return {
    today,
    serverTime: Date.now(),
    quote: quoteOf(today),
    mission: missionOf(today),
    fire,
    me: {
      ...members.find((m) => m.username === me.username),
      answer: myDay.challenge ? { text: myDay.challenge.text, anon: myDay.challenge.anon } : null,
      week: Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).filter((d) => fueled(me.days?.[d])),
    },
    members,
    answers,
  };
}

// Shown on the login screen, before anyone is signed in: today's quote and how the fire is doing.
async function publicState(kv) {
  const today = todayKey();
  const users = await loadAllUsers(kv);
  const { current, best, deaths, litToday, need, fuel } = fireOf(users, today);
  return { today, quote: quoteOf(today), members: users.length, fire: { current, best, deaths, litToday, need, fuel } };
}

// ---------- chat ----------
const chatId = (at) => `${String(at).padStart(14, '0')}-${crypto.randomBytes(4).toString('hex')}`;
const IMAGE_MAX_BYTES = 2 * 1024 * 1024;

// Trust the bytes, not the client's claimed type. SVG is deliberately not allowed (it can carry script).
function sniffImage(bytes) {
  const at = (i, ...sig) => sig.every((b, k) => bytes[i + k] === b);
  if (at(0, 0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  if (at(0, 0x47, 0x49, 0x46, 0x38)) return 'image/gif';
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return 'image/webp';
  return null;
}

async function storeChatImage(kv, image) {
  const data = String(image?.data || '');
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data)) fail(400, 'Ảnh không hợp lệ.');
  const bytes = new Uint8Array(Buffer.from(data, 'base64'));
  if (bytes.length > IMAGE_MAX_BYTES) fail(413, 'Ảnh nặng quá (tối đa 2 MB). Thử ảnh nhỏ hơn nhé.');
  const type = sniffImage(bytes);
  if (!type) fail(415, 'Chỉ gửi được ảnh JPG, PNG, GIF hoặc WebP.');
  const dim = (v) => Math.max(1, Math.min(10000, Math.round(Number(v) || 0))) || 1;
  const id = crypto.randomBytes(16).toString('hex');
  await kv.setBinary(`img/${id}`, bytes, { type });
  return { id, w: dim(image.w), h: dim(image.h) };
}

async function readChat(kv, after) {
  const today = todayKey();
  const prefixes = [`chat/${addDays(today, -1)}/`, `chat/${today}/`];
  const keys = (await Promise.all(prefixes.map((p) => kv.list(p)))).flat();
  const wanted = keys
    .map((key) => ({ key, id: key.slice(key.lastIndexOf('/') + 1) }))
    .filter(({ id }) => !after || id > after)
    .sort((a, b) => (a.id < b.id ? -1 : 1))
    .slice(-CHAT_HISTORY);
  const messages = await Promise.all(wanted.map(({ key }) => kv.get(key)));
  return messages.filter(Boolean);
}

// ---------- routes ----------
async function register(kv, body) {
  const username = String(body.username || '').trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) fail(400, 'Tên đăng nhập 3–20 ký tự, chỉ gồm chữ thường không dấu, số và _.');
  const password = String(body.password || '');
  if (password.length < 4) fail(400, 'Mật khẩu ít nhất 4 ký tự. Nổi loạn nhưng vẫn phải an toàn.');
  const teamCode = process.env.HMN_TEAM_CODE;
  if (teamCode && String(body.teamCode || '').trim() !== teamCode) fail(403, 'Sai mật hiệu. Hỏi đồng bọn đi.');
  const name = cleanText(body.name, 30) || username;
  const avatar = AVATARS.includes(body.avatar) ? body.avatar : AVATARS[Math.floor(Math.random() * AVATARS.length)];
  if (await kv.get(`users/${username}`)) fail(409, 'Tên này có đồng chí khác lấy rồi.');
  const salt = crypto.randomBytes(16).toString('hex');
  const user = { username, name, avatar, salt, hash: await hashPassword(password, salt), createdAt: Date.now(), days: {}, reactions: {} };
  if (!(await kv.set(`users/${username}`, user, null))) fail(409, 'Tên này có đồng chí khác lấy rồi.');
  return json({ token: await makeToken(kv, username) });
}

async function login(kv, body) {
  const username = String(body.username || '').trim().toLowerCase();
  const user = /^[a-z0-9_]{3,20}$/.test(username) ? await kv.get(`users/${username}`) : null;
  const hash = await hashPassword(String(body.password || ''), user?.salt || 'no-user');
  if (!user || !crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.hash, 'hex'))) {
    fail(401, 'Sai tên hoặc mật khẩu. Gián điệp à?');
  }
  return json({ token: await makeToken(kv, username) });
}

// Actions that change only the caller's own document.
const actions = {
  answer(user, body) {
    const text = cleanText(body.text, 181);
    if (text.length < 2 || text.length > 180) fail(400, 'Câu trả lời cần từ 2 đến 180 ký tự.');
    const today = todayKey();
    if (body.date !== today) fail(409, 'Đã sang ngày mới, nhiệm vụ cũng đổi rồi. Xem lại nhé.');
    user.days ||= {};
    user.days[today] ||= {};
    if (user.days[today].challenge) fail(409, 'Hôm nay bạn góp củi rồi. Mai góp tiếp.');
    user.days[today].challenge = { id: crypto.randomBytes(8).toString('hex'), text, anon: body.anon === true, at: Date.now() };
  },
  react(user, body) {
    const id = String(body.id || '');
    if (!/^[a-f0-9]{16}$/.test(id)) fail(400, 'Câu trả lời không hợp lệ.');
    user.reactions ||= {};
    if (!REACTIONS.includes(body.emoji) || user.reactions[id] === body.emoji) delete user.reactions[id];
    else user.reactions[id] = body.emoji;
  },
  profile(user, body) {
    const name = cleanText(body.name, 30);
    if (name) user.name = name;
    if (AVATARS.includes(body.avatar)) user.avatar = body.avatar;
  },
};

export async function handle(req) {
  try {
    const url = new URL(req.url);
    const route = url.pathname.replace(/^\/api\/?/, '').replace(/\/+$/, '');
    const kv = getKV();
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};

    if (req.method === 'GET' && route === 'public') return json(await publicState(kv));
    if (req.method === 'POST' && route === 'register') return await register(kv, body);
    if (req.method === 'POST' && route === 'login') return await login(kv, body);

    let entry = await authUser(req, kv);
    const me = entry.data;
    if (req.method === 'GET' && route === 'state') return json(await buildState(kv, me));

    if (req.method === 'GET' && route === 'chat') {
      const after = String(url.searchParams.get('after') || '');
      return json({ messages: await readChat(kv, /^[0-9]{14}-[a-f0-9]{8}$/.test(after) ? after : '') });
    }
    if (req.method === 'POST' && route === 'chat') {
      const text = cleanText(body.text, CHAT_MAX_LEN);
      if (!text && !body.image) fail(400, 'Tin nhắn trống trơn.');
      const image = body.image ? await storeChatImage(kv, body.image) : null;
      const at = Date.now();
      const message = { id: chatId(at), user: me.username, name: me.name, avatar: me.avatar, text, at };
      if (image) message.image = image;
      await kv.set(`chat/${todayKey(at)}/${message.id}`, message, null);
      return json({ message });
    }
    const imageRoute = route.match(/^img\/([a-f0-9]{32})$/);
    if (req.method === 'GET' && imageRoute) {
      const file = await kv.getBinary(`img/${imageRoute[1]}`);
      if (!file) fail(404, 'Ảnh không còn nữa.');
      return new Response(file.bytes, {
        headers: {
          'content-type': file.metadata?.type || 'application/octet-stream',
          'cache-control': 'private, max-age=31536000, immutable',
          'x-content-type-options': 'nosniff',
          'content-security-policy': "default-src 'none'",
        },
      });
    }

    if (req.method === 'POST' && Object.hasOwn(actions, route)) {
      for (let attempt = 0; attempt < 4; attempt++) {
        const { data: user, revision } = entry;
        actions[route](user, body);
        if (await kv.set(`users/${user.username}`, user, revision)) return json(await buildState(kv, user));
        entry = await kv.read(`users/${user.username}`);
        if (!entry) fail(401, 'Đồng chí này không có trong danh sách hội.');
      }
      fail(409, 'Tài khoản vừa thay đổi ở một tab khác. Thử lại nhé.');
    }
    fail(404, 'Không có API này.');
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    console.error(err);
    return json({ error: 'Server cũng đang nổi loạn. Thử lại sau nhé.' }, 500);
  }
}
