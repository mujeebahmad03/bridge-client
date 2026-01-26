import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import {
  contactsKeys,
  useContactColumnsQuery,
  useDeleteContactsMutation,
} from "./use-contacts-api";
import { getContactFieldValue } from "@/leads/services";
import { useContactsTableStore } from "@/leads/stores";
import type { Contact } from "@/leads/types";

export function useContactTableToolbarController() {
  const queryClient = useQueryClient();
  const { data: columns = [] } = useContactColumnsQuery();

  // Store selectors
  const searchValue = useContactsTableStore((s) => s.searchValue);
  const setSearchValue = useContactsTableStore((s) => s.setSearchValue);
  const visibleColumnIds = useContactsTableStore((s) => s.visibleColumnIds);
  const toggleColumn = useContactsTableStore((s) => s.toggleColumn);
  const selectedCount = useContactsTableStore((s) => s.selectedRowIds.size);
  const openAddDialog = useContactsTableStore((s) => s.openAddDialog);

  const deleteContactsMutation = useDeleteContactsMutation();

  const handleDeleteSelected = useCallback(async () => {
    const ids = Array.from(useContactsTableStore.getState().selectedRowIds);
    if (ids.length === 0) {
      return;
    }
    await deleteContactsMutation.mutateAsync(ids);
    useContactsTableStore.getState().clearSelection();
    toast.success(`Deleted ${ids.length} contact(s)`);
  }, [deleteContactsMutation]);

  const handleExportSelected = useCallback(() => {
    const ids = Array.from(useContactsTableStore.getState().selectedRowIds);
    if (ids.length === 0) {
      return;
    }

    const contacts =
      queryClient.getQueryData<Contact[]>(
        contactsKeys.list({
          search: useContactsTableStore.getState().searchValue,
        })
      ) ?? [];
    const exportContacts = contacts.filter((c) => ids.includes(c.id));

    const exportColumns = columns.filter((c) => visibleColumnIds.has(c.id));
    const headers = exportColumns.map((c) => c.label);
    const rows = exportContacts.map((contact) =>
      exportColumns
        .map((col) => {
          const v = getContactFieldValue(contact, col.id);
          return String(v ?? "");
        })
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Exported ${ids.length} contact(s)`);
  }, [queryClient, columns, visibleColumnIds]);

  return {
    // Data
    columns,

    // State
    searchValue,
    visibleColumnIds,
    selectedCount,

    // Handlers
    setSearchValue,
    toggleColumn,
    openAddDialog,
    handleDeleteSelected,
    handleExportSelected,
  };
}
