import { useState, useEffect } from "react";

const API = "/api";

export type SocialMediaItem = { id: string; platform: string; url: string; sortOrder: number };

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  twitter: "Twitter / X",
  facebook: "Facebook",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  web: "Website",
};

function getIcon(platform: string): string {
  switch (platform) {
    case "instagram":
    case "tiktok":
      return "photo_camera";
    case "youtube":
      return "play_circle";
    case "linkedin":
      return "work";
    case "twitter":
    case "facebook":
      return "share";
    default:
      return "link";
  }
}

type Props = {
  items: SocialMediaItem[];
  className?: string;
  iconClassName?: string;
};

export function SocialMediaLinks({ items, className = "flex gap-4", iconClassName = "w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all" }: Props) {
  if (items.length === 0) return null;
  return (
    <div className={className}>
      {items.map((item) => (
        <a
          key={item.id}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={iconClassName}
          aria-label={PLATFORM_LABELS[item.platform] ?? item.platform}
        >
          <span className="material-symbols-outlined text-lg">{getIcon(item.platform)}</span>
        </a>
      ))}
    </div>
  );
}

export function useSocialMedia() {
  const [items, setItems] = useState<SocialMediaItem[]>([]);
  useEffect(() => {
    fetch(`${API}/content/social-media`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);
  return items;
}
