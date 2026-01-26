import { AlertCircle, Upload } from "lucide-react";
import React from "react";

import { cn } from "@/lib/utils";

import type { FileValidationResult } from "@/leads/types";

interface FileDropZoneProps {
  isDragOver: boolean;
  isValidating: boolean;
  validation: FileValidationResult | null;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileDropZone({
  isDragOver,
  isValidating,
  validation,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
}: FileDropZoneProps) {
  return (
    <div className="space-y-4">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
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
            <p className="text-sm text-muted-foreground">Validating file...</p>
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
              onChange={onFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </>
        )}
      </div>

      {validation && !validation.isValid && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Validation Failed</p>
            <ul className="mt-1 space-y-1">
              {validation.errors.map((error) => (
                <li key={error} className="text-sm text-destructive/80">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
