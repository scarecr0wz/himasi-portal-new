import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
type ActivityItem = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  desc: string | null;
};

type DepartemenItem = {
  id: string;
  title: string;
  icon?: string;
  desc?: string;
};

type ProkerItem = {
  id: string;
  departemenId: string;
  photo: string | null;
  title: string;
  desc: string;
  departemen?: { id: string; title: string };
};

type FaqItem = {
  id: string;
  title: string;
  desc: string;
};

const HERO_IMAGE = "/hero-himasi.png";
const CARD_IMAGES = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80",
  "https://images.unsplash.com/photo-1569025743873-ea3a9ce58e43?w=600&q=80",
];

function formatDate(d: string | null): string {
  if (!d) return "";
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
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
      month: dt.toLocaleDateString("en-ID", { month: "short" }).toUpperCase(),
    };
  } catch {
    return { day: "--", month: "---" };
  }
}

export default function Landing() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [departments, setDepartments] = useState<DepartemenItem[]>([]);
  const [prokers, setProkers] = useState<ProkerItem[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [selectedProkerId, setSelectedProkerId] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqOpenId, setFaqOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/content/news`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/content/activities`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/content/departments`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/content/prokers`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/content/faqs`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([n, a, d, p, f]) => {
        setNews(Array.isArray(n) ? n.slice(0, 6) : []);
        setActivities(Array.isArray(a) ? a.slice(0, 6) : []);
        setDepartments(Array.isArray(d) ? d : []);
        setProkers(Array.isArray(p) ? p : []);
        setFaqs(Array.isArray(f) ? f : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredProkers = selectedDeptId
    ? prokers.filter((pr) => pr.departemenId === selectedDeptId)
    : prokers;
  const selectedProker =
    prokers.find((p) => p.id === selectedProkerId) ??
    filteredProkers[0] ?? null;

  const displayNews = news.length > 0 ? news : [
    {
      id: "1",
      title: "Pendaftaran Semester Ganjil 2025/2026 Dibuka",
      author: "HIMASI",
      publishedAt: "2025-10-12",
      desc: "Pendaftaran untuk mahasiswa baru dan lanjutan sudah dibuka. Segera daftar melalui portal akademik.",
    },
    {
      id: "2",
      title: "Webinar Literasi Digital untuk Prodi SI",
      author: "HIMASI",
      publishedAt: "2025-10-10",
      desc: "Kegiatan webinar kerja sama dengan dosen dan praktisi untuk meningkatkan kompetensi mahasiswa.",
    },
    {
      id: "3",
      title: "Perpustakaan Digital UT Bogor Diperluas",
      author: "HIMASI",
      publishedAt: "2025-10-08",
      desc: "Akses e-book dan jurnal diperluas untuk mendukung pembelajaran dan penelitian.",
    },
  ] as NewsItem[];

  const displayActivities = activities.length > 0 ? activities : [
    { id: "1", title: "Malam Keakraban Keluarga Prodi SI", startAt: "2026-02-11T19:00:00", endAt: "2026-02-11T22:00:00", desc: null },
    { id: "2", title: "Workshop Pengembangan Aplikasi Web", startAt: "2026-02-15T14:00:00", endAt: "2026-02-15T17:00:00", desc: null },
    { id: "3", title: "Seminar Tugas Akhir & Karier", startAt: "2026-02-20T09:00:00", endAt: "2026-02-20T12:00:00", desc: null },
  ] as ActivityItem[];

  return (
    <div className="font-display bg-background-light text-slate-900 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300">
      <div className="flex flex-col grow">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 md:px-10 lg:px-40 py-3">
          <div className="flex items-center justify-between gap-8 max-w-[1280px] mx-auto">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3">
                <img src="/logo-himasi.png" alt="HIMASI" className="h-10 w-auto object-contain" />
              </Link>
              <nav className="hidden lg:flex items-center gap-6">
                <a href="#berita" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Berita</a>
                <a href="#acara" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Acara</a>
                <a href="#pengurus" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Pengurus</a>
                <a href="#program-kerja" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Program Kerja</a>
                <a href="#department" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Department</a>
                <a href="#faq" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">FAQ</a>
                <a href="#tentang" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Tentang</a>
              </nav>
            </div>
            <div className="flex flex-1 justify-end items-center gap-4">
              <label className="hidden md:flex items-center relative min-w-40 max-w-64 h-10 group">
                <span className="absolute left-3 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-xl">search</span>
                <input className="w-full h-full pl-10 pr-4 rounded-lg border-none bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary text-sm transition-all" placeholder="Cari..." />
              </label>
              <Link
                to="/login"
                className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
              >
                Masuk
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-12">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="flex flex-col gap-10 md:flex-row md:items-center">
              <div
                className="w-full md:w-1/2 aspect-video bg-cover bg-center rounded-2xl shadow-2xl relative overflow-hidden group"
                style={{ backgroundImage: `url(${HERO_IMAGE})` }}
              >
                <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500" />
              </div>
              <div className="flex flex-col gap-8 md:w-1/2">
                <div className="flex flex-col gap-4">
                  <span className="text-primary font-bold tracking-widest uppercase text-xs">Level Up Potensi, Ciptakan Dampak.</span>
                  <h1 className="text-slate-900 text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
                    Bangun <span className="text-primary">Masa Depanmu</span> di Sini.
                  </h1>
                  <p className="text-slate-600 text-lg leading-relaxed max-w-xl">
                    Ekosistem digital untuk mahasiswa Sistem Informasi yang ingin berkembang, terhubung, dan melangkah lebih jauh. Semua peluang, komunitas, dan event ada dalam satu platform.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/login"
                    className="flex min-w-[160px] items-center justify-center rounded-xl h-14 px-8 bg-primary text-white text-base font-bold shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all"
                  >
                    Mulai
                  </Link>
                  <a
                    href="#acara"
                    className="flex min-w-[160px] items-center justify-center rounded-xl h-14 px-8 bg-white border-2 border-slate-100 text-slate-900 text-base font-bold hover:bg-slate-50 transition-all"
                  >
                    Lihat Acara
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* HIMASI Infopedia - Berita */}
          <section id="berita" className="mb-16">
            <div className="mb-8">
              <h2 className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight mb-2">HIMASI Infopedia</h2>
              <p className="text-slate-600 text-lg max-w-2xl">
                Pusat informasi terkini, berisikan info akademik, kegiatan, dan inovasi seputar Sistem Informasi.
              </p>
            </div>
            {loading ? (
              <p className="text-slate-500">Memuat...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayNews.slice(0, 3).map((item, i) => (
                  <article key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
                    <div className="relative w-full aspect-[16/10] rounded-t-2xl overflow-hidden">
                      <img
                        src={item.photo || CARD_IMAGES[i % CARD_IMAGES.length]}
                        alt=""
                        className="w-full h-full object-cover"
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
                        {item.desc || "Informasi terbaru dari HIMASI Universitas Terbuka Bogor."}
                      </p>
                      <a
                        href={`#berita-${item.slug || item.id}`}
                        className="text-primary text-sm font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Baca artikel
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {!loading && displayNews.length > 0 && (
              <div className="mt-6 text-right">
                <a href="#berita" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline inline-flex ml-auto">
                  Semua Berita <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            )}
          </section>

          {/* Upcoming Events Section */}
          <section id="acara" className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-slate-900 text-2xl font-bold tracking-tight">Acara Mendatang</h2>
              <Link
                to="/login"
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">calendar_month</span>
                Kalender
              </Link>
            </div>
            <div className="space-y-4">
              {displayActivities.slice(0, 3).map((item) => {
                const badge = formatDateBadge(item.startAt);
                const start = new Date(item.startAt);
                const end = new Date(item.endAt);
                const timeStr = `${start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center gap-4 md:gap-6 p-4 rounded-xl bg-white border border-slate-100 hover:border-primary transition-colors shadow-sm group"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[70px] h-[70px] bg-primary/10 text-primary rounded-xl">
                      <span className="text-2xl font-black">{badge.day}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{badge.month}</span>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <h4 className="text-slate-900 font-bold group-hover:text-primary transition-colors">{item.title}</h4>
                      <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">schedule</span>
                          {timeStr}
                        </span>
                      </div>
                    </div>
                    <Link
                      to="/login"
                      className="px-4 py-2 text-primary font-bold text-sm border-2 border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-all shrink-0"
                    >
                      Daftar
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tentang HIMASI */}
          <section id="tentang" className="mb-16">
            <div className="flex flex-col gap-10 md:flex-row md:items-center">
              <div className="w-full md:w-1/2">
                <img
                  src="/tentang-himasi.png"
                  alt="Himpunan Mahasiswa Sistem Informasi Universitas Terbuka Bogor"
                  className="w-full rounded-2xl shadow-lg object-cover aspect-[4/3]"
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-6">
                <h2 className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight">Tentang HIMASI</h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  HIMASI adalah rumah bagi mahasiswa Sistem Informasi Universitas Terbuka Bogor untuk tumbuh, berkolaborasi, dan menciptakan dampak.
                </p>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Kami membangun ruang belajar yang dinamis—menggabungkan teknologi, kreativitas, dan kepemimpinan—untuk menyiapkan generasi digital yang adaptif dan siap menghadapi perubahan.
                </p>
                <p className="text-slate-900 font-semibold text-lg">Bersama, kita berkembang.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6 mt-10">
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-slate-800">5</div>
                <div className="text-sm text-slate-500 mt-1">Departemen</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-slate-800">100+</div>
                <div className="text-sm text-slate-500 mt-1">Anggota Aktif</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-slate-800">12</div>
                <div className="text-sm text-slate-500 mt-1">Program Kerja</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <div className="text-2xl md:text-3xl font-bold text-slate-800">8/10</div>
                <div className="text-sm text-slate-500 mt-1">Kepuasan Anggota</div>
              </div>
            </div>
          </section>

          {/* Visi & Misi */}
          <section id="visi-misi" className="mb-16">
            <h2 className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight mb-8">Visi dan Misi</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                <h3 className="text-slate-900 text-lg font-bold mb-4">Visi</h3>
                <p className="text-slate-600 leading-relaxed italic">
                  &ldquo;Menjadi wadah pengembangan potensi, kreativitas, dan profesionalisme mahasiswa Sistem Informasi yang unggul, berintegritas, dan berdaya saing dalam bidang teknologi informasi.&rdquo;
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                <h3 className="text-slate-900 text-lg font-bold mb-4">Misi</h3>
                <ul className="space-y-3 text-slate-600 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-primary shrink-0 mt-1">•</span>
                    <span>Meningkatkan kualitas dan partisipasi mahasiswa dalam kegiatan akademik maupun non-akademik yang mendukung pengembangan kompetensi di bidang Sistem Informasi</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary shrink-0 mt-1">•</span>
                    <span>Menjalin komunikasi dan kerja sama antara mahasiswa, dosen, alumni dan pihak eksternal untuk membangun lingkungan yang suportif dan kolaboratif</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary shrink-0 mt-1">•</span>
                    <span>Mendorong inovasi dan kreativitas mahasiswa melalui program kerja yang berbasis teknologi</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary shrink-0 mt-1">•</span>
                    <span>Mewujudkan budaya organisasi yang profesional, transparan dan akuntabel dalam setiap kegiatan dan kepengurusan</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary shrink-0 mt-1">•</span>
                    <span>Menjadi representasi aspirasi mahasiswa Sistem Informasi dan menjembatani hubungan antara mahasiswa</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Department - pakai primary saja biar aman di Tailwind v4 */}
          <section id="department" className="mb-16 py-12 px-6 md:px-8 rounded-2xl bg-primary/5">
            <h2 className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight mb-8">Department</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3">
                <span className="material-symbols-outlined text-3xl text-primary" aria-hidden>emoji_events</span>
                <h3 className="text-slate-900 font-bold text-lg">Acara & Kehumasan</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Menyelenggarakan event dan menjalin hubungan dengan pihak luar.</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3">
                <span className="material-symbols-outlined text-3xl text-primary" aria-hidden>menu_book</span>
                <h3 className="text-slate-900 font-bold text-lg">Akademik & Keilmuan</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Fokus pada pengembangan akademik dan wawasan teknologi informasi mahasiswa.</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3">
                <span className="material-symbols-outlined text-3xl text-primary" aria-hidden>campaign</span>
                <h3 className="text-slate-900 font-bold text-lg">Media & Publikasi</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Mengelola informasi, media sosial, dan branding organisasi.</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3">
                <span className="material-symbols-outlined text-3xl text-primary" aria-hidden>sports_basketball</span>
                <h3 className="text-slate-900 font-bold text-lg">Olahraga & Seni</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Menampung minat dan bakat mahasiswa di bidang olahraga.</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
                <span className="material-symbols-outlined text-3xl text-primary" aria-hidden>groups</span>
                <h3 className="text-slate-900 font-bold text-lg">PSDM</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Pengembangan Sumber Daya Mahasiswa, kaderisasi, dan pelatihan soft skill.</p>
              </div>
            </div>
          </section>

          {/* Program Kerja / Proker Departemen */}
          <section id="program-kerja" className="mb-16">
            <div className="mb-8">
              <h2 className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight mb-2">Program Kerja HIMASI</h2>
              <p className="text-slate-600 text-lg">Program kerja unggulan dari setiap departemen HIMASI.</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={() => { setSelectedDeptId(null); setSelectedProkerId(null); }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${selectedDeptId === null ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                Semua Departemen
              </button>
              {departments.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => { setSelectedDeptId(d.id); setSelectedProkerId(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${selectedDeptId === d.id ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {d.title}
                </button>
              ))}
            </div>
            {loading ? (
              <p className="text-slate-500 py-8">Memuat program kerja...</p>
            ) : filteredProkers.length === 0 ? (
              <p className="text-slate-500 py-8">Belum ada program kerja untuk departemen ini.</p>
            ) : (
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-72 shrink-0 flex flex-col gap-1">
                  {filteredProkers.map((pr) => (
                    <button
                      key={pr.id}
                      type="button"
                      onClick={() => setSelectedProkerId(pr.id)}
                      className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${selectedProker?.id === pr.id ? "bg-primary/10 text-primary border-l-4 border-primary pl-[calc(1rem-4px)]" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-100"}`}
                    >
                      {pr.title}
                    </button>
                  ))}
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0">
                  <div className="md:col-span-2 rounded-xl overflow-hidden bg-slate-100 aspect-video">
                    <img
                      src={selectedProker?.photo ?? "/wadah-berkembang.png"}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {selectedProker?.departemen && (
                      <p className="text-center py-2 text-slate-600 text-sm font-medium bg-white/90">{selectedProker.departemen.title}</p>
                    )}
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3">
                    <h3 className="text-slate-900 font-bold text-lg">{selectedProker?.title ?? "—"}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed flex-1">{selectedProker?.desc ?? "Pilih program kerja di sebelah kiri."}</p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Keuntungan Bergabung / Ajakan Bergabung */}
          <section id="bergabung" className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight mb-3">Mari Bergabung dengan HIMASI</h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Bergabung dengan HIMASI memberikan berbagai manfaat untuk pengembangan diri Anda.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <article className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
                <div
                  className="w-full aspect-[16/10] bg-cover bg-center rounded-t-2xl"
                  style={{ backgroundImage: "url(/wadah-berkembang.png)" }}
                  role="img"
                  aria-label="Kegiatan kelompok dan kekompakan tim"
                />
                <div className="p-6 flex flex-col gap-3 text-left">
                  <h3 className="text-slate-900 font-bold text-lg">Wadah Berkembang dan Kekompakan</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Hima SI menjadi ruang bagi setiap anggota untuk mengasah potensi diri sekaligus membangun kekompakan tim yang solid dalam lingkungan organisasi yang suportif dan dinamis.
                  </p>
                </div>
              </article>
              <article className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
                <div
                  className="w-full aspect-[16/10] bg-cover bg-center rounded-t-2xl"
                  style={{ backgroundImage: "url(/peningkatan-prestasi.png)" }}
                  role="img"
                  aria-label="Kolaborasi akademik dan diskusi"
                />
                <div className="p-6 flex flex-col gap-3 text-left">
                  <h3 className="text-slate-900 font-bold text-lg">Peningkatan Prestasi melalui Kolaborasi Akademik</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Hima SI menjadi ekosistem belajar yang suportif untuk saling berbagi materi kuliah dan strategi belajar, sehingga setiap anggota bisa mencapai target akademik secara maksimal melalui dukungan kolektif.
                  </p>
                </div>
              </article>
              <article className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
                <div
                  className="w-full aspect-[16/10] bg-cover bg-center rounded-t-2xl"
                  style={{ backgroundImage: "url(/lebih-dari-organisasi.png)" }}
                  role="img"
                  aria-label="Keluarga dan solidaritas"
                />
                <div className="p-6 flex flex-col gap-3 text-left">
                  <h3 className="text-slate-900 font-bold text-lg">Lebih dari Organisasi</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Hima SI adalah rumah tempat setiap anggota bertumbuh sebagai keluarga yang saling mendukung melewati tantangan akademik maupun personal dengan penuh solidaritas.
                  </p>
                </div>
              </article>
            </div>
            <div className="text-center mt-10">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl h-14 px-8 bg-primary text-white text-base font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                Daftar Sekarang
              </Link>
            </div>
          </section>

          {/* Frequently Asked Question */}
          <section id="faq" className="mb-16">
            <div className="mb-8">
              <h2 className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight mb-2">Frequently Asked Question</h2>
              <p className="text-slate-600 text-lg max-w-2xl">
                Pertanyaan yang sering diajukan seputar HIMASI, keanggotaan, dan kegiatan.
              </p>
            </div>
            {loading ? (
              <p className="text-slate-500">Memuat...</p>
            ) : (faqs.length > 0 ? faqs : [
              { id: "1", title: "Apa itu HIMASI?", desc: "HIMASI (Himpunan Mahasiswa Sistem Informasi) adalah organisasi kemahasiswaan bagi mahasiswa Prodi Sistem Informasi Universitas Terbuka Bogor. Wadah untuk berkembang, berkolaborasi, dan berkontribusi di kampus dan masyarakat." },
              { id: "2", title: "Bagaimana cara bergabung dengan HIMASI?", desc: "Mahasiswa aktif Prodi Sistem Informasi UT Bogor dapat mendaftar melalui portal ini. Klik tombol Masuk atau Daftar, lengkapi data, dan ikuti proses verifikasi oleh pengurus." },
              { id: "3", title: "Apa saja manfaat menjadi anggota HIMASI?", desc: "Anggota mendapat akses ke program kerja (akademik, acara, media, olahraga, PSDM), jaringan dengan senior dan alumni, sertifikat kegiatan, serta pengembangan soft skill dan kepemimpinan." },
            ] as FaqItem[]).map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden mb-3"
              >
                <button
                  type="button"
                  onClick={() => setFaqOpenId((prev) => (prev === faq.id ? null : faq.id))}
                  className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50/80 transition-colors"
                >
                  <span className="font-semibold text-slate-900">{faq.title}</span>
                  <span className={`material-symbols-outlined text-slate-500 shrink-0 transition-transform ${faqOpenId === faq.id ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                {faqOpenId === faq.id && (
                  <div className="px-6 pb-4 pt-0">
                    <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">{faq.desc}</p>
                  </div>
                )}
              </div>
            ))}
          </section>
        </main>

        {/* Footer */}
        <footer id="footer" className="bg-white border-t border-slate-200 px-6 md:px-10 lg:px-40 py-16">
          <div className="max-w-[1280px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <img src="/logo-himasi.png" alt="HIMASI" className="h-8 w-auto object-contain" />
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Wadah mahasiswa Prodi Sistem Informasi Universitas Terbuka Bogor. Informasi, acara, dan layanan kemahasiswaan dalam satu portal.
                </p>
                <div className="flex gap-4">
                  <a className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all" href="#" aria-label="Web">
                    <span className="material-symbols-outlined text-lg">public</span>
                  </a>
                  <a className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all" href="#" aria-label="Email">
                    <span className="material-symbols-outlined text-lg">alternate_email</span>
                  </a>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <h4 className="text-slate-900 font-bold uppercase text-xs tracking-widest">Sumber</h4>
                <ul className="flex flex-col gap-3 text-sm text-slate-500">
                  <li><a href="#berita" className="hover:text-primary transition-colors">Berita</a></li>
                  <li><a href="#acara" className="hover:text-primary transition-colors">Acara</a></li>
                  <li><a href="#pengurus" className="hover:text-primary transition-colors">Pengurus</a></li>
                  <li><a href="#program-kerja" className="hover:text-primary transition-colors">Program Kerja</a></li>
                  <li><a href="#department" className="hover:text-primary transition-colors">Department</a></li>
                  <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
                  <li><Link to="/login" className="hover:text-primary transition-colors">Portal Mahasiswa</Link></li>
                </ul>
              </div>
              <div className="flex flex-col gap-6">
                <h4 className="text-slate-900 font-bold uppercase text-xs tracking-widest">Institusi</h4>
                <ul className="flex flex-col gap-3 text-sm text-slate-500">
                  <li><a href="#tentang" className="hover:text-primary transition-colors">Tentang Kami</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Kontak</a></li>
                </ul>
              </div>
              <div className="flex flex-col gap-6">
                <h4 className="text-slate-900 font-bold uppercase text-xs tracking-widest">Tetap Terkini</h4>
                <p className="text-sm text-slate-500">Berlangganan untuk info terbaru dari HIMASI.</p>
                <div className="flex gap-2">
                  <input className="w-full bg-slate-100 border-none rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary" placeholder="Alamat email" type="email" />
                  <button type="button" className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-all">
                    <span className="material-symbols-outlined text-xl">send</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-slate-400 text-[10px] font-medium tracking-wide">© 2024 HIMASI Universitas Terbuka Bogor. Dikelola oleh Departemen Media & Publikasi.</p>
              <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <a href="#" className="hover:text-primary">Kebijakan Privasi</a>
                <a href="#" className="hover:text-primary">Syarat Layanan</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
