import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { movieService } from "../services/movieService";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { img, titleOf, year } from "../utils/tmdb";
import Loading from "../components/Loading";

const INDUSTRIES = [
  ["", "Any"],
  ["hollywood", "Hollywood"],
  ["bollywood", "Bollywood"],
  ["south-indian", "South Indian"],
  ["korean", "K-Drama / Korean"],
  ["japanese", "Japanese"],
  ["spanish", "Spanish"],
  ["international", "Other International"],
];

const AUDIO_LANGUAGES = [
  ["", "Any Audio Language"],
  ["hi", "Hindi Audio"],
  ["en", "English Audio"],
  ["ta", "Tamil Audio"],
  ["te", "Telugu Audio"],
  ["ml", "Malayalam Audio"],
  ["kn", "Kannada Audio"],
  ["ko", "Korean Audio"],
  ["ja", "Japanese Audio"],
  ["es", "Spanish Audio"],
  ["fr", "French Audio"],
];

const GENRES = [
  ["", "Any Genre"],
  ["28", "Action"],
  ["12", "Adventure"],
  ["35", "Comedy"],
  ["18", "Drama"],
  ["27", "Horror"],
  ["10749", "Romance"],
  ["53", "Thriller"],
  ["878", "Sci-Fi"],
  ["14", "Fantasy"],
  ["16", "Animation"],
  ["99", "Documentary"],
];

const RATINGS = [
  ["", "Any Rating"],
  ["6", "6+"],
  ["7", "7+"],
  ["7.5", "7.5+"],
  ["8", "8+"],
  ["8.5", "8.5+"],
];

const LANGUAGES = [
  ["", "Any Original Language"],
  ["en", "English"],
  ["hi", "Hindi"],
  ["ta", "Tamil"],
  ["te", "Telugu"],
  ["ml", "Malayalam"],
  ["kn", "Kannada"],
  ["ko", "Korean"],
  ["ja", "Japanese"],
  ["es", "Spanish"],
  ["fr", "French"],
  ["de", "German"],
  ["zh", "Chinese"],
  ["other", "Other"],
];

const LANGUAGE_NAMES = {
  ko: "Korean",
  ja: "Japanese",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  kn: "Kannada",
  es: "Spanish",
  en: "English",
  fr: "French",
  de: "German",
  zh: "Chinese",
};

const AUDIO_LANGUAGE_NAMES = {
  hi: "Hindi",
  en: "English",
  ta: "Tamil",
  te: "Telugu",
  ml: "Malayalam",
  kn: "Kannada",
  ko: "Korean",
  ja: "Japanese",
  es: "Spanish",
  fr: "French",
};

const KNOWN_LANGUAGE_CODES = Object.keys(LANGUAGE_NAMES);

const INDUSTRY_ORIGINS = {
  hollywood: "US",
  bollywood: "IN",
  "south-indian": "IN",
  korean: "KR",
  japanese: "JP",
};

const genreForType = (genre, mediaType) =>
  mediaType === "tv" && genre === "28"
    ? 10759
    : mediaType === "tv" && genre === "878"
      ? 10765
      : Number(genre);

