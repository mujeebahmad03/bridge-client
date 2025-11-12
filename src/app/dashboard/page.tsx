"use client";

import { IconHome } from "@tabler/icons-react";
import { useState } from "react";

import { DASHBOARD_ROUTES } from "@/config/app-route";
import { useLocalStorage } from "@/hooks/use-local-storage";

import {
  ChartAreaInteractive,
  DashboardTable,
  SectionCards,
} from "@/dashboard/components";
import { DashboardContent } from "@/layout/components";
import { type CrumbItem } from "@/layout/types";
import { OnboardingModal } from "@/onboarding/components";

const breadcrumbs: CrumbItem[] = [
  {
    title: "Home",
    url: DASHBOARD_ROUTES.OVERVIEW,
    icon: IconHome,
  },
];

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
    <DashboardContent breadcrumbs={breadcrumbs} currentPage="Overview">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DashboardTable />
      {showOnboarding && <OnboardingModal onClose={handleClose} />}
    </DashboardContent>
  );
}
