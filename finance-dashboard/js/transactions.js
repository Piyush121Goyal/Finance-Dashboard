// Transactions page — handles toolbar, table, pagination, and the add/edit modal
const TX_PER_PAGE = 10;
let _txPage = 1;

function renderTransactionsPage() {
  _renderDrillDownBanner();
  _renderToolbar();
  _renderTable();
}

// Shows a banner when user arrives via drill-down from the spending chart
function _renderDrillDownBanner() {
  const existing = document.getElementById('drillDownBanner');
  if (existing) existing.remove();

  const f = AppState.filters;
  if (f.category === 'all' && f.type === 'all') return;

  const card = document.querySelector('#transactionsPage .card');
  if (!card) return;

  const banner = document.createElement('div');
  banner.id = 'drillDownBanner';
  banner.style.cssText = `
    display:flex; align-items:center; justify-content:space-between;
    background: rgba(26,140,255,0.1); border: 1px solid rgba(26,140,255,0.3);
    border-radius: 8px; padding: 10px 16px; margin-bottom: 16px;
    font-size: 13px; font-weight: 500; color: var(--text);
  `;
  banner.innerHTML = `
    <span style="display:flex;align-items:center;gap:8px">
      <span style="font-size:16px">🔍</span>
      Filtered from <strong>Spending Breakdown</strong> —
      Category: <strong style="color:#1a8cff">${f.category !== 'all' ? f.category : 'All'}</strong>
      ${f.type !== 'all' ? `, Type: <strong style="color:#1a8cff">${f.type}</strong>` : ''}
    </span>
    <button id="clearDrillDown" style="
      background:#1a8cff; color:#fff; border:none; border-radius:6px;
      padding:5px 12px; font-size:12px; font-weight:600; cursor:pointer;
    ">✕ Clear Filter</button>
  `;
  card.insertBefore(banner, card.firstChild);

  document.getElementById('clearDrillDown').addEventListener('click', () => {
    AppState.filters.category = 'all';
    AppState.filters.type     = 'all';
    renderTransactionsPage();
  });
}

function _renderToolbar() {
  const el = document.getElementById('transactionsToolbar');
  if (!el) return;

  const isAdmin = AppState.role === 'admin';
  const f = AppState.filters;

  el.innerHTML = `
    <div class="search-wrap">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
      </svg>
      <input class="search-input" id="txSearch" type="text"
        placeholder="Search transactions…" value="${f.search}">
    </div>

    <select class="filter-select" id="txTypeFilter">
      <option value="all"     ${f.type === 'all'     ? 'selected' : ''}>All Types</option>
      <option value="income"  ${f.type === 'income'  ? 'selected' : ''}>Income</option>
      <option value="expense" ${f.type === 'expense' ? 'selected' : ''}>Expense</option>
    </select>

    <select class="filter-select" id="txCategoryFilter">
      <option value="all">All Categories</option>
      ${CATEGORIES.map(c => `
        <option value="${c}" ${f.category === c ? 'selected' : ''}>${c}</option>
      `).join('')}
    </select>

    <input class="filter-select" id="txDateFrom" type="date"
      value="${f.dateFrom}" title="From date" style="min-width:130px">
    <input class="filter-select" id="txDateTo" type="date"
      value="${f.dateTo}" title="To date" style="min-width:130px">

    <div class="toolbar-actions">
      <button class="btn btn-ghost btn-sm" id="txResetFilters">Reset</button>
      ${isAdmin ? `
        <button class="btn btn-primary btn-sm" id="txAddBtn">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
          </svg>
          Add
        </button>
      ` : ''}
    </div>
  `;

  document.getElementById('txSearch').addEventListener('input', e => {
    AppState.filters.search = e.target.value;
    _txPage = 1;
    _renderTable();
  });
  document.getElementById('txTypeFilter').addEventListener('change', e => {
    AppState.filters.type = e.target.value;
    _txPage = 1;
    _renderTable();
  });
  document.getElementById('txCategoryFilter').addEventListener('change', e => {
    AppState.filters.category = e.target.value;
    _txPage = 1;
    _renderTable();
  });
  document.getElementById('txDateFrom').addEventListener('change', e => {
    AppState.filters.dateFrom = e.target.value;
    _txPage = 1;
    _renderTable();
  });
  document.getElementById('txDateTo').addEventListener('change', e => {
    AppState.filters.dateTo = e.target.value;
    _txPage = 1;
    _renderTable();
  });
  document.getElementById('txResetFilters').addEventListener('click', () => {
    AppState.filters = { search: '', category: 'all', type: 'all', dateFrom: '', dateTo: '', sortBy: 'date', sortOrder: 'desc' };
    _txPage = 1;
    renderTransactionsPage();
  });
  if (isAdmin) {
    document.getElementById('txAddBtn').addEventListener('click', () => openTransactionModal(null));
  }
}

