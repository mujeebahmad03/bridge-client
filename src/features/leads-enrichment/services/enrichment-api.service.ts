// Mock Enrichment API Service

import type {
  CreatePreviewRequest,
  EnrichmentApplyResponse,
  EnrichmentApproveResponse,
  EnrichmentContactPreview,
  EnrichmentListResponse,
  EnrichmentPreset,
  EnrichmentPreviewResponse,
  EnrichmentResultsResponse,
  EnrichmentStatus,
  EnrichmentStatusResponse,
  PipelineConfig,
} from "@/leads/types";

// Simulate network delay
const simulateDelay = (ms: number = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock presets data
const MOCK_PRESETS: EnrichmentPreset[] = [
  {
    value: "FIND_LINKEDIN",
    label: "Find LinkedIn Profile",
    description: "Find LinkedIn profile URL from email address",
  },
  {
    value: "FIND_PHONE",
    label: "Find Phone Number",
    description: "Find phone number from LinkedIn profile",
  },
  {
    value: "FIND_EMAIL",
    label: "Find Email Address",
    description: "Find personal email from LinkedIn profile",
  },
  {
    value: "VALIDATE_EMAIL",
    label: "Validate Email",
    description: "Validate email address deliverability",
  },
  {
    value: "FIND_WORK_EMAIL",
    label: "Find Work Email",
    description: "Find work email from name and company",
  },
  {
    value: "ENRICH_FROM_LINKEDIN",
    label: "Enrich from LinkedIn",
    description: "Get full profile data from LinkedIn URL",
  },
  {
    value: "FULL_ENRICHMENT",
    label: "Full Enrichment",
    description: "Complete enrichment with AI reasoning",
  },
];

// In-memory store for enrichment requests
const enrichmentStore = new Map<
  string,
  {
    request: EnrichmentPreviewResponse;
    status: EnrichmentStatus;
    pollCount: number;
  }
>();

// Generate mock pipeline based on preset
const generateMockPipeline = (preset: string): PipelineConfig[] => {
  const pipelines: Record<string, PipelineConfig[]> = {
    FIND_LINKEDIN: [
      {
        pipe_id: "people:professionalprofileurl:email:waterfall@1",
        config: {
          input_fields: { email: { alias: "email_address" } },
          output_fields: {
            professional_profile_url: { alias: "linkedin_profile" },
          },
        },
      },
    ],
    FIND_PHONE: [
      {
        pipe_id: "people:phone:linkedin:waterfall@1",
        config: {
          input_fields: { linkedin_url: { alias: "linkedin_profile" } },
          output_fields: { phone_number: { alias: "primary_phone_number" } },
        },
      },
    ],
    FIND_EMAIL: [
      {
        pipe_id: "people:email:linkedin:waterfall@1",
        config: {
          input_fields: { linkedin_url: { alias: "linkedin_profile" } },
          output_fields: { personal_email: { alias: "personal_email" } },
        },
      },
    ],
    VALIDATE_EMAIL: [
      {
        pipe_id: "email:validation:deliverability@1",
        config: {
          input_fields: { email: { alias: "email_address" } },
          output_fields: {
            is_valid: { alias: "email_valid" },
            deliverability: { alias: "email_deliverability" },
          },
        },
      },
    ],
    FIND_WORK_EMAIL: [
      {
        pipe_id: "people:workemail:namecompany:waterfall@1",
        config: {
          input_fields: {
            first_name: { alias: "first_name" },
            last_name: { alias: "last_name" },
            company: { alias: "company" },
          },
          output_fields: { work_email: { alias: "work_email" } },
        },
      },
    ],
    ENRICH_FROM_LINKEDIN: [
      {
        pipe_id: "people:fullprofile:linkedin:scraper@1",
        config: {
          input_fields: { linkedin_url: { alias: "linkedin_profile" } },
          output_fields: {
            headline: { alias: "linkedin_headline" },
            company: { alias: "company" },
            location: { alias: "location" },
            connections: { alias: "linkedin_connections" },
          },
        },
      },
    ],
    FULL_ENRICHMENT: [
      {
        pipe_id: "people:professionalprofileurl:email:waterfall@1",
        config: {
          input_fields: { email: { alias: "email_address" } },
          output_fields: {
            professional_profile_url: { alias: "linkedin_profile" },
          },
        },
      },
      {
        pipe_id: "people:fullprofile:linkedin:scraper@1",
        config: {
          input_fields: { linkedin_url: { alias: "linkedin_profile" } },
          output_fields: {
            headline: { alias: "linkedin_headline" },
            company: { alias: "company" },
            phone: { alias: "primary_phone_number" },
          },
        },
      },
    ],
  };
  return pipelines[preset] || pipelines.FIND_LINKEDIN;
};

// Generate mock enrichment results
const generateMockResults = (
  contacts: EnrichmentContactPreview[],
  preset: string
) => {
  const results: Record<string, Record<string, string>> = {};

  contacts.forEach((contact) => {
    const mockData: Record<string, Record<string, string>> = {
      FIND_LINKEDIN: {
        linkedin_profile: `https://linkedin.com/in/${contact.first_name?.toLowerCase() ?? "user"}${contact.last_name?.toLowerCase() ?? ""}`,
      },
      FIND_PHONE: {
        primary_phone_number: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      },
      FIND_EMAIL: {
        personal_email: `${contact.first_name?.toLowerCase() ?? "user"}.personal@gmail.com`,
      },
      VALIDATE_EMAIL: {
        email_valid: "true",
        email_deliverability: "deliverable",
      },
      FIND_WORK_EMAIL: {
        work_email: `${contact.first_name?.toLowerCase() ?? "user"}.${contact.last_name?.toLowerCase() ?? "user"}@company.com`,
      },
      ENRICH_FROM_LINKEDIN: {
        linkedin_headline: "Senior Software Engineer",
        company: "Tech Company Inc.",
        location: "San Francisco, CA",
        linkedin_connections: "500+",
      },
      FULL_ENRICHMENT: {
        linkedin_profile: `https://linkedin.com/in/${contact.first_name?.toLowerCase() ?? "user"}${contact.last_name?.toLowerCase() ?? ""}`,
        linkedin_headline: "Senior Software Engineer",
        company: "Tech Company Inc.",
        primary_phone_number: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
      },
    };

    results[contact.id] = mockData[preset] || mockData.FIND_LINKEDIN;
  });

  return results;
};

// API Functions

export const fetchEnrichmentPresets = async (): Promise<EnrichmentPreset[]> => {
  await simulateDelay(500);
  return MOCK_PRESETS;
};

export const createEnrichmentPreview = async (
  request: CreatePreviewRequest,
  contacts: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email_address: string;
  }>
): Promise<EnrichmentPreviewResponse> => {
  await simulateDelay(1000);

  const requestId = crypto.randomUUID();
  const isCustom = request.enrichment_type === "CUSTOM";

  const response: EnrichmentPreviewResponse = {
    enrichment_request_id: requestId,
    status: "PREVIEW",
    enrichment_type: request.enrichment_type,
    preset_action: isCustom ? null : request.preset_action!,
    enrichment_description: request.enrichment_description ?? "",
    contact_count: contacts.length,
    is_contact_list: !!request.contact_list_id,
    contact_list_id: request.contact_list_id ?? null,
    contacts: contacts.map((c) => ({
      id: c.id,
      first_name: c.first_name,
      last_name: c.last_name,
      email_address: c.email_address,
    })),
    pipeline: isCustom
      ? [
          {
            pipe_id: "ai:custom:reasoning@1",
            config: {
              input_fields: {
                description: { alias: "enrichment_description" },
              },
              output_fields: { result: { alias: "ai_enrichment_result" } },
            },
          },
        ]
      : generateMockPipeline(request.preset_action!),
    message: "Preview generated. Call /approve/ to execute the enrichment.",
  };

  enrichmentStore.set(requestId, {
    request: response,
    status: "PREVIEW",
    pollCount: 0,
  });

  return response;
};

