import { Link } from "react-router-dom";

export default function PublicNavbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 md:px-10 lg:px-40 py-3">
            <div className="flex items-center justify-between gap-8 max-w-[1280px] mx-auto">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-3">
                        <img src="/logo-himasi.png" alt="HIMASI" className="h-10 w-auto object-contain" />
                    </Link>
                    <nav className="hidden lg:flex items-center gap-6">
                        <a href="/#berita" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Berita</a>
                        <a href="/#acara" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Acara</a>
                        <Link to="/pengurus" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Pengurus</Link>
                        <a href="/#program-kerja" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Program Kerja</a>
                        <a href="/#department" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Department</a>
                        <a href="/#faq" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">FAQ</a>
                        <a href="/#tentang" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Tentang</a>
                    </nav>
                </div>
                <div className="flex flex-1 justify-end items-center gap-4">
                    <label className="hidden md:flex items-center relative min-w-40 max-w-64 h-10 group">
                        <span className="absolute left-3 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-xl">search</span>
                        <input className="w-full h-full pl-10 pr-4 rounded-lg border-none bg-slate-100 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary text-sm transition-all" placeholder="Cari..." />
                    </label>
                    <Link
                        to="/login"
                        className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
                    >
                        Masuk
                    </Link>
                </div>
            </div>
        </header>
    );
}
