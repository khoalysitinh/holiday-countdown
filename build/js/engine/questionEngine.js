/**
 * Core Question Engine — v2
 * - Per-generator rotation tracking to prevent generator fatigue
 * - Per-question text hash deduplication within a session
 * - Fair topic rotation for "all" mode
 */

import { mathGenerators } from '../data/mathTemplates.js';
import { historyGenerators } from '../data/historyTemplates.js';
import { geographyGenerators } from '../data/geographyTemplates.js';
import { toeicGenerators } from '../data/toeicTemplates.js';

const ALL_GENERATORS = {
  math: mathGenerators,
  history: historyGenerators,
  geography: geographyGenerators,
  toeic: toeicGenerators
};

// Hash set prevents exact question-text repeats within the session
const sessionHashes = new Set();

// Per-generator "last used" counter to spread usage evenly
const generatorWeights = new Map();

function hashStr(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h |= 0;
  }
  return h.toString(36);
}

function getWeight(gen) {
  return generatorWeights.get(gen) || 0;
}

function pickGenerator(generators) {
  // Weighted random: prefer generators used LEAST recently
  const sorted = [...generators].sort((a, b) => getWeight(a) - getWeight(b));
  // Pick from the least-used third
  const cutoff = Math.max(1, Math.ceil(sorted.length / 3));
  const pool = sorted.slice(0, cutoff);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Generate a single non-duplicate procedural question.
 * @param {{ topic?: string, level?: string }} opts
 */
export function generateQuestion({ topic = 'all', level = 'all' } = {}) {
  let topicKeys;
  if (topic === 'all' || !ALL_GENERATORS[topic]) {
    topicKeys = Object.keys(ALL_GENERATORS);
  } else {
    topicKeys = [topic];
  }

  let candidates = [];
  topicKeys.forEach(k => {
    ALL_GENERATORS[k].forEach(g => {
      if (level === 'all' || g.level === level) candidates.push(g);
    });
  });

  // Fallback: ignore level filter if nothing matched
  if (candidates.length === 0) {
    topicKeys.forEach(k => candidates.push(...ALL_GENERATORS[k]));
  }

  let q = null;
  let attempts = 0;

  while (attempts < 20) {
    const gen = pickGenerator(candidates);
    q = gen.generate();
    const h = hashStr(q.question);

    if (!sessionHashes.has(h)) {
      sessionHashes.add(h);
      generatorWeights.set(gen, (generatorWeights.get(gen) || 0) + 1);
      break;
    }
    attempts++;
  }

  return q;
}

/**
 * Generate a batch of questions ensuring topic diversity when topic='all'
 */
export function generateQuestionSet(count = 10, { topic = 'all', level = 'all' } = {}) {
  const set = [];
  const topicKeys = topic === 'all' ? Object.keys(ALL_GENERATORS) : [topic];

  for (let i = 0; i < count; i++) {
    // Rotate topics fairly when mode is 'all'
    const rotatedTopic = topic === 'all' ? topicKeys[i % topicKeys.length] : topic;
    set.push(generateQuestion({ topic: rotatedTopic, level }));
  }
  return set;
}

/**
 * Clear session dedup memory (call on new session / mode switch)
 */
export function resetSessionHistory() {
  sessionHashes.clear();
  generatorWeights.clear();
}
