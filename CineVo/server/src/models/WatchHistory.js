import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tmdbId: {
      type: Number,
      required: true,
    },

    mediaType: {
      type: String,
      enum: ["movie", "tv"],
      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    posterPath: {
      type: String,
      default: "",
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["watched"],
      default: "watched",
    },

    episode: {
      season: {
        type: Number,
      },

      number: {
        type: Number,
      },

      name: {
        type: String,
      },

      stillPath: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("WatchHistory", schema);