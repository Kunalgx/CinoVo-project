export default function Pagination({ page, onChange }) {
  const ps = Array.from({ length: 5 }, (_, i) => Math.max(1, page - 2) + i);
  return (
    <div className="mt-7 flex flex-wrap justify-center gap-1.5">
      {page > 1 && (
        <button
          onClick={() => onChange(page - 1)}
          className="rounded-lg border border-cine-border bg-slate-900 px-3 py-2 text-sm"
        >
          ← Previous
        </button>
      )}
      {ps.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`min-w-9 rounded-lg border border-cine-border px-3 py-2 text-sm ${p === page ? "bg-white text-black" : ""}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        className="rounded-lg border border-cine-border bg-slate-900 px-3 py-2 text-sm"
      >
        Next →
      </button>
    </div>
  );
}
