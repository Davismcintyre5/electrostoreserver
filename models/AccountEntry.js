const mongoose = require('mongoose');

const accountEntrySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['income', 'expense', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AccountEntry', accountEntrySchema);