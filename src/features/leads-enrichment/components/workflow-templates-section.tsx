"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { PresetCard } from "./preset-card";
import { PresetSourceDialog } from "./preset-source-dialog";
import { SectionHeader } from "./section-header";
import { useEnrichmentPresets } from "@/leads/hooks";
import { useFileUploadStore } from "@/leads/stores";
import type { EnrichmentPreset } from "@/leads/types";

interface WorkflowTemplatesSectionProps {
  className?: string;
}

export function WorkflowTemplatesSection({
  className,
}: WorkflowTemplatesSectionProps) {
  const { data: presets = [], isLoading } = useEnrichmentPresets();
  const openDialogWithPreset = useFileUploadStore(
    (state) => state.openDialogWithPreset
  );

  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<EnrichmentPreset | null>(
    null
  );

  const handlePresetClick = (preset: EnrichmentPreset) => {
    setSelectedPreset(preset);
    setSourceDialogOpen(true);
  };

  const handleSelectCsv = () => {
    if (selectedPreset) {
      openDialogWithPreset(selectedPreset);
    }
    setSourceDialogOpen(false);
    setSelectedPreset(null);
  };

  return (
    <section className={cn("animate-fade-up", className)}>
      <SectionHeader
        icon={Sparkles}
        title="Enrichment Workflows"
        description="Choose a template to enrich your leads with valuable data"
        className="mb-4"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground py-6">Loading…</p>
      ) : presets.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6">
          No workflows available
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset, index) => (
            <PresetCard
              key={preset.value}
              preset={preset}
              onClick={() => handlePresetClick(preset)}
              className="animate-fade-up"
              style={
                { animationDelay: `${index * 50}ms` } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <PresetSourceDialog
        open={sourceDialogOpen}
        onOpenChange={setSourceDialogOpen}
        preset={selectedPreset}
        onSelectCsv={handleSelectCsv}
      />
    </section>
  );
}
