/* ═══════════ js/stats.js — the receipts page logic ═══════════ */

const BAR_COLORS = ['#FF6157','#FFC933','#1FBE9C','#4FA6FF','#9C7BFF','#FF8FC0'];

function esc(s){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* lightweight theme for this page */
function wireSettings(){
  const themeBtn = document.getElementById('theme-btn');
  const applyTheme = () => {
    const n = state.theme === 'night';
    document.documentElement.setAttribute('data-theme', n ? 'night' : 'day');
    if(themeBtn) themeBtn.textContent = n ? '☀️' : '🌙';
  };
  if(themeBtn) themeBtn.addEventListener('click', () => { 
    state.theme = state.theme === 'night' ? 'day' : 'night'; 
    Store.save(state); 
    applyTheme(); 
  });
  applyTheme();
}

function renderAll(){
  const days = lastNDays(7);
  const habits = activeHabits();
  
  // Calculate metrics
  const counts = days.map(k => habits.filter(h => h.done[k]).length);
  const total = counts.reduce((a, b) => a + b, 0);
  const pct = habits.length ? Math.min(100, Math.round(total / (habits.length * 7) * 100)) : 0;

  // Streak calculation
  let bestStreak = 0;
  habits.forEach(h => { 
    const s = streakOf(h); 
    if(s > bestStreak) bestStreak = s; 
  });

  // Focus time from localStorage (simulated)
  const focusMinutes = parseInt(localStorage.getItem('loop_focus_minutes') || '0');
  const focusHours = Math.round(focusMinutes / 60);

  // Update DOM elements
  const streakValueEl = document.getElementById('streakValue');
  const streakDaysEl = document.getElementById('streakDays');
  const completionValueEl = document.getElementById('completionValue');
  const completionPctEl = document.getElementById('completionPct');
  const focusValueEl = document.getElementById('focusValue');
  const focusHoursEl = document.getElementById('focusHours');

  if(streakValueEl) streakValueEl.textContent = bestStreak > 0 ? '🔥' : '--';
  if(streakDaysEl) streakDaysEl.textContent = bestStreak;
  if(completionValueEl) completionValueEl.textContent = pct + '%';
  if(completionPctEl) completionPctEl.textContent = pct;
  if(focusValueEl) focusValueEl.textContent = focusHours > 0 ? '⏱️' : '--';
  if(focusHoursEl) focusHoursEl.textContent = focusHours;

  // Monthly heatmap
  const monthlyHeatmap = document.getElementById('monthlyHeatmap');
  if(monthlyHeatmap) {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    let monthlyHtml = '';
    for(let i = 1; i <= daysInMonth; i++) {
      const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const completedCount = habits.filter(h => h.done[dateKey]).length;
      const level = completedCount === 0 ? '' : completedCount === 1 ? ' l1' : completedCount === 2 ? ' l2' : completedCount === 3 ? ' l3' : ' l4';
      monthlyHtml += `<div class="heatmap-cell${level}" title="${dateKey}: ${completedCount}">${i}</div>`;
    }
    monthlyHeatmap.innerHTML = monthlyHtml;
  }

  // Performance bars
  const performanceBars = document.getElementById('performanceBars');
  if(performanceBars && habits.length > 0) {
    const topHabits = habits.slice(0, 3);
    let barsHtml = '';
    topHabits.forEach(h => {
      const habitPct = Math.round((Object.keys(h.done).filter(k => days.includes(k)).length / 7) * 100);
      barsHtml += `
        <div style="margin-bottom: 1rem;">
          <div class="flex justify-between" style="margin-bottom: 0.5rem;">
            <span>${h.emoji} ${esc(h.name)}</span>
            <span class="mono text-mint">${habitPct}%</span>
          </div>
          <div style="height: 6px; background: var(--deep-space); border-radius: 3px; overflow: hidden;">
            <div style="height: 100%; width: ${habitPct}%; background: var(--mint-laser);"></div>
          </div>
        </div>`;
    });
    performanceBars.innerHTML = barsHtml;
  } else if(performanceBars) {
    performanceBars.innerHTML = '<p class="text-dust">No habits yet</p>';
  }

  // Weekly chart
  const weeklyChart = document.getElementById('weeklyChart');
  if(weeklyChart) {
    const maxCount = Math.max(1, ...counts);
    let chartHtml = '';
    counts.forEach((c, i) => {
      const height = Math.round((c / maxCount) * 100);
      chartHtml += `<div style="flex: 1; background: var(--mint-laser); height: ${height}%; border-radius: 4px 4px 0 0;"></div>`;
    });
    weeklyChart.innerHTML = chartHtml;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  wireSettings();
  renderAll();
});
