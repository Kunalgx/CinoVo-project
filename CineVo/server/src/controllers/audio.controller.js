import { AudioAvailability } from "../models/AudioAvailability.js";
import { ApiError } from "../utils/ApiError.js";

const normalize = (value) => String(value || "").trim().toLowerCase();

export async function getAudio(req, res) {
  const tmdbId = Number(req.params.id);
  const mediaType = req.params.type;

  if (!Number.isInteger(tmdbId) || !["movie", "tv"].includes(mediaType)) {
    throw new ApiError(400, "Invalid media type or TMDB id");
  }

  const item = await AudioAvailability.findOne({
    tmdbId,
    mediaType,
  }).lean();

  res.json({
    success: true,
    data:
      item || {
        tmdbId,
        mediaType,
        audioLanguages: [],
        providers: [],
        verified: false,
        verifiedAt: null,
        message: "Audio-language availability has not been verified yet.",
      },
  });
}

export async function filterAudioCandidates(req, res) {
  const language = normalize(req.query.language);
  const type = req.query.type;

  if (!language) {
    throw new ApiError(400, "Audio language is required");
  }

  const query = {
    audioLanguages: language,
    verified: true,
  };

  if (["movie", "tv"].includes(type)) {
    query.mediaType = type;
  }

  const rows = await AudioAvailability.find(query)
    .select("tmdbId mediaType")
    .lean();

  res.json({
    success: true,
    data: {
      ids: rows,
    },
  });
}