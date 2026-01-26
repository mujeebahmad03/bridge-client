"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  useContactColumnsQuery,
  useContactsQuery,
  useCreateContactColumnMutation,
} from "./use-contacts-api";
import { useContactsTableStore } from "@/leads/stores";

export function useColumnSheetController() {
  // Store selectors
  const open = useContactsTableStore((s) => s.isColumnSheetOpen);
  const mode = useContactsTableStore((s) => s.columnSheetMode);
  const selectedColumn = useContactsTableStore((s) => s.selectedSheetColumn);
  const setIsColumnSheetOpen = useContactsTableStore(
    (s) => s.setIsColumnSheetOpen
  );
  const searchValue = useContactsTableStore((s) => s.searchValue);

  // React Query hooks
  const { data: contacts = [] } = useContactsQuery({ search: searchValue });
  const { data: columns = [], isLoading: columnsLoading } =
    useContactColumnsQuery();
  const createColumnMutation = useCreateContactColumnMutation();

  // Local state
  const [selectedColumnId, setSelectedColumnId] = useState<string>(
    selectedColumn?.id ?? ""
  );
  const [selectedColumnLabel, setSelectedColumnLabel] = useState<string>(
    selectedColumn?.label ?? ""
  );
  const [isCustomColumn, setIsCustomColumn] = useState(false);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [currentStep, setCurrentStep] = useState("select-type");
  const [contactCount, setContactCount] = useState<string>("10");

  // Derived state
  const contactsToEnrich = useMemo(() => {
    if (contactCount === "all") {
      return contacts;
    }
    const count = parseInt(contactCount, 10);
    return contacts.slice(0, count);
  }, [contacts, contactCount]);

  const contactIds = useMemo(
    () => contactsToEnrich.map((c) => c.id),
    [contactsToEnrich]
  );

  const availableColumns = useMemo(() => {
    return columns.map((col) => ({
      id: col.id,
      label: col.label,
      isCustom: String(col.id).startsWith("cf-"),
    }));
  }, [columns]);

  const hasColumn =
    selectedColumnId.length > 0 || selectedColumnLabel.length > 0;

  // Sync local column selection from store when sheet opens / selected column changes
  useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedColumnId(selectedColumn?.id ?? "");
    setSelectedColumnLabel(selectedColumn?.label ?? "");
    setIsCustomColumn(String(selectedColumn?.id ?? "").startsWith("cf-"));
  }, [open, selectedColumn]);

  // Handlers
  const handleColumnSelect = (id: string, label: string, isCustom: boolean) => {
    setSelectedColumnId(id);
    setSelectedColumnLabel(label);
    setIsCustomColumn(isCustom);
  };

  const handleCreateColumn = async (name: string) => {
    setIsCreatingColumn(true);
    try {
      const created = await createColumnMutation.mutateAsync({ label: name });
      setSelectedColumnId(created.id);
      setSelectedColumnLabel(created.label);
      setIsCustomColumn(true);
      toast.success(`Column "${created.label}" created`);
    } finally {
      setIsCreatingColumn(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedColumnId(selectedColumn?.id ?? "");
      setSelectedColumnLabel(selectedColumn?.label ?? "");
      setIsCustomColumn(false);
      setContactCount("10");
      setCurrentStep("select-type");
    }
    setIsColumnSheetOpen(isOpen);
  };

  const getTitle = () => {
    if (currentStep === "preview") {
      return "Review Enrichment Pipeline";
    }
    if (currentStep === "processing") {
      return "Processing Enrichment";
    }
    if (currentStep === "results") {
      return "Enrichment Results";
    }
    return mode === "add"
      ? "Add New Column"
      : `Configure Column: ${selectedColumn?.label}`;
  };

  const getDescription = () => {
    if (currentStep === "preview") {
      return "Review the pipeline before running enrichment";
    }
    if (currentStep === "processing") {
      return "Your enrichment is being processed";
    }
    if (currentStep === "results") {
      return "Review and apply the enrichment results";
    }
    return mode === "add"
      ? "Create a new column and configure how to populate it"
      : "Configure enrichment or actions for this column";
  };

  return {
    // State
    open,
    mode,
    selectedColumn,
    selectedColumnId,
    selectedColumnLabel,
    isCustomColumn,
    isCreatingColumn,
    currentStep,
    contactCount,
    contactsToEnrich,
    contactIds,
    availableColumns,
    hasColumn,
    columnsLoading,

    // Handlers
    handleColumnSelect,
    handleCreateColumn,
    handleOpenChange,
    setContactCount,
    setCurrentStep,

    // Computed
    getTitle,
    getDescription,
  };
}
