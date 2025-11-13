"use client";

import { TeamDialogs, TeamHeader, TeamTabs } from "@/teams/components";
import {
  useGetTeamInvites,
  useGetTeamMembers,
  useTeamDialogs,
} from "@/teams/hooks";

export const TeamsPage = () => {
  const { teamMembers, isLoading } = useGetTeamMembers();
  const { teamInvites, isLoading: isLoadingInvites } = useGetTeamInvites();
  const { dialog, openDialog, closeDialog } = useTeamDialogs();

  const handleConfirmRemove = () => {
    // Your remove logic here
    console.log("Removing member:", dialog.data);
    closeDialog();
  };

  const handleConfirmToggle = () => {
    // Your toggle logic here
    console.log("Toggling status for:", dialog.data);
    closeDialog();
  };

  return (
    <div className="space-y-6">
      <TeamHeader onInviteClick={() => openDialog("invite")} />

      <TeamTabs
        teamMembers={teamMembers}
        teamInvites={teamInvites}
        isLoadingMembers={isLoading}
        isLoadingInvites={isLoadingInvites}
      />

      <TeamDialogs
        dialogType={dialog.type}
        dialogData={dialog.data}
        onClose={closeDialog}
        onConfirmRemove={handleConfirmRemove}
        onConfirmToggle={handleConfirmToggle}
      />
    </div>
  );
};
