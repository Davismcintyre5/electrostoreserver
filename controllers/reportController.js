const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Product = require('../models/Product');

// Sales report (aggregate by day/week/month)
exports.getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    let groupId;
    if (groupBy === 'day') groupId = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    else if (groupBy === 'month') groupId = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    else if (groupBy === 'year') groupId = { $dateToString: { format: '%Y', date: '$createdAt' } };

    const sales = await Order.aggregate([
      { $match: { ...match, paymentStatus: 'paid' } },
      { $group: { _id: groupId, totalSales: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json(sales);
  } catch (err) {
    next(err);
  }
};

// Top products
exports.getTopProducts = async (req, res, next) => {
  try {
    const top = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' }
    ]);
    res.json(top);
  } catch (err) {
    next(err);
  }
};