"use client";

import { useEffect } from "react";

import { EnrichmentPreview } from "./enrichment-preview";
import { EnrichmentProgress } from "./enrichment-progress";
import { EnrichmentResults } from "./enrichment-results";
import { PresetSelector } from "./preset-selector";
import { useEnrichmentPresets, useEnrichmentWorkflow } from "@/leads/hooks";
import type {
  Contact,
  CreatePreviewRequest,
  EnrichmentPresetValue,
  EnrichmentType,
} from "@/leads/types";

interface EnrichmentPanelProps {
  contactIds: string[];
  contactsToEnrich: Contact[];
  disabled?: boolean;
  onComplete?: () => void;
  onCancel?: () => void;
  onStepChange?: (step: string) => void;
}

export function EnrichmentPanel({
  contactIds,
  contactsToEnrich,
  onComplete,
  onStepChange,
}: EnrichmentPanelProps) {
  const { data: presets = [], isLoading: presetsLoading } =
    useEnrichmentPresets();

  const {
    step,
    preview,
    results,
    status,
    isPolling,
    isCreatingPreview,
    isApproving,
    isApplying,
    isLoadingResults,
    createPreview,
    approve,
    apply,
    goBack,
  } = useEnrichmentWorkflow(contactIds);

  // Notify parent of step change for title/description updates
  // Use useEffect to avoid updating parent state during render
  useEffect(() => {
    if (onStepChange) {
      onStepChange(step);
    }
  }, [step, onStepChange]);

  const handleSelectPreset = async (
    type: EnrichmentType,
    preset?: EnrichmentPresetValue,
    description?: string
  ) => {
    const request: CreatePreviewRequest =
      type === "PRESET"
        ? {
            contact_ids: contactIds,
            enrichment_type: "PRESET",
            preset_action: preset,
          }
        : {
            contact_ids: contactIds,
            enrichment_type: "CUSTOM",
            enrichment_description: description,
          };

    const contactsData = contactsToEnrich.map((c) => ({
      id: c.id,
      first_name: c.first_name,
      last_name: c.last_name,
      email_address: c.email_address,
    }));

    await createPreview(request, contactsData);
  };

  const handleApply = async () => {
    await apply();
    if (onComplete) {
      onComplete();
    }
  };

  const isApplied = status?.status === "SUCCESSFUL";

  return (
    <div className="space-y-6">
      {/* Step: Select Type */}
      {step === "select-type" && (
        <PresetSelector
          presets={presets}
          isLoading={presetsLoading}
          selectedContactCount={contactsToEnrich.length}
          onSelect={handleSelectPreset}
          isCreating={isCreatingPreview}
          // Pass disabled prop if PresetSelector supports it, otherwise button handles it via isCreating
          // PresetSelector uses !canContinue || isCreating.
          // We might need to modify PresetSelector to accept external disabled prop or just rely on canContinue logic inside it.
          // But 'disabled' prop here comes from Column Selection.
          // I will need to update PresetSelector to accept 'disabled' prop.
        />
      )}

      {/* Step: Preview */}
      {step === "preview" && (
        <EnrichmentPreview
          preview={preview}
          isLoading={false}
          onApprove={approve}
          onBack={goBack}
          isApproving={isApproving}
        />
      )}

      {/* Step: Processing */}
      {step === "processing" && (
        <EnrichmentProgress
          status={status}
          isPolling={isPolling}
          contactCount={contactsToEnrich.length}
        />
      )}

      {/* Step: Results */}
      {step === "results" && (
        <EnrichmentResults
          results={results}
          isLoading={isLoadingResults}
          onApply={handleApply}
          isApplying={isApplying}
          isApplied={isApplied}
        />
      )}
    </div>
  );
}
