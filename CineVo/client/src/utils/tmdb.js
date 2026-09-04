export const IMG = "https://image.tmdb.org/t/p/";
export const img = (p, size = "w500") => (p ? IMG + size + p : "");
export const titleOf = (x) =>
  x?.media_type === "tv" || x?.first_air_date !== undefined ? x.name : x?.title;
export const dateOf = (x) =>
  x?.media_type === "tv" || x?.first_air_date !== undefined
    ? x.first_air_date
    : x.release_date;
export const year = (x) => dateOf(x)?.slice(0, 4) || "—";
export const formatDate = (d) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date unavailable";
export const keyOf = (type, id) => `${type}:${id}`;
