import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import watchRoutes from "./routes/watchlist.routes.js";
import imagekitRoutes from "./routes/imagekit.routes.js";
import watchmodeRoutes from "./routes/watchmode.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const app = express();

/* ---------------- SECURITY ---------------- */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

/* ---------------- CORS ---------------- */

const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.CLIENT_URL,
  ].filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

/* ---------------- UPLOADS ---------------- */

app.use(
  "/uploads",
  express.static(path.resolve("./uploads"))
);

/* ---------------- HEALTH CHECK ---------------- */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
  });
});

/* ---------------- RATE LIMIT ---------------- */

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/reset-password", authLimiter);

/* ---------------- API ROUTES ---------------- */

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/users", userRoutes);
app.use("/api/imagekit", imagekitRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/watchmode", watchmodeRoutes);
app.use("/api/watchlist", watchRoutes);

/* ---------------- FRONTEND ---------------- */

// React/Vite dist files are copied into server/public
app.use(express.static("./public"));

/* ---------------- REACT SPA FALLBACK ---------------- */

// API requests go to the normal error handler
// Everything else gets React's index.html
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  return res.sendFile(
    path.resolve("./public/index.html")
  );
});

/* ---------------- ERROR HANDLING ---------------- */

app.use(notFound);
app.use(errorHandler);

export default app;