type SuccessCode = 200 | 201 | 202 | 204;

// Reusable pagination type
interface Pagination {
  next: string | null;
  prev: string | null;
}

// Error response formats
type ErrorResponse =
  | {
      // Detailed validation error format
      success: false;
      statusCode: number;
      message: string[];
      error: string;
      fields?: Record<string, string[]>;
      path: string;
    }
  | {
      // Simple detail-only error format
      detail: string;
    }
  | {
      // Detail with code error format
      detail: string;
      code: string;
    };

// Define the full API response type
type ApiResponse<T = unknown> =
  | {
      // Success response
      data: T;
      status: {
        status_code: SuccessCode;
        detail: string;
      };
      pagination: Pagination;
    }
  | {
      // Error response
      data: null;
      status: {
        status_code: Exclude<number, SuccessCode>;
        detail: ErrorResponse;
      };
      pagination: Pagination;
    };

interface TokenPair {
  access: string;
  refresh: string;
}

export {
  type ApiResponse,
  type ErrorResponse,
  type Pagination,
  type SuccessCode,
  type TokenPair,
};
