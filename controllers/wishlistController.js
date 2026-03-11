const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user's wishlist
// @route   GET /api/customer/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }
    res.json(wishlist);
  } catch (err) {
    next(err);
  }
};

// @desc    Add product to wishlist
// @route   POST /api/customer/wishlist
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }
    await wishlist.populate('products');
    res.json(wishlist);
  } catch (err) {
    next(err);
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/customer/wishlist/:productId
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
    await wishlist.save();
    await wishlist.populate('products');
    res.json(wishlist);
  } catch (err) {
    next(err);
  }
};