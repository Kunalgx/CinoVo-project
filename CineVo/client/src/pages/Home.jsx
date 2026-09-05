import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TrendingSection from "../components/TrendingSection";
import FilterBar from "../components/FilterBar";
import MovieGrid from "../components/MovieGrid";
import Pagination from "../components/Pagination";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import { movieService } from "../services/movieService";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import DatePicker from "../components/DatePicker";
import { DEFAULT_REGION, getRegion } from "../utils/region";

const today = () => new Date().toISOString().slice(0, 10);
export default function Home() {
  const nav = useNavigate(),
    { user } = useAuth();
  const [filters, setFilters] = useState({
      type: "all",
      year: "",
      popular: "popular",
      genre: "",
      country: "",
      language: "",
      industry: "",
      region: getRegion() || DEFAULT_REGION,
    }),
    [page, setPage] = useState(1),
    [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [watched, setWatched] = useState([]),
    [scheduled, setScheduled] = useState([]),
    [dateModal, setDateModal] = useState(null),
    [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const load = async (nextFilters = filters, nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const r = await movieService.discover({ ...nextFilters, page: nextPage });
      setItems(r.data.data.results || []);
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load results.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, [page]);
  useEffect(() => {
    if (user) {
      Promise.all([userService.watched(), userService.scheduled()])
        .then(([a, b]) => {
          setWatched(a.data.items);
          setScheduled(b.data.items);
        })
        .catch(() => {});
    } else {
      setWatched([]);
      setScheduled([]);
    }
  }, [user]);
  const isW = (x, t) =>
      watched.some((v) => v.tmdbId === x.id && v.mediaType === t),
    isS = (x, t) =>
      scheduled.some((v) => v.tmdbId === x.id && v.mediaType === t);
  const save = async (action, x, type) => {
    if (!user) {
      nav("/login");
      return;
    }
    const alreadySaved = action === "watched" ? isW(x, type) : isS(x, type);
    if (alreadySaved) {
      try {
        if (action === "watched") {
          await userService.removeWatched(type, x.id);
          setWatched((await userService.watched()).data.items);
        } else {
          await userService.removeScheduled(type, x.id);
          setScheduled((await userService.scheduled()).data.items);
        }
      } catch (removeError) {
        setError(removeError.response?.data?.message || "Could not update this title.");
      }
      return;
    }
    setDateModal({ action, x, type });
  };
  const confirm = async () => {
    const { x, type, action } = dateModal;
    const d = {
      tmdbId: x.id,
      mediaType: type,
      title: type === "tv" ? x.name : x.title,
      posterPath: x.poster_path,
      date,
    };
    try {
      if (action === "watched") {
        await userService.addWatched(d);
        setWatched((await userService.watched()).data.items);
      } else {
        await userService.addScheduled(d);
        setScheduled((await userService.scheduled()).data.items);
      }
      setDateModal(null);
    } catch (e) {
      alert(e.response?.data?.message || "Could not save");
    }
  };
  return (
    <main className="mx-auto max-w-[1450px] space-y-8 px-3 py-6 sm:px-5 sm:py-7">
      <section>
        <h2 className="mb-1 text-xl font-extrabold">
          Trending Recommendations
        </h2>
        <p className="mb-4 text-sm text-cine-muted">Movies & TV Shows</p>
        <TrendingSection onDetails={(id, t) => nav(`/${t}/${id}`)} />
      </section>
      <section>
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onApply={(nextFilters) => {
            setFilters(nextFilters);
            if (page === 1) {
              load(nextFilters, 1);
              return;
            }
            setPage(1);
          }}
        />
      </section>
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-extrabold">
            {filters.type === "movie"
              ? "Movies"
              : filters.type === "tv"
                ? "TV Shows"
                : "Movies & TV Shows"}
          </h2>
          <p className="text-xs text-cine-muted">
            {items.length} unique results
          </p>
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message={error} retry={load} />
        ) : items.length ? (
          <>
            <MovieGrid
              items={items}
              onDetails={(id, t) => nav(`/${t}/${id}`)}
              watched={isW}
              scheduled={isS}
              onWatched={(x, t) => save("watched", x, t)}
              onScheduled={(x, t) => save("scheduled", x, t)}
            />
            <Pagination page={page} onChange={setPage} />
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-cine-border p-10 text-center text-cine-muted">
            No results found.
          </div>
        )}
      </section>
      <Modal
        open={!!dateModal}
        onClose={() => setDateModal(null)}
        title={
          dateModal?.action === "watched"
            ? "When did you watch it?"
            : "When will you watch it?"
        }
      >
        <DatePicker
          value={date}
          onChange={setDate}
          minDate={dateModal?.action === "scheduled" ? today() : undefined}
          maxDate={dateModal?.action === "watched" ? today() : undefined}
        />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => setDateModal(null)}
            className="rounded-xl border border-cine-border bg-white/[0.03] py-3 text-sm font-black text-slate-300 transition hover:bg-white/[0.08]"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            className="rounded-xl bg-cine-gold py-3 text-sm font-black text-black transition hover:brightness-110"
          >
            Save
          </button>
        </div>
      </Modal>
    </main>
  );
}
