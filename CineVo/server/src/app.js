import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "node:path";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import watchRoutes from "./routes/watchlist.routes.js";
import imagekitRoutes from "./routes/imagekit.routes.js";
import watchmodeRoutes from "./routes/watchmode.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";
import { frontendDist, uploadsDirectory } from "./config/paths.js";

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
    // Render supplies this for a Web Service. CLIENT_URL remains useful for a
    // custom domain or non-Render deployment.
    process.env.CLIENT_URL || process.env.RENDER_EXTERNAL_URL,
    ...(process.env.NODE_ENV === "production"
      ? []
      : ["http://localhost:5173", "http://localhost:5174"]),
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
  express.static(uploadsDirectory)
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

app.use(
  express.static(frontendDist, {
    index: false,
    maxAge: "1y",
    immutable: true,
  }),
);

/* ---------------- REACT SPA FALLBACK ---------------- */

// API requests go to the normal error handler
// Everything else gets React's index.html
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  // A missing bundle, stylesheet, image, or upload must remain a 404. Sending
  // index.html (or a JSON API error) for it produces misleading MIME errors and
  // a blank React page in browsers.
  if (path.extname(req.path)) {
    return next();
  }

  return res.sendFile(path.join(frontendDist, "index.html"), (error) => {
    if (error) next(error);
  });
});

/* ---------------- ERROR HANDLING ---------------- */

app.use(notFound);
app.use(errorHandler);

export default app;
