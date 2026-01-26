import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchUploadHistory, uploadFileWithMapping } from "@/leads/services";
import type { FileUploadPayload } from "@/leads/types";

export const UPLOAD_HISTORY_QUERY_KEY = ["uploadHistory"] as const;

interface UseUploadHistoryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useUploadHistory(params: UseUploadHistoryParams = {}) {
  return useQuery({
    queryKey: [...UPLOAD_HISTORY_QUERY_KEY, params],
    queryFn: () => fetchUploadHistory(params),
    staleTime: 10_000,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FileUploadPayload) => uploadFileWithMapping(payload),
    onSuccess: (upload) => {
      queryClient.invalidateQueries({ queryKey: UPLOAD_HISTORY_QUERY_KEY });
      toast.success(`File "${upload.filename}" uploaded successfully`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload file"
      );
      console.error("Upload file error:", error);
    },
  });
}