function _renderTable() {
  const el = document.getElementById('transactionsList');
  if (!el) return;

  const isAdmin = AppState.role === 'admin';
  const allTxs  = AppState.getFilteredTransactions();
  const total   = allTxs.length;
  const pages   = Math.max(1, Math.ceil(total / TX_PER_PAGE));
  if (_txPage > pages) _txPage = pages;

  const start = (_txPage - 1) * TX_PER_PAGE;
  const txs   = allTxs.slice(start, start + TX_PER_PAGE);

  const sortIndicator = col => {
    if (AppState.filters.sortBy !== col) return '<span class="sort-indicator">⇅</span>';
    return `<span class="sort-indicator">${AppState.filters.sortOrder === 'asc' ? '↑' : '↓'}</span>`;
  };
  const sortClass = col => AppState.filters.sortBy === col ? 'sort-active' : '';

  if (total === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9 17v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2M9 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0"/>
        </svg>
        <p>No transactions found</p>
        <span>Try adjusting the filters above</span>
      </div>`;
    return;
  }

  el.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th class="sortable ${sortClass('date')}" data-sort="date">
              Date ${sortIndicator('date')}
            </th>
            <th>Description</th>
            <th class="col-category">Category</th>
            <th>Type</th>
            <th class="sortable ${sortClass('amount')}" data-sort="amount" style="text-align:right">
              Amount ${sortIndicator('amount')}
            </th>
            ${isAdmin ? '<th style="text-align:right">Actions</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${txs.map(tx => _txRow(tx, isAdmin)).join('')}
        </tbody>
      </table>
    </div>
    ${_paginationHTML(total, pages)}
  `;

  el.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (AppState.filters.sortBy === col) {
        AppState.filters.sortOrder = AppState.filters.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        AppState.filters.sortBy    = col;
        AppState.filters.sortOrder = 'desc';
      }
      _renderTable();
    });
  });

  // data-pg instead of data-page to avoid being caught by the global nav click handler
  el.querySelectorAll('.page-btn[data-pg]').forEach(btn => {
    btn.addEventListener('click', () => {
      _txPage = parseInt(btn.dataset.pg);
      _renderTable();
    });
  });

  if (isAdmin) {
    el.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openTransactionModal(parseInt(btn.dataset.id)));
    });
    el.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this transaction?')) {
          AppState.deleteTransaction(parseInt(btn.dataset.id));
          _renderTable();
          if (AppState.currentPage === 'dashboard') renderDashboardPage();
        }
      });
    });
  }
}

