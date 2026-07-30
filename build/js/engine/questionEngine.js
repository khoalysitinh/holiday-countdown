/**
 * Core Question Engine
 * Integrates procedural generators across Math, History, Geography, and TOEIC modules.
 * Handles deduplication, session tracking, and random question synthesis.
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

// Session history to prevent exact repeat questions within a session
const generatedQuestionHashes = new Set();

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash.toString();
}

/**
 * Generate a single procedural question matching topic and level filters.
 */
export function generateQuestion({ topic = 'all', level = 'all' } = {}) {
  let availableTopicKeys = [];
  if (topic === 'all' || !ALL_GENERATORS[topic]) {
    availableTopicKeys = Object.keys(ALL_GENERATORS);
  } else {
    availableTopicKeys = [topic];
  }

  // Filter generators by level if specified
  let matchedGenerators = [];
  availableTopicKeys.forEach(tKey => {
    const topicGens = ALL_GENERATORS[tKey];
    topicGens.forEach(g => {
      if (level === 'all' || g.level === level) {
        matchedGenerators.push(g);
      }
    });
  });

  // Fallback if no specific level matched
  if (matchedGenerators.length === 0) {
    availableTopicKeys.forEach(tKey => {
      matchedGenerators.push(...ALL_GENERATORS[tKey]);
    });
  }

  // Retry up to 10 times to ensure non-duplicate questions
  let attempts = 0;
  let q = null;

  while (attempts < 10) {
    const selectedGen = matchedGenerators[Math.floor(Math.random() * matchedGenerators.length)];
    q = selectedGen.generate();
    const qHash = hashString(q.question);

    if (!generatedQuestionHashes.has(qHash)) {
      generatedQuestionHashes.add(qHash);
      break;
    }
    attempts++;
  }

  return q;
}

/**
 * Generate a set of questions (e.g. Daily Challenge or TOEIC Mock Run)
 */
export function generateQuestionSet(count = 10, { topic = 'all', level = 'all' } = {}) {
  const set = [];
  for (let i = 0; i < count; i++) {
    set.push(generateQuestion({ topic, level }));
  }
  return set;
}

/**
 * Reset session memory if needed
 */
export function resetSessionHistory() {
  generatedQuestionHashes.clear();
}
