type DepartmentLogoProps = {
  title: string;
  icon?: string;
  className?: string;
};

const LOGO_RULES: Array<[string[], string]> = [
  [["akademik", "keilmuan"], "/departement-logs/akademik-keilmuan.jpeg"],
  [["media", "publikasi"], "/departement-logs/media-publikasi.jpeg"],
  [["olahraga", "seni", "kesenian"], "/departement-logs/olahraga-seni.jpeg"],
  [["acara", "humas", "inventaris"], "/departement-logs/acara-inventaris.jpeg"],
  [["psdm", "kehumasan"], "/departement-logs/psdm-kehumasan.jpeg"],
];

export function departmentLogoUrl(title: string): string | null {
  const normalizedTitle = title.toLocaleLowerCase("id-ID");
  const match = LOGO_RULES.find(([keywords]) => keywords.some((keyword) => normalizedTitle.includes(keyword)));
  return match?.[1] ?? null;
}

export default function DepartmentLogo({ title, icon = "folder", className = "" }: DepartmentLogoProps) {
  const logo = departmentLogoUrl(title);

  if (logo) {
    return (
      <img
        src={logo}
        alt={`Logo ${title}`}
        className={`department-logo ${className}`.trim()}
        loading="lazy"
      />
    );
  }

  const materialIcon = icon.match(/^[a-z0-9_]+$/) ? icon : "folder";
  return (
    <span className={`material-symbols-outlined ${className}`.trim()} aria-hidden="true">
      {materialIcon}
    </span>
  );
}
