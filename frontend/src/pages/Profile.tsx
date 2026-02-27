import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const API = "/api";

type User = {
  id: string;
  name: string;
  nim: string;
  email: string;
  phoneNumber: string | null;
  angkatan: string | null;
  fakultas: string | null;
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
  minatFokusOptions?: string[];
  fakultasOptions?: string[];
  programStudiOptions: string[];
  membershipStatusOptions: string[];
};

export default function Profile() {
  const { token, isAdmin, user: authUser, loadMe } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [, setMahasiswaProfile] = useState<MahasiswaProfile | null>(null);
  const [options, setOptions] = useState<Options | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    angkatan: "",
    fakultas: "",
    program_studi: "SI",
    membership_status: "INACTIVE",
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
            fakultas: u.fakultas ?? "",
            program_studi: u.programStudi ?? "SI",
            membership_status: u.membershipStatus ?? "INACTIVE",
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
        if (optionsRes?.departemens) setOptions(optionsRes);
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
          fakultas: form.fakultas || null,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-500">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full">
      <nav aria-label="Breadcrumb" className="flex mb-4">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
          <li className="inline-flex items-center">
            <Link to="/dashboard" className="hover:text-primary transition-colors">
              DASHBOARD
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="material-symbols-outlined text-sm mx-1 text-slate-300">chevron_right</span>
              <span className="text-slate-600">PROFIL MAHASISWA</span>
            </div>
          </li>
        </ol>
      </nav>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight break-words">Profil Mahasiswa</h1>
      <p className="text-slate-500 mt-2 text-sm sm:text-[15px] mb-6 sm:mb-8 break-words">
        Data mengikuti pengelompokan aman → sensitif. Hanya Level 1–3 yang disimpan; sesuai{" "}
        <code className="text-xs bg-slate-100 px-1 rounded">docs/DATA-MAHASISWA.md</code>.
      </p>

      <form onSubmit={handleSubmit} className="profile-form max-w-2xl space-y-8">
        {message && (
          <p className={`px-4 py-2 rounded-lg text-sm ${message.startsWith("Profil") || message.startsWith("Foto") ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
            {message}
          </p>
        )}

        {/* Foto profil / Avatar */}
        <section className="profile-section">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h2 className="text-xl font-bold text-slate-800">Foto Profil</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                {authUser?.avatar ? (
                  <img src={authUser.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-slate-400 text-4xl">person</span>
                )}
              </div>
              <label className="text-slate-500 text-sm">Tampil di navbar &amp; profil</label>
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="profile-input text-sm py-2 file:mr-3 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:font-semibold file:cursor-pointer"
                id="avatar-upload"
                disabled={avatarUploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file || !token) return;
                  setMessage("");
                  setAvatarUploading(true);
                  try {
                    const formData = new FormData();
                    formData.append("avatar", file);
                    const res = await fetch(`${API}/auth/update-avatar`, {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData,
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setMessage(data.message ?? "Gagal mengunggah foto");
                      return;
                    }
                    setMessage(data.message ?? "Foto profil berhasil diperbarui");
                    await loadMe();
                  } catch {
                    setMessage("Gagal mengunggah foto");
                  } finally {
                    setAvatarUploading(false);
                  }
                }}
              />
              <p className="text-xs text-slate-500">JPEG, PNG, GIF atau WebP. Maks. 3MB.</p>
            </div>
          </div>
        </section>

        {/* Level 1 — Wajib (minimal, paling aman) */}
        <section className="profile-section">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h2 className="text-xl font-bold text-slate-800">Level 1 — Wajib</h2>
          </div>
          <p className="text-slate-500 text-sm mb-4">
            Informasi Mahasiswa
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="profile-label">
              <span>Nama lengkap <span className="text-red-500">*</span></span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className="profile-input"
                placeholder="Nama sesuai KTM"
              />
            </label>
            <label className="profile-label">
              NIM
              <input
                type="text"
                value={user?.nim ?? ""}
                readOnly
                disabled
                className="profile-input bg-slate-50"
                title="Unique, untuk login — tidak dapat diubah"
              />
            </label>
            <label className="profile-label sm:col-span-2">
              <span>Email kampus / utama <span className="text-red-500">*</span></span>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                className="profile-input"
                placeholder="email@contoh.ac.id"
              />
            </label>
            <label className="profile-label">
              Nomor HP
              <input
                type="tel"
                value={form.phone_number}
                onChange={(e) => setForm((f) => ({ ...f, phone_number: e.target.value }))}
                className="profile-input"
                placeholder="Opsional, untuk notifikasi"
              />
            </label>
            <label className="profile-label">
              Angkatan / tahun masuk
              <input
                type="text"
                value={form.angkatan}
                onChange={(e) => setForm((f) => ({ ...f, angkatan: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                className="profile-input"
                placeholder="Contoh: 2023"
                maxLength={4}
              />
            </label>
            <label className="profile-label">
              Fakultas
              <select
                value={form.fakultas}
                onChange={(e) => setForm((f) => ({ ...f, fakultas: e.target.value }))}
                className="profile-input"
              >
                <option value="">— Pilih fakultas —</option>
                {(options?.fakultasOptions ?? ["FST", "FE", "FH", "FKIP", "FISIP", "Lainnya"]).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="profile-label">
              Program studi (prodi)
              <select
                value={form.program_studi}
                onChange={(e) => setForm((f) => ({ ...f, program_studi: e.target.value }))}
                className="profile-input"
              >
                {(options?.programStudiOptions ?? ["SI", "IK", "Lainnya"]).map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="profile-label">
              Status keanggotaan
              {isAdmin ? (
                <select
                  value={form.membership_status}
                  onChange={(e) => setForm((f) => ({ ...f, membership_status: e.target.value }))}
                  className="profile-input"
                >
                  {(options?.membershipStatusOptions ?? ["ACTIVE", "INACTIVE"]).map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type="text"
                    value={form.membership_status}
                    readOnly
                    disabled
                    className="profile-input bg-slate-50 text-slate-600"
                  />
                  <p className="text-xs text-slate-500 mt-0.5">Hanya dapat diubah oleh admin.</p>
                </>
              )}
            </label>
            <label className="profile-label">
              Divisi
              {isAdmin ? (
                <select
                  value={form.departemen_id}
                  onChange={(e) => setForm((f) => ({ ...f, departemen_id: e.target.value }))}
                  className="profile-input"
                >
                  <option value="">— Kalau pengurus —</option>
                  {(options?.departemens ?? []).map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type="text"
                    value={options?.departemens?.find((d) => d.id === form.departemen_id)?.title ?? (form.departemen_id || "—")}
                    readOnly
                    disabled
                    className="profile-input bg-slate-50 text-slate-600"
                  />
                  <p className="text-xs text-slate-500 mt-0.5">Hanya dapat diubah oleh admin.</p>
                </>
              )}
            </label>
          </div>
        </section>

        {/* Level 2 — Berguna untuk operasional & komunitas */}
        <section className="profile-section border-t border-slate-200 pt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h2 className="text-xl font-bold text-slate-800">Level 2 — Lanjutan</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="profile-label sm:col-span-2">
              Domisili (kota saja)
              <input
                type="text"
                value={form.domisili_city}
                onChange={(e) => setForm((f) => ({ ...f, domisili_city: e.target.value }))}
                className="profile-input"
                placeholder="Bukan alamat lengkap — contoh: Bogor"
              />
            </label>
            <label className="profile-label sm:col-span-2">
              Minat & fokus
              <input
                type="text"
                value={form.minat_fokus}
                onChange={(e) => setForm((f) => ({ ...f, minat_fokus: e.target.value }))}
                className="profile-input"
                placeholder="Data, Web, Mobile, UI/UX, Security, Cloud, dll"
              />
            </label>
            <label className="profile-label sm:col-span-2">
              Skill set + level
              <textarea
                value={form.skills_json}
                onChange={(e) => setForm((f) => ({ ...f, skills_json: e.target.value }))}
                className="profile-input"
                rows={3}
                placeholder='Self-assessment (JSON), contoh: ["JavaScript", "React"] atau teks bebas'
              />
            </label>
            <label className="profile-label">
              Link portfolio — GitHub
              <input
                type="url"
                value={form.portfolio_github}
                onChange={(e) => setForm((f) => ({ ...f, portfolio_github: e.target.value }))}
                className="profile-input"
                placeholder="https://github.com/..."
              />
            </label>
            <label className="profile-label">
              Link portfolio — LinkedIn
              <input
                type="url"
                value={form.portfolio_linkedin}
                onChange={(e) => setForm((f) => ({ ...f, portfolio_linkedin: e.target.value }))}
                className="profile-input"
                placeholder="https://linkedin.com/..."
              />
            </label>
            <label className="profile-label">
              Link portfolio — Behance
              <input
                type="url"
                value={form.portfolio_behance}
                onChange={(e) => setForm((f) => ({ ...f, portfolio_behance: e.target.value }))}
                className="profile-input"
                placeholder="https://behance.net/..."
              />
            </label>
            <label className="profile-label">
              Preferensi komunikasi
              <select
                value={form.communication_preference}
                onChange={(e) => setForm((f) => ({ ...f, communication_preference: e.target.value }))}
                className="profile-input"
              >
                <option value="">— Pilih —</option>
                <option value="WA">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </label>
            <label className="profile-label">
              Jam notifikasi
              <input
                type="text"
                value={form.notification_hours}
                onChange={(e) => setForm((f) => ({ ...f, notification_hours: e.target.value }))}
                className="profile-input"
                placeholder="Mis. 09-17"
              />
            </label>
          </div>
        </section>

        {/* Level 3 — Governance */}
        <section className="profile-section border-t border-slate-200 pt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            <h2 className="text-xl font-bold text-slate-800">Level 3 — Konsen pengguna</h2>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
              className="rounded border-slate-300 mt-0.5"
            />
            <span className="text-sm text-slate-600">
              Saya setuju dengan kebijakan privasi dan pengumpulan data untuk keperluan portal HIMASI.
            </span>
          </label>
        </section>

        <div className="profile-actions pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {saving ? "Menyimpan..." : "Simpan profil"}
          </button>
        </div>
      </form>
    </div>
  );
}
