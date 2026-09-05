import mongoose from "mongoose";

const audioAvailabilitySchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      required: true,
      index: true,
    },

    mediaType: {
      type: String,
      enum: ["movie", "tv"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    originalLanguage: {
      type: String,
      default: "",
    },

    audioLanguages: [
      {
        type: String,
        enum: [
          "hi",
          "en",
          "ta",
          "te",
          "ml",
          "kn",
          "ko",
          "ja",
          "es",
          "fr",
          "de",
          "zh",
        ],
      },
    ],

    providers: [
      {
        name: {
          type: String,
          trim: true,
        },

        audioLanguages: [
          {
            type: String,
            enum: [
              "hi",
              "en",
              "ta",
              "te",
              "ml",
              "kn",
              "ko",
              "ja",
              "es",
              "fr",
              "de",
              "zh",
            ],
          },
        ],
      },
    ],

    verified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

audioAvailabilitySchema.index(
  { tmdbId: 1, mediaType: 1 },
  { unique: true },
);

export const AudioAvailability = mongoose.model(
  "AudioAvailability",
  audioAvailabilitySchema,
);