const express = require('express');
const { register, login, changePassword } = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.patch('/change-password', auth, changePassword);

module.exports = router;