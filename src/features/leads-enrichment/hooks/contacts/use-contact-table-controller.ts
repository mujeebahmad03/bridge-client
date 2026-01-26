"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useEffect, useMemo, useRef } from "react";

import {
  useContactColumnsQuery,
  useContactsQuery,
  useUpdateContactFieldMutation,
} from "./use-contacts-api";
import { getContactFieldValue } from "@/leads/services";
import { useContactsTableStore } from "@/leads/stores";
import type { Contact, ContactColumn } from "@/leads/types";

const ROW_HEIGHT = 20;

export function useContactTableController() {
  // Store selectors
  const searchValue = useContactsTableStore((s) => s.searchValue);
  const visibleColumnIds = useContactsTableStore((s) => s.visibleColumnIds);
  const selectedRowIds = useContactsTableStore((s) => s.selectedRowIds);
  const isColumnSheetOpen = useContactsTableStore((s) => s.isColumnSheetOpen);
  const sortColumn = useContactsTableStore((s) => s.sortColumn);
  const sortDirection = useContactsTableStore((s) => s.sortDirection);
  const columnOrder = useContactsTableStore((s) => s.columnOrder);
  const pinnedColumns = useContactsTableStore((s) => s.pinnedColumns);
  const columnWidths = useContactsTableStore((s) => s.columnWidths);

  const openAddColumnSheet = useContactsTableStore((s) => s.openAddColumnSheet);
  const openEditColumnSheet = useContactsTableStore(
    (s) => s.openEditColumnSheet
  );
  const setNavigationModel = useContactsTableStore((s) => s.setNavigationModel);
  const selectAllRows = useContactsTableStore((s) => s.selectAllRows);
  const clearSelection = useContactsTableStore((s) => s.clearSelection);

  // React Query hooks
  const { data: contacts = [] } = useContactsQuery({ search: searchValue });
  const { data: columns = [] } = useContactColumnsQuery();

  // Sort contacts based on sortColumn and sortDirection
  const sortedContacts = useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return contacts;
    }

    return [...contacts].sort((a, b) => {
      const aValue = getContactFieldValue(a, sortColumn);
      const bValue = getContactFieldValue(b, sortColumn);

      // Handle null/undefined
      if (aValue === null && bValue === null) {
        return 0;
      }
      if (aValue === null) {
        return 1;
      }
      if (bValue === null) {
        return -1;
      }

      // Type-specific comparison
      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue, undefined, {
          sensitivity: "base",
        });
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [contacts, sortColumn, sortDirection]);

  // Separate columns into pinned left, unpinned, and pinned right
  const { pinnedLeftColumns, unpinnedColumns, pinnedRightColumns } =
    useMemo(() => {
      // Filter only visible data columns (exclude selector/add columns)
      const dataColumns = columns.filter((c) => visibleColumnIds.has(c.id));

      const pinnedLeft = dataColumns
        .filter((c) => pinnedColumns.left.includes(c.id))
        .sort(
          (a, b) =>
            pinnedColumns.left.indexOf(a.id) - pinnedColumns.left.indexOf(b.id)
        );

      const pinnedRight = dataColumns
        .filter((c) => pinnedColumns.right.includes(c.id))
        .sort(
          (a, b) =>
            pinnedColumns.right.indexOf(a.id) -
            pinnedColumns.right.indexOf(b.id)
        );

      const unpinned = dataColumns
        .filter(
          (c) =>
            !pinnedColumns.left.includes(c.id) &&
            !pinnedColumns.right.includes(c.id)
        )
        .sort((a, b) => {
          const aIndex = columnOrder.indexOf(a.id);
          const bIndex = columnOrder.indexOf(b.id);
          // If column not in order, add to end
          if (aIndex === -1 && bIndex === -1) {
            return 0;
          }
          if (aIndex === -1) {
            return 1;
          }
          if (bIndex === -1) {
            return -1;
          }
          return aIndex - bIndex;
        });

      return {
        pinnedLeftColumns: pinnedLeft,
        unpinnedColumns: unpinned,
        pinnedRightColumns: pinnedRight,
      };
    }, [columns, visibleColumnIds, pinnedColumns, columnOrder]);

  // Combined visible columns list (for backward compatibility)
  const visibleColumnsList = useMemo(
    () => [...pinnedLeftColumns, ...unpinnedColumns, ...pinnedRightColumns],
    [pinnedLeftColumns, unpinnedColumns, pinnedRightColumns]
  );

  const allSelected = useMemo(
    () =>
      contacts.length > 0 && contacts.every((c) => selectedRowIds.has(c.id)),
    [contacts, selectedRowIds]
  );

  const someSelected = useMemo(
    () => contacts.some((c) => selectedRowIds.has(c.id)) && !allSelected,
    [contacts, selectedRowIds, allSelected]
  );

  // Refs
  const tableRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<Contact[]>(contacts);

  // Update contacts ref when sorted contacts change
  useEffect(() => {
    contactsRef.current = sortedContacts;
  }, [sortedContacts]);

  // Virtualization
  const virtualizer = useVirtualizer({
    count: sortedContacts.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualItems[0]?.start ?? 0;
  const paddingBottom =
    totalSize - (virtualItems[virtualItems.length - 1]?.end ?? totalSize);

  // Sync columnOrder with available columns (add new columns to end)
  useEffect(() => {
    const store = useContactsTableStore.getState();
    const currentOrder = store.columnOrder;
    const dataColumnIds = columns.map((c) => c.id);
    const newColumns = dataColumnIds.filter((id) => !currentOrder.includes(id));
    if (newColumns.length > 0) {
      store.setColumnOrder([...currentOrder, ...newColumns]);
    }
  }, [columns]);

  // Update navigation model in store
  useEffect(() => {
    setNavigationModel({
      contactIds: sortedContacts.map((c) => c.id),
      columnIds: visibleColumnsList.map((c) => c.id),
    });
  }, [sortedContacts, visibleColumnsList, setNavigationModel]);

  // Edit commit handler
  const updateFieldMutation = useUpdateContactFieldMutation();
  const commitEdit = useCallback(() => {
    const state = useContactsTableStore.getState();
    if (!state.editingCell) {
      return;
    }

    updateFieldMutation.mutate({
      contactId: state.editingCell.rowId,
      fieldId: state.editingCell.columnId,
      value: state.editValue,
    });

    state.stopEditing();
  }, [updateFieldMutation]);

  // Handle click outside to commit edit
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        const { editingCell } = useContactsTableStore.getState();
        if (editingCell) {
          commitEdit();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [commitEdit]);

  // Scroll to active row on keyboard navigation
  useEffect(() => {
    const unsubscribe = useContactsTableStore.subscribe((state, prevState) => {
      if (state.activeCell === prevState.activeCell) {
        return;
      }
      const { activeCell } = state;
      if (!activeCell) {
        return;
      }
      const currentContacts = contactsRef.current;
      if (currentContacts.length === 0) {
        return;
      }
      const index = currentContacts.findIndex((c) => c.id === activeCell.rowId);
      if (index >= 0) {
        virtualizer.scrollToIndex(index, { align: "center" });
      }
    });
    return unsubscribe;
  }, [virtualizer]);

  // Handlers
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        selectAllRows(sortedContacts.map((c) => c.id));
      } else {
        clearSelection();
      }
    },
    [sortedContacts, selectAllRows, clearSelection]
  );

  // Handle column header keyboard events
  const handleColumnHeaderKeyDown = useCallback(
    (e: React.KeyboardEvent, column: ContactColumn) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openEditColumnSheet(column);
      }
    },
    [openEditColumnSheet]
  );

  // Handle add column header keyboard events
  const handleAddColumnHeaderKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openAddColumnSheet();
      }
    },
    [openAddColumnSheet]
  );

  // Handle table-level keyboard navigation when no cell is active
  const handleTableKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const state = useContactsTableStore.getState();
      if (
        !state.activeCell &&
        sortedContacts.length > 0 &&
        visibleColumnsList.length > 0
      ) {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)
        ) {
          e.preventDefault();
          state.setActiveCell({
            rowId: sortedContacts[0].id,
            columnId: visibleColumnsList[0].id,
          });
        }
      }
    },
    [sortedContacts, visibleColumnsList]
  );

  // Calculate left offset for pinned left columns
  const getLeftOffset = useCallback(
    (index: number) => {
      const selectorWidth = 60; // Selector column width
      const pinnedBefore = pinnedLeftColumns.slice(0, index);
      const totalWidth = pinnedBefore.reduce((sum, col) => {
        const width = columnWidths.get(col.id) ?? col.width ?? 120;
        return sum + width;
      }, 0);
      return selectorWidth + totalWidth;
    },
    [pinnedLeftColumns, columnWidths]
  );

  // Calculate right offset for pinned right columns
  const getRightOffset = useCallback(
    (index: number) => {
      const addColumnWidth = 50; // Add column width
      const pinnedAfter = pinnedRightColumns.slice(index + 1);
      const totalWidth = pinnedAfter.reduce((sum, col) => {
        const width = columnWidths.get(col.id) ?? col.width ?? 120;
        return sum + width;
      }, 0);
      return addColumnWidth + totalWidth;
    },
    [pinnedRightColumns, columnWidths]
  );

  return {
    // Data
    contacts: sortedContacts,
    visibleColumnsList,
    pinnedLeftColumns,
    unpinnedColumns,
    pinnedRightColumns,
    columns,

    // Virtualization
    virtualizer,
    virtualItems,
    paddingTop,
    paddingBottom,
    tableRef,
    scrollRef,

    // Selection state
    allSelected,
    someSelected,
    selectedRowIds,

    // UI state
    isColumnSheetOpen,

    // Handlers
    handleSelectAll,
    openAddColumnSheet,
    openEditColumnSheet,
    handleColumnHeaderKeyDown,
    handleAddColumnHeaderKeyDown,
    handleTableKeyDown,
    getLeftOffset,
    getRightOffset,
  };
}
