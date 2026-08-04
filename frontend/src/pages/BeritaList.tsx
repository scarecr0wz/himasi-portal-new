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
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=85",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=85",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=85",
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
    <div className="landing-page font-display text-slate-900 min-h-screen flex flex-col">
      <PublicNavbar />
      <SEO
        title="Berita"
        description="Kumpulan berita, pengumuman, dan informasi terkini dari HIMASI Universitas Terbuka Bogor."
      />

      <main className="news-page flex-1 w-full">
        <section className="event-page-intro news-page-intro">
          <div className="event-page-container">
            <Link to="/" className="event-back-link">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              Beranda
            </Link>

            <div className="event-page-heading news-page-heading">
              <div>
                <p className="event-page-kicker">Ruang Berita</p>
                <h1>Cerita, kabar, dan jejak perjalanan HIMASI.</h1>
              </div>

              <div className="news-search-panel">
                <label htmlFor="news-search">Cari dalam arsip</label>
                <div className="news-search-field">
                  <span className="material-symbols-outlined" aria-hidden="true">search</span>
                  <input
                    id="news-search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Judul, penulis, atau topik..."
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch("")} aria-label="Hapus pencarian">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  )}
                </div>
                <p>{search ? `${filteredNews.length} artikel ditemukan` : `${news.length} artikel dalam arsip HIMASI`}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="event-page-container news-list-section" aria-labelledby="news-list-title">
          <div className="event-list-heading">
            <div>
              <p className="event-page-kicker">Dari HIMASI</p>
              <h2 id="news-list-title">Tulisan Terbaru</h2>
            </div>
            <p>Catatan kegiatan, pengumuman penting, dan cerita yang tumbuh bersama mahasiswa Sistem Informasi.</p>
          </div>

          {loading ? (
            <div className="event-loading" role="status">
              <span className="material-symbols-outlined">progress_activity</span>
              Memuat berita...
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="event-empty-state">
              <span className="material-symbols-outlined">{search ? "search_off" : "newspaper"}</span>
              <h3>{search ? "Berita tidak ditemukan." : "Belum ada berita baru."}</h3>
              <p>
                {search
                  ? "Coba gunakan kata kunci lain atau hapus pencarian untuk melihat semua artikel."
                  : "Cerita terbaru dari HIMASI akan hadir di sini."}
              </p>
              {search && (
                <button type="button" className="news-clear-search" onClick={() => setSearch("")}>
                  Hapus pencarian
                </button>
              )}
            </div>
          ) : (
            <div className="news-card-grid">
              {filteredNews.map((item, index) => {
                const fallbackImage = CARD_IMAGES[index % CARD_IMAGES.length];
                const featured = index === 0;
                return (
                  <Link
                    key={item.id}
                    to={`/berita/${item.slug || item.id}`}
                    className={`news-list-card group${featured ? " news-list-card-featured" : ""}`}
                    style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
                  >
                    <div className="news-card-media">
                      <img
                        src={item.photo || fallbackImage}
                        alt=""
                        onError={(e) => {
                          if (e.currentTarget.src !== fallbackImage) e.currentTarget.src = fallbackImage;
                        }}
                      />
                      <span className="news-card-label">{featured ? "Sorotan" : "Kabar HIMASI"}</span>
                      <span className="news-card-index">{String(index + 1).padStart(2, "0")}</span>
                    </div>

                    <div className="news-card-body">
                      <div className="news-card-meta">
                        <span>
                          <span className="material-symbols-outlined" aria-hidden="true">calendar_today</span>
                          {formatDate(item.publishedAt) || "Belum bertanggal"}
                        </span>
                        <span>
                          <span className="material-symbols-outlined" aria-hidden="true">edit_note</span>
                          {item.author || "HIMASI"}
                        </span>
                      </div>
                      <h3>{item.title}</h3>
                      <p className="news-card-description">
                        {item.desc ? stripMarkdown(item.desc) : "Informasi terbaru dari HIMASI Universitas Terbuka Bogor."}
                      </p>
                      <div className="news-card-footer">
                        <span>Baca cerita</span>
                        <span className="news-card-arrow material-symbols-outlined" aria-hidden="true">north_east</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
