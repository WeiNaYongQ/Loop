/* ═══════════ js/report.js — draws the shareable PNG card (v0.5) ═══════════ */

// ── Add burst() and chime() so stats page works without fx.js ──
function burst(x, y, extra = []) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer = document.getElementById('confettiLayer');
  if (!layer) return;
  const BITS = ['✦', '✚', '●', '▲', '♥', '★'];
  const COLORS = { sun: '#FFC933', coral: '#FF6157', mint: '#1FBE9C', sky: '#4FA6FF', grape: '#9C7BFF', pink: '#FF8FC0' };
  const pool = [...BITS, ...extra];
  const colors = Object.values(COLORS);
  for (let i = 0; i < 16; i++) {
    const b = document.createElement('span');
    b.className = 'bit';
    b.textContent = pool[Math.floor(Math.random() * pool.length)];
    b.style.left = x + 'px';
    b.style.top = y + 'px';
    b.style.color = colors[Math.floor(Math.random() * colors.length)];
    layer.appendChild(b);
    const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 90;
    const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 40;
    b.animate([
      { transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 80}px)) scale(${.4 + Math.random() * .8}) rotate(${(Math.random() * 2 - 1) * 240}deg)`, opacity: 0 }
    ], { duration: 800 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = () => b.remove();
  }
}

function chime() {
  try {
    const actx = new (window.AudioContext || window.webkitAudioContext)();
    [660, 880, 1175].forEach((f, i) => {
      setTimeout(() => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(.15, actx.currentTime);
        g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + .2);
        o.connect(g);
        g.connect(actx.destination);
        o.start();
        o.stop(actx.currentTime + .22);
      }, i * 110);
    });
  } catch (e) {}
}

// ── Main report module ──
const LoopReport = (() => {
  const W = 1080, H = 1080;
  const INK = '#272130', PAPER = '#FFF9EC', SUN = '#FFC933', CORAL = '#FF6157',
        MINT = '#1FBE9C', SKY = '#4FA6FF', GRAPE = '#9C7BFF', PINK = '#FF8FC0';
  const ACCENTS = [CORAL, SUN, MINT, SKY, GRAPE, PINK];
  const QUOTES = ['tiny wins compound','done beats perfect','zigzag progress is still progress','your brain did good this week','momentum over perfection'];

  function stats() {
    const days = lastNDays(7);
    const habits = activeHabits();
    const counts = days.map(k => habits.filter(h => h.done[k]).length);
    const total = counts.reduce((a, b) => a + b, 0);
    const pct = Math.min(100, Math.round(total / Math.max(1, habits.length * 7) * 100));
    let best = { name: '—', emoji: '✦', streak: 0 };
    habits.forEach(h => { const s = streakOf(h); if (s > best.streak) best = { name: h.name, emoji: h.emoji, streak: s }; });
    let bestDay = '—', max = 0;
    counts.forEach((c, i) => { if (c > max) { max = c; bestDay = new Date(days[i] + 'T00:00').toLocaleDateString(undefined, { weekday: 'long' }); } });
    return { days, counts, total, pct, best, bestDay };
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  async function draw() {
    await Promise.all([
      document.fonts.load('800 72px "Bricolage Grotesque"'),
      document.fonts.load('700 24px "Space Mono"'),
      document.fonts.load('400 30px "Atkinson Hyperlegible"'),
    ]).catch(() => {});

    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    const s = stats();

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(39,33,48,.07)';
    for (let x = 18; x < W; x += 36)
      for (let y = 18; y < H; y += 36) {
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, 7);
        ctx.fill();
      }

    ctx.strokeStyle = INK;
    ctx.lineWidth = 8;
    roundRect(ctx, 36, 36, W - 72, H - 72, 28);
    ctx.stroke();

    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.font = '800 72px "Bricolage Grotesque", sans-serif';
    ctx.fillText('Loop*', 84, 148);
    ctx.font = '700 22px "Space Mono", monospace';
    ctx.fillText('WEEKLY REPORT CARD', 84, 192);
    ctx.textAlign = 'right';
    ctx.font = '700 26px "Space Mono", monospace';
    ctx.fillText(`${s.days[0].slice(5)} → ${s.days[6].slice(5)}`, W - 84, 148);

    ctx.textAlign = 'center';
    ctx.fillStyle = CORAL;
    ctx.font = '800 230px "Bricolage Grotesque", sans-serif';
    ctx.fillText(s.pct + '%', W / 2, 455);
    ctx.fillStyle = INK;
    ctx.font = '400 30px "Atkinson Hyperlegible", sans-serif';
    ctx.fillText('of tiny wins completed this week', W / 2, 512);

    const boxes = [
      { label: 'CHECKS', value: String(s.total), bg: SUN },
      { label: 'BEST STREAK', value: `${s.best.streak} ${s.best.emoji}`, bg: MINT },
      { label: 'BEST DAY', value: s.bestDay, bg: SKY },
    ];
    const bw = 296,
      gap = 18,
      x0 = (W - (bw * 3 + gap * 2)) / 2;
    boxes.forEach((b, i) => {
      const x = x0 + i * (bw + gap),
        y = 566;
      ctx.fillStyle = b.bg;
      roundRect(ctx, x, y, bw, 150, 18);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 5;
      roundRect(ctx, x, y, bw, 150, 18);
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.font = '700 19px "Space Mono", monospace';
      ctx.fillText(b.label, x + bw / 2, y + 44);
      let size = 52;
      ctx.font = `800 ${size}px "Bricolage Grotesque", sans-serif`;
      while (ctx.measureText(b.value).width > bw - 36 && size > 20) {
        size -= 4;
        ctx.font = `800 ${size}px "Bricolage Grotesque", sans-serif`;
      }
      ctx.fillText(b.value, x + bw / 2, y + 110);
    });

    const cw = 64,
      cgap = 32,
      cx0 = (W - (cw * 7 + cgap * 6)) / 2,
      base = 918;
    const top = Math.max(1, ...s.counts);
    s.counts.forEach((n, i) => {
      const hgt = 16 + (n / top) * 112;
      const x = cx0 + i * (cw + cgap);
      ctx.fillStyle = ACCENTS[i % ACCENTS.length];
      roundRect(ctx, x, base - hgt, cw, hgt, 10);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 4;
      roundRect(ctx, x, base - hgt, cw, hgt, 10);
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.font = '700 20px "Space Mono", monospace';
      ctx.fillText(String(n), x + cw / 2, base - hgt - 12);
      ctx.fillText(new Date(s.days[i] + 'T00:00').toLocaleDateString(undefined, { weekday: 'narrow' }), x + cw / 2, base + 34);
    });

    ctx.font = 'italic 400 30px "Atkinson Hyperlegible", sans-serif';
    ctx.fillText('“' + QUOTES[Math.floor(Math.random() * QUOTES.length)] + '”', W / 2, 1008);

    return c;
  }

  function bindDownload(id) {
      const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', async () => {
      btn.textContent = 'painting…';
      const card = await draw();
      const a = document.createElement('a');
      a.href = card.toDataURL('image/png');
      a.download = `loop-report-${dkey()}.png`;
      a.click();
      btn.textContent = '⬇ download as image';
      
      // Trigger confetti and chime
      const r = btn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top, ['📊', '✨']);
      chime();
    });
  }

  return { draw, bindDownload };
})();