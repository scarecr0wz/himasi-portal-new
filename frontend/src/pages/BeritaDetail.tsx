import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

const API = "/api";

type NewsDetail = {
  id: string;
  title: string;
  slug: string;
  author: string;
  publishedAt: string | null;
  desc: string;
  photo: string | null;
};

function formatDate(d: string | null): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function BeritaDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Slug tidak valid");
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${API}/content/news/slug/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error("Berita tidak ditemukan");
        return r.json();
      })
      .then(setArticle)
      .catch(() => setError("Berita tidak ditemukan"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Memuat berita...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <p className="text-slate-600 mb-4">{error ?? "Berita tidak ditemukan"}</p>
        <Link to="/" className="text-primary font-semibold hover:underline">
          ← Kembali ke beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-slate-600 hover:text-primary text-sm font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Beranda
          </Link>
          <Link to="/berita" className="text-slate-600 hover:text-primary text-sm font-semibold">
            Semua Berita
          </Link>
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase rounded-full mb-4">
            Berita Kegiatan
          </span>
          <h1 className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight mb-4 leading-tight">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-lg">calendar_today</span>
              {formatDate(article.publishedAt) || "—"}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-lg">person</span>
              {article.author || "HIMASI"}
            </span>
          </div>
        </div>

        {article.photo && (
          <div className="rounded-2xl overflow-hidden shadow-lg mb-8">
            <img
              src={article.photo.startsWith("http") ? article.photo : article.photo.startsWith("/") ? article.photo : `/${article.photo}`}
              alt=""
              className="w-full aspect-video object-cover"
            />
          </div>
        )}

        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
          <ReactMarkdown
            components={{
              img: ({ src, alt }) => (
                <span className="block my-4">
                  <img src={src} alt={alt ?? ""} className="max-w-full h-auto rounded-xl shadow-md mx-auto" />
                </span>
              ),
            }}
          >
            {article.desc}
          </ReactMarkdown>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200">
          <Link
            to="/berita"
            className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali ke daftar berita
          </Link>
        </div>
      </article>
    </div>
  );
}