function _txRow(tx, isAdmin) {
  const sign    = tx.type === 'income' ? '+' : '-';
  const cls     = tx.type === 'income' ? 'income' : 'expense';
  const dateStr = new Date(tx.date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  return `
    <tr>
      <td class="tx-date">${dateStr}</td>
      <td><div class="tx-desc">${_esc(tx.description)}</div></td>
      <td class="col-category"><span class="badge badge-category">${_esc(tx.category)}</span></td>
      <td><span class="badge badge-${cls}">${tx.type}</span></td>
      <td class="tx-amount ${cls}" style="text-align:right">
        ${sign}$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      ${isAdmin ? `
        <td style="text-align:right">
          <div class="tx-actions" style="justify-content:flex-end">
            <button class="btn btn-ghost btn-sm edit-btn"    data-id="${tx.id}">Edit</button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${tx.id}">Delete</button>
          </div>
        </td>
      ` : ''}
    </tr>`;
}

function _paginationHTML(total, pages) {
  if (pages <= 1) return `
    <div class="pagination">
      <span>${total} transaction${total !== 1 ? 's' : ''}</span>
    </div>`;

  const maxVisible = 5;
  let start = Math.max(1, _txPage - Math.floor(maxVisible / 2));
  let end   = Math.min(pages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  const pageButtons = [];
  for (let i = start; i <= end; i++) {
    pageButtons.push(`
      <button class="page-btn ${i === _txPage ? 'active' : ''}" data-pg="${i}">${i}</button>`);
  }

  return `
    <div class="pagination">
      <span>Showing ${(_txPage - 1) * TX_PER_PAGE + 1}–${Math.min(_txPage * TX_PER_PAGE, total)} of ${total}</span>
      <div class="pagination-controls">
        <button class="page-btn" data-pg="${_txPage - 1}" ${_txPage === 1 ? 'disabled' : ''}>‹</button>
        ${pageButtons.join('')}
        <button class="page-btn" data-pg="${_txPage + 1}" ${_txPage === pages ? 'disabled' : ''}>›</button>
      </div>
    </div>`;
}

function openTransactionModal(id) {
  const tx     = id ? AppState.transactions.find(t => t.id === id) : null;
  const isEdit = !!tx;
  AppState.editingId = id;

  document.getElementById('modalTitle').textContent = isEdit ? 'Edit Transaction' : 'Add Transaction';

  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <form id="txForm" novalidate>
      <div class="form-group">
        <label class="form-label">Description</label>
        <input class="form-input" id="fDesc" type="text"
          placeholder="e.g. Monthly Salary" required
          value="${isEdit ? _esc(tx.description) : ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Amount ($)</label>
        <input class="form-input" id="fAmount" type="number"
          placeholder="0.00" min="0.01" step="0.01" required
          value="${isEdit ? tx.amount : ''}">
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="fDate" type="date" required
          value="${isEdit ? tx.date : new Date().toISOString().slice(0, 10)}">
      </div>
      <div class="form-group">
        <label class="form-label">Category</label>
        <select class="form-select" id="fCategory">
          ${CATEGORIES.map(c => `
            <option value="${c}" ${isEdit && tx.category === c ? 'selected' : ''}>${c}</option>
          `).join('')}
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Type</label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" name="fType" value="income" ${!isEdit || tx.type === 'income' ? 'checked' : ''}> Income
          </label>
          <label class="radio-label">
            <input type="radio" name="fType" value="expense" ${isEdit && tx.type === 'expense' ? 'checked' : ''}> Expense
          </label>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-ghost" id="modalCancelBtn">Cancel</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Add Transaction'}</button>
      </div>
    </form>
  `;

  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById('modalCancelBtn').addEventListener('click', closeModal);
  document.getElementById('txForm').addEventListener('submit', e => {
    e.preventDefault();
    _submitTransaction(isEdit);
  });
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  AppState.editingId = null;
}

function _submitTransaction(isEdit) {
  const desc   = document.getElementById('fDesc').value.trim();
  const amount = parseFloat(document.getElementById('fAmount').value);
  const date   = document.getElementById('fDate').value;
  const cat    = document.getElementById('fCategory').value;
  const type   = document.querySelector('input[name="fType"]:checked').value;

  if (!desc || isNaN(amount) || amount <= 0 || !date) {
    alert('Please fill in all fields correctly.');
    return;
  }

  const payload = { description: desc, amount, date, category: cat, type };

  if (isEdit) {
    AppState.updateTransaction(AppState.editingId, payload);
  } else {
    AppState.addTransaction(payload);
  }

  closeModal();
  _renderTable();

  if (AppState.currentPage === 'dashboard') renderDashboardPage();
}

// Escapes HTML to prevent XSS when rendering user input
function _esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
