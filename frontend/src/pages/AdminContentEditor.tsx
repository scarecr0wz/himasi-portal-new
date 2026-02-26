import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const API = "/api";

type Category = { id: string; value: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminContentEditor() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("HIMASI");
  const [categoryId, setCategoryId] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [isActive, setIsActive] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [uploading, setUploading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const featuredImageInputRef = useRef<HTMLInputElement>(null);

  const wordCount = desc.trim() ? desc.trim().split(/\s+/).length : 0;

  const insertAtCursor = (before: string, after: string = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = desc;
    const selected = text.slice(start, end);
    const newText = text.slice(0, start) + before + selected + after + text.slice(end);
    setDesc(newText);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, end + before.length); }, 0);
  };

  const insertImageByUrl = () => {
    const url = prompt("URL gambar:");
    if (!url?.trim()) return;
    const alt = prompt("Deskripsi gambar (opsional):") ?? "Gambar";
    insertAtCursor(`\n![${alt}](${url.trim()})\n`, "");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch(`${API}/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.message ?? "Gagal mengunggah");
      }
      const data = await r.json();
      const url = typeof data.url === "string" ? data.url : "";
      if (url) insertAtCursor(`\n![${file.name}](${url})\n`, "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const form = new FormData();
      form.append("file", file);
      const r = await fetch(`${API}/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.message ?? "Gagal mengunggah");
      }
      const data = await r.json();
      const url = typeof data.url === "string" ? data.url : "";
      if (url) setPhoto(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah gambar utama");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const setPhotoByUrl = () => {
    const u = prompt("URL gambar:");
    if (u?.trim()) setPhoto(u.trim());
  };

  const headers = useCallback(
    (): HeadersInit => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/admin/enumerations?key=category_news`, { headers: headers() })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { id: string; value: string }[]) => {
        setCategories(list);
        if (list.length > 0 && !id) setCategoryId(list[0].id);
      })
      .catch(() => setCategories([]));
  }, [token, headers]);

  useEffect(() => {
    if (!isEdit || !id || !token) return;
    setLoading(true);
    fetch(`${API}/admin/news`, { headers: headers() })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { id: string; title: string; slug: string; desc: string; author: string; categoryId: string; photo: string | null; publishedAt: string | null; isActive: boolean }[]) => {
        const item = list.find((n) => n.id === id);
        if (item) {
          setTitle(item.title);
          setDesc(item.desc ?? "");
          setSlug(item.slug);
          setAuthor(item.author ?? "HIMASI");
          setCategoryId(item.categoryId);
          setPhoto(item.photo ?? null);
          setPublishedAt(item.publishedAt ? new Date(item.publishedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
          setIsActive(item.isActive);
        }
      })
      .catch(() => setError("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [isEdit, id, token, headers]);

  const save = useCallback(
    async (publish: boolean) => {
      setError(null);
      setSaving(true);
      const payload = {
        title: title.trim(),
        slug: (slug || slugify(title)).trim() || slugify(title) || "berita",
        desc: desc.trim(),
        author: author.trim() || "HIMASI",
        categoryId: categoryId || categories[0]?.id,
        photo: photo || null,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
        isActive: publish,
      };
      try {
        if (isEdit && id) {
          await fetch(`${API}/admin/news/${id}`, {
            method: "PUT",
            headers: headers(),
            body: JSON.stringify(payload),
          });
        } else {
          const r = await fetch(`${API}/admin/news`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify(payload),
          });
          if (!r.ok) throw new Error(await r.text());
          const created = await r.json();
          navigate(`/admin/content/editor/${created.id}`, { replace: true });
        }
        setLastSaved(new Date());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal menyimpan");
      } finally {
        setSaving(false);
      }
    },
    [title, slug, desc, author, categoryId, photo, publishedAt, isEdit, id, categories, headers, navigate]
  );

  const handleDiscard = () => {
    if (confirm("Buang perubahan dan kembali ke daftar konten?")) {
      navigate("/admin/content");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-[1440px] mx-auto w-full gap-6">
      {/* Top bar: Save Draft / Publish Now */}
      <div className="w-full flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => save(false)}
          disabled={saving}
          className="hidden sm:flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-slate-100 text-slate-700 text-sm font-bold transition-all hover:bg-slate-200 disabled:opacity-50"
        >
          {saving ? "..." : "Simpan Draf"}
        </button>
        <button
          type="button"
          onClick={() => save(true)}
          disabled={saving}
          className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold transition-all hover:bg-primary/90 shadow-sm disabled:opacity-50"
        >
          {saving ? "..." : "Terbitkan"}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      {/* Left: Editor */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/admin/content" className="text-slate-500 hover:text-primary">
            Konten (CMS)
          </Link>
          <span className="material-symbols-outlined text-xs text-slate-400">chevron_right</span>
          <span className="text-slate-900 font-medium">{isEdit ? "Edit Berita" : "Buat Berita Baru"}</span>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-1">Editor</h1>
            <p className="text-slate-500 text-sm">
              {isEdit ? "Menyunting berita yang tampil di landing page." : "Menulis berita atau pengumuman untuk landing page."}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Judul Konten</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => { if (!slug.trim()) setSlug(slugify(title)); }}
              placeholder="Masukkan judul yang deskriptif..."
              className="w-full text-xl font-bold p-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
            />
          </div>

          <div className="flex flex-col border border-slate-200 rounded-xl bg-white overflow-hidden min-h-[400px]">
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 bg-slate-50">
              <button type="button" onClick={() => insertAtCursor("**", "**")} className="p-2 hover:bg-white rounded transition-colors text-slate-600" title="Bold">
                <span className="material-symbols-outlined text-[20px]">format_bold</span>
              </button>
              <button type="button" onClick={() => insertAtCursor("_", "_")} className="p-2 hover:bg-white rounded transition-colors text-slate-600" title="Italic">
                <span className="material-symbols-outlined text-[20px]">format_italic</span>
              </button>
              <button type="button" onClick={() => insertAtCursor("\n- ", "")} className="p-2 hover:bg-white rounded transition-colors text-slate-600" title="Bullet list">
                <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
              </button>
              <button type="button" onClick={() => insertAtCursor("\n1. ", "")} className="p-2 hover:bg-white rounded transition-colors text-slate-600" title="Numbered list">
                <span className="material-symbols-outlined text-[20px]">format_list_numbered</span>
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1" />
              <button type="button" onClick={() => { const u = prompt("URL:"); if (u) insertAtCursor(`[`, `](${u})`); }} className="p-2 hover:bg-white rounded transition-colors text-slate-600" title="Link">
                <span className="material-symbols-outlined text-[20px]">link</span>
              </button>
              <span className="inline-flex items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="p-2 hover:bg-white rounded transition-colors text-slate-600 disabled:opacity-50"
                  title="Upload gambar"
                >
                  <span className="material-symbols-outlined text-[20px]">image</span>
                </button>
                <button
                  type="button"
                  onClick={insertImageByUrl}
                  className="px-1.5 py-1 text-[11px] text-slate-500 hover:text-primary hover:bg-white rounded"
                  title="Pakai URL gambar"
                >
                  URL
                </button>
              </span>
              <button type="button" onClick={() => insertAtCursor("\n> ", "")} className="p-2 hover:bg-white rounded transition-colors text-slate-600" title="Quote">
                <span className="material-symbols-outlined text-[20px]">format_quote</span>
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Tulis isi berita di sini..."
              className="flex-1 p-6 min-h-[320px] resize-none border-none bg-transparent text-slate-800 leading-relaxed text-base placeholder:text-slate-400 focus:ring-0 focus:outline-none"
              spellCheck
            />
            <div className="p-3 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
              <span>{lastSaved ? `Terakhir disimpan ${lastSaved.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : "Belum disimpan"}</span>
              <span>{wordCount} kata</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Publish Settings */}
      <aside className="w-full md:w-80 flex flex-col gap-6 order-3 flex-shrink-0">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">settings</span>
            Pengaturan Publikasi
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {categories.length === 0 && <option value="">— Pilih —</option>}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.value}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Slug (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-berita"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="HIMASI"
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Gambar Utama</label>
              <input
                ref={featuredImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleFeaturedImageUpload}
              />
              <div className="flex flex-col gap-2">
                {photo ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg text-slate-600 hover:bg-white"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => { if (!uploadingPhoto) featuredImageInputRef.current?.click(); }}
                      onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !uploadingPhoto) { e.preventDefault(); featuredImageInputRef.current?.click(); } }}
                      className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 transition-all hover:border-primary/50 bg-slate-50 cursor-pointer disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-slate-400 text-3xl mb-2">cloud_upload</span>
                      <p className="text-xs text-slate-500 text-center">
                        {uploadingPhoto ? "Mengunggah..." : "Klik untuk upload gambar"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, GIF, WebP hingga 10MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={setPhotoByUrl}
                      className="text-xs text-slate-500 hover:text-primary"
                    >
                      atau isi URL gambar
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Tanggal Terbit</label>
              <div className="relative">
                <input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10"
                />
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 pointer-events-none">calendar_today</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-semibold text-slate-700">Tampil di Landing</p>
                <p className="text-[11px] text-slate-500">Berita aktif muncul di beranda</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleDiscard}
              className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">delete</span>
              Buang Konten
            </button>
          </div>
        </div>

        <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-primary text-xl">lightbulb</span>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-1">Tip Menulis</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gunakan gambar berkualitas dan judul yang jelas agar berita mudah dibaca dan menjangkau lebih banyak pembaca.
              </p>
            </div>
          </div>
        </div>
      </aside>
      </div>
    </div>
  );
}
