"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PresetSelector } from "./preset-selector";
import { type EnrichmentPanelController } from "@/leads/hooks";

interface EnrichmentPanelContentProps {
  controller: EnrichmentPanelController;
  disabled?: boolean;
}
export function EnrichmentPanelContent({
  controller,
  disabled,
}: EnrichmentPanelContentProps) {
  const {
    contactCount,
    presets,
    isLoadingPresets,
    selectedPreset,
    setSelectedPreset,
    customDescription,
    setCustomDescription,
    activeTab,
    setActiveTab,
  } = controller;

  // Only select-type UI: preset selector always visible (EnrichmentProgress/EnrichmentResults not rendered)
  return (
    <div className="space-y-6 h-full">
      <PresetSelector
        presets={presets}
        isLoading={isLoadingPresets}
        selectedContactCount={contactCount}
        selectedPreset={selectedPreset}
        onSelectPreset={setSelectedPreset}
        customDescription={customDescription}
        onCustomDescriptionChange={setCustomDescription}
        activeTab={activeTab}
        onActiveTabChange={setActiveTab}
        disabled={disabled}
      />
    </div>
  );
}

export function EnrichmentPanelFooter({
  controller,
  disabled,
}: {
  controller: EnrichmentPanelController;
  disabled?: boolean;
}) {
  const {
    isStarting,
    canContinue,
    handleStartEnrichment,
    hasResults,
    isApplied,
    isApplying,
    applyResults,
  } = controller;

  const showPreview = canContinue && !isStarting;
  const showApply = hasResults && !isApplied;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full">
      {showPreview && (
        <Button
          onClick={handleStartEnrichment}
          disabled={disabled}
          className="w-full sm:flex-none gap-2"
        >
          Preview Enrichment
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
      {showApply && (
        <Button
          onClick={applyResults}
          disabled={isApplying || disabled}
          className="w-full sm:flex-none gap-2"
        >
          {isApplying ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Applying...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Apply to Contacts
            </>
          )}
        </Button>
      )}
    </div>
  );
}
