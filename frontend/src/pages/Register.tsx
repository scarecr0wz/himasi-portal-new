import { useState } from "react";
import { Link } from "react-router-dom";

const DEPARTEMEN = [
    { id: "acara", label: "Acara & Kehumasan", icon: "emoji_events", desc: "Menyelenggarakan event dan menjalin hubungan eksternal." },
    { id: "akademik", label: "Akademik & Keilmuan", icon: "menu_book", desc: "Pengembangan akademik dan wawasan teknologi informasi." },
    { id: "media", label: "Media & Publikasi", icon: "campaign", desc: "Mengelola informasi, media sosial, dan branding organisasi." },
    { id: "olahraga", label: "Olahraga & Seni", icon: "sports_basketball", desc: "Menampung minat dan bakat di bidang olahraga dan seni." },
    { id: "psdm", label: "PSDM", icon: "groups", desc: "Pengembangan SDM, kaderisasi, dan pelatihan soft skill." },
];

const ANGKATAN = ["2020", "2021", "2022", "2023", "2024", "2025"];

type Step = 1 | 2 | 3 | 4;

interface FormData {
    // Step 1
    nama: string;
    nim: string;
    angkatan: string;
    noHp: string;
    email: string;
    // Step 2
    dept1: string;
    dept2: string;
    alasan: string;
    pengalaman: string;
    harapan: string;
}

