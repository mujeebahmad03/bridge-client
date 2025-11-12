import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api-client";

import { TEAM_QUERY_KEYS } from "@/teams/constants";
import type { CreateTeamFormData } from "@/teams/validations";

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  const createTeamMutation = useMutation({
    mutationFn: (data: CreateTeamFormData) =>
      apiClient.post(API_ROUTES.TEAM.CREATE_TEAM, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_QUERY_KEYS.all });
    },
    onError: (error: Error) => {
      console.error("Create team error:", error);
    },
  });

  return {
    createTeam: createTeamMutation.mutateAsync,
    isCreatingTeam: createTeamMutation.isPending,
    createTeamError: createTeamMutation.error,
  };
};
