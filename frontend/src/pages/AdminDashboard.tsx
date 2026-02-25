import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <>
      <nav className="dashboard-breadcrumb">
        <Link to="/admin">Admin</Link>
        <span> &gt; Dashboard</span>
      </nav>
      <h2 className="section-title">
        <span className="section-title-bar" />
        Dashboard Administrasi
      </h2>
      <p className="section-subtitle">
        Kelola user, role, permission, menu, dan konten portal dari sini.
      </p>
      <div className="stat-cards">
        <Link to="/admin/users" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="stat-card">
            <div className="stat-card-icon purple">&#128100;</div>
            <div>
              <div className="stat-card-label">User Management</div>
              <div className="stat-card-value">Kelola user</div>
            </div>
          </div>
        </Link>
        <Link to="/admin/roles" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="stat-card">
            <div className="stat-card-icon green">&#128274;</div>
            <div>
              <div className="stat-card-label">Role & Permission</div>
              <div className="stat-card-value">Akses & wewenang</div>
            </div>
          </div>
        </Link>
        <Link to="/admin/content" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="stat-card">
            <div className="stat-card-icon yellow">&#128196;</div>
            <div>
              <div className="stat-card-label">Konten</div>
              <div className="stat-card-value">Berita & kegiatan</div>
            </div>
          </div>
        </Link>
        <Link to="/admin/menus" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="stat-card">
            <div className="stat-card-icon red">&#9776;</div>
            <div>
              <div className="stat-card-label">Menu</div>
              <div className="stat-card-value">Navigasi portal</div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
