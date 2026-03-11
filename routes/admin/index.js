const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const roleCheck = require('../../middleware/roleCheck');

// Import controllers
const { getDashboardStats } = require('../../controllers/adminController');
const userRoutes = require('./userRoutes');
const productRoutes = require('./productRoutes');
const promoRoutes = require('./promoRoutes'); // <-- ensure this line exists
const orderRoutes = require('./orderRoutes');
const transactionRoutes = require('./transactionRoutes');
const customerRoutes = require('./customerRoutes');
const settingsRoutes = require('./settingsRoutes');
const reportRoutes = require('./reportRoutes');
const accountRoutes = require('./accountRoutes');

// All admin routes require authentication and admin/manager role
router.use(auth);
router.use(roleCheck('admin', 'manager'));

router.get('/dashboard/stats', getDashboardStats);

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/promos', promoRoutes); // <-- ensure this line exists
router.use('/orders', orderRoutes);
router.use('/transactions', transactionRoutes);
router.use('/customers', customerRoutes);
router.use('/settings', settingsRoutes);
router.use('/reports', reportRoutes);
router.use('/accounts', accountRoutes);

module.exports = router;