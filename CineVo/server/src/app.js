import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import movieRoutes from "./routes/movie.routes.js";
import watchRoutes from "./routes/watchlist.routes.js";
import imagekitRoutes from "./routes/imagekit.routes.js";
import watchmodeRoutes from "./routes/watchmode.routes.js";
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

/* ---------------- SECURITY ---------------- */

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
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
  express.static(path.resolve(__dirname, "../../uploads"))
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

// Vite build output:
// CineVo/server/client/dist
const clientDistPath = path.join(__dirname, "..", "client", "dist");

// Serve React/Vite static files
app.use(
  express.static(clientDistPath, {
    index: false,
  })
);

// React SPA fallback
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  return res.sendFile(path.join(clientDistPath, "index.html"));
});

/* ---------------- ERROR HANDLING ---------------- */

app.use(notFound);
app.use(errorHandler);

export default app;