const express = require('express');
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../../controllers/cartController');
const router = express.Router();

router.get('/', getCart);
router.post('/', addToCart);
router.put('/', updateCartItem); // update quantity
router.delete('/:productId', removeFromCart);

module.exports = router;