/**
 * Main Application Controller — v2
 * Fixes:
 * - Stats modal element references
 * - Bookmarks review correct navigation + index reset
 * - Streak explanation in UI
 * - topicName "Math & Logic" instead of Vietnamese
 * - XP bar scales to current level thresholds
 */

import { generateQuestion, generateQuestionSet, resetSessionHistory } from './engine/questionEngine.js';
import { loadState, saveState, recordQuestionResult, toggleBookmark } from './services/storage.js';
import { speakText, stopSpeaking, playSoundEffect } from './services/audio.js';

// ── App State ──────────────────────────────────────────────────────────────
let appState = loadState();

let currentMode = 'daily';
let currentTopic = 'all';
let currentLevel = 'all';

let currentQuestionSet = [];
let currentQuestionIndex = 0;
let currentQuestion = null;
let hasAnswered = false;

let timerInterval = null;
let secondsRemaining = 600;

// ── XP Level Thresholds ────────────────────────────────────────────────────
const LEVELS = [
  { name: 'Novice',        xpMin: 0,    xpMax: 150  },
  { name: 'Practitioner',  xpMin: 150,  xpMax: 400  },
  { name: 'Expert',        xpMin: 400,  xpMax: 900  },
  { name: 'Master',        xpMin: 900,  xpMax: 2000 },
  { name: 'Legend',        xpMin: 2000, xpMax: 9999 }
];

function getLevelInfo(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpMin) return LEVELS[i];
  }
  return LEVELS[0];
}

// ── DOM Element Cache ──────────────────────────────────────────────────────
const el = {};
const ids = [
  'themeToggleBtn', 'audioToggleBtn', 'pageHeading', 'pageSubheading',
  'filterSection', 'topicFilterGroup', 'levelFilterGroup',
  'badgeTopic', 'badgeLevel', 'quizCounterText',
  'timerBadge', 'timerSeconds', 'bookmarkBtn',
  'questionText', 'readQuestionBtn', 'optionsGrid',
  'explanationCard', 'explanationHeader', 'resultIcon', 'resultTitle',
  'explanationEnText', 'explanationViText', 'vocabSection', 'vocabList',
  'skipQuestionBtn', 'nextQuestionBtn',
  'userStreak', 'userXP', 'userLevelName', 'accuracyRate', 'xpProgressBar',
  'bookmarkCount',
  'statsModal', 'closeStatsBtn', 'navStatsBtn', 'subjectBreakdownContainer',
  'modalStreakVal', 'modalXpVal', 'modalAnsweredVal', 'modalAccuracyVal',
  'toastContainer'
];
ids.forEach(id => { el[id] = document.getElementById(id); });

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  attachListeners();
  updateWidget();
  switchMode('daily');
});

// ── Theme ──────────────────────────────────────────────────────────────────
function applyTheme() {
  document.documentElement.setAttribute('data-theme', appState.theme);
  el.themeToggleBtn.textContent = appState.theme === 'dark' ? '🌙' : '☀️';
  el.audioToggleBtn.textContent = appState.soundEnabled ? '🔊' : '🔇';
}

function toggleTheme() {
  appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
  saveState(appState);
  applyTheme();
  showToast(`Switched to ${appState.theme === 'dark' ? 'Dark' : 'Light'} mode`);
}

function toggleAudio() {
  appState.soundEnabled = !appState.soundEnabled;
  saveState(appState);
  applyTheme();
  showToast(appState.soundEnabled ? '🔊 Sound effects ON' : '🔇 Sound effects OFF');
}

// ── Widget / Sidebar Progress ──────────────────────────────────────────────
function updateWidget() {
  el.userStreak.textContent = appState.streak;
  el.userXP.textContent = appState.xp;

  const lvl = getLevelInfo(appState.xp);
  el.userLevelName.textContent = lvl.name;

  const pct = Math.min(100, Math.round(((appState.xp - lvl.xpMin) / (lvl.xpMax - lvl.xpMin)) * 100));
  el.xpProgressBar.style.width = `${pct}%`;

  const rate = appState.totalAnswered > 0
    ? Math.round((appState.totalCorrect / appState.totalAnswered) * 100) : 100;
  el.accuracyRate.textContent = `${rate}% Correct`;

  el.bookmarkCount.textContent = appState.bookmarks.length;
}

