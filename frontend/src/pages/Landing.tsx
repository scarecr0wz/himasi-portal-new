import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicFooter from "../components/PublicFooter";
import PublicNavbar from "../components/PublicNavbar";
import SEO from "../components/SEO";
import DepartmentLogo from "../components/DepartmentLogo";

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
      fetch(`${API}/content/activities/upcoming?limit=3`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/content/departments`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/content/prokers`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/content/faqs`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([n, a, d, p, f]) => {
        setNews(Array.isArray(n) ? n.slice(0, 3) : []);
        setActivities(Array.isArray(a) ? a : []);
        setDepartments(Array.isArray(d) ? d : []);
        setProkers(Array.isArray(p) ? p : []);
        setFaqs(Array.isArray(f) ? f : []);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".landing-page [data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const filteredProkers = selectedDeptId
    ? prokers.filter((pr) => pr.departemenId === selectedDeptId)
    : prokers;
  const selectedProker =
    prokers.find((p) => p.id === selectedProkerId) ??
    filteredProkers[0] ?? null;

  // Konten landing = data dari CMS (Admin > Konten). Tanpa placeholder agar sinkron dengan admin.
  const displayNews = news;
  const displayActivities = activities;

  return (
    <div className="landing-page font-display bg-background-light text-slate-900 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300">
      <div className="flex flex-col grow">
        <PublicNavbar />
        <SEO />

        {/* Hero Section */}
        <section className="hero-shell mb-20 md:mb-24" aria-labelledby="hero-title">
          <div className="hero-inner">
            <div className="hero-content relative z-10">
              <div className="flex flex-col gap-7">
                <div className="flex flex-col gap-5">
                  <h1 id="hero-title" className="max-w-2xl text-slate-950 text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-5xl lg:text-[4.25rem]">
                    Tempat mahasiswa SI <span className="hero-title-accent">bertumbuh bersama.</span>
                  </h1>
                  <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl">
                    Di sini kita saling kenal, belajar bareng, bertukar pengalaman, dan bikin kegiatan yang benar-benar berguna untuk mahasiswa Sistem Informasi.
                  </p>
                </div>
                <div className="hero-actions flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/register"
                    className="hero-primary-button group flex items-center justify-center gap-2 rounded-xl h-13 px-6 bg-primary text-white text-sm font-bold shadow-xl shadow-primary/25 transition-all"
                  >
                    Gabung HIMASI
                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </Link>
                  <a
                    href="#acara"
                    className="flex items-center justify-center gap-2 rounded-xl h-13 px-6 bg-white/85 border border-slate-200 text-slate-800 text-sm font-bold hover:bg-white hover:border-primary/30 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg text-primary">calendar_month</span>
                    Lihat Acara
                  </a>
                </div>
              </div>
            </div>
            <div className="hero-particles" aria-hidden="true">
              <div className="hero-particle hero-particle-main">
                <span className="material-symbols-outlined">hub</span>
                <div><strong>Grow together</strong><small>make meaningful impact</small></div>
              </div>
              <div className="hero-particle">
                <span className="material-symbols-outlined">auto_stories</span>
                <strong>Learn together</strong>
              </div>
              <div className="hero-particle">
                <span className="material-symbols-outlined">lightbulb</span>
                <strong>Create together</strong>
              </div>
              <div className="hero-particle">
                <span className="material-symbols-outlined">rocket_launch</span>
                <strong>Move together</strong>
              </div>
            </div>
            <span className="sr-only">Latar menampilkan kebersamaan mahasiswa HIMASI Universitas Terbuka Bogor.</span>
          </div>
        </section>

        <main className="landing-main flex-1 max-w-[1440px] mx-auto w-full px-5 md:px-10 lg:px-14 xl:px-16 pb-8 md:pb-12">

          {/* HIMASI Infopedia - Berita */}
          <section id="berita" className="mb-16" data-reveal="section">
            <div className="mb-8">
              <span className="section-kicker">Wawasan & kabar kampus</span>
              <h2 className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight mb-2">HIMASI Infopedia</h2>
              <p className="text-slate-600 text-lg max-w-2xl">
                Pusat informasi terkini, berisikan info akademik, kegiatan, dan inovasi seputar Sistem Informasi.
              </p>
            </div>
            {loading ? (
              <p className="text-slate-500">Memuat...</p>
            ) : displayNews.length === 0 ? (
              <p className="text-slate-500 py-8">Belum ada berita. Kelola konten di <strong>Admin &gt; Konten (CMS)</strong>.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-7">
                {displayNews.slice(0, 3).map((item, i) => (
                  <article key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
                    <div className="relative w-full aspect-[16/10] rounded-t-2xl overflow-hidden">
                      <img
                        src={item.photo || CARD_IMAGES[i % CARD_IMAGES.length]}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const el = e.currentTarget;
                          if (item.photo && el.src !== CARD_IMAGES[i % CARD_IMAGES.length]) el.src = CARD_IMAGES[i % CARD_IMAGES.length];
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
                        {item.desc || "Informasi terbaru dari HIMASI Universitas Terbuka Bogor."}
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
            {!loading && displayNews.length > 0 && (
              <div className="mt-6 text-right">
                <Link to="/berita" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline inline-flex ml-auto">
                  Lihat Semua Berita <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            )}
          </section>

          {/* Upcoming Events Section */}
          <section id="acara" className="event-section mb-16" data-reveal="section">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="section-kicker">Jangan lewatkan</span>
                <h2 className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight">Acara Mendatang</h2>
              </div>
              <Link
                to="/acara"
                className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">calendar_month</span>
                Semua Acara
              </Link>
            </div>
            <div className="space-y-4">
              {displayActivities.length === 0 ? (
                <p className="text-slate-500 py-6">Belum ada acara mendatang. Kelola konten di <strong>Admin &gt; Konten (CMS)</strong>.</p>
              ) : (
                displayActivities.map((item) => {
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
                        to={`/acara/${item.id}`}
                        className="px-4 py-2 text-primary font-bold text-sm border-2 border-primary/20 rounded-lg hover:bg-primary hover:text-white transition-all shrink-0"
                      >
                        Detail & Daftar
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
            {displayActivities.length > 0 && (
              <div className="mt-6 text-right">
                <Link to="/acara" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline inline-flex ml-auto">
                  Lihat Semua Acara <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            )}
          </section>

          {/* Tentang HIMASI */}
          <section id="tentang" className="about-editorial mb-16" data-reveal="editorial">
            <div className="about-layout">
              <div className="about-image-wrap about-editorial-photo w-full">
                <img
                  src="/tentang-himasi.png"
                  alt="Himpunan Mahasiswa Sistem Informasi Universitas Terbuka Bogor"
                  className="w-full rounded-2xl shadow-lg object-cover aspect-[4/3]"
                />
              </div>
              <div className="about-copy w-full flex flex-col gap-6">
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
          </section>

          {/* Visi & Misi */}
          <section id="visi-misi" className="manifesto-section mb-16" data-reveal="manifesto">
            <span className="section-kicker">Arah gerak kami</span>
            <h2 className="manifesto-title text-slate-900 text-2xl md:text-3xl font-bold tracking-tight mb-8">Yang kami tuju, dan cara kami berjalan ke sana.</h2>
            <div className="manifesto-layout">
              <div className="vision-statement bg-white rounded-xl shadow-md p-6 md:p-8">
                <h3 className="text-slate-900 text-lg font-bold mb-4">Visi</h3>
                <p className="text-slate-600 leading-relaxed italic">
                  &ldquo;Menjadi wadah pengembangan potensi, kreativitas, dan profesionalisme mahasiswa Sistem Informasi yang unggul, berintegritas, dan berdaya saing dalam bidang teknologi informasi.&rdquo;
                </p>
              </div>
              <div className="mission-list bg-white rounded-xl shadow-md p-6 md:p-8">
                <h3 className="text-slate-900 text-lg font-bold mb-4">Misi</h3>
                <ul className="mission-steps space-y-3 text-slate-600 leading-relaxed">
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

          {/* Departemen - pakai primary saja biar aman di Tailwind v4 */}
          <section id="department" className="mb-16 py-12 px-6 md:px-8 rounded-2xl bg-primary/5" data-reveal="directory">
            <span className="section-kicker">Temukan ruang kontribusimu</span>
            <h2 className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight mb-8">Departemen HIMASI</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3">
                <DepartmentLogo title="Acara & Humas" icon="emoji_events" className="landing-department-logo" />
                <h3 className="text-slate-900 font-bold text-lg">Acara & Kehumasan</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Menyelenggarakan event dan menjalin hubungan dengan pihak luar.</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3">
                <DepartmentLogo title="Akademik & Keilmuan" icon="menu_book" className="landing-department-logo" />
                <h3 className="text-slate-900 font-bold text-lg">Akademik & Keilmuan</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Fokus pada pengembangan akademik dan wawasan teknologi informasi mahasiswa.</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3">
                <DepartmentLogo title="Media & Publikasi" icon="campaign" className="landing-department-logo" />
                <h3 className="text-slate-900 font-bold text-lg">Media & Publikasi</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Mengelola informasi, media sosial, dan branding organisasi.</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3">
                <DepartmentLogo title="Olahraga & Seni" icon="sports_basketball" className="landing-department-logo" />
                <h3 className="text-slate-900 font-bold text-lg">Olahraga & Seni</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Menampung minat dan bakat mahasiswa di bidang olahraga.</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
                <DepartmentLogo title="PSDM" icon="groups" className="landing-department-logo" />
                <h3 className="text-slate-900 font-bold text-lg">PSDM</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Pengembangan Sumber Daya Mahasiswa, kaderisasi, dan pelatihan soft skill.</p>
              </div>
            </div>
          </section>

          {/* Program Kerja / Proker Departemen */}
          <section id="program-kerja" className="mb-16" data-reveal="section">
            <div className="mb-8">
              <span className="section-kicker">Ide yang diwujudkan</span>
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
                      className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${selectedProker?.id === pr.id ? "bg-primary/10 text-primary border-primary/20" : "bg-white text-slate-700 hover:bg-slate-50 border-slate-100"}`}
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
          <section id="bergabung" className="hidden">
            <div className="text-center mb-12">
              <span className="section-kicker mx-auto">Temukan versi terbaikmu</span>
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
                to="/register"
                className="inline-flex items-center justify-center rounded-xl h-14 px-8 bg-primary text-white text-base font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                Daftar Sekarang
              </Link>
            </div>
          </section>

          {/* Frequently Asked Question */}
          <section id="faq" className="mb-16" data-reveal="section">
            <div className="mb-8">
              <span className="section-kicker">Perlu tahu lebih lanjut?</span>
              <h2 className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight mb-2">Pertanyaan yang Sering Ditanyakan</h2>
              <p className="text-slate-600 text-lg max-w-2xl">
                Pertanyaan yang sering diajukan seputar HIMASI, keanggotaan, dan kegiatan.
              </p>
            </div>
            {loading ? (
              <p className="text-slate-500">Memuat...</p>
            ) : faqs.length === 0 ? (
              <p className="text-slate-500 py-6">Belum ada FAQ. Kelola konten di <strong>Admin &gt; Konten (CMS)</strong>.</p>
            ) : faqs.map((faq) => (
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

        <PublicFooter />
      </div>
    </div>
  );
}
