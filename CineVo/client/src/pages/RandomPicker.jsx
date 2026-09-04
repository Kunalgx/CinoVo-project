import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { movieService } from "../services/movieService";
import { userService } from "../services/userService";
import { img, titleOf, year } from "../utils/tmdb";
import Loading from "../components/Loading";
const genres = [
  ["", "Any Genre"],
  ["bollywood", "Bollywood"],
  ["28", "Action"],
  ["35", "Comedy"],
  ["18", "Drama"],
  ["27", "Horror"],
  ["10749", "Romance"],
  ["53", "Thriller"],
];
export default function RandomPicker() {
  const nav = useNavigate(),
    [type, setType] = useState("all"),
    [genre, setGenre] = useState(""),
    [excludeW, setExcludeW] = useState(true),
    [excludeS, setExcludeS] = useState(true),
    [result, setResult] = useState(null),
    [used, setUsed] = useState([]),
    [loading, setLoading] = useState(false);
  const pick = async () => {
    setLoading(true);
    try {
      const types = type === "all" ? ["movie", "tv"] : [type];
      let all = [];
      for (const t of types) {
        for (let p = 1; p <= 3; p++) {
          const r = await movieService.discover({ type: t, page: p, genre });
          all.push(...r.data.data.results);
        }
      }
      let [w, s] = [[], []];
      if (excludeW) w = (await userService.watched()).data.items;
      if (excludeS) s = (await userService.scheduled()).data.items;
      const seen = new Set([...used]);
      let c = all.filter((x) => {
        const k = `${x.media_type}:${x.id}`;
        return (
          !seen.has(k) &&
          !(
            excludeW &&
            w.some((v) => v.tmdbId === x.id && v.mediaType === x.media_type)
          ) &&
          !(
            excludeS &&
            s.some((v) => v.tmdbId === x.id && v.mediaType === x.media_type)
          )
        );
      });
      if (!c.length) {
        setUsed([]);
        setResult(null);
        return;
      }
      const x = c[Math.floor(Math.random() * c.length)];
      setUsed([...used, `${x.media_type}:${x.id}`]);
      setResult(x);
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="mx-auto min-h-[calc(100vh-70px)] max-w-3xl p-5">
      <div className="rounded-2xl border border-cine-border bg-cine-panel p-5">
        <h1 className="text-2xl font-black">🎲 Random Picker</h1>
        <p className="mt-1 text-sm text-slate-500">
          Let CineVo choose something for you.
        </p>
        <h3 className="mt-6 text-xs font-extrabold uppercase tracking-widest text-slate-500">
          What do you want to watch?
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            ["all", "Movies + TV Shows"],
            ["movie", "Movies"],
            ["tv", "TV Shows"],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => {
                setType(v);
                setGenre("");
                setUsed([]);
              }}
              className={`rounded-lg border border-cine-border px-3 py-2 text-xs ${type === v ? "bg-cine-gold text-black" : ""}`}
            >
              {l}
            </button>
          ))}
        </div>
        <h3 className="mt-5 text-xs font-extrabold uppercase tracking-widest text-slate-500">
          Genre
        </h3>
        <select
          value={genre}
          onChange={(e) => {
            setGenre(e.target.value);
            setUsed([]);
          }}
          className="mt-2 w-full rounded-lg border border-cine-border bg-slate-900 p-3 text-sm"
        >
          {genres.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <label className="mt-4 block text-sm">
          <input
            type="checkbox"
            checked={excludeW}
            onChange={(e) => setExcludeW(e.target.checked)}
          />{" "}
          <span className="ml-2">
            Don't pick something I've already watched
          </span>
        </label>
        <label className="mt-2 block text-sm">
          <input
            type="checkbox"
            checked={excludeS}
            onChange={(e) => setExcludeS(e.target.checked)}
          />{" "}
          <span className="ml-2">Don't pick something already scheduled</span>
        </label>
        <button
          disabled={loading}
          onClick={pick}
          className="mt-5 w-full rounded-lg bg-white py-3 font-black text-black"
        >
          {loading ? "Finding something for you..." : "🎲 PICK FOR ME"}
        </button>
        {result && (
          <button
            onClick={() => nav(`/${result.media_type}/${result.id}`)}
            className="mt-4 flex w-full gap-3 rounded-xl border border-cine-border bg-[#181c24] p-3 text-left"
          >
            <img
              src={img(result.poster_path)}
              className="h-32 w-22 rounded-lg object-cover"
            />
            <span>
              <b className="text-lg">{titleOf(result)}</b>
              <div className="mt-2 text-xs text-slate-500">
                {result.media_type.toUpperCase()} · {year(result)} ·{" "}
                <span className="text-cine-gold">
                  ★ {Number(result.vote_average || 0).toFixed(1)}
                </span>
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
