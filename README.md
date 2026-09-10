🎬 CineVo

A modern full-stack movie and TV discovery platform built with React,
Node.js, Express, MongoDB, and TMDB API.

CineVo lets users discover movies and TV shows, search for titles and
people, view detailed information, manage watchlists, track watched
content, schedule titles, and explore streaming availability and audio
languages.

✨ Features

🎬 Movie & TV show discovery

🔎 Search for movies, TV shows, and people

📈 Trending and popular content

🎭 Detailed movie/series pages with cast, genres, runtime, ratings,
and release information

❤️ Watchlist management

👀 Watched/history tracking

📅 Watch scheduling and timeline

🎲 Random movie/TV picker

🌍 Streaming availability by region

🔊 Audio-language availability

🔐 User registration, login, password reset, and authentication

🖼️ Image upload support with ImageKit

📱 Responsive modern UI

⚡ React SPA served through the Express backend in production

🛠️ Tech Stack

Frontend

React

Vite

Tailwind CSS

Axios

Backend

Node.js

Express.js

MongoDB / Mongoose

JWT authentication

HTTP-only cookies

Express Rate Limit

Helmet

CORS

APIs & Services

TMDB API --- movie and TV metadata

Streaming Availability API --- streaming and audio availability

Watchmode API

ImageKit --- image hosting/upload support

📁 Project Structure

CineVo/
├── client/
│   ├── src/
│   ├── public/
│   ├── dist/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   ├── uploads/
│   └── package.json
│
├── package.json
└── README.md

🚀 Run Locally

1. Clone the repository

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd CineVo

2. Install dependencies

npm run install:all

3. Configure environment variables

Create the required .env files using the provided .env.example
files.

Never commit real API keys, database credentials, JWT secrets, or
private keys to GitHub.

4. Start the application

npm run dev

🔑 Environment Variables

The backend uses environment variables for services such as:

MONGODB_URI
JWT_SECRET
TMDB_API_KEY
CLIENT_URL
NODE_ENV
IMAGEKIT_PRIVATE_KEY
IMAGEKIT_PUBLIC_KEY
IMAGEKIT_URL_ENDPOINT
WATCHMODE_API_KEY
STREAMING_AVAILABILITY_API_KEY

For the frontend, configure the API base URL through the project's Vite
environment configuration.

🏗️ Production Build

Build the frontend with:

npm run build

The production frontend is generated inside:

client/dist/

The Express server can serve the generated React application in the
single-service production setup.

🌐 Deployment

CineVo can be deployed as a single Node/Express web service with the
React production build served by Express.

Typical Render configuration:

Root Directory: CineVo
Build Command: npm run install:all && npm run build
Start Command: npm start

Set production environment variables in the hosting provider's dashboard
instead of committing secrets to the repository.

🔒 Security

JWT authentication with HTTP-only cookies

Secure production cookie configuration

CORS configured through environment variables

Helmet security middleware

Rate limiting on authentication endpoints

Secrets kept outside the source code

📌 API Health Check

The backend exposes:

/api/health

A successful response looks like:

{
  "success": true,
  "status": "ok"
}

🎯 Project Goal

CineVo is designed as a real-world full-stack entertainment platform
rather than a simple movie listing app, combining movie discovery, user
features, streaming information, watch tracking, and a modern responsive
experience in one application.

👨‍💻 Author

Kunal Kumar

Built with ❤️ while learning and developing full-stack web applications.

⭐ If you find CineVo interesting, consider giving the repository a
star!
