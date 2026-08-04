import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";

const API = "/api";
const ICON_FALLBACK = "folder";

type DepartmentItem = {
  id: string;
  title: string;
  icon?: string;
  desc?: string;
};

type ProgramItem = {
  id: string;
  departemenId: string;
};

export default function DepartemenList() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/content/departments`).then((response) => (response.ok ? response.json() : [])),
      fetch(`${API}/content/prokers`).then((response) => (response.ok ? response.json() : [])),
    ])
      .then(([departmentData, programData]) => {
        setDepartments(Array.isArray(departmentData) ? departmentData : []);
        setPrograms(Array.isArray(programData) ? programData : []);
      })
      .catch(() => {
        setDepartments([]);
        setPrograms([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="landing-page font-display text-slate-900 min-h-screen flex flex-col overflow-x-hidden">
      <PublicNavbar />
      <SEO
        title="Departemen"
        description="Kenali departemen HIMASI Universitas Terbuka Bogor dan ruang kontribusinya."
      />

      <main className="department-page flex-1 w-full">
        <section className="event-page-intro department-page-intro">
          <div className="event-page-container">
            <Link to="/" className="event-back-link">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              Beranda
            </Link>

            <div className="event-page-heading department-page-heading">
              <div>
                <p className="event-page-kicker">Departemen HIMASI</p>
                <h1>Banyak ruang, satu tujuan bersama.</h1>
              </div>
              <div className="people-summary department-summary" aria-label="Ringkasan departemen">
                <div>
                  <strong>{loading ? "—" : departments.length}</strong>
                  <span>Departemen</span>
                </div>
                <div>
                  <strong>{loading ? "—" : programs.length}</strong>
                  <span>Program</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="event-page-container department-content" aria-labelledby="department-list-title">
          <div className="people-section-heading">
            <div>
              <p className="event-page-kicker">Temukan Peranmu</p>
              <h2 id="department-list-title">Kenali Setiap Tim</h2>
            </div>
            <p>Setiap departemen punya fokus berbeda, tetapi bergerak dalam arah yang sama untuk mahasiswa Sistem Informasi.</p>
          </div>

          {loading ? (
            <div className="event-loading" role="status">
              <span className="material-symbols-outlined">progress_activity</span>
              Memuat departemen...
            </div>
          ) : departments.length === 0 ? (
            <div className="event-empty-state department-empty-state">
              <span className="material-symbols-outlined">folder_off</span>
              <h3>Departemen belum tersedia.</h3>
              <p>Struktur departemen sedang diperbarui.</p>
            </div>
          ) : (
            <div className="department-card-list">
              {departments.map((department, index) => {
                const programCount = programs.filter((program) => program.departemenId === department.id).length;
                return (
                  <Link
                    key={department.id}
                    to={`/pengurus/department/${department.id}`}
                    className="department-directory-card"
                    style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
                  >
                    <span className="department-card-index">{String(index + 1).padStart(2, "0")}</span>
                    <span className="department-card-icon material-symbols-outlined" aria-hidden="true">
                      {department.icon?.match(/^[a-z0-9_]+$/) ? department.icon : ICON_FALLBACK}
                    </span>
                    <div className="department-card-copy">
                      <h3>{department.title}</h3>
                      <p>{department.desc || "Ruang kolaborasi dan pengembangan mahasiswa HIMASI."}</p>
                    </div>
                    <div className="department-card-meta">
                      <span>{programCount}</span>
                      <small>Program kerja</small>
                    </div>
                    <span className="department-card-arrow material-symbols-outlined" aria-hidden="true">north_east</span>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="department-program-note">
            <span className="material-symbols-outlined" aria-hidden="true">lightbulb</span>
            <p>Ingin melihat seluruh gagasan yang sedang dijalankan?</p>
            <Link to="/program-kerja">Jelajahi Program Kerja</Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
