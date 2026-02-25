import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";

const API = "/api";

type Mahasiswa = {
  id: string;
  name: string;
  nim: string;
  email: string;
  angkatan: string | null;
  membershipStatus: string;
  programStudi: string;
  departemen: { id: string; title: string } | null;
};

export default function AdminMahasiswa() {
  const { token } = useAuth();
  const [list, setList] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      setLoading(true);
      setError(null);
      const url = `${API}/admin/mahasiswa${search ? `?search=${encodeURIComponent(search)}` : ""}`;
      fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => {
          if (!r.ok) throw new Error("Gagal memuat data mahasiswa");
          return r.json();
        })
        .then((data) => {
          if (!cancelled) setList(Array.isArray(data) ? data : []);
        })
        .catch((e) => {
          if (!cancelled) setError(e instanceof Error ? e.message : "Gagal memuat data");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, search ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [token, search]);

  return (
    <div className="space-y-8">
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
                <span className="text-slate-600">DATA MAHASISWA</span>
              </div>
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Data Mahasiswa</h1>
        <p className="text-slate-500 mt-2 text-[15px]">
          Daftar mahasiswa anggota HIMASI. Cari berdasarkan NIM, nama, atau email.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-bold text-slate-800">Daftar Mahasiswa</h2>
          </div>
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
              search
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari NIM, nama, email..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">NIM</th>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Angkatan</th>
                <th className="px-6 py-4">Departemen</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500 text-sm">
                    Memuat...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-red-600 text-sm">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && list.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500 text-sm">
                    {search ? "Tidak ada hasil untuk pencarian ini." : "Belum ada data mahasiswa."}
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                list.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-slate-700">{m.nim}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800 text-sm">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{m.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{m.angkatan ?? "—"}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {m.departemen?.title ?? "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                          m.membershipStatus === "ACTIVE"
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {m.membershipStatus}
                      </span>
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
      </div>
    </div>
  );
}
