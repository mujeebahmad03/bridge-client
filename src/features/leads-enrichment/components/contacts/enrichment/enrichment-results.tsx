import { CheckCircle2, ExternalLink, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { EnrichmentResultsResponse } from "@/leads/types";
import {
  EXCLUDED_FIELDS,
  formatFieldName,
  getFieldValue,
  isUrl,
} from "@/leads/utils";

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
  isApplied,
}: EnrichmentResultsProps) {
  if (isLoading || !results) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-[200px] w-full" />
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    );
  }

  const { parsed_results, contacts, summary } = results;

  // Get all unique enriched fields (excluding internal fields)
  const enrichedFields = new Set<string>();
  Object.values(parsed_results).forEach((record) => {
    Object.keys(record).forEach((key) => {
      if (!EXCLUDED_FIELDS.has(key)) {
        enrichedFields.add(key);
      }
    });
  });
  const fieldsList = Array.from(enrichedFields);

  // Count how many contacts got each field with non-empty values
  const fieldCounts = fieldsList.map((field) => {
    const count = Object.values(parsed_results).filter((record) => {
      const value = getFieldValue(record[field]);

      return value && String(value).trim() !== "";
    }).length;

    return { field, count, total: contacts.length };
  });

  // Filter to only show fields that have at least one result
  const fieldsWithData = fieldCounts.filter((f) => f.count > 0);

  return (
    <>
      <div className="flex flex-col gap-5 overflow-x-auto">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20 font-normal">
            <Sparkles className="h-3 w-3 mr-1" />
            Results Ready
          </Badge>
          <Badge variant="secondary" className="font-normal">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} enriched
          </Badge>
          {summary && (
            <Badge variant="outline" className="font-normal">
              {summary.total_fields} fields found
            </Badge>
          )}
          {isApplied && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 ml-auto">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Applied
            </Badge>
          )}
        </div>

        {/* Stats Summary */}
        {fieldsWithData.length > 0 && (
          <div className="grid grid-cols-2 gap-3 w-full">
            {fieldsWithData.slice(0, 4).map(({ field, count, total }) => (
              <div
                key={field}
                className="rounded-lg border bg-card p-3 text-center"
              >
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {formatFieldName(field)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {Math.round((count / total) * 100)}% success
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Table with constrained height and horizontal scroll */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[240px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-[140px] bg-card">Name</TableHead>
                  {fieldsList.map((field) => (
                    <TableHead key={field} className="min-w-[140px] bg-card">
                      {formatFieldName(field)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => {
                  const enrichedData = parsed_results[contact.id] || {};
                  return (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">
                        <span className="truncate block max-w-[130px]">
                          {contact.first_name} {contact.last_name}
                        </span>
                      </TableCell>
                      {fieldsList.map((field) => {
                        const value = getFieldValue(enrichedData[field]);
                        return (
                          <TableCell key={field}>
                            <CellValue value={value} />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}

// Extracted cell value component for cleaner rendering
function CellValue({ value }: { value: string }) {
  const normalizedValue = String(value).trim();

  if (!normalizedValue) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (isUrl(normalizedValue)) {
    return (
      <a
        href={normalizedValue}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-primary hover:underline max-w-[140px]"
      >
        <ExternalLink className="h-3 w-3 shrink-0" />
        <span className="truncate">
          {normalizedValue.replace(/^https?:\/\/(www\.)?/, "")}
        </span>
      </a>
    );
  }

  // Handle boolean-like values
  if (normalizedValue.toLowerCase() === "true") {
    return (
      <Badge
        variant="secondary"
        className="bg-green-500/10 text-green-600 border-green-500/20"
      >
        Yes
      </Badge>
    );
  }

  if (normalizedValue.toLowerCase() === "false") {
    return (
      <Badge variant="secondary" className="bg-muted text-muted-foreground">
        No
      </Badge>
    );
  }

  return (
    <span className="text-foreground truncate block max-w-[140px]">
      {normalizedValue}
    </span>
  );
}
