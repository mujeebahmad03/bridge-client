import { type ReactNode } from "react";

import { requireGuest } from "@/lib/server-auth";

import { AuthLayout } from "@/auth/components";

/**
 * Server-side layout guard for auth pages (login, sign-up, verify, etc.)
 * Redirects to dashboard if user is already authenticated
 */
export default async function AuthPageLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Redirect to dashboard if already authenticated
  await requireGuest();

  return <AuthLayout>{children}</AuthLayout>;
}
