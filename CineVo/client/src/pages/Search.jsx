import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { movieService } from "../services/movieService";
import MovieGrid from "../components/MovieGrid";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
export default function Search() {
  const [sp] = useSearchParams(),
    q = sp.get("q") || "",
    nav = useNavigate();
  const [data, setData] = useState([]),
    [type, setType] = useState("all"),
    [loading, setLoading] = useState(true),
    [err, setErr] = useState("");
  useEffect(() => {
    if (!q) return;
    setLoading(true);
    const fn =
      type === "all"
        ? movieService.search({ query: q, page: 1 })
        : movieService.searchTyped(type, { query: q, page: 1 });
    fn.then((r) => setData(r.data.data.results || []))
      .catch((e) => setErr(e.response?.data?.message || "Search failed"))
      .finally(() => setLoading(false));
  }, [q, type]);
  return (
    <main className="mx-auto max-w-[1450px] p-5">
      <h1 className="text-2xl font-black">Search results for “{q}”</h1>
      <div className="my-5 flex gap-2">
        {[
          ["all", "All"],
          ["movie", "Movies"],
          ["tv", "TV Shows"],
          ["person", "People"],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setType(v)}
            className={`rounded-lg border border-cine-border px-3 py-2 text-xs ${type === v ? "bg-white text-black" : ""}`}
          >
            {l}
          </button>
        ))}
      </div>
      {loading ? (
        <Loading />
      ) : err ? (
        <ErrorMessage message={err} />
      ) : type === "person" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-cine-border bg-cine-panel p-3"
            >
              <b>{p.name}</b>
              <p className="text-xs text-slate-500">{p.known_for_department}</p>
            </div>
          ))}
        </div>
      ) : (
        <MovieGrid
          items={data
            .filter((x) => x.media_type)
            .map((x) => ({ ...x, media_type: x.media_type }))}
          onDetails={(id, t) => nav(`/${t}/${id}`)}
        />
      )}
    </main>
  );
}
