// Lửa nền: một canvas phía sau nội dung (tường lửa + tàn lửa bay) và một canvas phía trước cho tia lửa.
// Cường độ 0..1 theo trạng thái lửa hội; burst() khi có người góp củi.

const LEVELS = { 'is-dead': 0.08, 'is-rest': 0.3, 'is-weak': 0.5, 'is-lit': 1, gate: 0.4 };
const BG_SCALE = 0.5; // the background is soft anyway: render it at half resolution
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

function sprite(w, h, stops, dome) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  if (dome) {
    // Half-ellipse standing on the bottom edge: one flame tongue.
    x.translate(w / 2, h);
    x.scale(1, h / (w / 2));
  } else {
    x.translate(w / 2, h / 2);
  }
  const r = w / 2;
  const g = x.createRadialGradient(0, 0, 0, 0, 0, r);
  for (const [o, col] of stops) g.addColorStop(o, col);
  x.fillStyle = g;
  x.beginPath();
  x.arc(0, 0, r, dome ? Math.PI : 0, Math.PI * 2);
  x.fill();
  return c;
}

const TONGUE = sprite(64, 160, [[0, 'rgba(255,244,196,1)'], [0.22, 'rgba(255,176,46,.95)'], [0.5, 'rgba(255,122,24,.75)'], [0.78, 'rgba(226,52,29,.35)'], [1, 'rgba(226,52,29,0)']], true);
const EMBER = sprite(32, 32, [[0, 'rgba(255,240,200,1)'], [0.25, 'rgba(255,170,60,.9)'], [0.6, 'rgba(255,90,20,.25)'], [1, 'rgba(255,90,20,0)']], false);

