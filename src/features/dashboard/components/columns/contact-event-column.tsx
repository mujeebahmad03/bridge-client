import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/ui/badge";

import type { ContactInteractionEvent } from "@/dashboard/types";

export const contactEventColumns: ColumnDef<ContactInteractionEvent>[] = [
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.contact}</div>;
    },
  },
  {
    accessorKey: "interaction_channel",
    header: "Channel",
    cell: ({ row }) => {
      const channel = row.original.interaction_channel;
      const channelColors: Record<string, string> = {
        EMAIL:
          "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        PHONE:
          "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
        LINKEDIN:
          "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      };
      const colorClass =
        channelColors[channel] ||
        "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800";

      return (
        <Badge variant="outline" className={colorClass}>
          {channel}
        </Badge>
      );
    },
  },
  {
    accessorKey: "event_type",
    header: "Event Type",
    cell: ({ row }) => {
      const eventType = row.original.event_type;
      const eventTypeLabels: Record<string, string> = {
        EMAIL_SENT: "Email Sent",
        EMAIL_OPENED: "Email Opened",
        CALL_MADE: "Call Made",
        MESSAGE_SENT: "Message Sent",
      };
      const label = eventTypeLabels[eventType] || eventType;

      return (
        <Badge variant="outline" className="text-muted-foreground">
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "occurred_at",
    header: "Date",
    cell: ({ row }) => {
      try {
        const date = new Date(row.original.occurred_at);
        return (
          <div className="text-sm text-muted-foreground">
            {format(date, "MMM d, yyyy HH:mm")}
          </div>
        );
      } catch {
        return (
          <div className="text-sm text-muted-foreground">
            {row.original.occurred_at}
          </div>
        );
      }
    },
  },
  {
    accessorKey: "performed_by",
    header: "Source",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {row.original.performed_by}
        </div>
      );
    },
  },
  {
    accessorKey: "user_performed_by",
    header: "User",
    cell: ({ row }) => {
      const userId = row.original.user_performed_by;
      // Truncate UUID for display
      const truncated = userId.length > 8 ? `${userId.slice(0, 8)}...` : userId;
      return (
        <div className="text-sm text-muted-foreground font-mono">
          {truncated}
        </div>
      );
    },
  },
];
