import { api } from "./api";
export const userService = {
  profile: () => api.get("/user/profile"),
  update: (d) => api.patch("/user/profile", d),
  avatar: (f) =>
    api.post("/user/avatar", f, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  watched: () => api.get("/watchlist/watched"),
  scheduled: () => api.get("/watchlist/scheduled"),
  timeline: () => api.get("/watchlist/timeline"),
  addWatched: (d) => api.post("/watchlist/watched", d),
  addWatchedEpisode: (d) => api.post("/watchlist/watched/episode", d),
  removeWatched: (type, id) => api.delete(`/watchlist/watched/${type}/${id}`),
  removeWatchedEpisode: (id, s, n) =>
    api.delete(`/watchlist/watched/episode/${id}/${s}/${n}`),
  addScheduled: (d) => api.post("/watchlist/scheduled", d),
  addScheduledEpisode: (d) => api.post("/watchlist/scheduled/episode", d),
  removeScheduled: (type, id) =>
    api.delete(`/watchlist/scheduled/${type}/${id}`),
  removeScheduledEpisode: (id, s, n) =>
    api.delete(`/watchlist/scheduled/episode/${id}/${s}/${n}`),
};
