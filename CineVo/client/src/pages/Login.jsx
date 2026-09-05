import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
export default function Login() {
  const nav = useNavigate(),
    loc = useLocation(),
    { setUser } = useAuth();
  const [f, setF] = useState({ email: "", password: "" }),
    [err, setErr] = useState(""),
    [busy, setBusy] = useState(false);
  const info = loc.state?.message;
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await authService.login(f);
      setUser(r.data.user);
      nav(loc.state?.from || "/");
    } catch (e) {
      setErr(e.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Auth
      title="Welcome back"
      submit={submit}
      f={f}
      setF={setF}
      err={err}
      info={info}
      busy={busy}
      button="LOGIN"
    >
      <p className="text-center text-sm text-slate-400">
        <Link to="/forgot-password" className="text-cine-gold hover:underline">
          Forgot password?
        </Link>
      </p>
      <p className="text-center text-sm text-slate-400">
        New here?{" "}
        <Link to="/register" className="cine-surface-link underline">
          Create an account
        </Link>
      </p>
    </Auth>
  );
}
function Auth({ title, submit, f, setF, err, info, busy, button, children }) {
  return (
    <main className="flex min-h-[calc(100vh-70px)] items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-4 rounded-2xl border border-cine-border bg-cine-panel p-6 shadow-2xl"
      >
        <h1 className="text-3xl font-black">{title}</h1>
        {err && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
            {err}
          </div>
        )}
        {info && <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{info}</div>}
        <input
          type="email"
          required
          placeholder="Email"
          value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })}
          className="w-full rounded-lg border border-cine-border bg-slate-900 p-3"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
          className="w-full rounded-lg border border-cine-border bg-slate-900 p-3"
        />
        <button
          disabled={busy}
          className="w-full rounded-lg bg-white py-3 font-black text-black disabled:opacity-50"
        >
          {busy ? "PLEASE WAIT..." : button}
        </button>
        {children}
      </form>
    </main>
  );
}
