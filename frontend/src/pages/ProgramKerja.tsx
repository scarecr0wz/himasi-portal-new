import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";

const API = "/api";

type DepartmentItem = {
  id: string;
  title: string;
  icon?: string;
};

type ProgramItem = {
  id: string;
  departemenId: string;
  photo: string | null;
  title: string;
  desc: string;
  departemen?: { id: string; title: string } | null;
};

function photoUrl(photo: string | null): string | null {
  if (!photo) return null;
  if (photo.startsWith("http") || photo.startsWith("/")) return photo;
  return `${API}/uploads/${photo}`;
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
    .replace(/[*_~`#>]/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

export default function ProgramKerja() {
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/content/prokers`).then((response) => (response.ok ? response.json() : [])),
      fetch(`${API}/content/departments`).then((response) => (response.ok ? response.json() : [])),
    ])
      .then(([programData, departmentData]) => {
        setPrograms(Array.isArray(programData) ? programData : []);
        setDepartments(Array.isArray(departmentData) ? departmentData : []);
      })
      .catch(() => {
        setPrograms([]);
        setDepartments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredPrograms = useMemo(
    () => selectedDepartment
      ? programs.filter((program) => program.departemenId === selectedDepartment)
      : programs,
    [programs, selectedDepartment],
  );

  const activeDepartmentCount = new Set(programs.map((program) => program.departemenId).filter(Boolean)).size;

  return (
    <div className="landing-page font-display text-slate-900 min-h-screen flex flex-col overflow-x-hidden">
      <PublicNavbar />
      <SEO
        title="Program Kerja"
        description="Jelajahi program kerja HIMA SI Universitas Terbuka Bogor dari setiap departemen."
      />

      <main className="program-page flex-1 w-full">
        <section className="event-page-intro program-page-intro">
          <div className="event-page-container">
            <Link to="/" className="event-back-link">
              <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span>
              Beranda
            </Link>

            <div className="event-page-heading program-page-heading">
              <div>
                <p className="event-page-kicker">Program Kerja HIMA SI</p>
                <h1>Ide yang bergerak menjadi dampak.</h1>
              </div>
            </div>
          </div>
        </section>

        <section className="event-page-container program-content" aria-labelledby="program-list-title">
          <div className="people-section-heading program-section-heading">
            <div>
              <p className="event-page-kicker">Dari Rencana ke Aksi</p>
              <h2 id="program-list-title">Jelajahi Program</h2>
            </div>
            <p>Setiap program lahir dari kebutuhan mahasiswa dan dikerjakan bersama oleh departemen terkait.</p>
          </div>

          {!loading && departments.length > 0 && (
            <div className="program-filter" role="group" aria-label="Filter berdasarkan departemen">
              <button
                type="button"
                className={selectedDepartment === null ? "is-active" : ""}
                onClick={() => setSelectedDepartment(null)}
              >
                Semua
                <span>{programs.length}</span>
              </button>
              {departments.map((department) => {
                const count = programs.filter((program) => program.departemenId === department.id).length;
                return (
                  <button
                    key={department.id}
                    type="button"
                    className={selectedDepartment === department.id ? "is-active" : ""}
                    onClick={() => setSelectedDepartment(department.id)}
                  >
                    {department.title}
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
          )}

          {loading ? (
            <div className="event-loading" role="status">
              <span className="material-symbols-outlined">progress_activity</span>
              Memuat program kerja...
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="event-empty-state program-empty-state">
              <span className="material-symbols-outlined">inventory_2</span>
              <h3>Belum ada program di departemen ini.</h3>
              <p>Pilih departemen lain untuk menjelajahi program kerja HIMA SI.</p>
              {selectedDepartment && (
                <button type="button" className="news-clear-search" onClick={() => setSelectedDepartment(null)}>
                  Lihat semua program
                </button>
              )}
            </div>
          ) : (
            <div className="program-card-grid">
              {filteredPrograms.map((program, index) => {
                const image = photoUrl(program.photo);
                return (
                  <article
                    key={program.id}
                    className="program-card"
                    style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
                  >
                    <div className="program-card-media">
                      {image ? (
                        <img src={image} alt="" />
                      ) : (
                        <div className="program-card-placeholder" aria-hidden="true">
                          <span className="material-symbols-outlined">lightbulb</span>
                          <strong>HIMA SI</strong>
                        </div>
                      )}
                      <span className="program-card-number">{String(index + 1).padStart(2, "0")}</span>
                    </div>

                    <div className="program-card-body">
                      <p className="program-card-department">{program.departemen?.title || "HIMA SI"}</p>
                      <h3>{program.title}</h3>
                      <p className="program-card-description">
                        {program.desc ? stripMarkdown(program.desc) : "Program kolaboratif untuk mahasiswa Sistem Informasi."}
                      </p>
                      {program.departemenId && (
                        <Link to={`/pengurus/department/${program.departemenId}`} className="program-card-link">
                          Lihat departemen
                          <span className="material-symbols-outlined" aria-hidden="true">north_east</span>
                        </Link>
                      )}
                    </div>
                  </article>
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
