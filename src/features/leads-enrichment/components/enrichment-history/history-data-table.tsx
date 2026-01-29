"use client";

import { History } from "lucide-react";

import { NewDataTable } from "@/components/new-data-table";

import { cn } from "@/lib/utils";

import { SectionHeader } from "../section-header";
import { columns } from "./column";
import { useEnrichmentHistory } from "@/leads/hooks";

interface HistoryDataTableProps {
  className?: string;
}

export function HistoryDataTable({ className }: HistoryDataTableProps) {
  const { data, isLoading } = useEnrichmentHistory({});

  return (
    <section className={cn("animate-fade-up", className)}>
      <SectionHeader
        icon={History}
        title="Enrichment History"
        description="View and manage your previous enrichment jobs"
      />

      <NewDataTable
        data={data?.results ?? []}
        columns={columns}
        searchPlaceholder="Search enrichments..."
        emptyMessage="No enrichments found"
        isLoading={isLoading}
      />
    </section>
  );
}
