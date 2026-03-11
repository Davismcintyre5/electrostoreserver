const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Generate temporary password
const generateTempPassword = () => crypto.randomBytes(4).toString('hex'); // 8 chars

// Get all staff (admin, manager, cashier)
exports.getStaff = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $in: ['admin', 'manager', 'cashier'] } }).select('-password');
    res.json(staff);
  } catch (err) {
    next(err);
  }
};

// Create staff (admin only)
exports.createStaff = async (req, res, next) => {
  try {
    const { name, email, role, phone } = req.body;
    if (!['admin', 'manager', 'cashier'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const tempPassword = generateTempPassword();
    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role,
      phone,
      mustChangePassword: true
    });

    // In production, send email with temp password
    res.status(201).json({
      message: 'Staff created successfully',
      user: { id: user._id, name, email, role },
      tempPassword // remove in production
    });
  } catch (err) {
    next(err);
  }
};

// Update staff
exports.updateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone, isActive } = req.body;
    const user = await User.findByIdAndUpdate(id, { name, email, role, phone, isActive }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Delete staff (admin only)
exports.deleteStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'Staff deleted' });
  } catch (err) {
    next(err);
  }
};