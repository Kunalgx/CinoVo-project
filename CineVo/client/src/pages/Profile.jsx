import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import Avatar from "../components/Avatar";
import Loading from "../components/Loading";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxBytes = 5 * 1024 * 1024;

export default function Profile() {
  const { user, setUser } = useAuth();
  const inputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", currentPassword: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    userService.profile()
      .then((response) => {
        const next = response.data.user;
        setProfile(next);
        setForm((current) => ({ ...current, name: next.name }));
      })
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load profile."));
  }, []);

  const updateUser = (avatar) => {
    setProfile((current) => ({ ...current, avatar }));
    setUser((current) => ({ ...current, avatar }));
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!allowedTypes.includes(file.type)) { setError("Use a JPG, PNG, or WEBP image."); return; }
    if (file.size > maxBytes) { setError("Avatar must be smaller than 5 MB."); return; }
    setUploading(true); setError(""); setMessage("");
    try {
      const response = await userService.imageKitAuth();
      const auth = response.data.data;
      const body = new FormData();
      body.append("file", file);
      body.append("fileName", `avatar-${user?.id || "user"}-${Date.now()}`);
      body.append("folder", "/CineVo");
      body.append("publicKey", auth.publicKey);
      body.append("signature", auth.signature);
      body.append("expire", auth.expire);
      body.append("token", auth.token);
      const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", { method: "POST", body });
      const uploaded = await uploadResponse.json();
      if (!uploadResponse.ok || !uploaded.url) throw new Error(uploaded.message || "Image upload failed");
      const saved = await userService.updateAvatar(uploaded.url);
      updateUser(saved.data.user.avatar);
      setMessage("Profile photo updated.");
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || uploadError.message || "Upload failed.");
    } finally { setUploading(false); }
  };

  const removeAvatar = async () => {
    setUploading(true); setError("");
    try {
      await userService.updateAvatar("");
      updateUser("");
      setMessage("Profile photo removed.");
    } catch (removeError) { setError(removeError.response?.data?.message || "Could not remove avatar."); }
    finally { setUploading(false); }
  };

  const save = async (event) => {
    event.preventDefault(); setError(""); setMessage("");
    try {
      await userService.update(form);
      setMessage("Profile updated successfully.");
      setForm((current) => ({ ...current, currentPassword: "", password: "" }));
    } catch (saveError) { setError(saveError.response?.data?.message || "Update failed"); }
  };

  if (!profile) return <Loading text="Loading profile..." />;
  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-9">
      <section className="overflow-hidden rounded-2xl border border-cine-border bg-cine-panel shadow-[var(--cine-shadow)]">
        <div className="border-b border-cine-border bg-gradient-to-r from-cine-gold/15 to-transparent p-5 sm:p-7"><p className="text-xs font-black uppercase tracking-[0.2em] text-cine-gold">Account</p><h1 className="mt-2 text-3xl font-black">Your Profile</h1><p className="mt-1 text-sm text-cine-muted">Manage your identity and CineVo preferences.</p></div>
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-4"><Avatar user={profile} size="h-24 w-24 text-3xl" /><div className="min-w-0 flex-1"><h2 className="truncate text-xl font-black">{profile.name}</h2><p className="truncate text-sm text-cine-muted">{profile.email}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-cine-gold px-3 py-2 text-xs font-black text-black transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-50"><ImagePlus size={14} />{uploading ? "UPLOADING..." : "CHANGE PHOTO"}</button>{profile.avatar && <button type="button" disabled={uploading} onClick={removeAvatar} className="inline-flex items-center gap-2 rounded-lg border border-cine-border px-3 py-2 text-xs font-black text-cine-muted transition hover:border-red-400/60 hover:text-red-400"><Trash2 size={14} />REMOVE</button>}<input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} className="hidden" /></div></div></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3"><Stat label="Watched" value={profile.watchedCount} /><Stat label="Scheduled" value={profile.scheduledCount} /><Stat label="Member since" value={new Date(profile.createdAt).toLocaleDateString()} /></div>
          <form onSubmit={save} className="mt-8 space-y-3"><label className="block text-xs font-black uppercase tracking-wider text-cine-muted">Display name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border border-cine-border bg-cine-input p-3 text-sm outline-none focus:border-cine-gold" required /></label><label className="block text-xs font-black uppercase tracking-wider text-cine-muted">Email<input disabled value={profile.email} className="mt-2 w-full rounded-xl border border-cine-border bg-cine-input/60 p-3 text-sm text-cine-muted" /></label><div className="my-5 border-t border-cine-border" /><label className="block text-xs font-black uppercase tracking-wider text-cine-muted">Current password<input type="password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} className="mt-2 w-full rounded-xl border border-cine-border bg-cine-input p-3 text-sm outline-none focus:border-cine-gold" placeholder="Only required to change password" /></label><label className="block text-xs font-black uppercase tracking-wider text-cine-muted">New password<input type="password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full rounded-xl border border-cine-border bg-cine-input p-3 text-sm outline-none focus:border-cine-gold" placeholder="8+ characters" /></label><button className="rounded-xl bg-cine-gold px-5 py-3 text-xs font-black text-black transition hover:-translate-y-0.5 hover:brightness-110">SAVE CHANGES</button>{uploading && <Loader2 className="inline animate-spin text-cine-gold" size={18} />}{message && <p className="text-sm text-emerald-500">{message}</p>}{error && <p className="text-sm text-red-400">{error}</p>}</form>
        </div>
      </section>
    </main>
  );
}
function Stat({ label, value }) { return <div className="rounded-xl border border-cine-border bg-cine-input p-3"><div className="text-2xl font-black">{value}</div><div className="text-xs text-cine-muted">{label}</div></div>; }
