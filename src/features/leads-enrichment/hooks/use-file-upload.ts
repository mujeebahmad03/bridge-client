import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { toast } from "sonner";

import { UPLOAD_HISTORY_QUERY_KEY, useUploadFile } from "./use-upload-history";
import { fetchUploadHistory } from "@/leads/services";
import { useFileUploadStore } from "@/leads/stores";
import type { FeatureMapping, UploadStatus } from "@/leads/types";
import { parseCSVFile, validateFileType } from "@/leads/utils";

const POLL_INTERVAL_MS = 2500;
const POLL_MAX_ATTEMPTS = 60; // ~2.5 minutes

async function pollUntilComplete(
  uploadId: string
): Promise<{ status: UploadStatus; import_tag: string | null }> {
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    const { results } = await fetchUploadHistory({
      page: 1,
      pageSize: 100,
    });
    const item = results.find((r) => r.id === uploadId);
    if (!item) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      continue;
    }
    if (item.status === "SUCCESS" || item.status === "FAILED") {
      return { status: item.status, import_tag: item.import_tag ?? null };
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  return { status: "FAILED", import_tag: null };
}

export function useFileUpload() {
  const {
    file,
    validation,
    mappings,
    setFile,
    setValidation,
    setStep,
    setIsValidating,
    setIsSubmitting,
    closeDialog,
  } = useFileUploadStore();

  const queryClient = useQueryClient();
  const uploadMutation = useUploadFile();

  const processFile = useCallback(
    async (selectedFile: File) => {
      const typeValidation = validateFileType(selectedFile);

      if (!typeValidation.isValid) {
        toast.error(typeValidation.error);
        return;
      }

      setFile(selectedFile);
      setIsValidating(true);

      const result = await parseCSVFile(selectedFile);
      setValidation(result);

      if (result.isValid) {
        setStep("mapping");
      }
    },
    [setFile, setIsValidating, setValidation, setStep]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      useFileUploadStore.getState().setIsDragOver(false);

      const [droppedFile] = e.dataTransfer.files;
      if (droppedFile) {
        processFile(droppedFile);
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        processFile(selectedFile);
      }
    },
    [processFile]
  );

  const handleEnrich = useCallback(
    async (onSuccess?: (importTag: string) => void) => {
      if (!file || !validation || mappings.length === 0) {
        return;
      }

      setIsSubmitting(true);

      try {
        const featureMapping: FeatureMapping = {};
        mappings.forEach((mapping) => {
          featureMapping[mapping.sourceField] = mapping.targetFieldId;
        });

        const upload = await uploadMutation.mutateAsync({
          feature_mapping: JSON.stringify(featureMapping),
          source: "FILE_UPLOAD",
          filename: file.name,
          file,
        });

        if (upload.status === "SUCCESS" && upload.import_tag) {
          closeDialog();
          onSuccess?.(upload.import_tag);
          return;
        }

        const { status, import_tag } = await pollUntilComplete(upload.id);

        if (status === "SUCCESS" && import_tag) {
          queryClient.invalidateQueries({ queryKey: UPLOAD_HISTORY_QUERY_KEY });
          closeDialog();
          onSuccess?.(import_tag);
        } else if (status === "FAILED") {
          toast.error(
            "Import failed. Please try again or check the upload history."
          );
        }
      } catch {
        // Error is handled by the mutation
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      file,
      validation,
      mappings,
      uploadMutation,
      queryClient,
      closeDialog,
      setIsSubmitting,
    ]
  );

  return {
    processFile,
    handleDrop,
    handleFileSelect,
    handleEnrich,
  };
}
