const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  mpesaReceiptNumber: String,
  phoneNumber: String,
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  mpesaResponse: Object, // store full callback data
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);