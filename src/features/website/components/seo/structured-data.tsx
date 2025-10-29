/* eslint-disable react/no-danger */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

interface StructuredDataProps {
  type: "Article" | "Product" | "Service" | "FAQ" | "Review";
  data: Record<string, any>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(baseSchema) }}
    />
  );
}

// Specific structured data components
export function ProductSchema({
  name,
  description,
  price,
  currency = "USD",
  availability = "InStock",
  rating,
  reviewCount,
}: {
  name: string;
  description: string;
  price?: string;
  currency?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
}) {
  const productData = {
    name,
    description,
    brand: {
      "@type": "Brand",
      name: "Bridge",
    },
    ...(price && {
      offers: {
        "@type": "Offer",
        price,
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
      },
    }),
    ...(rating &&
      reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating,
          reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };

  return <StructuredData type="Product" data={productData} />;
}

export function ServiceSchema({
  name,
  description,
  provider = "Bridge",
  areaServed = "Worldwide",
}: {
  name: string;
  description: string;
  provider?: string;
  areaServed?: string;
}) {
  const serviceData = {
    name,
    description,
    provider: {
      "@type": "Organization",
      name: provider,
    },
    areaServed,
    serviceType: "Software as a Service (SaaS)",
  };

  return <StructuredData type="Service" data={serviceData} />;
}