// ── Event Listeners ────────────────────────────────────────────────────────
function attachListeners() {
  el.themeToggleBtn.addEventListener('click', toggleTheme);
  el.audioToggleBtn.addEventListener('click', toggleAudio);

  // Nav mode switching
  document.querySelectorAll('.nav-menu .nav-item[data-mode]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-menu .nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      switchMode(item.getAttribute('data-mode'));
    });
  });

  // Topic filter chips
  el.topicFilterGroup.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.topicFilterGroup.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTopic = btn.getAttribute('data-topic');
      if (currentMode !== 'bookmarks') reloadMode();
    });
  });

  // Level filter chips
  el.levelFilterGroup.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      el.levelFilterGroup.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLevel = btn.getAttribute('data-level');
      if (currentMode !== 'bookmarks') reloadMode();
    });
  });

  // Quiz controls
  el.readQuestionBtn.addEventListener('click', () => {
    if (currentQuestion) speakText(currentQuestion.question, appState.ttsRate || 1.0);
  });

  el.bookmarkBtn.addEventListener('click', () => {
    if (!currentQuestion) return;
    toggleBookmark(appState, currentQuestion);
    updateWidget();
    const saved = appState.bookmarks.some(b => b.question === currentQuestion.question);
    el.bookmarkBtn.style.color = saved ? 'var(--accent-amber)' : '';
    showToast(saved ? '🔖 Saved to Review list' : '🗑️ Removed from Review list');
  });

  el.skipQuestionBtn.addEventListener('click', () => {
    if (appState.soundEnabled) playSoundEffect('click');
    nextQuestion();
  });

  el.nextQuestionBtn.addEventListener('click', () => {
    if (appState.soundEnabled) playSoundEffect('click');
    nextQuestion();
  });

  // Stats modal
  el.navStatsBtn.addEventListener('click', openStats);
  el.closeStatsBtn.addEventListener('click', closeStats);
  el.statsModal.addEventListener('click', e => { if (e.target === el.statsModal) closeStats(); });
}

// ── Mode Manager ───────────────────────────────────────────────────────────
function switchMode(mode) {
  currentMode = mode;
  stopSpeaking();
  clearInterval(timerInterval);
  el.timerBadge.style.display = 'none';
  el.filterSection.style.display = 'flex';
  resetSessionHistory();

  if (mode === 'daily') {
    el.pageHeading.textContent = '🔥 Daily Challenge';
    el.pageSubheading.textContent = '10 randomly selected questions every day to build your streak — all topics mixed.';
    currentQuestionSet = generateQuestionSet(10, { topic: currentTopic, level: currentLevel });
    currentQuestionIndex = 0;
    displayFromSet();
  } else if (mode === 'infinite') {
    el.pageHeading.textContent = '🎯 Infinite Practice';
    el.pageSubheading.textContent = 'Unlimited practice — questions regenerate dynamically, never repeating in the same session.';
    currentQuestionSet = [];
    loadInfiniteQuestion();
  } else if (mode === 'speedrun') {
    el.pageHeading.textContent = '⏱️ TOEIC Speed Run (20 Questions)';
    el.pageSubheading.textContent = 'High-pressure timed mode: complete 20 TOEIC questions within 10 minutes.';
    currentQuestionSet = generateQuestionSet(20, { topic: 'toeic', level: currentLevel });
    currentQuestionIndex = 0;
    startTimer(600);
    displayFromSet();
  } else if (mode === 'bookmarks') {
    el.pageHeading.textContent = '📚 Review Mistakes (Saved Questions)';
    el.pageSubheading.textContent = 'Questions you answered incorrectly or manually saved are listed here for revision.';
    el.filterSection.style.display = 'none';
    if (appState.bookmarks.length === 0) {
      showEmptyBookmarks();
    } else {
      currentQuestionSet = [...appState.bookmarks];
      currentQuestionIndex = 0;
      displayFromSet();
    }
  }
}

function reloadMode() {
  resetSessionHistory();
  if (currentMode === 'infinite') {
    loadInfiniteQuestion();
  } else if (currentMode === 'daily') {
    currentQuestionSet = generateQuestionSet(10, { topic: currentTopic, level: currentLevel });
    currentQuestionIndex = 0;
    displayFromSet();
  } else if (currentMode === 'speedrun') {
    clearInterval(timerInterval);
    currentQuestionSet = generateQuestionSet(20, { topic: 'toeic', level: currentLevel });
    currentQuestionIndex = 0;
    startTimer(600);
    displayFromSet();
  }
}

