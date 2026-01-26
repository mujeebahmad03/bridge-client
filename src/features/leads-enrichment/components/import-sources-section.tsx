"use client";

import { Plus, Upload } from "lucide-react";

import { cn } from "@/lib/utils";

import { FileUploadDialog } from "./file-upload-dialog";
import { ImportSourceCard } from "./import-source-card";
import { SectionHeader } from "./section-header";
import { importSources } from "@/leads/data";
import { useFileUploadStore } from "@/leads/stores";

interface ImportSourcesSectionProps {
  variant?: "prominent" | "compact";
  className?: string;
}

export function ImportSourcesSection({
  variant = "prominent",
  className,
}: ImportSourcesSectionProps) {
  const openDialog = useFileUploadStore((state) => state.openDialog);

  const handleSourceClick = (sourceId: string) => {
    if (sourceId === "csv-upload") {
      openDialog();
    }
    // For other integrations, would trigger OAuth flow
  };

  const isProminent = variant === "prominent";

  if (isProminent) {
    return (
      <section className={cn("animate-fade-up", className)}>
        <SectionHeader
          icon={Upload}
          title="Import Your Leads"
          description="Choose how you'd like to bring your contacts into the platform"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {importSources.map((source, index) => (
            <ImportSourceCard
              key={source.id}
              source={source}
              variant="default"
              onClick={() => handleSourceClick(source.id)}
              className="animate-fade-up"
              style={
                { animationDelay: `${index * 50}ms` } as React.CSSProperties
              }
            />
          ))}
        </div>

        <FileUploadDialog />
      </section>
    );
  }

  // Compact variant for returning users
  return (
    <section className={cn("animate-fade-up", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Quick Import
        </h3>
        <button className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
          <Plus className="h-4 w-4" />
          New Import
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {importSources
          .filter((s) => s.enabled)
          .map((source) => (
            <ImportSourceCard
              key={source.id}
              source={source}
              variant="compact"
              onClick={() => handleSourceClick(source.id)}
              className="shrink-0 min-w-[200px]"
            />
          ))}
      </div>

      <FileUploadDialog />
    </section>
  );
}
