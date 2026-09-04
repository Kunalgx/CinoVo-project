import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../services/userService";
import MovieGrid from "../components/MovieGrid";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
export default function Watchlist() {
  const nav = useNavigate(),
    [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await userService.scheduled();
        setItems(Array.isArray(response.data.items) ? response.data.items : []);
      } catch (loadError) {
        setError(loadError.response?.data?.message || "Unable to load your watchlist.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  if (loading) return <Loading text="Loading your watchlist..." />;
  if (error)
    return (
      <main className="mx-auto max-w-5xl p-5">
        <ErrorMessage message={error} retry={() => window.location.reload()} />
      </main>
    );
  const movies = items.map((x) => ({
    id: x.tmdbId,
    media_type: x.mediaType,
    title: x.mediaType === "movie" ? x.title : undefined,
    name: x.mediaType === "tv" ? x.title : undefined,
    poster_path: x.posterPath,
  }));
  return (
    <main className="mx-auto max-w-[1450px] p-5 sm:p-7">
      <h1 className="mb-1 text-3xl font-black">Watchlist</h1>
      <p className="mb-6 text-sm text-slate-400">
        Titles you scheduled to watch.
      </p>
      {movies.length ? (
        <MovieGrid items={movies} onDetails={(id, t) => nav(`/${t}/${id}`)} />
      ) : (
        <div className="rounded-2xl border border-dashed border-cine-border bg-cine-panel p-12 text-center text-slate-400">
          No scheduled titles yet.
        </div>
      )}
    </main>
  );
}
