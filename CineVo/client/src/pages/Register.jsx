import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
export default function Register() {
  const nav = useNavigate(),
    { setUser } = useAuth();
  const [f, setF] = useState({ name: "", email: "", password: "" }),
    [err, setErr] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await authService.register(f);
      setUser(r.data.user);
      nav("/");
    } catch (e) {
      setErr(e.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="flex min-h-[calc(100vh-70px)] items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-4 rounded-2xl border border-cine-border bg-cine-panel p-6 shadow-2xl"
      >
        <h1 className="text-3xl font-black">Create your CineVo account</h1>
        {err && (
          <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
            {err}
          </div>
        )}
        <input
          required
          minLength="2"
          placeholder="Name"
          value={f.name}
          onChange={(e) => setF({ ...f, name: e.target.value })}
          className="w-full rounded-lg border border-cine-border bg-slate-900 p-3"
        />
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
          minLength="8"
          placeholder="Password (8+ characters)"
          value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })}
          className="w-full rounded-lg border border-cine-border bg-slate-900 p-3"
        />
        <button
          disabled={busy}
          className="w-full rounded-lg bg-white py-3 font-black text-black"
        >
          {busy ? "CREATING..." : "REGISTER"}
        </button>
        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="cine-surface-link underline">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
