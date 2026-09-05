import { tmdbHealth, tmdbService } from "../services/tmdb.service.js";
export const trending = async (req, res) =>
  res.json({ success: true, data: await tmdbService.trending() });
export const tmdbHealthCheck = async (req, res) => {
  const result = await tmdbHealth();
  res.status(result.ok ? 200 : 503).json({ success: result.ok, data: result });
};
export const discover = async (req, res) => {
  const {
    type = "all",
    page = 1,
    year,
    genre,
    country,
    language,
    industry,
    popularity = "popular",
  } = req.query;
  const one = async (t) => {
    const p = {
      page: Number(page),
      include_adult: false,
      sort_by: popularity === "high" ? "vote_average.desc" : "popularity.desc",
      ...(year
        ? t === "movie"
          ? { primary_release_year: year }
          : { first_air_date_year: year }
        : {}),
      ...(genre && genre !== "bollywood" ? { with_genres: genre } : {}),
      ...(country ? { with_origin_country: country } : {}),
      ...(language ? { with_original_language: language } : {}),
      ...(popularity === "high" ? { vote_count_gte: 200 } : {}),
    };
    if (industry === "hollywood") p.with_origin_country = "US";
    if (industry === "bollywood" || genre === "bollywood")
      Object.assign(p, { with_original_language: "hi", with_origin_country: "IN" });
    if (industry === "south-indian")
      Object.assign(p, {
        with_origin_country: "IN",
      });
    const languageFilters =
      industry === "south-indian" ? ["ta", "te", "ml", "kn"] : [language];
    const out = [];
    for (const languageFilter of languageFilters) {
      for (let i = 0; i < 3; i++) {
        const d = await tmdbService.discover(t, {
          ...p,
          ...(languageFilter
            ? { with_original_language: languageFilter }
            : {}),
          page: Number(page) * 3 - 2 + i,
        });
        out.push(...(d.results || []).map((x) => ({ ...x, media_type: t })));
      }
    }
    return out;
  };
  let items = [];
  if (type === "all") {
    const [m, t] = await Promise.all([one("movie"), one("tv")]);
    items = [...m, ...t].sort(
      (a, b) => (b.popularity || 0) - (a.popularity || 0),
    );
  } else items = await one(type);
  const seen = new Set();
  items = items
    .filter((x) => {
      const k = `${x.media_type}:${x.id}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 50);
  res.json({ success: true, data: { results: items, page: Number(page) } });
};
export const search = async (req, res) => {
  const d = await tmdbService.search({
    query: req.query.query,
    page: req.query.page || 1,
    include_adult: false,
  });
  res.json({ success: true, data: d });
};
export const searchTyped = async (req, res) => {
  const d = await tmdbService.searchTyped(req.params.type, {
    query: req.query.query,
    page: req.query.page || 1,
    include_adult: false,
  });
  res.json({ success: true, data: d });
};
export const details = async (req, res) =>
  res.json({
    success: true,
    data: await tmdbService.details(req.params.type, req.params.id),
  });
export const credits = async (req, res) =>
  res.json({
    success: true,
    data: await tmdbService.credits(req.params.type, req.params.id),
  });
export const providers = async (req, res) =>
  res.json({
    success: true,
    data: await tmdbService.providers(req.params.type, req.params.id, {
      watch_region: req.query.region || "US",
    }),
  });
export const season = async (req, res) =>
  res.json({
    success: true,
    data: await tmdbService.season(req.params.id, req.params.season),
  });
export const similar = async (req, res) =>
  res.json({
    success: true,
    data: await tmdbService.similar(req.params.type, req.params.id),
  });
export const collection = async (req, res) =>
  res.json({
    success: true,
    data: await tmdbService.collection(req.params.id),
  });
export const person = async (req, res) =>
  res.json({
    success: true,
    data: await tmdbService.person(req.params.id),
  });
export const personCredits = async (req, res) =>
  res.json({
    success: true,
    data: await tmdbService.personCredits(req.params.id),
  });


  //