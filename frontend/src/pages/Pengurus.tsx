import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";

const API = "/api";

const DEFAULT_PERIODE = "2025/2026";

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

const ICON_FALLBACK = "folder";

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
    setLoading(true);
    Promise.all([
      fetch(`${API}/content/pengurus?periode=${encodeURIComponent(periode)}`).then((r) => (r.ok ? r.json() : [])),
      fetch(`${API}/content/departments`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([p, d]) => {
        setPengurusList(Array.isArray(p) ? p : []);
        setDepartemen(Array.isArray(d) ? d : []);
      })
      .catch(() => {
        setPengurusList([]);
        setDepartemen([]);
      })
      .finally(() => setLoading(false));
  }, [periode]);

  const bph = pengurusList.filter((p) => !p.departemenId);
  const bphRow1 = bph.slice(0, 3);
  const bphRow2 = bph.slice(3, 5);
  const byDept = new Map<string, PengurusItem[]>();
  for (const p of pengurusList.filter((p) => p.departemenId && p.departemen)) {
    const id = p.departemenId!;
    if (!byDept.has(id)) byDept.set(id, []);
    byDept.get(id)!.push(p);
  }

  return (
    <div className="font-display bg-background-light text-slate-900 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300">
      <PublicNavbar />

      {/* Hero / Banner */}
      <section className="bg-primary text-white">
        <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                Periode {periode}
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-2">
                Struktur Kepengurusan
              </h1>
              <p className="text-white/90 text-base md:text-lg max-w-xl">
                Pengurus Himpunan Mahasiswa Sistem Informasi Universitas Terbuka Bogor.
              </p>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <span className="material-symbols-outlined text-4xl">groups</span>
              <span className="text-sm font-medium">BPH & Departemen</span>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-10 md:py-14">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-900 font-semibold">Pengurus</span>
        </nav>

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-slate-500 text-sm">Memuat data pengurus...</p>
          </div>
        ) : (
          <>
            {/* Badan Pengurus Harian */}
            <section className="mb-14 md:mb-16" aria-labelledby="bph-heading">
              <h2 id="bph-heading" className="text-slate-900 text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">shield_person</span>
                Badan Pengurus Harian
              </h2>
              <p className="text-slate-500 text-sm mb-8">Pimpinan organisasi yang menjalankan roda kepengurusan HIMASI.</p>

              {bph.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 text-sm">
                  Data BPH periode ini belum diisi. Kelola di Admin → Pengurus.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
                    {bphRow1.map((person) => (
                      <article
                        key={person.id}
                        className="bg-white rounded-2xl shadow-md p-6 md:p-8 flex flex-col items-center gap-4 border border-slate-100 hover:shadow-lg hover:border-primary/20 transition-all relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden ring-2 md:ring-4 ring-primary/20 shrink-0">
                          {photoUrl(person.photo) ? (
                            <img src={photoUrl(person.photo)!} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-5xl md:text-7xl text-primary/60">person</span>
                          )}
                        </div>
                        <div className="text-center min-w-0">
                          <h3 className="text-slate-900 font-bold text-base md:text-lg break-words">{person.name}</h3>
                          <span className="inline-block mt-2 px-4 py-1.5 bg-primary text-white text-xs font-bold uppercase rounded-full tracking-wide">
                            {person.role}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                  {bphRow2.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
                      {bphRow2.map((person) => (
                        <article
                          key={person.id}
                          className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center gap-4 hover:shadow-lg transition-shadow border border-slate-100"
                        >
                          <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                            {photoUrl(person.photo) ? (
                              <img src={photoUrl(person.photo)!} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-5xl md:text-6xl text-primary/60">person</span>
                            )}
                          </div>
                          <div className="text-center min-w-0">
                            <h3 className="text-slate-900 font-bold text-base md:text-lg break-words">{person.name}</h3>
                            <span className="text-primary text-xs font-semibold uppercase tracking-wide">{person.role}</span>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Departemen */}
            <section className="mb-14 md:mb-16" aria-labelledby="dept-heading">
              <h2 id="dept-heading" className="text-slate-900 text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">groups</span>
                Departemen
              </h2>
              <p className="text-slate-500 text-sm mb-8">Tim departemen yang mengoordinasikan dan menjalankan program kerja HIMASI.</p>

              {departemen.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 text-sm">
                  Daftar departemen belum tersedia.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {departemen.map((dept) => {
                    const kepalaList = byDept.get(dept.id) ?? [];
                    return (
                      <article
                        key={dept.id}
                        className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-slate-100 flex flex-col"
                      >
                        <div className="p-6 md:p-8 flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-2xl text-primary">
                                {dept.icon?.match(/^[a-z0-9_]+$/) ? dept.icon : ICON_FALLBACK}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-slate-900 font-bold text-lg">{dept.title}</h3>
                              {dept.desc ? (
                                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{dept.desc}</p>
                              ) : null}
                            </div>
                          </div>
                          {kepalaList.length > 0 && (
                            <p className="text-slate-600 text-sm mt-1">
                              <span className="font-semibold text-slate-700">Kepala Departemen: </span>
                              {kepalaList.map((k) => k.name).join(", ")}
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* CTA */}
        <section className="rounded-2xl bg-primary/5 border border-primary/10 p-8 md:p-12 text-center">
          <h2 className="text-slate-900 text-xl md:text-2xl font-bold mb-3">Tertarik bergabung dengan HIMASI?</h2>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto mb-6">
            Daftarkan dirimu dan jadilah bagian dari keluarga besar Himpunan Mahasiswa Sistem Informasi UT Bogor.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-xl h-12 px-8 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            Daftar Sekarang
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
