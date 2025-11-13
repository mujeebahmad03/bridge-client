import { useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api-client";

import { TASK_QUERY_KEYS } from "@/tasks/constants";
import type { Task } from "@/tasks/types";

export const useTasks = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: TASK_QUERY_KEYS.all,
    queryFn: () =>
      apiClient.get<{ results: Task[] }>(API_ROUTES.TASKS.GET_TASKS),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true,
  });

  return { tasks: data?.data?.results ?? [], isLoading, error };
};
