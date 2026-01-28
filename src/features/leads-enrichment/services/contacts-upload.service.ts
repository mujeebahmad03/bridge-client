import { API_ROUTES } from "@/config/api-routes";
import { apiClient, ApiError } from "@/lib/api-client";

import { type ApiResponse } from "@/types/api";

import type {
  CreateCustomFieldPayload,
  CustomField,
  FileUploadPayload,
  UploadHistoryItem,
} from "@/leads/types";

// ==================== Paginated Response Type ====================
/** DRF-style paginated shape: { count, next, previous, results } */
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

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

class ContactsUploadService {
  /**
   * Centralized method to check if response is successful
   */
  private isSuccessResponse(statusCode: number): boolean {
    return statusCode >= 200 && statusCode < 300;
  }

  /**
   * Centralized error handler that extracts error message from ApiError
   */
  private handleApiError(error: unknown, defaultMessage: string): never {
    if (error instanceof ApiError) {
      // Handle field-level validation errors
      if (error.fields) {
        const fieldErrors = Object.entries(error.fields)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
          .join("; ");
        throw new Error(fieldErrors || error.detail || defaultMessage);
      }
      throw new Error(error.detail || defaultMessage);
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error(defaultMessage);
  }

  /**
   * Validates wrapped ApiResponse and returns data or throws error
   */
  private validateResponse<T>(
    response: ApiResponse<T>,
    defaultErrorMessage: string
  ): T {
    if (this.isSuccessResponse(response.status.status_code) && response.data) {
      return response.data;
    }

    throw new Error(defaultErrorMessage);
  }

  /**
   * Unwraps either wrapped { status, data } or raw DRF payload to T.
   * Use for endpoints that may return either shape (mixed mode).
   */
  private unwrapResponse<T>(payload: unknown, defaultErrorMessage: string): T {
    if (isWrappedApiResponse<T>(payload)) {
      return this.validateResponse(payload, defaultErrorMessage);
    }
    return payload as T;
  }

  /**
   * Fetch custom fields with optional pagination and search
   */
  async fetchCustomFields(params?: {
    page?: number;
    search?: string;
    page_size?: number;
  }): Promise<PaginatedResponse<CustomField>> {
    try {
      const queryParams: Record<string, string | number> = {};

      if (params?.page) {
        queryParams.page = params.page;
      }

      if (params?.search) {
        queryParams.search = params.search;
      }

      queryParams.page_size = params?.page_size ?? 100;

      const response = await apiClient.get<PaginatedResponse<CustomField>>(
        API_ROUTES.CUSTOM_FIELDS.GET_USER_CUSTOM_FIELDS,
        {
          params: queryParams,
        }
      );

      return this.unwrapResponse<PaginatedResponse<CustomField>>(
        response,
        "Failed to fetch custom fields"
      );
    } catch (error) {
      this.handleApiError(error, "Failed to fetch custom fields");
    }
  }

  /**
   * Create a new custom field
   */
  async createCustomField(
    payload: CreateCustomFieldPayload
  ): Promise<CustomField> {
    try {
      const response = await apiClient.post<CustomField>(
        API_ROUTES.CUSTOM_FIELDS.CREATE_USER_CUSTOM_FIELD,
        payload
      );

      return this.unwrapResponse<CustomField>(
        response,
        "Failed to create custom field"
      );
    } catch (error) {
      this.handleApiError(error, "Failed to create custom field");
    }
  }

  /**
   * Fetch upload history with optional pagination and search
   */
  async fetchUploadHistory(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<PaginatedResponse<UploadHistoryItem>> {
    try {
      const queryParams: Record<string, string | number> = {};

      if (params?.page) {
        queryParams.page = params.page;
      }

      if (params?.pageSize) {
        queryParams.page_size = params.pageSize;
      }

      if (params?.search) {
        queryParams.search = params.search;
      }

      const response = await apiClient.get<
        PaginatedResponse<UploadHistoryItem>
      >(API_ROUTES.CONTACTS_IMPORT.GET_IMPORT_HISTORY, {
        params: queryParams,
      });

      return this.unwrapResponse<PaginatedResponse<UploadHistoryItem>>(
        response,
        "Failed to fetch upload history"
      );
    } catch (error) {
      this.handleApiError(error, "Failed to fetch upload history");
    }
  }

  /**
   * Upload file with field mapping
   */
  async uploadFileWithMapping(
    payload: FileUploadPayload
  ): Promise<UploadHistoryItem> {
    try {
      // Create FormData with file and metadata
      const formData = new FormData();
      formData.append("file", payload.file);
      formData.append("feature_mapping", payload.feature_mapping);
      formData.append("source", payload.source);
      formData.append("filename", payload.filename);

      const response = await apiClient.upload<UploadHistoryItem>(
        API_ROUTES.CONTACTS_IMPORT.CREATE_IMPORT,
        formData
      );

      return this.unwrapResponse<UploadHistoryItem>(
        response,
        "Failed to upload file"
      );
    } catch (error) {
      this.handleApiError(error, "Failed to upload file");
    }
  }
}

// Export singleton instance
export const contactsUploadService = new ContactsUploadService();

// Export class for testing
export { ContactsUploadService };

// ==================== Exported Functions for Hooks ====================

/**
 * Fetch custom fields
 */
export async function fetchCustomFields(params?: {
  page?: number;
  search?: string;
  page_size?: number;
}): Promise<PaginatedResponse<CustomField>> {
  return contactsUploadService.fetchCustomFields(params);
}

/**
 * Create custom field
 */
export async function createCustomField(
  payload: CreateCustomFieldPayload
): Promise<CustomField> {
  return contactsUploadService.createCustomField(payload);
}

/**
 * Fetch upload history
 */
export async function fetchUploadHistory(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<PaginatedResponse<UploadHistoryItem>> {
  return contactsUploadService.fetchUploadHistory(params);
}

/**
 * Upload file with mapping
 */
export async function uploadFileWithMapping(
  payload: FileUploadPayload
): Promise<UploadHistoryItem> {
  return contactsUploadService.uploadFileWithMapping(payload);
}
