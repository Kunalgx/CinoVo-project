import { NavLink, useLocation } from "react-router-dom";

const items = [
  ["/", "⌂", "Home"],
  ["/search", "⌕", "Search"],
  ["/timeline", "◈", "Watch Journey"],
  ["/random", "✦", "Pick for Me"],
];

export default function MobileBottomNav() {
  const location = useLocation();
  if (["/login", "/register", "/forgot-password", "/reset-password"].includes(location.pathname)) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0d1119]/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-2xl backdrop-blur-xl md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        {items.map(([to, icon, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition ${isActive ? "bg-cine-gold/15 text-cine-gold" : "text-slate-500 hover:text-slate-200"}`}
          >
            <span className="text-lg leading-none">{icon}</span>
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
