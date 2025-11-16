// server/src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'API is working' });
});

// Posts routes
app.use('/api/posts', require('./routes/posts'));

// Error handling middleware (should be last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;


// // server/src/app.js
// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Basic health check route
// app.get('/health', (req, res) => {
//   res.json({ status: 'ok', message: 'Server is running' });
// });

// // API routes
// app.get('/api', (req, res) => {
//   res.json({ message: 'API is working' });
// });

// // Error handling middleware (should be last)
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.statusCode || 500).json({
//     success: false,
//     error: err.message || 'Internal Server Error',
//   });
// });

// module.exports = app;