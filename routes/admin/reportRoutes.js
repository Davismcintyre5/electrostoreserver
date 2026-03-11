const express = require('express');
const { getSalesReport, getTopProducts } = require('../../controllers/reportController');
const router = express.Router();

router.get('/sales', getSalesReport);
router.get('/top-products', getTopProducts);

module.exports = router;