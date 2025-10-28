"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { ScrollToTop } from "@/ui/scroll-to-top";
import { Toaster } from "@/ui/sonner";

import { ThemeProvider } from "./theme-provider";

const queryClient = new QueryClient();

export const RootProviders = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
};
