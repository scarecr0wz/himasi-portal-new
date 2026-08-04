import { useEffect, useMemo, useState } from "react";
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
      day: dt.getDate().toString().padStart(2, "0"),
      month: dt.toLocaleDateString("id-ID", { month: "short" }).toUpperCase(),
    };
  } catch {
    return { day: "--", month: "---" };
  }
}

function isUpcoming(startAt: string): boolean {
  return new Date(startAt) >= new Date();
}

function imageUrl(image: string): string {
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `/${image}`;
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

  const sortedActivities = useMemo(() => {
    const now = Date.now();
    return [...activities].sort((a, b) => {
      const aTime = new Date(a.startAt).getTime();
      const bTime = new Date(b.startAt).getTime();
      const aUpcoming = aTime >= now;
      const bUpcoming = bTime >= now;
      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      return aUpcoming ? aTime - bTime : bTime - aTime;
    });
  }, [activities]);

  const upcomingCount = sortedActivities.filter((item) => isUpcoming(item.startAt)).length;

  return (
    <div className="landing-page font-display text-slate-900 min-h-screen flex flex-col">
      <PublicNavbar />

      <main className="event-page flex-1 w-full">
        <section className="event-page-intro">
          <div className="event-page-container">
            <Link to="/" className="event-back-link">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              Beranda
            </Link>

            <div className="event-page-heading">
              <div>
                <p className="event-page-kicker">Kalender HIMASI</p>
                <h1>Ruang untuk bertemu,<br className="hidden sm:block" /> belajar, dan bertumbuh.</h1>
              </div>
              <div className="event-page-summary">
                <span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>
                <div>
                  <strong>{loading ? "—" : upcomingCount}</strong>
                  <p>acara mendatang yang bisa kamu ikuti.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="event-page-container event-list-section" aria-labelledby="event-list-title">
          <div className="event-list-heading">
            <div>
              <p className="event-page-kicker">Agenda terkini</p>
              <h2 id="event-list-title">Semua Acara</h2>
            </div>
            <p>Kegiatan akademik, pengembangan diri, dan momen seru bersama keluarga Sistem Informasi.</p>
          </div>

          {loading && (
            <div className="event-loading" role="status">
              <span className="material-symbols-outlined">progress_activity</span>
              Memuat acara...
            </div>
          )}

          {!loading && sortedActivities.length === 0 && (
            <div className="event-empty-state">
              <span className="material-symbols-outlined">event_busy</span>
              <h3>Belum ada agenda baru.</h3>
              <p>Acara berikutnya sedang kami siapkan. Mampir lagi dalam waktu dekat, ya.</p>
            </div>
          )}

          {!loading && sortedActivities.length > 0 && (
            <div className="event-card-grid">
              {sortedActivities.map((item, index) => {
                const badge = formatDateBadge(item.startAt);
                const start = new Date(item.startAt);
                const end = new Date(item.endAt);
                const timeStr = `${start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}–${end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
                const upcoming = isUpcoming(item.startAt);
                const featured = index === 0;

                return (
                  <Link
                    key={item.id}
                    to={`/acara/${item.id}`}
                    className={`event-list-card group${featured ? " event-list-card-featured" : ""}`}
                    style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
                  >
                    <div className="event-card-media">
                      {item.image ? (
                        <img src={imageUrl(item.image)} alt="" />
                      ) : (
                        <div className="event-card-media-placeholder" aria-hidden="true">
                          <span className="event-card-placeholder-mark">H</span>
                          <span className="material-symbols-outlined">celebration</span>
                        </div>
                      )}
                      <div className="event-card-date">
                        <strong>{badge.day}</strong>
                        <span>{badge.month}</span>
                      </div>
                      <span className={`event-card-status${upcoming ? " is-upcoming" : ""}`}>
                        {upcoming ? "Mendatang" : "Selesai"}
                      </span>
                    </div>

                    <div className="event-card-body">
                      <p className="event-card-department">
                        {item.departemen?.title || "HIMASI"}
                      </p>
                      <h3>{item.title}</h3>
                      {item.desc && <p className="event-card-description">{item.desc}</p>}
                      <div className="event-card-footer">
                        <span>
                          <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                          {formatDate(item.startAt)} · {timeStr}
                        </span>
                        <span className="event-card-arrow material-symbols-outlined" aria-hidden="true">north_east</span>
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
