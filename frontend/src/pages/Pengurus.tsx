import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";

const BPH = {
    row1: [
        { name: "Nama Dewan Pengarah", role: "Dewan Pengarah" },
        { name: "Nama Ketua Umum", role: "Ketua Umum" },
        { name: "Nama Wakil Ketua Umum", role: "Wakil Ketua Umum" },
    ],
    row2: [
        { name: "Nama Sekretaris", role: "Sekretaris" },
        { name: "Nama Bendahara", role: "Bendahara" },
    ],
};

const DEPARTEMEN = [
    { title: "Acara & Kehumasan", icon: "emoji_events", photo: null as string | null, kepala: "Nama Kepala Departemen" },
    { title: "Akademik & Keilmuan", icon: "menu_book", photo: null as string | null, kepala: "Nama Kepala Departemen" },
    { title: "Media & Publikasi", icon: "campaign", photo: null as string | null, kepala: "Nama Kepala Departemen" },
    { title: "Olahraga & Seni", icon: "sports_basketball", photo: null as string | null, kepala: "Nama Kepala Departemen" },
    { title: "PSDM", icon: "groups", photo: null as string | null, kepala: "Nama Kepala Departemen" },
];

export default function Pengurus() {
    return (
        <div className="font-display bg-background-light text-slate-900 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300">
            <PublicNavbar />

            <main className="flex-1 max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-40 py-12">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
                    <Link to="/" className="hover:text-primary transition-colors">Beranda</Link>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="text-slate-900 font-semibold">Pengurus</span>
                </div>

                {/* Page Header */}
                <div className="mb-12">
                    <h1 className="text-slate-900 text-3xl md:text-4xl font-black tracking-tight mb-3">
                        Pengurus <span className="text-primary">HIMASI</span>
                    </h1>
                    <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
                        Struktur kepengurusan Himpunan Mahasiswa Sistem Informasi Universitas Terbuka Bogor periode 2025/2026.
                    </p>
                </div>

                {/* Badan Pengurus Harian */}
                <section className="mb-14">
                    <h2 className="text-slate-900 text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">shield_person</span>
                        Badan Pengurus Harian
                    </h2>
                    <p className="text-slate-500 text-sm mb-8">Pimpinan organisasi yang menjalankan roda kepengurusan HIMASI.</p>

                    {/* Row 1: Dewan Pengarah — Ketua Umum — Wakil Ketua Umum */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                        {BPH.row1.map((person) => (
                            <div key={person.role} className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-4 border-2 border-primary/10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />
                                <div className="w-32 h-32 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden ring-4 ring-primary/20">
                                    <span className="material-symbols-outlined text-7xl text-primary/60">person</span>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-slate-900 font-bold text-lg">{person.name}</h3>
                                    <span className="inline-block mt-2 px-4 py-1.5 bg-primary text-white text-xs font-bold uppercase rounded-full tracking-wide">
                                        {person.role}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Row 2: Sekretaris — Bendahara */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        {BPH.row2.map((person) => (
                            <div key={person.role} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center gap-4 hover:shadow-lg transition-shadow">
                                <div className="w-28 h-28 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
                                    <span className="material-symbols-outlined text-6xl text-primary/60">person</span>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-slate-900 font-bold text-lg">{person.name}</h3>
                                    <span className="text-primary text-xs font-semibold uppercase tracking-wide">{person.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Departemen */}
                <section className="mb-14">
                    <h2 className="text-slate-900 text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">groups</span>
                        Departemen
                    </h2>
                    <p className="text-slate-500 text-sm mb-8">Tim departemen yang mengkoordinasikan dan menjalankan program kerja HIMASI.</p>

                    <div className="flex flex-col gap-10">
                        {DEPARTEMEN.map((dept) => (
                            <div key={dept.title} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                                {/* Group Photo Area */}
                                <div className="w-full aspect-[2/1] bg-slate-100 flex items-center justify-center overflow-hidden relative">
                                    {dept.photo ? (
                                        <img src={dept.photo} alt={`Tim ${dept.title}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 text-slate-400">
                                            <span className="material-symbols-outlined text-6xl">photo_camera</span>
                                            <span className="text-sm font-medium">Foto Tim {dept.title}</span>
                                        </div>
                                    )}
                                </div>
                                {/* Info */}
                                <div className="p-6 md:p-8 flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-xl text-primary">{dept.icon}</span>
                                        </div>
                                        <h3 className="text-slate-900 font-bold text-lg">{dept.title}</h3>
                                    </div>
                                    <p className="text-slate-500 text-sm mt-1">
                                        <span className="font-semibold text-slate-700">Kepala Departemen:</span> {dept.kepala}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="rounded-2xl bg-primary/5 p-8 md:p-12 text-center">
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
