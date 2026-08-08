import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Avatar from "@/components/Avatar";

export default function PublicNavbar() {
  const { token, user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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
    <header className="public-navbar sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl py-3">
      <div className="flex items-center justify-between gap-6 w-full max-w-[1440px] mx-auto px-5 md:px-10 lg:px-14 xl:px-16">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3" aria-label="HIMA SI - Beranda">
            <img src="/logo-himasi.png" alt="HIMA SI" className="h-10 w-auto object-contain" />
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            <Link to="/berita" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Berita</Link>
            <Link to="/acara" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Acara</Link>
            <Link to="/pengurus" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Pengurus</Link>
            <Link to="/program-kerja" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Program Kerja</Link>
            <Link to="/departemen" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">Departemen</Link>
            <Link to="/faq" className="text-slate-600 hover:text-primary text-sm font-semibold transition-colors">FAQ</Link>
          </nav>
        </div>
        <div className="flex flex-1 justify-end items-center gap-4">
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
          <button
            type="button"
            onClick={() => setMobileNavOpen((open) => !open)}
            className="lg:hidden grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-primary/30 hover:text-primary"
            aria-label={mobileNavOpen ? "Tutup navigasi" : "Buka navigasi"}
            aria-expanded={mobileNavOpen}
          >
            <span className="material-symbols-outlined">{mobileNavOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>
      {mobileNavOpen && (
        <nav className="mobile-public-nav w-full max-w-[1440px] mx-auto mt-3 border-t border-slate-100 px-5 md:px-10 pt-3 pb-2 lg:hidden" aria-label="Navigasi mobile">
          <div className="grid grid-cols-2 gap-1">
            <Link to="/berita" onClick={() => setMobileNavOpen(false)}>Berita</Link>
            <Link to="/acara" onClick={() => setMobileNavOpen(false)}>Acara</Link>
            <Link to="/pengurus" onClick={() => setMobileNavOpen(false)}>Pengurus</Link>
            <Link to="/program-kerja" onClick={() => setMobileNavOpen(false)}>Program Kerja</Link>
            <Link to="/departemen" onClick={() => setMobileNavOpen(false)}>Departemen</Link>
            <Link to="/faq" onClick={() => setMobileNavOpen(false)}>FAQ</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
