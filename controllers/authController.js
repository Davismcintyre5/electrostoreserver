const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/env');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

// Register (customer only)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'customer',
      mustChangePassword: false
    });

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, name, email, role: user.role } });
  } catch (err) {
    next(err);
  }
};

// Login (all users) – with optional role check for admin
exports.login = async (req, res, next) => {
  try {
    const { email, password, as } = req.body; // 'as' can be 'admin' or undefined
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(401).json({ message: 'Account disabled' });

    // If login is for admin panel, check role
    if (as === 'admin') {
      const allowedRoles = ['admin', 'manager', 'cashier'];
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'You are not authorized to access the admin panel' });
      }
    }

    const token = generateToken(user);
    res.json({
      token,
      requiresPasswordChange: user.mustChangePassword,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

// Get current user (authenticated)
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// Change password (authenticated)
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};