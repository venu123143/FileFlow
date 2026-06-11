import { SITE, absoluteUrl, pageTitle } from "@/lib/seo";

type SeoProps = {
  /** Page title without the brand suffix, e.g. "Sign in". Omit on the home page. */
  title?: string;
  description?: string;
  /** Path for the canonical URL, e.g. "/login". Defaults to "/". */
  path?: string;
  /** Absolute or root-relative image URL for social cards. */
  image?: string;
  /** Set on private/auth-gated/error pages so crawlers don't index them. */
  noindex?: boolean;
  /** Open Graph type. "website" for most pages. */
  type?: "website" | "article";
  /** Optional JSON-LD structured data object rendered inline. */
  jsonLd?: Record<string, unknown>;
};

/**
 * Per-route document metadata.
 *
 * Relies on React 19's native support for hoisting <title>, <meta> and <link>
 * to <head> — no react-helmet needed. Render <Seo /> anywhere in a route.
 */
export function Seo({ title, description = SITE.description, path = "/", image, noindex = false, type = "website", jsonLd }: SeoProps) {
  const fullTitle = pageTitle(title);
  const canonical = absoluteUrl(path);
  const ogImage = absoluteUrl(image ?? SITE.ogImage);
  const robots = noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large";

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={SITE.locale} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {SITE.twitter ? <meta name="twitter:site" content={SITE.twitter} /> : null}

      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </>
  );
}

export default Seo;
