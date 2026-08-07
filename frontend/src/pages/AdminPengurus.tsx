import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const API = "/api";

type PengurusItem = {
  id: string;
  name: string;
  role: string;
  photo: string | null;
  sortOrder: number;
  periode: string;
  departemenId: string | null;
  departemen?: { id: string; title: string } | null;
};

type DeptOption = { id: string; title: string };

const ROLES_BPH = ["Dewan Pengarah", "Ketua Umum", "Wakil Ketua Umum", "Sekretaris Umum", "Sekretaris 1", "Bendahara Umum", "Bendahara 1"];
const ROLES_DEPARTMENT = ["Kepala Departemen", "Anggota Departemen"];

export default function AdminPengurus() {
  const { token } = useAuth();
  const [list, setList] = useState<PengurusItem[]>([]);
  const [departments, setDepartments] = useState<DeptOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    role: ROLES_BPH[0],
    departemenId: "" as string | null,
    photo: "" as string | null,
    sortOrder: 0,
    periode: "2025/2026",
  });

  const headers = (): HeadersInit => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, dRes] = await Promise.all([
        fetch(`${API}/admin/pengurus`, { headers: headers() }),
        fetch(`${API}/admin/departments`, { headers: headers() }),
      ]);
      const p = pRes.ok ? await pRes.json() : [];
      const d = dRes.ok ? await dRes.json() : [];
      setList(Array.isArray(p) ? p : []);
      setDepartments(Array.isArray(d) ? d.map((x: { id: string; title: string }) => ({ id: x.id, title: x.title })) : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const body = {
      name: form.name.trim(),
      role: form.role,
      departemenId: form.departemenId || null,
      photo: form.photo || null,
      sortOrder: form.sortOrder,
      periode: form.periode,
    };
    try {
      if (editingId) {
        await fetch(`${API}/admin/pengurus/${editingId}`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(body),
        });
      } else {
        await fetch(`${API}/admin/pengurus`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify(body),
        });
      }
      setEditingId(null);
      setForm({ name: "", role: ROLES_BPH[0], departemenId: null, photo: null, sortOrder: 0, periode: "2025/2026" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus pengurus ini?")) return;
    setError(null);
    try {
      await fetch(`${API}/admin/pengurus/${id}`, { method: "DELETE", headers: headers() });
      if (editingId === id) setEditingId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus");
    }
  };

  const startEdit = (item: PengurusItem) => {
    const deptId = item.departemenId ?? null;
    const roleList = deptId ? ROLES_DEPARTMENT : ROLES_BPH;
    const role = roleList.includes(item.role) ? item.role : roleList[0];
    setEditingId(item.id);
    setForm({
      name: item.name,
      role,
      departemenId: deptId,
      photo: item.photo ?? null,
      sortOrder: item.sortOrder,
      periode: item.periode,
    });
  };

  const startAdd = () => {
    setEditingId(null);
    setForm({
      name: "",
      role: ROLES_BPH[0],
      departemenId: null,
      photo: null,
      sortOrder: list.length,
      periode: "2025/2026",
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;
    if (!file.type.startsWith("image/")) {
      setError("Pilih file gambar (JPEG, PNG, GIF, atau WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran file maksimal 10MB.");
      return;
    }
    setError(null);
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const r = await fetch(`${API}/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.message ?? "Gagal mengunggah");
      }
      const data = await r.json();
      const url = typeof data.url === "string" ? data.url : "";
      if (url) setForm((f) => ({ ...f, photo: url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const photoDisplayUrl = form.photo
    ? (form.photo.startsWith("http") || form.photo.startsWith("/") ? form.photo : `${API}/uploads/${form.photo}`)
    : null;

  return (
    <>
      <nav className="dashboard-breadcrumb" aria-label="Breadcrumb">
        <Link to="/admin">Admin</Link>
        <span> &gt; Pengurus</span>
      </nav>
      <h2 className="section-title">
        <span className="section-title-bar" />
        Kelola Pengurus
      </h2>
      <p className="section-subtitle">
        BPH (tanpa departemen) dan pengurus departemen: Kepala Departemen &amp; Anggota Departemen per departemen.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <button
          type="button"
          onClick={startAdd}
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90"
        >
          + Tambah Pengurus
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">{editingId ? "Edit" : "Tambah"} Pengurus</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              placeholder="Nama lengkap"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Departemen</label>
            <select
              value={form.departemenId ?? ""}
              onChange={(e) => {
                const nextDeptId = e.target.value || null;
                const isDept = !!nextDeptId;
                const validRoles = isDept ? ROLES_DEPARTMENT : ROLES_BPH;
                const currentValid = validRoles.includes(form.role);
                setForm((f) => ({
                  ...f,
                  departemenId: nextDeptId,
                  role: currentValid ? f.role : validRoles[0],
                }));
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              <option value="">— BPH (tanpa departemen) —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jabatan</label>
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            >
              {(form.departemenId ? ROLES_DEPARTMENT : ROLES_BPH).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {form.departemenId && (
              <p className="mt-1 text-xs text-slate-500">Kepala atau Anggota departemen terkait.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Periode</label>
            <input
              type="text"
              value={form.periode}
              onChange={(e) => setForm((f) => ({ ...f, periode: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
              placeholder="2025/2026"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Urutan (sortOrder)</label>
            <input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Foto (opsional)</label>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">cloud_upload</span>
                {uploadingPhoto ? "Mengunggah..." : "Upload foto"}
              </button>
              {form.photo && (
                <>
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                    {photoDisplayUrl ? (
                      <img src={photoDisplayUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-slate-400 text-3xl m-2">image</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, photo: null }))}
                    className="text-slate-500 hover:text-red-600 text-sm"
                  >
                    Hapus foto
                  </button>
                </>
              )}
            </div>
            <input
              type="text"
              value={form.photo ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, photo: e.target.value || null }))}
              className="mt-2 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-500"
              placeholder="Atau paste URL gambar (opsional)"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90">
            {editingId ? "Simpan" : "Tambah"}
          </button>
          {editingId && (
            <button type="button" onClick={startAdd} className="px-4 py-2 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50">
              Batal
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-slate-500 text-sm">Memuat...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left p-3 font-semibold text-slate-700">Urutan</th>
                <th className="text-left p-3 font-semibold text-slate-700">Nama</th>
                <th className="text-left p-3 font-semibold text-slate-700">Jabatan</th>
                <th className="text-left p-3 font-semibold text-slate-700">Departemen</th>
                <th className="text-left p-3 font-semibold text-slate-700">Periode</th>
                <th className="text-right p-3 font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    Belum ada data. Klik &quot;Tambah Pengurus&quot; untuk menambah.
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3">{item.sortOrder}</td>
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">{item.role}</td>
                    <td className="p-3 text-slate-600">{item.departemen?.title ?? "—"}</td>
                    <td className="p-3">{item.periode}</td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="text-primary font-medium hover:underline mr-3"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 font-medium hover:underline"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-slate-500 text-sm">
        <Link to="/pengurus" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
          Lihat halaman Pengurus →
        </Link>
      </p>
    </>
  );
}
