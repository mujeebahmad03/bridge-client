import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ContactEvents } from "./contact-events";
import { TodaysTask } from "./todays-task";

export function DashboardTable() {
  return (
    <Tabs defaultValue="events" className="w-full flex-col justify-start gap-6">
      <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1">
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
      </TabsList>

      <TabsContent
        value="events"
        className="relative flex flex-col gap-4 overflow-auto"
      >
        <ContactEvents />
      </TabsContent>
      <TabsContent value="tasks" className="flex flex-col">
        <TodaysTask />
      </TabsContent>
      <TabsContent value="suggestions" className="flex flex-col">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed" />
      </TabsContent>
    </Tabs>
  );
}
