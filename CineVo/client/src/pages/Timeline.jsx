import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import Loading from "../components/Loading";
import { img, formatDate } from "../utils/tmdb";
export default function Timeline() {
  const nav = useNavigate(),
    [d, setD] = useState({ watched: [], scheduled: [] }),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    userService
      .timeline()
      .then((r) => setD(r.data))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <Loading />;
  return (
    <main className="mx-auto max-w-[1200px] p-5">
      <h1 className="text-3xl font-black">Timeline</h1>
      <p className="mb-6 text-sm text-slate-500">
        Watched and scheduled titles in one place.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        <Column title="✓ Watched" items={d.watched} nav={nav} />
        <Column title="◷ Scheduled" items={d.scheduled} nav={nav} />
      </div>
    </main>
  );
}
function Column({ title, items, nav }) {
  return (
    <section className="rounded-2xl border border-cine-border bg-cine-panel p-4">
      <h2 className="mb-4 font-black">{title}</h2>
      {!items.length ? (
        <div className="p-8 text-center text-sm text-slate-500">
          Nothing here yet.
        </div>
      ) : (
        items.map((x) => (
          <button
            key={x._id}
            onClick={() => nav(`/${x.mediaType}/${x.tmdbId}`)}
            className="mb-2 flex w-full items-center gap-3 rounded-xl border border-cine-border bg-[#151922] p-2 text-left"
          >
            <img
              src={img(x.posterPath)}
              className="h-16 w-11 rounded object-cover"
            />
            <span className="min-w-0">
              <b className="block truncate text-xs">{x.title || "Untitled"}</b>
              <small className="text-[10px] text-slate-500">
                📅 {formatDate(String(x.date).slice(0, 10))}
              </small>
            </span>
          </button>
        ))
      )}
    </section>
  );
}
