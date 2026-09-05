import { ApiError } from "../utils/ApiError.js";

const BASE_URL = "https://api.watchmode.com/v1";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map();
const pending = new Map();

function cacheKey(type, tmdbId) {
  return `${type}:${tmdbId}:IN`;
}

async function request(path, params = {}) {
  const apiKey = process.env.WATCHMODE_API_KEY?.trim();
  if (!apiKey)
    throw new ApiError(503, "Streaming availability is not configured");
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "")
      url.searchParams.set(key, value);
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  let response;
  try {
    response = await fetch(url, {
      headers: { "X-API-Key": apiKey, Accept: "application/json" },
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(
      502,
      "Streaming availability is temporarily unavailable",
    );
  } finally {
    clearTimeout(timeout);
  }
  const data = await response.json().catch(() => ({}));
  if (response.ok) return data;
  if (response.status === 401)
    throw new ApiError(
      503,
      "Streaming availability is temporarily unavailable",
    );
  if (response.status === 404)
    throw new ApiError(404, "No streaming availability was found");
  if (response.status === 429)
    throw new ApiError(
      429,
      "Streaming availability is busy. Please try again later",
    );
  throw new ApiError(
    response.status >= 500 ? 502 : response.status,
    "Streaming availability is temporarily unavailable",
  );
}

function sourceType(type) {
  if (type === "sub") return "subscription";
  if (type === "free") return "free";
  if (type === "rent") return "rent";
  if (type === "buy" || type === "purchase") return "buy";
  return null;
}

async function loadAvailability(type, tmdbId) {
  if (
    !Number.isInteger(tmdbId) ||
    tmdbId < 1 ||
    !["movie", "tv"].includes(type)
  ) {
    throw new ApiError(400, "Invalid title identifier");
  }
  const search = await request("/search/", {
    search_field: type === "movie" ? "tmdb_movie_id" : "tmdb_tv_id",
    search_value: tmdbId,
    types: type === "movie" ? "movie" : "tv_series",
  });
  const matches = Array.isArray(search)
    ? search
    : search.title_results || search.results || [];
  const title =
    matches.find((entry) => Number(entry.tmdb_id) === tmdbId) || matches[0];
  if (!title?.id)
    throw new ApiError(404, "No streaming availability was found");
  const [details, sources] = await Promise.all([
    request(`/title/${title.id}/details/`),
    request(`/title/${title.id}/sources/`, { regions: "IN" }),
  ]);
  const indianSources = (
    Array.isArray(sources) ? sources : sources.sources || []
  )
    .filter(
      (source) =>
        source.region === "IN" && source.web_url && sourceType(source.type),
    )
    .map((source) => ({
      name: source.name || "Unknown provider",
      type: sourceType(source.type),
      region: "IN",
      web_url: source.web_url,
    }))
    .filter(
      (source, index, list) =>
        list.findIndex(
          (item) =>
            item.name === source.name &&
            item.type === source.type &&
            item.web_url === source.web_url,
        ) === index,
    );
  return {
    available: true,
    region: "IN",
    title: {
      id: title.id,
      title: details.title || title.name || title.title || "",
      type: details.type || title.type || "",
    },
    sources: indianSources,
  };
}

export async function getIndiaAvailability(type, tmdbId) {
  const key = cacheKey(type, tmdbId);
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  if (pending.has(key)) return pending.get(key);
  const task = loadAvailability(type, tmdbId)
    .then((value) => {
      cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
      return value;
    })
    .catch((error) => {
      if (error.statusCode === 404) {
        const value = { available: true, region: "IN", sources: [] };
        cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
        return value;
      }
      const value = {
        available: false,
        region: "IN",
        sources: [],
        message: error.message,
      };
      cache.set(key, { value, expiresAt: Date.now() + 5 * 60 * 1000 });
      return value;
    })
    .finally(() => pending.delete(key));
  pending.set(key, task);
  return task;
}
