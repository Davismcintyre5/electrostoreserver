const AccountEntry = require('../models/AccountEntry');

// @desc    Get current account balance
// @route   GET /api/admin/accounts/balance
exports.getBalance = async (req, res, next) => {
  try {
    const entries = await AccountEntry.find();
    let balance = 0;
    entries.forEach(entry => {
      if (entry.type === 'income') balance += entry.amount;
      else balance -= entry.amount;
    });
    res.json({ balance });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all account entries (transaction history)
// @route   GET /api/admin/accounts
exports.getEntries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const entries = await AccountEntry.find()
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name');
    const total = await AccountEntry.countDocuments();
    res.json({ entries, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// @desc    Add an expense
// @route   POST /api/admin/accounts/expense
exports.addExpense = async (req, res, next) => {
  try {
    const { amount, description, reference } = req.body;
    const entry = await AccountEntry.create({
      type: 'expense',
      amount,
      description,
      reference,
      createdBy: req.user.id
    });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

// @desc    Add a withdrawal
// @route   POST /api/admin/accounts/withdrawal
exports.addWithdrawal = async (req, res, next) => {
  try {
    const { amount, description, reference } = req.body;
    const entry = await AccountEntry.create({
      type: 'withdrawal',
      amount,
      description,
      reference,
      createdBy: req.user.id
    });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};

// @desc    Add income manually (optional)
// @route   POST /api/admin/accounts/income
exports.addIncome = async (req, res, next) => {
  try {
    const { amount, description, reference } = req.body;
    const entry = await AccountEntry.create({
      type: 'income',
      amount,
      description,
      reference,
      createdBy: req.user.id
    });
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
};