function matchesSelectedFilters(item, filters) {
  if (
    !item ||
    !["movie", "tv"].includes(item.media_type) ||
    !item.id ||
    !item.poster_path ||
    !titleOf(item)
  ) {
    return false;
  }

  if (
    filters.type !== "all" &&
    item.media_type !== filters.type
  ) {
    return false;
  }

  if (
    Number(item.vote_average) <= 0 ||
    Number(item.vote_count) < 25
  ) {
    return false;
  }

  if (
    filters.minRating &&
    Number(item.vote_average) <
      Number(filters.minRating)
  ) {
    return false;
  }

  if (
    filters.genre &&
    !(item.genre_ids || []).includes(
      genreForType(
        filters.genre,
        item.media_type,
      ),
    )
  ) {
    return false;
  }

  if (
    filters.language === "other" &&
    KNOWN_LANGUAGE_CODES.includes(
      item.original_language,
    )
  ) {
    return false;
  }

  if (
    filters.language &&
    filters.language !== "other" &&
    item.original_language !== filters.language
  ) {
    return false;
  }

  if (filters.audioLanguage) {
    const targetAudio =
      AUDIO_API_CODES[filters.audioLanguage] ||
      filters.audioLanguage;

    if (
      !item.audio_verified ||
      !(item.audio_languages || []).includes(
        targetAudio,
      )
    ) {
      return false;
    }
  }

  const origins =
    item.origin_countries ||
    item.origin_country ||
    [];

  const expectedOrigin =
    INDUSTRY_ORIGINS[filters.industry];

  if (
    expectedOrigin &&
    origins.length &&
    !origins.includes(expectedOrigin)
  ) {
    return false;
  }

  if (
    filters.industry === "bollywood" &&
    item.original_language !== "hi"
  ) {
    return false;
  }

  if (
    filters.industry === "south-indian" &&
    !["ta", "te", "ml", "kn"].includes(
      item.original_language,
    )
  ) {
    return false;
  }

  if (
    filters.industry === "korean" &&
    item.original_language !== "ko"
  ) {
    return false;
  }

  if (
    filters.industry === "japanese" &&
    item.original_language !== "ja"
  ) {
    return false;
  }

  if (
    filters.industry === "spanish" &&
    item.original_language !== "es"
  ) {
    return false;
  }

  if (
    filters.industry === "international" &&
    KNOWN_LANGUAGE_CODES.includes(
      item.original_language,
    )
  ) {
    return false;
  }

  return true;
}
const AUDIO_API_CODES = {
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
};

const STREAMING_GENRE_IDS = {
  "28": "action",
  "12": "adventure",
  "35": "comedy",
  "18": "drama",
  "27": "horror",
  "10749": "romance",
  "53": "thriller",
  "878": "scifi",
  "14": "fantasy",
  "16": "animation",
  "99": "documentary",
};

const INDUSTRY_LANGUAGES = {
  hollywood: ["en"],
  bollywood: ["hi"],
  "south-indian": ["ta", "te", "ml", "kn"],
  korean: ["ko"],
  japanese: ["ja"],
  spanish: ["es"],
};

const pickImage = (imageSet, groupName) => {
  const group = imageSet?.[groupName];
  if (!group || typeof group !== "object") return null;

  return (
    group.w720 ||
    group.w1080 ||
    group.w480 ||
    group.w360 ||
    group.w240 ||
    group.w600 ||
    Object.values(group).find(
      (value) => typeof value === "string" && value.startsWith("http"),
    ) ||
    null
  );
};

