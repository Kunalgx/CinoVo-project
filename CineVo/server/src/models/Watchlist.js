import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tmdbId: { type: Number, required: true },
    mediaType: { type: String, enum: ["movie", "tv"], required: true },
    title: { type: String, default: "" },
    posterPath: { type: String, default: "" },
    date: { type: Date, required: true },
    status: { type: String, enum: ["scheduled"], default: "scheduled" },
    episode: {
      season: { type: Number },
      number: { type: Number },
      name: { type: String },
      stillPath: { type: String },
    },
  },
  { timestamps: true },
);
schema.index({ user: 1, tmdbId: 1, mediaType: 1 });
schema.index(
  { user: 1, tmdbId: 1, "episode.season": 1, "episode.number": 1 },
  { unique: true, sparse: true },
);
export default mongoose.model("Watchlist", schema);
