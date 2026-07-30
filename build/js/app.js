/**
 * Main Application Controller
 * Connects Question Engine, UI Events, Audio, LocalStorage, and Mode Managers.
 */

import { generateQuestion, generateQuestionSet } from './engine/questionEngine.js';
import { loadState, saveState, recordQuestionResult, toggleBookmark } from './services/storage.js';
import { speakText, stopSpeaking, playSoundEffect } from './services/audio.js';

// Application State
let appState = loadState();

let currentMode = 'daily'; // 'daily' | 'infinite' | 'speedrun' | 'bookmarks'
let currentTopic = 'all';
let currentLevel = 'all';

let currentQuestionSet = [];
let currentQuestionIndex = 0;
let currentQuestion = null;
let hasAnswered = false;

let timerInterval = null;
let secondsRemaining = 60;

// DOM Elements
const elements = {
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  audioToggleBtn: document.getElementById('audioToggleBtn'),
  pageHeading: document.getElementById('pageHeading'),
  pageSubheading: document.getElementById('pageSubheading'),

  // Filters
  filterSection: document.getElementById('filterSection'),
  topicFilterGroup: document.getElementById('topicFilterGroup'),
  levelFilterGroup: document.getElementById('levelFilterGroup'),

  // Quiz Card
  badgeTopic: document.getElementById('badgeTopic'),
  badgeLevel: document.getElementById('badgeLevel'),
  quizCounterText: document.getElementById('quizCounterText'),
  timerBadge: document.getElementById('timerBadge'),
  timerSeconds: document.getElementById('timerSeconds'),
  bookmarkBtn: document.getElementById('bookmarkBtn'),

  questionText: document.getElementById('questionText'),
  readQuestionBtn: document.getElementById('readQuestionBtn'),
  optionsGrid: document.getElementById('optionsGrid'),

  // Explanation Drawer
  explanationCard: document.getElementById('explanationCard'),
  explanationHeader: document.getElementById('explanationHeader'),
  resultIcon: document.getElementById('resultIcon'),
  resultTitle: document.getElementById('resultTitle'),
  explanationEnText: document.getElementById('explanationEnText'),
  explanationViText: document.getElementById('explanationViText'),
  vocabSection: document.getElementById('vocabSection'),
  vocabList: document.getElementById('vocabList'),

  // Footer Buttons
  skipQuestionBtn: document.getElementById('skipQuestionBtn'),
  nextQuestionBtn: document.getElementById('nextQuestionBtn'),

  // Widget Bar
  userStreak: document.getElementById('userStreak'),
  userXP: document.getElementById('userXP'),
  userLevelName: document.getElementById('userLevelName'),
  accuracyRate: document.getElementById('accuracyRate'),
  xpProgressBar: document.getElementById('xpProgressBar'),
  bookmarkCount: document.getElementById('bookmarkCount'),

  // Modals
  statsModal: document.getElementById('statsModal'),
  closeStatsBtn: document.getElementById('closeStatsBtn'),
  navStatsBtn: document.getElementById('navStatsBtn'),
  subjectBreakdownContainer: document.getElementById('subjectBreakdownContainer'),

  toastContainer: document.getElementById('toastContainer')
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initEventListeners();
  updateUIWidget();
  switchMode('daily');
});

// Theme Management
function initTheme() {
  document.documentElement.setAttribute('data-theme', appState.theme);
  elements.themeToggleBtn.textContent = appState.theme === 'dark' ? '🌙' : '☀️';
  elements.audioToggleBtn.textContent = appState.soundEnabled ? '🔊' : '🔇';
}

function toggleTheme() {
  appState.theme = appState.theme === 'dark' ? 'light' : 'dark';
  saveState(appState);
  initTheme();
  showToast(`Chuyển giao diện ${appState.theme === 'dark' ? 'Tối (Dark)' : 'Sáng (Light)'}`);
}

function toggleAudio() {
  appState.soundEnabled = !appState.soundEnabled;
  saveState(appState);
  initTheme();
  showToast(appState.soundEnabled ? 'Đã bật Âm thanh' : 'Đã tắt Âm thanh');
}

// User Level Names
function getLevelTitle(xp) {
  if (xp < 100) return 'Tập sự (Novice)';
  if (xp < 300) return 'Thông thạo (Practitioner)';
  if (xp < 700) return 'Chuyên gia (Expert)';
  if (xp < 1500) return 'Bậc thầy (Master)';
  return 'Huyền thoại (Legend)';
}

