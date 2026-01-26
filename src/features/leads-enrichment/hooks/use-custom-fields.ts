import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createCustomField, fetchCustomFields } from "@/leads/services";
import type { CreateCustomFieldPayload } from "@/leads/types";
import { inferValidatorType } from "@/leads/utils";

export const CUSTOM_FIELDS_QUERY_KEY = ["customFields"] as const;

export function useCustomFields(search?: string) {
  return useQuery({
    queryKey: [...CUSTOM_FIELDS_QUERY_KEY, search],
    queryFn: () => fetchCustomFields({ search }),
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
