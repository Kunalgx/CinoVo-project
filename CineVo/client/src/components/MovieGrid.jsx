import MovieCard from "./MovieCard";
export default function MovieGrid({ items, ...props }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((x, i) => (
        <MovieCard key={`${x.media_type}:${x.id}:${i}`} item={x} {...props} />
      ))}
    </div>
  );
}
