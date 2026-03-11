const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

// Public routes
router.use('/products', require('./productRoutes'));
router.use('/promos', require('./promoRoutes')); // <-- must be present

// Protected routes (require customer auth)
router.use(auth);
router.use((req, res, next) => {
  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Customer access only' });
  }
  next();
});

router.use('/cart', require('./cartRoutes'));
router.use('/checkout', require('./checkoutRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/addresses', require('./addressRoutes'));
router.use('/wishlist', require('./wishlistRoutes'));
router.use('/notifications', require('./notificationRoutes'));

module.exports = router;