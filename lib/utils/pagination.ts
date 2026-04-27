/**
 * Pagination Utilities
 * 
 * Helpers for consistent pagination across all list endpoints.
 * - Converts 1-based page numbers to Supabase ranges (0-indexed)
 * - Builds pagination metadata for responses
 * - Enforces max page size (100 items)
 */

export interface PaginationParams {
  page: number; // 1-based page number
  pageSize: number; // items per page (max 100)
}

export interface PaginationMeta {
  count: number; // total items matching query
  page: number; // current page (1-based)
  pageSize: number; // items per page
  hasMore: boolean; // true if more pages available
}

/**
 * Convert 1-based page number to Supabase range
 * 
 * Supabase `.range(from, to)` uses 0-indexed, inclusive bounds.
 * 
 * Examples:
 * - Page 1, size 20 → range(0, 19) — first 20 items
 * - Page 2, size 20 → range(20, 39) — next 20 items
 * 
 * @param params - Page number and page size
 * @returns Object with `from` and `to` for Supabase `.range()`
 */
export function toRange({ page, pageSize }: PaginationParams): {
  from: number;
  to: number;
} {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

/**
 * Build pagination metadata for API response
 * 
 * @param count - Total number of items matching query
 * @param params - Current page and page size
 * @returns Pagination metadata object
 */
export function buildMeta(
  count: number,
  { page, pageSize }: PaginationParams
): PaginationMeta {
  return {
    count,
    page,
    pageSize,
    hasMore: page * pageSize < count,
  };
}
