import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";

const API = "/api";

type ActivityItem = {
  id: string;
  title: string;
  image: string | null;
  desc: string | null;
  startAt: string;
  endAt: string;
  departemen?: { id: string; title: string } | null;
};

function formatDate(d: string): string {
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

function isUpcoming(startAt: string): boolean {
  return new Date(startAt) >= new Date();
}

export default function AcaraList() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/content/activities`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setActivities(Array.isArray(data) ? data : []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="font-display bg-background-light text-slate-900 min-h-screen flex flex-col">
      <PublicNavbar />

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
            Semua Acara
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mb-6">
            Daftar acara dan kegiatan HIMASI. Daftar untuk berpartisipasi.
          </p>
        </div>

        {loading && (
          <p className="text-slate-500 py-12">Memuat acara...</p>
        )}

        {!loading && activities.length === 0 && (
          <p className="text-slate-500 py-12">Belum ada acara. Kelola konten di <strong>Admin → Konten (CMS)</strong>.</p>
        )}

        {!loading && activities.length > 0 && (
          <div className="space-y-4">
            {activities.map((item) => {
              const badge = formatDateBadge(item.startAt);
              const start = new Date(item.startAt);
              const end = new Date(item.endAt);
              const timeStr = `${start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
              const upcoming = isUpcoming(item.startAt);
              return (
                <Link
                  key={item.id}
                  to={`/acara/${item.id}`}
                  className="flex flex-wrap items-center gap-4 md:gap-6 p-4 rounded-xl bg-white border border-slate-100 hover:border-primary transition-colors shadow-sm group block"
                >
                  <div className="flex flex-col items-center justify-center min-w-[70px] h-[70px] bg-primary/10 text-primary rounded-xl shrink-0">
                    <span className="text-2xl font-black">{badge.day}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{badge.month}</span>
                  </div>
                  {item.image && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 hidden sm:block">
                      <img
                        src={item.image.startsWith("http") ? item.image : item.image.startsWith("/") ? item.image : `/${item.image}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-slate-900 font-bold group-hover:text-primary transition-colors">{item.title}</h2>
                      {upcoming && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          Mendatang
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        {formatDate(item.startAt)} · {timeStr}
                      </span>
                      {item.departemen && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-base">business</span>
                          {item.departemen.title}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors shrink-0">arrow_forward</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-100">
          <Link to="/" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali ke beranda
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
