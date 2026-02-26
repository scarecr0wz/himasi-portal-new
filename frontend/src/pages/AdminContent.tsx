import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const API = "/api";

type TabId = "news" | "activities" | "departments" | "prokers" | "faqs";

function useAdminApi(token: string | null) {
  const headers = (): HeadersInit => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const fetchList = async (tab: TabId) => {
    if (!token) return [];
    const map: Record<TabId, string> = {
      news: "/admin/news",
      activities: "/admin/activities",
      departments: "/admin/departments",
      prokers: "/admin/prokers",
      faqs: "/admin/faqs",
    };
    const r = await fetch(`${API}${map[tab]}`, { headers: headers() });
    return r.ok ? r.json() : [];
  };

  const create = async (tab: TabId, body: unknown) => {
    if (!token) throw new Error("Unauthorized");
    const map: Record<TabId, string> = {
      news: "/admin/news",
      activities: "/admin/activities",
      departments: "/admin/departments",
      prokers: "/admin/prokers",
      faqs: "/admin/faqs",
    };
    const r = await fetch(`${API}${map[tab]}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  };

  const update = async (tab: TabId, id: string, body: unknown) => {
    if (!token) throw new Error("Unauthorized");
    const map: Record<TabId, string> = {
      news: "/admin/news",
      activities: "/admin/activities",
      departments: "/admin/departments",
      prokers: "/admin/prokers",
      faqs: "/admin/faqs",
    };
    const r = await fetch(`${API}${map[tab]}/${id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  };

  const remove = async (tab: TabId, id: string) => {
    if (!token) throw new Error("Unauthorized");
    const map: Record<TabId, string> = {
      news: "/admin/news",
      activities: "/admin/activities",
      departments: "/admin/departments",
      prokers: "/admin/prokers",
      faqs: "/admin/faqs",
    };
    const r = await fetch(`${API}${map[tab]}/${id}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!r.ok) throw new Error(await r.text());
  };

  const fetchEnumerations = async (key: string) => {
    if (!token) return [];
    const r = await fetch(`${API}/admin/enumerations?key=${encodeURIComponent(key)}`, {
      headers: headers(),
    });
    return r.ok ? r.json() : [];
  };

  return { fetchList, create, update, remove, fetchEnumerations };
}

export default function AdminContent() {
  const { token } = useAuth();
  const api = useAdminApi(token);
  const [tab, setTab] = useState<TabId>("news");
  const [list, setList] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [categories, setCategories] = useState<{ id: string; value: string }[]>([]);
  const [departmentsList, setDepartmentsList] = useState<{ id: string; title: string }[]>([]);

  const tabs: { id: TabId; label: string }[] = [
    { id: "news", label: "Berita" },
    { id: "activities", label: "Acara" },
    { id: "departments", label: "Departemen" },
    { id: "prokers", label: "Program Kerja" },
    { id: "faqs", label: "FAQ" },
  ];

  const loadList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchList(tab);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, [tab]);

  useEffect(() => {
    if (tab === "news") {
      api.fetchEnumerations("category_news").then((data) =>
        setCategories(Array.isArray(data) ? data.map((d: { id: string; value: string }) => ({ id: d.id, value: d.value })) : [])
      );
    }
    if (tab === "prokers") {
      api.fetchList("departments").then((data) =>
        setDepartmentsList(Array.isArray(data) ? data.map((d: { id: string; title: string }) => ({ id: d.id, title: d.title })) : [])
      );
    }
  }, [tab]);

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus?")) return;
    setError(null);
    try {
      await api.remove(tab, id);
      await loadList();
      if (editingId === id) setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await api.update(tab, editingId, formData);
        setEditingId(null);
      } else {
        await api.create(tab, formData);
      }
      setFormData({});
      await loadList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan");
    }
  };

  const startEdit = (item: Record<string, unknown>) => {
    setEditingId((item.id as string) ?? null);
    setFormData({ ...item });
  };

  const startAdd = () => {
    setEditingId(null);
    if (tab === "news") setFormData({ title: "", slug: "", desc: "", author: "", categoryId: categories[0]?.id ?? "", isActive: false });
    else if (tab === "activities") setFormData({ title: "", desc: "", startAt: new Date().toISOString().slice(0, 16), endAt: new Date().toISOString().slice(0, 16), isActive: true });
    else if (tab === "departments") setFormData({ icon: "groups", title: "", desc: "" });
    else if (tab === "prokers") setFormData({ title: "", desc: "", departemenId: "", isActive: true });
    else setFormData({ title: "", desc: "" });
  };

  return (
    <>
      <nav className="dashboard-breadcrumb">
        <Link to="/admin">Admin</Link>
        <span> &gt; Konten (CMS)</span>
      </nav>
      <h2 className="section-title">
        <span className="section-title-bar" />
        Kelola Konten Homepage
      </h2>
      <p className="section-subtitle">
        Berita, acara, departemen, program kerja, dan FAQ yang tampil di landing page.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setTab(t.id); setEditingId(null); }}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: tab === t.id ? "var(--accent-bg)" : "var(--bg-card)",
              color: tab === t.id ? "var(--accent)" : "var(--text)",
              fontWeight: tab === t.id ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: "0.75rem", background: "#fef2f2", color: "#dc2626", borderRadius: "8px", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        {tab === "news" ? (
          <Link
            to="/admin/content/editor"
            style={{
              padding: "0.5rem 1rem",
              background: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            + Tambah
          </Link>
        ) : (
          <button
            type="button"
            onClick={startAdd}
            style={{
              padding: "0.5rem 1rem",
              background: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Tambah
          </button>
        )}
      </div>

      {(editingId || Object.keys(formData).length > 0) && (
        <form onSubmit={handleSubmit} style={{ background: "var(--bg-card)", padding: "1.25rem", borderRadius: "12px", marginBottom: "1.5rem", boxShadow: "var(--shadow)" }}>
          <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>{editingId ? "Edit" : "Tambah Baru"}</h3>
          {tab === "news" && (
            <>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Kategori</label>
                <select
                  value={(formData.categoryId as string) ?? ""}
                  onChange={(e) => setFormData((f) => ({ ...f, categoryId: e.target.value }))}
                  style={{ width: "100%", maxWidth: "300px", padding: "0.5rem" }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.value}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Judul</label>
                <input type="text" value={(formData.title as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))} required style={{ width: "100%", maxWidth: "400px", padding: "0.5rem" }} />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Slug (URL)</label>
                <input type="text" value={(formData.slug as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, slug: e.target.value }))} required style={{ width: "100%", maxWidth: "400px", padding: "0.5rem" }} />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Deskripsi</label>
                <textarea value={(formData.desc as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, desc: e.target.value }))} rows={3} style={{ width: "100%", maxWidth: "500px", padding: "0.5rem" }} />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Author</label>
                <input type="text" value={(formData.author as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, author: e.target.value }))} required style={{ width: "100%", maxWidth: "300px", padding: "0.5rem" }} />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Foto (URL)</label>
                <input type="text" value={(formData.photo as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, photo: e.target.value || null }))} style={{ width: "100%", maxWidth: "400px", padding: "0.5rem" }} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <input type="checkbox" checked={!!formData.isActive} onChange={(e) => setFormData((f) => ({ ...f, isActive: e.target.checked }))} />
                Aktif
              </label>
            </>
          )}
          {tab === "activities" && (
            <>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Judul</label>
                <input type="text" value={(formData.title as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))} required style={{ width: "100%", maxWidth: "400px", padding: "0.5rem" }} />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Deskripsi</label>
                <textarea value={(formData.desc as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, desc: e.target.value }))} rows={2} style={{ width: "100%", maxWidth: "500px", padding: "0.5rem" }} />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Mulai</label>
                <input type="datetime-local" value={formData.startAt ? new Date(formData.startAt as string).toISOString().slice(0, 16) : ""} onChange={(e) => setFormData((f) => ({ ...f, startAt: e.target.value ? new Date(e.target.value).toISOString() : "" }))} required style={{ padding: "0.5rem" }} />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Selesai</label>
                <input type="datetime-local" value={formData.endAt ? new Date(formData.endAt as string).toISOString().slice(0, 16) : ""} onChange={(e) => setFormData((f) => ({ ...f, endAt: e.target.value ? new Date(e.target.value).toISOString() : "" }))} required style={{ padding: "0.5rem" }} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <input type="checkbox" checked={!!formData.isActive} onChange={(e) => setFormData((f) => ({ ...f, isActive: e.target.checked }))} />
                Aktif
              </label>
            </>
          )}
          {tab === "departments" && (
            <>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Icon (nama)</label>
                <input type="text" value={(formData.icon as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, icon: e.target.value }))} required style={{ width: "100%", maxWidth: "300px", padding: "0.5rem" }} placeholder="groups" />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Judul</label>
                <input type="text" value={(formData.title as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))} required style={{ width: "100%", maxWidth: "400px", padding: "0.5rem" }} />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Deskripsi</label>
                <textarea value={(formData.desc as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, desc: e.target.value }))} rows={3} style={{ width: "100%", maxWidth: "500px", padding: "0.5rem" }} />
              </div>
            </>
          )}
          {tab === "prokers" && (
            <>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Departemen</label>
                <select
                  value={(formData.departemenId as string) ?? ""}
                  onChange={(e) => setFormData((f) => ({ ...f, departemenId: e.target.value }))}
                  required
                  style={{ width: "100%", maxWidth: "300px", padding: "0.5rem" }}
                >
                  <option value="">— Pilih —</option>
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Judul</label>
                <input type="text" value={(formData.title as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))} required style={{ width: "100%", maxWidth: "400px", padding: "0.5rem" }} />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Deskripsi</label>
                <textarea value={(formData.desc as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, desc: e.target.value }))} rows={3} style={{ width: "100%", maxWidth: "500px", padding: "0.5rem" }} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <input type="checkbox" checked={!!formData.isActive} onChange={(e) => setFormData((f) => ({ ...f, isActive: e.target.checked }))} />
                Aktif
              </label>
            </>
          )}
          {tab === "faqs" && (
            <>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Pertanyaan</label>
                <input type="text" value={(formData.title as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))} required style={{ width: "100%", maxWidth: "500px", padding: "0.5rem" }} />
              </div>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", marginBottom: "0.25rem", fontWeight: 500 }}>Jawaban</label>
                <textarea value={(formData.desc as string) ?? ""} onChange={(e) => setFormData((f) => ({ ...f, desc: e.target.value }))} rows={4} style={{ width: "100%", maxWidth: "500px", padding: "0.5rem" }} />
              </div>
            </>
          )}
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button type="submit" style={{ padding: "0.5rem 1rem", background: "var(--accent)", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
              Simpan
            </button>
            <button type="button" onClick={() => { setEditingId(null); setFormData({}); }} style={{ padding: "0.5rem 1rem", background: "var(--border)", color: "var(--text)", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              Batal
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="section-subtitle">Memuat...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-card)", borderRadius: "12px", overflow: "hidden", boxShadow: "var(--shadow)" }}>
            <thead>
              <tr style={{ background: "var(--border-light)" }}>
                {tab === "news" && (
                  <>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Judul</th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Author</th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Aktif</th>
                    <th style={{ padding: "0.75rem", width: "120px" }}>Aksi</th>
                  </>
                )}
                {tab === "activities" && (
                  <>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Judul</th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Mulai</th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Aktif</th>
                    <th style={{ padding: "0.75rem", width: "120px" }}>Aksi</th>
                  </>
                )}
                {tab === "departments" && (
                  <>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Judul</th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Deskripsi</th>
                    <th style={{ padding: "0.75rem", width: "120px" }}>Aksi</th>
                  </>
                )}
                {tab === "prokers" && (
                  <>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Judul</th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Departemen</th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Aktif</th>
                    <th style={{ padding: "0.75rem", width: "120px" }}>Aksi</th>
                  </>
                )}
                {tab === "faqs" && (
                  <>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>Pertanyaan</th>
                    <th style={{ padding: "0.75rem", width: "120px" }}>Aksi</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {(list as Record<string, unknown>[]).map((item) => (
                <tr key={String(item.id)} style={{ borderTop: "1px solid var(--border)" }}>
                  {tab === "news" && (
                    <>
                      <td style={{ padding: "0.75rem" }}>{(item.title as string) ?? ""}</td>
                      <td style={{ padding: "0.75rem" }}>{(item.author as string) ?? ""}</td>
                      <td style={{ padding: "0.75rem" }}>{(item.isActive as boolean) ? "Ya" : "Tidak"}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <Link to={`/admin/content/editor/${item.id}`} style={{ marginRight: "0.5rem", cursor: "pointer", color: "var(--accent)" }}>Editor</Link>
                        <button type="button" onClick={() => startEdit(item)} style={{ marginRight: "0.5rem", cursor: "pointer" }}>Edit</button>
                        <button type="button" onClick={() => handleDelete(item.id as string)} style={{ cursor: "pointer", color: "#dc2626" }}>Hapus</button>
                      </td>
                    </>
                  )}
                  {tab === "activities" && (
                    <>
                      <td style={{ padding: "0.75rem" }}>{(item.title as string) ?? ""}</td>
                      <td style={{ padding: "0.75rem" }}>{item.startAt ? new Date(item.startAt as string).toLocaleString("id-ID") : ""}</td>
                      <td style={{ padding: "0.75rem" }}>{(item.isActive as boolean) ? "Ya" : "Tidak"}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <button type="button" onClick={() => startEdit(item)} style={{ marginRight: "0.5rem", cursor: "pointer" }}>Edit</button>
                        <button type="button" onClick={() => handleDelete(item.id as string)} style={{ cursor: "pointer", color: "#dc2626" }}>Hapus</button>
                      </td>
                    </>
                  )}
                  {tab === "departments" && (
                    <>
                      <td style={{ padding: "0.75rem" }}>{(item.title as string) ?? ""}</td>
                      <td style={{ padding: "0.75rem", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(item.desc as string) ?? ""}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <button type="button" onClick={() => startEdit(item)} style={{ marginRight: "0.5rem", cursor: "pointer" }}>Edit</button>
                        <button type="button" onClick={() => handleDelete(item.id as string)} style={{ cursor: "pointer", color: "#dc2626" }}>Hapus</button>
                      </td>
                    </>
                  )}
                  {tab === "prokers" && (
                    <>
                      <td style={{ padding: "0.75rem" }}>{(item.title as string) ?? ""}</td>
                      <td style={{ padding: "0.75rem" }}>{(item.departemen as { title: string })?.title ?? "—"}</td>
                      <td style={{ padding: "0.75rem" }}>{(item.isActive as boolean) ? "Ya" : "Tidak"}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <button type="button" onClick={() => startEdit(item)} style={{ marginRight: "0.5rem", cursor: "pointer" }}>Edit</button>
                        <button type="button" onClick={() => handleDelete(item.id as string)} style={{ cursor: "pointer", color: "#dc2626" }}>Hapus</button>
                      </td>
                    </>
                  )}
                  {tab === "faqs" && (
                    <>
                      <td style={{ padding: "0.75rem" }}>{(item.title as string) ?? ""}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <button type="button" onClick={() => startEdit(item)} style={{ marginRight: "0.5rem", cursor: "pointer" }}>Edit</button>
                        <button type="button" onClick={() => handleDelete(item.id as string)} style={{ cursor: "pointer", color: "#dc2626" }}>Hapus</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && (
            <p className="section-subtitle" style={{ marginTop: "1rem" }}>Belum ada data. Klik &quot;Tambah&quot; untuk menambah.</p>
          )}
        </div>
      )}
    </>
  );
}
