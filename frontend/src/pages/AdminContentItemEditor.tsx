import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const API = "/api";

type ContentType = "activity" | "department" | "proker" | "faq";

const LABELS: Record<ContentType, { singular: string; list: string }> = {
  activity: { singular: "Acara", list: "acara" },
  department: { singular: "Departemen", list: "departemen" },
  proker: { singular: "Program Kerja", list: "program kerja" },
  faq: { singular: "FAQ", list: "FAQ" },
};

const ENDPOINTS: Record<ContentType, string> = {
  activity: "/admin/activities",
  department: "/admin/departments",
  proker: "/admin/prokers",
  faq: "/admin/faqs",
};

export default function AdminContentItemEditor() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { contentType, id } = useParams<{ contentType: string; id?: string }>();
  const type = (contentType ?? "activity") as ContentType;
  const isValidType = ["activity", "department", "proker", "faq"].includes(type);
  const isEdit = Boolean(id);
  const endpoint = ENDPOINTS[type];
  const labels = LABELS[type];

  const [form, setForm] = useState<Record<string, unknown>>({});
  const [departments, setDepartments] = useState<{ id: string; title: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEdit);

  const headers = useCallback((): HeadersInit => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  useEffect(() => {
    if ((type === "proker" || type === "activity") && token) {
      fetch(`${API}/admin/departments`, { headers: headers() })
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setDepartments(Array.isArray(d) ? d : []))
        .catch(() => setDepartments([]));
    }
  }, [type, token, headers]);

  useEffect(() => {
    if (!isEdit) {
      const now = new Date();
      const defaultStart = new Date(now.getTime() + 86400000).toISOString().slice(0, 16);
      const defaultEnd = new Date(now.getTime() + 86400000 + 7200000).toISOString().slice(0, 16);
      if (type === "activity") setForm({ title: "", desc: "", image: "", startAt: defaultStart, endAt: defaultEnd, isActive: true, departemenId: "" });
      else if (type === "department") setForm({ icon: "groups", title: "", desc: "" });
      else if (type === "proker") setForm({ departemenId: "", title: "", desc: "", photo: "", actionLink: "", isActive: true });
      else setForm({ title: "", desc: "" });
      return;
    }
    if (!id || !token || !endpoint) return;
    setLoading(true);
    fetch(`${API}${endpoint}`, { headers: headers() })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Record<string, unknown>[]) => {
        const item = list.find((x) => x.id === id);
        if (item) {
          if (type === "activity") {
            setForm({
              title: item.title ?? "",
              desc: item.desc ?? "",
              image: item.image ?? "",
              startAt: item.startAt ? new Date(item.startAt as string).toISOString().slice(0, 16) : "",
              endAt: item.endAt ? new Date(item.endAt as string).toISOString().slice(0, 16) : "",
              isActive: item.isActive ?? true,
              departemenId: item.departemenId ?? (item.departemen as { id?: string })?.id ?? "",
            });
          } else if (type === "department") {
            setForm({ icon: item.icon ?? "groups", title: item.title ?? "", desc: item.desc ?? "" });
          } else if (type === "proker") {
            setForm({
              departemenId: item.departemenId ?? "",
              title: item.title ?? "",
              desc: item.desc ?? "",
              photo: item.photo ?? "",
              actionLink: item.actionLink ?? "",
              isActive: item.isActive ?? true,
            });
          } else {
            setForm({ title: item.title ?? "", desc: item.desc ?? "" });
          }
        }
      })
      .catch(() => setError("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [isEdit, id, token, endpoint, type, headers]);

  const getPayload = useCallback(() => {
    if (type === "activity") {
      return {
        title: String(form.title ?? "").trim(),
        desc: form.desc ? String(form.desc).trim() : null,
        image: form.image ? String(form.image) : null,
        startAt: form.startAt ? new Date(form.startAt as string).toISOString() : new Date().toISOString(),
        endAt: form.endAt ? new Date(form.endAt as string).toISOString() : new Date().toISOString(),
        isActive: Boolean(form.isActive),
        departemenId: form.departemenId ? String(form.departemenId).trim() || null : null,
      };
    }
    if (type === "department") {
      return { icon: String(form.icon ?? "groups").trim(), title: String(form.title ?? "").trim(), desc: String(form.desc ?? "").trim() };
    }
    if (type === "proker") {
      return {
        departemenId: String(form.departemenId ?? "").trim(),
        title: String(form.title ?? "").trim(),
        desc: String(form.desc ?? "").trim(),
        photo: form.photo ? String(form.photo) : null,
        actionLink: form.actionLink ? String(form.actionLink) : null,
        isActive: Boolean(form.isActive),
      };
    }
    return { title: String(form.title ?? "").trim(), desc: String(form.desc ?? "").trim() };
  }, [type, form]);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      const payload = getPayload();
      if (isEdit && id) {
        const r = await fetch(`${API}${endpoint}/${id}`, { method: "PUT", headers: headers(), body: JSON.stringify(payload) });
        if (!r.ok) throw new Error(await r.text());
      } else {
        const r = await fetch(`${API}${endpoint}`, { method: "POST", headers: headers(), body: JSON.stringify(payload) });
        if (!r.ok) throw new Error(await r.text());
      }
      navigate("/admin/content");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleBatal = () => {
    if (confirm("Buang perubahan dan kembali ke daftar konten?")) navigate("/admin/content");
  };

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  if (!isValidType) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-slate-500">Jenis konten tidak valid.</p>
        <Link to="/admin/content" className="text-primary hover:underline">← Kembali ke Konten</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-[1440px] mx-auto w-full gap-6">
      <div className="w-full flex items-center justify-end gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleBatal}
          className="min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-slate-100 text-slate-700 text-sm font-bold transition-all hover:bg-slate-200 hidden sm:flex"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold transition-all hover:bg-primary/90 shadow-sm disabled:opacity-50"
        >
          {saving ? "..." : "Simpan"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/admin/content" className="text-slate-500 hover:text-primary">Konten (CMS)</Link>
            <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
            <span className="text-slate-900 font-medium">{isEdit ? `Edit ${labels.singular}` : `Tambah ${labels.singular}`}</span>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
          )}

          <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{isEdit ? "Edit" : "Tambah"} {labels.singular}</h1>

            {type === "activity" && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Judul Acara</label>
                  <input
                    type="text"
                    value={String(form.title ?? "")}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Judul acara"
                    className="w-full text-lg p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Departemen (kalender aktivitas)</label>
                  <select
                    value={String(form.departemenId ?? "")}
                    onChange={(e) => set("departemenId", e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="">— Umum (semua) —</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">Pilih departemen agar acara tampil di kalender portal departemen tersebut.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Deskripsi</label>
                  <textarea
                    value={String(form.desc ?? "")}
                    onChange={(e) => set("desc", e.target.value)}
                    rows={4}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Mulai</label>
                    <input
                      type="datetime-local"
                      value={String(form.startAt ?? "")}
                      onChange={(e) => set("startAt", e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Selesai</label>
                    <input
                      type="datetime-local"
                      value={String(form.endAt ?? "")}
                      onChange={(e) => set("endAt", e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </>
            )}

            {type === "department" && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Judul Departemen</label>
                  <input
                    type="text"
                    value={String(form.title ?? "")}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Contoh: Media & Publikasi"
                    className="w-full text-lg p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Deskripsi</label>
                  <textarea
                    value={String(form.desc ?? "")}
                    onChange={(e) => set("desc", e.target.value)}
                    rows={4}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </>
            )}

            {type === "proker" && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Judul Program Kerja</label>
                  <input
                    type="text"
                    value={String(form.title ?? "")}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Judul proker"
                    className="w-full text-lg p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Deskripsi</label>
                  <textarea
                    value={String(form.desc ?? "")}
                    onChange={(e) => set("desc", e.target.value)}
                    rows={4}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </>
            )}

            {type === "faq" && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Pertanyaan</label>
                  <input
                    type="text"
                    value={String(form.title ?? "")}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Pertanyaan FAQ"
                    className="w-full text-lg p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Jawaban</label>
                  <textarea
                    value={String(form.desc ?? "")}
                    onChange={(e) => set("desc", e.target.value)}
                    rows={6}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <aside className="w-full md:w-80 flex flex-col gap-6 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings</span>
              Pengaturan
            </h3>

            {type === "activity" && (
              <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                <span className="text-sm font-semibold text-slate-700">Tampil di Landing</span>
                <input
                  type="checkbox"
                  checked={Boolean(form.isActive)}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary/20"
                />
              </label>
            )}

            {type === "department" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Icon (Material Icons)</label>
                <input
                  type="text"
                  value={String(form.icon ?? "groups")}
                  onChange={(e) => set("icon", e.target.value)}
                  placeholder="groups"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            )}

            {type === "proker" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Departemen</label>
                  <select
                    value={String(form.departemenId ?? "")}
                    onChange={(e) => set("departemenId", e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">— Pilih —</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Foto (URL opsional)</label>
                  <input
                    type="text"
                    value={String(form.photo ?? "")}
                    onChange={(e) => set("photo", e.target.value)}
                    placeholder="/api/uploads/xxx.png"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Link aksi (opsional)</label>
                  <input
                    type="text"
                    value={String(form.actionLink ?? "")}
                    onChange={(e) => set("actionLink", e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg cursor-pointer">
                  <span className="text-sm font-semibold text-slate-700">Aktif</span>
                  <input
                    type="checkbox"
                    checked={Boolean(form.isActive)}
                    onChange={(e) => set("isActive", e.target.checked)}
                    className="rounded border-slate-300 text-primary focus:ring-primary/20"
                  />
                </label>
              </>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBatal}
              className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">delete</span>
              Buang Perubahan
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
