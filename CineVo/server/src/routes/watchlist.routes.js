import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import * as c from "../controllers/watchlist.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const r = Router();
r.use(requireAuth);
r.get("/watched", asyncHandler(c.listWatched));
r.post("/watched", asyncHandler(c.addWatched));
r.post("/watched/episode", asyncHandler(c.addWatchedEpisode));
r.delete(
  "/watched/episode/:tmdbId/:season/:number",
  asyncHandler(c.removeWatchedEpisode),
);
r.delete("/watched/:mediaType/:tmdbId", asyncHandler(c.removeWatched));
r.get("/scheduled", asyncHandler(c.listScheduled));
r.post("/scheduled", asyncHandler(c.addScheduled));
r.post("/scheduled/episode", asyncHandler(c.addScheduledEpisode));
r.delete(
  "/scheduled/episode/:tmdbId/:season/:number",
  asyncHandler(c.removeScheduledEpisode),
);
r.delete("/scheduled/:mediaType/:tmdbId", asyncHandler(c.removeScheduled));
r.get("/timeline", asyncHandler(c.timeline));
export default r;
