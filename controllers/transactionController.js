const Transaction = require('../models/Transaction');

// Admin: get all transactions with search
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) {
      // search by Mpesa receipt or order ID
      filter.$or = [
        { mpesaReceiptNumber: { $regex: search, $options: 'i' } },
        { order: search }
      ];
    }
    const transactions = await Transaction.find(filter)
      .populate('user', 'name email')
      .populate('order')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');
    const total = await Transaction.countDocuments(filter);
    res.json({ transactions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};