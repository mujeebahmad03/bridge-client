"use client";

import { useEffect } from "react";

export function PerformanceOptimizations() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload Montserrat font files
      const fontWeights = [
        {
          weight: "400",
          url: "https://fonts.gstatic.com/s/inter/v25/JTUSjIg1_i6t8kCHKm459WlhyyTh89Y.woff2",
        },
        {
          weight: "600",
          url: "https://fonts.gstatic.com/s/inter/v25/JTUSjIg1_i6t8kCHKm459WdhyyTh89Y.woff2",
        },
        {
          weight: "700",
          url: "https://fonts.gstatic.com/s/inter/v25/JTUSjIg1_i6t8kCHKm459WZhyyTh89Y.woff2",
        },
      ];

      fontWeights.forEach(({ url }) => {
        const fontLink = document.createElement("link");
        fontLink.rel = "preload";
        fontLink.href = url;
        fontLink.as = "font";
        fontLink.type = "font/woff2";
        fontLink.crossOrigin = "anonymous";
        document.head.appendChild(fontLink);
      });
    };

    // Optimize images with lazy loading
    const optimizeImages = () => {
      if ("IntersectionObserver" in window) {
        const images = document.querySelectorAll("img[data-src]");
        const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.classList.remove("lazy");
                imageObserver.unobserve(img);
              }
            }
          });
        });

        images.forEach((img) => imageObserver.observe(img));
      }
    };

    // Defer non-critical JavaScript (only if in production)
    const deferNonCriticalJS = () => {
      if (
        typeof window !== "undefined" &&
        window.location.hostname !== "localhost"
      ) {
        // Only load analytics in production
        const gtag = document.createElement("script");
        gtag.src =
          "https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID";
        gtag.async = true;
        gtag.defer = true;
        document.body.appendChild(gtag);

        // Initialize Google Analytics
        const gtagInit = document.createElement("script");
        gtagInit.innerHTML = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'GA_MEASUREMENT_ID');
        `;
        document.body.appendChild(gtagInit);
      }
    };

    // Run optimizations
    preloadCriticalResources();
    optimizeImages();

    // Defer non-critical resources
    setTimeout(deferNonCriticalJS, 2000);
  }, []);

  return null;
}
