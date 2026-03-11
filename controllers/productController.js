const Product = require('../models/Product');
const fs = require('fs');
const path = require('path');

// @desc    Get all products (public)
// @route   GET /api/customer/products
exports.getProducts = async (req, res, next) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const products = await Product.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort('-createdAt');
    const total = await Product.countDocuments(filter);
    res.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/customer/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// Admin: Create product
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    const product = await Product.create({
      name, description, price, category, stock, images
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// Admin: Update product
exports.updateProduct = async (req, res, next) => {
  try {
    const updates = req.body;
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map(file => `/uploads/${file.filename}`);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// Admin: Delete product
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    // Delete associated images
    if (product.images && product.images.length) {
      product.images.forEach(img => {
        const filepath = path.join(__dirname, '../public', img);
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      });
    }
    await product.remove();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};