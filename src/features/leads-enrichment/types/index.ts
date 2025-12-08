export interface ImportSource {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  type: "file" | "integration";
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: WorkflowCategory;
  estimatedTime: string;
  popularity: "high" | "medium" | "low";
}

export type WorkflowCategory =
  | "email"
  | "phone"
  | "social"
  | "company"
  | "verification";

export interface EnrichmentHistoryItem {
  id: string;
  name: string;
  source: string;
  template: string;
  status: EnrichmentStatus;
  totalRecords: number;
  enrichedRecords: number;
  createdAt: Date;
  completedAt: Date | null;
}

export type EnrichmentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  isCustom: boolean;
}

export interface SystemField {
  id: string;
  name: string;
  type: "text" | "email" | "phone" | "url" | "number";
  required: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  headers: string[];
  rowCount: number;
  preview: Record<string, string>[];
}

export interface UploadedFile {
  file: File;
  validation: FileValidationResult;
}

export interface ColumnMappingState {
  mappings: FieldMapping[];
  unmappedSourceFields: string[];
  unmappedTargetFields: string[];
}
