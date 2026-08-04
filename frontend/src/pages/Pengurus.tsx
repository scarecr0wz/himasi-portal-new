import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";

const API = "/api";
const DEFAULT_PERIODE = "2025/2026";
const ICON_FALLBACK = "folder";

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

type DepartemenItem = {
  id: string;
  title: string;
  icon: string;
  desc: string;
};

function photoUrl(photo: string | null): string | null {
  if (!photo) return null;
  if (photo.startsWith("http") || photo.startsWith("/")) return photo;
  return `${API}/uploads/${photo}`;
}

export default function Pengurus() {
  const periode = DEFAULT_PERIODE;
  const [pengurusList, setPengurusList] = useState<PengurusItem[]>([]);
  const [departemen, setDepartemen] = useState<DepartemenItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/content/pengurus?periode=${encodeURIComponent(periode)}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/content/departments`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([peopleData, departmentData]) => {
        setPengurusList(Array.isArray(peopleData) ? peopleData : []);
        setDepartemen(Array.isArray(departmentData) ? departmentData : []);
      })
      .catch(() => {
        setPengurusList([]);
        setDepartemen([]);
      })
      .finally(() => setLoading(false));
  }, [periode]);

  const bph = pengurusList.filter((person) => !person.departemenId);
  const byDept = new Map<string, PengurusItem[]>();

  for (const person of pengurusList.filter((item) => item.departemenId && item.departemen)) {
    const id = person.departemenId!;
    if (!byDept.has(id)) byDept.set(id, []);
    byDept.get(id)!.push(person);
  }

  return (
    <div className="landing-page font-display text-slate-900 min-h-screen flex flex-col overflow-x-hidden">
      <PublicNavbar />
      <SEO
        title="Pengurus"
        description={`Struktur kepengurusan HIMASI Universitas Terbuka Bogor periode ${periode}.`}
      />

      <main className="people-page flex-1 w-full">
        <section className="event-page-intro people-page-intro">
          <div className="event-page-container">
            <Link to="/" className="event-back-link">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              Beranda
            </Link>

            <div className="event-page-heading people-page-heading">
              <div>
                <p className="event-page-kicker">Pengurus {periode}</p>
                <h1>Orang-orang di balik langkah HIMASI.</h1>
              </div>
              <div className="people-summary" aria-label="Ringkasan kepengurusan">
                <div>
                  <strong>{loading ? "—" : pengurusList.length}</strong>
                  <span>Pengurus</span>
                </div>
                <div>
                  <strong>{loading ? "—" : departemen.length}</strong>
                  <span>Departemen</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="event-page-container people-content">
          {loading ? (
            <div className="event-loading" role="status">
              <span className="material-symbols-outlined">progress_activity</span>
              Memuat data pengurus...
            </div>
          ) : (
            <>
              <section className="people-section" aria-labelledby="bph-heading">
                <div className="people-section-heading">
                  <div>
                    <p className="event-page-kicker">Struktural</p>
                    <h2 id="bph-heading">Badan Pengurus Harian</h2>
                  </div>
                  <p>Pimpinan inti yang menjaga arah dan koordinasi organisasi.</p>
                </div>

                {bph.length === 0 ? (
                  <div className="event-empty-state people-empty-state">
                    <span className="material-symbols-outlined">group_off</span>
                    <h3>Data BPH belum tersedia.</h3>
                    <p>Struktur periode ini sedang diperbarui.</p>
                  </div>
                ) : (
                  <div className="people-roster-grid">
                    {bph.map((person, index) => {
                      const photo = photoUrl(person.photo);
                      return (
                        <article
                          key={person.id}
                          className="people-roster-card"
                          style={{ animationDelay: `${Math.min(index, 8) * 65}ms` }}
                        >
                          <div className="people-avatar">
                            {photo ? (
                              <img src={photo} alt="" />
                            ) : (
                              <span className="material-symbols-outlined" aria-hidden="true">person</span>
                            )}
                          </div>
                          <div>
                            <p>{person.role}</p>
                            <h3>{person.name}</h3>
                          </div>
                          <span className="people-card-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="people-section department-directory-section" aria-labelledby="department-heading">
                <div className="people-section-heading">
                  <div>
                    <p className="event-page-kicker">Ruang Kolaborasi</p>
                    <h2 id="department-heading">Departemen</h2>
                  </div>
                  <p>Kenali tim yang menerjemahkan arah organisasi menjadi program nyata.</p>
                </div>

                {departemen.length === 0 ? (
                  <div className="event-empty-state people-empty-state">
                    <span className="material-symbols-outlined">folder_off</span>
                    <h3>Departemen belum tersedia.</h3>
                  </div>
                ) : (
                  <div className="people-department-list">
                    {departemen.map((dept, index) => {
                      const departmentPeople = byDept.get(dept.id) ?? [];
                      return (
                        <Link
                          key={dept.id}
                          to={`/pengurus/department/${dept.id}`}
                          className="people-department-row"
                        >
                          <span className="people-department-index">{String(index + 1).padStart(2, "0")}</span>
                          <span className="people-department-icon material-symbols-outlined" aria-hidden="true">
                            {dept.icon?.match(/^[a-z0-9_]+$/) ? dept.icon : ICON_FALLBACK}
                          </span>
                          <div className="people-department-copy">
                            <h3>{dept.title}</h3>
                            <p>
                              {departmentPeople.length > 0
                                ? departmentPeople.map((person) => person.name).join(" · ")
                                : dept.desc || "Lihat profil dan program departemen."}
                            </p>
                          </div>
                          <span className="people-department-arrow material-symbols-outlined" aria-hidden="true">north_east</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="people-cta">
                <div>
                  <p className="event-page-kicker">Tumbuh Bersama</p>
                  <h2>Giliranmu menjadi bagian dari cerita berikutnya.</h2>
                </div>
                <Link to="/register">
                  Daftar Sekarang
                  <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
                </Link>
              </section>
            </>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
