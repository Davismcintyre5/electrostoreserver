const Address = require('../models/Address');

// Get all addresses for logged in user
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user.id }).sort('-isDefault');
    res.json(addresses);
  } catch (err) {
    next(err);
  }
};

// Create address
exports.createAddress = async (req, res, next) => {
  try {
    const count = await Address.countDocuments({ user: req.user.id });
    if (count >= 3) {
      return res.status(400).json({ message: 'Maximum 3 addresses allowed' });
    }
    const addressData = { ...req.body, user: req.user.id };
    if (count === 0) {
      addressData.isDefault = true;
    }
    const address = await Address.create(addressData);
    res.status(201).json(address);
  } catch (err) {
    next(err);
  }
};

// Update address
exports.updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json(address);
  } catch (err) {
    next(err);
  }
};

// Set default address
exports.setDefault = async (req, res, next) => {
  try {
    // Unset any previous default
    await Address.updateMany({ user: req.user.id, isDefault: true }, { isDefault: false });
    // Set new default
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isDefault: true },
      { new: true }
    );
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json(address);
  } catch (err) {
    next(err);
  }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    // If deleted address was default, assign new default if any exist
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ user: req.user.id });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }
    res.json({ message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
};