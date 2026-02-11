"use client";

import { Database, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { EnrichmentPreset } from "@/leads/types";

interface PresetSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preset: EnrichmentPreset | null;
  onSelectCsv: () => void;
}

export function PresetSourceDialog({
  open,
  onOpenChange,
  preset,
  onSelectCsv,
}: PresetSourceDialogProps) {
  if (!preset) {
    return null;
  }

  const handleCsv = () => {
    onSelectCsv();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import leads for {preset.label}</DialogTitle>
          <DialogDescription>
            Choose how you want to bring your contacts in for this workflow
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          <Button
            type="button"
            onClick={handleCsv}
            className="w-full justify-start gap-3 h-auto py-3"
            aria-label="Upload CSV file"
          >
            <FileSpreadsheet className="h-5 w-5 shrink-0" />
            <span>Upload CSV</span>
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-3"
                    disabled
                    aria-label="HubSpot import (coming soon)"
                  >
                    <Database className="h-5 w-5 shrink-0" />
                    <span>HubSpot</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      Coming soon
                    </span>
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>HubSpot import is not available yet</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <DialogFooter className="sr-only">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
