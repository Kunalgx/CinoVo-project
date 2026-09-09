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
import {
  frontendAssets,
  frontendPublic,
  uploadsDirectory,
} from "./config/paths.js";

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

const assetStaticOptions = {
  maxAge: "1y",
  immutable: true,
};

// Keep asset requests completely separate from API and SPA routing. This is
// deliberately registered before every catch-all handler: /assets/*.js and
// /assets/*.css can only be served as files from server/public/assets.
app.use("/assets", express.static(frontendAssets, assetStaticOptions));
app.use("/assets", (req, res) =>
  res.status(404).type("text/plain").send("Frontend asset not found"),
);

// Other build files (for example favicon.ico) are served from server/public.
app.use(
  express.static(frontendPublic, {
    index: false,
    maxAge: "1h",
  }),
);

/* ---------------- REACT SPA FALLBACK ---------------- */

// API requests go to the normal error handler
// Everything else gets React's index.html
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  // A missing stylesheet/image/script must remain a regular frontend 404.
  // It must never reach the JSON API error middleware.
  if (path.extname(req.path)) {
    return res.status(404).type("text/plain").send("Frontend asset not found");
  }

  return res.sendFile(path.join(frontendPublic, "index.html"), (error) => {
    if (error) next(error);
  });
});

/* ---------------- ERROR HANDLING ---------------- */

app.use(notFound);
app.use(errorHandler);

export default app;
