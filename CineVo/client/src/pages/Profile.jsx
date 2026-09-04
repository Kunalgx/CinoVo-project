import { useEffect, useState } from "react";
import { userService } from "../services/userService";
import Loading from "../components/Loading";
export default function Profile() {
  const [d, setD] = useState(null),
    [f, setF] = useState({ name: "", currentPassword: "", password: "" }),
    [msg, setMsg] = useState("");
  useEffect(() => {
    userService.profile().then((r) => {
      setD(r.data.user);
      setF((x) => ({ ...x, name: r.data.user.name }));
    });
  }, []);
  if (!d) return <Loading />;
  const save = async (e) => {
    e.preventDefault();
    try {
      await userService.update(f);
      setMsg("Profile updated successfully.");
      setF((x) => ({ ...x, currentPassword: "", password: "" }));
    } catch (e) {
      setMsg(e.response?.data?.message || "Update failed");
    }
  };
  const upload = async (e) => {
    if (!e.target.files[0]) return;
    const fd = new FormData();
    fd.append("avatar", e.target.files[0]);
    try {
      const r = await userService.avatar(fd);
      setD({ ...d, avatar: r.data.avatar });
      setMsg("Avatar updated.");
    } catch (e) {
      setMsg(e.response?.data?.message || "Upload failed");
    }
  };
  return (
    <main className="mx-auto max-w-3xl p-5">
      <div className="rounded-2xl border border-cine-border bg-cine-panel p-6">
        <h1 className="text-3xl font-black">Profile</h1>
        <div className="my-6 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-800 text-2xl font-black">
            {d.avatar ? (
              <img
                src={`${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "")}${d.avatar}`}
                className="h-full w-full object-cover"
              />
            ) : (
              d.name[0]
            )}
          </div>
          <label className="rounded-lg border border-cine-border px-3 py-2 text-xs font-bold">
            Upload avatar
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={upload}
              className="hidden"
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat l="Watched" v={d.watchedCount} />
          <Stat l="Scheduled" v={d.scheduledCount} />
          <Stat
            l="Member since"
            v={new Date(d.createdAt).toLocaleDateString()}
          />
        </div>
        <form onSubmit={save} className="mt-7 space-y-3">
          <input
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            className="w-full rounded-lg border border-cine-border bg-slate-900 p-3"
            placeholder="Name"
          />
          <input
            disabled
            value={d.email}
            className="w-full rounded-lg border border-cine-border bg-slate-900/60 p-3 text-slate-500"
          />
          <hr className="border-cine-border" />
          <input
            type="password"
            value={f.currentPassword}
            onChange={(e) => setF({ ...f, currentPassword: e.target.value })}
            className="w-full rounded-lg border border-cine-border bg-slate-900 p-3"
            placeholder="Current password (only to change password)"
          />
          <input
            type="password"
            minLength="8"
            value={f.password}
            onChange={(e) => setF({ ...f, password: e.target.value })}
            className="w-full rounded-lg border border-cine-border bg-slate-900 p-3"
            placeholder="New password (8+ characters)"
          />
          <button className="rounded-lg bg-white px-4 py-3 text-xs font-black text-black">
            SAVE CHANGES
          </button>
          {msg && <p className="text-sm text-slate-300">{msg}</p>}
        </form>
      </div>
    </main>
  );
}
function Stat({ l, v }) {
  return (
    <div className="rounded-xl border border-cine-border bg-[#151922] p-3">
      <div className="text-2xl font-black">{v}</div>
      <div className="text-xs text-slate-500">{l}</div>
    </div>
  );
}
