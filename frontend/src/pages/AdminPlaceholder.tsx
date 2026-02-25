import { useLocation, Link } from "react-router-dom";

const titles: Record<string, string> = {
  users: "User Administrasi Portal",
  mahasiswa: "Data Mahasiswa",
  roles: "Role & Permission",
  content: "Konten (Berita & Kegiatan)",
  menus: "Menu",
};

const subtitles: Record<string, string> = {
  users: "Kelola akun yang dapat mengakses konsol admin (role admin/superadmin).",
  mahasiswa: "Kelola data mahasiswa: NIM, nama, angkatan, departemen, dan akun portal.",
  roles: "Atur role dan permission untuk user administrasi portal.",
  content: "Berita, kegiatan, departemen, program kerja, FAQ.",
  menus: "Struktur menu navigasi portal.",
};

export default function AdminPlaceholder() {
  const loc = useLocation();
  const key = loc.pathname.replace(/^\/admin\/?/, "").split("/")[0] || "dashboard";
  const title = titles[key] ?? "Administrasi";
  const subtitle = subtitles[key] ?? "Fitur dalam pengembangan. CRUD akan ditambahkan di sini.";

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
      <p className="section-subtitle">{subtitle}</p>
    </>
  );
}
