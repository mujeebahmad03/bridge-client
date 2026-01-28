export type EnrichmentPresetValue =
  | "FIND_LINKEDIN"
  | "FIND_PHONE"
  | "FIND_EMAIL"
  | "VALIDATE_EMAIL"
  | "FIND_WORK_EMAIL"
  | "ENRICH_FROM_LINKEDIN"
  | "FULL_ENRICHMENT";

export interface EnrichmentPreset {
  value: EnrichmentPresetValue;
  label: string;
  description: string;
}

export type EnrichmentType = "PRESET" | "CUSTOM";

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
  | "PREVIEW"
  | "APPROVED"
  | "IN_PROGRESS"
  | "RESULTS_READY"
  | "SUCCESSFUL"
  | "FAILED";

export interface PipelineConfig {
  pipe_id: string;
  config: {
    input_fields: Record<string, { alias: string }>;
    output_fields: Record<string, { alias: string }>;
  };
}

export interface EnrichmentContactPreview {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
}

export interface EnrichmentPreviewResponse {
  enrichment_request_id: string;
  status: EnrichmentStatus;
  enrichment_type: EnrichmentType;
  preset_action: EnrichmentPresetValue | null;
  enrichment_description: string;
  contact_count: number;
  is_contact_list: boolean;
  contact_list_id: string | null;
  contacts: EnrichmentContactPreview[];
  pipeline: PipelineConfig[];
  message: string;
}

export interface CreatePreviewRequest {
  contact_ids?: string[];
  contact_list_id?: string;
  enrichment_type: EnrichmentType;
  preset_action?: EnrichmentPresetValue;
  enrichment_description?: string;
}

export interface EnrichmentApproveResponse {
  enrichment_request_id: string;
  status: EnrichmentStatus;
  message: string;
}

export interface EnrichmentStatusResponse {
  id: string;
  enrichment_type: EnrichmentType;
  preset_action: EnrichmentPresetValue | null;
  status: EnrichmentStatus;
  pipe0_job_id: string | null;
  contact_count: number;
  created_at: string;
  last_modified_at: string;
  error_message?: string;
}

// @/leads/types/enrichment.ts

export interface EnrichmentFieldResult {
  value: string;
  validator_type: string;
  metadata: {
    source: string;
    original_field_name: string;
    alias: string;
    type: string;
    status: string;
    enrichment_timestamp: string | null;
  };
  status: string;
}

export interface EnrichmentResultContact {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  primary_phone_number: string | null;
  linkedin_profile: string | null;
}

export interface EnrichmentResultsSummary {
  total_contacts: number;
  total_fields: number;
  fields_by_type: Record<string, number>;
}

export interface EnrichmentResultsResponse {
  id: string;
  status: EnrichmentStatus;
  parsed_results: Record<string, Record<string, EnrichmentFieldResult>>;
  contacts: EnrichmentResultContact[];
  is_contact_list: boolean;
  summary: EnrichmentResultsSummary;
  error_message: string;
}

export interface EnrichmentApplyResponse {
  enrichment_request_id: string;
  message: string;
}

export interface EnrichmentListItem {
  id: string;
  enrichment_type: EnrichmentType;
  preset_action: EnrichmentPresetValue | null;
  status: EnrichmentStatus;
  contact_count: number;
  created_at: string;
}

export interface EnrichmentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EnrichmentListItem[];
}

// Workflow step type
export type EnrichmentWorkflowStep =
  | "select-type"
  | "preview"
  | "processing"
  | "results";
