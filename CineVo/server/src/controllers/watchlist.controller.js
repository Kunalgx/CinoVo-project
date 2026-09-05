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
const titleFilter = (user, x) => ({
  user,
  tmdbId: x.tmdbId,
  mediaType: x.mediaType,
  "episode.season": { $exists: false },
  "episode.number": { $exists: false },
});
const titleParamsFilter = (user, params) =>
  titleFilter(user, {
    tmdbId: Number(params.tmdbId),
    mediaType: params.mediaType,
  });

// Older databases may contain duplicate title records.  Keep the newest record
// when a title is saved, and remove the stale copies without touching episodes.
async function saveTitle(Model, user, status, x) {
  const filter = titleFilter(user, x);
  const item = await Model.findOneAndUpdate(
    filter,
    { $set: { ...x, user, status }, $unset: { episode: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  await Model.deleteMany({ ...filter, _id: { $ne: item._id } });
  return item;
}

async function saveEpisode(Model, user, status, x, episode) {
  const filter = {
    user,
    tmdbId: x.tmdbId,
    mediaType: "tv",
    "episode.season": episode.season,
    "episode.number": episode.number,
  };
  const item = await Model.findOneAndUpdate(
    filter,
    { $set: { ...x, user, status, episode } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  await Model.deleteMany({ ...filter, _id: { $ne: item._id } });
  return item;
}

function uniqueItems(items) {
  const found = new Set();
  return items.filter((item) => {
    const episode = item.episode;
    const key = `${item.mediaType}:${item.tmdbId}:${episode ? `${episode.season}:${episode.number}` : "title"}`;
    if (found.has(key)) return false;
    found.add(key);
    return true;
  });
}
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
    items: uniqueItems(
      await WatchHistory.find({ user: req.user.id, status: "watched" }).sort({
        date: -1,
      }),
    ),
  });
}
export async function addWatched(req, res) {
  const x = cleanBody(req.body);
  validateItem(x);
  const item = await saveTitle(WatchHistory, req.user.id, "watched", x);
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
  const item = await saveEpisode(WatchHistory, req.user.id, "watched", x, ep);
  res.status(201).json({ success: true, item });
}
export async function removeWatchedEpisode(req, res) {
  const r = await WatchHistory.deleteMany({
    user: req.user.id,
    tmdbId: req.params.tmdbId,
    mediaType: "tv",
    "episode.season": Number(req.params.season),
    "episode.number": Number(req.params.number),
  });
  if (!r.deletedCount) throw new ApiError(404, "Watched episode not found");
  res.json({ success: true });
}
export async function removeWatched(req, res) {
  const r = await WatchHistory.deleteMany(
    titleParamsFilter(req.user.id, req.params),
  );
  if (!r.deletedCount) throw new ApiError(404, "Watched item not found");
  res.json({ success: true });
}
export async function listScheduled(req, res) {
  res.json({
    success: true,
    items: uniqueItems(
      await Watchlist.find({ user: req.user.id, status: "scheduled" }).sort({
        date: 1,
      }),
    ),
  });
}
export async function addScheduled(req, res) {
  const x = cleanBody(req.body);
  validateItem(x);
  const item = await saveTitle(Watchlist, req.user.id, "scheduled", x);
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
  const item = await saveEpisode(Watchlist, req.user.id, "scheduled", x, ep);
  res.status(201).json({ success: true, item });
}
export async function removeScheduledEpisode(req, res) {
  const r = await Watchlist.deleteMany({
    user: req.user.id,
    tmdbId: req.params.tmdbId,
    mediaType: "tv",
    "episode.season": Number(req.params.season),
    "episode.number": Number(req.params.number),
  });
  if (!r.deletedCount) throw new ApiError(404, "Scheduled episode not found");
  res.json({ success: true });
}
export async function removeScheduled(req, res) {
  const r = await Watchlist.deleteMany(
    titleParamsFilter(req.user.id, req.params),
  );
  if (!r.deletedCount) throw new ApiError(404, "Scheduled item not found");
  res.json({ success: true });
}
export async function timeline(req, res) {
  const [watched, scheduled] = await Promise.all([
    WatchHistory.find({ user: req.user.id, status: "watched" }).sort({
      date: -1,
    }),
    Watchlist.find({ user: req.user.id, status: "scheduled" }).sort({
      date: 1,
    }),
  ]);
  res.json({
    success: true,
    watched: uniqueItems(watched),
    scheduled: uniqueItems(scheduled),
  });
}
