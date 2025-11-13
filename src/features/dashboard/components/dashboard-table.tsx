"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ContactEvents } from "./contact-events";
import { TodaysTask } from "./todays-task";

export function DashboardTable() {
  return (
    <Tabs defaultValue="events" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>

        <Select defaultValue="events">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="events">Events</SelectItem>
            <SelectItem value="tasks">Tasks</SelectItem>
            <SelectItem value="suggestions">Suggestions</SelectItem>
          </SelectContent>
        </Select>

        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>
      </div>

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
