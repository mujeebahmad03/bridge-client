import type { FileValidationResult } from "@/leads/types";
import { validateCSVHeaders } from "@/leads/validations";

const ALLOWED_MIME_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ALLOWED_EXTENSIONS = [".csv", ".xls", ".xlsx"];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileType(file: File): {
  isValid: boolean;
  error?: string;
} {
  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  // Some systems don't set MIME type correctly for CSV
  if (
    extension === ".csv" &&
    file.type &&
    !ALLOWED_MIME_TYPES.includes(file.type) &&
    file.type !== "text/plain"
  ) {
    return {
      isValid: false,
      error: "Invalid file format. Please upload a valid CSV file.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit.`,
    };
  }

  return { isValid: true };
}

export async function parseCSVFile(file: File): Promise<FileValidationResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim());

        if (lines.length === 0) {
          resolve({
            isValid: false,
            errors: ["File is empty"],
            headers: [],
            rowCount: 0,
            preview: [],
          });
          return;
        }

        const headers = parseCSVLine(lines[0]);

        // Validate headers using Zod schema
        const headerValidation = validateCSVHeaders(headers);
        if (!headerValidation.isValid) {
          resolve({
            isValid: false,
            errors: headerValidation.errors,
            headers: [],
            rowCount: 0,
            preview: [],
          });
          return;
        }

        const dataLines = lines.slice(1);
        const preview: Record<string, string>[] = [];
        const errors: string[] = [];

        for (let i = 0; i < Math.min(5, dataLines.length); i++) {
          const values = parseCSVLine(dataLines[i]);
          const row: Record<string, string> = {};

          headers.forEach((header, idx) => {
            row[header] = values[idx] || "";
          });

          preview.push(row);
        }

        // Basic validation
        if (dataLines.length === 0) {
          errors.push("File contains no data rows");
        }

        resolve({
          isValid: errors.length === 0,
          errors,
          headers,
          rowCount: dataLines.length,
          preview,
        });
      } catch (error) {
        console.error(error);
        resolve({
          isValid: false,
          errors: ["Failed to parse file. Please ensure it is a valid CSV."],
          headers: [],
          rowCount: 0,
          preview: [],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        isValid: false,
        errors: ["Failed to read file"],
        headers: [],
        rowCount: 0,
        preview: [],
      });
    };

    reader.readAsText(file);
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export function getSampleValuesForField(
  preview: Record<string, string>[],
  fieldName: string
): string[] {
  return preview.map((row) => row[fieldName] || "").filter(Boolean);
}
