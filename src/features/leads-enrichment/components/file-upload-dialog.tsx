"use client";

import {
  ArrowLeft,
  ArrowRight,
  FileSpreadsheet,
  Loader2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ColumnMapper } from "./column-mapper";
import { EnrichmentPreview } from "./enrichment-preview";
import { FileDropZone } from "./file-drop-zone";
import { useFileUpload } from "@/leads/hooks";
import {
  useActiveMappings,
  useFileUploadDialogState,
  useFileUploadStore,
} from "@/leads/stores";

interface FileUploadDialogProps {
  onSuccess?: () => void;
}

export function FileUploadDialog({ onSuccess }: FileUploadDialogProps) {
  const { isOpen, step, validation, isDragOver, isValidating, isSubmitting } =
    useFileUploadDialogState();

  const closeDialog = useFileUploadStore((state) => state.closeDialog);
  const setStep = useFileUploadStore((state) => state.setStep);
  const setIsDragOver = useFileUploadStore((state) => state.setIsDragOver);

  const activeMappings = useActiveMappings();
  const { handleDrop, handleFileSelect, handleEnrich } = useFileUpload();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            {step === "upload" && "Upload Your File"}
            {step === "mapping" && "Map Your Columns"}
            {step === "preview" && "Preview & Enrich"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Upload a CSV or Excel file containing your leads data"}
            {step === "mapping" &&
              "Match your file columns to the system fields"}
            {step === "preview" &&
              `Review ${validation?.rowCount ?? 0} records before enrichment`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {step === "upload" && (
            <FileDropZone
              isDragOver={isDragOver}
              isValidating={isValidating}
              validation={validation}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onFileSelect={handleFileSelect}
            />
          )}

          {step === "mapping" && validation && <ColumnMapper />}

          {step === "preview" && validation && <EnrichmentPreview />}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {step !== "upload" && (
            <Button
              variant="outline"
              onClick={() => setStep(step === "preview" ? "mapping" : "upload")}
              disabled={isSubmitting}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          <Button variant="ghost" onClick={closeDialog} disabled={isSubmitting}>
            Cancel
          </Button>

          {step === "mapping" && (
            <Button
              onClick={() => setStep("preview")}
              disabled={activeMappings.length === 0}
              className="gap-2"
            >
              Preview Data
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {step === "preview" && (
            <Button
              onClick={() => handleEnrich(onSuccess)}
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Enrich {validation?.rowCount} Records
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
