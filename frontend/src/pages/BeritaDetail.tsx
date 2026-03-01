import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { marked } from "marked";
import { SocialMediaLinks, useSocialMedia } from "@/components/SocialMediaLinks";
import ShareButtons from "../components/ShareButtons";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";

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
  const socialMedia = useSocialMedia();

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
      <div className="min-h-screen bg-slate-50 flex flex-col uppercase font-display">
        <PublicNavbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">Memuat berita...</p>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-display">
        <PublicNavbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-slate-600 mb-4">{error ?? "Berita tidak ditemukan"}</p>
          <Link to="/" className="text-primary font-semibold hover:underline">
            ← Kembali ke beranda
          </Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-display">
      <PublicNavbar />

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-6 py-10 md:py-16">
          <div className="mb-0">
            <Link to="/berita" className="text-slate-500 hover:text-primary text-sm font-semibold flex items-center gap-1 mb-6">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Semua Berita
            </Link>
          </div>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase rounded-full mb-4">
              Berita Kegiatan
            </span>
            <h1 className="text-slate-900 text-3xl md:text-4xl font-black tracking-tight mb-4 leading-tight">
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
            <div className="rounded-2xl overflow-hidden shadow-lg mb-10">
              <img
                src={article.photo.startsWith("http") ? article.photo : article.photo.startsWith("/") ? article.photo : `/${article.photo}`}
                alt=""
                className="w-full aspect-video object-cover"
              />
            </div>
          )}

          <div
            className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: marked.parse(article.desc) }}
          />

          <div className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <p className="text-slate-900 text-sm font-bold uppercase tracking-wider mb-4">Bagikan Berita</p>
                <ShareButtons title={article.title} />
              </div>

              {socialMedia.length > 0 && (
                <div>
                  <p className="text-slate-900 text-sm font-bold uppercase tracking-wider mb-4">Ikuti Kami</p>
                  <SocialMediaLinks
                    items={socialMedia}
                    className="flex flex-wrap gap-3"
                    iconClassName="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <Link
              to="/berita"
              className="text-primary font-bold hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Kembali ke daftar berita
            </Link>
          </div>
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}

