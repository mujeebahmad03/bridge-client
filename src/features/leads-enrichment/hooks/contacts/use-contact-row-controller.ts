import { useCallback } from "react";

import { useContactsTableStore } from "@/leads/stores";
import type { ContactFieldId } from "@/leads/types";

export function useContactRowController(contactId: string) {
  const isSelected = useContactsTableStore((s) =>
    s.selectedRowIds.has(contactId)
  );

  const handleToggleSelection = useCallback(() => {
    useContactsTableStore.getState().toggleRowSelection(contactId);
  }, [contactId]);

  const handleCellClick = useCallback(
    (columnId: ContactFieldId) => {
      useContactsTableStore
        .getState()
        .setActiveCell({ rowId: contactId, columnId });
    },
    [contactId]
  );

  return {
    isSelected,
    handleToggleSelection,
    handleCellClick,
  };
}
