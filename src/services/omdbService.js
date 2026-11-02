const axios = require('axios');

const OMDB_BASE_URL = 'https://www.omdbapi.com/';
const API_KEY = process.env.OMDB_API_KEY;
const DETAIL_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

if (!API_KEY) {
  console.warn('⚠️  OMDB_API_KEY is not set in .env — requests to OMDb will fail.');
}

const omdbClient = axios.create({
  baseURL: OMDB_BASE_URL,
  timeout: 10000,
});

/** imdbID → { data, expires } — avoids re-fetching full details on every search. */
const detailCache = new Map();

function getCached(id) {
  const hit = detailCache.get(id);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    detailCache.delete(id);
    return null;
  }
  return hit.data;
}

function setCached(id, data) {
  // Keep the cache bounded
  if (detailCache.size > 300) {
    const oldest = detailCache.keys().next().value;
    detailCache.delete(oldest);
  }
  detailCache.set(id, { data, expires: Date.now() + DETAIL_CACHE_TTL });
}

/**
 * Get full details for a single movie by imdbID (cached).
 * @param {string} imdbID - e.g. "tt0848228"
 * @returns {Promise<object>} Raw OMDb response
 */
async function getMovieById(imdbID) {
  const cached = getCached(imdbID);
  if (cached) return cached;

  const { data } = await omdbClient.get('/', {
    params: { apikey: API_KEY, i: imdbID, plot: 'full' },
  });

  if (data.Response === 'True') setCached(imdbID, data);
  return data;
}

/**
 * Search movies by title.
 * OMDb's search endpoint doesn't return Plot / IMDb rating, but the UI needs
 * both on cards — so we enrich each result with its full details (cached).
 * @param {string} title - Movie title to search
 * @param {string} [page] - Page number (OMDb returns 10 results per page)
 * @returns {Promise<object>} Raw OMDb response with enriched Search array
 */
async function searchMovies(title, page) {
  const params = { apikey: API_KEY, s: title };
  if (page) params.page = page;

  const { data } = await omdbClient.get('/', { params });

  if (data.Response === 'True' && Array.isArray(data.Search)) {
    const enriched = await Promise.all(
      data.Search.map(async (movie) => {
        try {
          const full = await getMovieById(movie.imdbID);
          if (full && full.Response === 'True') {
            return {
              ...movie,
              Plot: full.Plot,
              imdbRating: full.imdbRating,
              Genre: full.Genre,
              Runtime: full.Runtime,
            };
          }
        } catch (err) {
          // Enrichment is best-effort — never fail the whole search for one movie
          console.warn(`⚠️  Could not enrich ${movie.imdbID}: ${err.message}`);
        }
        return movie;
      })
    );
    data.Search = enriched;
  }

  return data;
}

module.exports = { searchMovies, getMovieById };
