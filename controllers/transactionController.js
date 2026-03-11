const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const AccountEntry = require('../models/AccountEntry');

exports.getAllTransactions = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) {
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

exports.createTransaction = async (req, res, next) => {
  try {
    const { orderId, amount, phoneNumber, receiptNumber, notes } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const transaction = await Transaction.create({
      order: orderId,
      user: order.user,
      amount: amount || order.totalAmount,
      phoneNumber,
      status: 'completed',
      mpesaReceiptNumber: receiptNumber || `MANUAL-${Date.now()}`,
      mpesaResponse: { notes, method: 'manual_entry' }
    });

    if (order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.orderStatus = 'confirmed';
      await order.save();

      await AccountEntry.create({
        type: 'income',
        amount: amount || order.totalAmount,
        description: `Manual payment for order ${orderId}`,
        reference: orderId,
        createdBy: req.user.id
      });

      const io = require('../utils/socket').getIO();
      io.to(`user:${order.user}`).emit('orderStatusUpdated', {
        orderId: order._id,
        status: 'confirmed'
      });
    }

    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};