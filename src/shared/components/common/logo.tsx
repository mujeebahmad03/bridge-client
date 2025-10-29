"use client";

import { useTheme } from "next-themes";

interface LogoProps {
  isDark?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "sm", className = "" }: LogoProps) {
  const { theme } = useTheme();

  const isDark = theme !== "light";

  const sizes = {
    sm: { bar: "w-1.5 h-12", text: "text-3xl", gap: "gap-2" },
    md: { bar: "w-2 h-20", text: "text-6xl", gap: "gap-4" },
    lg: { bar: "w-2.5 h-28", text: "text-8xl", gap: "gap-6" },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center ${currentSize.gap} ${className}`}>
      {/* Three Vertical Bars */}
      <div className="flex items-end gap-1.5">
        <div
          suppressHydrationWarning
          className={`${currentSize.bar} rounded-full transition-all duration-300 ${
            isDark
              ? "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
              : "bg-blue-800"
          }`}
          style={{ transform: "translateY(0px)" }}
        />
        <div
          suppressHydrationWarning
          className={`${currentSize.bar} rounded-full transition-all duration-300 ${
            isDark
              ? "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
              : "bg-blue-800"
          }`}
          style={{ transform: "translateY(10px)" }}
        />
        <div
          suppressHydrationWarning
          className={`${currentSize.bar} rounded-full transition-all duration-300 ${
            isDark
              ? "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
              : "bg-blue-800"
          }`}
          style={{ transform: "translateY(20px)" }}
        />
      </div>

      {/* Bridge Text */}
      <h1
        suppressHydrationWarning
        className={`${currentSize.text} font-bold tracking-tight transition-colors duration-300 ${
          isDark ? "text-white" : "text-black"
        }`}
        style={{
          fontFamily: "var(--font-sans)",
          transform: "translateY(20px)",
        }}
      >
        Bridge
      </h1>
    </div>
  );
}
