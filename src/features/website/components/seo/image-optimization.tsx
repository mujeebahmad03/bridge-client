"use client";

import { useEffect } from "react";

export function ImageOptimization() {
  useEffect(() => {
    // Implement progressive image loading
    const implementProgressiveLoading = () => {
      const images = document.querySelectorAll("img[data-src]");

      if ("IntersectionObserver" in window) {
        const imageObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;

                // Create a low-quality placeholder
                const placeholder = new Image();
                placeholder.src = img.dataset.placeholder ?? "";
                placeholder.className = "loading-skeleton";

                // Load the high-quality image
                const highQualityImg = new Image();
                highQualityImg.onload = () => {
                  img.src = highQualityImg.src;
                  img.classList.remove("loading-skeleton");
                  img.classList.add("loaded");
                };
                highQualityImg.src = img.dataset.src ?? "";

                imageObserver.unobserve(img);
              }
            });
          },
          {
            rootMargin: "50px 0px",
            threshold: 0.01,
          }
        );

        images.forEach((img) => imageObserver.observe(img));
      } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach((img) => {
          const imgElement = img as HTMLImageElement;
          imgElement.src = imgElement.dataset.src ?? "";
        });
      }
    };

    // Add WebP support detection
    const addWebPSupport = () => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        document.documentElement.classList.add(
          webP.height === 2 ? "webp" : "no-webp"
        );
      };
      webP.src =
        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    };

    implementProgressiveLoading();
    addWebPSupport();
  }, []);

  return null;
}
