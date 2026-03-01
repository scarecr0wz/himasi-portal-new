import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";

const API = "/api";
const MIN_ALASAN = 50;

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [angkatan, setAngkatan] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [alasan, setAlasan] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step < totalSteps) {
      setError(""); // Clear error when moving to next step
      // Basic validation for current step before moving on
      if (step === 1) {
        if (!name.trim() || !nim.trim() || !angkatan.trim()) {
          setError("Semua bidang di langkah ini wajib diisi.");
          return;
        }
      } else if (step === 2) {
        if (!email.trim() || !phone.trim() || !password || !passwordConfirm) {
          setError("Semua bidang di langkah ini wajib diisi.");
          return;
        }
        if (password !== passwordConfirm) {
          setError("Konfirmasi password tidak sama.");
          return;
        }
        if (password.length < 6) {
          setError("Password minimal 6 karakter.");
          return;
        }
      }
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setError("");
    if (password !== passwordConfirm) {
      setError("Konfirmasi password tidak sama.");
      return;
    }
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    const alasanTrim = alasan.trim();
    if (alasanTrim.length < MIN_ALASAN) {
      setError(`Alasan bergabung minimal ${MIN_ALASAN} karakter.`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          nim: nim.trim(),
          angkatan: angkatan.trim(),
          phone_number: phone.trim(),
          email: email.trim().toLowerCase(),
          password,
          alasan: alasanTrim,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || "Gagal mendaftar. Coba lagi.");
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate("/", { replace: true }), 5000);
    } catch {
      setError("Gagal mendaftar. Periksa koneksi dan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (success) {
    return (
      <div className="font-display bg-slate-50 text-slate-900 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300">
        <PublicNavbar />
        <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 py-12 md:py-20 flex items-center justify-center relative">
          {/* Enhanced Background Decorations */}
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

          <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white p-10 md:p-16 max-w-xl w-full text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary via-blue-500 to-primary bg-[length:200%_auto] animate-gradient-x"></div>

            <div className="relative mb-10">
              <div className="w-28 h-28 bg-green-50 text-green-500 rounded-[2.5rem] flex items-center justify-center mx-auto transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-2xl shadow-green-100/50 border border-green-100/50">
                <span className="material-symbols-outlined text-6xl">verified</span>
              </div>
              {/* Decorative rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 border-2 border-green-100 rounded-[3rem] animate-ping opacity-20 -z-10"></div>
            </div>

            <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
              Pendaftaran Berhasil!
            </h1>

            <div className="space-y-6 mb-12">
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Selamat! Langkah pertama Anda untuk bergabung dengan <span className="text-primary font-bold">Keluarga Besar HIMASI</span> telah resmi dimulai.
              </p>

              <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-100">
                <h3 className="text-slate-900 font-bold mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">info</span>
                  Apa selanjutnya?
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Tim admin kami akan memverifikasi data Anda dalam waktu <span className="text-slate-900 font-bold">1x24 jam</span>. Kami akan mengirimkan notifikasi resmi melalui WhatsApp atau Email segera setelah akun Anda aktif.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-[2rem] py-5 bg-slate-900 text-white font-black text-xl shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-1 active:scale-95 group"
              >
                Masuk ke Portal
                <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">login</span>
              </Link>
              <p className="text-slate-400 text-sm font-medium">
                Halaman ini akan otomatis dialihkan sebentar lagi...
              </p>
            </div>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="font-display bg-slate-50 text-slate-900 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300">
      <PublicNavbar />

      <main className="flex-1 flex flex-col items-center py-16 px-6 relative">
        {/* Background Blobs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="w-full max-w-2xl relative">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
              Ayo Mulai Perjalananmu.
            </h1>
            <p className="text-slate-500 text-lg">
              Lengkapi beberapa langkah sederhana untuk menjadi bagian dari Himpunan Mahasiswa Sistem Informasi Universitas Terbuka Bogor.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-12 relative px-4">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-500 ${step >= s ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white text-slate-300 border-2 border-slate-100"}`}>
                    {step > s ? <span className="material-symbols-outlined">check</span> : s}
                  </div>
                  <span className={`text-[11px] md:text-xs font-bold uppercase tracking-tight ${step >= s ? "text-primary" : "text-slate-400"}`}>
                    {s === 1 ? "Identitas" : s === 2 ? "Kontak" : "Motivasi"}
                  </span>
                </div>
              ))}
            </div>
            {/* Progress Line */}
            <div className="absolute top-6 left-10 right-10 h-1 bg-slate-100 -z-0 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="relative bg-white/40 backdrop-blur-sm p-4 md:p-6 rounded-[2.5rem] border border-white/50 shadow-sm">
            {error && (
              <div className="flex items-center gap-3 rounded-2xl px-6 py-4 text-sm bg-red-50 text-red-800 border border-red-100 mb-8 animate-shake">
                <span className="material-symbols-outlined">error</span>
                <p className="font-semibold">{error}</p>
              </div>
            )}

            <div className="space-y-8 min-h-[400px]">
              {/* Step 1: Identity */}
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Data Mahasiswa</h2>
                    <p className="text-slate-500">Mohon isi data diri sesuai dengan identitas resmi kampus Anda.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="group">
                      <label className="text-sm font-bold text-slate-700 mb-2 block group-focus-within:text-primary transition-colors">Nama Lengkap Mahasiswa</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama sesuai KTM"
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-lg font-medium shadow-sm hover:border-slate-200"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="text-sm font-bold text-slate-700 mb-2 block group-focus-within:text-primary transition-colors">NIM</label>
                        <input
                          type="text"
                          required
                          inputMode="numeric"
                          value={nim}
                          onChange={(e) => setNim(e.target.value.replace(/\D/g, ''))}
                          placeholder="Ex: 05355xxx"
                          className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-lg font-medium shadow-sm hover:border-slate-200"
                        />
                      </div>
                      <div className="group">
                        <label className="text-sm font-bold text-slate-700 mb-2 block group-focus-within:text-primary transition-colors">Angkatan</label>
                        <input
                          type="text"
                          required
                          value={angkatan}
                          onChange={(e) => setAngkatan(e.target.value)}
                          placeholder="Ex: 2024.1"
                          className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-lg font-medium shadow-sm hover:border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Account & Privacy */}
              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Kontak & Keamanan</h2>
                    <p className="text-slate-500">Kami akan menghubungi Anda melalui kontak di bawah ini.</p>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="text-sm font-bold text-slate-700 mb-2 block">Email Aktif</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="yourmail@domain.com"
                          className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-lg font-medium shadow-sm hover:border-slate-200"
                        />
                      </div>
                      <div className="group">
                        <label className="text-sm font-bold text-slate-700 mb-2 block">WhatsApp</label>
                        <input
                          type="tel"
                          required
                          inputMode="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="08xxxxxxxx"
                          className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-lg font-medium shadow-sm hover:border-slate-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="group">
                        <label className="text-sm font-bold text-slate-700 mb-2 block">Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="********"
                          className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-lg font-medium shadow-sm hover:border-slate-200"
                        />
                      </div>
                      <div className="group">
                        <label className="text-sm font-bold text-slate-700 mb-2 block">Ulangi Password</label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          placeholder="********"
                          className="w-full bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-900 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-lg font-medium shadow-sm hover:border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Motivation */}
              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Motivasi Bergabung</h2>
                    <p className="text-slate-500 leading-relaxed text-sm md:text-base">Ceritakan sedikit tentang alasan Anda tertarik bergabung.</p>
                  </div>
                  <div className="space-y-4">
                    <textarea
                      required
                      minLength={MIN_ALASAN}
                      value={alasan}
                      onChange={(e) => setAlasan(e.target.value)}
                      placeholder="Apa yang membuat Anda ingin bergabung dengan HIMASI? Apa harapan Anda kedepannya? (Minimal 50 karakter)"
                      rows={8}
                      className="w-full bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 text-slate-900 focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none text-lg font-medium resize-none shadow-sm hover:border-slate-200"
                    />
                    <div className="flex justify-end">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${alasan.trim().length >= MIN_ALASAN ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                        {alasan.trim().length} / {MIN_ALASAN} karakter
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-12 flex flex-col md:flex-row items-center gap-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="w-full md:w-auto px-10 py-5 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
                >
                  <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  Kembali
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex-1 w-full py-5 rounded-3xl bg-primary text-white font-black text-xl shadow-xl shadow-primary/20 hover:bg-primary/90 hover:shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                ) : (
                  <>
                    <span className="uppercase tracking-wide">{step === totalSteps ? "Selesaikan Pendaftaran" : "Langkah Berikutnya"}</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-2xl">
                      {step === totalSteps ? "task_alt" : "arrow_forward"}
                    </span>
                  </>
                )}
              </button>
            </div>

            <p className="mt-8 text-center text-slate-500 font-medium pb-4">
              Sudah memiliki akun?{" "}
              <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4 decoration-2">
                Masuk ke Portal
              </Link>
            </p>
          </form>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
