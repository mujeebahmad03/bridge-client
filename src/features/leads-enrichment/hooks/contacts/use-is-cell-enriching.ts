"use client";

import { useContactsTableStore } from "@/leads/stores";

/**
 * Returns true if the given (contactId, columnId) cell is currently being enriched
 * (part of an active enrichment for that column). Used to show skeleton and disable the cell.
 */
export function useIsCellEnriching(
  contactId: string,
  columnId: string
): boolean {
  return useContactsTableStore((state) =>
    state.activeEnrichments.some(
      (e) => e.columnId === columnId && e.contactIds.includes(contactId)
    )
  );
}
