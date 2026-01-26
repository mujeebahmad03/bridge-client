import { type ReactNode } from "react";

import { requireAuth } from "@/lib/server-auth";

/**
 * Server-side layout guard for all dashboard routes
 * Enforces authentication without wrapping children in MainLayout
 * (MainLayout should be added per-page or per-segment as needed)
 */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Redirect to login if not authenticated
  await requireAuth();

  return <>{children}</>;
}
