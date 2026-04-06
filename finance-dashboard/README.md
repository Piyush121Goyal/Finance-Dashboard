# Fintrak — Finance Dashboard

A clean, interactive finance dashboard built with vanilla JavaScript, HTML5, and CSS3

## Setup

1. Clone / download the project folder.
2. Open `finance-dashboard/index.html` directly in any modern browser.
   - No server, no npm install, no build step needed.
   - Charts require an internet connection to load Chart.js from CDN.



## Project Structure
finance-dashboard/
├── index.html          # All sections defined here
├── css/
│   └── styles.css      # Stylesheet with CSS variables for theming
└── js/
    ├── data.js         # 41 mock transactions (Jan – Apr 2026)
    ├── state.js        # Global AppState object (CRUD, filters, persistence)
    ├── charts.js       # Chart.js wrappers (line, doughnut, bar)
    ├── transactions.js # Transactions page UI (toolbar, table, modal form)
    ├── insights.js     # Insights page UI (calculations + rendering)
    └── app.js          # Entry point (init, navigation, dashboard render)


## Features

### Dashboard Overview
- Four summary cards: Total Balance, Income, Expenses, Savings Rate
- Balance Trend — line chart showing monthly running balance
- Spending Breakdown — doughnut chart by expense category
- Recent Transactions — last 5 transactions at a glance

### Transactions
- Full transaction table with date, description, category, type, and amount
- Search by description or category
- Filter by type (income / expense) and category
- Date range filter (from / to)
- Sortable columns: Date and Amount (toggle asc/desc)
- Pagination (10 per page)

### Role-Based UI
| Feature           | Viewer | Admin |
|-------------------|--------|-------|
| View data         |   YES  |  YES   |
| Add transaction   |    NO  |  YES   |
| Edit transaction  |    NO  |  YES   |
| Delete transaction|    NO  |  YES   |

Switch roles via the Role dropdown in the header. The UI instantly adapts — no page reload required.

### Insights
- Top spending category
- Best income month & highest expense month
- Overall savings rate with contextual feedback
- Average monthly expenses
- Largest single expense
- Monthly Income vs Expenses bar chart
- Month-over-month expenses expense comparison with % change

### State Management
All state lives in a single `AppState` object (`js/state.js`):
- `transactions` — array of all transaction objects
- `role` — current user role
- `theme` — light / dark
- `filters` — search, category, type, date range, sort
- Persisted to localStorage automatically on every change

### Optional Enhancements Implemented
- Dark mode — toggle button in header;
- Data persistence — full state stored in `localStorage` key `financetrack_v1`
- Animations — card hover lifts, theme toggle rotation

---

## Approach

The app is deliberately framework-free. State flows one way:

```
User action → AppState mutation → re-render affected section
```

Each JS module is responsible for one concern:
- `state.js` owns all data and business logic
- `charts.js` wraps Chart.js with no side effects
- `transactions.js` and `insights.js` are pure render functions
- `app.js` wires everything together

This keeps the codebase easy to trace and extend without the overhead of a bundler or framework.

---

## Browser Support

Works in all browsers
