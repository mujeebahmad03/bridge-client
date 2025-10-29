"use client";

import Head from "next/head";

interface SEOHeadProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export function SEOHead({
  title,
  description,
  canonical,
  ogImage = "/og-image.png",
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = title
    ? `${title} | Bridge - AI Sales Platform`
    : "Bridge - AI-Powered Sales Platform | Get More Replies, Book More Meetings, Close More Deals";

  const metaDescription =
    description ??
    "Scale multichannel outreach, manage leads in one place, and close more deals faster with Bridge's AI-powered sales platform. Used by 500+ sales teams worldwide.";

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />

      {canonical && <link rel="canonical" href={canonical} />}

      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional meta tags */}
      <meta name="author" content="Bridge Team" />
      <meta name="publisher" content="Bridge" />
      <meta
        name="copyright"
        content={`© ${new Date().getFullYear()} Bridge. All rights reserved.`}
      />
    </Head>
  );
}