export function createAmbient(bgCanvas, fgCanvas) {
  const bg = bgCanvas.getContext('2d');
  const fg = fgCanvas.getContext('2d');
  let W = 0;
  let H = 0;
  let FW = 0;
  let FH = 0;
  let dpr = 1;
  let target = LEVELS.gate;
  let level = target;
  let boost = 0;
  let embers = [];
  let sparks = [];
  let emberDebt = 0;
  let sparkDebt = 0;
  let source = () => null;
  let last = performance.now();
  let running = false;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = bgCanvas.width = Math.ceil(innerWidth * BG_SCALE);
    H = bgCanvas.height = Math.ceil(innerHeight * BG_SCALE);
    FW = fgCanvas.width = Math.ceil(innerWidth * dpr);
    FH = fgCanvas.height = Math.ceil(innerHeight * dpr);
    if (reduced.matches) drawBackground(performance.now() / 1000, 0);
  }

  // One row of flame tongues along a baseline (local y = 0, flames grow toward -y).
  function wall(t, length, depth, alpha, seed) {
    const n = Math.max(6, Math.ceil(length / 60));
    const step = length / n;
    for (let k = 0; k < n; k++) {
      const p = k * 1.73 + seed;
      const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.4 + p)) * (0.75 + 0.25 * Math.sin(t * 3.3 + p * 2.1));
      const h = depth * pulse;
      const w = step * 2.6 * (0.8 + 0.2 * Math.sin(t * 0.9 + p));
      const x = (k + 0.5) * step + Math.sin(t * 0.6 + p) * step * 0.3;
      bg.globalAlpha = alpha * (0.7 + 0.3 * Math.sin(t * 2.2 + p * 1.3));
      bg.drawImage(TONGUE, x - w / 2, -h, w, h * 1.04);
    }
  }

  function drawBackground(t, I) {
    bg.globalCompositeOperation = 'source-over';
    bg.globalAlpha = 1;
    bg.clearRect(0, 0, W, H);

    // Warm glow rising from the bottom.
    const glow = bg.createLinearGradient(0, H, 0, H * (0.25 - 0.2 * Math.min(I, 1)));
    glow.addColorStop(0, `rgba(255,96,20,${0.08 + 0.32 * Math.min(I, 1.2)})`);
    glow.addColorStop(1, 'rgba(255,96,20,0)');
    bg.fillStyle = glow;
    bg.fillRect(0, 0, W, H);

    bg.globalCompositeOperation = 'lighter';
    // Bottom wall of fire.
    bg.save();
    bg.translate(0, H);
    wall(t, W, H * (0.04 + 0.34 * I), 0.3 + 0.5 * Math.min(I, 1), 0);
    bg.restore();
    // Side walls once the fire is strong.
    const side = Math.max(0, (I - 0.45) / 0.55);
    if (side > 0) {
      bg.save();
      bg.rotate(Math.PI / 2); // left edge, flames pointing right
      wall(t * 0.9, H, W * 0.16 * side, 0.45 * side, 11);
      bg.restore();
      bg.save();
      bg.translate(W, H);
      bg.rotate(-Math.PI / 2); // right edge, flames pointing left
      wall(t * 1.1, H, W * 0.16 * side, 0.45 * side, 23);
      bg.restore();
    }

    // Embers.
    for (const e of embers) {
      const fade = 1 - e.life / e.max;
      bg.globalAlpha = Math.max(0, fade * (0.55 + 0.45 * Math.sin(e.phase + t * e.tw)));
      const s = e.size * 4;
      bg.drawImage(EMBER, e.x - s / 2, e.y - s / 2, s, s);
    }
    bg.globalAlpha = 1;
    bg.globalCompositeOperation = 'source-over';
  }

  function spawnEmber(I, fromSides) {
    const side = fromSides && Math.random() < 0.5;
    embers.push({
      x: side ? (Math.random() < 0.5 ? Math.random() * W * 0.08 : W - Math.random() * W * 0.08) : Math.random() * W,
      y: H + 4 - (side ? Math.random() * H * 0.6 : 0),
      vx: (Math.random() - 0.5) * 10,
      vy: -(12 + Math.random() * 30) * (0.55 + I),
      sway: 6 + Math.random() * 14,
      phase: Math.random() * 6.28,
      tw: 2 + Math.random() * 5,
      life: 0,
      max: 4 + Math.random() * 6,
      size: 1.2 + Math.random() * 2.4,
    });
  }

  function sourcePoint() {
    const r = source();
    if (r && r.width && r.bottom > 0 && r.top < innerHeight) {
      return { x: (r.left + r.width / 2) * dpr, y: (r.top + r.height * 0.3) * dpr, w: r.width * dpr };
    }
    return null;
  }

  function spawnSpark(p, burst) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * (burst ? 2.2 : 0.7);
    const speed = (burst ? 220 + Math.random() * 520 : 70 + Math.random() * 120) * dpr;
    sparks.push({
      x: p.x + (Math.random() - 0.5) * p.w * 0.45,
      y: p.y + (Math.random() - 0.5) * 10 * dpr,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      g: (burst ? 420 : -20) * dpr,
      life: 0,
      max: burst ? 1 + Math.random() * 1.4 : 0.8 + Math.random() * 1.2,
      size: (burst ? 1.4 + Math.random() * 2 : 1 + Math.random() * 1.4) * dpr,
      hue: 28 + Math.random() * 22,
    });
  }

  function drawSparks() {
    fg.clearRect(0, 0, FW, FH);
    if (!sparks.length) return;
    fg.globalCompositeOperation = 'lighter';
    fg.lineCap = 'round';
    for (const s of sparks) {
      const fade = Math.max(0, 1 - s.life / s.max);
      fg.strokeStyle = `hsla(${s.hue}, 100%, ${60 + 25 * fade}%, ${fade})`;
      fg.lineWidth = s.size;
      fg.beginPath();
      fg.moveTo(s.x, s.y);
      fg.lineTo(s.x - s.vx * 0.035, s.y - s.vy * 0.035);
      fg.stroke();
    }
    fg.globalCompositeOperation = 'source-over';
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    level += (target - level) * Math.min(1, dt * 1.2);
    boost = Math.max(0, boost - dt * 0.45);
    const I = Math.min(1.35, level + boost);

    // Background embers.
    emberDebt += dt * (6 + 70 * I) * (W / 700);
    while (emberDebt > 1) {
      spawnEmber(I, I > 0.6);
      emberDebt--;
    }
    embers = embers.filter((e) => {
      e.life += dt;
      e.x += (e.vx + Math.sin(e.phase + e.life * 1.3) * e.sway) * dt;
      e.y += e.vy * dt;
      return e.life < e.max && e.y > -10;
    });
    drawBackground(t, I);

    // Foreground sparks from the club's flame.
    const p = sourcePoint();
    if (p && I > 0.3) {
      sparkDebt += dt * (3 + 16 * I);
      while (sparkDebt > 1) {
        spawnSpark(p, false);
        sparkDebt--;
      }
    }
    sparks = sparks.filter((s) => {
      s.life += dt;
      s.vy += s.g * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vx *= 0.99;
      return s.life < s.max && s.y < FH + 20;
    });
    drawSparks();
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduced.matches || document.hidden) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  resize();
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false;
    else start();
  });
  start();

  return {
    setLevel(name) {
      target = LEVELS[name] ?? LEVELS.gate;
      if (reduced.matches) drawBackground(0, target);
    },
    // A small flare-up, e.g. when a log pops.
    kick(amount = 0.1) {
      if (!reduced.matches) boost = Math.min(0.9, boost + amount);
    },
    setSource(fn) {
      source = fn;
    },
    // Someone added a log: flare up and throw sparks everywhere.
    burst(strength = 1) {
      if (reduced.matches) return;
      boost = Math.min(0.9, boost + 0.5 + 0.2 * strength);
      const p = sourcePoint() || { x: FW / 2, y: FH * 0.85, w: 200 * dpr };
      const n = Math.min(260, 70 + 50 * strength);
      for (let i = 0; i < n; i++) spawnSpark(p, true);
      for (let i = 0; i < 40 * strength; i++) spawnEmber(1, true);
    },
  };
}
