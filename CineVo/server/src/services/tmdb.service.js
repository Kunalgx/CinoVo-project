import { ProxyAgent } from "undici";
import { ApiError } from "../utils/ApiError.js";

const BASE = "https://api.themoviedb.org/3";
const REQUEST_TIMEOUT_MS = 12000;
const MAX_RETRIES = 2;
let proxyAgent;

function getDispatcher() {
  const proxy = process.env.TMDB_PROXY?.trim();
  if (!proxy) return undefined;
  if (!proxyAgent) {
    try {
      proxyAgent = new ProxyAgent(proxy);
    } catch {
      throw new ApiError(500, "TMDB_PROXY is invalid");
    }
  }
  return proxyAgent;
}

function isRetryableStatus(status) {
  return status === 408 || status === 429 || status >= 500;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function safeNetworkCode(error) {
  return error?.cause?.code || error?.code || "NETWORK_ERROR";
}

async function request(path, params = {}) {
  if (!process.env.TMDB_API_KEY) {
    throw new ApiError(500, "TMDB_API_KEY is not configured");
  }

  const url = new URL(BASE + path);
  url.searchParams.set("api_key", process.env.TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  let lastError;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        dispatcher: getDispatcher(),
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) return data;

      const message = data.status_message || "TMDB request failed";
      lastError = new ApiError(response.status, message);
      console.error("TMDB request failed", {
        path,
        status: response.status,
        attempt: attempt + 1,
        message,
      });
      if (!isRetryableStatus(response.status)) throw lastError;
    } catch (error) {
      if (error instanceof ApiError && !isRetryableStatus(error.statusCode)) {
        throw error;
      }
      if (error.name === "AbortError") {
        lastError = new ApiError(504, "TMDB request timed out");
      } else if (error instanceof ApiError) {
        lastError = error;
      } else {
        const code = safeNetworkCode(error);
        lastError = new ApiError(502, `Unable to reach TMDB (${code})`);
        console.error("TMDB network request failed", {
          path,
          code,
          attempt: attempt + 1,
        });
      }
    } finally {
      clearTimeout(timer);
    }

    if (attempt < MAX_RETRIES) await wait(250 * 2 ** attempt);
  }

  throw lastError || new ApiError(502, "Unable to reach TMDB");
}

export async function tmdbHealth() {
  const startedAt = Date.now();
  try {
    await request("/configuration");
    return {
      ok: true,
      status: "reachable",
      latencyMs: Date.now() - startedAt,
      proxyConfigured: Boolean(process.env.TMDB_PROXY?.trim()),
    };
  } catch (error) {
    return {
      ok: false,
      status: "unreachable",
      latencyMs: Date.now() - startedAt,
      proxyConfigured: Boolean(process.env.TMDB_PROXY?.trim()),
      error: error.message,
      statusCode: error.statusCode || 502,
    };
  }
}

export const tmdbService = {
  trending: () => request("/trending/all/day", { page: 1 }),
  discover: (type, params) =>
    request(type === "tv" ? "/discover/tv" : "/discover/movie", params),
  genres: (type) => request(`/genre/${type}/list`),
  search: (params) => request("/search/multi", params),
  searchTyped: (type, params) => request(`/search/${type}`, params),
  details: (type, id) => request(`/${type}/${id}`),
  credits: (type, id) => request(`/${type}/${id}/credits`),
  providers: (type, id, params = {}) =>
    request(`/${type}/${id}/watch/providers`, params),
  season: (id, season) => request(`/tv/${id}/season/${season}`),
  similar: (type, id) => request(`/${type}/${id}/similar`, { page: 1 }),
  collection: (id) => request(`/collection/${id}`),
  person: (id) => request(`/person/${id}`),
  personCredits: (id) => request(`/person/${id}/combined_credits`),
};
