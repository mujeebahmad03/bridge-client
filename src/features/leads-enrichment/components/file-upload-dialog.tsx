"use client";

import {
  ArrowLeft,
  FileSpreadsheet,
  Loader2,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { DASHBOARD_ROUTES } from "@/config/app-route";

import { ColumnMapper } from "./column-mapper";
import { FileDropZone } from "./file-drop-zone";
import { useFileUpload } from "@/leads/hooks";
import {
  useActiveMappings,
  useFileUploadDialogState,
  useFileUploadStore,
} from "@/leads/stores";

export function FileUploadDialog() {
  const router = useRouter();
  const { isOpen, step, validation, isDragOver, isValidating, isSubmitting } =
    useFileUploadDialogState();

  const closeDialog = useFileUploadStore((state) => state.closeDialog);
  const setStep = useFileUploadStore((state) => state.setStep);
  const setIsDragOver = useFileUploadStore((state) => state.setIsDragOver);

  const activeMappings = useActiveMappings();
  const { handleDrop, handleFileSelect, handleEnrich } = useFileUpload();

  const handleCreateCampaign = () => {
    closeDialog();
    router.push(DASHBOARD_ROUTES.CAMPAIGN);
  };

  const handleEnrichSuccess = (importTag: string) => {
    router.push(
      `${DASHBOARD_ROUTES.LEADS_ENRICHMENT_CONTACT}?tag=${importTag}`
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            {step === "upload" && "Upload Your File"}
            {step === "mapping" && "Map Your Columns"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Upload a CSV or Excel file containing your leads data"}
            {step === "mapping" &&
              "Match your file columns to the system fields and review the data below"}
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
        </div>

        <DialogFooter className="gap-2">
          {step !== "upload" && (
            <Button
              variant="outline"
              onClick={() => setStep("upload")}
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
            <>
              <Button
                variant="outline"
                onClick={handleCreateCampaign}
                disabled={isSubmitting}
                className="gap-2"
              >
                <Megaphone className="h-4 w-4" />
                Create Campaign
              </Button>
              <Button
                onClick={() => handleEnrich(handleEnrichSuccess)}
                disabled={isSubmitting || activeMappings.length === 0}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up your contacts...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Enrich {validation?.rowCount ?? 0} Records
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
