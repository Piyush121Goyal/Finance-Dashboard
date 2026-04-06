// All Chart.js chart rendering lives here
let _balanceChart  = null;
let _donutChart    = null;
let _monthlyChart  = null;

// Destroy all charts before re-rendering to avoid memory leaks
function destroyCharts() {
  [_balanceChart, _donutChart, _monthlyChart].forEach(c => c && c.destroy());
  _balanceChart = _donutChart = _monthlyChart = null;
}

// Returns colors for chart grids and tooltips based on current theme
function _chartTheme() {
  const dark = document.body.dataset.theme === 'dark';
  return {
    grid:    dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.05)',
    tick:    dark ? '#94a3b8' : '#64748b',
    tooltip: {
      bg:     dark ? '#1e293b' : '#ffffff',
      border: dark ? '#334155' : '#e2e8f0',
      text:   dark ? '#f1f5f9' : '#1e293b',
    },
    card: dark ? '#1e293b' : '#ffffff',
  };
}

const PALETTE = [
  '#4f46e5','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899','#14b8a6'
];

// Custom plugin that draws a vertical dashed line at the hovered point
const crosshairPlugin = {
  id: 'crosshair',
  afterDraw(chart) {
    if (chart._crosshairX == null) return;
    const { ctx, chartArea: { top, bottom } } = chart;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(chart._crosshairX, top);
    ctx.lineTo(chart._crosshairX, bottom);
    ctx.lineWidth   = 1.5;
    ctx.strokeStyle = 'rgba(26,140,255,.45)';
    ctx.setLineDash([5, 4]);
    ctx.stroke();
    ctx.restore();
  },
};

function renderBalanceTrend() {
  const ctx = document.getElementById('balanceTrendChart');
  if (!ctx) return;
  if (_balanceChart) _balanceChart.destroy();

  const md  = AppState.getMonthlyData();
  const t   = _chartTheme();
  const hoverCard = document.getElementById('balanceHoverCard');

  let _clickedIdx = null;

  // Fill the floating stats card with data for the clicked month
  function _populateCard(idx) {
    hoverCard.querySelector('.bhc-month').textContent = md.labels[idx];
    hoverCard.querySelector('.bhc-balance').textContent = `$${md.balances[idx].toLocaleString()}`;
    const valueEls = hoverCard.querySelectorAll('.bhc-value');
    valueEls[1].textContent = `+$${md.income[idx].toLocaleString()}`;
    valueEls[2].textContent = `-$${md.expenses[idx].toLocaleString()}`;
  }

  _balanceChart = new Chart(ctx, {
    type: 'line',
    plugins: [crosshairPlugin],
    data: {
      labels: md.labels,
      datasets: [{
        label: 'Balance',
        data: md.balances,
        borderColor: '#1a8cff',
        backgroundColor: 'rgba(26,140,255,.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#1a8cff',
        pointBorderColor: t.card,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#1a8cff',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      onHover(event, elements, chart) {
        if (elements.length) {
          const idx = elements[0].index;
          chart._crosshairX = elements[0].element.x;
          ctx.style.cursor  = 'pointer';
          // Only show the card if this point was clicked, otherwise hide it
          if (_clickedIdx === idx) {
            _populateCard(idx);
            hoverCard.classList.remove('hidden');
          } else {
            hoverCard.classList.add('hidden');
          }
        } else {
          chart._crosshairX = null;
          ctx.style.cursor  = 'default';
          hoverCard.classList.add('hidden');
          _clickedIdx = null;
        }
        chart.draw();
      },
      onClick(event, elements) {
        if (elements.length) {
          const idx = elements[0].index;
          _clickedIdx = idx;
          _populateCard(idx);
          hoverCard.classList.remove('hidden');
        }
      },
      scales: {
        x: {
          grid: { color: t.grid },
          ticks: { color: t.tick },
          border: { dash: [4, 4] },
        },
        y: {
          grid: { color: t.grid },
          ticks: {
            color: t.tick,
            maxTicksLimit: 6,
            callback: v => {
              if (v === 0) return '$0';
              if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`;
              return `$${v}`;
            },
          },
          border: { dash: [4, 4] },
        },
      },
    },
  });
}

function renderSpendingBreakdown() {
  const ctx = document.getElementById('spendingBreakdownChart');
  if (!ctx) return;
  if (_donutChart) _donutChart.destroy();

  const items  = AppState.getCategoryTotals('expense');
  const labels = items.map(i => i.category);
  const data   = items.map(i => i.amount);
  const colors = PALETTE.slice(0, labels.length);
  const t      = _chartTheme();

  _donutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: t.card,
        borderWidth: 2,
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: t.tick,
            padding: 14,
            usePointStyle: true,
            pointStyle: 'rect',
            pointStyleWidth: 12,
            font: { size: 13, weight: '500' },
          },
        },
        tooltip: {
          backgroundColor: t.tooltip.bg,
          borderColor: t.tooltip.border,
          borderWidth: 1,
          titleColor: t.tooltip.text,
          bodyColor: t.tooltip.text,
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.label}: $${ctx.parsed.toLocaleString()} — click to explore`,
          },
        },
      },
      onClick(event, elements) {
        if (!elements.length) return;
        const idx      = elements[0].index;
        const category = labels[idx];
        const color    = colors[idx];
        _drillDownToCategory(category, color);
      },
    },
  });
}

// Clicking a donut slice filters the transactions page to that category
function _drillDownToCategory(category, color) {
  AppState.filters.category = category;
  AppState.filters.type     = 'expense';
  AppState.filters.search   = '';
  AppState.filters.dateFrom = '';
  AppState.filters.dateTo   = '';

  const subtitle = document.getElementById('donutSubtitle');
  if (subtitle) {
    subtitle.innerHTML = `
      <span style="display:inline-flex;align-items:center;gap:6px">
        <span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${color}"></span>
        Showing: <strong>${category}</strong>
        <button id="clearDonutFilter" style="margin-left:4px;background:none;border:none;color:var(--text-3);cursor:pointer;font-size:13px;padding:0;line-height:1" title="Clear filter">✕</button>
      </span>`;
    document.getElementById('clearDonutFilter').addEventListener('click', () => {
      AppState.filters.category = 'all';
      AppState.filters.type     = 'all';
      subtitle.textContent = 'Click a slice to explore';
    });
  }

  navigate('transactions', false);
}

function renderMonthlyComparison() {
  const ctx = document.getElementById('monthlyComparisonChart');
  if (!ctx) return;
  if (_monthlyChart) _monthlyChart.destroy();

  const md = AppState.getMonthlyData();
  const t  = _chartTheme();

  _monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: md.labels,
      datasets: [
        {
          label: 'Income',
          data: md.income,
          backgroundColor: 'rgba(5,150,105,.8)',
          borderRadius: 5,
          borderSkipped: false,
        },
        {
          label: 'Expenses',
          data: md.expenses,
          backgroundColor: 'rgba(220,38,38,.8)',
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: t.tick, usePointStyle: true, font: { size: 12 } },
        },
        tooltip: {
          backgroundColor: t.tooltip.bg,
          borderColor: t.tooltip.border,
          borderWidth: 1,
          titleColor: t.tooltip.text,
          bodyColor: t.tooltip.text,
          padding: 10,
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: t.tick },
        },
        y: {
          grid: { color: t.grid },
          ticks: {
            color: t.tick,
            callback: v => `$${(v / 1000).toFixed(0)}k`,
          },
          border: { dash: [4, 4] },
        },
      },
    },
  });
}