function loadInfiniteQuestion() {
  currentQuestion = generateQuestion({ topic: currentTopic, level: currentLevel });
  el.quizCounterText.textContent = `Infinite Practice`;
  renderQuestion(currentQuestion);
}

function displayFromSet() {
  if (!currentQuestionSet.length) return;
  if (currentQuestionIndex >= currentQuestionSet.length) {
    showComplete();
    return;
  }
  currentQuestion = currentQuestionSet[currentQuestionIndex];
  el.quizCounterText.textContent = `Question ${currentQuestionIndex + 1} of ${currentQuestionSet.length}`;
  renderQuestion(currentQuestion);
}

// ── Render Question ────────────────────────────────────────────────────────
function renderQuestion(q) {
  hasAnswered = false;
  el.explanationCard.style.display = 'none';
  el.nextQuestionBtn.style.display = 'none';
  el.skipQuestionBtn.style.display = 'inline-block';

  el.badgeTopic.textContent = q.topicName || 'TOEIC & English';
  el.badgeLevel.textContent = q.level ? q.level.charAt(0).toUpperCase() + q.level.slice(1) : 'Mixed';

  const saved = appState.bookmarks.some(b => b.question === q.question);
  el.bookmarkBtn.style.color = saved ? 'var(--accent-amber)' : '';

  el.questionText.textContent = q.question;
  el.optionsGrid.innerHTML = '';

  const keys = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.id = `option_${i}`;
    btn.innerHTML = `<span class="option-key">${keys[i]}</span><span class="option-text">${opt}</span>`;
    btn.addEventListener('click', () => handleAnswer(i));
    el.optionsGrid.appendChild(btn);
  });
}

// ── Answer Handling ────────────────────────────────────────────────────────
function handleAnswer(selectedIdx) {
  if (hasAnswered) return;
  hasAnswered = true;

  const isCorrect = selectedIdx === currentQuestion.answerIndex;
  const buttons = el.optionsGrid.querySelectorAll('.option-btn');

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === currentQuestion.answerIndex) btn.classList.add('correct');
    else if (i === selectedIdx) btn.classList.add('incorrect');
  });

  if (appState.soundEnabled) playSoundEffect(isCorrect ? 'correct' : 'incorrect');

  recordQuestionResult(appState, currentQuestion, isCorrect);
  updateWidget();
  renderExplanation(isCorrect);

  el.nextQuestionBtn.style.display = 'inline-flex';
  el.skipQuestionBtn.style.display = 'none';
}

function renderExplanation(isCorrect) {
  el.explanationCard.style.display = 'flex';
  el.explanationHeader.className = `explanation-header ${isCorrect ? 'correct' : 'incorrect'}`;
  el.resultIcon.textContent = isCorrect ? '🎉' : '❌';
  el.resultTitle.textContent = isCorrect ? 'Correct! (+15 XP)' : 'Not quite! (+3 XP) — Saved to Review';

  el.explanationEnText.innerHTML = `<strong>📖 Explanation:</strong> ${currentQuestion.explanationEn}`;
  el.explanationViText.innerHTML = `<strong>📝 Giải thích tiếng Việt:</strong> ${currentQuestion.explanationVi}`;

  if (currentQuestion.vocabulary?.length > 0) {
    el.vocabSection.style.display = 'flex';
    el.vocabList.innerHTML = currentQuestion.vocabulary.map(v =>
      `<div class="vocab-chip"><strong>${v.word}</strong> <span style="color:var(--text-muted)">(${v.type})</span>: <span>${v.vi}</span></div>`
    ).join('');
  } else {
    el.vocabSection.style.display = 'none';
  }
}

function nextQuestion() {
  stopSpeaking();
  if (currentMode === 'infinite') {
    loadInfiniteQuestion();
  } else {
    currentQuestionIndex++;
    displayFromSet();
  }
}

