import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Avatar from "@/components/Avatar";

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? user?.nim?.charAt(0) ?? "?";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
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
    if (sidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <div className="portal-shell student-shell flex h-screen overflow-hidden text-slate-900 max-w-[100vw] font-[family-name:var(--font-display)]">
      {/* Overlay when sidebar open on mobile (same pattern as Admin) */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          aria-label="Tutup menu"
        />
      )}
      {/* Sidebar: fixed on mobile (out of flow → main full width), in-flow on desktop */}
      <aside
        className={`portal-sidebar fixed top-0 left-0 bottom-0 z-40 w-[min(288px,85vw)] sm:w-72 flex-shrink-0 border-r flex flex-col transition-transform duration-200 ease-out md:relative md:top-auto md:left-auto md:bottom-auto md:z-20 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
        }`}
      >
        <div className="portal-brand p-4 flex items-center justify-between border-b md:border-b-0 md:px-7 md:py-8">
          <div className="flex items-center gap-3">
            <div className="portal-logo"><img src="/himasi-icon.png" alt="" /></div>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold tracking-tight leading-none">HIMASI</h2>
              <p className="text-[10px] font-semibold tracking-[0.14em] uppercase mt-1">Portal Mahasiswa</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
            aria-label="Tutup menu"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto space-y-0.5 mt-2 md:mt-4 px-2 md:px-0" aria-label="Menu navigasi">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "sidebar-active" : ""}`
            }
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[14px]">Dashboard</span>
          </NavLink>
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "sidebar-active" : ""}`
            }
          >
            <span className="material-symbols-outlined">person</span>
            <span className="text-[14px]">Profil</span>
          </NavLink>
          <NavLink
            to="/dashboard/akademik"
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "sidebar-active" : ""}`
            }
          >
            <span className="material-symbols-outlined">menu_book</span>
            <span className="text-[14px]">Akademik</span>
          </NavLink>
          <NavLink
            to="/dashboard/acara"
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "sidebar-active" : ""}`
            }
          >
            <span className="material-symbols-outlined">event</span>
            <span className="text-[14px]">Acara</span>
          </NavLink>
          <NavLink
            to="/dashboard/kehadiran"
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "sidebar-active" : ""}`
            }
          >
            <span className="material-symbols-outlined">check_circle</span>
            <span className="text-[14px]">Kehadiran</span>
          </NavLink>
          <NavLink
            to="/dashboard/kas"
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "sidebar-active" : ""}`
            }
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span className="text-[14px]">Kas</span>
          </NavLink>
          <NavLink
            to="/dashboard/forum"
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "sidebar-active" : ""}`
            }
          >
            <span className="material-symbols-outlined">forum</span>
            <span className="text-[14px]">Ruang Terbuka</span>
          </NavLink>
          <NavLink
            to="/dashboard/activities"
            className={({ isActive }) =>
              `sidebar-item ${isActive ? "sidebar-active" : ""}`
            }
          >
            <span className="material-symbols-outlined">calendar_month</span>
            <span className="text-[14px]">Kegiatan</span>
          </NavLink>

          <div className="pt-8 px-6">
            <div className="h-px bg-slate-200 w-full mb-6" />
            <Link
              to="/"
              className="flex items-center gap-3 text-slate-400 hover:text-primary transition-all text-xs font-semibold"
            >
              <span className="material-symbols-outlined text-lg">home</span>
              <span>KE BERANDA</span>
            </Link>
          </div>
        </nav>

        {/* <div className="p-6">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              PORTAL MAHASISWA
            </p>
            <div className="flex justify-between items-end mb-2">
              <p className="text-xs font-bold text-slate-700">{user?.nim ?? "—"}</p>
              <span className="text-[10px] text-green-500 font-bold uppercase">Aktif</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-[100%] bg-green-500" />
            </div>
          </div>
        </div> */}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="portal-header h-14 md:h-20 border-b relative z-10">
          <div className="h-full w-full max-w-[1440px] mx-auto flex items-center justify-between gap-2 px-4 md:px-10 lg:px-14 xl:px-16">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 focus:ring-2 focus:ring-primary/20"
            aria-label="Buka menu navigasi"
            aria-expanded={sidebarOpen}
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
                placeholder="Cari layanan mahasiswa..."
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
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />
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
                aria-label="Menu akun"
              >
                <div className="text-right hidden lg:block min-w-0 max-w-[160px]">
                  <p className="text-xs font-bold text-slate-800 leading-none truncate" title={user?.name ?? undefined}>{user?.name ?? "Mahasiswa"}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{isAdmin ? "Admin" : "Mahasiswa"}</p>
                </div>
                <span className="size-10 rounded-full bg-slate-100 border-2 border-slate-50 overflow-hidden ring-1 ring-slate-200 group-hover:ring-primary/30 transition-all flex items-center justify-center text-slate-600 font-semibold text-sm shrink-0">
                  {user?.avatar != null && user.avatar !== "" ? (
                    <Avatar avatar={user?.avatar} className="w-full h-full rounded-full" iconClassName="text-slate-400 text-xl" />
                  ) : (
                    initial
                  )}
                </span>
              </button>
              {avatarMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-xl py-2 z-50">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2.5 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
                      onClick={() => setAvatarMenuOpen(false)}
                    >
                      <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                      Admin portal
                    </Link>
                  )}
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

        <div className="portal-content flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-[1440px] mx-auto p-4 md:p-10 lg:px-14 xl:px-16">
            <Outlet />
          </div>
        </div>

        <footer className="portal-footer py-3 px-4 md:py-4 md:px-10 border-t text-[10px] md:text-[11px] text-center md:text-left">
          <span className="block sm:inline">© 2024 HIMASI Universitas Terbuka Bogor.</span>
          <span className="hidden sm:inline"> </span>
          <span className="block sm:inline">Dikelola oleh Departemen Media & Publikasi.</span>
        </footer>
      </main>
    </div>
  );
}
