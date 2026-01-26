import { useMemo } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

import type {
  FieldMapping,
  FileValidationResult,
  UploadStep,
} from "@/leads/types";

// ==================== Store Types ====================
interface FileUploadState {
  // Dialog state
  isOpen: boolean;
  step: UploadStep;

  // File data
  file: File | null;
  validation: FileValidationResult | null;
  mappings: FieldMapping[];

  // UI state
  isValidating: boolean;
  isDragOver: boolean;
  isSubmitting: boolean;
}

interface FileUploadActions {
  // Dialog actions
  openDialog: () => void;
  closeDialog: () => void;
  setStep: (step: UploadStep) => void;

  // File actions
  setFile: (file: File) => void;
  setValidation: (validation: FileValidationResult) => void;
  setMappings: (mappings: FieldMapping[]) => void;
  updateMapping: (
    sourceField: string,
    targetFieldId: string,
    targetFieldName: string,
    isCustom?: boolean
  ) => void;

  // UI actions
  setIsValidating: (isValidating: boolean) => void;
  setIsDragOver: (isDragOver: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;

  // Reset
  reset: () => void;
}

type FileUploadStore = FileUploadState & FileUploadActions;

// ==================== Initial State ====================
const initialState: FileUploadState = {
  isOpen: false,
  step: "upload",
  file: null,
  validation: null,
  mappings: [],
  isValidating: false,
  isDragOver: false,
  isSubmitting: false,
};

// ==================== Store ====================
export const useFileUploadStore = create<FileUploadStore>((set, get) => ({
  ...initialState,

  openDialog: () => set({ isOpen: true }),

  closeDialog: () => {
    set({ isOpen: false });
    // Reset after animation
    setTimeout(() => get().reset(), 200);
  },

  setStep: (step) => set({ step }),

  setFile: (file) => set({ file }),

  setValidation: (validation) => set({ validation, isValidating: false }),

  setMappings: (mappings) => set({ mappings }),

  updateMapping: (
    sourceField,
    targetFieldId,
    targetFieldName,
    isCustom = false
  ) => {
    const { mappings } = get();
    const existingIndex = mappings.findIndex(
      (m) => m.sourceField === sourceField
    );
    const newMappings = [...mappings];

    if (existingIndex >= 0) {
      if (targetFieldId) {
        newMappings[existingIndex] = {
          sourceField,
          targetFieldId,
          targetFieldName,
          isCustom,
        };
      } else {
        newMappings.splice(existingIndex, 1);
      }
    } else if (targetFieldId) {
      newMappings.push({
        sourceField,
        targetFieldId,
        targetFieldName,
        isCustom,
      });
    }

    set({ mappings: newMappings });
  },

  setIsValidating: (isValidating) => set({ isValidating }),

  setIsDragOver: (isDragOver) => set({ isDragOver }),

  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),

  reset: () => set(initialState),
}));

// ==================== Selector Hooks ====================
// Use useShallow for optimal re-renders when selecting multiple values

export const useFileUploadDialogState = () =>
  useFileUploadStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      step: state.step,
      file: state.file,
      validation: state.validation,
      mappings: state.mappings,
      isValidating: state.isValidating,
      isDragOver: state.isDragOver,
      isSubmitting: state.isSubmitting,
    }))
  );

export const useFileUploadActions = () =>
  useFileUploadStore(
    useShallow((state) => ({
      openDialog: state.openDialog,
      closeDialog: state.closeDialog,
      setStep: state.setStep,
      setFile: state.setFile,
      setValidation: state.setValidation,
      setMappings: state.setMappings,
      updateMapping: state.updateMapping,
      setIsValidating: state.setIsValidating,
      setIsDragOver: state.setIsDragOver,
      setIsSubmitting: state.setIsSubmitting,
      reset: state.reset,
    }))
  );

// Computed selectors
export const useActiveMappings = () =>
  useFileUploadStore(
    useShallow((state) => state.mappings.filter((m) => m.targetFieldId))
  );

export const useUsedTargetFieldIds = () => {
  const mappings = useFileUploadStore(useShallow((state) => state.mappings));
  // Memoize the Set to prevent new references unless mappings change
  return useMemo(
    () => new Set(mappings.map((m) => m.targetFieldId).filter(Boolean)),
    [mappings]
  );
};
