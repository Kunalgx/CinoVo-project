export default function Toast({ message }) {
  return message ? (
    <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-black shadow-2xl">
      {message}
    </div>
  ) : null;
}
