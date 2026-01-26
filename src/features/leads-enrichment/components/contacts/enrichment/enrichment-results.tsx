import { CheckCircle2, Download, ExternalLink, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { type EnrichmentResultsResponse } from "@/leads/types";

interface EnrichmentResultsProps {
  results: EnrichmentResultsResponse | null;
  isLoading: boolean;
  onApply: () => void;
  isApplying: boolean;
  isApplied: boolean;
}

export function EnrichmentResults({
  results,
  isLoading,
  onApply,
  isApplying,
  isApplied,
}: EnrichmentResultsProps) {
  if (isLoading || !results) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // Get all unique enriched fields from the results
  const enrichedFields = new Set<string>();
  Object.values(results.result_data.records).forEach((record) => {
    Object.keys(record).forEach((key) => enrichedFields.add(key));
  });
  const fieldsList = Array.from(enrichedFields);

  // Count how many contacts got each field
  const fieldCounts = fieldsList.map((field) => ({
    field,
    count: Object.values(results.result_data.records).filter((r) => r[field])
      .length,
    total: results.contacts.length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-normal">
            <Sparkles className="h-3 w-3 mr-1" />
            Results Ready
          </Badge>
          <Badge variant="secondary" className="font-normal">
            {results.contacts.length} contact
            {results.contacts.length !== 1 ? "s" : ""} enriched
          </Badge>
        </div>
        {isApplied && (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Applied
          </Badge>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {fieldCounts.map(({ field, count, total }) => (
          <div
            key={field}
            className="rounded-lg border bg-card p-3 text-center"
          >
            <div className="text-2xl font-bold text-primary">{count}</div>
            <div className="text-xs text-muted-foreground">
              {field.replace(/_/g, " ")}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {Math.round((count / total) * 100)}% success
            </div>
          </div>
        ))}
      </div>

      {/* Results Table */}
      <div className="rounded-lg border bg-card">
        <ScrollArea className="max-h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px] sticky left-0 bg-card">
                  Name
                </TableHead>
                {fieldsList.map((field) => (
                  <TableHead key={field} className="min-w-[150px]">
                    {field.replace(/_/g, " ")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.contacts.map((contact) => {
                const enrichedData =
                  results.result_data.records[contact.id] || {};
                return (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium sticky left-0 bg-card">
                      {contact.first_name} {contact.last_name}
                    </TableCell>
                    {fieldsList.map((field) => {
                      const value = enrichedData[field];
                      const isUrl = value?.startsWith("http");
                      return (
                        <TableCell key={field}>
                          {value ? (
                            isUrl ? (
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span className="truncate max-w-[150px]">
                                  {value.replace(/^https?:\/\/(www\.)?/, "")}
                                </span>
                              </a>
                            ) : (
                              <span className="text-foreground">{value}</span>
                            )
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Results
        </Button>
        {!isApplied && (
          <Button onClick={onApply} disabled={isApplying} className="gap-2">
            {isApplying ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Applying...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Apply to Contacts
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
