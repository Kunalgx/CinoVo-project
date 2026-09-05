import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { formatDate, img } from "../utils/tmdb";

export default function Watchlist() {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = async () => {
    try {
      const response = await userService.scheduled();
      setItems(Array.isArray(response.data.items) ? response.data.items : []);
      setError("");
    } catch (loadError) {
      setError(
        loadError.response?.data?.message || "Unable to load your watchlist.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  if (loading) return <Loading text="Loading your watchlist..." />;
  if (error)
    return (
      <main className="mx-auto max-w-5xl p-5">
        <ErrorMessage message={error} retry={load} />
      </main>
    );
  return (
    <main className="mx-auto max-w-[1000px] p-5 sm:p-7">
      <h1 className="mb-1 text-3xl font-black">Watchlist</h1>
      <p className="mb-6 text-sm text-slate-400">
        Titles and episodes you currently scheduled to watch.
      </p>
      {items.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <ScheduledItem key={item._id} item={item} nav={nav} reload={load} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-cine-border bg-cine-panel p-12 text-center text-slate-400">
          No scheduled titles yet.
        </div>
      )}
    </main>
  );
}

function ScheduledItem({ item, nav, reload }) {
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");
  const episode = item.episode
    ? `S${item.episode.season}E${item.episode.number}${item.episode.name ? ` · ${item.episode.name}` : ""}`
    : item.mediaType === "tv"
      ? "TV show"
      : "Movie";
  const unschedule = async () => {
    setRemoving(true);
    setError("");
    try {
      if (item.episode)
        await userService.removeScheduledEpisode(
          item.tmdbId,
          item.episode.season,
          item.episode.number,
        );
      else await userService.removeScheduled(item.mediaType, item.tmdbId);
      await reload();
    } catch (removeError) {
      setError(
        removeError.response?.data?.message ||
          "Could not unschedule this item.",
      );
    } finally {
      setRemoving(false);
    }
  };
  return (
    <article className="flex gap-3 rounded-xl border border-cine-border bg-cine-card p-3">
      {item.posterPath ? (
        <img
          src={img(item.posterPath, "w185")}
          alt=""
          className="h-20 w-14 rounded object-cover"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="h-20 w-14 rounded bg-slate-800" />
      )}
      <div className="min-w-0 flex-1">
        <button
          onClick={() => nav(`/${item.mediaType}/${item.tmdbId}`)}
          className="block max-w-full text-left"
        >
          <h2 className="truncate text-sm font-black">
            {item.title || "Untitled"}
          </h2>
        </button>
        <p className="mt-1 text-xs text-slate-400">{episode}</p>
        <p className="mt-1 text-xs text-slate-500">
          Scheduled for {formatDate(String(item.date).slice(0, 10))}
        </p>
        <button
          onClick={unschedule}
          disabled={removing}
          className="mt-3 rounded-lg border border-cine-border px-2.5 py-1.5 text-[10px] font-black hover:border-red-400 disabled:opacity-50"
        >
          {removing ? "Removing…" : "Unschedule"}
        </button>
        {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      </div>
    </article>
  );
}
