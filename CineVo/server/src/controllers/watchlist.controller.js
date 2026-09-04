import Watchlist from "../models/Watchlist.js";
import WatchHistory from "../models/WatchHistory.js";
import { ApiError } from "../utils/ApiError.js";
const cleanBody = (b) => ({
  tmdbId: Number(b.tmdbId),
  mediaType: b.mediaType,
  title: b.title || "",
  posterPath: b.posterPath || "",
  date: new Date(b.date),
});
function validateItem(x) {
  if (!Number.isInteger(x.tmdbId) || x.tmdbId < 1)
    throw new ApiError(400, "Invalid TMDB ID");
  if (!["movie", "tv"].includes(x.mediaType))
    throw new ApiError(400, "Invalid media type");
  if (Number.isNaN(x.date.getTime())) throw new ApiError(400, "Invalid date");
}
export async function listWatched(req, res) {
  res.json({
    success: true,
    items: await WatchHistory.find({ user: req.user.id }).sort({ date: -1 }),
  });
}
export async function addWatched(req, res) {
  const x = cleanBody(req.body);
  validateItem(x);
  const item = await WatchHistory.findOneAndUpdate(
    { user: req.user.id, tmdbId: x.tmdbId, mediaType: x.mediaType },
    { $set: { ...x, user: req.user.id, status: "watched" } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  res.status(201).json({ success: true, item });
}
export async function addWatchedEpisode(req, res) {
  const x = cleanBody(req.body);
  validateItem(x);
  if (x.mediaType !== "tv" || !req.body.episode)
    throw new ApiError(400, "Valid TV episode data is required");
  const ep = {
    season: Number(req.body.episode.season),
    number: Number(req.body.episode.number),
    name: req.body.episode.name || "",
    stillPath: req.body.episode.stillPath || "",
  };
  const item = await WatchHistory.findOneAndUpdate(
    {
      user: req.user.id,
      tmdbId: x.tmdbId,
      mediaType: "tv",
      "episode.season": ep.season,
      "episode.number": ep.number,
    },
    { $set: { ...x, user: req.user.id, status: "watched", episode: ep } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  res.status(201).json({ success: true, item });
}
export async function removeWatchedEpisode(req, res) {
  const r = await WatchHistory.findOneAndDelete({
    user: req.user.id,
    tmdbId: req.params.tmdbId,
    mediaType: "tv",
    "episode.season": Number(req.params.season),
    "episode.number": Number(req.params.number),
  });
  if (!r) throw new ApiError(404, "Watched episode not found");
  res.json({ success: true });
}
export async function removeWatched(req, res) {
  const r = await WatchHistory.findOneAndDelete({
    user: req.user.id,
    tmdbId: req.params.tmdbId,
    mediaType: req.params.mediaType,
  });
  if (!r) throw new ApiError(404, "Watched item not found");
  res.json({ success: true });
}
export async function listScheduled(req, res) {
  res.json({
    success: true,
    items: await Watchlist.find({ user: req.user.id }).sort({ date: 1 }),
  });
}
export async function addScheduled(req, res) {
  const x = cleanBody(req.body);
  validateItem(x);
  const item = await Watchlist.findOneAndUpdate(
    { user: req.user.id, tmdbId: x.tmdbId, mediaType: x.mediaType },
    { $set: { ...x, user: req.user.id, status: "scheduled" } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  res.status(201).json({ success: true, item });
}
export async function addScheduledEpisode(req, res) {
  const x = cleanBody(req.body);
  validateItem(x);
  if (x.mediaType !== "tv" || !req.body.episode)
    throw new ApiError(400, "Valid TV episode data is required");
  const ep = {
    season: Number(req.body.episode.season),
    number: Number(req.body.episode.number),
    name: req.body.episode.name || "",
    stillPath: req.body.episode.stillPath || "",
  };
  const item = await Watchlist.findOneAndUpdate(
    {
      user: req.user.id,
      tmdbId: x.tmdbId,
      mediaType: "tv",
      "episode.season": ep.season,
      "episode.number": ep.number,
    },
    { $set: { ...x, user: req.user.id, status: "scheduled", episode: ep } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  res.status(201).json({ success: true, item });
}
export async function removeScheduledEpisode(req, res) {
  const r = await Watchlist.findOneAndDelete({
    user: req.user.id,
    tmdbId: req.params.tmdbId,
    mediaType: "tv",
    "episode.season": Number(req.params.season),
    "episode.number": Number(req.params.number),
  });
  if (!r) throw new ApiError(404, "Scheduled episode not found");
  res.json({ success: true });
}
export async function removeScheduled(req, res) {
  const r = await Watchlist.findOneAndDelete({
    user: req.user.id,
    tmdbId: req.params.tmdbId,
    mediaType: req.params.mediaType,
  });
  if (!r) throw new ApiError(404, "Scheduled item not found");
  res.json({ success: true });
}
export async function timeline(req, res) {
  const [watched, scheduled] = await Promise.all([
    WatchHistory.find({ user: req.user.id }).sort({ date: -1 }),
    Watchlist.find({ user: req.user.id }).sort({ date: 1 }),
  ]);
  res.json({ success: true, watched, scheduled });
}