// Widget UI Updates
function updateUIWidget() {
  elements.userStreak.textContent = appState.streak;
  elements.userXP.textContent = appState.xp;
  elements.userLevelName.textContent = getLevelTitle(appState.xp);
  elements.bookmarkCount.textContent = appState.bookmarks.length;

  const rate = appState.totalAnswered > 0 
    ? Math.round((appState.totalCorrect / appState.totalAnswered) * 100) 
    : 100;
  elements.accuracyRate.textContent = `${rate}% Đúng`;

  const nextLevelXP = 300; // Cap visual bar
  const pct = Math.min(100, Math.round((appState.xp / nextLevelXP) * 100));
  elements.xpProgressBar.style.width = `${pct}%`;
}

// Event Listeners
function initEventListeners() {
  // Theme & Audio
  elements.themeToggleBtn.addEventListener('click', toggleTheme);
  elements.audioToggleBtn.addEventListener('click', toggleAudio);

  // Navigation Items
  document.querySelectorAll('.nav-menu .nav-item[data-mode]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-menu .nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      switchMode(item.getAttribute('data-mode'));
    });
  });

  // Topic Filters
  elements.topicFilterGroup.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.topicFilterGroup.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTopic = btn.getAttribute('data-topic');
      reloadCurrentQuestion();
    });
  });

  // Level Filters
  elements.levelFilterGroup.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.levelFilterGroup.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLevel = btn.getAttribute('data-level');
      reloadCurrentQuestion();
    });
  });

  // Quiz Control Buttons
  elements.readQuestionBtn.addEventListener('click', () => {
    if (currentQuestion) {
      speakText(currentQuestion.question, appState.ttsRate);
    }
  });

  elements.bookmarkBtn.addEventListener('click', () => {
    if (currentQuestion) {
      toggleBookmark(appState, currentQuestion);
      updateUIWidget();
      const isBookmarked = appState.bookmarks.some(b => b.question === currentQuestion.question);
      elements.bookmarkBtn.style.color = isBookmarked ? 'var(--accent-amber)' : 'inherit';
      showToast(isBookmarked ? 'Đã lưu câu hỏi vào kho Bookmark' : 'Đã bỏ lưu câu hỏi');
    }
  });

  elements.skipQuestionBtn.addEventListener('click', () => {
    if (appState.soundEnabled) playSoundEffect('click');
    loadNextQuestion();
  });

  elements.nextQuestionBtn.addEventListener('click', () => {
    if (appState.soundEnabled) playSoundEffect('click');
    loadNextQuestion();
  });

  // Stats Modal
  elements.navStatsBtn.addEventListener('click', openStatsModal);
  elements.closeStatsBtn.addEventListener('click', closeStatsModal);
  elements.statsModal.addEventListener('click', (e) => {
    if (e.target === elements.statsModal) closeStatsModal();
  });
}

// Mode Manager
function switchMode(mode) {
  currentMode = mode;
  stopSpeaking();
  clearInterval(timerInterval);
  elements.timerBadge.style.display = 'none';
  elements.filterSection.style.display = 'flex';

  if (mode === 'daily') {
    elements.pageHeading.textContent = '🔥 Thách Thức Hàng Ngày (Daily Quest)';
    elements.pageSubheading.textContent = '10 câu hỏi ngẫu nhiên được chọn lọc mỗi ngày để rèn luyện thói quen tốt.';
    currentQuestionSet = generateQuestionSet(10, { topic: currentTopic, level: currentLevel });
    currentQuestionIndex = 0;
    renderQuestionFromSet();
  } else if (mode === 'infinite') {
    elements.pageHeading.textContent = '🎯 Luyện Tập Tự Do (Infinite Practice)';
    elements.pageSubheading.textContent = 'Luyện tập không giới hạn với kho câu hỏi biến đổi liên tục không lặp lại.';
    currentQuestionSet = [];
    loadRandomSingleQuestion();
  } else if (mode === 'speedrun') {
    elements.pageHeading.textContent = '⏱️ TOEIC Speed Run (20 Câu)';
    elements.pageSubheading.textContent = 'Chế độ tính giờ áp lực cao: 20 câu hỏi hoàn thành trong 10 phút.';
    currentQuestionSet = generateQuestionSet(20, { topic: 'toeic', level: currentLevel });
    currentQuestionIndex = 0;
    startTimer(600); // 10 minutes overall
    renderQuestionFromSet();
  } else if (mode === 'bookmarks') {
    elements.pageHeading.textContent = '📚 Review Câu Làm Sai (Flashcards)';
    elements.pageSubheading.textContent = 'Ôn tập lại các câu bạn từng làm sai hoặc đã đánh dấu.';
    elements.filterSection.style.display = 'none';
    if (appState.bookmarks.length === 0) {
      showEmptyBookmarksUI();
    } else {
      currentQuestionSet = [...appState.bookmarks];
      currentQuestionIndex = 0;
      renderQuestionFromSet();
    }
  }
}

