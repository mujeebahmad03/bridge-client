import { useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api-client";

import { DASHBOARD_QUERY_KEYS } from "@/dashboard/constants";
import type { Task } from "@/dashboard/types";

export const useTasks = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.TASKS,
    queryFn: () =>
      apiClient.get<{ results: Task[] }>(API_ROUTES.DASHBOARD.GET_TASKS),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
  });

  return { tasks: data?.data?.results ?? [], isLoading, error };
};
