import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  FileSpreadsheet,
  Sparkles,
  Upload,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { v7 } from "uuid";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { ColumnMapper } from "./column-mapping";
import type { FieldMapping, FileValidationResult } from "@/leads/types";
import { parseCSVFile, validateFileType } from "@/leads/utils";

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = "upload" | "mapping" | "preview";

export function FileUploadDialog({
  open,
  onOpenChange,
}: FileUploadDialogProps) {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<FileValidationResult | null>(
    null
  );
  const [isValidating, setIsValidating] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);

  const handleReset = useCallback(() => {
    setStep("upload");
    setFile(null);
    setValidation(null);
    setMappings([]);
    setIsValidating(false);
  }, []);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setTimeout(handleReset, 200);
  }, [onOpenChange, handleReset]);

  const processFile = useCallback(async (selectedFile: File) => {
    const typeValidation = validateFileType(selectedFile);

    if (!typeValidation.isValid) {
      toast.error(typeValidation.error);
      return;
    }

    setFile(selectedFile);
    setIsValidating(true);

    const result = await parseCSVFile(selectedFile);
    setValidation(result);
    setIsValidating(false);

    if (result.isValid) {
      setStep("mapping");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const [droppedFile] = e.dataTransfer.files;
      if (droppedFile) {
        processFile(droppedFile);
      }
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        processFile(selectedFile);
      }
    },
    [processFile]
  );

  const handleMappingsChange = useCallback((newMappings: FieldMapping[]) => {
    setMappings(newMappings);
  }, []);

  const handleEnrich = useCallback(() => {
    toast.info("Enrichment started! This feature is coming soon.");
  }, []);

  const getMappedData = useCallback(() => {
    if (!validation?.preview || mappings.length === 0) {
      return [];
    }

    return validation.preview.map((row) => {
      const mappedRow: Record<string, string> = {};
      mappings.forEach((mapping) => {
        if (mapping.targetField) {
          const sourceIndex = validation.headers.indexOf(mapping.sourceField);
          if (sourceIndex !== -1 && row[sourceIndex]) {
            mappedRow[mapping.targetField] = row[sourceIndex];
          }
        }
      });
      return mappedRow;
    });
  }, [validation, mappings]);

  const activeMappings = mappings.filter((m) => m.targetField);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            {step === "upload" && "Upload Your File"}
            {step === "mapping" && "Map Your Columns"}
            {step === "preview" && "Preview & Enrich"}
          </DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Upload a CSV or Excel file containing your leads data"}
            {step === "mapping" &&
              "Match your file columns to the system fields"}
            {step === "preview" &&
              `Review ${validation?.rowCount ?? 0} records before enrichment`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {step === "upload" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 transition-all duration-200",
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50",
                  isValidating && "pointer-events-none opacity-50"
                )}
              >
                {isValidating ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Validating file...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                      <Upload className="h-8 w-8 text-accent-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-foreground">
                        Drag and drop your file here
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        or click to browse from your computer
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Supports CSV, XLS, XLSX up to 10MB
                    </p>
                    <input
                      type="file"
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileSelect}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </>
                )}
              </div>

              {validation && !validation.isValid && (
                <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">
                      Validation Failed
                    </p>
                    <ul className="mt-1 space-y-1">
                      {validation.errors.map((error) => (
                        <li key={v7()} className="text-sm text-destructive/80">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "mapping" && validation && (
            <ColumnMapper
              sourceFields={validation.headers}
              preview={validation.preview}
              mappings={mappings}
              onMappingsChange={handleMappingsChange}
            />
          )}

          {step === "preview" && validation && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    Showing preview of {Math.min(5, validation.preview.length)}{" "}
                    / {validation.rowCount} records
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {activeMappings.slice(0, 3).map((m) => (
                    <span
                      key={v7()}
                      className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                      {m.targetField}
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
                            key={v7()}
                            className="font-medium whitespace-nowrap"
                          >
                            {mapping.targetField}
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
                      {getMappedData()
                        .slice(0, 5)
                        .map((row) => (
                          <TableRow
                            key={v7()}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <TableCell className="text-center text-muted-foreground font-mono text-xs">
                              {v7()}
                            </TableCell>
                            {activeMappings.map((mapping) => (
                              <TableCell
                                key={v7()}
                                className="whitespace-nowrap"
                              >
                                <span className="text-sm text-foreground">
                                  {row[mapping.targetField ?? ""] || (
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
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {step !== "upload" && (
            <Button
              variant="outline"
              onClick={() => setStep(step === "preview" ? "mapping" : "upload")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>

          {step === "mapping" && (
            <Button
              onClick={() => setStep("preview")}
              disabled={activeMappings.length === 0}
              className="gap-2"
            >
              Preview Data
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          {step === "preview" && (
            <Button onClick={handleEnrich} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Enrich {validation?.rowCount} Records
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
