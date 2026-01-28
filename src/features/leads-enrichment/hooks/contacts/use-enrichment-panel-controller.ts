"use client";

import { useCallback, useState } from "react";

import { useEnrichmentWorkflow } from "../use-enrichment";
import { type Contact, type EnrichmentPresetValue } from "@/leads/types";

export type TabType = "preset" | "custom";

export interface EnrichmentPanelProps {
  contactIds: string[];
  contactsToEnrich: Contact[];
  disabled?: boolean;
  onComplete?: () => void;
  onCancel?: () => void;
  onStepChange?: (step: string) => void;
}

export type EnrichmentPanelControllerProps = Omit<
  EnrichmentPanelProps,
  "disabled" | "onCancel"
>;

export function useEnrichmentPanelController({
  contactIds,
  contactsToEnrich,
  onStepChange,
  onComplete,
}: Omit<EnrichmentPanelProps, "disabled" | "onCancel">) {
  // PresetSelector local state
  const [selectedPreset, setSelectedPreset] =
    useState<EnrichmentPresetValue | null>(null);
  const [customDescription, setCustomDescription] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("preset");

  const workflow = useEnrichmentWorkflow({
    contactIds,
    contacts: contactsToEnrich,
    onStepChange,
    onComplete,
  });

  const handleStartEnrichment = useCallback(() => {
    if (activeTab === "preset" && selectedPreset) {
      workflow.startEnrichment("PRESET", selectedPreset);
    } else if (activeTab === "custom" && customDescription.trim()) {
      workflow.startEnrichment("CUSTOM", undefined, customDescription);
    }
  }, [activeTab, selectedPreset, customDescription, workflow]);

  const canContinue =
    (activeTab === "preset" && selectedPreset) ??
    (activeTab === "custom" && customDescription.trim().length > 10);

  return {
    ...workflow,
    // Selection State
    selectedPreset,
    setSelectedPreset,
    customDescription,
    setCustomDescription,
    activeTab,
    setActiveTab,
    // Actions
    handleStartEnrichment,
    canContinue,
  };
}

export type EnrichmentPanelController = ReturnType<
  typeof useEnrichmentPanelController
>;
