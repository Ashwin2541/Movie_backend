# CinePulse Backend (Express + Node.js)

API layer for the CinePulse movie explorer. Proxies the [OMDb API](https://www.omdbapi.com/) so the API key stays server-side, and enriches search results with plot + IMDb rating (which OMDb's search endpoint omits) using an in-memory detail cache.

## Run

```bash
npm install
npm start        # http://localhost:5000
npm run dev      # auto-restart on changes (node --watch)
```

Configure `backend/.env` (copy from `.env.example`):

```env
PORT=5000
OMDB_API_KEY=af55e318
CLIENT_URL=http://localhost:5173,http://localhost:5174
```

## 🌐 Deploying (Render)

1. Push the `backend/` folder to Git and create a **Web Service** on [render.com](https://render.com)
2. Build command: `npm install` · Start command: `npm start`
3. In **Environment**, add:
   - `OMDB_API_KEY` — your OMDb key (`.env` is gitignored, so Render can't see it)
   - `CLIENT_URL` — your frontend URL(s), comma-separated (CORS)
4. Set the frontend's `VITE_API_URL` to `https://your-service.onrender.com/api`

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health check |
| GET | `/api/movies/search?q=<title>&page=<n>` | Search movies → `{ success, totalResults, movies[] }` |
| GET | `/api/movies/:imdbID` | Full movie details → `{ success, movie }` |

### Responses

- **200** — `{ "success": true, ... }`
- **404** — `{ "success": false, "message": "Movie not found. Try searching for another movie!" }`
- **400/422** — validation / OMDb logical errors
- **500/502/504** — server or upstream failures

## Structure

```
backend/
├── server.js                       # Express app, CORS, error handling
├── .env / .env.example
└── src/
    ├── routes/movieRoutes.js       # /api/movies/*
    ├── controllers/movieController.js
    ├── services/omdbService.js     # OMDb client + enrichment + cache
    └── middleware/                 # notFound, errorHandler
```
