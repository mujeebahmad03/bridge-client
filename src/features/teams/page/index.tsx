"use client";

import { Mail, Users } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { TeamInvitesTable, TeamMembersTable } from "@/teams/components";
import { useGetTeamInvites, useGetTeamMembers } from "@/teams/hooks";

const TeamsPage = () => {
  const { teamMembers, isLoading } = useGetTeamMembers();
  const { teamInvites, isLoading: isLoadingInvites } = useGetTeamInvites();

  return (
    <Tabs
      defaultValue="members"
      className="w-full flex-col justify-start gap-6"
    >
      <TabsList>
        <TabsTrigger value="members" className="gap-2">
          <Users className="h-4 w-4" />
          Members
          <span className="ml-1 rounded-full bg-background px-2 py-0.5 text-xs">
            {teamMembers.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="invites" className="gap-2">
          <Mail className="h-4 w-4" />
          Invites
          <span className="ml-1 rounded-full bg-background px-2 py-0.5 text-xs">
            {teamInvites.filter((i) => i.status === "PENDING").length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="members"
        className="relative flex flex-col gap-4 overflow-auto"
      >
        <TeamMembersTable teamMembers={teamMembers} isLoading={isLoading} />
      </TabsContent>
      <TabsContent value="invites" className="flex flex-col">
        <TeamInvitesTable
          teamInvites={teamInvites}
          isLoading={isLoadingInvites}
        />
      </TabsContent>
    </Tabs>
  );
};

export default TeamsPage;
