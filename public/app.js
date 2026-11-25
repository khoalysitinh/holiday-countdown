// Những Con Cá Bị Trừ KPI — client.
// Mọi nội dung người dùng nhập đều đi qua textContent, không bao giờ innerHTML.

const AVATARS = ['🦊', '🐼', '🐸', '🐧', '🦉', '🐙', '🦖', '🐱', '🐶', '🐹', '🦄', '🐢', '🐝', '🦥', '🐻', '🐵'];
const REACTIONS = [['😂', 'Buồn cười'], ['🤗', 'Ôm một cái'], ['🔥', 'Cháy quá'], ['✊', 'Đồng lòng'], ['💀', 'Hết cứu']];
const SLOGANS = [
  'Tan làm đúng giờ là quyền thiêng liêng',
  'Họp không agenda là họp không tồn tại',
  'Cá bị trừ KPI vẫn bơi',
  'Mỗi ngày một que củi, lửa hội không tắt',
  'Không trả lời tin nhắn công việc sau 21h',
  'Ngủ trưa là quyền con người',
  'Đồng lòng bơi ngược dòng',
  'Chuyện trong hội ở lại trong hội',
];
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const TOKEN_KEY = 'hmn_token';
const VN_OFFSET = 7 * 3600 * 1000;
const CHAT_FAST = 4000;
const CHAT_SLOW = 20000;

const $ = (id) => document.getElementById(id);
let token = localStorage.getItem(TOKEN_KEY) || '';
let state = null;
let clockOffset = 0;
let authMode = 'login';
let chosenAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
let stateTimer = null;
let tickTimer = null;
const chat = { ids: new Set(), last: null, lastId: '', timer: null, unread: 0, busy: false, started: false, gen: 0 };

// ---------- helpers ----------
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function emoji(char) {
  return el('i', '', char);
}
let toastTimer;
function toast(message) {
  const t = $('toast');
  t.textContent = message;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 3600);
}

async function api(route, body, query = '') {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const init = { headers, cache: 'no-store' };
  if (body !== undefined) {
    init.method = 'POST';
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(`/api/${route}${query}`, init);
  } catch {
    throw Object.assign(new Error('Mất kết nối với căn cứ. Kiểm tra mạng nhé.'), { status: 0 });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) {
      leave('Thẻ ra vào hết hạn. Trình diện lại nhé.');
    }
    throw Object.assign(new Error(data.error || 'Căn cứ chưa phản hồi. Thử lại nhé.'), { status: res.status });
  }
  return data;
}

