import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BriefcaseBusiness, CalendarDays, MapPin, Star } from "lucide-react";
import { movieService } from "../services/movieService";
import { img, titleOf, year } from "../utils/tmdb";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

export default function PersonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [person, setPerson] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setPerson(null);
    setError("");
    movieService.person(id)
      .then(([detailsResponse, creditsResponse]) => {
        if (!active) return;
        setPerson({
          ...detailsResponse.data.data,
          credits: creditsResponse.data.data,
        });
      })
      .catch((loadError) => { if (active) setError(loadError.response?.data?.message || "Unable to load person details"); });
    return () => { active = false; };
  }, [id]);

  const credits = useMemo(() => {
    const entries = [
      ...(person?.credits?.cast || []),
      ...(person?.credits?.crew || []),
    ];
    const unique = new Map();
    entries.forEach((item) => {
      const type = item.media_type === "tv" ? "tv" : item.media_type === "movie" ? "movie" : null;
      if (!type || !item.id || !item.poster_path || !titleOf({ ...item, media_type: type })) return;
      const key = `${type}:${item.id}`;
      if (!unique.has(key)) unique.set(key, { ...item, media_type: type });
    });
    return [...unique.values()].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }, [person]);

  if (error) return <main className="mx-auto max-w-5xl p-5"><ErrorMessage message={error} retry={() => window.location.reload()} /></main>;
  if (!person) return <Loading text="Loading person details..." />;

  return (
    <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-5 sm:pt-8">
      <button onClick={() => navigate(location.key === "default" ? "/" : -1)} className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm font-bold text-slate-200 transition hover:border-cine-gold/60 hover:bg-[#151922] hover:text-white active:scale-95"><ArrowLeft size={16} aria-hidden="true" />Back</button>
      <section className="grid gap-7 rounded-2xl border border-cine-border bg-cine-panel p-5 sm:grid-cols-[190px_1fr] sm:p-7">
        <img src={img(person.profile_path, "w342")} alt={person.name} className="mx-auto aspect-[2/3] w-44 rounded-2xl object-cover shadow-xl sm:mx-0 sm:w-full" />
        <div className="min-w-0 self-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-cine-gold">Person details</p><h1 className="mt-2 text-4xl font-black sm:text-5xl">{person.name}</h1><p className="mt-3 text-sm font-bold text-slate-300">{person.known_for_department || "Cast"}</p><div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400"><span className="inline-flex items-center gap-1"><BriefcaseBusiness size={14} />{person.known_for_department || "Acting"}</span>{person.birthday && <span className="inline-flex items-center gap-1"><CalendarDays size={14} />{person.birthday}</span>}{person.place_of_birth && <span className="inline-flex items-center gap-1"><MapPin size={14} />{person.place_of_birth}</span>}{person.popularity != null && <span className="inline-flex items-center gap-1"><Star size={14} className="text-cine-gold" />{Number(person.popularity).toFixed(1)}</span>}</div><p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">{person.biography || "No biography available."}</p></div>
      </section>
      <section className="mt-9"><div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-cine-accent">Filmography</p><h2 className="mt-1 text-2xl font-black">Movies & TV Shows</h2></div><span className="text-xs text-slate-500">{credits.length} credits</span></div>{credits.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{credits.map((item) => <article key={`${item.media_type}:${item.id}`} className="group overflow-hidden rounded-xl border border-cine-border bg-cine-card"><button onClick={() => navigate(`/${item.media_type}/${item.id}`)} className="block w-full text-left"><div className="relative aspect-[2/3] overflow-hidden bg-slate-900"><img src={img(item.poster_path)} alt={titleOf(item)} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /><span className="absolute left-2 top-2 rounded-md bg-black/75 px-2 py-1 text-[9px] font-black">{item.media_type === "tv" ? "TV SHOW" : "MOVIE"}</span></div><div className="p-3"><h3 className="line-clamp-2 min-h-10 text-sm font-bold">{titleOf(item) || "Untitled"}</h3><div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>{year(item)}</span><span className="text-cine-gold">★ {Number(item.vote_average || 0).toFixed(1)}</span></div></div></button><button onClick={() => navigate(`/${item.media_type}/${item.id}`)} className="mx-3 mb-3 w-[calc(100%-1.5rem)] rounded-lg bg-white py-2 text-[10px] font-black text-black transition hover:scale-[1.02] hover:bg-cine-gold">DETAILS</button></article>)}</div> : <div className="rounded-2xl border border-dashed border-cine-border p-10 text-center text-slate-400">No filmography available.</div>}</section>
    </main>
  );
}
