/**
 * Validation middleware factory
 * @param {import('zod').ZodSchema} schema
 * @returns {Function} Express middleware
 */
export function validate(schema) {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      const errors = error.errors?.map(e => ({
        field: e.path.join('.'),
        message: e.message
      })) || [{ message: 'Validation error' }];

      res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }
  };
}
