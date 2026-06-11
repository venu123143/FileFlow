// Central SEO configuration for FileFlow.
// Update SITE_URL / social handles here and everything else (canonical URLs,
// Open Graph tags, sitemap, manifest) stays consistent.

export const SITE = {
  name: "FileFlow",
  /** Production origin — no trailing slash. */
  url: "https://fileflow.nerchuko.in",
  shortDescription: "Modern, cloud-based file management.",
  description:
    "FileFlow is a modern, cloud-based file management system. Upload, organize, share, and manage your files, videos, images, and documents with real-time notifications and advanced access control.",
  /** 1200x630 social-share image, served from /public. Replace with a real asset. */
  ogImage: "/og-image.png",
  locale: "en_US",
  themeColor: "#0f172a",
  twitter: "@fileflow", // change or remove if you don't have a handle
  keywords: [
    "file management",
    "cloud storage",
    "file sharing",
    "upload files",
    "document management",
    "video hosting",
    "image gallery",
    "FileFlow",
    "file flow nerchuko"
  ],
} as const;

/** Build an absolute URL from a path for canonical/OG tags. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Compose a page title: "Page Title · FileFlow" (or just the site name for home). */
export function pageTitle(title?: string): string {
  return title ? `${title} · ${SITE.name}` : `${SITE.name} — ${SITE.shortDescription}`;
}
