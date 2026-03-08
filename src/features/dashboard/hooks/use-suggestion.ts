import { useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api-client";

import { DASHBOARD_QUERY_KEYS } from "../constants";

export const useSuggestion = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.SUGGESTION,
    queryFn: () => apiClient.get(API_ROUTES.DASHBOARD.BRIDGE_SUGGESTIONS),
  });

  console.log({ data: data?.data });

  return { data: data?.data ?? [], isLoading, error };
};
