const SystemSettings = require('../models/SystemSettings');

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await SystemSettings.getSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await SystemSettings.getSettings();
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (err) {
    next(err);
  }
};