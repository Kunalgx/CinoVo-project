import { Router } from "express";

import * as c from "../controllers/movie.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import {
  getAudio,
  filterAudioCandidates,
} from "../controllers/audio.controller.js";

import { availability } from "../controllers/watchmode.controller.js";

import {
  getAvailability,
  searchAvailability,
  searchAvailabilityByAudio
} from "../controllers/streamingAvailability.controller.js";

const r = Router();

// Health
r.get("/tmdb-health", asyncHandler(c.tmdbHealthCheck));

// General movie APIs
r.get("/trending", asyncHandler(c.trending));
r.get("/discover", asyncHandler(c.discover));
r.get("/search", asyncHandler(c.search));
r.get("/search/:type", asyncHandler(c.searchTyped));

// Collection / Person
r.get("/collection/:id", asyncHandler(c.collection));
r.get("/person/:id", asyncHandler(c.person));
r.get("/person/:id/combined_credits", asyncHandler(c.personCredits));

// Audio
r.get("/audio", asyncHandler(filterAudioCandidates));
r.get("/streaming-availability/search", asyncHandler(searchAvailability));
r.get("/streaming-availability/search-audio",asyncHandler(searchAvailabilityByAudio),);
// Specific movie / TV APIs
r.get("/:type/:id/audio", asyncHandler(getAudio));
r.get("/:type/:id/watchmode", asyncHandler(availability));
r.get(
  "/:type/:id/streaming-availability",
  asyncHandler(getAvailability),
);
r.get("/:type/:id/credits", asyncHandler(c.credits));
r.get("/:type/:id/providers", asyncHandler(c.providers));
r.get("/:type/:id/seasons/:season", asyncHandler(c.season));
r.get("/:type/:id/similar", asyncHandler(c.similar));

// Generic details route — ALWAYS LAST
r.get("/:type/:id", asyncHandler(c.details));

export default r;