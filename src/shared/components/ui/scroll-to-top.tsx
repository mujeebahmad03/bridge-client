"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

// Optimized scroll-to-top with improved progress ring and arrow visibility
const ScrollToTopComponent = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const updateScrollState = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min((scrollTop / docHeight) * 100, 100);

    setScrollProgress(progress);
    setIsVisible(scrollTop > 300);
  }, []);

  useEffect(() => {
    let rafId: number;
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        rafId = requestAnimationFrame(updateScrollState);
      }, 16); // ~60fps
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Defer the initial state update to avoid calling setState synchronously inside the effect.
    rafId = requestAnimationFrame(updateScrollState);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, [updateScrollState]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="relative">
            {/* Progress ring positioned at the edge of the button */}
            <svg
              className="absolute -inset-1 h-14 w-14 -rotate-90"
              viewBox="0 0 56 56"
              style={{
                filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))",
              }}
            >
              {/* Background circle */}
              <circle
                cx="28"
                cy="28"
                r="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted-foreground/20 dark:text-muted-foreground/30"
              />
              {/* Progress circle */}
              <circle
                cx="28"
                cy="28"
                r="26"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-primary transition-all duration-200 dark:text-primary"
                style={{
                  strokeDasharray: `${2 * Math.PI * 26}`,
                  strokeDashoffset: `${2 * Math.PI * 26 * (1 - scrollProgress / 100)}`,
                  transition: "stroke-dashoffset 0.1s ease-out",
                }}
              />
            </svg>

            {/* Button */}
            <Button
              onClick={scrollToTop}
              size="icon"
              className="relative h-12 w-12 rounded-full border border-border/50 bg-background/95 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-background active:scale-95 dark:bg-slate-800/95 dark:hover:bg-slate-800"
            >
              <ArrowUp className="h-5 w-5 text-foreground transition-colors duration-200 dark:text-foreground" />
              <span className="sr-only">Scroll to top</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
ScrollToTopComponent.displayName = "ScrollToTopComponent";

export { ScrollToTopComponent as ScrollToTop };
