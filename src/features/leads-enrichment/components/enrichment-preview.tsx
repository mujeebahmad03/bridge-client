"use client";

import { useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useActiveMappings, useFileUploadStore } from "@/leads/stores";

export function EnrichmentPreview() {
  const validation = useFileUploadStore((state) => state.validation);
  const activeMappings = useActiveMappings();

  const getMappedData = useMemo(() => {
    if (!validation?.preview || activeMappings.length === 0) {
      return [];
    }

    return validation.preview.map((row) => {
      const mappedRow: Record<string, string> = {};
      activeMappings.forEach((mapping) => {
        if (mapping.targetFieldId) {
          const value = row[mapping.sourceField];
          if (value) {
            mappedRow[mapping.targetFieldName] = value;
          }
        }
      });
      return mappedRow;
    });
  }, [validation, activeMappings]);

  if (!validation) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Showing preview of {Math.min(5, validation.preview.length)} /{" "}
            {validation.rowCount} records
          </span>
        </div>
        <div className="flex flex-wrap gap-1">
          {activeMappings.slice(0, 3).map((m) => (
            <span
              key={m.sourceField}
              className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {m.targetFieldName}
            </span>
          ))}
          {activeMappings.length > 3 && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              +{activeMappings.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center font-medium">
                  #
                </TableHead>
                {activeMappings.map((mapping) => (
                  <TableHead
                    key={mapping.sourceField}
                    className="font-medium whitespace-nowrap"
                  >
                    {mapping.targetFieldName}
                    {mapping.isCustom && (
                      <span className="ml-1.5 text-[10px] text-primary">
                        (custom)
                      </span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {getMappedData.slice(0, 5).map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="text-center text-muted-foreground font-mono text-xs">
                    {rowIndex + 1}
                  </TableCell>
                  {activeMappings.map((mapping) => (
                    <TableCell
                      key={mapping.sourceField}
                      className="whitespace-nowrap"
                    >
                      <span className="text-sm text-foreground">
                        {row[mapping.targetFieldName] || (
                          <span className="text-muted-foreground/50 italic">
                            empty
                          </span>
                        )}
                      </span>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {validation.rowCount > 5 && (
        <p className="text-center text-xs text-muted-foreground">
          + {validation.rowCount - 5} more records not shown in preview
        </p>
      )}
    </div>
  );
}
