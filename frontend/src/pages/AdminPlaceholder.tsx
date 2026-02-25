import { useLocation, Link } from "react-router-dom";

const titles: Record<string, string> = {
  users: "User Management",
  roles: "Role & Permission",
  content: "Konten (Berita & Kegiatan)",
  menus: "Menu",
};

export default function AdminPlaceholder() {
  const loc = useLocation();
  const key = loc.pathname.replace(/^\/admin\/?/, "").split("/")[0] || "dashboard";
  const title = titles[key] ?? "Administrasi";

  return (
    <>
      <nav className="dashboard-breadcrumb">
        <Link to="/admin">Admin</Link>
        <span> &gt; {title}</span>
      </nav>
      <h2 className="section-title">
        <span className="section-title-bar" />
        {title}
      </h2>
      <p className="section-subtitle">Fitur dalam pengembangan. CRUD akan ditambahkan di sini.</p>
    </>
  );
}
