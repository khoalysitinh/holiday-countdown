/**
 * Local Storage & User Progress Service
 * Manages streaks, XP, stats, theme preferences, and bookmarked questions.
 */

const STORAGE_KEY = 'toeic_daily_app_state_v1';

const defaultState = {
  theme: 'dark',
  soundEnabled: true,
  ttsRate: 1.0,
  xp: 0,
  streak: 1,
  lastPracticeDate: null, // YYYY-MM-DD
  totalAnswered: 0,
  totalCorrect: 0,
  bookmarks: [], // Array of saved missed questions
  subjectStats: {
    math: { answered: 0, correct: 0 },
    history: { answered: 0, correct: 0 },
    geography: { answered: 0, correct: 0 },
    toeic: { answered: 0, correct: 0 }
  },
  achievements: []
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch (e) {
    console.error('Failed to load local state', e);
    return { ...defaultState };
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
}

export function updateStreak(state) {
  const today = new Date().toISOString().split('T')[0];
  if (!state.lastPracticeDate) {
    state.streak = 1;
    state.lastPracticeDate = today;
    return;
  }

  const lastDate = new Date(state.lastPracticeDate);
  const currentDate = new Date(today);
  const diffTime = Math.abs(currentDate - lastDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    state.streak += 1;
    state.lastPracticeDate = today;
  } else if (diffDays > 1) {
    state.streak = 1;
    state.lastPracticeDate = today;
  }
}

export function recordQuestionResult(state, question, isCorrect) {
  state.totalAnswered += 1;
  if (isCorrect) {
    state.totalCorrect += 1;
    state.xp += 15; // 15 XP per correct answer
  } else {
    state.xp += 3; // 3 XP participation effort
    // Add to bookmarks if not already added
    if (!state.bookmarks.some(b => b.question === question.question)) {
      state.bookmarks.unshift(question);
      if (state.bookmarks.length > 50) state.bookmarks.pop();
    }
  }

  // Update subject stats
  const topic = question.topic || 'toeic';
  if (!state.subjectStats[topic]) {
    state.subjectStats[topic] = { answered: 0, correct: 0 };
  }
  state.subjectStats[topic].answered += 1;
  if (isCorrect) state.subjectStats[topic].correct += 1;

  updateStreak(state);
  saveState(state);
}

export function toggleBookmark(state, question) {
  const index = state.bookmarks.findIndex(b => b.question === question.question);
  if (index >= 0) {
    state.bookmarks.splice(index, 1);
  } else {
    state.bookmarks.unshift(question);
  }
  saveState(state);
}
