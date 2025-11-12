import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CurrentTeamState {
  currentTeamId: string | null;
  setCurrentTeamId: (teamId: string | null) => void;
}

export const useCurrentTeam = create<CurrentTeamState>()(
  persist(
    (set) => ({
      currentTeamId: null,
      setCurrentTeamId: (teamId) => set({ currentTeamId: teamId }),
    }),
    {
      name: "current-team-storage",
    }
  )
);
