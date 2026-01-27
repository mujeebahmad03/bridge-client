"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  applyEnrichmentResults,
  approveEnrichment,
  checkEnrichmentStatus,
  createEnrichmentPreview,
  fetchEnrichmentHistory,
  fetchEnrichmentPresets,
  getEnrichmentResults,
} from "@/leads/services";
import {
  type CreatePreviewRequest,
  type EnrichmentPreviewResponse,
  type EnrichmentResultsResponse,
  type EnrichmentWorkflowStep,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create preview mutation
export const useCreatePreview = () => {
  return useMutation({
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
};

// Approve enrichment mutation
export const useApproveEnrichment = () => {
  return useMutation({
    mutationFn: approveEnrichment,
    onSuccess: () => {
      toast.success("Enrichment approved and processing started");
    },
    onError: (error) => {
      toast.error("Failed to approve enrichment");
      console.error("Approve error:", error);
    },
  });
};

// Status polling hook
export const useEnrichmentStatus = (
  enrichmentRequestId: string | null,
  enabled: boolean = false
) => {
  const [isPolling, setIsPolling] = useState(false);

  const query = useQuery({
    queryKey: enrichmentKeys.status(enrichmentRequestId ?? ""),
    queryFn: () => checkEnrichmentStatus(enrichmentRequestId ?? ""),
    enabled: enabled && !!enrichmentRequestId && isPolling,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (
        status === "RESULTS_READY" ||
        status === "SUCCESSFUL" ||
        status === "FAILED"
      ) {
        return false; // Stop polling
      }
      return 2000; // Poll every 2 seconds
    },
  });

  const startPolling = useCallback(() => setIsPolling(true), []);
  const stopPolling = useCallback(() => setIsPolling(false), []);

  const isFinalStatus = useMemo(() => {
    const status = query.data?.status;
    return (
      status === "RESULTS_READY" ||
      status === "SUCCESSFUL" ||
      status === "FAILED"
    );
  }, [query.data?.status]);

  return {
    ...query,
    isPolling: isPolling && !isFinalStatus,
    startPolling,
    stopPolling,
  };
};

// Get results
export const useEnrichmentResults = (
  enrichmentRequestId: string | null,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: enrichmentKeys.results(enrichmentRequestId ?? ""),
    queryFn: () => getEnrichmentResults(enrichmentRequestId ?? ""),
    enabled: enabled && !!enrichmentRequestId,
  });
};

// Apply results mutation
export const useApplyResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyEnrichmentResults,
    onSuccess: (_, enrichmentRequestId) => {
      toast.success("Enrichment results applied successfully");
      queryClient.invalidateQueries({
        queryKey: enrichmentKeys.status(enrichmentRequestId),
      });
      queryClient.invalidateQueries({ queryKey: enrichmentKeys.history(1) });
    },
    onError: (error) => {
      toast.error("Failed to apply enrichment results");
      console.error("Apply results error:", error);
    },
  });
};

// Enrichment history
export const useEnrichmentHistory = (page: number = 1) => {
  return useQuery({
    queryKey: enrichmentKeys.history(page),
    queryFn: () => fetchEnrichmentHistory(page),
  });
};

// Combined workflow hook
export const useEnrichmentWorkflow = (selectedContactIds: string[]) => {
  const queryClient = useQueryClient();
  const [baseStep, setBaseStep] =
    useState<EnrichmentWorkflowStep>("select-type");
  const [preview, setPreview] = useState<EnrichmentPreviewResponse | null>(
    null
  );

  const presetsQuery = useEnrichmentPresets();
  const createPreviewMutation = useCreatePreview();
  const approveMutation = useApproveEnrichment();
  const applyMutation = useApplyResults();

  const enrichmentRequestId = preview?.enrichment_request_id ?? null;

  const statusQuery = useEnrichmentStatus(
    enrichmentRequestId,
    baseStep === "processing"
  );

  const resultsQuery = useEnrichmentResults(
    enrichmentRequestId,
    statusQuery.data?.status === "RESULTS_READY"
  );

  const step: EnrichmentWorkflowStep = useMemo(() => {
    if (baseStep === "processing") {
      if (statusQuery.data?.status === "RESULTS_READY") {
        return "results";
      }
      if (statusQuery.data?.status === "FAILED") {
        return "select-type";
      }
    }
    return baseStep;
  }, [baseStep, statusQuery.data?.status]);

  useEffect(() => {
    if (baseStep !== "processing") {
      return;
    }
    if (statusQuery.data?.status !== "FAILED") {
      return;
    }
    toast.error(
      `Enrichment failed: ${statusQuery.data?.error_message ?? "Unknown error"}`
    );
  }, [baseStep, statusQuery.data?.error_message, statusQuery.data?.status]);

  const results: EnrichmentResultsResponse | null = resultsQuery.data ?? null;

  const createPreview = async (
    request: CreatePreviewRequest,
    contacts: Array<{
      id: string;
      first_name: string;
      last_name: string;
      email_address: string;
    }>
  ) => {
    const result = await createPreviewMutation.mutateAsync({
      request,
      contacts,
    });
    setPreview(result);
    setBaseStep("preview");
    return result;
  };

  const approve = async () => {
    if (!preview) {
      return;
    }
    await approveMutation.mutateAsync(preview.enrichment_request_id);
    setBaseStep("processing");
    statusQuery.startPolling();
  };

  const apply = async () => {
    if (!preview) {
      return;
    }
    await applyMutation.mutateAsync(preview.enrichment_request_id);
  };

  const reset = () => {
    const id = enrichmentRequestId;
    setBaseStep("select-type");
    setPreview(null);
    statusQuery.stopPolling();
    if (id) {
      queryClient.removeQueries({ queryKey: enrichmentKeys.status(id) });
      queryClient.removeQueries({ queryKey: enrichmentKeys.results(id) });
    }
  };

  const goBack = () => {
    if (baseStep === "preview") {
      setBaseStep("select-type");
      setPreview(null);
    }
  };

  return {
    // State
    step,
    preview,
    results,
    selectedContactIds,

    // Queries
    presets: presetsQuery.data ?? [],
    isLoadingPresets: presetsQuery.isLoading,
    status: statusQuery.data,
    isPolling: statusQuery.isPolling,

    // Loading states
    isCreatingPreview: createPreviewMutation.isPending,
    isApproving: approveMutation.isPending,
    isApplying: applyMutation.isPending,
    isLoadingResults: resultsQuery.isLoading,

    // Actions
    createPreview,
    approve,
    apply,
    reset,
    goBack,
  };
};
