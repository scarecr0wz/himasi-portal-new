import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Avatar from "@/components/Avatar";

export default function PublicNavbar() {
  const { token, user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const t = setTimeout(() => document.addEventListener("click", handleClickOutside), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 md:px-10 lg:px-40 py-3">
      <div className="flex items-center justify-between gap-8 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo-himasi.png" alt="HIMASI" className="h-10 w-auto object-contain" />
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/berita" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Berita</Link>
            <Link to="/acara" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Acara</Link>
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
          {token ? (
            user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((o) => !o);
                }}
                className="flex items-center gap-3 rounded-xl p-1.5 pr-3 hover:bg-slate-100 transition-colors outline-none focus:ring-2 focus:ring-primary/30"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <div className="flex flex-col items-end hidden sm:block">
                  <span className="text-slate-900 text-sm font-bold leading-tight">{user.name}</span>
                  <span className="text-slate-500 text-xs font-medium">{user.nim || user.email || "—"}</span>
                </div>
                <Avatar avatar={user.avatar} className="w-10 h-10 rounded-full" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-slate-900 font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-slate-500 text-xs">{user.nim || user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-lg">person</span>
                    Portal Mahasiswa
                  </Link>
                  {isAdmin === true && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); logout(); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Keluar
                  </button>
                </div>
              )}
            </div>
            ) : (
              <div className="flex min-w-[100px] items-center justify-center rounded-lg h-10 px-6 bg-slate-100 text-slate-500 text-sm font-medium">
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                <span className="ml-2">Memuat...</span>
              </div>
            )
          ) : (
            <Link
              to="/login"
              className="flex min-w-[100px] cursor-pointer items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
