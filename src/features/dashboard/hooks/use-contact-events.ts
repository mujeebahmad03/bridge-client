import { useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api-client";

import { DASHBOARD_QUERY_KEYS } from "@/dashboard/constants";
import type { ContactInteractionEvent } from "@/dashboard/types";

export const useContactEvents = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.CONTACT_EVENTS,
    queryFn: () =>
      apiClient.get<{ results: ContactInteractionEvent[] }>(
        API_ROUTES.DASHBOARD.GET_CONTACT_EVENTS
      ),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });

  return { contactEvents: data?.data?.results ?? [], isLoading, error };
};
