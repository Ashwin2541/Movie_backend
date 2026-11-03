require('dotenv').config();

const express = require('express');
const cors = require('cors');

const movieRoutes = require('./src/routes/movieRoutes');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

const PORT = process.env.PORT
// Comma-separated list of allowed origins, e.g.
// CLIENT_URL=https://my-frontend.com,http://localhost:5174
const CLIENT_URLS = (
  process.env.CLIENT_URL
)
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

// Global middleware
app.use(cors({ origin: CLIENT_URLS }));
app.use(express.json());

// Request logger (simple)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'cinepulse-backend', uptime: process.uptime() });
});

app.use('/api/movies', movieRoutes);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🎬 CinePulse API running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
