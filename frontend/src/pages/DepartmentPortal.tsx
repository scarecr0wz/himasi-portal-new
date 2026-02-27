import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";

const API = "/api";
const DEFAULT_PERIODE = "2025/2026";
const ICON_FALLBACK = "folder";

type DepartemenItem = {
  id: string;
  title: string;
  icon: string;
  desc: string;
};

type PengurusItem = {
  id: string;
  name: string;
  role: string;
  photo: string | null;
  sortOrder: number;
  periode: string;
  departemenId: string | null;
  departemen?: { id: string; title: string; icon?: string } | null;
};

type ActivityItem = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  desc: string | null;
};

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  author: string;
  publishedAt: string | null;
  desc?: string;
  photo?: string | null;
};

function photoUrl(photo: string | null): string | null {
  if (!photo) return null;
  if (photo.startsWith("http") || photo.startsWith("/")) return photo;
  return `${API}/uploads/${photo}`;
}

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

function formatDateBadge(d: string): { day: string; month: string } {
  try {
    const dt = new Date(d);
    return {
      day: dt.getDate().toString(),
      month: dt.toLocaleDateString("id-ID", { month: "short" }).toUpperCase(),
    };
  } catch {
    return { day: "--", month: "---" };
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

const CARD_IMAGES = [
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80",
];

export default function DepartmentPortal() {
  const { id } = useParams<{ id: string }>();
  const [department, setDepartment] = useState<DepartemenItem | null>(null);
  const [pengurusList, setPengurusList] = useState<PengurusItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    Promise.all([
      fetch(`${API}/content/departments/${id}`).then((r) => {
        if (r.status === 404) return null;
        return r.ok ? r.json() : null;
      }),
      fetch(`${API}/content/pengurus?periode=${encodeURIComponent(DEFAULT_PERIODE)}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/content/activities?departemenId=${encodeURIComponent(id!)}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/content/news`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([dept, pengurus, acts, newsList]) => {
        if (!dept) {
          setNotFound(true);
          setDepartment(null);
        } else {
          setDepartment(dept);
        }
        setPengurusList(Array.isArray(pengurus) ? pengurus.filter((p) => p.departemenId === id) : []);
        setActivities(Array.isArray(acts) ? acts : []);
        setNews(Array.isArray(newsList) ? newsList.slice(0, 6) : []);
      })
      .catch(() => {
        setNotFound(true);
        setDepartment(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading && !department) {
    return (
      <div className="font-display bg-background-light text-slate-900 min-h-screen flex flex-col">
        <PublicNavbar />
        <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-12 flex justify-center items-center">
          <p className="text-slate-500">Memuat portal departemen...</p>
        </main>
        <PublicFooter />
      </div>
    );
  }

  if (notFound || !department) {
    return (
      <div className="font-display bg-background-light text-slate-900 min-h-screen flex flex-col">
        <PublicNavbar />
        <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-12 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">folder_off</span>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Departemen tidak ditemukan</h1>
          <p className="text-slate-500 mb-6">URL mungkin salah atau departemen sudah tidak tersedia.</p>
          <Link to="/pengurus" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
            <span className="material-symbols-outlined">arrow_back</span>
            Kembali ke Pengurus
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  const sortedActivities = [...activities].sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

  return (
    <div className="font-display bg-background-light text-slate-900 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300">
      <PublicNavbar />

      <section className="bg-primary text-white">
        <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl md:text-4xl">
                  {department.icon?.match(/^[a-z0-9_]+$/) ? department.icon : ICON_FALLBACK}
                </span>
              </div>
              <div>
                <nav className="flex items-center gap-2 text-sm text-white/80 mb-1" aria-label="Breadcrumb">
                  <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                  <Link to="/pengurus" className="hover:text-white transition-colors">Pengurus</Link>
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                  <span className="text-white font-semibold">{department.title}</span>
                </nav>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight">{department.title}</h1>
                {department.desc ? (
                  <p className="text-white/90 text-sm md:text-base mt-1 max-w-xl line-clamp-2">{department.desc}</p>
                ) : null}
              </div>
            </div>
            <Link
              to="/pengurus"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-semibold transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Semua Departemen
            </Link>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-10 md:py-14">
        {/* Pengurus Departemen */}
        <section className="mb-14 md:mb-16" aria-labelledby="pengurus-heading">
          <h2 id="pengurus-heading" className="text-slate-900 text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">groups</span>
            Pengurus {department.title}
          </h2>
          <p className="text-slate-500 text-sm mb-8">Tim yang mengoordinasikan program kerja departemen ini.</p>

          {pengurusList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 text-sm">
              Data pengurus departemen ini belum diisi. Kelola di Admin → Pengurus.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {pengurusList.map((person) => (
                <article
                  key={person.id}
                  className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center gap-4 border border-slate-100 hover:shadow-lg hover:border-primary/20 transition-all"
                >
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-primary/20">
                    {photoUrl(person.photo) ? (
                      <img src={photoUrl(person.photo)!} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-5xl text-primary/60">person</span>
                    )}
                  </div>
                  <div className="text-center min-w-0">
                    <h3 className="text-slate-900 font-bold text-base">{person.name}</h3>
                    <span className="inline-block mt-2 px-3 py-1 bg-primary text-white text-xs font-bold uppercase rounded-full">
                      {person.role}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Kalendar Aktivitas */}
        <section className="mb-14 md:mb-16" aria-labelledby="kalendar-heading">
          <h2 id="kalendar-heading" className="text-slate-900 text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">calendar_month</span>
            Kalendar Aktivitas
          </h2>
          <p className="text-slate-500 text-sm mb-8">Jadwal kegiatan dan acara HIMASI.</p>

          {sortedActivities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 text-sm">
              Belum ada aktivitas yang dijadwalkan. Kelola di Admin → Konten (CMS) → Aktivitas.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedActivities.slice(0, 10).map((item) => {
                const badge = formatDateBadge(item.startAt);
                const start = new Date(item.startAt);
                const end = new Date(item.endAt);
                const timeStr = `${start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-4 md:gap-6 p-4 rounded-xl bg-white border border-slate-100 hover:border-primary/30 transition-colors shadow-sm"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[70px] h-[70px] bg-primary/10 text-primary rounded-xl shrink-0">
                      <span className="text-2xl font-black">{badge.day}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{badge.month}</span>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <h4 className="text-slate-900 font-bold">{item.title}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">schedule</span>
                          {timeStr}
                        </span>
                      </div>
                      {item.desc ? (
                        <p className="text-slate-600 text-sm mt-1 line-clamp-2">{item.desc}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Berita Terkait */}
        <section className="mb-14 md:mb-16" aria-labelledby="berita-heading">
          <h2 id="berita-heading" className="text-slate-900 text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">newspaper</span>
            Berita Terkini
          </h2>
          <p className="text-slate-500 text-sm mb-8">Informasi dan berita terbaru dari HIMASI.</p>

          {news.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 text-sm">
              Belum ada berita. Kelola di Admin → Konten (CMS) → Berita.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item, i) => (
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
                      {item.desc ? stripMarkdown(item.desc) : "Informasi terbaru dari HIMASI."}
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
          {news.length > 0 && (
            <div className="mt-6 text-right">
              <Link
                to="/berita"
                className="text-primary text-sm font-bold hover:underline inline-flex items-center gap-1 ml-auto"
              >
                Lihat Semua Berita
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-primary/5 border border-primary/10 p-8 md:p-12 text-center">
          <h2 className="text-slate-900 text-xl md:text-2xl font-bold mb-3">Kembali ke Struktur Pengurus</h2>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto mb-6">
            Lihat semua departemen dan Badan Pengurus Harian HIMASI.
          </p>
          <Link
            to="/pengurus"
            className="inline-flex items-center justify-center rounded-xl h-12 px-8 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            Lihat Semua Departemen
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
