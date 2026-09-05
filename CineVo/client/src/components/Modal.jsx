export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-auto rounded-2xl border border-cine-border bg-cine-panel p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="h-9 w-9 rounded-lg border border-cine-border bg-cine-input text-lg text-slate-300 transition hover:bg-cine-card"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
