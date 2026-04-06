// Insights page — computes and renders all insight cards and charts

function renderInsightsPage() {
  const el = document.getElementById('insightsContent');
  if (!el) return;

  const txs  = AppState.transactions;
  const data = _computeInsights(txs);

  el.innerHTML = `
    <div class="insights-grid">
      ${_insightCard('Top Spending Category',
        data.topCategory.name,
        `$${data.topCategory.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} total spent`)}

      ${_insightCard('Best Income Month',
        data.bestIncomeMonth.label,
        `$${data.bestIncomeMonth.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} earned`)}

      ${_insightCard('Highest Expense Month',
        data.highestExpenseMonth.label,
        `$${data.highestExpenseMonth.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} spent`)}

      ${_insightCard('Overall Savings Rate',
        `${data.savingsRate.toFixed(1)}%`,
        data.savingsRate >= 20
          ? 'Great job — above the recommended 20%!'
          : 'Aim to save at least 20% of income')}

      ${_insightCard('Avg Monthly Expenses',
        `$${data.avgMonthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        `Across ${data.activeMonths} active month${data.activeMonths !== 1 ? 's' : ''}`)}

      ${_insightCard('Largest Single Expense',
        `$${data.largestExpense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        `${data.largestExpense.description} — ${_fmtDate(data.largestExpense.date)}`)}
    </div>

    <div class="insights-bottom" style="margin-top: 24px;">
      <div class="card">
        <div class="card-header">
          <h3>Monthly Income vs Expenses</h3>
          <span class="card-subtitle">Jan — Apr 2026</span>
        </div>
        <div class="chart-container" style="height:240px">
          <canvas id="monthlyComparisonChart"></canvas>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Month-over-Month Expenses</h3>
          <span class="card-subtitle">vs previous month</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:12px; padding-top:4px">
          ${data.momRows.map(row => _momRow(row)).join('')}
        </div>
      </div>
    </div>
  `;

  renderMonthlyComparison();
}

function _computeInsights(txs) {
  const md = AppState.getMonthlyData();

  const catTotals = AppState.getCategoryTotals('expense');
  const topCat    = catTotals[0] || { category: 'N/A', amount: 0 };

  const maxIncomeIdx = md.income.indexOf(Math.max(...md.income));
  const bestIncome   = { label: md.labels[maxIncomeIdx], amount: md.income[maxIncomeIdx] };

  const maxExpIdx  = md.expenses.indexOf(Math.max(...md.expenses));
  const highestExp = { label: md.labels[maxExpIdx], amount: md.expenses[maxExpIdx] };

  const summary     = AppState.getSummary();
  const savingsRate = summary.income > 0 ? summary.savings : 0;

  const nonZeroMonths = md.expenses.filter(v => v > 0);
  const avgMonthly    = nonZeroMonths.length
    ? nonZeroMonths.reduce((s, v) => s + v, 0) / nonZeroMonths.length
    : 0;

  const expenses   = txs.filter(t => t.type === 'expense');
  const largestExp = expenses.length
    ? expenses.reduce((max, t) => t.amount > max.amount ? t : max)
    : { description: 'N/A', amount: 0, date: '' };

  const momRows = md.labels.slice(1).map((label, i) => {
    const prevExp = md.expenses[i];
    const currExp = md.expenses[i + 1];
    const diff    = currExp - prevExp;
    const pct     = prevExp > 0 ? ((diff / prevExp) * 100).toFixed(1) : '—';
    return { label, prevLabel: md.labels[i], diff, pct, currExp, prevExp };
  });

  return {
    topCategory:         { name: topCat.category, amount: topCat.amount },
    bestIncomeMonth:     bestIncome,
    highestExpenseMonth: highestExp,
    savingsRate,
    avgMonthlyExpenses:  avgMonthly,
    activeMonths:        nonZeroMonths.length,
    largestExpense:      largestExp,
    momRows,
  };
}

function _insightCard(label, value, desc) {
  return `
    <div class="insight-card">
      <div class="insight-label">${label}</div>
      <div class="insight-value">${value}</div>
      <div class="insight-desc">${desc}</div>
    </div>`;
}

function _momRow(row) {
  const up      = row.diff >= 0;
  const color   = up ? 'var(--expense)' : 'var(--income)';
  const arrow   = up ? '↑' : '↓';
  const pctText = row.pct === '—' ? '—' : `${arrow} ${Math.abs(row.pct)}%`;
  return `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border)">
      <div>
        <div style="font-weight:600; font-size:14px">${row.label}</div>
        <div style="font-size:12px; color:var(--text-3)">vs ${row.prevLabel}: $${row.prevExp.toLocaleString()}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700; font-size:15px">$${row.currExp.toLocaleString()}</div>
        <div style="font-size:12px; font-weight:600; color:${color}">${pctText}</div>
      </div>
    </div>`;
}

function _fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
