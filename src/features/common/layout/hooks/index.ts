import { useEffect, useState } from "react";

import { useSidebar } from "@/ui/sidebar";

import { useGetTeams } from "@/teams/hooks";
import { useCurrentTeam } from "@/teams/stores";

export const useTeamSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useSidebar();
  const { teams, isLoading } = useGetTeams();
  const { currentTeamId, setCurrentTeamId } = useCurrentTeam();

  // Set default team if none selected
  useEffect(() => {
    if (!isLoading && teams.length > 0 && !currentTeamId) {
      setCurrentTeamId(teams[0].id);
    }
  }, [teams, isLoading, currentTeamId, setCurrentTeamId]);

  const currentTeam = teams.find((team) => team.id === currentTeamId);

  return {
    teams,
    isLoading,
    currentTeamId,
    setCurrentTeamId,
    isOpen,
    setIsOpen,
    isMobile,
    currentTeam,
  };
};
