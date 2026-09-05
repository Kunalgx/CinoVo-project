import { api } from "./api";
export const movieService = {
  trending: () => api.get("/movies/trending"),
  discover: (p) => api.get("/movies/discover", { params: p }),
  search: (p) => api.get("/movies/search", { params: p }),
  searchTyped: (type, p) => api.get(`/movies/search/${type}`, { params: p }),
  details: (type, id, region = "US") =>
    Promise.all([
      api.get(`/movies/${type}/${id}`),
      api.get(`/movies/${type}/${id}/credits`),
      api.get(`/movies/${type}/${id}/providers`, { params: { region } }),
    ]),
  season: (id, s) => api.get(`/movies/tv/${id}/seasons/${s}`),
  similar: (type, id) => api.get(`/movies/${type}/${id}/similar`),
  collection: (id) => api.get(`/movies/collection/${id}`),
  person: (id) =>
    Promise.all([
      api.get(`/movies/person/${id}`),
      api.get(`/movies/person/${id}/combined_credits`),
    ]),
};
