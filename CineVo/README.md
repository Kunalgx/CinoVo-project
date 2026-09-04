# CineVo — Movie & TV Discovery

A production-style full-stack refactor of the original single-file CineVo app. The original app's dark cinematic UI, trending, browse filters, search suggestions, details, cast, providers, TV seasons/episodes, timeline, random picker, watched/scheduled tracking, pagination, responsive behavior and history interactions are preserved as the target behavior.

## Stack

- Client: React, Vite, Tailwind CSS, React Router, Axios
- Server: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Helmet, CORS, Zod, Multer
- TMDB stays external; MongoDB stores user/application data only.

## Structure

`client/` contains pages, reusable components, auth context, hooks and API services. `server/` contains controllers, models, routes, middleware, validators, services and configuration.

## Setup

1. Install Node.js 18+ and MongoDB.
2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI`, `JWT_SECRET`, `TMDB_API_KEY`, and `CLIENT_URL`. Optionally set `TMDB_PROXY` to a trusted private HTTPS proxy when the deployment host cannot reach TMDB directly.
3. Copy `client/.env.example` to `client/.env`.
4. Run `npm install` in the root, then `npm run install:all` (or install each workspace separately).
5. Start both apps with `npm run dev`.
6. Client: http://localhost:5173 — API: http://localhost:5000/api/health

## Deployment

Deploy the `server/` directory to a Node.js host with outbound HTTPS access to `api.themoviedb.org:443` and network access to MongoDB Atlas. Set these server environment variables in the host dashboard or secret manager:

- `PORT` (the platform-provided port, when required)
- `MONGODB_URI`
- `JWT_SECRET`
- `TMDB_API_KEY`
- `CLIENT_URL` (the deployed React origin)
- `TMDB_PROXY` (optional, a trusted private HTTPS proxy URL)

Never put `TMDB_API_KEY`, `MONGODB_URI`, or `JWT_SECRET` in the client environment. After deployment, check `/api/health` and `/api/movies/tmdb-health`. A healthy TMDB response reports `status: "reachable"`; local network restrictions do not indicate a code or key failure.

For the deployed frontend, set `client/.env` before building:

```text
VITE_API_URL=https://your-api-host.example.com/api
```

Then run `npm run build` in `client/` and deploy `client/dist/` to a static host. Set the backend `CLIENT_URL` to the exact frontend origin so credentialed requests and authentication cookies are accepted.

## Security

The TMDB key is backend-only. JWT is kept in an HTTP-only cookie. Passwords are bcrypt-hashed, auth endpoints are rate limited, input is validated, and production errors do not expose stack traces.

## API

Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
Movies: `/api/movies/trending`, `/discover`, `/search`, details/credits/providers/seasons/similar/collection endpoints.
User: `/api/user/profile`, `/api/user/avatar`.
Tracking: `/api/watchlist/watched`, `/scheduled`, `/timeline` with CRUD-style operations.

## Notes

- The supplied HTML contained a live TMDB API key. This refactor intentionally does not copy that secret into the project; put your own key in `server/.env`.
- The original app gathered three TMDB pages to create up to 50 browse candidates and three pages per media type for random selection; the backend keeps the equivalent multi-page approach.
