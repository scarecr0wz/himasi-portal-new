import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "/api";

type Activity = {
  id: string;
  title: string;
  desc: string | null;
  startAt: string;
  category?: string;
};

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [prokerCount, setProkerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/content/activities`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/content/prokers`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([acts, prokers]: [Activity[], unknown[]]) => {
        setActivities(Array.isArray(acts) ? acts.slice(0, 5) : []);
        setProkerCount(Array.isArray(prokers) ? prokers.filter((p: unknown) => (p as { isActive?: boolean }).isActive !== false).length : 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) => {
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return "";
    }
  };

  const placeholderActivities = [
    { id: "1", title: "Partisipasi HIMASI dalam OSMB 26.1 Hari Kedua: Games dan Solidaritas ORMAWA.", category: "Media & Publikasi", date: "22/2/2026" },
    { id: "2", title: "HIMASI Raih Juara 1 pada UT Esport Conquest (UEC) 2026", category: "Acara", date: "21/2/2026" },
    { id: "3", title: "HIMASI Hadir dan Ramaikan OSMB 26.1 melalui Booth dan Games Interaktif", category: "Media & Publikasi", date: "20/2/2026" },
    { id: "4", title: "MakraSI 2026: Sinergi Solidaritas Keluarga Besar Sistem Informasi", category: "Acara", date: "15/2/2026" },
    { id: "5", title: "BERSI Special Tuton: Offline dan Online Selama Tuton!", category: "Akademik", date: "10/2/2026" },
  ];

  const list = activities.length > 0
    ? activities.map((a) => ({ id: a.id, title: a.title, category: "Kegiatan", date: formatDate(a.startAt) }))
    : placeholderActivities;

  return (
    <div className="min-w-0 w-full">
      <nav className="dashboard-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span> &gt; Dashboard Mahasiswa</span>
      </nav>

      <section className="dashboard-section">
        <h2 className="section-title">
          <span className="section-title-bar" />
          Dashboard Statistik
        </h2>
        <p className="section-subtitle">Ringkasan performa organisasi periode ini</p>
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-card-icon purple">👥</div>
            <div className="min-w-0 flex-1">
              <div className="stat-card-label">Kehadiran Saya</div>
              <div className="stat-card-value">0%</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon green">💰</div>
            <div className="min-w-0 flex-1">
              <div className="stat-card-label">Saldo Kas Saya</div>
              <div className="stat-card-value">Rp 0</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon yellow">💡</div>
            <div className="min-w-0 flex-1">
              <div className="stat-card-label">Aspirasi Baru</div>
              <div className="stat-card-value">0</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon red">📋</div>
            <div className="min-w-0 flex-1">
              <div className="stat-card-label">Proker Aktif</div>
              <div className="stat-card-value">{loading ? "..." : prokerCount}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="min-w-0">
        <div className="section-header">
          <div className="min-w-0">
            <h2 className="section-title">
              <span className="section-title-bar" />
              Aktivitas Terkini
            </h2>
          </div>
          <Link to="/dashboard/activities" className="btn-link py-1 -my-1">Lihat Semua</Link>
        </div>
        <div className="activity-list">
          {list.map((item) => (
            <div key={item.id} className="activity-item">
              <div className="activity-item-bullet" />
              <div>
                <div className="activity-item-title">{item.title}</div>
                <div className="activity-item-meta">
                  {item.category} - {item.date}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
