"use client";

import { DataTable } from "@/components/data-table";

import { teamMemberColumns } from "@/teams/components/columns";
import { useGetTeamMembers } from "@/teams/hooks";

export const TeamMembersTable = () => {
  const { teamMembers, isLoading } = useGetTeamMembers();

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
