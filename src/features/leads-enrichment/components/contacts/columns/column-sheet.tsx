"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  SidebarSheet,
  SidebarSheetContent,
  SidebarSheetDescription,
  SidebarSheetFooter,
  SidebarSheetHeader,
  SidebarSheetTitle,
} from "@/components/ui/sidebar-sheet";

import { EnrichmentPanelContent, EnrichmentPanelFooter } from "../enrichment";
import { ColumnFieldSelector } from "./column-field-selector";
import { useEnrichmentPanelController } from "@/leads/hooks";
import { useColumnSheetController } from "@/leads/hooks/contacts";

const CONTACT_COUNT_OPTIONS = [
  { value: "10", label: "First 10 contacts" },
  { value: "20", label: "First 20 contacts" },
  { value: "50", label: "First 50 contacts" },
  { value: "100", label: "First 100 contacts" },
  { value: "all", label: "All contacts" },
];

export const ColumnSheet = () => {
  const {
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
    handleColumnSelect,
    handleCreateColumn,
    handleOpenChange,
    setContactCount,
    setCurrentStep,
    getTitle,
    getDescription,
  } = useColumnSheetController();

  // Initialize enrichment controller
  // Key forces remount on open to reset state, avoiding stale workflow state
  const enrichmentController = useEnrichmentPanelController({
    contactIds,
    contactsToEnrich,
    onStepChange: setCurrentStep,
    onComplete: () => handleOpenChange(false),
  });

  return (
    <SidebarSheet open={open} onOpenChange={handleOpenChange}>
      <SidebarSheetContent className="w-full sm:max-w-lg flex flex-col p-0 overflow-hidden">
        <SidebarSheetHeader className="px-6 pt-6 pb-4 border-b">
          <SidebarSheetTitle>{getTitle()}</SidebarSheetTitle>
          <SidebarSheetDescription>{getDescription()}</SidebarSheetDescription>
        </SidebarSheetHeader>

        <div className="overflow-y-auto h-full">
          <div className="px-6 py-4 space-y-6">
            {/* Column Selection & Contact Count - Only visible in initial step */}
            {currentStep === "select-type" && (
              <>
                {/* Column Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Column</Label>
                  <ColumnFieldSelector
                    value={selectedColumnId}
                    displayValue={selectedColumnLabel}
                    onValueChange={handleColumnSelect}
                    onCreateNew={handleCreateColumn}
                    columns={availableColumns}
                    isCreating={isCreatingColumn}
                    isLoading={columnsLoading}
                    disabled={mode === "edit"}
                    placeholder={
                      mode === "edit"
                        ? selectedColumn?.label
                        : "Select or create column..."
                    }
                  />
                  {isCustomColumn && selectedColumnLabel && (
                    <p className="text-xs text-muted-foreground">
                      New column &quot;{selectedColumnLabel}&quot; will be
                      created
                    </p>
                  )}
                </div>

                <Separator />

                {/* Contact Count Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Run on</Label>
                  <Select value={contactCount} onValueChange={setContactCount}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select how many contacts..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_COUNT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-1">
                  <Label className="text-sm font-medium">
                    Enrichment Action
                  </Label>
                </div>
              </>
            )}

            {/* Enrichment Panel Content */}
            <EnrichmentPanelContent
              controller={enrichmentController}
              disabled={!hasColumn}
            />
          </div>
        </div>

        {/* Enrichment Panel Footer - Action Buttons */}
        <SidebarSheetFooter className="px-6 py-4 border-t bg-background">
          <EnrichmentPanelFooter
            controller={enrichmentController}
            disabled={!hasColumn}
          />
        </SidebarSheetFooter>
      </SidebarSheetContent>
    </SidebarSheet>
  );
};
