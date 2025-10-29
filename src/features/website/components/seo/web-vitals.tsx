/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";

export function WebVitals() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    // Core Web Vitals tracking
    const trackWebVitals = async () => {
      try {
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import(
          "web-vitals"
        );

        const sendToAnalytics = (metric: any) => {
          // Send to your analytics service
          if (typeof window !== "undefined" && (window as any).gtag) {
            (window as any).gtag("event", metric.name, {
              event_category: "Web Vitals",
              event_label: metric.id,
              value: Math.round(
                metric.name === "CLS" ? metric.value * 1000 : metric.value
              ),
              non_interaction: true,
            });
          }
        };

        onCLS(sendToAnalytics);
        onINP(sendToAnalytics);
        onFCP(sendToAnalytics);
        onLCP(sendToAnalytics);
        onTTFB(sendToAnalytics);
      } catch (error) {
        console.warn("Web Vitals tracking failed:", error);
      }
    };

    trackWebVitals();
  }, []);

  return null;
}
