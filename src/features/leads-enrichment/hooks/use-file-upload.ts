import { useCallback } from "react";
import { toast } from "sonner";

import { useUploadFile } from "./use-upload-history";
import { useFileUploadStore } from "@/leads/stores";
import type { FeatureMapping } from "@/leads/types";
import { parseCSVFile, validateFileType } from "@/leads/utils";

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
    async (onSuccess?: () => void) => {
      if (!file || !validation || mappings.length === 0) {
        return;
      }

      setIsSubmitting(true);

      try {
        const featureMapping: FeatureMapping = {};
        mappings.forEach((mapping) => {
          featureMapping[mapping.sourceField] = mapping.targetFieldId;
        });

        await uploadMutation.mutateAsync({
          feature_mapping: JSON.stringify(featureMapping),
          source: "FILE_UPLOAD",
          filename: file.name,
          file,
        });

        closeDialog();
        onSuccess?.();
      } catch {
        // Error is handled by the mutation
      } finally {
        setIsSubmitting(false);
      }
    },
    [file, validation, mappings, uploadMutation, closeDialog, setIsSubmitting]
  );

  return {
    processFile,
    handleDrop,
    handleFileSelect,
    handleEnrich,
  };
}