export const approveEnrichment = async (
  enrichmentRequestId: string
): Promise<EnrichmentApproveResponse> => {
  await simulateDelay(600);

  const stored = enrichmentStore.get(enrichmentRequestId);
  if (!stored) {
    throw new Error("Enrichment request not found");
  }

  stored.status = "APPROVED";
  stored.pollCount = 0;

  // Simulate transitioning to IN_PROGRESS after a short delay
  setTimeout(() => {
    const s = enrichmentStore.get(enrichmentRequestId);
    if (s) {
      s.status = "IN_PROGRESS";
    }
  }, 500);

  return {
    enrichment_request_id: enrichmentRequestId,
    status: "APPROVED",
    message: "Enrichment approved and job submitted",
  };
};

export const checkEnrichmentStatus = async (
  enrichmentRequestId: string
): Promise<EnrichmentStatusResponse> => {
  await simulateDelay(400);

  const stored = enrichmentStore.get(enrichmentRequestId);
  if (!stored) {
    throw new Error("Enrichment request not found");
  }

  // Simulate progress: after 3 polls, move to RESULTS_READY
  stored.pollCount++;
  if (stored.pollCount >= 3 && stored.status === "IN_PROGRESS") {
    stored.status = "RESULTS_READY";
  }

  return {
    id: enrichmentRequestId,
    enrichment_type: stored.request.enrichment_type,
    preset_action: stored.request.preset_action,
    status: stored.status,
    pipe0_job_id:
      stored.status !== "PREVIEW"
        ? `pipe0_job_${enrichmentRequestId.slice(0, 8)}`
        : null,
    contact_count: stored.request.contact_count,
    created_at: new Date(Date.now() - 60000).toISOString(),
    last_modified_at: new Date().toISOString(),
  };
};

