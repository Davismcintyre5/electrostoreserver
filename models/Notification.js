const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['order', 'promo', 'system', 'alert'] },
  title: String,
  message: String,
  isRead: { type: Boolean, default: false },
  data: Object, // additional metadata
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);