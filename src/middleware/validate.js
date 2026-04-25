const validate = (schema) => (req, res, next) => {
  // Treat missing body (no Content-Type / empty request) as empty object
  // so Joi can properly report required-field errors instead of passing undefined
  const body = req.body !== undefined ? req.body : {};
  const { error, value } = schema.validate(body, { abortEarly: false, stripUnknown: true });
  if (error) return res.status(422).json({ error: 'Validation failed', details: error.details.map(d => d.message) });
  req.body = value;
  next();
};

module.exports = validate;
