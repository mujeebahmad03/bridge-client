import z from "zod";

import { UPLOAD_SOURCES, VALIDATOR_TYPES } from "@/leads/types";

// ==================== Custom Field Schemas ====================
export const validatorTypeSchema = z.enum(VALIDATOR_TYPES);

export const createCustomFieldSchema = z.object({
  name: z
    .string()
    .min(1, "Field name is required")
    .max(100, "Field name must be less than 100 characters")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_\s]*$/,
      "Field name must start with a letter and contain only letters, numbers, underscores, and spaces"
    ),
  validator_type: validatorTypeSchema,
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .default(""),
});

export const customFieldSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  validator_type: validatorTypeSchema,
  description: z.string(),
  created_at: z.string(),
  last_modified_at: z.string(),
});

// ==================== Pagination Schema ====================
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T
) =>
  z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(itemSchema),
  });

// ==================== Field Mapping Schema ====================
export const fieldMappingSchema = z.object({
  sourceField: z.string().min(1),
  targetFieldId: z.string().min(1),
  targetFieldName: z.string().min(1),
  isCustom: z.boolean(),
});

export const featureMappingSchema = z.record(z.string(), z.string());

// ==================== File Upload Schema ====================
export const uploadSourceSchema = z.enum(UPLOAD_SOURCES);

export const fileUploadPayloadSchema = z.object({
  feature_mapping: z.string(),
  source: uploadSourceSchema,
  filename: z.string().min(1),
  file: z.instanceof(File),
});

// ==================== Upload History Schema ====================
export const uploadStatusSchema = z.enum([
  "IN_PROGRESS",
  "SUCCESS",
  "FAILED",
  "UPLOADED",
]);

export const uploadHistoryItemSchema = z.object({
  id: z.uuid(),
  feature_mapping: featureMappingSchema,
  extra_options: z.string().nullable(),
  source: uploadSourceSchema,
  filename: z.string(),
  status: uploadStatusSchema,
  file: z.string(),
  processed_at: z.string().nullable(),
  created_at: z.string(),
});

// ==================== File Validation Schema ====================
export const fileValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  headers: z.array(z.string()),
  rowCount: z.number().nonnegative(),
  preview: z.array(z.record(z.string(), z.string())),
});

// ==================== CSV Header Validation ====================
export function validateCSVHeaders(headers: string[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (headers.length === 0) {
    errors.push("No headers found in the file");
    return { isValid: false, errors };
  }

  // Check for empty headers
  const emptyHeaders = headers.filter((h) => !h.trim());
  if (emptyHeaders.length > 0) {
    errors.push(`Found ${emptyHeaders.length} empty column header(s)`);
  }

  // Check for duplicate headers
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  headers.forEach((h) => {
    const normalized = h.trim().toLowerCase();
    if (seen.has(normalized)) {
      duplicates.add(h.trim());
    }
    seen.add(normalized);
  });

  if (duplicates.size > 0) {
    errors.push(
      `Duplicate column headers found: ${Array.from(duplicates).join(", ")}`
    );
  }

  return { isValid: errors.length === 0, errors };
}

// ==================== Type Exports ====================
export type CreateCustomFieldInput = z.infer<typeof createCustomFieldSchema>;
export type CustomFieldResponse = z.infer<typeof customFieldSchema>;
export type FieldMappingInput = z.infer<typeof fieldMappingSchema>;
export type FileUploadPayloadInput = z.infer<typeof fileUploadPayloadSchema>;
export type UploadHistoryItemResponse = z.infer<typeof uploadHistoryItemSchema>;
