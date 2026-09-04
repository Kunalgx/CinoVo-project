export default function Loading({ text = "Loading..." }) {
  return (
    <div className="py-16 text-center text-cine-muted">
      <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-white" />
      {text}
    </div>
  );
}
