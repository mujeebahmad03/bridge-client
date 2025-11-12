import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { TeamMembersTable } from "@/teams/components";

const TeamsPage = () => {
  return (
    <Tabs
      defaultValue="members"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between">
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invites">Invites</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent
        value="members"
        className="relative flex flex-col gap-4 overflow-auto"
      >
        <TeamMembersTable />
      </TabsContent>
      <TabsContent value="invites" className="flex flex-col">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed" />
      </TabsContent>
    </Tabs>
  );
};

export default TeamsPage;
