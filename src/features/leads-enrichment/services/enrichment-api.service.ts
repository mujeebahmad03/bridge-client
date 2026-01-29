import { API_ROUTES } from "@/config/api-routes";
import { apiClient, ApiError } from "@/lib/api-client";

import { type ApiResponse } from "@/types/api";

import type {
  CreatePreviewRequest,
  EnrichmentApplyResponse,
  EnrichmentApproveResponse,
  EnrichmentFieldResult,
  EnrichmentListResponse,
  EnrichmentPreset,
  EnrichmentPreviewResponse,
  EnrichmentResultContact,
  EnrichmentResultsResponse,
  EnrichmentResultsSummary,
  EnrichmentStatus,
  EnrichmentStatusResponse,
  EnrichmentType,
} from "@/leads/types";

// ==================== API wrapper (unwrap response, handle errors) ====================

/** Type guard: payload is wrapped { status, data } ApiResponse */
function isWrappedApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
  if (!payload || typeof payload !== "object") {
    return false;
  }
  const o = payload as Record<string, unknown>;
  if (!("status" in o) || !("data" in o)) {
    return false;
  }
  const s = o.status;
  if (!s || typeof s !== "object") {
    return false;
  }
  const st = s as Record<string, unknown>;
  return typeof st.status_code === "number";
}

class EnrichmentApiService {
  private isSuccessResponse(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  }

