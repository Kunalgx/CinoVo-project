import { useEffect, useState } from "react";
import { movieService } from "../services/movieService";
import Loading from "./Loading";
import ErrorMessage from "./ErrorMessage";
import { img, titleOf, dateOf, formatDate } from "../utils/tmdb";
export default function TrendingSection({ onDetails }) {
  const [data, setData] = useState([]),
    [i, setI] = useState(0),
    [err, setErr] = useState("");
  const load = () =>
    movieService
      .trending()
      .then((r) =>
        setData(
          (r.data.data.results || [])
            .filter((x) => x.media_type === "movie" || x.media_type === "tv")
            .slice(0, 8),
        ),
      )
      .catch((e) => setErr(e.response?.data?.message || e.message));
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (!data.length) return;
    const t = setInterval(() => setI((x) => (x + 1) % data.length), 4000);
    return () => clearInterval(t);
  }, [data]);
  if (err)
    return (
      <ErrorMessage
        message="Unable to load trending recommendations."
        retry={load}
      />
    );
  if (!data.length)
    return (
      <div className="rounded-2xl border border-cine-border bg-cine-panel">
        <Loading text="Loading trending..." />
      </div>
    );
  const x = data[i];
  return (
    <div className="cine-hero relative min-h-[420px] overflow-hidden rounded-2xl border border-cine-border bg-cine-panel shadow-2xl sm:min-h-[390px]">
      <img
        src={img(x.backdrop_path, "original")}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center sm:left-auto sm:right-0 sm:w-1/2"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#10131a] via-[#10131a]/80 to-[#10131a]/30 sm:bg-gradient-to-r sm:from-[#10131a] sm:via-[#10131a]/95 sm:to-transparent" />
      <div className="relative z-10 flex min-h-[420px] w-full flex-col justify-end p-5 pb-16 sm:min-h-[390px] sm:w-1/2 sm:justify-center sm:p-10">
        <div className="mb-2 text-[10px] font-extrabold uppercase tracking-[1.2px] text-slate-400">
          {x.media_type === "tv" ? "TV SHOW" : "MOVIE"}
        </div>
        <h1 className="text-2xl font-black leading-tight min-[400px]:text-3xl sm:text-5xl">
          {titleOf(x)}
        </h1>
        <div className="my-3 flex gap-2 text-xs">
          <span>{formatDate(dateOf(x))}</span>
          <span>•</span>
          <span className="font-bold text-cine-gold">
            ★ {Number(x.vote_average || 0).toFixed(1)}
          </span>
        </div>
        <p className="line-clamp-3 max-w-2xl text-sm leading-6 text-slate-300">
          {x.overview || "No overview available."}
        </p>
        <button
          onClick={() => onDetails(x.id, x.media_type)}
          className="mt-5 w-fit rounded-lg bg-white px-4 py-2.5 text-xs font-extrabold text-black"
        >
          VIEW DETAILS
        </button>
      </div>
      <div className="absolute bottom-4 left-5 flex gap-1.5">
        {data.map((_, n) => (
          <button
            key={n}
            onClick={() => setI(n)}
            className={`h-2 rounded-full ${n === i ? "w-6 bg-white" : "w-2 bg-slate-600"}`}
          />
        ))}
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setI((i - 1 + data.length) % data.length)}
          className="h-9 w-9 rounded-full border border-white/15 bg-black/40"
        >
          ‹
        </button>
        <button
          onClick={() => setI((i + 1) % data.length)}
          className="h-9 w-9 rounded-full border border-white/15 bg-black/40"
        >
          ›
        </button>
      </div>
    </div>
  );
}
