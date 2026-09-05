import dns from "node:dns";
import mongoose from "mongoose";
import WatchHistory from "../models/WatchHistory.js";
import Watchlist from "../models/Watchlist.js";

// Prefer IPv4 for external connections like MongoDB/TMDB.
dns.setDefaultResultOrder("ipv4first");

async function removeDuplicateRecords(Model) {
  const duplicateGroups = await Model.aggregate([
    { $sort: { updatedAt: -1, _id: -1 } },
    {
      $group: {
        _id: {
          user: "$user",
          tmdbId: "$tmdbId",
          mediaType: "$mediaType",
          season: "$episode.season",
          number: "$episode.number",
        },
        ids: { $push: "$_id" },
        count: { $sum: 1 },
      },
    },
    { $match: { count: { $gt: 1 } } },
  ]);

  await Promise.all(
    duplicateGroups.map(({ ids }) =>
      Model.deleteMany({
        _id: { $in: ids.slice(1) },
      }),
    ),
  );
}

async function migrateTrackingIndexes() {
  // Clean legacy duplicates before replacing the old non-unique indexes.
  await Promise.all([
    removeDuplicateRecords(WatchHistory),
    removeDuplicateRecords(Watchlist),
  ]);

  await Promise.all([
    WatchHistory.syncIndexes(),
    Watchlist.syncIndexes(),
  ]);
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  if (uri.startsWith("mongodb+srv://")) {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  await migrateTrackingIndexes();
}