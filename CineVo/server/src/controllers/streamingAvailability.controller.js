import {
  getStreamingAvailability,
  searchStreamingShows,
} from "../services/streamingAvailability.service.js";

const LANGUAGE_MAP = {
  hin: "hi",
  eng: "en",
  kor: "ko",
  jpn: "ja",
  tam: "ta",
  tel: "te",
  mal: "ml",
  kan: "kn",
  spa: "es",
  fra: "fr",
  deu: "de",
  zho: "zh",
};

const AUDIO_MAP = {
  hi: "hin",
  en: "eng",
  ta: "tam",
  te: "tel",
  ml: "mal",
  kn: "kan",
  ko: "kor",
  ja: "jpn",
  es: "spa",
  fr: "fra",
  de: "deu",
  zh: "zho",
};

export async function getAvailability(req, res) {
  const { type, id } = req.params;
  const country = (req.query.country || "in").toLowerCase();

  const data = await getStreamingAvailability(
    type,
    Number(id),
    country,
  );

  const options =
    data.streamingOptions?.[country] || [];

  const providers = options.map((option) => ({
    name: option.service?.name || "",
    serviceId: option.service?.id || "",

    audioLanguages: (option.audios || []).map(
      (audio) =>
        LANGUAGE_MAP[audio.language] ||
        audio.language,
    ),

    subtitles: (option.subtitles || []).map(
      (subtitle) =>
        subtitle.locale?.language ||
        subtitle.language ||
        "",
    ),
  }));

  const audioLanguages = [
    ...new Set(
      providers.flatMap(
        (provider) => provider.audioLanguages,
      ),
    ),
  ];

  res.json({
    success: true,
    data: {
      tmdbId: Number(id),
      mediaType: type,
      country,
      audioLanguages,
      providers,
      verified: true,
    },
  });
}

export async function searchAvailability(req, res) {
  const {
    country = "in",
    show_type,
    genres,
    show_original_language,
    catalogs,
    year,
    minRating,
    cursor,
  } = req.query;

  const filters = {
    country: country.toLowerCase(),
    series_granularity: "show",

    ...(show_type
      ? {
          show_type:
            show_type === "tv"
              ? "series"
              : show_type,
        }
      : {}),

    ...(genres ? { genres } : {}),

    ...(show_original_language
      ? { show_original_language }
      : {}),

    ...(catalogs ? { catalogs } : {}),

    ...(year
      ? {
          year_min: year,
          year_max: year,
        }
      : {}),

    ...(minRating
      ? {
          rating_min: Number(minRating) * 10,
        }
      : {}),

    ...(cursor ? { cursor } : {}),
  };

  const data = await searchStreamingShows(filters);

  res.json({
    success: true,
    data,
  });
}

export async function searchAvailabilityByAudio(req, res) {
  const {
    country = "in",
    audio = "hi",
    show_type,
    show_original_language,
    genres,
    catalogs,
    year,
    minRating,
    cursor,
  } = req.query;

  const countryCode = country.toLowerCase();

  const targetAudio =
    AUDIO_MAP[audio.toLowerCase()] ||
    audio.toLowerCase();

  const filters = {
    country: countryCode,
    series_granularity: "show",

    ...(show_type
      ? {
          show_type:
            show_type === "tv"
              ? "series"
              : show_type,
        }
      : {}),

    ...(show_original_language
      ? { show_original_language }
      : {}),

    ...(genres ? { genres } : {}),

    ...(catalogs ? { catalogs } : {}),

    ...(year
      ? {
          year_min: year,
          year_max: year,
        }
      : {}),

    ...(minRating
      ? {
          rating_min: Number(minRating) * 10,
        }
      : {}),

    ...(cursor ? { cursor } : {}),
  };

  const data = await searchStreamingShows(filters);

  const shows = (data.shows || []).filter((show) => {
    const options =
      show.streamingOptions?.[countryCode] || [];

    return options.some((option) =>
      (option.audios || []).some(
        (item) =>
          String(item.language).toLowerCase() ===
          targetAudio,
      ),
    );
  });

  res.json({
    success: true,
    data: {
      shows,
      audio: audio.toLowerCase(),
      country: countryCode,

      // Pagination
      nextCursor: data.nextCursor || null,
      hasMore: Boolean(data.hasMore),
    },
  });
}