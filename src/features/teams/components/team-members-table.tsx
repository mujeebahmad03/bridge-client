"use client";

import { DataTable } from "@/components/data-table/data-table";

import { teamMemberColumns } from "@/teams/components/columns";
import { type TeamMember } from "@/teams/types";

interface TeamMembersTableProps {
  teamMembers: TeamMember[];
  isLoading: boolean;
}

export const TeamMembersTable = ({
  teamMembers,
  isLoading,
}: TeamMembersTableProps) => {
  return (
    <DataTable
      columns={teamMemberColumns}
      data={teamMembers}
      searchKey="name"
      searchPlaceholder="Search team members..."
      isLoading={isLoading}
      rowHeight="compact"
    />
  );
};
