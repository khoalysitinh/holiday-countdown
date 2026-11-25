// Đống lửa của hội, vẽ bằng hạt lửa trên canvas.
// Cấp lửa lớn dần theo số ngày cháy liên tục; cấp 5 hóa mặt trời biết yêu.

export const STAGES = [
  { min: 0, name: 'Tro tàn', icon: '🌫️' },
  { min: 1, name: 'Đốm lửa', icon: '✨' },
  { min: 3, name: 'Lửa trại', icon: '🔥' },
  { min: 7, name: 'Đống lửa lớn', icon: '🔥' },
  { min: 14, name: 'Hỏa diệm sơn', icon: '🌋' },
  { min: 21, name: 'Mặt trời', icon: '☀️' },
];
export const stageOf = (days) => STAGES.reduce((s, st, i) => (days >= st.min ? i : s), 0);

// Flame look per stage: particles/second, base width, upward speed, particle size, seconds between pops.
const FLAME = [
  null,
  { rate: 150, spread: 54, lift: 1.05, size: 34, pop: [1.4, 3.0] },
  { rate: 190, spread: 70, lift: 1.25, size: 36, pop: [1.0, 2.4] },
  { rate: 230, spread: 90, lift: 1.5, size: 38, pop: [0.55, 1.5] },
  { rate: 270, spread: 112, lift: 1.8, size: 40, pop: [0.25, 0.9] },
];
const MOOD = { 'is-lit': 1, 'is-weak': 0.55, 'is-rest': 0.45, 'is-dead': 0 };
const SAYINGS = ['Yêu em ❤', 'Yêu cả hội ❤', 'Tan làm đúng giờ nha ☀️', 'Nắng ấm cho cá ❤', 'Không ai bị trừ KPI hôm nay ❤'];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

