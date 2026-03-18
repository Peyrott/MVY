/**
 * Global error handler middleware
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Don't leak error details in production
  const isDev = process.env.NODE_ENV === 'development';

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message,
      ...(isDev && { stack: err.stack })
    });
  }

  // Supabase errors
  if (err.code?.startsWith('PGRST') || err.code?.startsWith('22')) {
    return res.status(400).json({
      message: 'Database error',
      ...(isDev && { details: err.message })
    });
  }

  // Default error
  res.status(500).json({
    message: 'Internal server error',
    ...(isDev && { stack: err.stack, message: err.message })
  });
}