function normalizeStreamingShow(show, fallbackLanguage = "") {
  const [rawType, rawId] = String(show?.tmdbId || "").split("/");
  const id = Number(rawId);

  if (!id || !["movie", "tv"].includes(rawType)) {
    return null;
  }

  const mediaType = rawType === "tv" ? "tv" : "movie";
  const genreNames = Array.isArray(show.genres)
    ? show.genres
        .map((genre) => genre?.name || genre?.id || "")
        .filter(Boolean)
    : [];

  const genreIds = genreNames
    .map((name) => {
      const normalized = String(name).toLowerCase();
      const match = Object.entries(STREAMING_GENRE_IDS).find(
        ([, slug]) =>
          slug === normalized ||
          slug.replace("-", " ") === normalized,
      );
      return match ? Number(match[0]) : null;
    })
    .filter((value) => value !== null);

  const releaseYear =
    mediaType === "tv"
      ? show.firstAirYear
      : show.releaseYear;

  const originalLanguage =
    show.originalLanguage ||
    show.original_language ||
    fallbackLanguage ||
    "";

  const countryCodes = Array.isArray(show.originCountries)
    ? show.originCountries
        .map((country) =>
          typeof country === "string"
            ? country
            : country?.countryCode || country?.code || "",
        )
        .filter(Boolean)
    : [];

  return {
    id,
    media_type: mediaType,

    title: mediaType === "movie" ? show.title : undefined,
    name: mediaType === "tv" ? show.title : undefined,

    original_language: originalLanguage,
    overview: show.overview || "",

    poster_path: pickImage(show.imageSet, "verticalPoster"),
    backdrop_path: pickImage(show.imageSet, "horizontalBackdrop"),

    vote_average: Number(show.rating || 0) / 10,
    vote_count: Number(show.voteCount || 25),

    release_date:
      mediaType === "movie" && releaseYear
        ? `${releaseYear}-01-01`
        : "",

    first_air_date:
      mediaType === "tv" && releaseYear
        ? `${releaseYear}-01-01`
        : "",

    genre_ids: genreIds,
    genre_names: genreNames,

    origin_countries: countryCodes,

    audio_verified: true,
    audio_languages: Array.from(
      new Set(
        Object.values(show.streamingOptions || {})
          .flat()
          .flatMap((option) =>
            (option.audios || []).map((audio) => audio.language),
          ),
      ),
    ),
  };
}

function matchesStreamingIndustry(item, industry) {
  if (!industry) return true;

  const allowedLanguages = INDUSTRY_LANGUAGES[industry];

  if (allowedLanguages) {
    return allowedLanguages.includes(item.original_language);
  }

  if (industry === "international") {
    return !KNOWN_LANGUAGE_CODES.includes(item.original_language);
  }

  return true;
}

function weightedPick(candidates) {
  const weights = candidates.map((item) => {
    const rating = Number(
      item.vote_average || 0,
    );

    const votes = Number(
      item.vote_count || 0,
    );

    return (
      Math.pow(rating, 6) *
      (
        0.25 +
        0.75 *
          Math.min(
            1,
            Math.log10(votes + 1) / 4,
          )
      )
    );
  });

  const total = weights.reduce(
    (sum, weight) => sum + weight,
    0,
  );

  let cursor = Math.random() * total;

  for (
    let index = 0;
    index < candidates.length;
    index += 1
  ) {
    cursor -= weights[index];

    if (cursor <= 0) {
      return candidates[index];
    }
  }

  return candidates[candidates.length - 1];
}

const imageSrc = (value) =>
  value
    ? /^https?:\/\//i.test(value)
      ? value
      : img(value)
    : "";

