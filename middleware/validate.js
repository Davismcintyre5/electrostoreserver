// Simple validation middleware using Joi (install joi separately if needed)
// For brevity, we'll assume a generic validator; you can expand.
module.exports = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};