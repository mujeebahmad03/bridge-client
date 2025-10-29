/* eslint-disable react/no-danger */
"use client";

export function JsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Bridge",
    description:
      "AI-powered sales platform for multichannel outreach and lead management",
    url: "https://bridgecms.io",
    logo: "https://bridgecms.io/logo.png",
    foundingDate: "2023",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-BRIDGE",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
    sameAs: [
      "https://twitter.com/BridgeSales",
      "https://linkedin.com/company/bridge-sales",
      "https://github.com/bridge-sales",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "San Francisco",
      addressRegion: "CA",
      addressCountry: "US",
    },
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Bridge AI Sales Platform",
    description:
      "AI-powered sales platform for multichannel outreach, lead management, and sales automation",
    url: "https://bridgecms.io",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free trial available",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "500",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "AI-powered message drafting",
      "Multichannel outreach automation",
      "Built-in CRM",
      "Real-time lead signals",
      "Email and LinkedIn integration",
      "Sales analytics and reporting",
    ],
    screenshot: "https://bridgecms.io/dashboard-preview.png",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Bridge - AI Sales Platform",
    url: "https://bridgecms.io",
    description:
      "AI-powered sales platform for multichannel outreach and lead management",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://bridgecms.io/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "Bridge",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://bridgecms.io",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Features",
        item: "https://bridgecms.io#features",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Pricing",
        item: "https://bridgecms.io#pricing",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Bridge AI Sales Platform?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bridge is an AI-powered sales platform that helps teams scale multichannel outreach, manage leads in one place, and close more deals faster through intelligent automation and personalized messaging.",
        },
      },
      {
        "@type": "Question",
        name: "How does Bridge's AI messaging work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bridge analyzes your communication style, contact data, and context to help you send outreach that feels personal and gets replies. It can draft messages that match your tone, personalize based on contact data, and auto-generate intros, follow-ups, and CTAs.",
        },
      },
      {
        "@type": "Question",
        name: "What channels does Bridge support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Bridge supports multichannel outreach including Email, LinkedIn, phone calls, and SMS. You can create automated sequences across all channels with intelligent timing and personalization.",
        },
      },
      {
        "@type": "Question",
        name: "Is there a free trial available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Bridge offers a free trial with no credit card required. You can start using the platform immediately to experience the AI-powered features and see results.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
