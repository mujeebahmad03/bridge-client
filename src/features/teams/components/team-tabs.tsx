import { Mail, Users } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { TeamInvitesTable, TeamMembersTable } from "@/teams/components";
import { type TeamInvitation, type TeamMember } from "@/teams/types";

interface TeamTabsProps {
  teamMembers: TeamMember[];
  teamInvites: TeamInvitation[];
  isLoadingMembers: boolean;
  isLoadingInvites: boolean;
}

export const TeamTabs = ({
  teamMembers,
  teamInvites,
  isLoadingMembers,
  isLoadingInvites,
}: TeamTabsProps) => {
  const pendingInvites = teamInvites.filter((i) => i.status === "PENDING");

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
            {pendingInvites.length}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="members"
        className="relative flex flex-col gap-4 overflow-auto"
      >
        <TeamMembersTable
          teamMembers={teamMembers}
          isLoading={isLoadingMembers}
        />
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
