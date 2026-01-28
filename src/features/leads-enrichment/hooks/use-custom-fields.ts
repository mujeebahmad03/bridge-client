import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createCustomField, fetchCustomFields } from "@/leads/services";
import type { CreateCustomFieldPayload, CustomField } from "@/leads/types";
import { inferValidatorType } from "@/leads/utils";

export const CUSTOM_FIELDS_QUERY_KEY = ["customFields"] as const;

/**
 * Hook to fetch custom fields with optional search filter.
 * Returns paginated results from the dedicated custom fields endpoint.
 */
export function useCustomFields(search?: string) {
  return useQuery({
    queryKey: [...CUSTOM_FIELDS_QUERY_KEY, { search }],
    queryFn: async () => {
      const response = await fetchCustomFields({ search, page_size: 1000 });
      return response.results;
    },
    staleTime: 30_000,
  });
}

/**
 * Hook to fetch ALL custom fields (without pagination limits).
 * Useful for column selectors and mapping dropdowns.
 */
export function useAllCustomFields() {
  return useQuery<CustomField[]>({
    queryKey: [...CUSTOM_FIELDS_QUERY_KEY, "all"],
    queryFn: async () => {
      const response = await fetchCustomFields({ page_size: 1000 });
      return response.results;
    },
    staleTime: 30_000,
  });
}

export function useCreateCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCustomFieldPayload) =>
      createCustomField(payload),
    onSuccess: (newField) => {
      queryClient.invalidateQueries({ queryKey: CUSTOM_FIELDS_QUERY_KEY });
      toast.success(`Custom field "${newField.name}" created`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to create custom field"
      );
      console.error("Create custom field error:", error);
    },
  });
}

export function useInferValidatorType() {
  return (fieldName: string, sampleValues: string[]) => {
    return inferValidatorType(fieldName, sampleValues);
  };
}
