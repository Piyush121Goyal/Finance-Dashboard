// Central state object — everything the app needs lives here
const AppState = {
  transactions: [],
  role: 'viewer',
  theme: 'light',
  currentPage: 'dashboard',
  filters: {
    search: '',
    category: 'all',
    type: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',
    sortOrder: 'desc',
  },
  editingId: null,

  // Load from localStorage on startup, fall back to mock data if nothing saved
  init() {
    try {
      const saved = localStorage.getItem('financetrack_v1');
      if (saved) {
        const data = JSON.parse(saved);
        this.transactions = Array.isArray(data.transactions) && data.transactions.length
          ? data.transactions
          : [...mockTransactions];
        this.role  = data.role  || 'viewer';
        this.theme = data.theme || 'light';
      } else {
        this.transactions = [...mockTransactions];
      }
    } catch {
      this.transactions = [...mockTransactions];
    }
    this._applyTheme();
  },

  // Save current state to localStorage
  save() {
    try {
      localStorage.setItem('financetrack_v1', JSON.stringify({
        transactions: this.transactions,
        role:  this.role,
        theme: this.theme,
      }));
    } catch { /* storage quota exceeded, skip silently */ }
  },

  setRole(role) {
    this.role = role;
    this.save();
  },

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this._applyTheme();
    this.save();
  },

  _applyTheme() {
    document.body.dataset.theme = this.theme;
  },

  addTransaction(tx) {
    const newTx = { ...tx, id: Date.now() };
    this.transactions.unshift(newTx);
    this.save();
    return newTx;
  },

  updateTransaction(id, updates) {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.transactions[idx] = { ...this.transactions[idx], ...updates };
      this.save();
    }
  },

  deleteTransaction(id) {
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.save();
  },

  // Returns transactions after applying all active filters and sort
  getFilteredTransactions() {
    let txs = [...this.transactions];
    const f  = this.filters;

    if (f.search) {
      const q = f.search.toLowerCase();
      txs = txs.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    if (f.category !== 'all') txs = txs.filter(t => t.category === f.category);
    if (f.type     !== 'all') txs = txs.filter(t => t.type     === f.type);
    if (f.dateFrom)           txs = txs.filter(t => t.date >= f.dateFrom);
    if (f.dateTo)             txs = txs.filter(t => t.date <= f.dateTo);

    txs.sort((a, b) => {
      let vA = f.sortBy === 'amount' ? parseFloat(a.amount) : a[f.sortBy];
      let vB = f.sortBy === 'amount' ? parseFloat(b.amount) : b[f.sortBy];
      if (vA < vB) return f.sortOrder === 'asc' ? -1 :  1;
      if (vA > vB) return f.sortOrder === 'asc' ?  1 : -1;
      return 0;
    });

    return txs;
  },

  getSummary() {
    const income   = this.transactions.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0);
    const expenses = this.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const balance  = income - expenses;
    const savings  = income > 0 ? (balance / income) * 100 : 0;
    return { income, expenses, balance, savings };
  },

  // Groups transactions by month and builds totals for charts
  getMonthlyData() {
    const keys   = ['2026-01', '2026-02', '2026-03', '2026-04'];
    const labels = ['Jan', 'Feb', 'Mar', 'Apr'];
    const map    = {};
    keys.forEach(k => (map[k] = { income: 0, expenses: 0 }));

    this.transactions.forEach(t => {
      const k = t.date.slice(0, 7);
      if (map[k]) {
        if (t.type === 'income') map[k].income   += t.amount;
        else                     map[k].expenses += t.amount;
      }
    });

    let running = 0;
    const balances = keys.map(k => {
      running += map[k].income - map[k].expenses;
      return Math.round(running);
    });

    return {
      labels,
      income:   keys.map(k => Math.round(map[k].income)),
      expenses: keys.map(k => Math.round(map[k].expenses)),
      balances,
    };
  },

  // Returns totals per category sorted highest first
  getCategoryTotals(type = 'expense') {
    const totals = {};
    this.transactions
      .filter(t => t.type === type)
      .forEach(t => { totals[t.category] = (totals[t.category] || 0) + t.amount; });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }));
  },
};