// Vietnam time, corrected by the server clock.
const vnDate = (ts = Date.now() + clockOffset) => new Date(ts + VN_OFFSET);
const vnDayKey = (ts) => vnDate(ts).toISOString().slice(0, 10);
const vnTime = (ts) => vnDate(ts).toISOString().slice(11, 16);
function dayLabel(key) {
  const d = new Date(`${key}T00:00:00Z`);
  return `${['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][d.getUTCDay()]}, ${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}
function untilMidnight() {
  const now = vnDate();
  const left = 86400000 - (now.getUTCHours() * 3600000 + now.getUTCMinutes() * 60000 + now.getUTCSeconds() * 1000);
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function avatarPicker(container, selected, onPick) {
  container.replaceChildren(...AVATARS.map((a) => {
    const b = el('button', '', a);
    b.type = 'button';
    b.setAttribute('aria-label', `Linh vật ${a}`);
    b.setAttribute('aria-pressed', String(a === selected));
    b.addEventListener('click', () => {
      container.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onPick(a);
    });
    return b;
  }));
}

// ---------- gate ----------
function setMode(mode) {
  authMode = mode;
  const reg = mode === 'register';
  document.querySelector('.gate-card').classList.toggle('is-register', reg);
  $('tab-login').setAttribute('aria-selected', String(!reg));
  $('tab-register').setAttribute('aria-selected', String(reg));
  $('auth-title').textContent = reg ? 'Đơn xin gia nhập' : 'Đồng chí trình diện';
  $('auth-sub').textContent = reg ? 'Ký tên vào đây. Từ hôm nay bạn là một con cá nổi loạn.' : 'Nhập mật danh để vào căn cứ.';
  $('auth-submit').textContent = reg ? 'Ký tên gia nhập ✊' : 'Vào căn cứ ✊';
  $('auth-form').password.autocomplete = reg ? 'new-password' : 'current-password';
  $('auth-error').hidden = true;
}

function renderGateFire(info) {
  const f = info.fire;
  const box = $('gate-fire');
  box.classList.toggle('is-dead', f.current === 0 && !f.litToday);
  if (!info.members) {
    $('gate-fire-title').textContent = 'Lửa hội chưa từng được thắp.';
    $('gate-fire-sub').textContent = 'Hãy là con cá đầu tiên nhóm lửa.';
  } else if (f.current > 0) {
    $('gate-fire-title').textContent = `Lửa hội đã cháy ${f.current} ngày liên tục`;
    $('gate-fire-sub').textContent = f.litToday
      ? `Hôm nay đã đủ củi (${f.fuel}/${f.need}). ${info.members} con cá đang giữ lửa.`
      : `Hôm nay mới có ${f.fuel}/${f.need} que củi. Vào góp đi, không lửa tắt về 0!`;
  } else {
    $('gate-fire-title').textContent = f.deaths ? 'Lửa hội đã tắt. Cần người thắp lại.' : 'Lửa hội đang chờ được nhóm.';
    $('gate-fire-sub').textContent = `Cần ${f.need} que củi hôm nay để thắp lại${f.best ? ` · kỷ lục cũ: ${f.best} ngày` : ''}.`;
  }
  $('gate-quote-no').textContent = `Lời hiệu triệu hôm nay · số ${info.quote.no}`;
  $('gate-quote').textContent = `“${info.quote.text}”`;
}

async function loadPublic() {
  try {
    renderGateFire(await api('public'));
  } catch {
    $('gate-fire-title').textContent = 'Không liên lạc được với căn cứ.';
  }
}

function showGate() {
  document.body.dataset.view = 'gate';
  setMode(authMode);
  loadPublic();
}

async function submitAuth(event) {
  event.preventDefault();
  const form = $('auth-form');
  const err = $('auth-error');
  const fields = {
    username: form.username.value.trim().toLowerCase(),
    password: form.password.value,
  };
  if (!/^[a-z0-9_]{3,20}$/.test(fields.username)) {
    err.textContent = 'Tên đăng nhập 3–20 ký tự: chữ thường không dấu, số hoặc dấu _.';
    err.hidden = false;
    return;
  }
  if (fields.password.length < 4) {
    err.textContent = 'Mật khẩu ít nhất 4 ký tự.';
    err.hidden = false;
    return;
  }
  if (authMode === 'register') {
    Object.assign(fields, { name: form.name.value, teamCode: form.teamCode.value, avatar: chosenAvatar });
  }
  const btn = $('auth-submit');
  btn.disabled = true;
  err.hidden = true;
  try {
    const { token: t } = await api(authMode, fields);
    token = t;
    localStorage.setItem(TOKEN_KEY, t);
    form.reset();
    await enterApp();
    toast(authMode === 'register' ? 'Chào mừng con cá mới! Góp que củi đầu tiên đi nào 🔥' : 'Đồng chí đã vào căn cứ ✊');
  } catch (e) {
    err.textContent = e.message;
    err.hidden = false;
  } finally {
    btn.disabled = false;
  }
}

// ---------- app ----------
async function enterApp() {
  await refresh();
  if (!state) return;
  document.body.dataset.view = 'app';
  startChat();
  clearInterval(stateTimer);
  stateTimer = setInterval(() => { if (!document.hidden) refresh(); }, 30000);
  clearInterval(tickTimer);
  tickTimer = setInterval(tick, 1000);
}

function leave(message) {
  token = '';
  localStorage.removeItem(TOKEN_KEY);
  state = null;
  clearInterval(stateTimer);
  clearInterval(tickTimer);
  stopChat();
  showGate();
  if (message) toast(message);
}

async function refresh() {
  if (!token) return;
  try {
    apply(await api('state'));
  } catch (e) {
    if (e.status !== 401) toast(e.message);
  }
}

function apply(next) {
  state = next;
  clockOffset = next.serverTime - Date.now();
  render();
}

function tick() {
  if (!state) return;
  if (vnDayKey() !== state.today) {
    refresh();
    return;
  }
  const cd = $('fire-countdown');
  if (cd) cd.textContent = untilMidnight();
}

function render() {
  renderChip();
  renderFire();
  renderQuote();
  renderMission();
  renderMe();
  renderWall();
  renderBoard();
}

function renderChip() {
  $('me-chip').replaceChildren(el('span', '', state.me.avatar), el('span', '', state.me.name));
}

function renderFire() {
  const f = state.fire;
  const panel = $('fire-panel');
  let mode;
  if (f.litToday) mode = 'is-lit';
  else if (f.weekend) mode = 'is-rest';
  else if (f.current > 0) mode = 'is-weak';
  else mode = 'is-dead';
  panel.classList.remove('is-lit', 'is-rest', 'is-weak', 'is-dead');
  panel.classList.add(mode);

  $('fire-days').textContent = f.current;
  $('fire-kicker').textContent = {
    'is-lit': 'Lửa của hội đang cháy',
    'is-rest': 'Cuối tuần · lửa đang ủ than',
    'is-weak': 'Lửa đang leo lét',
    'is-dead': f.deaths ? 'Lửa đã tắt' : 'Lửa chưa được nhóm',
  }[mode];

  const missing = Math.max(0, f.need - f.fuel);
  const status = $('fire-status');
  status.replaceChildren();
  if (mode === 'is-lit') {
    status.textContent = 'Đủ củi hôm nay. Chuỗi của hội được nối dài! 🔥';
  } else if (mode === 'is-rest') {
    status.textContent = 'Cuối tuần lửa được ủ, không cần củi. Ai góp vẫn được cộng thêm ngày.';
  } else {
    const countdown = el('b', '', untilMidnight());
    countdown.id = 'fire-countdown';
    if (mode === 'is-weak') {
      status.append(`Cần thêm ${missing} que củi trong `, countdown, ', không là lửa tắt, cả hội về 0!');
    } else {
      const lead = f.deaths
        ? `Lửa đã tắt${f.lastDeath ? ` vào ${dayLabel(f.lastDeath)}` : ''}, cả hội về 0. Cần thêm`
        : 'Lửa chưa từng được nhóm. Cần thêm';
      status.append(`${lead} ${missing} que củi trong `, countdown, f.deaths ? ' để thắp lại từ đầu.' : ' để nhóm ngày đầu tiên.');
    }
  }

  $('fuel-fill').style.width = `${Math.min(100, (f.fuel / Math.max(1, f.need)) * 100)}%`;
  const fuelText = $('fuel-text');
  fuelText.replaceChildren(el('b', '', `${f.fuel}/${f.need}`), ` que củi hôm nay · ${state.members.length} con cá trong hội`);
  $('fuelers').replaceChildren(...f.fuelers.map((p) => {
    const chip = el('span');
    chip.append(emoji(p.avatar), p.name);
    return chip;
  }));
  $('fire-meta').textContent = `Kỷ lục: ${f.best} ngày · Đã tắt ${f.deaths} lần · Luật: mỗi ngày làm việc cần ≥ ${f.need} con cá góp củi. Thiếu một ngày là lửa tắt, chuỗi về 0.`;
}

function renderQuote() {
  $('quote-no').textContent = `Lời hiệu triệu hôm nay · số ${state.quote.no}`;
  $('quote-text').textContent = state.quote.text;
}

function renderMission() {
  $('mission-date').textContent = dayLabel(state.today);
  $('mission-title').textContent = state.mission.title;
  $('mission-hint').textContent = state.mission.hint;
  const done = state.me.answer;
  $('answer-form').hidden = Boolean(done);
  const box = $('answered');
  box.hidden = !done;
  if (done) {
    box.replaceChildren(
      el('b', '', '🔥 Đã góp củi hôm nay'),
      el('p', '', done.text),
      el('small', 'muted', done.anon ? 'Khai ẩn danh: hội chỉ thấy “Cá giấu tên”.' : 'Cả hội đều đọc được và thả cảm xúc.'),
    );
  }
}

function renderMe() {
  const me = state.me;
  $('me-streak').textContent = me.streak;
  const done = new Set(me.week);
  const base = Date.parse(`${state.today}T00:00:00Z`);
  $('week').replaceChildren(...Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base + (i - 6) * 86400000);
    const key = d.toISOString().slice(0, 10);
    const cell = el('div', [done.has(key) && 'done', i === 6 && 'today'].filter(Boolean).join(' '));
    cell.title = `${dayLabel(key)}: ${done.has(key) ? 'đã góp củi' : 'chưa góp củi'}`;
    cell.append(el('span', '', done.has(key) ? '🔥' : ''), WEEKDAYS[d.getUTCDay()]);
    return cell;
  }));
  $('me-caption').textContent = me.answer
    ? 'Hôm nay đã góp củi. Mai nhớ quay lại.'
    : 'Chưa góp củi hôm nay. Cuối tuần không tính đứt chuỗi.';
  $('me-best').textContent = `Kỷ lục cá nhân: ${me.best} ngày`;
}

function renderWall() {
  const list = state.answers;
  $('wall-count').textContent = `${list.length} lời khai`;
  const wall = $('wall');
  if (!list.length) {
    wall.replaceChildren(el('p', 'empty', 'Chưa ai khai gì hôm nay. Bạn mở hàng đi, góp que củi đầu tiên!'));
    return;
  }
  wall.replaceChildren(...list.map((a) => {
    const item = el('article', 'entry');
    const who = el('div', 'entry-who');
    const name = a.author ? a.author.name : 'Cá giấu tên';
    who.append(emoji(a.author ? a.author.avatar : '🐟'), a.own ? `${name} (bạn)` : name, el('time', '', vnTime(a.at)));
    const reacts = el('div', 'reactions');
    for (const [e, label] of REACTIONS) {
      const count = a.reactions[e] || 0;
      const b = el('button');
      b.type = 'button';
      b.dataset.id = a.id;
      b.dataset.emoji = e;
      b.title = label;
      b.setAttribute('aria-label', `${label}: ${count}`);
      b.setAttribute('aria-pressed', String(a.mine === e));
      b.append(emoji(e));
      if (count) b.append(String(count));
      reacts.append(b);
    }
    item.append(who, el('p', '', a.text), reacts);
    return item;
  }));
}

function renderBoard() {
  const members = [...state.members].sort((a, b) => b.streak - a.streak || b.best - a.best || a.name.localeCompare(b.name, 'vi'));
  $('board').replaceChildren(...members.map((m, i) => {
    const li = el('li');
    const who = el('div', 'who');
    who.append(
      el('strong', '', m.username === state.me.username ? `${m.name} (bạn)` : m.name),
      el('small', '', m.fueledToday ? 'Đã góp củi hôm nay 🔥' : `Chưa góp củi · kỷ lục ${m.best}`),
    );
    li.append(el('span', 'rank', String(i + 1)), el('span', 'ava', m.avatar), who, el('span', m.streak ? 'days' : 'days cold', `${m.streak} ngày`));
    return li;
  }));
}

async function submitAnswer(event) {
  event.preventDefault();
  const input = $('answer');
  const err = $('answer-error');
  const text = input.value.trim();
  err.hidden = true;
  if (text.length < 2) {
    err.textContent = 'Viết ít nhất 2 ký tự nhé.';
    err.hidden = false;
    return;
  }
  const btn = $('answer-submit');
  btn.disabled = true;
  const wasLit = state.fire.litToday;
  try {
    apply(await api('answer', { date: state.today, text, anon: $('anon').checked }));
    input.value = '';
    $('answer-count').textContent = '0 / 180';
    if (!wasLit && state.fire.litToday) {
      toast(state.fire.current === 1 ? '🔥 Lửa hội đã được thắp lại! Ngày 1 bắt đầu.' : `🔥 Đủ củi! Lửa hội cháy ngày thứ ${state.fire.current}.`);
    } else {
      toast('Đã góp củi. Cảm ơn đồng chí ✊');
    }
  } catch (e) {
    err.textContent = e.message;
    err.hidden = false;
    if (e.status === 409) refresh();
  } finally {
    btn.disabled = false;
  }
}

async function react(event) {
  const b = event.target.closest('button[data-emoji]');
  if (!b) return;
  b.disabled = true;
  try {
    apply(await api('react', { id: b.dataset.id, emoji: b.dataset.emoji }));
  } catch (e) {
    toast(e.message);
    b.disabled = false;
  }
}

// ---------- chat ----------
function stopChat() {
  clearTimeout(chat.timer);
  chat.gen++;
  chat.busy = false;
  chat.started = false;
  chat.ids.clear();
  chat.last = null;
  chat.lastId = '';
  chat.unread = 0;
  $('chat-log').replaceChildren();
  updateBadge();
}

function startChat() {
  if (chat.started) return;
  chat.started = true;
  $('chat-log').replaceChildren(el('p', 'chat-empty', 'Đang mở phòng họp kín…'));
  pollChat(true);
}

function scheduleChat() {
  clearTimeout(chat.timer);
  if (!chat.started) return;
  chat.timer = setTimeout(() => pollChat(false), document.hidden ? CHAT_SLOW : CHAT_FAST);
}

async function pollChat(first) {
  if (chat.busy || !chat.started) return;
  chat.busy = true;
  const gen = chat.gen;
  try {
    const { messages } = await api('chat', undefined, chat.lastId ? `?after=${encodeURIComponent(chat.lastId)}` : '');
    if (gen !== chat.gen) return;
    if (first) $('chat-log').replaceChildren();
    addMessages(messages, !first);
    if (first && !messages.length) {
      $('chat-log').replaceChildren(el('p', 'chat-empty', 'Phòng họp kín đang im ắng. Mở lời đi, không ai ghi biên bản đâu.'));
    }
  } catch {
    // transient: try again on the next tick
  } finally {
    if (gen === chat.gen) {
      chat.busy = false;
      scheduleChat();
    }
  }
}

function chatIsVisible() {
  return !window.matchMedia('(max-width: 1080px)').matches || $('chat').classList.contains('open');
}

function addMessages(messages, countUnread) {
  const log = $('chat-log');
  const nearBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 120;
  let mineAdded = false;
  for (const m of messages) {
    if (chat.ids.has(m.id)) continue;
    chat.ids.add(m.id);
    if (m.id > chat.lastId) chat.lastId = m.id;
    log.querySelector('.chat-empty')?.remove();
    const mine = m.user === state?.me.username;
    mineAdded ||= mine;
    const day = vnDayKey(m.at);
    if (!chat.last || vnDayKey(chat.last.at) !== day) {
      log.append(el('p', 'chat-day', day === state?.today ? 'Hôm nay' : dayLabel(day)));
    }
    const cont = chat.last && chat.last.user === m.user && vnDayKey(chat.last.at) === day && m.at - chat.last.at < 5 * 60000;
    const row = el('div', `msg${mine ? ' mine' : ''}${cont ? ' cont' : ''}`);
    const body = el('div');
    const meta = el('div', 'meta');
    meta.append(el('b', '', m.name), vnTime(m.at));
    body.append(meta, el('span', 'bubble', m.text));
    row.append(el('span', 'ava', m.avatar), body);
    log.append(row);
    chat.last = m;
    if (countUnread && !mine && !chatIsVisible()) chat.unread++;
  }
  if (nearBottom || mineAdded) log.scrollTop = log.scrollHeight;
  updateBadge();
}

function updateBadge() {
  const badge = $('chat-badge');
  badge.hidden = chat.unread === 0;
  badge.textContent = chat.unread > 99 ? '99+' : String(chat.unread);
}

async function sendChat(event) {
  event.preventDefault();
  const input = $('chat-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  try {
    const { message } = await api('chat', { text });
    addMessages([message], false);
  } catch (e) {
    input.value = text;
    toast(e.message);
  }
}

function toggleChat(open) {
  $('chat').classList.toggle('open', open);
  if (open) {
    chat.unread = 0;
    updateBadge();
    const log = $('chat-log');
    log.scrollTop = log.scrollHeight;
    $('chat-input').focus();
  }
}

// ---------- profile ----------
let profileAvatar;
function openProfile() {
  const form = $('profile-form');
  form.name.value = state.me.name;
  profileAvatar = state.me.avatar;
  avatarPicker($('profile-avatars'), profileAvatar, (a) => { profileAvatar = a; });
  $('profile-dialog').showModal();
}
async function closeProfile() {
  if ($('profile-dialog').returnValue !== 'save') return;
  try {
    apply(await api('profile', { name: $('profile-form').name.value, avatar: profileAvatar }));
    toast('Đã cập nhật hồ sơ đồng chí.');
  } catch (e) {
    toast(e.message);
  }
}

// ---------- boot ----------
const ticker = $('ticker');
for (let i = 0; i < 2; i++) for (const s of SLOGANS) ticker.append(el('span', '', s));

document.querySelectorAll('.tabs [data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
avatarPicker($('avatar-grid'), chosenAvatar, (a) => { chosenAvatar = a; });
$('auth-form').addEventListener('submit', submitAuth);
$('answer-form').addEventListener('submit', submitAnswer);
$('answer').addEventListener('input', (e) => { $('answer-count').textContent = `${e.target.value.length} / 180`; });
$('wall').addEventListener('click', react);
$('chat-form').addEventListener('submit', sendChat);
$('chat-fab').addEventListener('click', () => toggleChat(true));
$('chat-close').addEventListener('click', () => toggleChat(false));
$('me-chip').addEventListener('click', openProfile);
$('profile-dialog').addEventListener('close', closeProfile);
$('logout').addEventListener('click', () => leave('Đã rời căn cứ. Mai nhớ quay lại góp củi!'));
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !state) return;
  refresh();
  pollChat(false);
});
window.addEventListener('storage', (e) => {
  if (e.key !== TOKEN_KEY) return;
  if (!e.newValue) leave();
  else if (e.newValue !== token) {
    token = e.newValue;
    stopChat();
    enterApp();
  }
});

if (token) {
  enterApp().then(() => { if (!state) showGate(); });
} else {
  showGate();
}
