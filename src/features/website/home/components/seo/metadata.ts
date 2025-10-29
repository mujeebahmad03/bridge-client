import { type Metadata } from "next";

export async function generateMetaData(): Promise<Metadata> {
  return {
    metadataBase: new URL("https://bridgecms.io"),
    title: {
      default:
        "Bridge - AI-Powered Sales Platform | Get More Replies, Book More Meetings, Close More Deals",
      template: "%s | Bridge - AI Sales Platform",
    },
    description:
      "Scale multichannel outreach, manage leads in one place, and close more deals faster with Bridge's AI-powered sales platform. Used by 500+ sales teams worldwide.",
    keywords: [
      "AI sales platform",
      "sales automation",
      "multichannel outreach",
      "CRM software",
      "lead generation",
      "email marketing",
      "LinkedIn automation",
      "sales pipeline",
      "AI messaging",
      "sales analytics",
      "outbound sales",
      "sales engagement platform",
    ],
    authors: [{ name: "Bridge Team" }],
    creator: "Bridge",
    publisher: "Bridge",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://bridgecms.io",
      siteName: "Bridge - AI Sales Platform",
      title:
        "Bridge - AI-Powered Sales Platform | Get More Replies, Book More Meetings",
      description:
        "Scale multichannel outreach, manage leads in one place, and close more deals faster with Bridge's AI-powered sales platform. Used by 500+ sales teams worldwide.",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Bridge AI Sales Platform Dashboard",
          type: "image/png",
        },
        {
          url: "/og-image-square.png",
          width: 1200,
          height: 1200,
          alt: "Bridge AI Sales Platform Logo",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@BridgeSales",
      creator: "@BridgeSales",
      title: "Bridge - AI-Powered Sales Platform",
      description:
        "Scale multichannel outreach and close more deals faster with AI-powered sales automation.",
      images: ["/twitter-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
      other: [
        { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#3b82f6" },
      ],
    },
    manifest: "/site.webmanifest",
    alternates: {
      canonical: "https://bridgecms.io",
      languages: {
        "en-US": "https://bridgecms.io",
        "en-GB": "https://bridgecms.io/en-gb",
      },
    },
    verification: {
      google: "your-google-verification-code",
      yandex: "your-yandex-verification-code",
      yahoo: "your-yahoo-verification-code",
    },
    category: "technology",
    classification: "Business Software",
    other: {
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "apple-mobile-web-app-title": "Bridge",
      "application-name": "Bridge",
      "msapplication-TileColor": "#3b82f6",
      "msapplication-config": "/browserconfig.xml",
    },
  };
}
