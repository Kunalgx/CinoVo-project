import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../services/authService";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(token ? "" : "This reset link is missing a token.");

  const submit = async (event) => {
    event.preventDefault();
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    setError("");
    try {
      await authService.resetPassword({ token, password });
      navigate("/login", { replace: true, state: { message: "Password reset successfully. You can now log in." } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to reset password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-70px)] items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-cine-border bg-cine-panel p-6 shadow-2xl sm:p-8">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-cine-gold">Secure your account</p><h1 className="mt-2 text-3xl font-black">Set a new password</h1><p className="mt-2 text-sm text-slate-400">Choose a strong password with at least 8 characters.</p></div>
        {error && <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
        <div className="relative"><input type={show ? "text" : "password"} required minLength="8" autoComplete="new-password" placeholder="New password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-cine-border bg-slate-900 p-3 pr-20 outline-none focus:border-cine-gold" /><button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-white">{show ? "HIDE" : "SHOW"}</button></div>
        <input type={show ? "text" : "password"} required minLength="8" autoComplete="new-password" placeholder="Confirm new password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className="w-full rounded-xl border border-cine-border bg-slate-900 p-3 outline-none focus:border-cine-gold" />
        <button disabled={busy || !token} className="w-full rounded-xl bg-cine-gold py-3 font-black text-black disabled:opacity-50">{busy ? "RESETTING..." : "RESET PASSWORD"}</button>
        <p className="text-center text-sm text-slate-400"><Link to="/login" className="text-white hover:underline">Back to login</Link></p>
      </form>
    </main>
  );
}
