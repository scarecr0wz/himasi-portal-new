import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";

const API = "/api";

type Mahasiswa = {
  id: string;
  name: string;
  nim: string;
  email: string;
  angkatan: string | null;
  phoneNumber: string | null;
  membershipStatus: string;
  programStudi: string;
  registrationReason: string | null;
  departemen: { id: string; title: string } | null;
};

type Departemen = { id: string; title: string; icon?: string; desc?: string };

function loadList(token: string, search: string): Promise<Mahasiswa[]> {
  const url = `${API}/admin/mahasiswa${search ? `?search=${encodeURIComponent(search)}` : ""}`;
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((r) => {
      if (!r.ok) throw new Error("Gagal memuat data mahasiswa");
      return r.json();
    })
    .then((data) => (Array.isArray(data) ? data : []));
}

export default function AdminMahasiswa() {
  const { token } = useAuth();
  const [list, setList] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [modalDetail, setModalDetail] = useState<Mahasiswa | null>(null);
  const [modalStatus, setModalStatus] = useState<Mahasiswa | null>(null);
  const [modalDivisi, setModalDivisi] = useState<Mahasiswa | null>(null);
  const [editStatus, setEditStatus] = useState<string>("PENDING");
  const [editDepartemenId, setEditDepartemenId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [departemens, setDepartemens] = useState<Departemen[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Mahasiswa | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const timeoutId = setTimeout(() => {
      loadList(token, search)
        .then((data) => { if (!cancelled) setList(data); })
        .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : "Gagal memuat data"); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, search ? 300 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [token, search]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/admin/departments`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setDepartemens(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!actionMenuId) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActionMenuId(null);
    };
    const t = setTimeout(() => document.addEventListener("click", handleClickOutside), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [actionMenuId]);

  const openStatusModal = (m: Mahasiswa) => {
    setActionMenuId(null);
    setModalStatus(m);
    setEditStatus(m.membershipStatus || "PENDING");
    setSaveError(null);
  };

  const openDivisiModal = (m: Mahasiswa) => {
    setActionMenuId(null);
    setModalDivisi(m);
    setEditDepartemenId(m.departemen?.id ?? "");
    setSaveError(null);
  };

  const handleSaveStatus = async () => {
    if (!token || !modalStatus) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`${API}/admin/mahasiswa/${modalStatus.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ membership_status: editStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan");
      setList((prev) => prev.map((x) => (x.id === modalStatus.id ? { ...x, membershipStatus: editStatus } : x)));
      setModalStatus(null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDivisi = async () => {
    if (!token || !modalDivisi) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`${API}/admin/mahasiswa/${modalDivisi.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ departemen_id: editDepartemenId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan");
      const newDept = departemens.find((d) => d.id === editDepartemenId) ?? null;
      setList((prev) =>
        prev.map((x) =>
          x.id === modalDivisi.id ? { ...x, departemen: newDept ? { id: newDept.id, title: newDept.title } : null } : x
        )
      );
      setModalDivisi(null);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleteError(null);
    setDeleteSubmitting(true);
    try {
      const res = await fetch(`${API}/admin/mahasiswa/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteError(data.message || "Gagal menghapus data.");
        return;
      }
      setList((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setDeleteError("Gagal menghapus data.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

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
                <span className="text-slate-600">DATA ANGGOTA</span>
              </div>
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Data Anggota</h1>
        <p className="text-slate-500 mt-2 text-[15px]">
          Daftar anggota HIMASI. Cari berdasarkan NIM, nama, atau email.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h2 className="text-lg font-bold text-slate-800">Daftar Anggota</h2>
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
                    {search ? "Tidak ada hasil untuk pencarian ini." : "Belum ada data anggota."}
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
                    <td className="px-6 py-4 text-sm text-slate-600">{m.departemen?.title ?? "—"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                          m.membershipStatus === "APPROVED" || m.membershipStatus === "ACTIVE"
                            ? "bg-green-50 text-green-700"
                            : m.membershipStatus === "PENDING"
                              ? "bg-amber-50 text-amber-700"
                              : m.membershipStatus === "REJECTED"
                                ? "bg-red-50 text-red-700"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {m.membershipStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <div ref={actionMenuId === m.id ? menuRef : undefined} className="relative inline-block">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuId(actionMenuId === m.id ? null : m.id);
                          }}
                          className="text-slate-400 hover:text-primary p-2 hover:bg-slate-100 rounded-lg transition-all"
                          aria-label="Menu aksi"
                        >
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>
                        {actionMenuId === m.id && (
                          <div className="absolute right-0 top-full mt-1 py-1 w-52 bg-white border border-slate-200 rounded-xl shadow-lg z-20">
                          <button
                            type="button"
                            onClick={() => {
                              setActionMenuId(null);
                              setModalDetail(m);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 text-sm"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                            Lihat detail
                          </button>
                          <button
                            type="button"
                            onClick={() => openStatusModal(m)}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 text-sm"
                          >
                            <span className="material-symbols-outlined text-lg">toggle_on</span>
                            Ubah status keanggotaan
                          </button>
                          <button
                            type="button"
                            onClick={() => openDivisiModal(m)}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 text-sm"
                          >
                            <span className="material-symbols-outlined text-lg">group_work</span>
                            Ubah divisi
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActionMenuId(null);
                              setDeleteTarget(m);
                              setDeleteError(null);
                            }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 text-sm"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                            Hapus
                          </button>
                        </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Lihat detail */}
      {modalDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Detail Anggota</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">NIM</dt>
                <dd className="font-mono text-slate-800">{modalDetail.nim}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Nama</dt>
                <dd className="text-slate-800">{modalDetail.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="text-slate-800">{modalDetail.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">No HP</dt>
                <dd className="text-slate-800">{modalDetail.phoneNumber ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Angkatan</dt>
                <dd className="text-slate-800">{modalDetail.angkatan ?? "—"}</dd>
              </div>
              {modalDetail.registrationReason && (
                <div>
                  <dt className="text-slate-500">Alasan bergabung</dt>
                  <dd className="text-slate-800 text-sm mt-1 whitespace-pre-wrap">{modalDetail.registrationReason}</dd>
                </div>
              )}
              <div>
                <dt className="text-slate-500">Program studi</dt>
                <dd className="text-slate-800">{modalDetail.programStudi}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Status verifikasi</dt>
                <dd>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                      modalDetail.membershipStatus === "APPROVED" || modalDetail.membershipStatus === "ACTIVE"
                        ? "bg-green-50 text-green-700"
                        : modalDetail.membershipStatus === "PENDING"
                          ? "bg-amber-50 text-amber-700"
                          : modalDetail.membershipStatus === "REJECTED"
                            ? "bg-red-50 text-red-700"
                            : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {modalDetail.membershipStatus}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Divisi</dt>
                <dd className="text-slate-800">{modalDetail.departemen?.title ?? "—"}</dd>
              </div>
            </dl>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModalDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ubah status */}
      {modalStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Ubah status verifikasi</h3>
            <p className="text-sm text-slate-500 mb-4">{modalStatus.name} ({modalStatus.nim})</p>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-primary/20"
            >
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            <p className="mt-2 text-xs text-slate-500">APPROVED = dapat login. PENDING = menunggu. REJECTED = ditolak.</p>
            {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}
            <div className="mt-6 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setModalStatus(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ubah divisi */}
      {modalDivisi && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Ubah divisi</h3>
            <p className="text-sm text-slate-500 mb-4">{modalDivisi.name} ({modalDivisi.nim})</p>
            <select
              value={editDepartemenId}
              onChange={(e) => setEditDepartemenId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-primary/20"
            >
              <option value="">— Tidak ada / Pengurus umum —</option>
              {departemens.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
            {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}
            <div className="mt-6 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setModalDivisi(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveDivisi}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal konfirmasi hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus data anggota</h3>
            <p className="text-sm text-slate-600 mb-4">
              Hapus <strong>{deleteTarget.name}</strong> ({deleteTarget.nim})? Data akan diarsipkan (soft delete) dan tidak tampil di daftar.
            </p>
            {deleteError && <p className="text-sm text-red-600 mb-4">{deleteError}</p>}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteSubmitting}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {deleteSubmitting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
