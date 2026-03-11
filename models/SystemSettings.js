const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'ElectroStore' },
  contactEmail: String,
  contactPhone: String,
  address: String,
  currency: { type: String, default: 'KES' },
  vatRate: { type: Number, default: 16 }, // percentage
  // singleton: only one document should exist
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SystemSettings', settingsSchema);