// Colour ramp over a flame particle's life: white-hot core -> yellow -> orange -> red -> dark.
const RAMP = [[0, [255, 246, 210]], [0.08, [255, 220, 110]], [0.25, [255, 160, 45]], [0.5, [255, 98, 24]], [0.75, [214, 44, 18]], [1, [100, 18, 8]]];
function rampColor(t) {
  for (let i = 1; i < RAMP.length; i++) {
    if (t <= RAMP[i][0]) {
      const [t0, c0] = RAMP[i - 1];
      const [t1, c1] = RAMP[i];
      const k = (t - t0) / (t1 - t0);
      return c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
    }
  }
  return RAMP[RAMP.length - 1][1];
}
function blob(rgb, alphaMid = 0.45) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `rgba(${rgb},1)`);
  g.addColorStop(0.4, `rgba(${rgb},${alphaMid})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return c;
}
const SPRITES = Array.from({ length: 24 }, (_, i) => blob(rampColor(i / 23).join(','), 0.32));
const SMOKE = blob('70,62,56', 0.35);

export function createCampfire(canvas, { onPop } = {}) {
  const ctx = canvas.getContext('2d');
  const CW = 300;
  const CH = 340;
  let dpr = 1;
  let stage = 0;
  let mood = 0;
  let flames = [];
  let sparks = [];
  let smoke = [];
  let hearts = [];
  let debt = 0;
  let smokeDebt = 0;
  let nextPop = 1;
  let flash = 0;
  let surge = 0;
  let saying = null;
  let nextSaying = 3;
  let heartEyes = 0;
  let nextHeartEyes = 4;
  let running = false;
  let last = performance.now();
  let time = 0;

  const baseX = CW / 2;
  const baseY = CH - 34;
  const sun = { x: CW / 2, y: CH * 0.42 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CW * dpr;
    canvas.height = CH * dpr;
  }

  const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  const rand = (a, b) => a + Math.random() * (b - a);

  function spawnFlame(p, burst = false) {
    const x = baseX + gauss() * p.spread * 0.85;
    flames.push({
      x,
      y: baseY - Math.random() * 6,
      vx: (baseX - x) * 0.3 + gauss() * 14,
      vy: -rand(55, 120) * p.lift * (burst ? 2.2 : 1) * (0.75 + 0.25 * mood),
      life: 0,
      max: rand(0.55, 1.05) * (0.8 + 0.2 * p.lift),
      size: p.size * rand(0.75, 1.2) * (burst ? 1.25 : 1),
      seed: Math.random() * 100,
    });
  }

  function spawnCorona(burstAngle) {
    const a = burstAngle ?? Math.random() * Math.PI * 2;
    const r = 58;
    const speed = burstAngle == null ? rand(25, 70) : rand(90, 200);
    flames.push({
      x: sun.x + Math.cos(a) * r,
      y: sun.y + Math.sin(a) * r,
      vx: Math.cos(a) * speed + rand(-10, 10),
      vy: Math.sin(a) * speed - 12,
      life: 0,
      max: rand(0.5, 1.0),
      size: rand(20, 32),
      seed: Math.random() * 100,
      corona: true,
    });
  }

  function spark(x, y, power = 1) {
    const a = -Math.PI / 2 + gauss() * 0.9;
    const s = rand(140, 380) * power;
    sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0, max: rand(0.5, 1.1), w: rand(1, 2.2) });
  }

  // "Đùng!" — a log pops: a jet of flame, sparks and a flash.
  function pop(strength = 1) {
    if (stage === 5) {
      const a = Math.random() * Math.PI * 2;
      for (let i = 0; i < 26 * strength; i++) spawnCorona(a + gauss() * 0.35);
      flash = Math.min(0.8, flash + 0.3 * strength);
    } else {
      const p = FLAME[Math.max(1, stage)];
      const px = baseX + gauss() * p.spread * 0.5;
      for (let i = 0; i < (18 + 10 * stage) * strength; i++) {
        spawnFlame({ ...p, spread: p.spread * 0.35 }, true);
        flames[flames.length - 1].x = px + gauss() * 10;
      }
      for (let i = 0; i < (6 + 4 * stage) * strength; i++) spark(px, baseY - 20, 1 + 0.1 * stage);
      flash = Math.min(0.8, flash + 0.25 * strength);
    }
    surge = Math.min(1, surge + 0.35 * strength);
    onPop?.(strength);
  }

  function update(dt) {
    time += dt;
    flash = Math.max(0, flash - dt * 1.6);
    surge = Math.max(0, surge - dt * 0.8);
    const active = mood > 0 && stage > 0;

    if (active && stage < 5) {
      const p = FLAME[stage];
      debt += dt * p.rate * mood * (1 + surge);
      while (debt > 1) { spawnFlame(p); debt--; }
    } else if (active && stage === 5) {
      debt += dt * 260 * (0.6 + 0.4 * mood) * (1 + surge);
      while (debt > 1) { spawnCorona(); debt--; }
    }

    // Smoke: thin when burning well, heavier when the fire is dying or dead.
    smokeDebt += dt * (stage === 5 ? 0 : active ? 5 : 9);
    while (smokeDebt > 1) {
      const top = active ? baseY - 90 - stage * 26 : baseY - 16;
      smoke.push({ x: baseX + gauss() * 20, y: top, vx: rand(-6, 6), vy: -rand(14, 30), life: 0, max: rand(2.5, 4.5), size: rand(26, 44) });
      smokeDebt--;
    }

    if (active) {
      nextPop -= dt;
      if (nextPop <= 0) {
        const [a, b] = stage === 5 ? [1.2, 2.6] : FLAME[stage].pop;
        nextPop = rand(a, b) / Math.max(0.35, mood);
        pop(mood);
      }
    }

    for (const f of flames) {
      f.life += dt;
      if (f.corona) {
        f.vx *= 0.97;
        f.vy = f.vy * 0.97 - 10 * dt;
      } else {
        f.vy -= 45 * dt;
        f.vx += Math.sin(time * 7 + f.seed + f.y * 0.05) * 60 * dt;
        f.vx += (baseX - f.x) * 0.55 * dt; // pull tongues gently back to the middle: pointed tips
      }
      f.x += f.vx * dt;
      f.y += f.vy * dt;
    }
    flames = flames.filter((f) => f.life < f.max);
    for (const s of sparks) {
      s.life += dt;
      s.vy += 320 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
    }
    sparks = sparks.filter((s) => s.life < s.max);
    for (const s of smoke) {
      s.life += dt;
      s.x += (s.vx + Math.sin(time + s.size) * 8) * dt;
      s.y += s.vy * dt;
      s.size += 14 * dt;
    }
    smoke = smoke.filter((s) => s.life < s.max);

    if (stage === 5 && active) {
      if (Math.random() < dt * 1.6) {
        const a = rand(-Math.PI * 0.95, -Math.PI * 0.05);
        hearts.push({ x: sun.x + Math.cos(a) * 70, y: sun.y + Math.sin(a) * 70, vx: rand(-15, 15), vy: -rand(25, 50), life: 0, max: rand(1.8, 3), size: rand(7, 13), seed: Math.random() * 6 });
      }
      nextSaying -= dt;
      if (nextSaying <= 0) {
        saying = { text: SAYINGS[Math.floor(Math.random() * SAYINGS.length)], life: 0, max: 2.6 };
        nextSaying = rand(5, 9);
      }
      nextHeartEyes -= dt;
      if (nextHeartEyes <= 0) {
        heartEyes = 1.6;
        nextHeartEyes = rand(5, 9);
      }
      heartEyes = Math.max(0, heartEyes - dt);
    }
    for (const h of hearts) {
      h.life += dt;
      h.x += (h.vx + Math.sin(time * 3 + h.seed) * 12) * dt;
      h.y += h.vy * dt;
    }
    hearts = hearts.filter((h) => h.life < h.max);
    if (saying) {
      saying.life += dt;
      if (saying.life > saying.max) saying = null;
    }
  }

  function heartPath(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s * 1.1, y - s * 0.45, x - s * 0.45, y - s * 1.15, x, y - s * 0.45);
    ctx.bezierCurveTo(x + s * 0.45, y - s * 1.15, x + s * 1.1, y - s * 0.45, x, y + s * 0.35);
    ctx.closePath();
  }

  function drawSun() {
    const R = 58 + Math.sin(time * 2) * 2.5 + surge * 6;
    const { x, y } = sun;
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(x, y, R * 0.5, x, y, Math.min(145, R * 2.5));
    glow.addColorStop(0, `rgba(255,170,40,${0.55 + flash * 0.4})`);
    glow.addColorStop(1, 'rgba(255,120,20,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CW, CH);
    // Slowly turning rays.
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * 0.22);
    for (let i = 0; i < 14; i++) {
      ctx.rotate((Math.PI * 2) / 14);
      const len = R * (1.55 + 0.28 * Math.sin(time * 3 + i * 1.7) + (i % 2 ? 0 : 0.25));
      const g = ctx.createLinearGradient(0, R * 0.8, 0, len);
      g.addColorStop(0, 'rgba(255,226,110,.9)');
      g.addColorStop(1, 'rgba(255,140,30,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-R * 0.14, R * 0.85);
      ctx.lineTo(0, len);
      ctx.lineTo(R * 0.14, R * 0.85);
      ctx.fill();
    }
    ctx.restore();
    drawFlames();
    // Core.
    ctx.globalCompositeOperation = 'source-over';
    const core = ctx.createRadialGradient(x - R * 0.3, y - R * 0.3, R * 0.1, x, y, R);
    core.addColorStop(0, '#fffbe6');
    core.addColorStop(0.35, '#ffe36e');
    core.addColorStop(0.78, '#ffb22e');
    core.addColorStop(1, '#ff8a1a');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.fill();
    // Face: happy eyes (or heart eyes), blush, smile.
    ctx.strokeStyle = '#7a2e0a';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      const ex = x + side * R * 0.33;
      const ey = y - R * 0.1;
      if (heartEyes > 0) {
        ctx.fillStyle = '#ff3d5e';
        heartPath(ex, ey + 3, R * 0.15 * (1 + 0.15 * Math.sin(time * 14)));
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(ex, ey + R * 0.06, R * 0.13, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,90,120,.45)';
      ctx.beginPath();
      ctx.ellipse(x + side * R * 0.52, y + R * 0.2, R * 0.16, R * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y + R * 0.1, R * 0.3, Math.PI * 0.18, Math.PI * 0.82);
    ctx.stroke();
    // Floating hearts.
    for (const h of hearts) {
      ctx.globalAlpha = Math.min(1, (1 - h.life / h.max) * 1.4);
      ctx.fillStyle = '#ff4d6d';
      heartPath(h.x, h.y, h.size);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Speech bubble.
    if (saying) {
      const a = Math.min(1, saying.life * 4, (saying.max - saying.life) * 3);
      ctx.globalAlpha = a;
      ctx.font = '800 15px Bricolage, "Be Vietnam", sans-serif';
      const w = ctx.measureText(saying.text).width + 22;
      const bx = Math.min(CW - w - 4, x + R * 0.4);
      const by = y - R - 40 - saying.life * 6;
      ctx.fillStyle = '#fffbe6';
      ctx.beginPath();
      ctx.roundRect(bx, by, w, 28, 14);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(bx + 14, by + 27);
      ctx.lineTo(bx + 8, by + 38);
      ctx.lineTo(bx + 26, by + 27);
      ctx.fill();
      ctx.fillStyle = '#c2261a';
      ctx.fillText(saying.text, bx + 11, by + 19);
      ctx.globalAlpha = 1;
    }
  }

  function drawFlames() {
    ctx.globalCompositeOperation = 'lighter';
    const density = stage === 5 ? 0.75 : Math.min(1, 1.25 / Math.sqrt(FLAME[Math.max(1, stage)].rate / 100));
    for (const f of flames) {
      const t = f.life / f.max;
      const s = f.size * (1 - 0.6 * t);
      ctx.globalAlpha = Math.pow(1 - t, 1.2) * 0.72 * density;
      ctx.drawImage(SPRITES[Math.min(23, Math.floor(t * 24))], f.x - s / 2, f.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, CW, CH);
    const active = mood > 0 && stage > 0;

    // Smoke sits behind the flames.
    ctx.globalCompositeOperation = 'source-over';
    for (const s of smoke) {
      const t = s.life / s.max;
      ctx.globalAlpha = Math.sin(t * Math.PI) * (active ? 0.18 : 0.28);
      ctx.drawImage(SMOKE, s.x - s.size / 2, s.y - s.size / 2, s.size, s.size);
    }
    ctx.globalAlpha = 1;

    if (stage === 5 && active) {
      drawSun();
    } else {
      // Warm glow on the ground.
      ctx.globalCompositeOperation = 'lighter';
      const r = Math.min(140, (active ? 60 + stage * 18 : 46) * 1.5);
      const g = ctx.createRadialGradient(baseX, baseY - 18, 4, baseX, baseY - 18, r);
      g.addColorStop(0, `rgba(255,130,40,${(active ? 0.28 + 0.05 * stage : 0.12 + 0.05 * Math.sin(time * 2)) + flash * 0.5})`);
      g.addColorStop(1, 'rgba(255,90,20,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, CW, CH);
      drawFlames();
      // Glowing coals on the logs.
      for (let i = 0; i < 7; i++) {
        const cx = baseX + (i - 3) * 15 + Math.sin(i * 7) * 4;
        const pulse = 0.5 + 0.5 * Math.sin(time * (1.5 + i * 0.37) + i);
        ctx.globalAlpha = (active ? 0.55 : 0.35) * pulse + 0.15;
        ctx.drawImage(SPRITES[active ? 6 : 13], cx - 10, baseY + 4 - (i % 2) * 6, 20, 14);
      }
      ctx.globalAlpha = 1;
    }

    // Sparks.
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    for (const s of sparks) {
      const t = 1 - s.life / s.max;
      ctx.strokeStyle = `rgba(255,${190 + 50 * t},${90 + 100 * t},${t})`;
      ctx.lineWidth = s.w;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 0.03, s.y - s.vy * 0.03);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    // Hidden (e.g. on the login screen): keep the loop, skip the work.
    if (canvas.offsetWidth) {
      update(dt);
      draw();
    }
    requestAnimationFrame(frame);
  }

  function start() {
    if (running || document.hidden) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(frame);
  }

  // Reduced motion: let the fire burn for a moment, then hold a still frame.
  function still() {
    for (let i = 0; i < 90; i++) update(1 / 60);
    draw();
  }

  resize();
  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) running = false;
    else if (!reduced.matches) start();
  });
  if (reduced.matches) still();
  else start();

  return {
    set(nextStage, mode) {
      const changed = nextStage !== stage;
      stage = nextStage;
      mood = MOOD[mode] ?? 0;
      if (changed) {
        flames = [];
        hearts = [];
        saying = null;
      }
      if (reduced.matches) still();
    },
    pop(strength = 1.5) {
      if (!reduced.matches && mood > 0 && stage > 0) pop(strength);
    },
  };
}
