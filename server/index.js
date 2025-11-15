const express = require('express');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./utils/logger');
const performanceMonitor = require('./middleware/performanceMonitor');

const app = express();

// Add these middleware BEFORE your routes
app.use(requestLogger);
app.use(performanceMonitor);

// Your existing middleware
app.use(express.json());

// Your routes here
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));

// Add error handler AFTER all routes
app.use(errorHandler);

module.exports = app;