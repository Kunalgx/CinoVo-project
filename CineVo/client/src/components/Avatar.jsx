export default function Avatar({ user, size = "h-9 w-9", className = "" }) {
  const initial = user?.name?.trim()?.[0]?.toUpperCase() || "C";
  return (
    <span className={`inline-flex flex-none items-center justify-center overflow-hidden rounded-full border border-cine-border bg-cine-gold font-black text-black ${size} ${className}`}>
      {user?.avatar ? <img src={user.avatar} alt={`${user.name || "User"} avatar`} className="h-full w-full object-cover" /> : initial}
    </span>
  );
}
