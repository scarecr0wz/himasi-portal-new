import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";

const API = "/api";

type FaqItem = {
  id: string;
  title: string;
  desc: string;
};

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/[*_~`#>]/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

export default function FaqList() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/content/faqs`)
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => setFaqs(Array.isArray(data) ? data : []))
      .catch(() => setFaqs([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredFaqs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return faqs;
    return faqs.filter((faq) =>
      faq.title.toLowerCase().includes(keyword) || stripMarkdown(faq.desc).toLowerCase().includes(keyword),
    );
  }, [faqs, search]);

  return (
    <div className="landing-page font-display text-slate-900 min-h-screen flex flex-col overflow-x-hidden">
      <PublicNavbar />
      <SEO
        title="FAQ"
        description="Jawaban atas pertanyaan umum seputar HIMASI Universitas Terbuka Bogor."
      />

      <main className="faq-page flex-1 w-full">
        <section className="event-page-intro faq-page-intro">
          <div className="event-page-container">
            <Link to="/" className="event-back-link">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              Beranda
            </Link>

            <div className="event-page-heading faq-page-heading">
              <div>
                <p className="event-page-kicker">Pusat Bantuan</p>
                <h1>Pertanyaanmu mungkin sudah terjawab di sini.</h1>
              </div>
              <div className="news-search-panel faq-search-panel">
                <label htmlFor="faq-search">Cari jawaban</label>
                <div className="news-search-field">
                  <span className="material-symbols-outlined" aria-hidden="true">search</span>
                  <input
                    id="faq-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Ketik pertanyaan atau topik..."
                  />
                  {search && (
                    <button type="button" onClick={() => setSearch("")} aria-label="Hapus pencarian">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  )}
                </div>
                <p>{search ? `${filteredFaqs.length} jawaban ditemukan` : `${faqs.length} pertanyaan dalam pusat bantuan`}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="event-page-container faq-content" aria-labelledby="faq-list-title">
          <div className="people-section-heading faq-section-heading">
            <div>
              <p className="event-page-kicker">Yang Sering Ditanyakan</p>
              <h2 id="faq-list-title">Temukan Jawaban</h2>
            </div>
            <p>Informasi singkat seputar organisasi, keanggotaan, kegiatan, dan layanan HIMASI.</p>
          </div>

          {loading ? (
            <div className="event-loading" role="status">
              <span className="material-symbols-outlined">progress_activity</span>
              Memuat pertanyaan...
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="event-empty-state faq-empty-state">
              <span className="material-symbols-outlined">search_off</span>
              <h3>Jawaban belum ditemukan.</h3>
              <p>Coba gunakan kata kunci lain atau lihat semua pertanyaan yang tersedia.</p>
              {search && (
                <button type="button" className="news-clear-search" onClick={() => setSearch("")}>
                  Hapus pencarian
                </button>
              )}
            </div>
          ) : (
            <div className="faq-directory-list">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openId === faq.id;
                const answerId = `faq-answer-${faq.id}`;
                return (
                  <article
                    key={faq.id}
                    className={`faq-directory-item${isOpen ? " is-open" : ""}`}
                    style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                    >
                      <span className="faq-item-index">{String(index + 1).padStart(2, "0")}</span>
                      <span className="faq-item-question">{faq.title}</span>
                      <span className="faq-item-toggle material-symbols-outlined" aria-hidden="true">add</span>
                    </button>
                    <div id={answerId} className="faq-item-answer" hidden={!isOpen}>
                      <p>{stripMarkdown(faq.desc)}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="faq-contact-note">
            <div>
              <span className="material-symbols-outlined" aria-hidden="true">forum</span>
              <div>
                <h3>Masih belum menemukan jawaban?</h3>
                <p>Masuk ke portal mahasiswa untuk berdiskusi langsung bersama komunitas HIMASI.</p>
              </div>
            </div>
            <Link to="/login">Masuk ke Portal</Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
