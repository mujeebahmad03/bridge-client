"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { contactsKeys } from "./contacts";
import {
  applyEnrichmentResults,
  approveEnrichment,
  checkEnrichmentStatus,
  createEnrichmentPreview,
  fetchEnrichmentPresets,
  getEnrichmentResults,
} from "@/leads/services";
import type {
  Contact,
  CreatePreviewRequest,
  EnrichmentPresetValue,
  EnrichmentPreviewResponse,
  EnrichmentType,
  EnrichmentWorkflowStep,
} from "@/leads/types";

// Query keys
export const enrichmentKeys = {
  all: ["enrichment"] as const,
  presets: () => [...enrichmentKeys.all, "presets"] as const,
  history: (page: number) => [...enrichmentKeys.all, "history", page] as const,
  status: (id: string) => [...enrichmentKeys.all, "status", id] as const,
  results: (id: string) => [...enrichmentKeys.all, "results", id] as const,
};

// Fetch presets
export const useEnrichmentPresets = () => {
  return useQuery({
    queryKey: enrichmentKeys.presets(),
    queryFn: fetchEnrichmentPresets,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook options
interface UseEnrichmentWorkflowOptions {
  contactIds: string[];
  contacts: Contact[];
  onStepChange?: (step: EnrichmentWorkflowStep) => void;
  onComplete?: () => void;
}

export const useEnrichmentWorkflow = ({
  contactIds,
  contacts,
  onStepChange,
  onComplete,
}: UseEnrichmentWorkflowOptions) => {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<EnrichmentWorkflowStep>("select-type");
  const [preview, setPreview] = useState<EnrichmentPreviewResponse | null>(
    null
  );

  const enrichmentRequestId = preview?.enrichment_request_id ?? null;

  // Presets query
  const presetsQuery = useEnrichmentPresets();

  // Mutations
  const createPreviewMutation = useMutation({
    mutationFn: ({
      request,
      contacts,
    }: {
      request: CreatePreviewRequest;
      contacts: Array<{
        id: string;
        first_name: string;
        last_name: string;
        email_address: string;
      }>;
    }) => createEnrichmentPreview(request, contacts),
    onError: (error) => {
      toast.error("Failed to create enrichment preview");
      console.error("Create preview error:", error);
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveEnrichment,
    onError: (error) => {
      toast.error("Failed to start enrichment");
      console.error("Approve error:", error);
      setStep("select-type");
    },
  });

  const applyMutation = useMutation({
    mutationFn: applyEnrichmentResults,
    onSuccess: (_, id) => {
      toast.success("Enrichment results applied successfully");
      queryClient.invalidateQueries({ queryKey: enrichmentKeys.status(id) });
      queryClient.invalidateQueries({ queryKey: enrichmentKeys.history(1) });
      queryClient.invalidateQueries({ queryKey: contactsKeys.list({}) });
    },
    onError: (error) => {
      toast.error("Failed to apply enrichment results");
      console.error("Apply results error:", error);
    },
  });

  // Status polling - stops when RESULTS_READY, SUCCESSFUL, or FAILED
  const statusQuery = useQuery({
    queryKey: enrichmentKeys.status(enrichmentRequestId ?? ""),
    queryFn: () => {
      if (!enrichmentRequestId) {
        throw new Error("Missing enrichment request id");
      }
      return checkEnrichmentStatus(enrichmentRequestId);
    },
    enabled: !!enrichmentRequestId && step === "processing",
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop polling when results are ready or final state reached
      if (
        status === "RESULTS_READY" ||
        status === "SUCCESSFUL" ||
        status === "FAILED"
      ) {
        return false;
      }
      return 2000;
    },
  });

  // Results query - fetch once when status is RESULTS_READY
  const resultsQuery = useQuery({
    queryKey: enrichmentKeys.results(enrichmentRequestId ?? ""),
    queryFn: () => {
      if (!enrichmentRequestId) {
        throw new Error("Missing enrichment request id");
      }
      return getEnrichmentResults(enrichmentRequestId);
    },
    enabled:
      !!enrichmentRequestId && statusQuery.data?.status === "RESULTS_READY",
    staleTime: Infinity, // Don't refetch once we have results
  });

  // Derived state
  const status = statusQuery.data;
  const results = resultsQuery.data;

  // Check if we have actual results data
  const hasResults = !!(
    results?.parsed_results && Object.keys(results.parsed_results).length > 0
  );

  const isApplied = status?.status === "SUCCESSFUL";
  const canApply = hasResults && !isApplied && !applyMutation.isPending;

  const effectiveStep: EnrichmentWorkflowStep = useMemo(() => {
    if (status?.status === "FAILED") {
      return "select-type";
    }
    if (step === "processing" && hasResults) {
      return "results";
    }
    return step;
  }, [hasResults, status?.status, step]);

  const isPolling = useMemo(() => {
    if (!enrichmentRequestId) {
      return false;
    }
    if (effectiveStep !== "processing") {
      return false;
    }
    if (hasResults) {
      return false;
    }
    return !(
      status?.status === "RESULTS_READY" ||
      status?.status === "SUCCESSFUL" ||
      status?.status === "FAILED"
    );
  }, [effectiveStep, enrichmentRequestId, hasResults, status?.status]);

  // Notify parent of step changes
  useEffect(() => {
    onStepChange?.(effectiveStep);
  }, [effectiveStep, onStepChange]);

  // Notify parent when enrichment is applied
  useEffect(() => {
    if (isApplied) {
      onComplete?.();
    }
  }, [isApplied, onComplete]);

  // Side-effect only: show error toast when enrichment fails
  const lastFailedRequestIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status?.status !== "FAILED") {
      return;
    }
    if (lastFailedRequestIdRef.current === status.id) {
      return;
    }
    lastFailedRequestIdRef.current = status.id;
    toast.error(status.error_message ?? "Enrichment failed");
  }, [status?.error_message, status?.id, status?.status]);

  // Build contacts data for API
  const contactsData = useMemo(
    () =>
      contacts.map((c) => ({
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        email_address: c.email_address,
      })),
    [contacts]
  );

  // Start enrichment with auto-approve
  const startEnrichment = useCallback(
    async (
      type: EnrichmentType,
      preset?: EnrichmentPresetValue,
      description?: string
    ) => {
      const request: CreatePreviewRequest =
        type === "PRESET"
          ? {
              contact_ids: contactIds,
              enrichment_type: "PRESET",
              preset_action: preset,
            }
          : {
              contact_ids: contactIds,
              enrichment_type: "CUSTOM",
              enrichment_description: description,
            };

      try {
        const previewResult = await createPreviewMutation.mutateAsync({
          request,
          contacts: contactsData,
        });
        setPreview(previewResult);

        setStep("processing");

        await approveMutation.mutateAsync(previewResult.enrichment_request_id);
        toast.success("Enrichment started");

        return previewResult;
      } catch (error) {
        setStep("select-type");
        throw error;
      }
    },
    [contactIds, contactsData, createPreviewMutation, approveMutation]
  );

  // Apply results
  const applyResults = useCallback(async () => {
    if (!enrichmentRequestId) {
      return;
    }
    await applyMutation.mutateAsync(enrichmentRequestId);
  }, [enrichmentRequestId, applyMutation]);

  // Reset workflow
  const reset = useCallback(() => {
    const id = enrichmentRequestId;
    setStep("select-type");
    setPreview(null);

    if (id) {
      queryClient.removeQueries({ queryKey: enrichmentKeys.status(id) });
      queryClient.removeQueries({ queryKey: enrichmentKeys.results(id) });
    }
  }, [enrichmentRequestId, queryClient]);

  return {
    // State
    step: effectiveStep,
    preview,
    results: hasResults ? results : null,
    status,
    contactCount: contacts.length,

    // Presets
    presets: presetsQuery.data ?? [],
    isLoadingPresets: presetsQuery.isLoading,

    // Flags
    isPolling,
    isApplied,
    canApply,
    hasResults,

    // Loading states
    isStarting: createPreviewMutation.isPending || approveMutation.isPending,
    isApplying: applyMutation.isPending,
    isLoadingResults: resultsQuery.isLoading,

    // Actions
    startEnrichment,
    applyResults,
    reset,
  };
};
