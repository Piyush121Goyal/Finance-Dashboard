// Entry point — handles init, navigation, and dashboard rendering

function initApp() {
  AppState.init();
  _syncRoleUI();
  _syncThemeUI();
  navigate('dashboard', false);
  _bindGlobalEvents();
}

function navigate(page) {
  AppState.currentPage = page;

  document.querySelectorAll('.page').forEach(el => el.classList.add('hidden'));
  const target = document.getElementById(page + 'Page');
  if (target) target.classList.remove('hidden');

  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });

  const titles = { dashboard: 'Dashboard', transactions: 'Transactions', insights: 'Insights' };
  document.getElementById('pageTitle').textContent = titles[page] || page;

  destroyCharts();
  if (page === 'dashboard')    renderDashboardPage();
  if (page === 'transactions') renderTransactionsPage();
  if (page === 'insights')     renderInsightsPage();

  _closeMobileSidebar();
}

function renderDashboardPage() {
  // Reset any filters that were set via the spending chart drill-down
  AppState.filters.category = 'all';
  AppState.filters.type     = 'all';

  _renderSummaryCards();
  _renderRecentTransactions();

  // Delay chart render slightly so the canvas elements are in the DOM
  setTimeout(() => {
    renderBalanceTrend();
    renderSpendingBreakdown();
    const subtitle = document.getElementById('donutSubtitle');
    if (subtitle) subtitle.textContent = 'Click a slice to explore';
  }, 0);
}

function _renderSummaryCards() {
  const el = document.getElementById('summaryCards');
  if (!el) return;

  const s   = AppState.getSummary();
  const fmt = n => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  el.innerHTML = `
    ${_summaryCard('Total Balance',  `$${fmt(s.balance)}`,       'amount-balance', 'Net of all income & expenses')}
    ${_summaryCard('Total Income',   `$${fmt(s.income)}`,        'amount-income',  `${AppState.transactions.filter(t => t.type === 'income').length} transactions`)}
    ${_summaryCard('Total Expenses', `$${fmt(s.expenses)}`,      'amount-expense', `${AppState.transactions.filter(t => t.type === 'expense').length} transactions`)}
    ${_summaryCard('Savings Rate',   `${s.savings.toFixed(1)}%`, 'amount-savings', s.savings >= 20 ? 'On track!' : 'Aim for 20%+')}
  `;
}

function _summaryCard(label, amount, amountClass, sub) {
  return `
    <div class="summary-card">
      <div class="summary-card-top">
        <span class="summary-card-label">${label}</span>
      </div>
      <div class="summary-card-amount ${amountClass}">${amount}</div>
      <div class="summary-card-sub">${sub}</div>
    </div>`;
}

function _renderRecentTransactions() {
  const el = document.getElementById('recentTransactions');
  if (!el) return;

  const recent = [...AppState.transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (recent.length === 0) {
    el.innerHTML = `<div class="empty-state"><p>No transactions yet</p></div>`;
    return;
  }

  el.innerHTML = `
    <div class="table-wrap">
      <table class="recent-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th style="text-align:right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${recent.map(tx => {
            const sign = tx.type === 'income' ? '+' : '-';
            const cls  = tx.type === 'income' ? 'income' : 'expense';
            const date = new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short', day: 'numeric',
            });
            return `
              <tr>
                <td class="tx-date">${date}</td>
                <td class="tx-desc">${tx.description}</td>
                <td><span class="badge badge-category">${tx.category}</span></td>
                <td><span class="badge badge-${cls}">${tx.type}</span></td>
                <td class="tx-amount ${cls}" style="text-align:right">
                  ${sign}$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

function _bindGlobalEvents() {
  // Single delegated listener handles all nav links including "View All"
  document.addEventListener('click', e => {
    const navItem = e.target.closest('[data-page]');
    if (navItem) {
      e.preventDefault();
      navigate(navItem.dataset.page);
    }
  });

  document.getElementById('roleSelect').addEventListener('change', e => {
    AppState.setRole(e.target.value);
    _syncRoleUI();
    navigate(AppState.currentPage, false);
  });

  document.getElementById('themeToggle').addEventListener('click', () => {
    AppState.toggleTheme();
    _syncThemeUI();
    // Charts use theme-specific colors so need to be re-rendered
    destroyCharts();
    if (AppState.currentPage === 'dashboard') {
      renderBalanceTrend();
      renderSpendingBreakdown();
    }
    if (AppState.currentPage === 'insights') {
      renderMonthlyComparison();
    }
  });

  document.getElementById('hamburger').addEventListener('click', _openMobileSidebar);
  document.getElementById('sidebarClose').addEventListener('click', _closeMobileSidebar);
  document.getElementById('sidebarOverlay').addEventListener('click', _closeMobileSidebar);

  // Modal only closes via the X button or Cancel, not by clicking outside
  document.getElementById('modalClose').addEventListener('click', closeModal);
}

function _syncRoleUI() {
  const role  = AppState.role;
  const badge = document.getElementById('roleBadge');
  badge.querySelector('.role-text').textContent = role.charAt(0).toUpperCase() + role.slice(1);
  badge.className = `role-badge ${role}`;
  document.getElementById('roleSelect').value = role;
}

function _syncThemeUI() {
  const isDark = AppState.theme === 'dark';
  document.getElementById('themeToggle').querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';
}

function _openMobileSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('open');
}

function _closeMobileSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

document.addEventListener('DOMContentLoaded', initApp);
