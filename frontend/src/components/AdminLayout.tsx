import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? "A";

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-logo">
          <div className="dashboard-sidebar-logo-icon" aria-hidden />
          <span>Admin Portal</span>
        </div>
        <nav className="dashboard-nav">
          <NavLink to="/admin" end className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="dashboard-nav-icon">&#9635;</span>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="dashboard-nav-icon">&#9679;</span>
            User Management
          </NavLink>
          <NavLink to="/admin/roles" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="dashboard-nav-icon">&#9679;</span>
            Role & Permission
          </NavLink>
          <NavLink to="/admin/content" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="dashboard-nav-icon">&#9679;</span>
            Konten (Berita/Kegiatan)
          </NavLink>
          <NavLink to="/admin/menus" className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="dashboard-nav-icon">&#9679;</span>
            Menu
          </NavLink>
          <NavLink to="/dashboard" className={() => ""}>
            <span className="dashboard-nav-icon">&#8677;</span>
            Ke Dashboard Mahasiswa
          </NavLink>
        </nav>
        <div className="dashboard-sidebar-footer">
          <button type="button" onClick={logout}>Keluar</button>
        </div>
      </aside>

      <div className="dashboard-main-wrap">
        <header className="dashboard-header">
          <div className="dashboard-header-user">
            <div className="dashboard-header-user-avatar">{initial}</div>
            <div className="dashboard-header-user-info">
              <span className="dashboard-header-user-name">{user?.name ?? "Admin"}</span>
              <span className="dashboard-header-user-id">{user?.nim ?? ""} · Administrasi</span>
            </div>
          </div>
          <button type="button" className="dashboard-header-logout" onClick={logout}>
            Keluar
          </button>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>

        <footer className="dashboard-footer">
          © 2024 HIMASI UT Bogor · Management Portal
        </footer>
      </div>
    </div>
  );
}
