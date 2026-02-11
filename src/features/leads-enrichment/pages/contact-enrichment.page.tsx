"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

import {
  ContactNavbar,
  ContactTable,
  ContactTableLoadingBody,
} from "@/leads/components/contacts";
import { useContactsTableStore } from "@/leads/stores";
import type { EnrichmentPresetValue } from "@/leads/types";

export const ContactEnrichmentPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const openEnrichmentWithPreset = useContactsTableStore(
    (s) => s.openEnrichmentWithPreset
  );
  const hasHandledPresetRef = useRef(false);

  useEffect(() => {
    if (hasHandledPresetRef.current) {
      return;
    }
    const tag = searchParams.get("tag");
    const preset = searchParams.get("preset");
    if (tag && preset) {
      hasHandledPresetRef.current = true;
      openEnrichmentWithPreset(preset as EnrichmentPresetValue);
      const next = `${pathname}?tag=${encodeURIComponent(tag)}`;
      router.replace(next);
    }
  }, [searchParams, pathname, router, openEnrichmentWithPreset]);

  return (
    <div className="flex flex-col h-full">
      <ContactNavbar />

      <div className="space-y-4 p-4 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Contacts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your contact list with inline editing
          </p>
        </div>

        <Suspense fallback={<ContactTableLoadingBody dataColumnsCount={10} />}>
          <ContactTable />
        </Suspense>
      </div>
    </div>
  );
};
