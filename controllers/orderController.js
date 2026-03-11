const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const { getIO } = require('../utils/socket');

// ==================== CUSTOMER METHODS ====================

// @desc    Create order from cart (checkout)
// @route   POST /api/customer/checkout
exports.createOrder = async (req, res, next) => {
  try {
    const { addressId, paymentMethod } = req.body;
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const address = await Address.findOne({ _id: addressId, user: req.user.id });
    if (!address) return res.status(400).json({ message: 'Invalid address' });

    // Calculate total
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

    // Clear cart
    cart.items = [];
    await cart.save();

    // Notify admins
    const io = getIO();
    io.to('admins').emit('newOrder', { orderId: order._id });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// @desc    Get my orders (customer)
// @route   GET /api/customer/orders
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

// @desc    Get single order (if belongs to customer)
// @route   GET /api/customer/orders/:id
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

// @desc    Get all orders with search and filters
// @route   GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;
    if (search) {
      // Search by order ID or user email/name – we'll just use order ID for simplicity
      filter._id = search;
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

// @desc    Update order status (admin)
// @route   PATCH /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Notify customer via socket
    const io = getIO();
    io.to(`user:${order.user}`).emit('orderStatusUpdated', { orderId: order._id, status });

    res.json(order);
  } catch (err) {
    next(err);
  }
};