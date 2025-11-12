"use client";

import { IconHome } from "@tabler/icons-react";
import { useState } from "react";

import { DASHBOARD_ROUTES } from "@/config/app-route";
import { useAuth } from "@/hooks/use-auth";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { DashboardTable, SectionCards } from "@/dashboard/components";
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
  const { user } = useAuth();
  // Initialize showOnboarding based on whether value exists
  const [showOnboarding, setShowOnboarding] = useState(!!value);

  const handleClose = () => {
    setShowOnboarding(false);
    removeValue(); // remove from local storage
  };

  return (
    <DashboardContent breadcrumbs={breadcrumbs} currentPage="Overview">
      <h1 className="text-2xl font-bold">Welcome {user?.first_name}!</h1>
      <SectionCards />
      <DashboardTable />
      {showOnboarding && <OnboardingModal onClose={handleClose} />}
    </DashboardContent>
  );
}
