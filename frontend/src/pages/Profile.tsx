import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "/api";

type User = {
  id: string;
  name: string;
  nim: string;
  email: string;
  phoneNumber: string | null;
  angkatan: string | null;
  programStudi: string | null;
  membershipStatus: string | null;
  departemenId: string | null;
  departemen?: { id: string; title: string } | null;
};
type MahasiswaProfile = {
  id: string;
  domisiliCity: string | null;
  minatFokus: string | null;
  skillsJson: string | null;
  portfolioGithub: string | null;
  portfolioLinkedin: string | null;
  portfolioBehance: string | null;
  communicationPreference: string | null;
  notificationHours: string | null;
  consentAt: string | null;
} | null;
type Options = {
  departemens: { id: string; title: string }[];
  minatFokusOptions: string[];
  programStudiOptions: string[];
  membershipStatusOptions: string[];
};

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [, setMahasiswaProfile] = useState<MahasiswaProfile | null>(null);
  const [options, setOptions] = useState<Options | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    angkatan: "",
    program_studi: "SI",
    membership_status: "ACTIVE",
    departemen_id: "",
    domisili_city: "",
    minat_fokus: "",
    skills_json: "",
    portfolio_github: "",
    portfolio_linkedin: "",
    portfolio_behance: "",
    communication_preference: "",
    notification_hours: "",
    consent: false,
  });

  const token = localStorage.getItem("himasi_portal_token");

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API}/profile`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API}/profile/options`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([profileRes, optionsRes]) => {
        if (profileRes.user) {
          const u = profileRes.user;
          setUser(u);
          setForm((f) => ({
            ...f,
            name: u.name ?? "",
            email: u.email ?? "",
            phone_number: u.phoneNumber ?? "",
            angkatan: u.angkatan ?? "",
            program_studi: u.programStudi ?? "SI",
            membership_status: u.membershipStatus ?? "ACTIVE",
            departemen_id: u.departemenId ?? "",
          }));
        }
        if (profileRes.mahasiswaProfile) {
          const p = profileRes.mahasiswaProfile;
          setMahasiswaProfile(p);
          setForm((f) => ({
            ...f,
            domisili_city: p.domisiliCity ?? "",
            minat_fokus: p.minatFokus ?? "",
            skills_json: p.skillsJson ?? "",
            portfolio_github: p.portfolioGithub ?? "",
            portfolio_linkedin: p.portfolioLinkedin ?? "",
            portfolio_behance: p.portfolioBehance ?? "",
            communication_preference: p.communicationPreference ?? "",
            notification_hours: p.notificationHours ?? "",
            consent: !!p.consentAt,
          }));
        }
        if (optionsRes.departemens) setOptions(optionsRes);
      })
      .catch(() => setMessage("Gagal memuat profil"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const res = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name || undefined,
          email: form.email || undefined,
          phone_number: form.phone_number || null,
          angkatan: form.angkatan || null,
          program_studi: form.program_studi || undefined,
          membership_status: form.membership_status || undefined,
          departemen_id: form.departemen_id || null,
          domisili_city: form.domisili_city || null,
          minat_fokus: form.minat_fokus || null,
          skills_json: form.skills_json || null,
          portfolio_github: form.portfolio_github || null,
          portfolio_linkedin: form.portfolio_linkedin || null,
          portfolio_behance: form.portfolio_behance || null,
          communication_preference: form.communication_preference || null,
          notification_hours: form.notification_hours || null,
          consent: form.consent || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan");
      setMessage("Profil berhasil disimpan.");
      if (data.user) setUser(data.user);
      setMahasiswaProfile(data.mahasiswaProfile ?? null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="section-subtitle">Memuat profil...</p>;

  return (
    <>
      <nav className="dashboard-breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span> &gt; Profil Mahasiswa</span>
      </nav>
      <h2 className="section-title">
        <span className="section-title-bar" />
        Profil Mahasiswa
      </h2>
      <p className="section-subtitle">Kelola data diri dan data operasional (Level 1 & 2). Data sensitif tidak dikumpulkan.</p>

      <form onSubmit={handleSubmit} className="profile-form">
        {message && <p className={message.startsWith("Profil") ? "profile-msg success" : "profile-msg error"}>{message}</p>}

        <section className="profile-section">
          <h3 className="profile-section-title">Level 1 — Data Dasar</h3>
          <div className="profile-grid">
            <label className="profile-label">
              Nama lengkap
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className="profile-input" />
            </label>
            <label className="profile-label">
              NIM
              <input type="text" value={user?.nim ?? ""} readOnly disabled className="profile-input" />
            </label>
            <label className="profile-label">
              Email
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required className="profile-input" />
            </label>
            <label className="profile-label">
              Nomor HP
              <input type="tel" value={form.phone_number} onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))} className="profile-input" placeholder="Opsional" />
            </label>
            <label className="profile-label">
              Angkatan
              <input type="text" value={form.angkatan} onChange={(e) => setForm((f) => ({ ...f, angkatan: e.target.value }))} className="profile-input" placeholder="Contoh: 2023" maxLength={4} />
            </label>
            <label className="profile-label">
              Program studi
              <select value={form.program_studi} onChange={(e) => setForm((f) => ({ ...f, program_studi: e.target.value }))} className="profile-input">
                {(options?.programStudiOptions ?? ["SI"]).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="profile-label">
              Status keanggotaan
              <select value={form.membership_status} onChange={(e) => setForm((f) => ({ ...f, membership_status: e.target.value }))} className="profile-input">
                {(options?.membershipStatusOptions ?? ["ACTIVE", "INACTIVE"]).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="profile-label">
              Divisi (jika pengurus)
              <select value={form.departemen_id} onChange={(e) => setForm((f) => ({ ...f, departemen_id: e.target.value }))} className="profile-input">
                <option value="">— Pilih —</option>
                {(options?.departemens ?? []).map((d) => (
                  <option key={d.id} value={d.id}>{d.title}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="profile-section">
          <h3 className="profile-section-title">Level 2 — Minat, Skill & Portfolio</h3>
          <div className="profile-grid">
            <label className="profile-label profile-full">
              Domisili (kota saja)
              <input type="text" value={form.domisili_city} onChange={(e) => setForm((f) => ({ ...f, domisili_city: e.target.value }))} className="profile-input" placeholder="Contoh: Bogor" />
            </label>
            <label className="profile-label profile-full">
              Minat & fokus (pisahkan dengan koma)
              <input type="text" value={form.minat_fokus} onChange={(e) => setForm((f) => ({ ...f, minat_fokus: e.target.value }))} className="profile-input" placeholder="Data, Web, Mobile, UI/UX, Security, Cloud, ..." />
            </label>
            <label className="profile-label profile-full">
              Skill set (JSON atau teks bebas)
              <textarea value={form.skills_json} onChange={(e) => setForm((f) => ({ ...f, skills_json: e.target.value }))} className="profile-input" rows={2} placeholder='Contoh: ["JavaScript", "React"] atau teks' />
            </label>
            <label className="profile-label">
              GitHub
              <input type="url" value={form.portfolio_github} onChange={(e) => setForm((f) => ({ ...f, portfolio_github: e.target.value }))} className="profile-input" placeholder="https://github.com/..." />
            </label>
            <label className="profile-label">
              LinkedIn
              <input type="url" value={form.portfolio_linkedin} onChange={(e) => setForm((f) => ({ ...f, portfolio_linkedin: e.target.value }))} className="profile-input" placeholder="https://linkedin.com/..." />
            </label>
            <label className="profile-label">
              Behance
              <input type="url" value={form.portfolio_behance} onChange={(e) => setForm((f) => ({ ...f, portfolio_behance: e.target.value }))} className="profile-input" placeholder="https://behance.net/..." />
            </label>
            <label className="profile-label">
              Preferensi komunikasi
              <select value={form.communication_preference} onChange={(e) => setForm((f) => ({ ...f, communication_preference: e.target.value }))} className="profile-input">
                <option value="">— Pilih —</option>
                <option value="WA">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </label>
            <label className="profile-label">
              Jam notifikasi (contoh: 09-17)
              <input type="text" value={form.notification_hours} onChange={(e) => setForm((f) => ({ ...f, notification_hours: e.target.value }))} className="profile-input" placeholder="09-17" />
            </label>
          </div>
        </section>

        <section className="profile-section">
          <h3 className="profile-section-title">Consent & Privasi</h3>
          <label className="profile-checkbox">
            <input type="checkbox" checked={form.consent} onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))} />
            Saya setuju dengan kebijakan privasi dan pengumpulan data untuk keperluan portal HIMASI.
          </label>
        </section>

        <div className="profile-actions">
          <button type="submit" disabled={saving} className="profile-btn">{saving ? "Menyimpan..." : "Simpan profil"}</button>
        </div>
      </form>
    </>
  );
}
