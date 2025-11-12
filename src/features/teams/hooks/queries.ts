import { useQuery } from "@tanstack/react-query";

import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api-client";

import { useTeamSwitcher } from "@/layout/hooks";
import { TEAM_QUERY_KEYS } from "@/teams/constants";
import type { Team, TeamMember } from "@/teams/types";
import { getTeamLogo } from "@/teams/utils";

export const useGetTeams = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: TEAM_QUERY_KEYS.all,
    queryFn: async () =>
      apiClient.get<{ results: Team[] }>(API_ROUTES.TEAM.GET_TEAMS),
    select: (data) =>
      data.data?.results.map((team) => ({
        ...team,
        logo: getTeamLogo(team.id),
      })),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    teams: data ?? [],
    isLoading,
    error,
    refetch,
  };
};

export const useGetTeamMembers = () => {
  const { currentTeamId } = useTeamSwitcher();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: TEAM_QUERY_KEYS.members(currentTeamId ?? ""),
    queryFn: async () =>
      apiClient.get<{ members: TeamMember[] }>(
        API_ROUTES.TEAM.GET_TEAM_MEMBERS(currentTeamId ?? "")
      ),
    select: (data) => data.data?.members,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!currentTeamId,
  });

  return {
    teamMembers: data ?? [],
    error,
    refetch,
    isLoading,
  };
};
