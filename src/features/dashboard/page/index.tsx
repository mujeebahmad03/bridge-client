"use client";

import { useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { useLocalStorage } from "@/hooks/use-local-storage";

import { DashboardTable, SectionCards } from "@/dashboard/components";
import { OnboardingModal } from "@/onboarding/components";

export function DashboardPage() {
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
    <>
      <h1 className="text-2xl font-bold">Welcome {user?.first_name}!</h1>
      <SectionCards />
      <DashboardTable />
      {showOnboarding && <OnboardingModal onClose={handleClose} />}
    </>
  );
}
