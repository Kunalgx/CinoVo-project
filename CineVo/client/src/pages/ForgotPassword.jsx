import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await authService.forgotPassword({ email });
      setMessage(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to send reset instructions.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-70px)] items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-cine-border bg-cine-panel p-6 shadow-2xl sm:p-8">
        <div><p className="text-xs font-black uppercase tracking-[0.2em] text-cine-gold">Account recovery</p><h1 className="mt-2 text-3xl font-black">Forgot password?</h1><p className="mt-2 text-sm leading-6 text-slate-400">Enter your email and we will send reset instructions if an account exists.</p></div>
        {error && <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
        {message && <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</div>}
        <input type="email" required autoComplete="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-cine-border bg-slate-900 p-3 outline-none focus:border-cine-gold" />
        <button disabled={busy} className="w-full rounded-xl bg-cine-gold py-3 font-black text-black disabled:opacity-50">{busy ? "SENDING..." : "SEND RESET LINK"}</button>
        <p className="text-center text-sm text-slate-400"><Link to="/login" className="text-white hover:underline">Back to login</Link></p>
      </form>
    </main>
  );
}
