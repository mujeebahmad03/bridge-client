// ==================== Import Sources ====================
export interface ImportSource {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  type: "file" | "integration";
}

// ==================== Workflow Templates ====================
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

// ==================== Validator Types ====================
export const VALIDATOR_TYPES = [
  "TEXT",
  "EMAIL_ADDRESS",
  "NUMBER",
  "PHONE",
  "URL",
  "NONE",
] as const;
export type ValidatorType = (typeof VALIDATOR_TYPES)[number];

// ==================== System Fields ====================
export const SYSTEM_FIELD_KEYS = [
  "FIRST_NAME",
  "LAST_NAME",
  "OTHER_NAMES",
  "EMAIL_ADDRESS",
  "PRIMARY_PHONE_NUMBER",
  "LINKEDIN_PROFILE",
  "ADDRESS_LINE_1",
  "ADDRESS_LINE_2",
  "STREET",
  "CITY",
  "STATE",
  "COUNTRY",
  "ZIP_CODE",
  "PROFILE_IMAGE",
  "COMPANY_NAME",
  "COMPANY_WEBSITE",
  "COMPANY_SOCIAL_PROFILE",
  "ACQUISITION_SOURCE",
  "HEADLINE",
  "DESCRIPTION",
  "SUMMARY",
  "SKILLS",
  "INTERESTS",
] as const;

export type SystemFieldKey = (typeof SYSTEM_FIELD_KEYS)[number];

export interface SystemField {
  id: SystemFieldKey;
  name: string;
  validatorType: ValidatorType;
  required: boolean;
}

// ==================== Custom Fields ====================
export interface CustomField {
  id: string;
  name: string;
  validator_type: ValidatorType;
  description: string;
  created_at: string;
  last_modified_at: string;
}

export interface CreateCustomFieldPayload {
  name: string;
  validator_type: ValidatorType;
  description: string;
}

// ==================== Field Mapping ====================
export interface FieldMapping {
  sourceField: string;
  targetFieldId: string; // SystemFieldKey or custom field UUID
  targetFieldName: string;
  isCustom: boolean;
}

export type FeatureMapping = Record<string, string>;

// ==================== File Upload ====================
export const UPLOAD_SOURCES = ["FILE_UPLOAD", "IMAP_SERVER"] as const;
export type UploadSource = (typeof UPLOAD_SOURCES)[number];

export interface FileUploadPayload {
  feature_mapping: string;
  source: UploadSource;
  filename: string;
  file: File;
}

// ==================== Upload History ====================
export type UploadStatus = "IN_PROGRESS" | "SUCCESS" | "FAILED" | "UPLOADED";

export interface UploadHistoryItem {
  id: string;
  feature_mapping: FeatureMapping;
  extra_options: string | null;
  source: UploadSource;
  filename: string;
  status: UploadStatus;
  file: string;
  processed_at: string | null;
  created_at: string;
}

// ==================== File Validation ====================
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

// ==================== Upload Dialog State ====================
export type UploadStep = "upload" | "mapping" | "preview";

export interface UploadDialogState {
  step: UploadStep;
  file: File | null;
  validation: FileValidationResult | null;
  mappings: FieldMapping[];
  isValidating: boolean;
  isDragOver: boolean;
  isSubmitting: boolean;
}

export type UploadDialogAction =
  | { type: "SET_STEP"; payload: UploadStep }
  | { type: "SET_FILE"; payload: File }
  | { type: "SET_VALIDATION"; payload: FileValidationResult }
  | { type: "SET_MAPPINGS"; payload: FieldMapping[] }
  | { type: "SET_IS_VALIDATING"; payload: boolean }
  | { type: "SET_IS_DRAG_OVER"; payload: boolean }
  | { type: "SET_IS_SUBMITTING"; payload: boolean }
  | { type: "RESET" };
