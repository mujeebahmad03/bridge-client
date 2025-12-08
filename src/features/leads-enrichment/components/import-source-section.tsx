import { Plus, Upload } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { FileUploadDialog } from "./file-upload-dialog";
import { ImportSourceCard } from "./import-source-card";
import { importSources } from "@/leads/data";

interface ImportSourcesSectionProps {
  variant?: "prominent" | "compact";
  className?: string;
}

export function ImportSourcesSection({
  variant = "prominent",
  className,
}: ImportSourcesSectionProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  const handleSourceClick = (sourceId: string) => {
    if (sourceId === "csv-upload") {
      setSelectedSourceId(sourceId);
      setIsUploadDialogOpen(true);
    }
    // For other integrations, would trigger OAuth flow
  };

  const isProminent = variant === "prominent";

  if (isProminent) {
    return (
      <section className={cn("animate-fade-up", className)}>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Import Your Leads
            </h2>
          </div>
          <p className="text-muted-foreground">
            Choose how you&apos;d like to bring your contacts into the platform
          </p>
        </div>

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

        <FileUploadDialog
          open={isUploadDialogOpen}
          onOpenChange={setIsUploadDialogOpen}
        />
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

      <FileUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
    </section>
  );
}
