"use client";

import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  barClassName?: string;
  textClassName?: string;
  gapClassName?: string;
  barGapClassName?: string;
  showText?: boolean;
}

export function Logo({
  size = "sm",
  className = "",
  barClassName = "",
  textClassName = "",
  gapClassName = "",
  barGapClassName = "",
  showText = true,
}: LogoProps) {
  const { theme } = useTheme();

  const isDark = theme !== "light";

  const sizes = {
    sm: { bar: "w-1.5 h-12", text: "text-3xl", gap: "gap-2" },
    md: { bar: "w-2 h-20", text: "text-6xl", gap: "gap-4" },
    lg: { bar: "w-2.5 h-28", text: "text-8xl", gap: "gap-6" },
  };

  const currentSize = sizes[size];

  return (
    <div
      className={cn(
        "flex items-center",
        currentSize.gap,
        gapClassName,
        className
      )}
    >
      {/* Three Vertical Bars */}
      <div className={cn("flex items-end gap-1.5", barGapClassName)}>
        <div
          suppressHydrationWarning
          className={cn(
            currentSize.bar,
            "rounded-full transition-all duration-300",
            barClassName,
            isDark
              ? "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
              : "bg-blue-800"
          )}
          style={{ transform: "translateY(0px)" }}
        />
        <div
          suppressHydrationWarning
          className={cn(
            currentSize.bar,
            "rounded-full transition-all duration-300",
            barClassName,
            isDark
              ? "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
              : "bg-blue-800"
          )}
          style={{ transform: "translateY(10px)" }}
        />
        <div
          suppressHydrationWarning
          className={cn(
            currentSize.bar,
            "rounded-full transition-all duration-300",
            barClassName,
            isDark
              ? "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]"
              : "bg-blue-800"
          )}
          style={{ transform: "translateY(20px)" }}
        />
      </div>

      {/* Bridge Text */}
      {showText && (
        <h1
          suppressHydrationWarning
          className={cn(
            currentSize.text,
            "font-bold tracking-tight transition-colors duration-300",
            textClassName,
            isDark ? "text-white" : "text-black"
          )}
          style={{
            fontFamily: "var(--font-sans)",
            transform: "translateY(20px)",
          }}
        >
          Bridge
        </h1>
      )}
    </div>
  );
}
