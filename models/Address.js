const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, default: 'Home' }, // e.g., Home, Work
  recipientName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: String,
  postalCode: String,
  country: { type: String, default: 'Kenya' },
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Ensure max 3 addresses per user, and only one default
addressSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Address').countDocuments({ user: this.user });
    if (count >= 3) {
      return next(new Error('User can have at most 3 addresses'));
    }
  }
  next();
});

module.exports = mongoose.model('Address', addressSchema);