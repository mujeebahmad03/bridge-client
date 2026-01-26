import { useCallback } from "react";

import { useContactsTableStore } from "@/leads/stores";
import type { ContactColumn } from "@/leads/types";

export function useColumnHeaderActions(column: ContactColumn) {
  const sortColumn = useContactsTableStore((s) => s.sortColumn);
  const sortDirection = useContactsTableStore((s) => s.sortDirection);
  const toggleSortColumn = useContactsTableStore((s) => s.toggleSortColumn);
  const pinColumn = useContactsTableStore((s) => s.pinColumn);
  const unpinColumn = useContactsTableStore((s) => s.unpinColumn);

  const isSorted = sortColumn === column.id;
  const isAsc = isSorted && sortDirection === "asc";
  const isDesc = isSorted && sortDirection === "desc";

  const handleSortClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleSortColumn(column.id);
    },
    [column.id, toggleSortColumn]
  );

  const handlePinLeft = useCallback(() => {
    pinColumn(column.id, "left");
  }, [column.id, pinColumn]);

  const handlePinRight = useCallback(() => {
    pinColumn(column.id, "right");
  }, [column.id, pinColumn]);

  const handleUnpin = useCallback(() => {
    unpinColumn(column.id);
  }, [column.id, unpinColumn]);

  return {
    isSorted,
    isAsc,
    isDesc,
    handleSortClick,
    handlePinLeft,
    handlePinRight,
    handleUnpin,
  };
}
