const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const Transaction = require('../models/Transaction');
const AccountEntry = require('../models/AccountEntry');
const { getIO } = require('../utils/socket');

// ==================== CUSTOMER METHODS ====================

exports.createOrder = async (req, res, next) => {
  try {
    const { addressId, paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const address = await Address.findOne({ _id: addressId, user: req.user.id });
    if (!address) return res.status(400).json({ message: 'Invalid address' });

    let total = 0;
    const items = cart.items.map(item => {
      const price = item.product.price;
      total += price * item.quantity;
      return { product: item.product._id, quantity: item.quantity, price };
    });

    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount: total,
      shippingAddress: address._id,
      paymentMethod,
      orderStatus: 'pending'
    });

    cart.items = [];
    await cart.save();

    const io = getIO();
    io.to('admins').emit('newOrder', { orderId: order._id });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name price images')
      .sort('-createdAt');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate('items.product')
      .populate('shippingAddress');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// ==================== ADMIN METHODS ====================

exports.getAllOrders = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;
    if (search) {
      filter.$or = [
        { _id: search },
        { 'user.name': { $regex: search, $options: 'i' } }
      ];
    }
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');
    const total = await Order.countDocuments(filter);
    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const io = getIO();
    io.to(`user:${order.user}`).emit('orderStatusUpdated', { orderId: order._id, status });

    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.orderStatus = 'confirmed';
    order.paymentStatus = 'paid';
    await order.save();

    const transaction = await Transaction.create({
      order: order._id,
      user: order.user,
      amount: order.totalAmount,
      phoneNumber: req.body.phoneNumber || 'N/A',
      status: 'completed',
      mpesaReceiptNumber: req.body.receiptNumber || `MANUAL-${Date.now()}`,
      mpesaResponse: { method: 'manual_confirmation', notes: req.body.notes }
    });

    await AccountEntry.create({
      type: 'income',
      amount: order.totalAmount,
      description: `Payment for order ${order._id}`,
      reference: order._id,
      createdBy: req.user.id
    });

    const io = getIO();
    io.to(`user:${order.user}`).emit('orderStatusUpdated', {
      orderId: order._id,
      status: 'confirmed'
    });

    res.json({ order, transaction });
  } catch (err) {
    next(err);
  }
};