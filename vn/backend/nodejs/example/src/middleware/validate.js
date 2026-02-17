/**
 * Simple validation middleware (no external lib).
 * rules: object { fieldName: { required, type, minLength, maxLength, pattern } }
 */
function validate(rules) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      if (value === undefined) continue;

      if (rule.type && typeof value !== rule.type) {
        errors.push(`${field} must be a ${rule.type}`);
      }
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        errors.push(`${field} must be at most ${rule.maxLength} characters`);
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${field} has invalid format`);
      }
    }

    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
    }
    next();
  };
}

module.exports = validate;