export const getEnrichmentResults = async (
  enrichmentRequestId: string
): Promise<EnrichmentResultsResponse> => {
  await simulateDelay(600);

  const stored = enrichmentStore.get(enrichmentRequestId);
  if (!stored) {
    throw new Error("Enrichment request not found");
  }

  const preset = stored.request.preset_action ?? "FIND_LINKEDIN";
  const records = generateMockResults(stored.request.contacts, preset);

  return {
    id: enrichmentRequestId,
    status: stored.status,
    result_data: { records },
    contacts: stored.request.contacts.map((c) => ({
      ...c,
      ...records[c.id],
    })),
  };
};

export const applyEnrichmentResults = async (
  enrichmentRequestId: string
): Promise<EnrichmentApplyResponse> => {
  await simulateDelay(800);

  const stored = enrichmentStore.get(enrichmentRequestId);
  if (!stored) {
    throw new Error("Enrichment request not found");
  }

  stored.status = "SUCCESSFUL";

  return {
    enrichment_request_id: enrichmentRequestId,
    message: "Enrichment results are being applied to contacts",
  };
};

export const fetchEnrichmentHistory = async (
  page: number = 1,
  pageSize: number = 10
): Promise<EnrichmentListResponse> => {
  await simulateDelay(500);

  const allItems = Array.from(enrichmentStore.entries()).map(([id, data]) => ({
    id,
    enrichment_type: data.request.enrichment_type,
    preset_action: data.request.preset_action,
    status: data.status,
    contact_count: data.request.contact_count,
    created_at: new Date(
      Date.now() - Math.random() * 86400000 * 7
    ).toISOString(),
  }));

  const start = (page - 1) * pageSize;
  const results = allItems.slice(start, start + pageSize);

  return {
    count: allItems.length,
    next: start + pageSize < allItems.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results,
  };
};
