const express = require('express');
const { getSettings, updateSettings } = require('../../controllers/settingsController');
const roleCheck = require('../../middleware/roleCheck');
const router = express.Router();

router.get('/', getSettings);
router.put('/', roleCheck('admin'), updateSettings); // only admin can update settings

module.exports = router;