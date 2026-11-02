// Central error handler — keeps OMDb/axios failures away from the stack trace.
function errorHandler(err, _req, res, _next) {
  console.error('❌ API error:', err.message || err);

  if (err.response) {
    // Upstream (OMDb) responded with a non-2xx status
    return res.status(502).json({
      success: false,
      message: 'The movie service returned an error. Please try again later.',
    });
  }

  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    return res.status(504).json({
      success: false,
      message: 'The movie service timed out. Please try again.',
    });
  }

  res.status(500).json({
    success: false,
    message: 'Something went wrong on our end. Please try again later.',
  });
}

module.exports = errorHandler;
