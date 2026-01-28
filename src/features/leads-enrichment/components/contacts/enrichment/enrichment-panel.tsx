"use client";

import { ArrowRight, CheckCircle2, Download } from "lucide-react";

import { Button } from "@/components/ui/button";

import { EnrichmentProgress } from "./enrichment-progress";
import { EnrichmentResults } from "./enrichment-results";
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
    step,
    contactCount,
    presets,
    isLoadingPresets,
    status,
    isPolling,
    results,
    isLoadingResults,
    isApplying,
    isApplied,
    applyResults,
    // Selection props
    selectedPreset,
    setSelectedPreset,
    customDescription,
    setCustomDescription,
    activeTab,
    setActiveTab,
  } = controller;

  return (
    <div className="space-y-6 h-full">
      {step === "select-type" && (
        <PresetSelector
          presets={presets}
          isLoading={isLoadingPresets}
          selectedContactCount={contactCount}
          // Controlled state
          selectedPreset={selectedPreset}
          onSelectPreset={setSelectedPreset}
          customDescription={customDescription}
          onCustomDescriptionChange={setCustomDescription}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          disabled={disabled}
        />
      )}

      {step === "processing" && (
        <EnrichmentProgress
          status={status}
          isPolling={isPolling}
          contactCount={contactCount}
        />
      )}

      {step === "results" && (
        <EnrichmentResults
          results={results}
          isLoading={isLoadingResults}
          onApply={applyResults}
          isApplying={isApplying}
          isApplied={isApplied}
        />
      )}
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
    step,
    isStarting,
    canContinue,
    handleStartEnrichment,
    isApplying,
    isApplied,
    applyResults,
  } = controller;

  if (step === "select-type") {
    return (
      <Button
        onClick={handleStartEnrichment}
        disabled={(!canContinue || isStarting) ?? disabled}
        className="w-full gap-2"
      >
        {isStarting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Creating Preview...
          </>
        ) : (
          <>
            Preview Enrichment
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    );
  }

  if (step === "results") {
    return (
      <div className="flex items-center justify-end gap-3 w-full">
        <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
          <Download className="h-4 w-4" />
          Export
        </Button>
        {!isApplied && (
          <Button
            onClick={applyResults}
            disabled={isApplying}
            className="gap-2 flex-1 sm:flex-none"
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

  return null;
}
