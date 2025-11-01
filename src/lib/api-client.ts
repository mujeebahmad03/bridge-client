/* eslint-disable no-console */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { API_ROUTES } from "@/config/api-routes";

import {
  type ApiResponse,
  type ErrorResponse,
  type TokenPair,
} from "@/types/api";

import { env } from "./env";
import { TokenStorage } from "./token-manager";

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public detail: string,
    public code?: string,
    public fields?: Record<string, string[]>,
    public originalError?: unknown
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: env.NEXT_PUBLIC_API_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - attach access token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Skip token attachment for auth endpoints
        if (this.isAuthEndpoint(config.url ?? "")) {
          return config;
        }

        const token = await TokenStorage.getAccessToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add correlation ID and metadata
        config.headers["X-Request-ID"] = this.generateRequestId();
        config.metadata = { startTime: Date.now() };

        return config;
      },
      (error) => {
        this.logError("Request Setup Error", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => {
        this.logRequest(response.config, response);
        return response;
      },
      async (error: AxiosError<ApiResponse | ErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Log the error
        this.logRequest(originalRequest, undefined, error);

        // Handle 401 errors - token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isAuthEndpoint(originalRequest.url ?? "")) {
            return Promise.reject(this.transformError(error));
          }

          originalRequest._retry = true;

          if (!this.isRefreshing) {
            this.isRefreshing = true;

            try {
              const newAccessToken = await this.refreshAccessToken();
              this.isRefreshing = false;
              this.onTokenRefreshed(newAccessToken);
              this.refreshSubscribers = [];

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              }

              return this.client(originalRequest);
            } catch (refreshError) {
              this.logError("Token Refresh Failed", refreshError, {
                context: "Token refresh during 401 handling",
              });

              this.isRefreshing = false;
              this.refreshSubscribers = [];
              TokenStorage.clearTokens();

              // Redirect to login if in browser
              if (typeof window !== "undefined") {
                window.location.href = "/login";
              }

              return Promise.reject(this.transformError(error));
            }
          }

          // Queue requests while refreshing
          return new Promise((resolve) => {
            this.refreshSubscribers.push((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(this.client(originalRequest));
            });
          });
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      API_ROUTES.AUTH.LOGIN,
      API_ROUTES.AUTH.SIGN_UP,
      API_ROUTES.AUTH.REFRESH_TOKEN,
    ];
    return authEndpoints.some((endpoint) => url.includes(endpoint));
  }

  private async refreshAccessToken(): Promise<string> {
    const refreshToken = await TokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new ApiError(401, "No refresh token available");
    }

    try {
      const response = await axios.post<ApiResponse<TokenPair>>(
        `${env.NEXT_PUBLIC_API_URL}${API_ROUTES.AUTH.REFRESH_TOKEN}`,
        { refresh: refreshToken }
      );

      if (
        response.data.status.status_code >= 200 &&
        response.data.status.status_code < 300
      ) {
        const tokens = response.data.data as TokenPair;
        await TokenStorage.setTokens(tokens);
        return tokens.access;
      }

      throw new ApiError(
        response.data.status.status_code,
        "Failed to refresh token"
      );
    } catch (error) {
      throw new ApiError(
        401,
        "Token refresh failed",
        undefined,
        undefined,
        error
      );
    }
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  private logRequest(
    config?: InternalAxiosRequestConfig,
    response?: AxiosResponse,
    error?: AxiosError
  ): void {
    if (!config) {
      return;
    }

    const duration = config.metadata?.startTime
      ? Date.now() - config.metadata.startTime
      : 0;

    const logData = {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      requestId: config.headers["X-Request-ID"],
      duration: `${duration}ms`,
      status: response?.status ?? error?.response?.status,
    };

    if (error) {
      // Development: Console logging with full details
      if (process.env.NODE_ENV === "development") {
        console.group(`🔴 API Error: ${logData.method} ${logData.url}`);
        console.error("Request Details:", {
          ...logData,
          requestData: config.data,
          requestParams: config.params,
        });
        console.error("Response:", {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
        });
        console.error("Error Details:", {
          code: error.code,
          message: error.message,
        });
        console.groupEnd();
      }

      // Production: Send to Sentry
      if (process.env.NODE_ENV === "production") {
        this.logToSentry(error, config, response);
      }
    } else {
      // Success logging (only in development)
      if (process.env.NODE_ENV === "development") {
        const emoji = duration < 200 ? "🟢" : duration < 1000 ? "🟡" : "🟠";
        console.log(`${emoji} API Request:`, logData);

        // Detailed logging for slow requests
        if (duration > 1000) {
          console.warn("⚠️ Slow Request Detected:", {
            ...logData,
            threshold: "1000ms",
          });
        }
      }
    }
  }

  private logError(
    context: string,
    error: unknown,
    additionalData?: Record<string, unknown>
  ): void {
    if (process.env.NODE_ENV === "development") {
      console.group(`🔴 ${context}`);
      console.error("Error:", error);
      if (additionalData) {
        console.error("Additional Context:", additionalData);
      }
      console.groupEnd();
    }

    if (process.env.NODE_ENV === "production") {
      //* Log to Sentry
      // Sentry.captureException(error, {
      //   tags: {
      //     context,
      //     type: "api_error",
      //   },
      //   extra: additionalData,
      // });
    }
  }

  private logToSentry(
    error: AxiosError,
    config?: InternalAxiosRequestConfig,
    _response?: AxiosResponse
  ): void {
    const duration = config?.metadata?.startTime
      ? Date.now() - config.metadata.startTime
      : 0;

    // Don't log certain status codes to Sentry
    const ignoreStatusCodes = [400, 401, 403, 404, 422];
    if (
      error.response?.status &&
      ignoreStatusCodes.includes(error.response.status)
    ) {
      return;
    }

    // Sentry.captureException(error, {
    //   tags: {
    //     api_method: config?.method?.toUpperCase(),
    //     api_status: error.response?.status,
    //     api_error_code: error.code,
    //   },
    //   contexts: {
    //     api: {
    //       url: config?.url,
    //       baseURL: config?.baseURL,
    //       method: config?.method,
    //       status: error.response?.status,
    //       statusText: error.response?.statusText,
    //       duration: `${duration}ms`,
    //       requestId: config?.headers["X-Request-ID"],
    //     },
    //   },
    //   extra: {
    //     requestData: config?.data,
    //     requestParams: config?.params,
    //     responseData: error.response?.data,
    //     responseHeaders: error.response?.headers,
    //   },
    //   fingerprint: [
    //     config?.method ?? "unknown",
    //     config?.url ?? "unknown",
    //     String(error.response?.status ?? "unknown"),
    //   ],
    // });
  }

  private transformError(
    error: AxiosError<ApiResponse | ErrorResponse>
  ): ApiError {
    if (error.response?.data) {
      const responseData = error.response.data;

      // Check if it's the new error format (direct ErrorResponse)
      if ("success" in responseData && responseData.success === false) {
        // Structured validation error format
        const message = Array.isArray(responseData.message)
          ? responseData.message[0]
          : responseData.message;

        return new ApiError(
          responseData.statusCode,
          message || "An error occurred",
          responseData.error,
          responseData.fields,
          error
        );
      } else if (
        "detail" in responseData &&
        typeof responseData.detail === "string"
      ) {
        // Simple detail error format (with or without code)
        const code =
          "code" in responseData
            ? (responseData as { detail: string; code: string }).code
            : undefined;

        return new ApiError(
          error.response.status,
          responseData.detail,
          code,
          undefined,
          error
        );
      } else if ("status" in responseData) {
        // Old wrapped format (ApiResponse with error)
        const { status } = responseData as ApiResponse;
        const detail =
          typeof status.detail === "string"
            ? status.detail
            : "detail" in status.detail
              ? status.detail.detail
              : "An error occurred";

        return new ApiError(
          status.status_code,
          detail,
          undefined,
          undefined,
          error
        );
      }
    }

    if (error.code === "ECONNABORTED") {
      return new ApiError(408, "Request timeout", undefined, undefined, error);
    }

    if (error.code === "ERR_NETWORK") {
      return new ApiError(
        503,
        "Network error - please check your connection",
        undefined,
        undefined,
        error
      );
    }

    return new ApiError(
      500,
      error.message || "Unknown error occurred",
      undefined,
      undefined,
      error
    );
  }

  // Generic request method with retry logic
  private async request<T>(
    config: AxiosRequestConfig,
    retries = 0
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request<ApiResponse<T>>(config);
      return response.data;
    } catch (error) {
      // Retry logic for network errors
      const maxRetries = 2;
      const isRetryableError =
        error instanceof ApiError &&
        (error.statusCode === 503 ||
          error.statusCode === 504 ||
          error.statusCode === 408);

      if (retries < maxRetries && isRetryableError) {
        const delay = Math.pow(2, retries) * 1000; // Exponential backoff

        if (process.env.NODE_ENV === "development") {
          console.warn(
            `🔄 Retrying request (${retries + 1}/${maxRetries}) after ${delay}ms`
          );
        }

        await this.sleep(delay);
        return this.request<T>(config, retries + 1);
      }

      if (error instanceof ApiError) {
        throw error;
      }
      throw this.transformError(
        error as AxiosError<ApiResponse | ErrorResponse>
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Public HTTP methods
  async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "PATCH", url, data });
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }

  // Upload file with progress
  async upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    return this.request<T>({
      method: "POST",
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });
  }

  // Download file
  async download(url: string, filename?: string): Promise<void> {
    try {
      const response = await this.client.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename ?? "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      throw this.transformError(
        error as AxiosError<ApiResponse | ErrorResponse>
      );
    }
  }

  // Get raw axios instance for special cases
  getRawClient(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or multiple instances
export { ApiClient };
