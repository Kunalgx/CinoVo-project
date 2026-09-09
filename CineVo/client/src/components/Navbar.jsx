import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import useDebounce from "../hooks/useDebounce";
import { movieService } from "../services/movieService";
import { img, titleOf, year } from "../utils/tmdb";
import { LogIn, Moon, Search as SearchIcon, Sun, UserRound } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import Avatar from "./Avatar";

const desktopLink = () => "cine-nav-link rounded-lg px-2.5 py-2 text-xs font-bold transition";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [suggest, setSuggest] = useState([]);
  const dq = useDebounce(q, 260);

  useEffect(() => {
    let active = true;
    async function loadSuggestions() {
      if (!dq) { setSuggest([]); return; }
      try {
        const response = await movieService.search({ query: dq, page: 1 });
        if (active) setSuggest((response.data.data.results || []).filter((item) => item.media_type === "movie" || item.media_type === "tv").slice(0, 8));
      } catch { if (active) setSuggest([]); }
    }
    loadSuggestions();
    return () => { active = false; };
  }, [dq]);

  const submitSearch = () => {
    if (!q.trim()) return;
    setOpen(false);
    nav(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-cine-border bg-cine-bg/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1450px] flex-wrap items-center gap-3 px-3 py-2.5 sm:px-5 md:flex-nowrap">
        <Link to="/" className="shrink-0 text-xl font-black tracking-tight">Cine<span className="text-slate-400">Vo</span></Link>
        <div className="order-2 ml-auto flex items-center gap-2 md:order-3 md:hidden">
          <Link to={user ? "/profile" : "/login"} aria-label={user ? "Open profile" : "Log in"} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cine-border bg-cine-panel text-cine-muted transition hover:border-cine-gold/70 hover:text-cine-gold">
            {user ? <UserRound size={16} /> : <LogIn size={16} />}
          </Link>
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cine-border bg-cine-panel text-cine-gold transition hover:-translate-y-0.5 hover:border-cine-gold/70">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
        <div className="relative order-3 w-full min-w-0 md:order-2 md:flex-1 md:max-w-xl">
          <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input value={q} onChange={(event) => setQ(event.target.value)} onFocus={() => setOpen(true)} onKeyDown={(event) => event.key === "Enter" && submitSearch()} placeholder="Search movies, TV shows, people..." className="h-10 w-full rounded-xl border border-cine-border bg-cine-input pl-9 pr-3 text-sm outline-none transition focus:border-cine-gold/60" />
          {open && suggest.length > 0 && <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-xl border border-cine-border bg-cine-panel shadow-2xl">{suggest.map((item) => <button key={`${item.media_type}:${item.id}`} onClick={() => { setQ(""); setOpen(false); nav(`/${item.media_type}/${item.id}`); }} className="flex w-full gap-3 p-2 text-left hover:bg-slate-800"><img src={img(item.poster_path, "w92")} alt="" className="h-12 w-8 rounded object-cover" /><span className="min-w-0"><b className="block truncate text-xs">{titleOf(item)}</b><small className="text-[10px] text-slate-500">{item.media_type?.toUpperCase()} · {year(item)} · ★ {Number(item.vote_average || 0).toFixed(1)}</small></span></button>)}</div>}
        </div>
        <nav className="order-2 ml-auto hidden items-center gap-1 md:order-3 md:flex">
          {user ? <><NavLink className={desktopLink} to="/timeline">◈ Timeline</NavLink><NavLink className={desktopLink} to="/random">✦ Pick</NavLink><NavLink className={desktopLink} to="/watchlist">Watchlist</NavLink><NavLink aria-label="Open profile" title="Open profile" className="rounded-full transition hover:-translate-y-0.5 hover:ring-2 hover:ring-cine-gold/60" to="/profile"><Avatar user={user} size="h-8 w-8 text-xs" /></NavLink><button onClick={logout} className="cine-nav-action rounded-lg border border-cine-border px-2.5 py-2 text-xs font-bold transition hover:border-red-400/50">Logout</button></> : <><Link className="cine-nav-action rounded-lg px-2.5 py-2 text-xs font-bold transition" to="/login">Login</Link><Link className="rounded-lg bg-white px-3 py-2 text-xs font-black text-black" to="/register">Register</Link></>}
          <button type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} className="ml-1 inline-flex h-8 w-[66px] items-center gap-1 rounded-full border border-cine-border bg-cine-panel p-1 text-[10px] font-black text-cine-muted transition hover:border-cine-gold/70">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200 ${theme === "light" ? "translate-x-7 bg-cine-gold text-black" : "bg-white/10 text-cine-gold"}`}>{theme === "dark" ? <Moon size={13} /> : <Sun size={13} />}</span>
            <span className="sr-only">{theme}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
