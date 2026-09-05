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
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(__dirname, "../../uploads")));
app.get("/api/health", (req, res) => res.json({ success: true, status: "ok" }));
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
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/users", userRoutes);
app.use("/api/imagekit", imagekitRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/watchmode", watchmodeRoutes);
app.use("/api/watchlist", watchRoutes);
app.use(notFound);
app.use(errorHandler);
export default app;
