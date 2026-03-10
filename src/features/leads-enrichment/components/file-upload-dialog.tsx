"use client";

import {
  ArrowLeft,
  FileSpreadsheet,
  Loader2,
  Megaphone,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SlidePanel,
  SlidePanelContent,
  SlidePanelDescription,
  SlidePanelFooter,
  SlidePanelHeader,
  SlidePanelTitle,
} from "@/ui/slide-panel";

import { DASHBOARD_ROUTES } from "@/config/app-route";

import { ColumnMapper } from "./column-mapper";
import { FileDropZone } from "./file-drop-zone";
import { useFileUpload } from "@/leads/hooks";
import {
  useActiveMappings,
  useFileUploadDialogState,
  useFileUploadStore,
} from "@/leads/stores";
import {
  getMissingRequiredFields,
  getRequiredFieldDisplayName,
} from "@/leads/utils/enrichment.utils";

export function FileUploadDialog() {
  const router = useRouter();
  const {
    isOpen,
    step,
    selectedPreset,
    validation,
    isDragOver,
    isValidating,
    isSubmitting,
  } = useFileUploadDialogState();

  const closeDialog = useFileUploadStore((state) => state.closeDialog);
  const setStep = useFileUploadStore((state) => state.setStep);
  const setIsDragOver = useFileUploadStore((state) => state.setIsDragOver);

  const activeMappings = useActiveMappings();
  const mappings = useFileUploadStore((state) => state.mappings);
  const { handleDrop, handleFileSelect, handleEnrich } = useFileUpload();

  const mappedTargetIds = useMemo(
    () => mappings.map((m) => m.targetFieldId),
    [mappings]
  );

  const missingRequiredFields = useMemo(() => {
    if (!selectedPreset?.required_fields?.length) {
      return [];
    }
    return getMissingRequiredFields(
      selectedPreset.required_fields,
      mappedTargetIds
    );
  }, [selectedPreset, mappedTargetIds]);

  const hasRequiredFieldsError =
    selectedPreset &&
    selectedPreset.required_fields?.length > 0 &&
    missingRequiredFields.length > 0;

  const handleCreateCampaign = () => {
    closeDialog();
    router.push(DASHBOARD_ROUTES.CAMPAIGN);
  };

  const handleEnrichSuccess = (importTag: string) => {
    const url = selectedPreset
      ? `${DASHBOARD_ROUTES.LEADS_ENRICHMENT_CONTACT}?tag=${importTag}&preset=${selectedPreset.value}`
      : `${DASHBOARD_ROUTES.LEADS_ENRICHMENT_CONTACT}?tag=${importTag}`;
    router.push(url);
  };

  return (
    <SlidePanel open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <SlidePanelContent
        side="right"
        className="sm:max-w-2xl w-full max-h-dvh overflow-hidden flex flex-col gap-0"
      >
        <SlidePanelHeader>
          <SlidePanelTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            {step === "upload" && "Upload Your File"}
            {step === "mapping" && "Map Your Columns"}
          </SlidePanelTitle>
          <SlidePanelDescription>
            {step === "upload" &&
              "Upload a CSV or Excel file containing your leads data"}
            {step === "mapping" &&
              "Match your file columns to the system fields and review the data below"}
          </SlidePanelDescription>
          {selectedPreset && (
            <Badge variant="secondary" className="mt-2 w-fit">
              Workflow: {selectedPreset.label}
            </Badge>
          )}
        </SlidePanelHeader>

        <div className="flex-1 overflow-y-auto py-4 px-4">
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

          {step === "mapping" && hasRequiredFieldsError && (
            <div
              className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
              aria-live="polite"
            >
              This workflow requires:{" "}
              {missingRequiredFields
                .map((key) => getRequiredFieldDisplayName(key))
                .join(", ")}
              . Map these columns to continue.
            </div>
          )}
        </div>

        <SlidePanelFooter className="gap-2 sm:flex-row flex-wrap sm:justify-end">
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
                disabled={
                  isSubmitting ||
                  activeMappings.length === 0 ||
                  Boolean(hasRequiredFieldsError)
                }
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
        </SlidePanelFooter>
      </SlidePanelContent>
    </SlidePanel>
  );
}
