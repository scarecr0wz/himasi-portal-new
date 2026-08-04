import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";

const API = "/api";


type NewsItem = {
  id: string;
  title: string;
  slug: string;
  author: string;
  publishedAt: string | null;
  desc?: string;
  photo?: string | null;
};

const CARD_IMAGES = [
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
];

function formatDate(d: string | null): string {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function stripMarkdown(md: string): string {
  return md
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/[*_~`#>]/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

export default function BeritaList() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API}/content/news`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setNews(Array.isArray(data) ? data : []))
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, []);

  const searchLower = search.trim().toLowerCase();
  const filteredNews = searchLower
    ? news.filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes(searchLower)) ||
        (item.author && item.author.toLowerCase().includes(searchLower)) ||
        (item.desc && stripMarkdown(item.desc).toLowerCase().includes(searchLower))
    )
    : news;

  return (
    <div className="font-display bg-background-light text-slate-900 min-h-screen flex flex-col">
      <PublicNavbar />
      <SEO
        title="Berita"
        description="Kumpulan berita, pengumuman, dan informasi terkini dari HIMASI Universitas Terbuka Bogor."
      />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-5 md:px-10 lg:px-14 xl:px-16 py-12">
        <div className="mb-10">
          <Link
            to="/"
            className="text-slate-500 hover:text-primary text-sm font-semibold inline-flex items-center gap-1 mb-4"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Beranda
          </Link>
          <h1 className="text-slate-900 text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Semua Berita
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mb-6">
            Kumpulan berita, pengumuman, dan informasi terkini dari HIMASI Universitas Terbuka Bogor.
          </p>
          <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">search</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, penulis, atau isi berita..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              aria-label="Cari berita"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                aria-label="Hapus pencarian"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            )}
          </div>
          {search && (
            <p className="mt-2 text-sm text-slate-500">
              {filteredNews.length} berita ditemukan
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-slate-500">Memuat berita...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">search_off</span>
            <p className="text-slate-500 text-lg">
              {search ? "Tidak ada berita yang cocok dengan pencarian." : "Belum ada berita yang dipublikasikan."}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-4 text-primary font-semibold hover:underline"
              >
                Hapus filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map((item, i) => (
              <article
                key={item.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full aspect-[16/10] overflow-hidden">
                  <img
                    src={item.photo || CARD_IMAGES[i % CARD_IMAGES.length]}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.currentTarget;
                      if (item.photo && el.src !== CARD_IMAGES[i % CARD_IMAGES.length])
                        el.src = CARD_IMAGES[i % CARD_IMAGES.length];
                    }}
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase rounded-full">
                    Berita Kegiatan
                  </span>
                </div>
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-4 text-slate-500 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {formatDate(item.publishedAt) || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">person</span>
                      {item.author || "HIMASI"}
                    </span>
                  </div>
                  <h3 className="text-slate-900 text-lg font-bold leading-snug">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 flex-1">
                    {item.desc ? stripMarkdown(item.desc) : "Informasi terbaru dari HIMASI Universitas Terbuka Bogor."}
                  </p>
                  <Link
                    to={`/berita/${item.slug || item.id}`}
                    className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    Baca artikel
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
