const express = require('express');

const { search, getById } = require('../controllers/movieController');

const router = express.Router();

// GET /api/movies/search?q=avengers&page=1
router.get('/search', search);

// GET /api/movies/tt0848228
router.get('/:imdbID', getById);

module.exports = router;