// ── Timer ──────────────────────────────────────────────────────────────────
function startTimer(seconds) {
  clearInterval(timerInterval);
  secondsRemaining = seconds;
  el.timerBadge.style.display = 'inline-flex';
  el.timerSeconds.textContent = formatTime(secondsRemaining);

  timerInterval = setInterval(() => {
    secondsRemaining--;
    el.timerSeconds.textContent = formatTime(secondsRemaining);
    if (secondsRemaining <= 0) {
      clearInterval(timerInterval);
      showComplete();
    }
  }, 1000);
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ── UI States ──────────────────────────────────────────────────────────────
function showComplete() {
  clearInterval(timerInterval);
  const correct = currentMode === 'bookmarks' ? 0 : 
    currentQuestionSet.reduce((acc, _, i) => acc, 0);

  el.questionText.textContent = '🎉 Session Complete!';
  el.optionsGrid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:2rem;background:rgba(16,185,129,0.1);border-radius:var(--radius-md);border:1px solid var(--accent-emerald);">
      <h3 style="color:var(--accent-emerald);font-size:1.5rem;margin-bottom:0.5rem;">Well done!</h3>
      <p style="color:var(--text-secondary);margin-bottom:1rem;">You earned XP and strengthened your vocabulary today. Keep your streak going!</p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <button class="btn-primary" id="restartBtn">🔄 Practice Again</button>
        <button class="btn-secondary" id="reviewBtn" style="background:rgba(245,158,11,0.15);border-color:var(--accent-amber);color:var(--accent-amber);">📚 Review Saved Questions</button>
      </div>
    </div>
  `;
  el.explanationCard.style.display = 'none';
  el.nextQuestionBtn.style.display = 'none';
  el.skipQuestionBtn.style.display = 'none';

  document.getElementById('restartBtn').addEventListener('click', () => switchMode(currentMode));
  document.getElementById('reviewBtn').addEventListener('click', () => {
    document.querySelectorAll('.nav-menu .nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-item[data-mode="bookmarks"]').classList.add('active');
    switchMode('bookmarks');
  });
}

function showEmptyBookmarks() {
  el.questionText.textContent = '📚 No saved questions yet!';
  el.optionsGrid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:2.5rem;background:rgba(255,255,255,0.04);border-radius:var(--radius-md);border:1px dashed var(--glass-border);">
      <p style="color:var(--text-secondary);font-size:1rem;">Questions you answer <strong>incorrectly</strong> are automatically saved here for revision.</p>
      <p style="color:var(--text-muted);font-size:0.88rem;margin-top:0.5rem;">You can also manually bookmark any question using the 🔖 button.</p>
    </div>
  `;
  el.explanationCard.style.display = 'none';
  el.nextQuestionBtn.style.display = 'none';
  el.skipQuestionBtn.style.display = 'none';
}

// ── Stats Modal ────────────────────────────────────────────────────────────
function openStats() {
  // Safely update — check elements exist
  if (el.modalStreakVal) el.modalStreakVal.textContent = appState.streak;
  if (el.modalXpVal) el.modalXpVal.textContent = appState.xp;
  if (el.modalAnsweredVal) el.modalAnsweredVal.textContent = appState.totalAnswered;

  const rate = appState.totalAnswered > 0
    ? Math.round((appState.totalCorrect / appState.totalAnswered) * 100) : 0;
  if (el.modalAccuracyVal) el.modalAccuracyVal.textContent = `${rate}%`;

  const subjects = [
    { key: 'toeic', name: '💼 TOEIC & Business' },
    { key: 'math', name: '🧮 Math & Logic' },
    { key: 'history', name: '🏛️ History' },
    { key: 'geography', name: '🌍 Geography' }
  ];

  if (el.subjectBreakdownContainer) {
    el.subjectBreakdownContainer.innerHTML = subjects.map(s => {
      const stat = appState.subjectStats?.[s.key] || { answered: 0, correct: 0 };
      const pct = stat.answered > 0 ? Math.round((stat.correct / stat.answered) * 100) : 0;
      const barColor = pct >= 80 ? 'var(--accent-emerald)' : pct >= 50 ? 'var(--accent-amber)' : 'var(--accent-rose)';
      return `
        <div>
          <div style="display:flex;justify-content:space-between;font-size:0.88rem;margin-bottom:0.3rem;">
            <span>${s.name}</span>
            <span style="color:var(--text-muted)">${stat.correct}/${stat.answered} correct — <strong style="color:${barColor}">${pct}%</strong></span>
          </div>
          <div style="width:100%;height:7px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:${barColor};transition:width 0.6s ease;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Streak explanation
  const streakInfo = document.getElementById('streakInfoText');
  if (streakInfo) {
    streakInfo.textContent = `Your streak is saved in this browser's local storage. It resets if you clear browser data or switch browsers.`;
  }

  el.statsModal.classList.add('active');
}

function closeStats() {
  el.statsModal.classList.remove('active');
}

// ── Toast Notifications ────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `<span>⚡</span><span>${msg}</span>`;
  el.toastContainer.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 350); }, 2800);
}
