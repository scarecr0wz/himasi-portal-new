import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Avatar from "@/components/Avatar";

const sidebarNav = (
  <>
    <NavLink to="/admin" end className={({ isActive }) => `sidebar-item ${isActive ? "sidebar-active" : ""}`}>
      <span className="material-symbols-outlined">dashboard</span>
      <span className="text-[14px]">Dashboard</span>
    </NavLink>
    <NavLink to="/admin/mahasiswa" className={({ isActive }) => `sidebar-item ${isActive ? "sidebar-active" : ""}`}>
      <span className="material-symbols-outlined">school</span>
      <span className="text-[14px]">Data Anggota</span>
    </NavLink>
    <NavLink to="/admin/content" className={({ isActive }) => `sidebar-item ${isActive ? "sidebar-active" : ""}`}>
      <span className="material-symbols-outlined">article</span>
      <span className="text-[14px]">Content</span>
    </NavLink>
    <NavLink to="/admin/pengurus" className={({ isActive }) => `sidebar-item ${isActive ? "sidebar-active" : ""}`}>
      <span className="material-symbols-outlined">groups</span>
      <span className="text-[14px]">Pengurus</span>
    </NavLink>
    <NavLink to="/admin/menus" className={({ isActive }) => `sidebar-item ${isActive ? "sidebar-active" : ""}`}>
      <span className="material-symbols-outlined">menu</span>
      <span className="text-[14px]">Menu</span>
    </NavLink>
    <NavLink to="/admin/settings" className={({ isActive }) => `sidebar-item ${isActive ? "sidebar-active" : ""}`}>
      <span className="material-symbols-outlined">settings</span>
      <span className="text-[14px]">Pengaturan</span>
    </NavLink>
  </>
);

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "A";
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) setAvatarMenuOpen(false);
    };
    const t = setTimeout(() => document.addEventListener("click", handleClickOutside), 50);
    return () => {
      clearTimeout(t);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [avatarMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="portal-shell admin-shell flex h-screen overflow-hidden text-slate-900 font-[family-name:var(--font-display)]">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          onClick={closeMobileMenu}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          aria-label="Tutup menu"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`portal-sidebar fixed top-0 left-0 h-full w-72 flex-shrink-0 border-r flex flex-col z-40 transform transition-transform duration-200 ease-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="portal-brand p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <div className="portal-logo"><img src="/himasi-icon.png" alt="" /></div>
            <div><strong className="block text-sm">HIMASI</strong><span className="text-[10px] font-semibold tracking-[0.14em] uppercase">Admin Console</span></div>
          </div>
          <button
            type="button"
            onClick={closeMobileMenu}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            aria-label="Tutup menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1" onClick={closeMobileMenu}>
          {sidebarNav}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <Link
            to="/dashboard"
            onClick={closeMobileMenu}
            className="flex items-center gap-3 text-slate-500 hover:text-primary transition-all text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            <span>KE DASHBOARD MAHASISWA</span>
          </Link>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="portal-sidebar w-72 flex-shrink-0 border-r hidden md:flex flex-col relative z-20">
        <div className="portal-brand px-7 py-8 flex items-center gap-4">
          <div className="portal-logo"><img src="/himasi-icon.png" alt="" /></div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight leading-none">HIMASI</h2>
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase mt-1">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 mt-4">
          {sidebarNav}
          <div className="pt-8 px-6">
            <div className="h-px bg-slate-200 w-full mb-6" />
            <Link
              to="/dashboard"
              className="flex items-center gap-3 text-slate-400 hover:text-primary transition-all text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-lg">open_in_new</span>
              <span>KE DASHBOARD MAHASISWA</span>
            </Link>
          </div>
        </nav>

        <div className="p-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              SYSTEM STATUS
            </p>
            <div className="flex justify-between items-end mb-2">
              <p className="text-xs font-bold text-slate-700">v2.4 Stable</p>
              <span className="text-[10px] text-green-500 font-bold uppercase">Online</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full w-[100%]" />
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="portal-header h-14 md:h-20 border-b relative z-10">
          <div className="h-full w-full max-w-[1440px] mx-auto flex items-center justify-between gap-2 px-4 md:px-10 lg:px-14 xl:px-16">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 focus:ring-2 focus:ring-primary/20"
            aria-label="Buka menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <div className="flex items-center flex-1 max-w-xl min-w-0">
            <div className="relative w-full max-w-md hidden sm:block">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                search
              </span>
              <input
                type="search"
                className="w-full bg-slate-50 border-slate-200 rounded-xl pl-12 pr-4 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 border transition-all text-sm placeholder:text-slate-400"
                placeholder="Cari layanan administrasi..."
              />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-6 flex-shrink-0">
            <button
              type="button"
              className="relative p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg transition-all"
              aria-label="Notifikasi"
            >
              <span className="material-symbols-outlined text-xl md:text-2xl">notifications</span>
              <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <Link
              to="/admin/content"
              className="bg-[#137fec] text-white px-3 py-2 md:px-6 md:py-2.5 rounded-xl text-sm font-bold flex items-center gap-1.5 md:gap-2 hover:bg-[#1651a4] transition-all shadow-lg shadow-blue-500/25"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span className="hidden sm:inline">Kelola Konten</span>
            </Link>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="relative" ref={avatarMenuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setAvatarMenuOpen((o) => !o);
                }}
                className="flex items-center gap-3 cursor-pointer group outline-none focus:ring-2 focus:ring-slate-300 rounded-full"
                aria-expanded={avatarMenuOpen}
                aria-haspopup="true"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user?.name ?? "Super Admin"}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Administrator</p>
                </div>
                <span className="size-10 rounded-full bg-slate-100 border-2 border-slate-50 overflow-hidden ring-1 ring-slate-200 group-hover:ring-primary/30 transition-all flex items-center justify-center text-slate-600 font-semibold text-sm">
                  {user?.avatar != null && user.avatar !== "" ? (
                    <Avatar avatar={user?.avatar} className="w-full h-full rounded-full" iconClassName="text-slate-400 text-xl" />
                  ) : (
                    initial
                  )}
                </span>
              </button>
              {avatarMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-slate-900 font-semibold text-sm truncate">{user?.name ?? "Admin"}</p>
                    <p className="text-slate-500 text-xs">Administrator</p>
                  </div>
                  <Link
                    to="/"
                    className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
                    onClick={() => setAvatarMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined text-lg">home</span>
                    Beranda
                  </Link>
                  <button
                    type="button"
                    onClick={() => { setAvatarMenuOpen(false); logout(); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
          </div>
        </header>

        <div className="portal-content flex-1 overflow-y-auto">
          <div className="w-full max-w-[1440px] mx-auto p-4 md:p-10 lg:px-14 xl:px-16">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
