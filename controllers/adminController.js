const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ordersToday = await Order.countDocuments({
      createdAt: { $gte: today }
    });

    const revenueToday = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });

    const lowStock = await Product.countDocuments({ stock: { $lt: 5 } });

    const totalCustomers = await User.countDocuments({ role: 'customer' });

    res.json({
      ordersToday,
      revenueToday: revenueToday[0]?.total || 0,
      pendingOrders,
      lowStock,
      totalCustomers
    });
  } catch (err) {
    next(err);
  }
};