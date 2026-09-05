import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import Loading from "../components/Loading";
import { img, formatDate } from "../utils/tmdb";

export default function Timeline() {
  const nav = useNavigate();
  const [data, setData] = useState({ watched: [], scheduled: [] });
  const [loading, setLoading] = useState(true);
  const load = async () => {
    const response = await userService.timeline();
    setData({
      watched: response.data.watched || [],
      scheduled: response.data.scheduled || [],
    });
  };
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);
  if (loading) return <Loading />;
  return (
    <main className="mx-auto max-w-[1200px] p-5">
      <h1 className="text-3xl font-black">Timeline</h1>
      <p className="mb-6 text-sm text-slate-500">
        Watched and scheduled titles in one place.
      </p>
      <div className="grid gap-5 md:grid-cols-2">
        <Column
          title="Watched"
          items={data.watched}
          mode="watched"
          nav={nav}
          reload={load}
        />
        <Column
          title="Scheduled"
          items={data.scheduled}
          mode="scheduled"
          nav={nav}
          reload={load}
        />
      </div>
    </main>
  );
}

function Column({ title, items, mode, nav, reload }) {
  return (
    <section className="rounded-2xl border border-cine-border bg-cine-panel p-4">
      <h2 className="mb-4 font-black">{title}</h2>
      {!items.length ? (
        <div className="p-8 text-center text-sm text-slate-500">
          Nothing here yet.
        </div>
      ) : (
        items.map((item) => (
          <SavedItem
            key={item._id}
            item={item}
            mode={mode}
            nav={nav}
            reload={reload}
          />
        ))
      )}
    </section>
  );
}

function SavedItem({ item, mode, nav, reload }) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const episode = item.episode
    ? ` · S${item.episode.season}E${item.episode.number}${item.episode.name ? ` · ${item.episode.name}` : ""}`
    : "";
  const remove = async () => {
    setRemoving(true);
    setError("");
    try {
      if (mode === "watched") {
        if (item.episode)
          await userService.removeWatchedEpisode(
            item.tmdbId,
            item.episode.season,
            item.episode.number,
          );
        else await userService.removeWatched(item.mediaType, item.tmdbId);
      } else if (item.episode)
        await userService.removeScheduledEpisode(
          item.tmdbId,
          item.episode.season,
          item.episode.number,
        );
      else await userService.removeScheduled(item.mediaType, item.tmdbId);
      await reload();
    } catch (removeError) {
      setError(
        removeError.response?.data?.message || "Could not update this item.",
      );
    } finally {
      setRemoving(false);
    }
  };
  return (
    <article className="mb-2 rounded-xl border border-cine-border bg-[#151922] p-2">
      <div className="flex items-center gap-3">
        {item.posterPath ? (
          <img
            src={img(item.posterPath)}
            alt=""
            className="h-16 w-11 rounded object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="h-16 w-11 rounded bg-slate-800" />
        )}
        <button
          onClick={() => nav(`/${item.mediaType}/${item.tmdbId}`)}
          className="min-w-0 flex-1 text-left"
        >
          <b className="block truncate text-xs">{item.title || "Untitled"}</b>
          <small className="block truncate text-[10px] text-slate-500">
            {formatDate(String(item.date).slice(0, 10))}
            {episode}
          </small>
        </button>
        <button
          onClick={remove}
          disabled={removing}
          className="rounded-lg border border-cine-border px-2 py-1.5 text-[10px] font-black text-slate-200 hover:border-red-400 disabled:opacity-50"
        >
          {removing
            ? "Removing…"
            : mode === "watched"
              ? "Unwatch"
              : "Unschedule"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    </article>
  );
}
