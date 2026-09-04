export default function ErrorMessage({
  message = "Something went wrong.",
  retry,
}) {
  return (
    <div className="rounded-xl border border-cine-border bg-cine-panel p-8 text-center text-slate-300">
      <p>{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black"
        >
          Retry
        </button>
      )}
    </div>
  );
}
