import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const API = "/api";

type ActivityItem = {
  id: string;
  title: string;
  image: string | null;
  desc: string | null;
  startAt: string;
  endAt: string;
  uploadAt: string;
  isActive: boolean;
  departemen?: { id: string; title: string } | null;
  participatedAt: string;
  attended: boolean;
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

function imageSrc(image: string | null): string {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  if (image.startsWith("/")) return image;
  return `${API}/uploads/${image.replace(/^.*\//, "")}`;
}

export default function DashboardAcara() {
  const { token } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${API}/profile/activities/registered`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Gagal memuat data");
        return r.json();
      })
      .then((data) => setActivities(Array.isArray(data) ? data : []))
      .catch(() => setError("Gagal memuat acara yang didaftarkan"))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="min-w-0 w-full">
      <nav className="dashboard-breadcrumb" aria-label="Breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span> &gt; Acara</span>
      </nav>

      <section className="dashboard-section">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="section-title">
              <span className="section-title-bar" />
              Acara Saya
            </h2>
            <p className="section-subtitle">
              Daftar acara dan kegiatan HIMASI yang Anda ikuti.
            </p>
          </div>
          <Link
            to="/acara"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Lihat semua acara & daftar
          </Link>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        {loading && (
          <p className="text-slate-500 py-8">Memuat acara...</p>
        )}

        {!loading && !error && activities.length === 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center text-slate-600">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">event_available</span>
            <p className="font-medium mb-1">Belum ada acara yang didaftarkan</p>
            <p className="text-sm text-slate-500 mb-6">
              Jelajahi daftar acara HIMASI dan daftar untuk berpartisipasi.
            </p>
            <Link
              to="/acara"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90"
            >
              <span className="material-symbols-outlined text-lg">search</span>
              Lihat semua acara
            </Link>
          </div>
        )}

        {!loading && !error && activities.length > 0 && (
          <div className="space-y-4">
            {activities.map((item) => {
              const badge = formatDateBadge(item.startAt);
              const start = new Date(item.startAt);
              const end = new Date(item.endAt);
              const timeStr = `${start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
              const upcoming = isUpcoming(item.startAt);
              const src = imageSrc(item.image);
              return (
                <Link
                  key={item.id}
                  to={`/acara/${item.id}`}
                  className="flex flex-wrap items-center gap-4 md:gap-6 p-4 rounded-xl bg-white border border-slate-200 hover:border-primary/30 hover:shadow-sm transition-all group block"
                >
                  <div className="flex flex-col items-center justify-center min-w-[70px] h-[70px] bg-primary/10 text-primary rounded-xl shrink-0">
                    <span className="text-2xl font-black">{badge.day}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{badge.month}</span>
                  </div>
                  {src && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 hidden sm:block">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      {upcoming && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          Mendatang
                        </span>
                      )}
                      {item.attended && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          Hadir
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
                    <p className="text-slate-400 text-xs mt-0.5">
                      Terdaftar pada {formatDate(item.participatedAt)}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors shrink-0">
                    arrow_forward
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && activities.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <Link
              to="/acara"
              className="text-primary font-medium text-sm hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Daftar acara lainnya
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
