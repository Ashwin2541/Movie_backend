
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const movieRoutes = require('./src/routes/movieRoutes');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Render automatically provides PORT
const PORT = process.env.PORT || 5000;

// Allowed frontend origins
const CLIENT_URLS = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

// Global middleware
app.use(cors({ origin: CLIENT_URLS }));
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'cinepulse-backend',
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/movies', movieRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`CinePulse API running on port ${PORT}`);
});
