const express = require('express');
const { getStaff, createStaff, updateStaff, deleteStaff } = require('../../controllers/userController');
const roleCheck = require('../../middleware/roleCheck');
const router = express.Router();

// Only admin can create/delete staff
router.get('/', getStaff);
router.post('/', roleCheck('admin'), createStaff);
router.put('/:id', roleCheck('admin'), updateStaff);
router.delete('/:id', roleCheck('admin'), deleteStaff);

module.exports = router;