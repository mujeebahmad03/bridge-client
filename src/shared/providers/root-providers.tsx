"use client";

import type { ReactNode } from "react";

import { ScrollToTop } from "@/ui/scroll-to-top";
import { Toaster } from "@/ui/sonner";

import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";

export const RootProviders = ({ children }: { children: ReactNode }) => {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <ScrollToTop />
      </ThemeProvider>
      <Toaster
        position="top-center"
        toastOptions={{ duration: 3000 }}
        richColors
      />
    </QueryProvider>
  );
};
