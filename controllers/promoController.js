const Promo = require('../models/Promo');

// ==================== ADMIN METHODS ====================
exports.getAllPromos = async (req, res, next) => {
  try {
    const promos = await Promo.find().sort('-createdAt');
    res.json({ promos, pages: 1, total: promos.length });
  } catch (err) {
    next(err);
  }
};

exports.createPromo = async (req, res, next) => {
  try {
    const promo = await Promo.create(req.body);
    res.status(201).json(promo);
  } catch (err) {
    next(err);
  }
};

exports.updatePromo = async (req, res, next) => {
  try {
    const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!promo) return res.status(404).json({ message: 'Promo not found' });
    res.json(promo);
  } catch (err) {
    next(err);
  }
};

exports.deletePromo = async (req, res, next) => {
  try {
    const promo = await Promo.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promo not found' });
    res.json({ message: 'Promo deleted' });
  } catch (err) {
    next(err);
  }
};

// ==================== CUSTOMER METHODS ====================
exports.getActivePromos = async (req, res, next) => {
  try {
    const now = new Date();
    const promos = await Promo.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    });
    res.json(promos);
  } catch (err) {
    next(err);
  }
};

exports.validatePromo = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const promo = await Promo.findOne({ code, isActive: true });
    if (!promo) return res.status(400).json({ message: 'Invalid promo code' });

    const now = new Date();
    if (promo.validFrom > now || promo.validUntil < now) {
      return res.status(400).json({ message: 'Promo expired' });
    }
    if (promo.minOrderAmount && amount < promo.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount is ${promo.minOrderAmount}` });
    }
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ message: 'Promo usage limit reached' });
    }

    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = (promo.discountValue / 100) * amount;
    } else {
      discount = promo.discountValue;
    }
    res.json({ valid: true, discount, promo });
  } catch (err) {
    next(err);
  }
};