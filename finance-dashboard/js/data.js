// Sample transactions from Jan to Apr 2026
const mockTransactions = [
  // January
  { id: 1,  date: '2026-01-05', description: 'Monthly Salary',       amount: 5000.00, category: 'Salary',        type: 'income'  },
  { id: 2,  date: '2026-01-07', description: 'Grocery Shopping',     amount: 145.30,  category: 'Food',          type: 'expense' },
  { id: 3,  date: '2026-01-10', description: 'Netflix Subscription', amount: 15.99,   category: 'Entertainment', type: 'expense' },
  { id: 4,  date: '2026-01-12', description: 'Uber Ride',            amount: 23.50,   category: 'Transport',     type: 'expense' },
  { id: 5,  date: '2026-01-15', description: 'Electricity Bill',     amount: 89.00,   category: 'Utilities',     type: 'expense' },
  { id: 6,  date: '2026-01-18', description: 'Restaurant Dinner',    amount: 67.80,   category: 'Food',          type: 'expense' },
  { id: 7,  date: '2026-01-20', description: 'Freelance Project',    amount: 800.00,  category: 'Freelance',     type: 'income'  },
  { id: 8,  date: '2026-01-22', description: 'Amazon Shopping',      amount: 134.99,  category: 'Shopping',      type: 'expense' },
  { id: 9,  date: '2026-01-25', description: 'Gym Membership',       amount: 49.99,   category: 'Health',        type: 'expense' },
  { id: 10, date: '2026-01-28', description: 'Internet Bill',        amount: 59.99,   category: 'Utilities',     type: 'expense' },

  // February
  { id: 11, date: '2026-02-01', description: 'Monthly Salary',       amount: 5000.00, category: 'Salary',        type: 'income'  },
  { id: 12, date: '2026-02-04', description: 'Coffee Shop',          amount: 12.50,   category: 'Food',          type: 'expense' },
  { id: 13, date: '2026-02-06', description: 'Doctor Visit',         amount: 150.00,  category: 'Health',        type: 'expense' },
  { id: 14, date: '2026-02-08', description: 'Grocery Shopping',     amount: 167.40,  category: 'Food',          type: 'expense' },
  { id: 15, date: '2026-02-12', description: 'Spotify Premium',      amount: 9.99,    category: 'Entertainment', type: 'expense' },
  { id: 16, date: '2026-02-14', description: 'Valentine Dinner',     amount: 95.00,   category: 'Food',          type: 'expense' },
  { id: 17, date: '2026-02-15', description: 'Electricity Bill',     amount: 92.00,   category: 'Utilities',     type: 'expense' },
  { id: 18, date: '2026-02-18', description: 'Bus Pass',             amount: 45.00,   category: 'Transport',     type: 'expense' },
  { id: 19, date: '2026-02-20', description: 'Freelance Project',    amount: 1200.00, category: 'Freelance',     type: 'income'  },
  { id: 20, date: '2026-02-22', description: 'Clothing Store',       amount: 189.00,  category: 'Shopping',      type: 'expense' },
  { id: 21, date: '2026-02-25', description: 'Investment Return',    amount: 320.00,  category: 'Investment',    type: 'income'  },
  { id: 22, date: '2026-02-28', description: 'Internet Bill',        amount: 59.99,   category: 'Utilities',     type: 'expense' },

  // March
  { id: 23, date: '2026-03-01', description: 'Monthly Salary',       amount: 5000.00, category: 'Salary',        type: 'income'  },
  { id: 24, date: '2026-03-03', description: 'Grocery Shopping',     amount: 132.60,  category: 'Food',          type: 'expense' },
  { id: 25, date: '2026-03-05', description: 'Pharmacy',             amount: 38.75,   category: 'Health',        type: 'expense' },
  { id: 26, date: '2026-03-08', description: 'Movie Tickets',        amount: 28.00,   category: 'Entertainment', type: 'expense' },
  { id: 27, date: '2026-03-10', description: 'Gas Station',          amount: 55.00,   category: 'Transport',     type: 'expense' },
  { id: 28, date: '2026-03-12', description: 'Coffee Shop',          amount: 18.50,   category: 'Food',          type: 'expense' },
  { id: 29, date: '2026-03-15', description: 'Electricity Bill',     amount: 78.50,   category: 'Utilities',     type: 'expense' },
  { id: 30, date: '2026-03-18', description: 'Online Course',        amount: 49.00,   category: 'Shopping',      type: 'expense' },
  { id: 31, date: '2026-03-20', description: 'Freelance Project',    amount: 950.00,  category: 'Freelance',     type: 'income'  },
  { id: 32, date: '2026-03-22', description: 'Restaurant Lunch',     amount: 42.30,   category: 'Food',          type: 'expense' },
  { id: 33, date: '2026-03-25', description: 'Amazon Shopping',      amount: 76.49,   category: 'Shopping',      type: 'expense' },
  { id: 34, date: '2026-03-28', description: 'Internet Bill',        amount: 59.99,   category: 'Utilities',     type: 'expense' },
  { id: 35, date: '2026-03-30', description: 'Investment Return',    amount: 280.00,  category: 'Investment',    type: 'income'  },

  // April
  { id: 36, date: '2026-04-01', description: 'Monthly Salary',       amount: 5000.00, category: 'Salary',        type: 'income'  },
  { id: 37, date: '2026-04-02', description: 'Grocery Shopping',     amount: 98.20,   category: 'Food',          type: 'expense' },
  { id: 38, date: '2026-04-03', description: 'Coffee Shop',          amount: 14.00,   category: 'Food',          type: 'expense' },
  { id: 39, date: '2026-04-04', description: 'Bus Ticket',           amount: 8.50,    category: 'Transport',     type: 'expense' },
  { id: 40, date: '2026-04-05', description: 'Streaming Bundle',     amount: 24.99,   category: 'Entertainment', type: 'expense' },
];

const CATEGORIES = [
  'Salary', 'Freelance', 'Investment',
  'Food', 'Transport', 'Shopping',
  'Entertainment', 'Health', 'Utilities', 'Other'
];
