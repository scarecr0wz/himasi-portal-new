import { useEffect } from "react";

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
}

export default function SEO({
    title,
    description,
    image,
    url = window.location.href,
    type = "article"
}: SEOProps) {
    const defaultTitle = "HIMASI Portal — Universitas Terbuka Bogor";
    const defaultDescription = "Portal Resmi Himpunan Mahasiswa Sistem Informasi (HIMASI) Universitas Terbuka Bogor.";
    const siteName = "HIMASI UT Bogor";

    useEffect(() => {
        // 1. Update Title
        const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
        document.title = finalTitle;

        // 2. Helper to get/create meta tags
        const updateMeta = (name: string, content: string, isProperty: boolean = false) => {
            if (!content) return;

            const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
            let element = document.querySelector(selector);

            if (!element) {
                element = document.createElement("meta");
                if (isProperty) {
                    element.setAttribute("property", name);
                } else {
                    element.setAttribute("name", name);
                }
                document.head.appendChild(element);
            }
            element.setAttribute("content", content);
        };

        // 3. Update Standard Meta Tags
        updateMeta("description", description || defaultDescription);

        // 4. Update Open Graph (Facebook, WhatsApp, etc.)
        updateMeta("og:title", finalTitle, true);
        updateMeta("og:description", description || defaultDescription, true);
        updateMeta("og:type", type, true);
        updateMeta("og:url", url, true);
        updateMeta("og:site_name", siteName, true);

        if (image) {
            // Ensure image URL is absolute
            const absoluteImage = image.startsWith('http')
                ? image
                : `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`;
            updateMeta("og:image", absoluteImage, true);
        }

        // 5. Update Twitter Cards
        updateMeta("twitter:card", "summary_large_image");
        updateMeta("twitter:title", finalTitle);
        updateMeta("twitter:description", description || defaultDescription);
        if (image) {
            const absoluteImage = image.startsWith('http')
                ? image
                : `${window.location.origin}${image.startsWith('/') ? '' : '/'}${image}`;
            updateMeta("twitter:image", absoluteImage);
        }

        // Optional: Cleanup if needed on unmount (though usually we want to keep them until next page)
    }, [title, description, image, url, type]);

    return null; // This component doesn't render anything
}
