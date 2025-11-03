"use client";

import { useState } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { useLocalStorage } from "@/hooks/use-local-storage";

import data from "./data.json";
import {
  AppSidebar,
  ChartAreaInteractive,
  DataTable,
  SectionCards,
  SiteHeader,
} from "@/layout/components";
import { OnboardingModal } from "@/onboarding/components";

export default function Page() {
  const { removeValue, value } = useLocalStorage<{ email: string } | null>(
    "emailForVerification",
    null
  );

  // Initialize showOnboarding based on whether value exists
  const [showOnboarding, setShowOnboarding] = useState(!!value);

  const handleClose = () => {
    setShowOnboarding(false);
    removeValue(); // remove from local storage
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>

      {showOnboarding && <OnboardingModal onClose={handleClose} />}
    </SidebarProvider>
  );
}