function reloadCurrentQuestion() {
  if (currentMode === 'infinite') {
    loadRandomSingleQuestion();
  } else if (currentMode === 'daily' || currentMode === 'speedrun') {
    currentQuestionSet = generateQuestionSet(currentMode === 'speedrun' ? 20 : 10, { topic: currentTopic, level: currentLevel });
    currentQuestionIndex = 0;
    renderQuestionFromSet();
  }
}

function loadRandomSingleQuestion() {
  currentQuestion = generateQuestion({ topic: currentTopic, level: currentLevel });
  currentQuestionIndex = 0;
  elements.quizCounterText.textContent = `Chế độ Luyện Tự Do`;
  renderQuestion(currentQuestion);
}

function renderQuestionFromSet() {
  if (!currentQuestionSet || currentQuestionSet.length === 0) return;
  if (currentQuestionIndex >= currentQuestionSet.length) {
    showSetCompleteUI();
    return;
  }
  currentQuestion = currentQuestionSet[currentQuestionIndex];
  elements.quizCounterText.textContent = `Câu ${currentQuestionIndex + 1} / ${currentQuestionSet.length}`;
  renderQuestion(currentQuestion);
}

function renderQuestion(question) {
  hasAnswered = false;
  elements.explanationCard.style.display = 'none';
  elements.nextQuestionBtn.style.display = 'none';
  elements.skipQuestionBtn.style.display = 'inline-block';

  // Badge updates
  elements.badgeTopic.textContent = question.topicName || 'TOEIC & English';
  elements.badgeLevel.textContent = question.level;

  // Bookmark active check
  const isBookmarked = appState.bookmarks.some(b => b.question === question.question);
  elements.bookmarkBtn.style.color = isBookmarked ? 'var(--accent-amber)' : 'inherit';

  // Question Text
  elements.questionText.textContent = question.question;

  // Options Grid
  elements.optionsGrid.innerHTML = '';
  const optionKeys = ['A', 'B', 'C', 'D'];

  question.options.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `
      <span class="option-key">${optionKeys[index]}</span>
      <span class="option-text">${optText}</span>
    `;

    btn.addEventListener('click', () => handleAnswerSelect(index));
    elements.optionsGrid.appendChild(btn);
  });
}

function handleAnswerSelect(selectedIndex) {
  if (hasAnswered) return;
  hasAnswered = true;

  const isCorrect = selectedIndex === currentQuestion.answerIndex;
  const optionButtons = elements.optionsGrid.querySelectorAll('.option-btn');

  // Highlight choices
  optionButtons.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === currentQuestion.answerIndex) {
      btn.classList.add('correct');
    } else if (idx === selectedIndex) {
      btn.classList.add('incorrect');
    }
  });

  // Sound effect
  if (appState.soundEnabled) {
    playSoundEffect(isCorrect ? 'correct' : 'incorrect');
  }

  // Update State & LocalStorage
  recordQuestionResult(appState, currentQuestion, isCorrect);
  updateUIWidget();

  // Show explanation
  showExplanation(isCorrect);

  elements.nextQuestionBtn.style.display = 'inline-flex';
  elements.skipQuestionBtn.style.display = 'none';
}

function showExplanation(isCorrect) {
  elements.explanationCard.style.display = 'flex';

  if (isCorrect) {
    elements.explanationHeader.className = 'explanation-header correct';
    elements.resultIcon.textContent = '🎉';
    elements.resultTitle.textContent = 'Chính Xác! (+15 XP)';
  } else {
    elements.explanationHeader.className = 'explanation-header incorrect';
    elements.resultIcon.textContent = '❌';
    elements.resultTitle.textContent = 'Chưa Đúng! (+3 XP)';
  }

  elements.explanationEnText.innerHTML = `<strong>English Logic:</strong> ${currentQuestion.explanationEn}`;
  elements.explanationViText.innerHTML = `<strong>Giải thích Tiếng Việt:</strong> ${currentQuestion.explanationVi}`;

  // Vocab section
  if (currentQuestion.vocabulary && currentQuestion.vocabulary.length > 0) {
    elements.vocabSection.style.display = 'flex';
    elements.vocabList.innerHTML = currentQuestion.vocabulary.map(v => `
      <div class="vocab-chip">
        <strong>${v.word}</strong> (${v.type || 'n'}): <span>${v.vi}</span>
      </div>
    `).join('');
  } else {
    elements.vocabSection.style.display = 'none';
  }
}

