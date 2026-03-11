const express = require('express');
const { createOrder } = require('../../controllers/orderController'); // customer createOrder
const router = express.Router();

router.post('/', createOrder);

module.exports = router;