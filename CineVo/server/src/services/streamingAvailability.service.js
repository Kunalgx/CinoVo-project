import { ApiError } from "../utils/ApiError.js";

const BASE_URL = "https://api.movieofthenight.com/v4";

export async function getStreamingAvailability(
  type,
  tmdbId,
  country = "in",
) {
  const apiKey =
    process.env.STREAMING_AVAILABILITY_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      500,
      "STREAMING_AVAILABILITY_API_KEY is not configured",
    );
  }

  const showType = type === "tv" ? "tv" : "movie";
  const id = `${showType}/${tmdbId}`;

  const url = new URL(`${BASE_URL}/shows/${id}`);

  url.searchParams.set(
    "country",
    country.toLowerCase(),
  );

  const response = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(
      "Streaming Availability API error:",
      {
        status: response.status,
        message: data?.message,
      },
    );

    throw new ApiError(
      response.status,
      data?.message ||
        "Streaming availability request failed",
    );
  }

  return data;
}

export async function searchStreamingShows(
  filters = {},
) {
  const apiKey =
    process.env.STREAMING_AVAILABILITY_API_KEY;

  if (!apiKey) {
    throw new ApiError(
      500,
      "STREAMING_AVAILABILITY_API_KEY is not configured",
    );
  }

  const url = new URL(
    `${BASE_URL}/shows/search/filters`,
  );

  for (const [key, value] of Object.entries(filters)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    headers: {
      "X-API-Key": apiKey,
      Accept: "application/json",
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(
      "Streaming Availability search error:",
      {
        status: response.status,
        message: data?.message,
      },
    );

    throw new ApiError(
      response.status,
      data?.message ||
        "Streaming availability search failed",
    );
  }

  return data;
}