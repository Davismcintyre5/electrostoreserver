const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

// All admin routes require authentication and admin/manager role
router.use(auth);
router.use(roleCheck('admin', 'manager'));

router.use('/users', require('./userRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/promos', require('./promoRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/transactions', require('./transactionRoutes'));
router.use('/customers', require('./customerRoutes'));
router.use('/settings', require('./settingsRoutes'));
router.use('/reports', require('./reportRoutes'));

module.exports = router;