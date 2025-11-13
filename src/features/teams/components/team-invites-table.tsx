import React from "react";

import { DataTable } from "@/components/data-table";

import { inviteColumns } from "./columns";
import { type TeamInvitation } from "@/teams/types";

export const TeamInvitesTable = ({
  teamInvites,
  isLoading,
}: {
  teamInvites: TeamInvitation[];
  isLoading: boolean;
}) => {
  return (
    <DataTable
      columns={inviteColumns}
      data={teamInvites}
      isLoading={isLoading}
      searchKey="email_address"
      searchPlaceholder="Search invites..."
      rowHeight="compact"
    />
  );
};
