"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Download, Eye, History, MoreHorizontal, Trash2 } from "lucide-react";
import { useMemo } from "react";

import { SortableHeader } from "@/components/data-table";
import { NewDataTable } from "@/components/new-data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

import { SectionHeader } from "./section-header";
import type { EnrichmentHistoryItem, EnrichmentStatus } from "@/leads/types";

// Mock data for backwards compatibility
const mockEnrichmentHistory: EnrichmentHistoryItem[] = [
  {
    id: "1",
    name: "Q4 Prospects List",
    source: "CSV Upload",
    template: "Find Work Email",
    status: "SUCCESSFUL",
    totalRecords: 1250,
    enrichedRecords: 1180,
    createdAt: new Date("2024-01-15T10:30:00"),
    completedAt: new Date("2024-01-15T10:45:00"),
  },
  {
    id: "2",
    name: "HubSpot Contacts Sync",
    source: "HubSpot",
    template: "Verify Email",
    status: "IN_PROGRESS",
    totalRecords: 500,
    enrichedRecords: 234,
    createdAt: new Date("2024-01-16T14:00:00"),
    completedAt: null,
  },
  {
    id: "3",
    name: "Enterprise Leads",
    source: "CSV Upload",
    template: "Full Profile Enrichment",
    status: "SUCCESSFUL",
    totalRecords: 320,
    enrichedRecords: 298,
    createdAt: new Date("2024-01-14T09:15:00"),
    completedAt: new Date("2024-01-14T09:35:00"),
  },
];

const statusConfig: Record<
  EnrichmentStatus,
  { label: string; className: string }
> = {
  PREVIEW: {
    label: "Preview",
    className: "bg-muted text-muted-foreground",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-blue-500/10 text-blue-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-primary/10 text-primary animate-pulse",
  },
  RESULTS_READY: {
    label: "Results Ready",
    className: "bg-green-500/10 text-green-500",
  },
  SUCCESSFUL: {
    label: "Successful",
    className: "bg-success/10 text-success",
  },
  FAILED: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive",
  },
};

interface HistoryDataTableProps {
  className?: string;
}

export function HistoryDataTable({ className }: HistoryDataTableProps) {
  const columns = useMemo<ColumnDef<EnrichmentHistoryItem>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader column={column} title="Name" />,
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.getValue("name")}
          </span>
        ),
      },
      {
        accessorKey: "source",
        header: ({ column }) => (
          <SortableHeader column={column} title="Source" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.getValue("source")}
          </span>
        ),
      },
      {
        accessorKey: "template",
        header: ({ column }) => (
          <SortableHeader column={column} title="Template" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.getValue("template")}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column} title="Status" />
        ),
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
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => {
          const total = row.original.totalRecords;
          const enriched = row.original.enrichedRecords;
          const percentage =
            total > 0 ? Math.round((enriched / total) * 100) : 0;

          return (
            <div className="flex items-center gap-2">
              <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {enriched}/{total}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <SortableHeader column={column} title="Created" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {format(row.getValue("createdAt"), "MMM d, yyyy HH:mm")}
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
    ],
    []
  );

  return (
    <section className={cn("animate-fade-up", className)}>
      <SectionHeader
        icon={History}
        title="Enrichment History"
        description="View and manage your previous enrichment jobs"
      />

      <NewDataTable
        data={mockEnrichmentHistory}
        columns={columns}
        searchPlaceholder="Search enrichments..."
        emptyMessage="No enrichments found"
      />
    </section>
  );
}
