const performanceMonitor = (req, res, next) => {
  const start = Date.now();

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - start;

    // Log slow requests
    if (duration > 1000) {
      logger.warn({
        message: 'Slow request detected',
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
      });
    }

    // Add performance header
    res.set('X-Response-Time', `${duration}ms`);

    originalSend.call(this, data);
  };

  next();
};