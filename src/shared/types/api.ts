type SuccessCode = 200 | 201 | 202 | 204;

// Reusable pagination type
interface Pagination {
  next: string | null;
  prev: string | null;
}

// Define the full API response type
type ApiResponse<T = unknown> =
  | {
      data: T;
      status: {
        status_code: SuccessCode;
        detail: string;
      };
      pagination: Pagination;
    }
  | {
      data: null;
      status: {
        status_code: Exclude<number, SuccessCode>;
        detail: { detail: string };
      };
      pagination: Pagination;
    };

interface TokenPair {
  access: string;
  refresh: string;
}

export { type ApiResponse, type Pagination, type SuccessCode, type TokenPair };
