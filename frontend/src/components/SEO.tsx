import { useEffect } from "react";

/** Strip markdown untuk SEO description (og:description, meta description). */
export function stripMarkdownForSEO(md: string): string {
  return md
    .replace(/!\[.*?\]\(.*?\)/g, "") // hapus ![alt](url)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // [text](url) -> text
    .replace(/[*_~`#>|-]/g, "") // formatting
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate teks untuk description, tambah "..." hanya jika dipotong. */
export function truncateDescription(text: string, maxLength: number = 155): string {
  const cleaned = text.trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trim() + "...";
}

const DEFAULT_OG_IMAGE = "https://placehold.co/1200x630/1e3a5f/ffffff?text=HIMASI+UT+Bogor";

function toAbsoluteImageUrl(img: string): string {
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  const origin = window.location.origin;
  const path = img.startsWith("/") ? img : `/${img}`;
  return `${origin}${path}`;
}

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  defaultImage?: string;
  url?: string;
  type?: string;
}

export default function SEO({
  title,
  description,
  image,
  defaultImage = DEFAULT_OG_IMAGE,
  url = typeof window !== "undefined" ? window.location.href : "",
  type = "article",
}: SEOProps) {
  const defaultTitle = "HIMASI Portal — Universitas Terbuka Bogor";
  const defaultDescription =
    "Portal Resmi Himpunan Mahasiswa Sistem Informasi (HIMASI) Universitas Terbuka Bogor.";
  const siteName = "HIMASI UT Bogor";

  useEffect(() => {
    const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
    document.title = finalTitle;

    const updateMeta = (name: string, content: string, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? "property" : "name";
      const selector = `meta[${attr}="${name}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    const finalDescription = description || defaultDescription;
    updateMeta("description", finalDescription);

    updateMeta("og:title", finalTitle, true);
    updateMeta("og:description", finalDescription, true);
    updateMeta("og:type", type, true);
    updateMeta("og:url", url, true);
    updateMeta("og:site_name", siteName, true);

    const finalImage = image || defaultImage;
    if (finalImage) {
      const absoluteImage = toAbsoluteImageUrl(finalImage);
      updateMeta("og:image", absoluteImage, true);
      if (absoluteImage.startsWith("https://")) {
        updateMeta("og:image:secure_url", absoluteImage, true);
      }
      updateMeta("og:image:width", "1200", true);
      updateMeta("og:image:height", "630", true);
    }

    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", finalTitle);
    updateMeta("twitter:description", finalDescription);
    updateMeta("twitter:site", "@himasi_utbogor"); // Atur jika ada akun twitter resmi
    if (finalImage) {
      updateMeta("twitter:image", toAbsoluteImageUrl(finalImage));
    }

    // Canonical link
    const updateLink = (rel: string, href: string) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };
    updateLink("canonical", url);

    // Lang
    document.documentElement.lang = "id";
  }, [title, description, image, defaultImage, url, type]);

  return null;
}
