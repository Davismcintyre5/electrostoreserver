const express = require('express');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../../controllers/wishlistController');
const router = express.Router();

// All routes require authentication (already applied in customer/index.js)
router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;