  private handleApiError(error: unknown, defaultMessage: string): never {
    if (error instanceof ApiError) {
      if (error.fields) {
        const msg = Object.entries(error.fields)
          .map(([f, m]) => `${f}: ${m.join(", ")}`)
          .join("; ");
        throw new Error(msg || error.detail || defaultMessage);
      }
      throw new Error(error.detail || defaultMessage);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(defaultMessage);
  }

  private validateResponse<T>(
    response: ApiResponse<T>,
    defaultErrorMessage: string
  ): T {
    if (this.isSuccessResponse(response.status.status_code) && response.data) {
      return response.data;
    }
    throw new Error(defaultErrorMessage);
  }

  private unwrapResponse<T>(payload: unknown, defaultErrorMessage: string): T {
    if (isWrappedApiResponse<T>(payload)) {
      return this.validateResponse(payload, defaultErrorMessage);
    }
    return payload as T;
  }

  private normalizeEnrichmentHistoryItem(
    item: unknown
  ): EnrichmentListResponse["results"][number] | null {
    if (!item || typeof item !== "object") {
      return null;
    }
    const o = item as Record<string, unknown>;

    const id = o.id ? String(o.id) : "";
    if (!id) {
      return null;
    }

    type HistoryItem = EnrichmentListResponse["results"][number];

    const presetActionRaw = o.preset_action ?? o.presetAction;
    const presetAction = presetActionRaw
      ? (String(presetActionRaw) as HistoryItem["presetAction"])
      : null;

    const contactListIdRaw = o.contact_list_id ?? o.contactListId;
    const contactListId =
      contactListIdRaw === null || typeof contactListIdRaw === "undefined"
        ? null
        : String(contactListIdRaw);

    return {
      id,
      enrichmentType: String(
        o.enrichment_type ?? o.enrichmentType ?? "PRESET"
      ) as EnrichmentType,
      presetAction,
      enrichmentDescription: String(
        o.enrichment_description ?? o.enrichmentDescription ?? ""
      ),
      status: String(o.status ?? "PREVIEW") as EnrichmentStatus,
      pipe0JobId: String(o.pipe0_job_id ?? o.pipe0JobId ?? ""),
      contactCount: Number(o.contact_count ?? o.contactCount ?? 0),
      isContactList: Boolean(o.is_contact_list ?? o.isContactList ?? false),
      contactListId,
      errorMessage: String(o.error_message ?? o.errorMessage ?? ""),
      createdAt: String(
        o.created_at ?? o.createdAt ?? new Date().toISOString()
      ),
      lastModifiedAt: String(
        o.last_modified_at ?? o.lastModifiedAt ?? new Date().toISOString()
      ),
    };
  }

  async fetchEnrichmentPresets(): Promise<EnrichmentPreset[]> {
    try {
      const response = await apiClient.get<unknown>(
        API_ROUTES.LEADS_ENRICHMENT.GET_PRESET
      );
      const raw = this.unwrapResponse<unknown>(
        response,
        "Failed to fetch enrichment presets"
      );

      // Handle array or { results: [...] } response
      let presets: unknown[];
      if (Array.isArray(raw)) {
        presets = raw;
      } else if (
        raw &&
        typeof raw === "object" &&
        "results" in raw &&
        Array.isArray((raw as { results: unknown[] }).results)
      ) {
        presets = (raw as { results: unknown[] }).results;
      } else {
        return [];
      }

      // Map to EnrichmentPreset format
      return presets.map((p: unknown) => {
        const item = p as Record<string, unknown>;
        return {
          value: String(item.value ?? item.id ?? ""),
          label: String(item.label ?? item.name ?? ""),
          description: String(item.description ?? ""),
        } as EnrichmentPreset;
      });
    } catch (e) {
      this.handleApiError(e, "Failed to fetch enrichment presets");
    }
  }

  async createEnrichmentPreview(
    request: CreatePreviewRequest,
    _contacts: Array<{
      id: string;
      first_name: string;
      last_name: string;
      email_address: string;
    }>
  ): Promise<EnrichmentPreviewResponse> {
    try {
      const body: Record<string, unknown> = {
        contact_ids: request.contact_ids ?? [],
        enrichment_type: request.enrichment_type,
      };
      if (request.contact_list_id) {
        body.contact_list_id = request.contact_list_id;
      }
      if (request.preset_action) {
        body.preset_action = request.preset_action;
      }
      if (request.enrichment_description) {
        body.enrichment_description = request.enrichment_description;
      }

      const response = await apiClient.post<unknown>(
        API_ROUTES.ENRICHMENT.CREATE_ENRICHMENT,
        body
      );
      const raw = this.unwrapResponse<unknown>(
        response,
        "Failed to create enrichment preview"
      );
      return this.normalizePreviewResponse(raw as Record<string, unknown>);
    } catch (e) {
      this.handleApiError(e, "Failed to create enrichment preview");
    }
  }

  private normalizePreviewResponse(
    raw: Record<string, unknown>
  ): EnrichmentPreviewResponse {
    return {
      enrichment_request_id: String(raw.enrichment_request_id ?? raw.id ?? ""),
      status: String(
        raw.status ?? "PREVIEW"
      ) as EnrichmentPreviewResponse["status"],
      enrichment_type: String(
        raw.enrichment_type ?? "PRESET"
      ) as EnrichmentPreviewResponse["enrichment_type"],
      preset_action: raw.preset_action
        ? (String(
            raw.preset_action
          ) as EnrichmentPreviewResponse["preset_action"])
        : null,
      enrichment_description: String(raw.enrichment_description ?? ""),
      contact_count: Number(raw.contact_count ?? 0),
      is_contact_list: Boolean(raw.is_contact_list ?? false),
      contact_list_id: raw.contact_list_id ? String(raw.contact_list_id) : null,
      contacts: Array.isArray(raw.contacts)
        ? (raw.contacts as EnrichmentPreviewResponse["contacts"])
        : [],
      pipeline: Array.isArray(raw.pipeline)
        ? (raw.pipeline as EnrichmentPreviewResponse["pipeline"])
        : [],
      message: String(
        raw.message ??
          "Preview generated. Call /approve/ to execute the enrichment."
      ),
    };
  }

  async approveEnrichment(
    enrichmentRequestId: string
  ): Promise<EnrichmentApproveResponse> {
    try {
      const response = await apiClient.post<unknown>(
        API_ROUTES.ENRICHMENT.APPROVE_ENRICHMENT(enrichmentRequestId)
      );
      const raw = this.unwrapResponse<unknown>(
        response,
        "Failed to approve enrichment"
      );
      const data = raw as Record<string, unknown>;
      return {
        enrichment_request_id: String(
          data.enrichment_request_id ?? enrichmentRequestId
        ),
        status: String(
          data.status ?? "APPROVED"
        ) as EnrichmentApproveResponse["status"],
        message: String(
          data.message ?? "Enrichment approved and job submitted"
        ),
      };
    } catch (e) {
      this.handleApiError(e, "Failed to approve enrichment");
    }
  }

  async checkEnrichmentStatus(
    enrichmentRequestId: string
  ): Promise<EnrichmentStatusResponse> {
    try {
      const response = await apiClient.get<unknown>(
        API_ROUTES.ENRICHMENT.GET_ENRICHMENT_STATUS(enrichmentRequestId)
      );
      const raw = this.unwrapResponse<unknown>(
        response,
        "Failed to check enrichment status"
      );
      const data = raw as Record<string, unknown>;
      return {
        id: String(data.id ?? enrichmentRequestId),
        enrichment_type: String(
          data.enrichment_type ?? "PRESET"
        ) as EnrichmentStatusResponse["enrichment_type"],
        preset_action: data.preset_action
          ? (String(
              data.preset_action
            ) as EnrichmentStatusResponse["preset_action"])
          : null,
        status: String(
          data.status ?? "PREVIEW"
        ) as EnrichmentStatusResponse["status"],
        pipe0_job_id: data.pipe0_job_id ? String(data.pipe0_job_id) : null,
        contact_count: Number(data.contact_count ?? 0),
        created_at: String(data.created_at ?? new Date().toISOString()),
        last_modified_at: String(
          data.last_modified_at ?? new Date().toISOString()
        ),
        error_message: data.error_message
          ? String(data.error_message)
          : undefined,
      };
    } catch (e) {
      this.handleApiError(e, "Failed to check enrichment status");
    }
  }

  async getEnrichmentResults(
    enrichmentRequestId: string
  ): Promise<EnrichmentResultsResponse> {
    try {
      const response = await apiClient.get<unknown>(
        API_ROUTES.ENRICHMENT.GET_ENRICHMENT_RESULTS(enrichmentRequestId)
      );
      const raw = this.unwrapResponse<unknown>(
        response,
        "Failed to get enrichment results"
      );
      const data = raw as Record<string, unknown>;

      // Parse parsed_results with proper typing
      let parsedResults: Record<
        string,
        Record<string, EnrichmentFieldResult>
      > = {};

      if (data.parsed_results && typeof data.parsed_results === "object") {
        parsedResults = data.parsed_results as Record<
          string,
          Record<string, EnrichmentFieldResult>
        >;
      }

      // Parse contacts array
      const contacts: EnrichmentResultContact[] = Array.isArray(data.contacts)
        ? data.contacts.map((contact: unknown) => {
            const c = contact as Record<string, unknown>;
            return {
              id: String(c.id ?? ""),
              first_name: String(c.first_name ?? ""),
              last_name: String(c.last_name ?? ""),
              email_address: String(c.email_address ?? ""),
              primary_phone_number: c.primary_phone_number
                ? String(c.primary_phone_number)
                : null,
              linkedin_profile: c.linkedin_profile
                ? String(c.linkedin_profile)
                : null,
            };
          })
        : [];

      // Parse summary
      const summaryData = data.summary as Record<string, unknown> | undefined;
      const summary: EnrichmentResultsSummary = {
        total_contacts: Number(summaryData?.total_contacts ?? contacts.length),
        total_fields: Number(summaryData?.total_fields ?? 0),
        fields_by_type:
          (summaryData?.fields_by_type as Record<string, number>) ?? {},
      };

      return {
        id: String(data.id ?? enrichmentRequestId),
        status: String(data.status ?? "RESULTS_READY") as EnrichmentStatus,
        parsed_results: parsedResults,
        contacts,
        is_contact_list: Boolean(data.is_contact_list ?? false),
        summary,
        error_message: String(data.error_message ?? ""),
      };
    } catch (e) {
      this.handleApiError(e, "Failed to get enrichment results");
    }
  }

  async applyEnrichmentResults(
    enrichmentRequestId: string
  ): Promise<EnrichmentApplyResponse> {
    try {
      const response = await apiClient.post<unknown>(
        API_ROUTES.ENRICHMENT.APPLY_ENRICHMENT(enrichmentRequestId)
      );
      const raw = this.unwrapResponse<unknown>(
        response,
        "Failed to apply enrichment results"
      );
      const data = raw as Record<string, unknown>;
      return {
        enrichment_request_id: String(
          data.enrichment_request_id ?? enrichmentRequestId
        ),
        message: String(
          data.message ?? "Enrichment results are being applied to contacts"
        ),
      };
    } catch (e) {
      this.handleApiError(e, "Failed to apply enrichment results");
    }
  }

  async fetchEnrichmentHistory(
    page: number = 1,
    pageSize: number = 10
  ): Promise<EnrichmentListResponse> {
    try {
      const response = await apiClient.get<unknown>(
        API_ROUTES.ENRICHMENT.GET_ENRICHMENT_REQUESTS,
        {
          params: { page, page_size: pageSize },
        }
      );
      const raw = this.unwrapResponse<unknown>(
        response,
        "Failed to fetch enrichment history"
      );

      // New API shape: { success: true, data: [...] , status: { ... } }
      // unwrapResponse() will often return just `data` (the array), but keep this robust.
      const o =
        raw && typeof raw === "object"
          ? (raw as Record<string, unknown>)
          : null;

      let itemsRaw: unknown[] = [];
      if (Array.isArray(raw)) {
        itemsRaw = raw;
      } else if (Array.isArray(o?.data)) {
        itemsRaw = o.data as unknown[];
      } else if (Array.isArray(o?.results)) {
        itemsRaw = o.results as unknown[];
      }

      const results = itemsRaw
        .map((it) => this.normalizeEnrichmentHistoryItem(it))
        .filter(Boolean) as EnrichmentListResponse["results"];

      const count =
        !Array.isArray(raw) && typeof o?.count !== "undefined"
          ? Number(o.count ?? 0)
          : results.length;

      return {
        count,
        next: !Array.isArray(raw) && o?.next ? String(o.next) : null,
        previous:
          !Array.isArray(raw) && o?.previous ? String(o.previous) : null,
        results,
      };
    } catch (e) {
      this.handleApiError(e, "Failed to fetch enrichment history");
    }
  }
}

const enrichmentApiService = new EnrichmentApiService();

// ==================== API Functions ====================

export async function fetchEnrichmentPresets(): Promise<EnrichmentPreset[]> {
  return enrichmentApiService.fetchEnrichmentPresets();
}

export async function createEnrichmentPreview(
  request: CreatePreviewRequest,
  contacts: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email_address: string;
  }>
): Promise<EnrichmentPreviewResponse> {
  return enrichmentApiService.createEnrichmentPreview(request, contacts);
}

export async function approveEnrichment(
  enrichmentRequestId: string
): Promise<EnrichmentApproveResponse> {
  return enrichmentApiService.approveEnrichment(enrichmentRequestId);
}

export async function checkEnrichmentStatus(
  enrichmentRequestId: string
): Promise<EnrichmentStatusResponse> {
  return enrichmentApiService.checkEnrichmentStatus(enrichmentRequestId);
}

export async function getEnrichmentResults(
  enrichmentRequestId: string
): Promise<EnrichmentResultsResponse> {
  return enrichmentApiService.getEnrichmentResults(enrichmentRequestId);
}

export async function applyEnrichmentResults(
  enrichmentRequestId: string
): Promise<EnrichmentApplyResponse> {
  return enrichmentApiService.applyEnrichmentResults(enrichmentRequestId);
}

export async function fetchEnrichmentHistory(
  page: number = 1,
  pageSize: number = 10
): Promise<EnrichmentListResponse> {
  return enrichmentApiService.fetchEnrichmentHistory(page, pageSize);
}
