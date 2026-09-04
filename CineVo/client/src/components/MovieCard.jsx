import { img, titleOf, dateOf, year } from "../utils/tmdb";
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
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-cine-border bg-cine-card transition duration-200 hover:-translate-y-1 hover:border-slate-500">
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
          <span className="absolute left-2 top-2 rounded-md bg-black/75 px-2 py-1 text-[9px] font-extrabold tracking-wide">
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
          className="min-w-0 flex-1 rounded-lg bg-slate-100 px-2 py-2 text-[10px] font-extrabold text-black transition hover:bg-white"
        >
          DETAILS
        </button>
        <button
          onClick={() => onWatched?.(item, type)}
          aria-label={watched ? "Watched" : "Mark watched"}
          className={`h-8 w-8 flex-none rounded-lg text-xs font-black ${watched ? "bg-cine-gold text-black" : "bg-slate-100 text-black"}`}
        >
          {watched ? "✓" : "○"}
        </button>
        <button
          onClick={() => onScheduled?.(item, type)}
          aria-label={scheduled ? "Scheduled" : "Schedule"}
          className={`h-8 w-8 flex-none rounded-lg text-xs ${scheduled ? "bg-cine-accent text-white" : "bg-slate-100 text-black"}`}
        >
          {scheduled ? "✓" : "⌚"}
        </button>
      </div>
    </article>
  );
}
