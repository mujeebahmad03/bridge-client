"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Download, Eye, MoreHorizontal, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";

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

import { useUploadHistory } from "@/leads/hooks";
import type { UploadHistoryItem, UploadStatus } from "@/leads/types";

const statusConfig: Record<UploadStatus, { label: string; className: string }> =
  {
    IN_PROGRESS: {
      label: "Pending",
      className: "bg-muted text-muted-foreground",
    },
    SUCCESS: {
      label: "Completed",
      className: "bg-success/10 text-success",
    },
    FAILED: {
      label: "Failed",
      className: "bg-destructive/10 text-destructive",
    },
    UPLOADED: {
      label: "Uploaded",
      className: "bg-blue-500/10 text-blue-500",
    },
  };

interface UploadHistoryTableProps {
  className?: string;
}

export function UploadHistoryTable({ className }: UploadHistoryTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const { data, isLoading } = useUploadHistory({
    page,
    pageSize,
    search: search || undefined,
  });

  const columns = useMemo<ColumnDef<UploadHistoryItem>[]>(
    () => [
      {
        accessorKey: "filename",
        header: ({ column }) => (
          <SortableHeader column={column} title="Filename" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.getValue("filename")}
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
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.getValue("status") as UploadStatus;
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
        accessorKey: "feature_mapping",
        header: "Fields Mapped",
        cell: ({ row }) => {
          const mapping = row.getValue("feature_mapping") as Record<
            string,
            string
          >;
          const count = Object.keys(mapping).length;
          return (
            <span className="text-muted-foreground">
              {count} field{count !== 1 ? "s" : ""}
            </span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <SortableHeader column={column} title="Created" />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {format(new Date(row.getValue("created_at")), "MMM d, yyyy HH:mm")}
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
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Upload History
          </h2>
        </div>
        <p className="text-muted-foreground">
          View and manage your previous file uploads
        </p>
      </div>

      <NewDataTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search uploads..."
        emptyMessage="No uploads found"
        showPagination
        serverSidePagination
        currentPage={page}
        totalCount={data?.count}
        pageSize={pageSize}
        onPageChange={setPage}
        onSearchChange={setSearch}
      />
    </section>
  );
}
