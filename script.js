// ── CURSOR (desktop only) ──
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
if (dot && ring) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
  (function animRing() { rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12; ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; requestAnimationFrame(animRing); })();
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.style.transform = 'translate(-50%,-50%) scale(0)'; ring.style.width = '56px'; ring.style.height = '56px'; ring.style.borderColor = 'var(--gold)'; });
    el.addEventListener('mouseleave', () => { dot.style.transform = 'translate(-50%,-50%) scale(1)'; ring.style.width = '36px'; ring.style.height = '36px'; });
  });
}

// ── MOBILE HAMBURGER MENU ──
const hamburger = document.getElementById('nav-hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── HERO CANVAS: Floating particle constellation ──
(function () {
  const c = document.getElementById('hero-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, pts = [];
  function resize() { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; init(); }
  function init() {
    pts = [];
    for (let i = 0; i < 80; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3, r: Math.random() * 1.5 + 0.5 });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
    });
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath(); ctx.strokeStyle = `rgba(212,168,67,${0.12 * (1 - d / 120)})`; ctx.lineWidth = 0.5;
          ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      ctx.beginPath(); ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(212,168,67,0.5)'; ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize); resize(); draw();
})();

// ── CONSCIA CANVAS: Neural network with flowing data tokens ──
(function () {
  const c = document.getElementById('conscia-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, t = 0;

  // Flowing tokens along edges
  const tokenFlows = [];

  function resize() {
    W = c.width = c.offsetWidth;
    H = c.height = c.offsetHeight;
    tokenFlows.length = 0;
    for (let i = 0; i < 8; i++) tokenFlows.push({ progress: Math.random(), layer: Math.floor(Math.random() * 3), fromNode: Math.floor(Math.random() * 5), toNode: Math.floor(Math.random() * 5), speed: 0.004 + Math.random() * 0.004, color: i % 3 === 0 ? '44,184,160' : '212,168,67' });
  }

  function getNodes() {
    const layers = [[0.12, 3], [0.37, 5], [0.63, 5], [0.88, 3]];
    return layers.map(([xr, n]) => Array.from({ length: n }, (_, i) => ({ x: xr * W, y: H * (0.15 + 0.7 * (n === 1 ? 0.5 : i / (n - 1))) })));
  }

  function draw() {
    t += 0.008;
    ctx.fillStyle = 'rgba(14,12,8,0.06)';
    ctx.fillRect(0, 0, W, H);

    const nodes = getNodes();

    // Draw connections
    for (let l = 0; l < nodes.length - 1; l++) {
      nodes[l].forEach(a => {
        nodes[l + 1].forEach(b => {
          const pulse = (Math.sin(t * 2 + a.x * 0.01 + b.y * 0.01) + 1) / 2;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(212,168,67,${0.04 + pulse * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        });
      });
    }

    // Animate flowing tokens along connections
    tokenFlows.forEach(tf => {
      tf.progress += tf.speed;
      if (tf.progress > 1) {
        tf.progress = 0;
        tf.layer = Math.floor(Math.random() * 3);
        const maxFrom = nodes[tf.layer].length;
        const maxTo = nodes[tf.layer + 1].length;
        tf.fromNode = Math.floor(Math.random() * maxFrom);
        tf.toNode = Math.floor(Math.random() * maxTo);
      }
      if (tf.layer >= nodes.length - 1) return;
      const fromN = nodes[tf.layer][tf.fromNode % nodes[tf.layer].length];
      const toN = nodes[tf.layer + 1][tf.toNode % nodes[tf.layer + 1].length];
      if (!fromN || !toN) return;
      const px = fromN.x + (toN.x - fromN.x) * tf.progress;
      const py = fromN.y + (toN.y - fromN.y) * tf.progress;

      // Glowing dot
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${tf.color},0.9)`;
      ctx.fill();
      // Trail
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${tf.color},0.15)`;
      ctx.fill();
    });

    // Draw nodes
    nodes.forEach((layer, li) => {
      layer.forEach((n, ni) => {
        const pulse = (Math.sin(t * 3 + li * 1.5 + ni) + 1) / 2;
        // Outer glow
        ctx.beginPath(); ctx.arc(n.x, n.y, 10 + pulse * 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,168,67,${0.04 + pulse * 0.06})`; ctx.fill();
        // Node body
        ctx.beginPath(); ctx.arc(n.x, n.y, 5 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,168,67,${0.5 + pulse * 0.4})`; ctx.fill();
        // Ring
        ctx.beginPath(); ctx.arc(n.x, n.y, 8 + pulse * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212,168,67,${0.15 + pulse * 0.1})`; ctx.lineWidth = 1; ctx.stroke();
      });
    });

    // Label layer types
    const labels = ['INPUT', 'HIDDEN', 'HIDDEN', 'OUTPUT'];
    nodes.forEach((layer, li) => {
      ctx.font = '7px DM Mono'; ctx.fillStyle = 'rgba(212,168,67,0.25)';
      ctx.textAlign = 'center';
      ctx.fillText(labels[li], layer[0].x, H - 12);
    });

    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize); resize(); draw();
})();

// ── BLOCKCHAIN CANVAS ──
(function () {
  const c = document.getElementById('blockchain-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, t = 0;
  const blocks = [];
  function resize() { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; initBlocks(); }
  function initBlocks() {
    blocks.length = 0;
    const count = W < 400 ? 4 : 6;
    for (let i = 0; i < count; i++) {
      blocks.push({ x: W * 0.1 + i * (W * 0.8 / (count - 1)), y: H / 2, hash: Math.random().toString(16).substr(2, 6), glow: Math.random() * Math.PI * 2, verified: i < count - 2 });
    }
  }
  function draw() {
    t += 0.012;
    ctx.fillStyle = 'rgba(14,12,8,0.08)';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < blocks.length - 1; i++) {
      const a = blocks[i], b = blocks[i + 1];
      const pulse = (Math.sin(t * 2 + i) + 1) / 2;
      ctx.beginPath(); ctx.strokeStyle = `rgba(212,168,67,${0.15 + pulse * 0.25})`; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]); ctx.moveTo(a.x + 28, a.y); ctx.lineTo(b.x - 28, b.y); ctx.stroke(); ctx.setLineDash([]);
      const px = a.x + 28 + (b.x - 28 - (a.x + 28)) * ((t * 0.4 + i * 0.5) % 1);
      ctx.beginPath(); ctx.arc(px, a.y, 3, 0, Math.PI * 2); ctx.fillStyle = 'rgba(212,168,67,0.9)'; ctx.fill();
    }
    blocks.forEach((bl, i) => {
      bl.glow += 0.04;
      const glow = (Math.sin(bl.glow) + 1) / 2;
      const bw = 56, bh = 40;
      ctx.save(); ctx.shadowBlur = glow * 20; ctx.shadowColor = bl.verified ? 'rgba(212,168,67,0.5)' : 'rgba(232,98,58,0.5)';
      ctx.strokeStyle = bl.verified ? `rgba(212,168,67,${0.4 + glow * 0.4})` : `rgba(232,98,58,${0.4 + glow * 0.4})`;
      ctx.lineWidth = 1; ctx.fillStyle = `rgba(26,21,8,${0.7 + glow * 0.2})`;
      ctx.beginPath(); ctx.rect(bl.x - bw / 2, bl.y - bh / 2, bw, bh); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.font = '7px DM Mono'; ctx.fillStyle = bl.verified ? 'rgba(212,168,67,0.7)' : 'rgba(232,98,58,0.7)';
      ctx.textAlign = 'center'; ctx.fillText('#' + bl.hash, bl.x, bl.y + 3);
      ctx.fillStyle = 'rgba(245,240,232,0.25)'; ctx.font = '6px DM Mono'; ctx.fillText('BLOCK ' + (i + 1), bl.x, bl.y - 8);
    });
    for (let i = 0; i < 4; i++) {
      const nx = W * 0.08 + Math.sin(t * 0.4 + i * 1.5) * W * 0.04;
      const ny = H * 0.15 + i * (H * 0.2) + Math.cos(t * 0.3 + i) * 20;
      ctx.beginPath(); ctx.arc(nx, ny, 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(124,79,224,0.5)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = '6px DM Mono'; ctx.fillStyle = 'rgba(124,79,224,0.5)'; ctx.textAlign = 'center'; ctx.fillText('IPFS', nx, ny + 14);
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize); resize(); draw();
})();

// ── SOCIAL CANVAS: Live upward-trending growth chart ──
(function () {
  const c = document.getElementById('social-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, t = 0;

  // Simulated data series growing upward over time
  const series = [
    { label: 'Followers', color: '44,184,160', base: 8000, growth: 120, variance: 80, history: [], maxPoints: 60 },
    { label: 'Reach', color: '212,168,67', base: 4200, growth: 65, variance: 40, history: [], maxPoints: 60 },
    { label: 'Engagement', color: '232,98,58', base: 1800, growth: 30, variance: 25, history: [], maxPoints: 60 },
  ];

  let frameCount = 0;
  const UPDATE_EVERY = 8; // add data point every N frames

  function resize() {
    W = c.width = c.offsetWidth;
    H = c.height = c.offsetHeight;
    // Reset history
    series.forEach(s => { s.history = []; for (let i = 0; i < s.maxPoints; i++) s.history.push(s.base + s.growth * i + (Math.random() - 0.5) * s.variance * 2); });
  }

  function drawChart(s, chartX, chartY, chartW, chartH) {
    if (s.history.length < 2) return;
    const min = Math.min(...s.history) * 0.97;
    const max = Math.max(...s.history) * 1.03;
    const range = max - min || 1;

    const toScreenX = i => chartX + (i / (s.history.length - 1)) * chartW;
    const toScreenY = v => chartY + chartH - ((v - min) / range) * chartH;

    // Fill gradient
    const grad = ctx.createLinearGradient(0, chartY, 0, chartY + chartH);
    grad.addColorStop(0, `rgba(${s.color},0.18)`);
    grad.addColorStop(1, `rgba(${s.color},0)`);

    ctx.beginPath();
    ctx.moveTo(toScreenX(0), chartY + chartH);
    s.history.forEach((v, i) => ctx.lineTo(toScreenX(i), toScreenY(v)));
    ctx.lineTo(toScreenX(s.history.length - 1), chartY + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    s.history.forEach((v, i) => {
      if (i === 0) ctx.moveTo(toScreenX(i), toScreenY(v));
      else ctx.lineTo(toScreenX(i), toScreenY(v));
    });
    ctx.strokeStyle = `rgba(${s.color},0.9)`;
    ctx.lineWidth = 1.8;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Live dot at end
    const lastX = toScreenX(s.history.length - 1);
    const lastY = toScreenY(s.history[s.history.length - 1]);
    const pulse = (Math.sin(t * 4) + 1) / 2;
    ctx.beginPath(); ctx.arc(lastX, lastY, 4 + pulse * 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.color},${0.3 + pulse * 0.3})`; ctx.fill();
    ctx.beginPath(); ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${s.color},1)`; ctx.fill();
  }

  function draw() {
    t += 0.02;
    frameCount++;

    // Add new data point periodically to simulate live growth
    if (frameCount % UPDATE_EVERY === 0) {
      series.forEach(s => {
        const last = s.history[s.history.length - 1];
        const newVal = last + s.growth / UPDATE_EVERY + (Math.random() - 0.3) * s.variance;
        s.history.push(newVal);
        if (s.history.length > s.maxPoints) s.history.shift();
      });
    }

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(14,12,8,0.92)';
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
      const y = H * 0.08 + (H * 0.62) * (i / gridCount);
      ctx.beginPath(); ctx.moveTo(W * 0.04, y); ctx.lineTo(W * 0.96, y);
      ctx.strokeStyle = 'rgba(212,168,67,0.06)'; ctx.lineWidth = 1; ctx.stroke();
    }

    // Draw each series in its own lane
    const laneH = (H * 0.55) / series.length;
    series.forEach((s, idx) => {
      const cY = H * 0.06 + idx * laneH;
      drawChart(s, W * 0.04, cY + laneH * 0.12, W * 0.92, laneH * 0.76);
    });

    // Legend / Metric cards at bottom
    const cardW = W * 0.88 / series.length;
    series.forEach((s, idx) => {
      const cx = W * 0.06 + idx * (cardW + W * 0.01);
      const cy = H * 0.76;
      const latest = Math.round(s.history[s.history.length - 1]);
      const prev = Math.round(s.history[Math.max(0, s.history.length - 8)]);
      const delta = latest - prev;
      const isUp = delta >= 0;

      ctx.fillStyle = 'rgba(14,12,8,0.85)';
      ctx.strokeStyle = `rgba(${s.color},0.25)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.rect(cx, cy, cardW - 4, H * 0.2); ctx.fill(); ctx.stroke();

      ctx.font = '7px DM Mono'; ctx.fillStyle = `rgba(${s.color},0.7)`; ctx.textAlign = 'left';
      ctx.fillText(s.label.toUpperCase(), cx + 8, cy + 14);

      ctx.font = `bold ${Math.min(13, cardW * 0.14)}px Syne,sans-serif`;
      ctx.fillStyle = 'rgba(245,240,232,0.9)';
      ctx.fillText(latest.toLocaleString(), cx + 8, cy + 30);

      const arrow = isUp ? '▲' : '▼';
      ctx.font = '7px DM Mono';
      ctx.fillStyle = isUp ? 'rgba(44,184,160,0.8)' : 'rgba(232,98,58,0.8)';
      ctx.fillText(`${arrow} ${Math.abs(delta).toLocaleString()}`, cx + 8, cy + 44);
    });

    // "LIVE" badge
    const livePulse = (Math.sin(t * 3) + 1) / 2;
    ctx.beginPath(); ctx.arc(W * 0.9, H * 0.04, 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(232,98,58,${0.6 + livePulse * 0.4})`; ctx.fill();
    ctx.font = '8px DM Mono'; ctx.fillStyle = 'rgba(232,98,58,0.8)'; ctx.textAlign = 'left';
    ctx.fillText('LIVE', W * 0.92, H * 0.04 + 3);

    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize); resize(); draw();
})();

// ── CONFERENCE CANVAS: Scattered data particles ──
(function () {
  const c = document.getElementById('conf-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, t = 0, pts = [];
  function resize() {
    W = c.width = c.offsetWidth; H = c.height = c.offsetHeight;
    pts = []; for (let i = 0; i < 40; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, v: Math.random() * 0.2 + 0.05 });
  }
  function draw() {
    t += 0.01; ctx.fillStyle = 'rgba(14,12,8,0.04)'; ctx.fillRect(0, 0, W, H);
    pts.forEach(p => {
      p.y -= p.v; if (p.y < 0) { p.y = H; p.x = Math.random() * W; }
      const a = 0.1 + Math.sin(t + p.x * 0.01) * 0.05;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1, 0, Math.PI * 2); ctx.fillStyle = `rgba(212,168,67,${a})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize); resize(); draw();
})();

// ── CONTACT CANVAS: Pulsing grid ──
(function () {
  const c = document.getElementById('contact-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, t = 0;
  function resize() { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; }
  function draw() {
    t += 0.008; ctx.clearRect(0, 0, W, H);
    const spacing = 60;
    for (let x = 0; x < W; x += spacing) {
      for (let y = 0; y < H; y += spacing) {
        const d = Math.sqrt((x - W / 2) ** 2 + (y - H / 2) ** 2);
        const pulse = Math.sin(t * 1.5 - d * 0.02) * 0.5 + 0.5;
        ctx.beginPath(); ctx.arc(x, y, 1 + pulse * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,168,67,${0.04 + pulse * 0.08})`; ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize); resize(); draw();
})();

// ── GALAXY / ABOUT CANVAS ──
(function () {
  const c = document.getElementById('galaxy-canvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, stars = [];
  function resize() {
    W = c.width = c.offsetWidth; H = c.height = c.offsetHeight;
    stars = [];
    for (let i = 0; i < 120; i++) stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5, speed: Math.random() * 0.3 + 0.05 });
  }
  function draw() {
    ctx.fillStyle = "rgba(14,12,8,0.4)"; ctx.fillRect(0, 0, W, H);
    stars.forEach(s => {
      s.y += s.speed; if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(212,168,67,0.8)"; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize); resize(); draw();
})();
