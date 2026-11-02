const omdbService = require('../services/omdbService');

const NOT_FOUND_MESSAGE = 'Movie not found. Try searching for another movie!';

/**
 * GET /api/movies/search?q=avengers&page=1
 */
async function search(req, res, next) {
  try {
    const q = (req.query.q || '').trim();
    const page = req.query.page;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a movie title to search (query param: q).',
      });
    }

    const data = await omdbService.searchMovies(q, page);

    if (data.Response === 'True') {
      return res.json({
        success: true,
        query: q,
        totalResults: Number(data.totalResults) || 0,
        movies: data.Search,
      });
    }

    // OMDb returned a logical error (e.g. "Movie not found!", "Too many results.")
    if (data.Error === 'Movie not found!' || data.Error === 'Incorrect IMDb ID.') {
      return res.status(404).json({ success: false, message: NOT_FOUND_MESSAGE });
    }

    return res.status(422).json({ success: false, message: data.Error || 'Unable to search movies.' });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/movies/tt0848228
 */
async function getById(req, res, next) {
  try {
    const { imdbID } = req.params;

    if (!/^tt\d+$/i.test(imdbID)) {
      return res.status(400).json({ success: false, message: 'Invalid movie id format.' });
    }

    const data = await omdbService.getMovieById(imdbID);

    if (data.Response === 'True') {
      return res.json({ success: true, movie: data });
    }

    if (data.Error === 'Movie not found!' || data.Error === 'Incorrect IMDb ID.') {
      return res.status(404).json({ success: false, message: NOT_FOUND_MESSAGE });
    }

    return res.status(422).json({ success: false, message: data.Error || 'Unable to fetch movie details.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { search, getById, NOT_FOUND_MESSAGE };
