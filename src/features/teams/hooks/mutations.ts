import { useMutation, useQueryClient } from "@tanstack/react-query";

import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api-client";

import { useTeamSwitcher } from "@/layout/hooks";
import { TEAM_QUERY_KEYS } from "@/teams/constants";
import type { CreateTeamFormData, InviteFormData } from "@/teams/validations";

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

export const useInviteUser = () => {
  const queryClient = useQueryClient();
  const { currentTeamId } = useTeamSwitcher();

  const inviteUserMutation = useMutation({
    mutationFn: (data: InviteFormData) =>
      apiClient.post(
        API_ROUTES.INVITE.SEND_INVITE(currentTeamId ?? ""),
        data.invites.map((invite) => ({
          email_address: invite.email,
          role: invite.role,
        }))
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TEAM_QUERY_KEYS.invites(currentTeamId ?? ""),
      });
    },
    onError: (error: Error) => {
      console.error("Invite user error:", error);
    },
  });

  return {
    inviteUser: inviteUserMutation.mutateAsync,
    isInvitingUser: inviteUserMutation.isPending,
    inviteUserError: inviteUserMutation.error,
  };
};
