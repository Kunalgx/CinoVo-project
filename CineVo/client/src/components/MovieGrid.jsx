import MovieCard from "./MovieCard";
export default function MovieGrid({ items, ...props }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((x, i) => {
        const type = x.media_type || (x.first_air_date ? "tv" : "movie");
        const watched = typeof props.watched === "function" ? props.watched(x, type) : props.watched;
        const scheduled = typeof props.scheduled === "function" ? props.scheduled(x, type) : props.scheduled;
        return (
          <MovieCard
            key={`${x.media_type}:${x.id}:${i}`}
            item={x}
            {...props}
            watched={Boolean(watched)}
            scheduled={Boolean(scheduled)}
          />
        );
      })}
    </div>
  );
}
