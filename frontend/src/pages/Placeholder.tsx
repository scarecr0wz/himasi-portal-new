import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  akademik: "Akademik",
  acara: "Acara",
  kehadiran: "Kehadiran",
  kas: "Kas",
  forum: "Ruang Terbuka",
  activities: "Aktivitas",
};

export default function Placeholder() {
  const loc = useLocation();
  const path = loc.pathname.replace(/^\/dashboard\/?/, "").split("/")[0]
    || loc.pathname.replace(/^\//, "").split("/")[0];
  const key = path || "dashboard";
  const title = titles[key] ?? "Halaman";

  return (
    <div>
      <h2 className="section-title">
        <span className="section-title-bar" />
        {title}
      </h2>
      <p className="section-subtitle">Fitur dalam pengembangan.</p>
    </div>
  );
}
