import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function Layout() {
  const { user, logout } = useAuth();
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? user?.nim?.charAt(0) ?? "?";

  return (
    <div className="dashboard-layout" data-theme="light">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-logo">
          <img src="/logo-himasi.png" alt="HIMASI" className="dashboard-sidebar-logo-img" />
        </div>
        <nav className="dashboard-nav">
          <NavLink to="/dashboard" end className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="dashboard-nav-icon">&#9635;</span>
            Dashboard
          </NavLink>
          <NavLink to="/dashboard/profile" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="dashboard-nav-icon">&#9679;</span>
            Profil
          </NavLink>
          <NavLink to="/dashboard/akademik" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="dashboard-nav-icon">&#9660;</span>
            Akademik
          </NavLink>
          <NavLink to="/dashboard/acara" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="dashboard-nav-icon">&#9660;</span>
            Acara
          </NavLink>
          <NavLink to="/dashboard/kehadiran" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="dashboard-nav-icon">&#9679;</span>
            Kehadiran
          </NavLink>
          <NavLink to="/dashboard/kas" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="dashboard-nav-icon">&#9679;</span>
            Kas
          </NavLink>
          <NavLink to="/dashboard/forum" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="dashboard-nav-icon">&#9679;</span>
            Ruang Terbuka
          </NavLink>
        </nav>
        <div className="dashboard-sidebar-footer">
          <button type="button" aria-label="Toggle theme">
            Toggle Theme
          </button>
        </div>
      </aside>

      <div className="dashboard-main-wrap">
        <header className="dashboard-header">
          <div className="dashboard-header-user">
            <div className="dashboard-header-user-avatar">{initial}</div>
            <div className="dashboard-header-user-info">
              <span className="dashboard-header-user-name">{user?.name ?? "Mahasiswa"}</span>
              <span className="dashboard-header-user-id">{user?.nim ?? ""}</span>
            </div>
          </div>
          <button type="button" className="dashboard-header-notif" aria-label="Notifikasi" title="Notifikasi">
            <span aria-hidden>&#128276;</span>
            <span className="dashboard-header-notif-badge">2</span>
          </button>
          <button type="button" className="dashboard-header-logout" onClick={logout}>
            Keluar
          </button>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>

        <footer className="dashboard-footer">
          © 2024 HIMASI Universitas Terbuka Bogor. Dikelola oleh Departemen Media & Publikasi.
        </footer>
        <button type="button" className="dashboard-footer-help" aria-label="Bantuan">
          ?
        </button>
      </div>
    </div>
  );
}
