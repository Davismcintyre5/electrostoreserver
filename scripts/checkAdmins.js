require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');

const checkAdmins = async () => {
  await connectDB();
  const admins = await User.find({ role: { $in: ['admin', 'manager', 'cashier'] } }).select('name email role');
  console.log('Staff users:');
  admins.forEach(u => console.log(`${u.name} (${u.email}) - ${u.role}`));
  process.exit();
};

checkAdmins().catch(err => {
  console.error(err);
  process.exit(1);
});