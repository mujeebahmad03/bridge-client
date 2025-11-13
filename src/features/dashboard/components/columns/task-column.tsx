import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Badge } from "@/ui/badge";
import { Checkbox } from "@/ui/checkbox";

import { type Task } from "@/tasks/types";

export const taskColumns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
  },
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.content}
      </div>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const { priority } = row.original;
      const priorityColors: Record<string, string> = {
        LOW: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800",
        MEDIUM:
          "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
        HIGH: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
        URGENT:
          "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
      };
      const colorClass =
        priorityColors[priority] ||
        "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800";

      return (
        <Badge variant="outline" className={colorClass}>
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isCompleted = row.original.completed_at !== null;
      return (
        <Badge
          variant="outline"
          className={
            isCompleted
              ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
              : "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800"
          }
        >
          {isCompleted ? "Completed" : "Pending"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "assigned_to",
    header: "Assigned To",
    cell: ({ row }) => {
      const userId = row.original.assigned_to;
      // Truncate UUID for display
      const truncated = userId.length > 8 ? `${userId.slice(0, 8)}...` : userId;
      return (
        <div className="text-sm text-muted-foreground font-mono">
          {truncated}
        </div>
      );
    },
  },
  {
    accessorKey: "related_contacts",
    header: "Contacts",
    cell: ({ row }) => {
      const contacts = row.original.related_contacts;
      const count = contacts?.length ?? 0;
      return (
        <div className="text-sm text-muted-foreground">
          {count > 0 ? `${count} contact${count !== 1 ? "s" : ""}` : "None"}
        </div>
      );
    },
  },
  {
    accessorKey: "due_at",
    header: "Due Date",
    cell: ({ row }) => {
      try {
        const date = new Date(row.original.due_at);
        return (
          <div className="text-sm text-muted-foreground">
            {format(date, "MMM d, yyyy")}
          </div>
        );
      } catch {
        return (
          <div className="text-sm text-muted-foreground">
            {row.original.due_at}
          </div>
        );
      }
    },
  },
  {
    accessorKey: "completed_at",
    header: "Completed At",
    cell: ({ row }) => {
      const completedAt = row.original.completed_at;
      if (!completedAt) {
        return <div className="text-sm text-muted-foreground">—</div>;
      }
      try {
        const date = new Date(completedAt);
        return (
          <div className="text-sm text-muted-foreground">
            {format(date, "MMM d, yyyy HH:mm")}
          </div>
        );
      } catch {
        return (
          <div className="text-sm text-muted-foreground">{completedAt}</div>
        );
      }
    },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => {
      try {
        const date = new Date(row.original.created_at);
        return (
          <div className="text-sm text-muted-foreground">
            {format(date, "MMM d, yyyy")}
          </div>
        );
      } catch {
        return (
          <div className="text-sm text-muted-foreground">
            {row.original.created_at}
          </div>
        );
      }
    },
  },
  {
    accessorKey: "last_modified_at",
    header: "Last Modified",
    cell: ({ row }) => {
      try {
        const date = new Date(row.original.last_modified_at);
        return (
          <div className="text-sm text-muted-foreground">
            {format(date, "MMM d, yyyy HH:mm")}
          </div>
        );
      } catch {
        return (
          <div className="text-sm text-muted-foreground">
            {row.original.last_modified_at}
          </div>
        );
      }
    },
  },
];