export default function RandomPicker() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [type, setType] = useState("all");

  const [industry, setIndustry] =
    useState("");

  const [language, setLanguage] =
    useState("");

  const [audioLanguage, setAudioLanguage] =
    useState("");

  const [genre, setGenre] =
    useState("");

  const [minRating, setMinRating] =
    useState("");

  const [excludeW, setExcludeW] =
    useState(true);

  const [excludeS, setExcludeS] =
    useState(true);

  const [result, setResult] =
    useState(null);

  const [used, setUsed] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const resetCandidates = () => {
    setUsed([]);
    setResult(null);
    setError("");
  };

  const selectedLabel = (list, value) =>
    list.find(([key]) => key === value)?.[1];

  const pick = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const types =
        type === "all"
          ? ["movie", "tv"]
          : [type];

      const filters = {
        type,
        industry,
        language,
        audioLanguage,
        genre,
        minRating,
      };

      let all = [];
      let backendMessage = "";

     if (audioLanguage) {
  const requestedLanguages =
    language && language !== "other"
      ? [language]
      : industry === "south-indian"
        ? INDUSTRY_LANGUAGES["south-indian"]
        : industry && INDUSTRY_LANGUAGES[industry]
          ? INDUSTRY_LANGUAGES[industry]
          : [""];

  for (const mediaType of types) {
    for (const originalLanguage of requestedLanguages) {
      let cursor = null;
      let pageCount = 0;

      // Fetch multiple API pages so Hindi Audio
      // is not limited to the first 20 results.
      while (pageCount < 5) {
        const response =
          await movieService.searchAudio({
            country: "in",
            audio: audioLanguage,
            show_type:
              mediaType === "tv"
                ? "series"
                : "movie",

            ...(originalLanguage
              ? {
                  show_original_language:
                    originalLanguage,
                }
              : {}),

            ...(minRating
              ? {
                  minRating,
                }
              : {}),

            ...(cursor ? { cursor } : {}),
          });

        const data =
          response?.data?.data || {};

        const shows = data.shows || [];

        const normalized = shows
          .map((show) =>
            normalizeStreamingShow(
              show,
              originalLanguage,
            ),
          )
          .filter(Boolean);

        all.push(...normalized);

        pageCount += 1;

        const nextCursor =
          data.nextCursor || null;

        if (!data.hasMore || !nextCursor) {
          break;
        }

        cursor = nextCursor;
      }
    }
  }

  // Remove duplicate movie/TV results.
  const unique = new Map(
    all.map((item) => [
      `${item.media_type}:${item.id}`,
      item,
    ]),
  );

  all = await Promise.all(
    [...unique.values()].map(
      async (item) => {
        try {
          const response =
            await movieService.details(
              item.media_type,
              item.id,
            );

          const details =
            response?.[0]?.data?.data ||
            response?.data?.data ||
            {};

          return {
            ...item,
            ...details,

            media_type:
              item.media_type,

            id: item.id,

            // Keep live audio information from
            // Streaming Availability API.
            audio_verified: true,

            audio_languages:
              item.audio_languages || [],

            poster_path:
              details.poster_path ||
              item.poster_path,

            backdrop_path:
              details.backdrop_path ||
              item.backdrop_path,

            genre_names:
              details.genres?.map(
                (genreItem) =>
                  genreItem.name,
              ) || item.genre_names,

            genre_ids:
              details.genres?.map(
                (genreItem) =>
                  Number(genreItem.id),
              ) || item.genre_ids,

            origin_countries:
              details.origin_country ||
              details.origin_countries ||
              item.origin_countries,
          };
        } catch {
          return item;
        }
      },
    ),
  );
} else {
        // Keep the existing TMDB flow completely unchanged
        // when no audio filter is selected.
        const responses = [];

        for (const mediaType of types) {
          for (const page of [1, 2]) {
            const response =
              await movieService.discover({
                type: mediaType,
                page,
                genre,
                industry,
                language,
                minRating,
                quality: true,
                strict: true,
              });

            responses.push(response);
          }
        }

        all = responses.flatMap(
          (response) =>
            response?.data?.data?.results || [],
        );

        backendMessage = responses
          .map(
            (response) =>
              response?.data?.data?.filterMessage,
          )
          .find(Boolean);
      }

      if (
        backendMessage &&
        !all.length
      ) {
        setError(backendMessage);
        return;
      }

      const [
        watchedResponse,
        scheduledResponse,
      ] = await Promise.all([
        excludeW && user
          ? userService.watched()
          : Promise.resolve({
              data: { items: [] },
            }),

        excludeS && user
          ? userService.scheduled()
          : Promise.resolve({
              data: { items: [] },
            }),
      ]);

      const watched =
        watchedResponse?.data?.items || [];

      const scheduled =
        scheduledResponse?.data?.items || [];

      const seen = new Set(used);

      const candidates = all.filter(
        (item) => {
          const key =
            `${item.media_type}:${item.id}`;

          if (seen.has(key)) {
            return false;
          }

          if (
            !matchesSelectedFilters(
              item,
              filters,
            )
          ) {
            return false;
          }

          const alreadyWatched =
            watched.some(
              (record) =>
                record.tmdbId === item.id &&
                record.mediaType ===
                  item.media_type,
            );

          const alreadyScheduled =
            scheduled.some(
              (record) =>
                record.tmdbId === item.id &&
                record.mediaType ===
                  item.media_type,
            );

          if (
            excludeW &&
            alreadyWatched
          ) {
            return false;
          }

          if (
            excludeS &&
            alreadyScheduled
          ) {
            return false;
          }

          seen.add(key);
          return true;
        },
      );

      if (!candidates.length) {
        setUsed([]);
        setResult(null);

        const activeFilters = [
          selectedLabel(
            INDUSTRIES,
            industry,
          ),
          selectedLabel(
            LANGUAGES,
            language,
          ),
          selectedLabel(
            AUDIO_LANGUAGES,
            audioLanguage,
          ),
          selectedLabel(
            GENRES,
            genre,
          ),
          selectedLabel(
            RATINGS,
            minRating,
          ),
          type === "all"
            ? ""
            : type === "tv"
              ? "TV Shows"
              : "Movies",
        ].filter(
          (label) =>
            label &&
            ![
              "Any",
              "Any Original Language",
              "Any Audio Language",
              "Any Genre",
              "Any Rating",
            ].includes(label),
        );

        setError(
          `No matching titles found. ${
            activeFilters.length
              ? `These filters may be too restrictive: ${activeFilters.join(", ")}.`
              : "Try choosing a genre, original language, audio language, industry, or rating."
          }`,
        );

        return;
      }

      const selected =
        weightedPick(candidates);

      setUsed((current) => [
        ...current,
        `${selected.media_type}:${selected.id}`,
      ]);

      setResult(selected);
    } catch (pickError) {
      setResult(null);

      const message =
        pickError?.response?.data?.message ||
        pickError?.response?.data?.data?.message ||
        pickError?.message ||
        "Unknown error";

      setError(
        audioLanguage
          ? `Unable to check live audio availability: ${message}`
          : `Unable to reach TMDB: ${message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const displayResult =
    result &&
    matchesSelectedFilters(
      result,
      {
        type,
        industry,
        language,
        audioLanguage,
        genre,
        minRating,
      },
    )
      ? result
      : null;

  return (
    <main className="mx-auto min-h-[calc(100vh-70px)] max-w-3xl p-5">
      <div className="rounded-2xl border border-cine-border bg-cine-panel p-5">
        <h1 className="text-2xl font-black">
          Random Picker
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Let CineVo find a well-reviewed
          title for you.
        </p>

        <h3 className="mt-6 text-xs font-extrabold uppercase tracking-widest text-slate-500">
          What do you want to watch?
        </h3>

        <div className="mt-2 flex flex-wrap gap-2">
          {[
            ["all", "Movies + TV Shows"],
            ["movie", "Movies"],
            ["tv", "TV Shows"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setType(value);
                resetCandidates();
              }}
              className={`rounded-lg border border-cine-border px-3 py-2 text-xs ${
                type === value
                  ? "bg-cine-gold text-black"
                  : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PickerSelect
            label="Industry / Region"
            value={industry}
            options={INDUSTRIES}
            onChange={(value) => {
              setIndustry(value);
              resetCandidates();
            }}
          />

          <PickerSelect
            label="Original Language"
            value={language}
            options={LANGUAGES}
            onChange={(value) => {
              setLanguage(value);
              resetCandidates();
            }}
          />

          <PickerSelect
            label="Audio Language"
            value={audioLanguage}
            options={AUDIO_LANGUAGES}
            onChange={(value) => {
              setAudioLanguage(value);
              resetCandidates();
            }}
          />

          <PickerSelect
            label="Genre"
            value={genre}
            options={GENRES}
            onChange={(value) => {
              setGenre(value);
              resetCandidates();
            }}
          />

          <PickerSelect
            label="Minimum Rating"
            value={minRating}
            options={RATINGS}
            onChange={(value) => {
              setMinRating(value);
              resetCandidates();
            }}
          />
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Original Language means the title's
          original language. Audio Language means
          verified dubbed/audio availability.
        </p>

        <label className="mt-5 block text-sm">
          <input
            type="checkbox"
            checked={excludeW}
            onChange={(event) =>
              setExcludeW(
                event.target.checked,
              )
            }
          />{" "}
          <span className="ml-2">
            Don't pick something I've already
            watched
          </span>
        </label>

        <label className="mt-2 block text-sm">
          <input
            type="checkbox"
            checked={excludeS}
            onChange={(event) =>
              setExcludeS(
                event.target.checked,
              )
            }
          />{" "}
          <span className="ml-2">
            Don't pick something already
            scheduled
          </span>
        </label>

        <button
          disabled={loading}
          onClick={pick}
          className="mt-5 w-full rounded-lg bg-white py-3 font-black text-black disabled:opacity-60"
        >
          {loading
            ? "Finding something for you..."
            : "PICK FOR ME"}
        </button>

        {error && (
          <p className="mt-4 text-sm text-red-300">
            {error}
          </p>
        )}

        {loading && (
          <Loading
            text={
              audioLanguage
                ? "Checking live dubbed-audio availability..."
                : "Building a quality candidate pool..."
            }
          />
        )}

        {displayResult && (
          <button
            onClick={() =>
              nav(
                `/${displayResult.media_type}/${displayResult.id}`,
              )
            }
            className="mt-4 flex w-full gap-3 rounded-xl border border-cine-border bg-[#181c24] p-3 text-left"
          >
            <img
              src={imageSrc(displayResult.poster_path)}
              alt={titleOf(displayResult)}
              className="h-32 w-22 rounded-lg object-cover"
            />

            <span className="min-w-0">
              <b className="block text-lg">
                {titleOf(displayResult)}
              </b>

              <div className="mt-2 text-xs text-slate-400">
                {displayResult.media_type.toUpperCase()}{" "}
                · {year(displayResult)} ·{" "}
                <span className="text-cine-gold">
                  ★{" "}
                  {Number(
                    displayResult.vote_average,
                  ).toFixed(1)}
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-500">
                {displayResult.genre_names?.join(
                  ", ",
                ) ||
                  selectedLabel(
                    GENRES,
                    genre,
                  ) ||
                  "Genre unavailable"}
              </div>

              <div className="mt-1 text-xs text-slate-500">
                Original Language:{" "}
                {LANGUAGE_NAMES[
                  displayResult
                    .original_language
                ] ||
                  displayResult
                    .original_language
                    ?.toUpperCase() ||
                  "Unavailable"}
              </div>

              {audioLanguage && (
                <div className="mt-1 text-xs font-semibold text-green-400">
                  ✓{" "}
                  {AUDIO_LANGUAGE_NAMES[
                    audioLanguage
                  ] ||
                    audioLanguage}{" "}
                  Audio Verified
                </div>
              )}

              <div className="mt-1 text-xs text-slate-500">
                Industry / Region:{" "}
                {selectedLabel(
                  INDUSTRIES,
                  industry,
                ) || "Any"}{" "}
                · Origin:{" "}
                {displayResult.origin_countries?.join(
                  ", ",
                ) ||
                  displayResult.origin_country?.join(
                    ", ",
                  ) ||
                  "Unavailable"}
              </div>

              <span className="mt-4 inline-block text-xs font-bold">
                VIEW DETAILS →
              </span>
            </span>
          </button>
        )}
      </div>
    </main>
  );
}

function PickerSelect({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-500">
      {label}

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 w-full rounded-lg border border-cine-border bg-slate-900 p-3 text-sm font-normal normal-case tracking-normal text-white"
      >
        {options.map(
          ([optionValue, optionLabel]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          ),
        )}
      </select>
    </label>
  );
}