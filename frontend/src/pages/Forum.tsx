import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const API = "/api";

type Category = { id: string; value: string };

type Topic = {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  author: { id: string; name: string; nim: string };
  replyCount: number;
};

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function Forum() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createCategoryId, setCreateCategoryId] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API}/forum/categories`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const cats = Array.isArray(data) ? data : [];
        setCategories(cats);
        if (cats.length > 0 && !createCategoryId) setCreateCategoryId(cats[0].id);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const url = selectedCategoryId
      ? `${API}/forum/topics?categoryId=${encodeURIComponent(selectedCategoryId)}`
      : `${API}/forum/topics`;
    setLoading(true);
    setError(null);
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setTopics(Array.isArray(data) ? data : []))
      .catch(() => setError("Gagal memuat topik"))
      .finally(() => setLoading(false));
  }, [token, selectedCategoryId]);

  const filteredTopics = topics;

  function handleCreateTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !createTitle.trim() || !createContent.trim() || !createCategoryId) return;
    setCreateSubmitting(true);
    setCreateError(null);
    fetch(`${API}/forum/topics`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categoryId: createCategoryId,
        title: createTitle.trim(),
        content: createContent.trim(),
      }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.message || "Gagal membuat topik"); });
        return r.json();
      })
      .then((created) => {
        setTopics((prev) => [
          {
            id: created.id,
            title: created.title,
            categoryId: created.categoryId,
            categoryName: created.categoryName,
            isPinned: false,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
            author: created.author,
            replyCount: 0,
          },
          ...prev,
        ]);
        setCreateOpen(false);
        setCreateTitle("");
        setCreateContent("");
      })
      .catch((err) => setCreateError(err instanceof Error ? err.message : "Gagal membuat topik"))
      .finally(() => setCreateSubmitting(false));
  }

  return (
    <div className="min-w-0 w-full">
      <nav className="dashboard-breadcrumb" aria-label="Breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span> &gt; Ruang Terbuka</span>
      </nav>

      <section className="dashboard-section">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="section-title">
              <span className="section-title-bar" />
              Ruang Terbuka
            </h2>
            <p className="section-subtitle">Diskusi dan berbagi dengan sesama anggota HIMASI</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Buat topik
          </button>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                selectedCategoryId === null
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Semua
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  selectedCategoryId === cat.id
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.value}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        {loading ? (
          <p className="text-slate-500 text-sm py-8">Memuat topik...</p>
        ) : filteredTopics.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">forum</span>
            <p>Belum ada topik. Mulai diskusi dengan membuat topik pertama.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTopics.map((t) => (
              <Link
                key={t.id}
                to={`/dashboard/forum/${t.id}`}
                className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {t.isPinned && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                          Pin
                        </span>
                      )}
                      <span className="text-slate-400 text-xs">{t.categoryName}</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 mt-1 line-clamp-1">{t.title}</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {t.author.name} · {formatDate(t.updatedAt)}
                      {t.replyCount > 0 && ` · ${t.replyCount} balasan`}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 shrink-0">chevron_right</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Buat topik baru</h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateTopic} className="p-6 space-y-4">
              {createError && <p className="text-red-600 text-sm">{createError}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select
                  value={createCategoryId}
                  onChange={(e) => setCreateCategoryId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 bg-white"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul</label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="Judul topik"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder:text-slate-400"
                  maxLength={255}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Isi</label>
                <textarea
                  value={createContent}
                  onChange={(e) => setCreateContent(e.target.value)}
                  placeholder="Tulis isi topik..."
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder:text-slate-400 resize-y"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting || !createTitle.trim() || !createContent.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {createSubmitting ? "Membuat..." : "Buat topik"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