function loadNextQuestion() {
  stopSpeaking();
  if (currentMode === 'infinite') {
    loadRandomSingleQuestion();
  } else if (currentMode === 'daily' || currentMode === 'speedrun' || currentMode === 'bookmarks') {
    currentQuestionIndex++;
    renderQuestionFromSet();
  }
}

// Timer for Speedrun
function startTimer(seconds) {
  clearInterval(timerInterval);
  secondsRemaining = seconds;
  elements.timerBadge.style.display = 'inline-flex';
  elements.timerSeconds.textContent = secondsRemaining;

  timerInterval = setInterval(() => {
    secondsRemaining--;
    elements.timerSeconds.textContent = secondsRemaining;
    if (secondsRemaining <= 0) {
      clearInterval(timerInterval);
      showSetCompleteUI();
    }
  }, 1000);
}

// UI Helpers
function showSetCompleteUI() {
  clearInterval(timerInterval);
  elements.questionText.textContent = '🎉 Bạn đã hoàn thành xuất sắc bài luyện tập!';
  elements.optionsGrid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: rgba(16, 185, 129, 0.1); border-radius: var(--radius-md); border: 1px solid var(--accent-emerald);">
      <h3 style="color: var(--accent-emerald); font-size: 1.5rem; margin-bottom: 0.5rem;">Chúc mừng!</h3>
      <p style="color: var(--text-secondary);">Bạn đã tích lũy thêm điểm XP và tăng cường trí nhớ từ vựng hôm nay.</p>
      <button class="btn-primary" id="restartSetBtn" style="margin-top: 1.25rem;">
        🔄 Luyện Tập Tiếp Tục
      </button>
    </div>
  `;
  elements.explanationCard.style.display = 'none';
  elements.nextQuestionBtn.style.display = 'none';
  elements.skipQuestionBtn.style.display = 'none';

  document.getElementById('restartSetBtn').addEventListener('click', () => {
    switchMode(currentMode);
  });
}

function showEmptyBookmarksUI() {
  elements.questionText.textContent = '📚 Kho Bookmark trống!';
  elements.optionsGrid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; background: rgba(255, 255, 255, 0.05); border-radius: var(--radius-md);">
      <p style="color: var(--text-secondary);">Các câu bạn trả lời sai sẽ tự động được lưu vào đây để ôn tập lại.</p>
    </div>
  `;
  elements.explanationCard.style.display = 'none';
  elements.nextQuestionBtn.style.display = 'none';
  elements.skipQuestionBtn.style.display = 'none';
}

function openStatsModal() {
  elements.modalStreakVal.textContent = appState.streak;
  elements.modalXpVal.textContent = appState.xp;
  elements.modalAnsweredVal.textContent = appState.totalAnswered;

  const rate = appState.totalAnswered > 0 
    ? Math.round((appState.totalCorrect / appState.totalAnswered) * 100) 
    : 0;
  elements.modalAccuracyVal.textContent = `${rate}%`;

  // Render subject breakdown
  const subjects = [
    { key: 'toeic', name: '💼 TOEIC & Business' },
    { key: 'math', name: '🧮 Toán & Logic' },
    { key: 'history', name: '🏛️ Lịch sử' },
    { key: 'geography', name: '🌍 Địa lý' }
  ];

  elements.subjectBreakdownContainer.innerHTML = subjects.map(s => {
    const stat = appState.subjectStats[s.key] || { answered: 0, correct: 0 };
    const pct = stat.answered > 0 ? Math.round((stat.correct / stat.answered) * 100) : 0;
    return `
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.25rem;">
          <span>${s.name} (${stat.correct}/${stat.answered})</span>
          <strong>${pct}%</strong>
        </div>
        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 99px; overflow: hidden;">
          <div style="width: ${pct}%; height: 100%; background: var(--gradient-accent);"></div>
        </div>
      </div>
    `;
  }).join('');

  elements.statsModal.classList.add('active');
}

function closeStatsModal() {
  elements.statsModal.classList.remove('active');
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>⚡</span> <span>${msg}</span>`;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
