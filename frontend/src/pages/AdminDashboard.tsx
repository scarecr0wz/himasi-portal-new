import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";

const API = "/api";
const LATEST_LIMIT = 5;

type Anggota = {
  id: string;
  name: string;
  nim: string;
  email: string;
  angkatan: string | null;
  membershipStatus: string;
  departemen: { id: string; title: string } | null;
};

export default function AdminDashboard() {
  const { token } = useAuth();
  const [anggotaList, setAnggotaList] = useState<Anggota[]>([]);
  const [anggotaLoading, setAnggotaLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setAnggotaLoading(false);
      return;
    }
    fetch(`${API}/admin/mahasiswa?limit=${LATEST_LIMIT}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setAnggotaList(Array.isArray(data) ? data.slice(0, LATEST_LIMIT) : []))
      .catch(() => setAnggotaList([]))
      .finally(() => setAnggotaLoading(false));
  }, [token]);

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
                <span className="text-slate-600">DASHBOARD</span>
              </div>
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-500 mt-2 text-[15px]">
          Selamat datang di pusat kendali akademik. Kelola infrastruktur digital universitas dalam satu pintu.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          <h2 className="text-xl font-bold text-slate-800">Quick Access Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <Link
            to="/admin/settings"
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all group cursor-pointer block text-left no-underline text-inherit"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">ADMIN PORTAL</p>
              <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-primary transition-colors">
                User Administrasi
              </h3>
            </div>
          </Link>
          <Link
            to="/admin/mahasiswa"
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all group cursor-pointer block text-left no-underline text-inherit"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">school</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">MAHASISWA</p>
              <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-primary transition-colors">
                Data Anggota
              </h3>
            </div>
          </Link>
          <Link
            to="/admin/settings"
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all group cursor-pointer block text-left no-underline text-inherit"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="p-4 bg-teal-50 text-teal-600 rounded-2xl group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">lock</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">SECURITY</p>
              <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-primary transition-colors">
                Akses & Wewenang
              </h3>
            </div>
          </Link>
          <Link
            to="/admin/content"
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all group cursor-pointer block text-left no-underline text-inherit"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">description</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PUBLICATION</p>
              <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-primary transition-colors">
                Kelola Konten
              </h3>
            </div>
          </Link>
          <Link
            to="/admin/menus"
            className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all group cursor-pointer block text-left no-underline text-inherit"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
                <span className="material-symbols-outlined text-3xl">menu</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">STRUCTURE</p>
              <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-primary transition-colors">
                Navigasi Portal
              </h3>
            </div>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="font-bold text-slate-800">Daftar Anggota Terbaru</h3>
          </div>
          <Link
            to="/admin/mahasiswa"
            className="text-primary text-xs font-extrabold uppercase tracking-wider hover:underline px-4 py-2 bg-primary/5 rounded-lg transition-all"
          >
            Kelola di Data Anggota
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Profil</th>
                <th className="px-8 py-5">Angkatan</th>
                <th className="px-8 py-5">Status Keanggotaan</th>
                <th className="px-8 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {anggotaLoading && (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-slate-500 text-sm">
                    Memuat...
                  </td>
                </tr>
              )}
              {!anggotaLoading && anggotaList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-slate-500 text-sm">
                    Belum ada data anggota.
                  </td>
                </tr>
              )}
              {!anggotaLoading &&
                anggotaList.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-primary/10 overflow-hidden ring-1 ring-slate-200 flex items-center justify-center text-primary font-semibold text-sm">
                          {a.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{a.name}</p>
                          <p className="text-xs text-slate-400">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-600">{a.angkatan ?? "—"}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full ${a.membershipStatus === "ACTIVE" ? "bg-green-500" : "bg-slate-300"}`}
                        />
                        <span className="text-xs text-slate-700 font-bold uppercase tracking-tight">
                          {a.membershipStatus}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <Link
                        to="/admin/mahasiswa"
                        className="text-primary text-xs font-semibold hover:underline"
                      >
                        Kelola
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
