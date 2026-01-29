"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Download, Eye, MoreHorizontal, Trash2 } from "lucide-react";

import { SortableHeader } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

import { statusConfig } from "@/leads/constants";
import type { EnrichmentHistoryItem, EnrichmentStatus } from "@/leads/types";

export const columns: ColumnDef<EnrichmentHistoryItem>[] = [
  {
    accessorKey: "presetAction",
    header: ({ column }) => <SortableHeader column={column} title="Action" />,
    cell: ({ row }) => (
      <span className="font-medium text-foreground">
        {row.getValue("presetAction") ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "enrichmentType",
    header: ({ column }) => <SortableHeader column={column} title="Type" />,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.getValue("enrichmentType")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <SortableHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as EnrichmentStatus;
      const config = statusConfig[status];
      return (
        <Badge
          variant="secondary"
          className={cn("font-medium", config.className)}
        >
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "contactCount",
    header: ({ column }) => <SortableHeader column={column} title="Contacts" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue("contactCount")}
      </span>
    ),
  },
  {
    accessorKey: "pipe0JobId",
    header: "Job ID",
    cell: ({ row }) => (
      <span className="text-xs font-mono text-muted-foreground">
        {row.getValue("pipe0JobId")}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} title="Created" />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(row.getValue("createdAt")), "MMM d, yyyy HH:mm")}
      </span>
    ),
  },
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem className="gap-2">
            <Eye className="h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive">
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
