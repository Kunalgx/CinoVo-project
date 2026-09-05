import { img, titleOf, dateOf, year } from "../utils/tmdb";
import { CalendarDays, CheckCircle2, CircleCheck, Eye } from "lucide-react";
export default function MovieCard({
  item,
  onDetails,
  watched = false,
  scheduled = false,
  onWatched,
  onScheduled,
}) {
  const type = item.media_type || (item.first_air_date ? "tv" : "movie");
  const title = titleOf(item) || "Untitled";
  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-cine-border bg-cine-card shadow-[var(--cine-shadow)] transition duration-200 hover:-translate-y-1 hover:scale-[1.01] hover:border-cine-gold/50">
      <button
        className="block w-full min-w-0 flex-1 text-left"
        onClick={() => onDetails(item.id, type)}
      >
        <div className="relative aspect-[2/3] overflow-hidden bg-slate-900">
          <img
            src={img(item.poster_path)}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <span className="absolute left-2 top-2 rounded-md bg-black/75 px-2 py-1 text-[9px] font-extrabold tracking-wide text-white">
            {type === "tv" ? "TV SHOW" : "MOVIE"}
          </span>
        </div>
        <div className="p-3 pb-2">
          <div className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-5">
            {title}
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-cine-muted">
            <span>{year(item)}</span>
            <span className="font-extrabold text-cine-gold">
              ★ {Number(item.vote_average || 0).toFixed(1)}
            </span>
          </div>
        </div>
      </button>
      <div className="flex items-center gap-1.5 px-3 pb-3">
        <button
          onClick={() => onDetails(item.id, type)}
          title="Open details"
          className="min-w-0 flex-1 rounded-lg border border-transparent bg-white px-2 py-2 text-[10px] font-extrabold text-black transition duration-200 hover:-translate-y-0.5 hover:border-cine-gold hover:bg-cine-gold hover:shadow-[0_0_18px_rgba(245,197,24,0.2)]"
        >
          <span className="inline-flex items-center justify-center gap-1"><Eye size={13} />DETAILS</span>
        </button>
        <button
          onClick={() => onWatched?.(item, type)}
          aria-label={watched ? "Watched" : "Mark watched"}
          title={watched ? "Watched - click to unwatch" : "Mark watched"}
          className={`h-8 w-8 flex-none rounded-lg border text-xs font-black transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(245,197,24,0.22)] ${watched ? "border-cine-gold bg-cine-gold text-black" : "border-cine-border bg-cine-panel text-cine-muted hover:border-cine-gold/70 hover:text-cine-gold"}`}
        >
          {watched ? <CircleCheck size={16} /> : <CheckCircle2 size={16} />}
        </button>
        <button
          onClick={() => onScheduled?.(item, type)}
          aria-label={scheduled ? "Scheduled" : "Schedule"}
          title={scheduled ? "Scheduled - click to remove" : "Schedule"}
          className={`h-8 w-8 flex-none rounded-lg border text-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(229,107,85,0.22)] ${scheduled ? "border-cine-accent bg-cine-accent text-white" : "border-cine-border bg-cine-panel text-cine-muted hover:border-cine-accent/70 hover:text-cine-accent"}`}
        >
          <CalendarDays size={16} />
        </button>
      </div>
    </article>
  );
}
