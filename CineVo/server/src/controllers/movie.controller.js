import { tmdbHealth, tmdbService } from "../services/tmdb.service.js";
import { AudioAvailability } from "../models/AudioAvailability.js";

export const trending = async (req, res) =>
  res.json({
    success: true,
    data: await tmdbService.trending(),
  });

export const tmdbHealthCheck = async (req, res) => {
  const result = await tmdbHealth();

  res.status(result.ok ? 200 : 503).json({
    success: result.ok,
    data: result,
  });
};

export const discover = async (req, res) => {
  const {
    type = "all",
    page = 1,
    year,
    genre,
    audioLanguage,
    country,
    language,
    industry,
    minRating,
    quality,
    strict,
    popularity = "popular",
  } = req.query;

  const rating = Number(minRating);

  const minVotes =
    popularity === "high"
      ? 200
      : quality === "true"
        ? 25
        : 0;

  const knownLanguages = [
    "en",
    "hi",
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
  ];

  const genreForType = (genreId, mediaType) => {
    if (mediaType === "tv" && genreId === "28") return "10759";
    if (mediaType === "tv" && genreId === "878") return "10765";

    return genreId;
  };

  // -----------------------------------------
  // VERIFIED AUDIO LANGUAGE FILTER
  // -----------------------------------------

  const audioLanguageCode = String(audioLanguage || "")
    .trim()
    .toLowerCase();

  let audioRows = [];

  if (audioLanguageCode) {
    audioRows = await AudioAvailability.find({
      audioLanguages: audioLanguageCode,
      verified: true,
      ...(type === "movie" || type === "tv"
        ? { mediaType: type }
        : {}),
    })
      .select("tmdbId mediaType")
      .lean();
  }

  /*
   * IMPORTANT:
   * TMDB's language filter means ORIGINAL LANGUAGE.
   * It does NOT guarantee dubbed audio.
   *
   * Audio language is checked separately from our
   * manually verified AudioAvailability collection.
   */

  const industryRules = {
    hollywood: {
      origin: "US",
    },

    bollywood: {
      origin: "IN",
      languages: ["hi"],
    },

    "south-indian": {
      origin: "IN",
      languages: ["ta", "te", "ml", "kn"],
    },

    korean: {
      origin: "KR",
      languages: ["ko"],
    },

    japanese: {
      origin: "JP",
      languages: ["ja"],
    },

    spanish: {
      languages: ["es"],
    },
  };

  const industryRule = industryRules[industry];

  // -----------------------------------------
  // INDUSTRY + LANGUAGE VALIDATION
  // -----------------------------------------

  if (industryRule?.languages && language) {
    if (
      language !== "other" &&
      !industryRule.languages.includes(language)
    ) {
      return res.json({
        success: true,
        data: {
          results: [],
          page: Number(page),
          filterMessage: `No results: ${industry} does not match the selected original language.`,
        },
      });
    }

    if (language === "other") {
      return res.json({
        success: true,
        data: {
          results: [],
          page: Number(page),
          filterMessage: `No results: ${industry} does not match "Other" original language.`,
        },
      });
    }
  }

  if (
    industry === "international" &&
    language &&
    language !== "other"
  ) {
    return res.json({
      success: true,
      data: {
        results: [],
        page: Number(page),
        filterMessage:
          "International is for titles outside the supported language list.",
      },
    });
  }

  const getLanguageFilters = () => {
    if (industryRule?.languages) {
      return industryRule.languages;
    }

    if (language === "other") {
      return [null];
    }

    if (language) {
      return [language];
    }

    return [null];
  };

  const expectedOrigin =
    industryRule?.origin || country || null;

  // -----------------------------------------
  // STRICT TMDB RESULT CHECK
  // -----------------------------------------

  const matchesStrictResult = (item, mediaType) => {
    if (!item?.id) return false;

    if (item.media_type !== mediaType) {
      return false;
    }

    // Minimum rating
    if (
      Number.isFinite(rating) &&
      rating > 0 &&
      Number(item.vote_average || 0) < rating
    ) {
      return false;
    }

    // Minimum votes
    if (
      minVotes &&
      Number(item.vote_count || 0) < minVotes
    ) {
      return false;
    }

    // Genre
    if (genre) {
      const expectedGenre = Number(
        genreForType(genre, mediaType),
      );

      if (
        !Array.isArray(item.genre_ids) ||
        !item.genre_ids.includes(expectedGenre)
      ) {
        return false;
      }
    }

    // Original language
    if (
      language &&
      language !== "other" &&
      item.original_language !== language
    ) {
      return false;
    }

    // Other languages
    if (
      language === "other" &&
      knownLanguages.includes(item.original_language)
    ) {
      return false;
    }

    // International
    if (
      industry === "international" &&
      knownLanguages.includes(item.original_language)
    ) {
      return false;
    }

    // Origin country
    if (expectedOrigin) {
      const origins =
        item.origin_countries ||
        item.origin_country ||
        [];

      if (
        Array.isArray(origins) &&
        origins.length > 0 &&
        !origins.includes(expectedOrigin)
      ) {
        return false;
      }
    }

    // Industry language validation
    if (
      industry === "bollywood" &&
      item.original_language !== "hi"
    ) {
      return false;
    }

    if (
      industry === "south-indian" &&
      !["ta", "te", "ml", "kn"].includes(
        item.original_language,
      )
    ) {
      return false;
    }

    if (
      industry === "korean" &&
      item.original_language !== "ko"
    ) {
      return false;
    }

    if (
      industry === "japanese" &&
      item.original_language !== "ja"
    ) {
      return false;
    }

    if (
      industry === "spanish" &&
      item.original_language !== "es"
    ) {
      return false;
    }

    
  

    return true;
  };

  const verifyStrictCandidates = (
    candidates,
    mediaType,
  ) => {
    if (strict !== "true") {
      return candidates.filter((item) => {
        
        return true;
      });
    }

    return candidates
      .map((item) => ({
        ...item,

        origin_countries:
          item.origin_countries ||
          item.origin_country ||
          [],
      }))
      .filter((item) =>
        matchesStrictResult(item, mediaType),
      );
  };

  // -----------------------------------------
  // TMDB DISCOVER
  // -----------------------------------------

 const one = async (mediaType) => {
  const baseParams = {
    include_adult: false,

    sort_by:
      popularity === "high"
        ? "vote_average.desc"
        : "popularity.desc",

    ...(year
      ? mediaType === "movie"
        ? {
            primary_release_year: year,
          }
        : {
            first_air_date_year: year,
          }
      : {}),

    ...(genre
      ? {
          with_genres: genreForType(
            genre,
            mediaType,
          ),
        }
      : {}),

    ...(country
      ? {
          with_origin_country: country,
        }
      : {}),

    ...(industryRule?.origin
      ? {
          with_origin_country:
            industryRule.origin,
        }
      : {}),

    ...(industry === "international"
      ? {
          without_original_language:
            knownLanguages.join("|"),
        }
      : {}),

    ...(language === "other"
      ? {
          without_original_language:
            knownLanguages.join("|"),
        }
      : {}),

    ...(minVotes
      ? {
          vote_count_gte: minVotes,
        }
      : {}),

    ...(Number.isFinite(rating) && rating > 0
      ? {
          "vote_average.gte": rating,
        }
      : {}),
  };

  const languageFilters =
    getLanguageFilters();

  /*
   * AUDIO LANGUAGE FILTER
   *
   * When an audio language is selected,
   * MongoDB's verified audio collection
   * becomes the source of truth.
   *
   * We do NOT depend on TMDB discover pages
   * because a verified title may not appear
   * on the first few discover pages.
   */
  if (audioLanguageCode) {
    const verifiedRows =
      audioRows.filter(
        (row) =>
          row.mediaType === mediaType,
      );

    if (!verifiedRows.length) {
      return [];
    }

    const verifiedResults = [];

    for (const row of verifiedRows) {
      try {
        const item =
          await tmdbService.details(
            mediaType,
            row.tmdbId,
          );

        if (!item?.id) {
          continue;
        }

        const normalizedItem = {
          ...item,
          media_type: mediaType,
          audio_verified: true,
          audio_language:
            audioLanguageCode,
        };

        if (
          matchesStrictResult(
            normalizedItem,
            mediaType,
          )
        ) {
          verifiedResults.push(
            normalizedItem,
          );
        }
      } catch (error) {
        console.error(
          "Failed to load verified audio title",
          {
            tmdbId: row.tmdbId,
            mediaType,
            error: error.message,
          },
        );
      }
    }

    return verifiedResults;
  }

  /*
   * NORMAL TMDB DISCOVER
   *
   * Used when no audio-language filter
   * is selected.
   */

  const results = [];

  let successfulRequests = 0;
  let lastRequestError = null;

  /*
   * Only 2 pages are requested.
   * This avoids excessive TMDB requests.
   */

  for (
    const languageFilter of languageFilters
  ) {
    for (let i = 0; i < 2; i += 1) {
      const requestPage =
        Number(page) * 2 - 1 + i;

      try {
        const data =
          await tmdbService.discover(
            mediaType,
            {
              ...baseParams,

              ...(languageFilter
                ? {
                    with_original_language:
                      languageFilter,
                  }
                : {}),

              page: requestPage,
            },
          );

        successfulRequests += 1;

        results.push(
          ...(data.results || []).map(
            (item) => ({
              ...item,
              media_type: mediaType,
            }),
          ),
        );
      } catch (error) {
        lastRequestError = error;
      }
    }
  }

  if (
    !successfulRequests &&
    lastRequestError
  ) {
    throw lastRequestError;
  }

  return verifyStrictCandidates(
    results,
    mediaType,
  );
};

  // -----------------------------------------
  // MOVIE + TV
  // -----------------------------------------

  let items = [];

  if (type === "all") {
    const [movies, tv] =
      await Promise.all([
        one("movie"),
        one("tv"),
      ]);

    items = [
      ...movies,
      ...tv,
    ].sort(
      (a, b) =>
        (b.popularity || 0) -
        (a.popularity || 0),
    );
  } else {
    items = await one(type);
  }

  // -----------------------------------------
  // REMOVE DUPLICATES
  // -----------------------------------------

  const seen = new Set();

  items = items
    .filter((item) => {
      const key =
        `${item.media_type}:${item.id}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    })
    .slice(0, 50);

  const filterMessage =
    items.length === 0
      ? audioLanguageCode
        ? `No verified titles found with ${audioLanguageCode} audio.`
        : "No titles matched all selected filters."
      : null;

  // -----------------------------------------
  // RESPONSE
  // -----------------------------------------

  res.json({
    success: true,

    data: {
      results: items,
      page: Number(page),

      ...(audioLanguageCode
        ? {
          audioLanguage: audioLanguageCode,
          audioVerifiedOnly: true,
        }
        : {}),

      ...(filterMessage
        ? {
          filterMessage,
        }
        : {}),
    },
  });
};

// -----------------------------------------
// SEARCH
// -----------------------------------------

export const search = async (req, res) => {
  const data =
    await tmdbService.search({
      query: req.query.query,
      page: req.query.page || 1,
      include_adult: false,
    });

  res.json({
    success: true,
    data,
  });
};

export const searchTyped = async (
  req,
  res,
) => {
  const data =
    await tmdbService.searchTyped(
      req.params.type,
      {
        query: req.query.query,
        page: req.query.page || 1,
        include_adult: false,
      },
    );

  res.json({
    success: true,
    data,
  });
};

// -----------------------------------------
// DETAILS
// -----------------------------------------

export const details = async (
  req,
  res,
) => {
  res.json({
    success: true,
    data: await tmdbService.details(
      req.params.type,
      req.params.id,
    ),
  });
};

// -----------------------------------------
// CREDITS
// -----------------------------------------

export const credits = async (
  req,
  res,
) => {
  res.json({
    success: true,
    data: await tmdbService.credits(
      req.params.type,
      req.params.id,
    ),
  });
};

// -----------------------------------------
// PROVIDERS
// -----------------------------------------

export const providers = async (
  req,
  res,
) => {
  res.json({
    success: true,
    data: await tmdbService.providers(
      req.params.type,
      req.params.id,
      {
        watch_region:
          req.query.region || "US",
      },
    ),
  });
};

// -----------------------------------------
// SEASON
// -----------------------------------------

export const season = async (
  req,
  res,
) => {
  res.json({
    success: true,
    data: await tmdbService.season(
      req.params.id,
      req.params.season,
    ),
  });
};

// -----------------------------------------
// SIMILAR
// -----------------------------------------

export const similar = async (
  req,
  res,
) => {
  res.json({
    success: true,
    data: await tmdbService.similar(
      req.params.type,
      req.params.id,
    ),
  });
};

// -----------------------------------------
// COLLECTION
// -----------------------------------------

export const collection = async (
  req,
  res,
) => {
  res.json({
    success: true,
    data: await tmdbService.collection(
      req.params.id,
    ),
  });
};

// -----------------------------------------
// PERSON
// -----------------------------------------

export const person = async (
  req,
  res,
) => {
  res.json({
    success: true,
    data: await tmdbService.person(
      req.params.id,
    ),
  });
};

export const personCredits = async (
  req,
  res,
) => {
  res.json({
    success: true,
    data: await tmdbService.personCredits(
      req.params.id,
    ),
  });
};