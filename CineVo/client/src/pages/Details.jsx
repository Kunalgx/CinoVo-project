import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { movieService } from "../services/movieService";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { dateOf, formatDate, img, titleOf, year } from "../utils/tmdb";
import { getRegion } from "../utils/region";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import MovieGrid from "../components/MovieGrid";
import DatePicker from "../components/DatePicker";

const today = () => new Date().toISOString().slice(0, 10);
const episodeMatches = (item, showId, episode) =>
  item.tmdbId === Number(showId) &&
  item.mediaType === "tv" &&
  item.episode?.season === episode.season_number &&
  item.episode?.number === episode.episode_number;

export default function Details({ type }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [region, setRegion] = useState(getRegion);
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [season, setSeason] = useState(null);
  const [seasonNumber, setSeasonNumber] = useState(0);
  const [watchedEpisodes, setWatchedEpisodes] = useState([]);
  const [scheduledEpisodes, setScheduledEpisodes] = useState([]);
  const [error, setError] = useState("");
  const [seasonError, setSeasonError] = useState("");
  const [action, setAction] = useState(null);
  const [date, setDate] = useState(today);
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    const onRegionChange = (event) => setRegion(event.detail || getRegion());
    window.addEventListener("cinevo-region-change", onRegionChange);
    return () => window.removeEventListener("cinevo-region-change", onRegionChange);
  }, []);

  useEffect(() => {
    let active = true;
    setMovie(null);
    setError("");
    movieService.details(type, id, region)
      .then(([details, credits, providers]) => {
        if (!active) return null;
        const data = details.data.data;
        setMovie({ ...data, credits: credits.data.data, providers: providers.data.data });
        setSeasonNumber(data.seasons?.find((item) => item.season_number > 0)?.season_number || 1);
        return movieService.similar(type, id);
      })
      .then((response) => {
        if (active && response) setSimilar(response.data.data.results || []);
      })
      .catch((loadError) => {
        if (active) setError(loadError.response?.data?.message || "Unable to load details");
      });
    return () => { active = false; };
  }, [type, id, region]);

  useEffect(() => {
    if (type !== "tv" || !seasonNumber) return undefined;
    let active = true;
    setSeason(null);
    setSeasonError("");
    movieService.season(id, seasonNumber)
      .then((response) => { if (active) setSeason(response.data.data); })
      .catch((loadError) => { if (active) setSeasonError(loadError.response?.data?.message || "Unable to load episodes"); });
    return () => { active = false; };
  }, [type, id, seasonNumber]);

  useEffect(() => {
    if (!user || type !== "tv") {
      setWatchedEpisodes([]);
      setScheduledEpisodes([]);
      return undefined;
    }
    let active = true;
    Promise.all([userService.watched(), userService.scheduled()])
      .then(([watched, scheduled]) => {
        if (!active) return;
        const items = (response) => (Array.isArray(response.data.items) ? response.data.items : []).filter((item) => item.tmdbId === Number(id) && item.mediaType === "tv" && item.episode);
        setWatchedEpisodes(items(watched));
        setScheduledEpisodes(items(scheduled));
      })
      .catch(() => { if (active) { setWatchedEpisodes([]); setScheduledEpisodes([]); } });
    return () => { active = false; };
  }, [user, type, id]);

  const openAction = (mode, episode = null) => {
    if (!user) { navigate("/login"); return; }
    setDate(today());
    setDateError("");
    setAction({ mode, episode });
  };

  const saveAction = async () => {
    if (!action || !date) { setDateError("Choose a date first."); return; }
    const chosen = new Date(`${date}T00:00:00`);
    if (Number.isNaN(chosen.getTime())) { setDateError("Choose a valid date."); return; }
    if (action.mode === "watched" && date > today()) { setDateError("Watched items cannot use a future date."); return; }
    const episode = action.episode;
    const payload = episode
      ? { tmdbId: movie.id, mediaType: "tv", title: titleOf(movie), posterPath: movie.poster_path, date, episode: { season: episode.season_number, number: episode.episode_number, name: episode.name || "", stillPath: episode.still_path || "" } }
      : { tmdbId: movie.id, mediaType: type, title: titleOf(movie), posterPath: movie.poster_path, date };
    try {
      if (episode) {
        if (action.mode === "watched") await userService.addWatchedEpisode(payload);
        else await userService.addScheduledEpisode(payload);
        const response = action.mode === "watched" ? await userService.watched() : await userService.scheduled();
        const items = (response.data.items || []).filter((item) => item.tmdbId === Number(id) && item.mediaType === "tv" && item.episode);
        if (action.mode === "watched") setWatchedEpisodes(items);
        else setScheduledEpisodes(items);
      } else if (action.mode === "watched") await userService.addWatched(payload);
      else await userService.addScheduled(payload);
      setAction(null);
    } catch (saveError) {
      setDateError(saveError.response?.data?.message || "Could not save this item.");
    }
  };

  const toggleEpisode = async (mode, episode) => {
    const records = mode === "watched" ? watchedEpisodes : scheduledEpisodes;
    const existing = records.find((item) => episodeMatches(item, id, episode));
    try {
      if (existing) {
        if (mode === "watched") await userService.removeWatchedEpisode(id, episode.season_number, episode.episode_number);
        else await userService.removeScheduledEpisode(id, episode.season_number, episode.episode_number);
        const updated = records.filter((item) => item !== existing);
        if (mode === "watched") setWatchedEpisodes(updated);
        else setScheduledEpisodes(updated);
      } else openAction(mode, episode);
    } catch (toggleError) {
      setSeasonError(toggleError.response?.data?.message || "Could not update episode status.");
    }
  };

  if (error && !movie) return <main className="mx-auto max-w-5xl p-5"><ErrorMessage message={error} retry={() => window.location.reload()} /></main>;
  if (!movie) return <Loading text="Loading details..." />;

  const title = titleOf(movie) || "Untitled";
  const providerRegion = movie.providers?.results?.[region];
  const providerGroups = [
    ["Stream", providerRegion?.flatrate || []],
    ["Free / Ads", [...(providerRegion?.free || []), ...(providerRegion?.ads || [])]],
    ["Rent", providerRegion?.rent || []],
    ["Buy", providerRegion?.buy || []],
  ];
  const providers = providerGroups.flatMap(([label, items]) => items.map((provider) => ({ ...provider, availabilityType: label }))).filter((provider, index, list) => list.findIndex((item) => item.provider_id === provider.provider_id && item.availabilityType === provider.availabilityType) === index);

  return (
    <main className="pb-12">
      <button onClick={() => navigate(-1)} className="fixed left-4 top-20 z-20 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/70 px-3 py-2 text-sm font-bold text-slate-200 shadow-lg backdrop-blur transition hover:border-cine-gold/60 hover:bg-[#151922] hover:text-white active:scale-95"><span aria-hidden="true" className="text-lg leading-none">←</span>Back</button>
      <section className="relative overflow-hidden border-b border-cine-border">
        <img src={img(movie.backdrop_path, "original")} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090b10]/30 via-[#090b10]/75 to-[#090b10]" />
        <div className="relative mx-auto grid max-w-6xl gap-7 px-5 pb-10 pt-32 sm:grid-cols-[190px_1fr] sm:items-end sm:pt-36 lg:grid-cols-[230px_1fr] lg:gap-10">
          <img src={img(movie.poster_path)} alt={title} className="mx-auto w-44 rounded-2xl shadow-2xl sm:mx-0 sm:w-full" />
          <div className="min-w-0"><p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-cine-accent">{type === "tv" ? "TV SHOW" : "MOVIE"} · {year(movie)}</p><h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">{title}</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{movie.overview || "No overview available."}</p><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400"><span>{formatDate(dateOf(movie))}</span><span>Rating {Number(movie.vote_average || 0).toFixed(1)}</span>{type === "tv" && <span>{movie.number_of_seasons || 0} seasons</span>}</div><div className="mt-6 flex flex-wrap gap-2"><button onClick={() => openAction("watched")} className="rounded-lg bg-white px-4 py-2.5 text-sm font-black text-black">Mark watched</button><button onClick={() => openAction("scheduled")} className="rounded-lg border border-white/20 px-4 py-2.5 text-sm font-black">Schedule</button></div></div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-9 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-9">
          <section><h2 className="mb-4 text-xl font-black">Cast</h2><div className="flex gap-4 overflow-x-auto pb-2">{(movie.credits?.cast || []).slice(0, 12).map((person) => <div key={person.id} className="w-24 flex-none text-center"><img src={img(person.profile_path, "w185")} alt={person.name} className="h-32 w-24 rounded-xl object-cover" /><p className="mt-2 truncate text-xs text-slate-300">{person.name}</p></div>)}</div></section>
          <section className="rounded-2xl border border-cine-border bg-cine-panel p-4 sm:p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cine-accent">Watch providers</p><h2 className="mt-1 text-xl font-black">Available on</h2></div><span className="rounded-full border border-cine-border px-3 py-1 text-xs text-slate-400">Region: {region}</span></div>{providers.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{providers.map((provider) => <div key={`${provider.provider_id}-${provider.availabilityType}`} className="flex min-w-0 items-center gap-3 rounded-xl border border-cine-border bg-[#151a23] p-3"><img src={img(provider.logo_path, "w92")} alt="" className="h-11 w-11 flex-none rounded-lg object-cover" /><div className="min-w-0"><p className="truncate text-sm font-bold">{provider.provider_name}</p><p className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-500">{provider.availabilityType}</p></div></div>)}</div> : <p className="mt-5 text-sm text-slate-400">No providers listed for {region}.</p>}</section>
          {type === "tv" && <section className="rounded-2xl border border-cine-border bg-cine-panel p-4 sm:p-5"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cine-accent">Series guide</p><h2 className="mt-1 text-xl font-black">Seasons & episodes</h2></div><div className="mt-5 flex gap-2 overflow-x-auto border-b border-cine-border pb-2">{(movie.seasons || []).filter((item) => item.season_number > 0).map((item) => <button key={item.id} onClick={() => setSeasonNumber(item.season_number)} className={`flex-none rounded-lg px-4 py-2 text-sm font-black transition ${seasonNumber === item.season_number ? "bg-cine-gold text-black" : "border border-cine-border bg-[#151a23] text-slate-300 hover:border-slate-500"}`}>Season {item.season_number}</button>)}</div>{seasonError && <p className="mt-4 text-sm text-red-300">{seasonError}</p>}{!season && !seasonError ? <Loading text="Loading episodes..." /> : season?.episodes?.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{season.episodes.map((episode) => <EpisodeCard key={episode.id} episode={episode} watched={watchedEpisodes} scheduled={scheduledEpisodes} onToggle={toggleEpisode} />)}</div> : <p className="mt-5 text-sm text-slate-400">No episodes found for this season.</p>}</section>}
        </div>
        <aside className="h-fit rounded-2xl border border-cine-border bg-cine-panel p-5 lg:sticky lg:top-24"><h2 className="mb-4 text-xl font-black">Details</h2><dl className="space-y-4 text-sm"><div><dt className="text-xs uppercase tracking-wider text-slate-500">Genres</dt><dd className="mt-1 text-slate-300">{(movie.genres || []).map((genre) => genre.name).join(", ") || "Unknown"}</dd></div><div><dt className="text-xs uppercase tracking-wider text-slate-500">Runtime</dt><dd className="mt-1 text-slate-300">{movie.runtime ? `${movie.runtime} minutes` : movie.episode_run_time?.[0] ? `${movie.episode_run_time[0]} minutes` : "Unknown"}</dd></div>{movie.status && <div><dt className="text-xs uppercase tracking-wider text-slate-500">Status</dt><dd className="mt-1 text-slate-300">{movie.status}</dd></div>}</dl></aside>
      </div>
      {similar.length > 0 && <section className="mx-auto max-w-6xl px-5"><h2 className="mb-4 text-xl font-black">You may also like</h2><MovieGrid items={similar.slice(0, 20).map((item) => ({ ...item, media_type: type }))} onDetails={(itemId, itemType) => navigate(`/${itemType}/${itemId}`)} /></section>}
      <Modal open={Boolean(action)} onClose={() => setAction(null)} title={action?.episode ? `${action.mode === "watched" ? "Watch" : "Schedule"} episode` : action?.mode === "watched" ? "When did you watch it?" : "When will you watch it?"}>
        <p className="mb-4 text-sm text-slate-400">{action?.episode ? `${action.episode.name || "Episode"} · S${String(action.episode.season_number).padStart(2, "0")}E${String(action.episode.episode_number).padStart(2, "0")}` : "Choose a date to keep your CineVo timeline accurate."}</p>
        <DatePicker
          value={date}
          onChange={(nextDate) => { setDate(nextDate); setDateError(""); }}
          minDate={action?.mode === "scheduled" ? today() : undefined}
          maxDate={action?.mode === "watched" ? today() : undefined}
        />
        {dateError && <p className="mt-3 text-sm text-red-300">{dateError}</p>}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={() => setAction(null)} className="rounded-xl border border-cine-border bg-white/[0.03] py-3 text-sm font-black text-slate-300 transition hover:bg-white/[0.08]">Cancel</button>
          <button onClick={saveAction} className="rounded-xl bg-cine-gold py-3 text-sm font-black text-black transition hover:brightness-110">Save {action?.mode === "watched" ? "watched" : "scheduled"}</button>
        </div>
      </Modal>
    </main>
  );
}

function EpisodeCard({ episode, watched, scheduled, onToggle }) {
  const watchedItem = watched.find((item) => item.episode?.season === episode.season_number && item.episode?.number === episode.episode_number);
  const scheduledItem = scheduled.find((item) => item.episode?.season === episode.season_number && item.episode?.number === episode.episode_number);
  return <article className="grid min-h-[152px] grid-cols-[140px_minmax(0,1fr)] gap-4 rounded-xl border border-cine-border bg-[#151a23] p-3 sm:grid-cols-[155px_minmax(0,1fr)]"><img src={img(episode.still_path, "w300")} alt="" className="h-[126px] w-[140px] rounded-lg object-cover sm:h-[132px] sm:w-[155px]" /><div className="flex min-w-0 flex-col"><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-wider text-cine-accent">Episode {episode.episode_number}</p><h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5">{episode.name || "Untitled episode"}</h3><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400"><span>★ {Number(episode.vote_average || 0).toFixed(1)}</span>{episode.air_date && <span>{formatDate(episode.air_date)}</span>}{episode.runtime ? <span>{episode.runtime} min</span> : null}</div><p className="mt-2 line-clamp-2 text-[11px] leading-4 text-slate-400">{episode.overview || "No episode description available."}</p></div><div className="mt-auto flex flex-wrap gap-2 pt-3"><button onClick={() => onToggle("watched", episode)} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-black ${watchedItem ? "bg-cine-gold text-black" : "border border-cine-border text-slate-200"}`}>{watchedItem ? "Mark Unwatched" : "Mark Watched"}</button><button onClick={() => onToggle("scheduled", episode)} className={`rounded-lg px-2.5 py-1.5 text-[10px] font-black ${scheduledItem ? "bg-cine-accent text-white" : "border border-cine-border text-slate-200"}`}>{scheduledItem ? "Scheduled" : "Schedule"}</button></div></div></article>;
}