export default function Register() {
    const [step, setStep] = useState<Step>(1);
    const [form, setForm] = useState<FormData>({
        nama: "", nim: "", angkatan: "", noHp: "", email: "",
        dept1: "", dept2: "", alasan: "", pengalaman: "", harapan: "",
    });
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [submitted, setSubmitted] = useState(false);

    const set = (key: keyof FormData, val: string) =>
        setForm((f) => ({ ...f, [key]: val }));

    function validateStep1() {
        const e: typeof errors = {};
        if (!form.nama.trim()) e.nama = "Nama lengkap wajib diisi";
        if (!form.nim.trim()) e.nim = "NIM wajib diisi";
        else if (!/^\d{9}$/.test(form.nim)) e.nim = "NIM harus 9 digit angka";
        if (!form.angkatan) e.angkatan = "Angkatan wajib dipilih";
        if (!form.noHp.trim()) e.noHp = "Nomor HP wajib diisi";
        if (!form.email.trim()) e.email = "Email wajib diisi";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Format email tidak valid";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function validateStep2() {
        const e: typeof errors = {};
        if (!form.dept1) e.dept1 = "Pilih departemen pilihan pertama";
        if (!form.alasan.trim()) e.alasan = "Alasan bergabung wajib diisi";
        else if (form.alasan.trim().length < 50) e.alasan = "Alasan minimal 50 karakter";
        if (!form.harapan.trim()) e.harapan = "Harapan wajib diisi";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleNext() {
        if (step === 1 && validateStep1()) setStep(2);
        else if (step === 2 && validateStep2()) setStep(3);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // TODO: POST to API
        setSubmitted(true);
        setStep(4);
    }

    const dept1Label = DEPARTEMEN.find((d) => d.id === form.dept1)?.label ?? "—";
    const dept2Label = DEPARTEMEN.find((d) => d.id === form.dept2)?.label ?? "—";

    return (
        <div className="font-display bg-slate-50 text-slate-900 min-h-screen flex flex-col">

            {/* ── Header (sama dengan Landing) ── */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 md:px-10 lg:px-40 py-3">
                <div className="flex items-center justify-between gap-8 max-w-[1280px] mx-auto">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/logo-himasi.png" alt="HIMASI" className="h-10 w-auto object-contain" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="flex items-center justify-center rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                        >
                            Masuk
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-12">

                {/* ── Page header ── */}
                <div className="mb-10 text-center max-w-2xl mx-auto">
                    <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-4">
                        Pendaftaran Anggota
                    </span>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 mb-3">
                        Bergabung dengan <span className="text-primary">HIMASI</span>
                    </h1>
                    <p className="text-slate-600 text-lg leading-relaxed">
                        Isi formulir berikut untuk mendaftar sebagai anggota Himpunan Mahasiswa Sistem Informasi UT Bogor.
                    </p>
                </div>

                {/* ── Stepper ── */}
                {step < 4 && (
                    <div className="flex items-center justify-center gap-0 mb-10 max-w-md mx-auto">
                        {["Data Diri", "Minat & Motivasi", "Konfirmasi"].map((label, i) => {
                            const s = (i + 1) as Step;
                            const isDone = step > s;
                            const isActive = step === s;
                            return (
                                <div key={s} className="flex items-center">
                                    <div className="flex flex-col items-center gap-1.5">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                      ${isDone ? "bg-emerald-500 border-emerald-500 text-white"
                                                : isActive ? "bg-primary border-primary text-white shadow-md shadow-primary/30"
                                                    : "bg-white border-slate-200 text-slate-400"}`}>
                                            {isDone ? (
                                                <span className="material-symbols-outlined text-base">check</span>
                                            ) : s}
                                        </div>
                                        <span className={`text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap
                      ${isActive ? "text-primary" : isDone ? "text-emerald-600" : "text-slate-400"}`}>
                                            {label}
                                        </span>
                                    </div>
                                    {i < 2 && (
                                        <div className={`w-16 md:w-24 h-0.5 mb-5 mx-1 transition-all
                      ${step > s + 1 ? "bg-emerald-400" : step > s ? "bg-primary/50" : "bg-slate-200"}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ══════════ STEP 1: Data Diri ══════════ */}
                {step === 1 && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-md p-8 md:p-10">
                            <h2 className="text-xl font-bold text-slate-900 mb-1">Data Diri</h2>
                            <p className="text-slate-500 text-sm mb-8">Lengkapi informasi identitas kamu sebagai mahasiswa Sistem Informasi.</p>

                            <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>

                                {/* Nama */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-slate-700" htmlFor="reg-nama">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="reg-nama"
                                        type="text"
                                        placeholder="Sesuai KTP / kartu mahasiswa"
                                        value={form.nama}
                                        onChange={(e) => set("nama", e.target.value)}
                                        className={`w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary
                      ${errors.nama ? "border-red-400" : "border-slate-200"}`}
                                    />
                                    {errors.nama && <p className="text-red-500 text-xs">{errors.nama}</p>}
                                </div>

                                {/* NIM + Angkatan */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-slate-700" htmlFor="reg-nim">
                                            NIM <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="reg-nim"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={9}
                                            placeholder="9 digit NIM"
                                            value={form.nim}
                                            onChange={(e) => set("nim", e.target.value.replace(/\D/g, ""))}
                                            className={`w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary
                        ${errors.nim ? "border-red-400" : "border-slate-200"}`}
                                        />
                                        {errors.nim && <p className="text-red-500 text-xs">{errors.nim}</p>}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-semibold text-slate-700" htmlFor="reg-angkatan">
                                            Angkatan <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="reg-angkatan"
                                            value={form.angkatan}
                                            onChange={(e) => set("angkatan", e.target.value)}
                                            className={`w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm text-slate-900 outline-none cursor-pointer transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary
                        ${errors.angkatan ? "border-red-400" : "border-slate-200"}`}
                                        >
                                            <option value="">Pilih tahun angkatan</option>
                                            {ANGKATAN.map((y) => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                        {errors.angkatan && <p className="text-red-500 text-xs">{errors.angkatan}</p>}
                                    </div>
                                </div>

                                {/* No HP */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-slate-700" htmlFor="reg-hp">
                                        Nomor WhatsApp <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="reg-hp"
                                        type="tel"
                                        inputMode="tel"
                                        placeholder="08xxxxxxxxxx"
                                        value={form.noHp}
                                        onChange={(e) => set("noHp", e.target.value)}
                                        className={`w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary
                      ${errors.noHp ? "border-red-400" : "border-slate-200"}`}
                                    />
                                    {errors.noHp && <p className="text-red-500 text-xs">{errors.noHp}</p>}
                                </div>

                                {/* Email */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-slate-700" htmlFor="reg-email">
                                        Alamat Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="reg-email"
                                        type="email"
                                        placeholder="contoh@email.com"
                                        value={form.email}
                                        onChange={(e) => set("email", e.target.value)}
                                        className={`w-full h-11 px-4 rounded-xl border bg-slate-50 text-sm text-slate-900 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary
                      ${errors.email ? "border-red-400" : "border-slate-200"}`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button type="submit"
                                        className="flex items-center gap-2 h-11 px-8 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all">
                                        Lanjut
                                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ══════════ STEP 2: Minat & Motivasi ══════════ */}
                {step === 2 && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-md p-8 md:p-10">
                            <h2 className="text-xl font-bold text-slate-900 mb-1">Minat & Motivasi</h2>
                            <p className="text-slate-500 text-sm mb-8">Ceritakan minat departemenmu dan alasan ingin bergabung dengan HIMASI.</p>

                            <form className="flex flex-col gap-6" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>

                                {/* Pilih Departemen */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Pilihan Departemen <span className="text-red-500">*</span>
                                        <span className="text-slate-400 font-normal ml-1">(pilih 1 atau 2)</span>
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {DEPARTEMEN.map((d) => {
                                            const isPrimary = form.dept1 === d.id;
                                            const isSecondary = form.dept2 === d.id;
                                            const isSelected = isPrimary || isSecondary;
                                            return (
                                                <button
                                                    key={d.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isPrimary) {
                                                            set("dept1", form.dept2);
                                                            set("dept2", "");
                                                        } else if (isSecondary) {
                                                            set("dept2", "");
                                                        } else if (!form.dept1) {
                                                            set("dept1", d.id);
                                                        } else if (!form.dept2 && form.dept1 !== d.id) {
                                                            set("dept2", d.id);
                                                        }
                                                    }}
                                                    className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all
                            ${isPrimary ? "border-primary bg-primary/5"
                                                            : isSecondary ? "border-primary/40 bg-primary/3"
                                                                : "border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50"}`}
                                                >
                                                    <span className={`material-symbols-outlined text-2xl shrink-0 mt-0.5
                            ${isSelected ? "text-primary" : "text-slate-400"}`}>
                                                        {d.icon}
                                                    </span>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-slate-800"}`}>
                                                                {d.label}
                                                            </span>
                                                            {isPrimary && (
                                                                <span className="text-[10px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full leading-none">1</span>
                                                            )}
                                                            {isSecondary && (
                                                                <span className="text-[10px] font-bold bg-primary/30 text-primary px-1.5 py-0.5 rounded-full leading-none">2</span>
                                                            )}
                                                        </div>
                                                        <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{d.desc}</p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.dept1 && <p className="text-red-500 text-xs">{errors.dept1}</p>}
                                </div>

                                {/* Alasan bergabung */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-slate-700" htmlFor="reg-alasan">
                                        Mengapa ingin bergabung dengan HIMASI? <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="reg-alasan"
                                        rows={4}
                                        placeholder="Ceritakan alasan dan motivasimu bergabung... (min. 50 karakter)"
                                        value={form.alasan}
                                        onChange={(e) => set("alasan", e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-sm text-slate-900 outline-none resize-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary
                      ${errors.alasan ? "border-red-400" : "border-slate-200"}`}
                                    />
                                    <div className="flex justify-between">
                                        {errors.alasan
                                            ? <p className="text-red-500 text-xs">{errors.alasan}</p>
                                            : <span />}
                                        <span className={`text-xs ${form.alasan.length < 50 ? "text-slate-400" : "text-emerald-500 font-medium"}`}>
                                            {form.alasan.length}/50+ karakter
                                        </span>
                                    </div>
                                </div>

                                {/* Pengalaman organisasi */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-slate-700" htmlFor="reg-pengalaman">
                                        Pengalaman Organisasi <span className="text-slate-400 font-normal">(opsional)</span>
                                    </label>
                                    <textarea
                                        id="reg-pengalaman"
                                        rows={3}
                                        placeholder="Ceritakan pengalaman organisasi atau kegiatan sebelumnya, jika ada..."
                                        value={form.pengalaman}
                                        onChange={(e) => set("pengalaman", e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none resize-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    />
                                </div>

                                {/* Harapan */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-slate-700" htmlFor="reg-harapan">
                                        Apa yang ingin kamu dapatkan dari HIMASI? <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="reg-harapan"
                                        rows={3}
                                        placeholder="Harapan dan target yang ingin dicapai selama bergabung..."
                                        value={form.harapan}
                                        onChange={(e) => set("harapan", e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl border bg-slate-50 text-sm text-slate-900 outline-none resize-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary
                      ${errors.harapan ? "border-red-400" : "border-slate-200"}`}
                                    />
                                    {errors.harapan && <p className="text-red-500 text-xs">{errors.harapan}</p>}
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <button type="button" onClick={() => setStep(1)}
                                        className="flex items-center gap-2 h-11 px-5 text-slate-600 text-sm font-semibold rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 transition-all">
                                        <span className="material-symbols-outlined text-base">arrow_back</span>
                                        Kembali
                                    </button>
                                    <button type="submit"
                                        className="flex items-center gap-2 h-11 px-8 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all">
                                        Lanjut
                                        <span className="material-symbols-outlined text-base">arrow_forward</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ══════════ STEP 3: Konfirmasi ══════════ */}
                {step === 3 && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-md p-8 md:p-10">
                            <h2 className="text-xl font-bold text-slate-900 mb-1">Konfirmasi Pendaftaran</h2>
                            <p className="text-slate-500 text-sm mb-8">Periksa kembali data sebelum mengirim formulir.</p>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                                {/* Ringkasan data diri */}
                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Data Diri</h3>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                        {[
                                            ["Nama Lengkap", form.nama],
                                            ["NIM", form.nim],
                                            ["Angkatan", form.angkatan],
                                            ["No. WhatsApp", form.noHp],
                                            ["Email", form.email],
                                        ].map(([k, v]) => (
                                            <div key={k} className={k === "Nama Lengkap" || k === "Email" ? "col-span-2" : ""}>
                                                <div className="text-xs text-slate-400 mb-0.5">{k}</div>
                                                <div className="text-sm font-semibold text-slate-900 break-all">{v || "—"}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Ringkasan departemen */}
                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Pilihan Departemen</h3>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">1st</span>
                                            <span className="text-sm font-semibold text-slate-900">{dept1Label}</span>
                                        </div>
                                        {form.dept2 && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">2nd</span>
                                                <span className="text-sm font-semibold text-slate-900">{dept2Label}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Ringkasan motivasi */}
                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Motivasi</h3>
                                    <div className="flex flex-col gap-3">
                                        <div>
                                            <div className="text-xs text-slate-400 mb-1">Alasan bergabung</div>
                                            <p className="text-sm text-slate-700 leading-relaxed">{form.alasan}</p>
                                        </div>
                                        {form.pengalaman && (
                                            <div>
                                                <div className="text-xs text-slate-400 mb-1">Pengalaman organisasi</div>
                                                <p className="text-sm text-slate-700 leading-relaxed">{form.pengalaman}</p>
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-xs text-slate-400 mb-1">Harapan</div>
                                            <p className="text-sm text-slate-700 leading-relaxed">{form.harapan}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Info note */}
                                <div className="flex gap-3 p-4 bg-primary/5 border border-primary/15 rounded-xl">
                                    <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">info</span>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Data kamu akan diverifikasi oleh pengurus HIMASI. Kamu akan dihubungi melalui WhatsApp atau email yang didaftarkan dalam waktu <strong>3-5 hari kerja</strong>.
                                    </p>
                                </div>

                                <div className="flex justify-between items-center pt-1">
                                    <button type="button" onClick={() => setStep(2)}
                                        className="flex items-center gap-2 h-11 px-5 text-slate-600 text-sm font-semibold rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 transition-all">
                                        <span className="material-symbols-outlined text-base">arrow_back</span>
                                        Kembali
                                    </button>
                                    <button type="submit" id="register-submit-btn"
                                        className="flex items-center gap-2 h-11 px-8 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all">
                                        Kirim Pendaftaran
                                        <span className="material-symbols-outlined text-base">send</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ══════════ STEP 4: Sukses ══════════ */}
                {step === 4 && submitted && (
                    <div className="max-w-lg mx-auto text-center">
                        <div className="bg-white rounded-2xl shadow-md p-10 flex flex-col items-center gap-6">
                            {/* Success icon */}
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-emerald-500">check_circle</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-2">Pendaftaran Terkirim!</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Terima kasih, <strong>{form.nama}</strong>! Formulir pendaftaranmu sudah kami terima.
                                    Pengurus HIMASI akan menghubungimu melalui <strong>{form.noHp}</strong> dalam 3-5 hari kerja.
                                </p>
                            </div>

                            <div className="w-full bg-slate-50 rounded-xl p-4 text-left border border-slate-100">
                                <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Ringkasan</div>
                                <div className="text-sm text-slate-700 space-y-1">
                                    <div><span className="text-slate-400">NIM:</span> <span className="font-semibold">{form.nim}</span></div>
                                    <div><span className="text-slate-400">Departemen:</span> <span className="font-semibold">{dept1Label}</span></div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full">
                                <Link to="/"
                                    className="flex-1 flex items-center justify-center gap-2 h-11 px-5 text-slate-700 font-semibold text-sm rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 transition-all">
                                    <span className="material-symbols-outlined text-base">home</span>
                                    Beranda
                                </Link>
                                <Link to="/login"
                                    className="flex-1 flex items-center justify-center gap-2 h-11 px-5 bg-primary text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                                    Masuk Portal
                                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* ── Footer minimal ── */}
            <footer className="border-t border-slate-200 bg-white px-6 py-5 text-center">
                <p className="text-slate-400 text-xs">© 2024 HIMASI Universitas Terbuka Bogor · Departemen Media & Publikasi</p>
            </footer>

        </div>
    );
}
