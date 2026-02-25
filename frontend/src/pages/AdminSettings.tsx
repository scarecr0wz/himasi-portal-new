import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";

const API = "/api";

type AdminUser = { id: string; name: string; email: string; nim: string; roles: string[] };

export default function AdminSettings() {
  const { token } = useAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(true);
  const [adminUsersError, setAdminUsersError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setAdminUsersLoading(false);
      return;
    }
    let cancelled = false;
    setAdminUsersLoading(true);
    setAdminUsersError(null);
    fetch(`${API}/admin/settings/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Gagal memuat data");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setAdminUsers(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        if (!cancelled) setAdminUsersError(e instanceof Error ? e.message : "Gagal memuat data");
      })
      .finally(() => {
        if (!cancelled) setAdminUsersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const [smtp, setSmtp] = useState({
    host: "",
    port: "587",
    user: "",
    password: "",
    fromEmail: "",
    fromName: "",
    secure: false,
  });
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpMessage, setSmtpMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSmtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSmtp((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSmtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpMessage(null);
    setSmtpSaving(true);
    try {
      // TODO: wire to API PUT /api/admin/settings/smtp when backend ready
      await new Promise((r) => setTimeout(r, 600));
      setSmtpMessage({ type: "success", text: "Konfigurasi SMTP berhasil disimpan." });
    } catch {
      setSmtpMessage({ type: "error", text: "Gagal menyimpan konfigurasi SMTP." });
    } finally {
      setSmtpSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <nav aria-label="Breadcrumb" className="flex mb-4">
          <ol className="inline-flex items-center space-x-1 md:space-x-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <li className="inline-flex items-center">
              <Link to="/admin" className="hover:text-primary transition-colors">
                ADMIN PORTAL
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="material-symbols-outlined text-sm mx-1 text-slate-300">chevron_right</span>
                <span className="text-slate-600">PENGATURAN</span>
              </div>
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Pengaturan</h1>
        <p className="text-slate-500 mt-2 text-[15px]">
          Kelola user administrasi, role & permission (RBAC), dan konfigurasi SMTP.
        </p>
      </div>

      {/* User Administrasi Portal */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-bold text-slate-800">User Administrasi Portal</h2>
          </div>
          <p className="text-slate-500 text-sm mt-2">
            Kelola akun yang dapat mengakses konsol admin (role admin/superadmin). Data mahasiswa dikelola di menu{" "}
            <Link to="/admin/mahasiswa" className="text-primary font-medium hover:underline">
              Data Mahasiswa
            </Link>
            .
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email / NIM</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminUsersLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500 text-sm">
                    Memuat...
                  </td>
                </tr>
              )}
              {!adminUsersLoading && adminUsersError && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-red-600 text-sm">
                    {adminUsersError}
                  </td>
                </tr>
              )}
              {!adminUsersLoading && !adminUsersError && adminUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500 text-sm">
                    Belum ada user administrasi.
                  </td>
                </tr>
              )}
              {!adminUsersLoading &&
                !adminUsersError &&
                adminUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {[u.email, u.nim].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg uppercase"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-primary p-2 hover:bg-slate-100 rounded-lg transition-all"
                        aria-label="Menu"
                      >
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            className="text-primary text-sm font-semibold flex items-center gap-2 hover:underline"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Tambah user administrasi
          </button>
        </div>
      </div>

      {/* Role & Permission (RBAC) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-bold text-slate-800">Role & Permission (RBAC)</h2>
          </div>
          <p className="text-slate-500 text-sm mt-2">
            Atur role dan permission untuk user administrasi. Assign permission per role (menu, aksi).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">Permission</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-800 text-sm">superadmin</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">Akses penuh ke semua fitur</td>
                <td className="px-6 py-4">
                  <span className="text-[11px] text-slate-500">* (semua)</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    className="text-slate-400 hover:text-primary p-2 hover:bg-slate-100 rounded-lg transition-all"
                    aria-label="Menu"
                  >
                    <span className="material-symbols-outlined text-lg">more_vert</span>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-800 text-sm">admin</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">Admin portal, tanpa pengaturan sistem</td>
                <td className="px-6 py-4">
                  <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">cms, users, content</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    className="text-slate-400 hover:text-primary p-2 hover:bg-slate-100 rounded-lg transition-all"
                    aria-label="Menu"
                  >
                    <span className="material-symbols-outlined text-lg">more_vert</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            className="text-primary text-sm font-semibold flex items-center gap-2 hover:underline"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Tambah role
          </button>
        </div>
      </div>

      {/* Role & Permission (RBAC) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-bold text-slate-800">Role & Permission (RBAC)</h2>
          </div>
          <p className="text-slate-500 text-sm mt-2">
            Atur role dan permission untuk user administrasi. Assign permission per role (menu, aksi).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">Permission</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-800 text-sm">superadmin</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">Akses penuh ke semua fitur</td>
                <td className="px-6 py-4">
                  <span className="text-[11px] text-slate-500">* (semua)</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    className="text-slate-400 hover:text-primary p-2 hover:bg-slate-100 rounded-lg transition-all"
                    aria-label="Menu"
                  >
                    <span className="material-symbols-outlined text-lg">more_vert</span>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-800 text-sm">admin</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">Admin portal, tanpa pengaturan sistem</td>
                <td className="px-6 py-4">
                  <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">cms, users, content</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    className="text-slate-400 hover:text-primary p-2 hover:bg-slate-100 rounded-lg transition-all"
                    aria-label="Menu"
                  >
                    <span className="material-symbols-outlined text-lg">more_vert</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            className="text-primary text-sm font-semibold flex items-center gap-2 hover:underline"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Tambah role
          </button>
        </div>
      </div>

      {/* Konfigurasi SMTP */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-bold text-slate-800">Konfigurasi SMTP</h2>
          </div>
          <p className="text-slate-500 text-sm mt-2">
            Atur server SMTP untuk pengiriman email (notifikasi, reset password, dll).
          </p>
        </div>
        <form onSubmit={handleSmtpSubmit} className="p-6 space-y-5">
          {smtpMessage && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                smtpMessage.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {smtpMessage.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="smtp-host" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                SMTP Host
              </label>
              <input
                id="smtp-host"
                name="host"
                type="text"
                value={smtp.host}
                onChange={handleSmtpChange}
                placeholder="smtp.gmail.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
            </div>
            <div>
              <label htmlFor="smtp-port" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Port
              </label>
              <input
                id="smtp-port"
                name="port"
                type="text"
                value={smtp.port}
                onChange={handleSmtpChange}
                placeholder="587"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="smtp-user" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Username / Email
              </label>
              <input
                id="smtp-user"
                name="user"
                type="text"
                value={smtp.user}
                onChange={handleSmtpChange}
                placeholder="noreply@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
            </div>
            <div>
              <label htmlFor="smtp-password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Password / App Password
              </label>
              <input
                id="smtp-password"
                name="password"
                type="password"
                value={smtp.password}
                onChange={handleSmtpChange}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="smtp-fromEmail" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                From Email (pengirim)
              </label>
              <input
                id="smtp-fromEmail"
                name="fromEmail"
                type="email"
                value={smtp.fromEmail}
                onChange={handleSmtpChange}
                placeholder="noreply@himasi.ac.id"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
            </div>
            <div>
              <label htmlFor="smtp-fromName" className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                From Name (nama pengirim)
              </label>
              <input
                id="smtp-fromName"
                name="fromName"
                type="text"
                value={smtp.fromName}
                onChange={handleSmtpChange}
                placeholder="HIMASI Portal"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="smtp-secure"
              name="secure"
              type="checkbox"
              checked={smtp.secure}
              onChange={handleSmtpChange}
              className="rounded border-slate-300 text-primary focus:ring-primary/20"
            />
            <label htmlFor="smtp-secure" className="text-sm font-medium text-slate-700">
              Gunakan TLS/SSL (port 465)
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={smtpSaving}
              className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {smtpSaving ? (
                <>
                  <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                  Menyimpan...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">save</span>
                  Simpan Konfigurasi SMTP
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
