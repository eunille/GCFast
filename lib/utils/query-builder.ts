/**
 * Query Builder Utilities
 * 
 * Reusable filter application functions for Supabase queries.
 * All filtering is DB-driven — never fetch all rows and filter in JavaScript.
 * 
 * Security Notes:
 * - `applySorting` whitelist prevents SQL injection
 * - `applySearch` uses parameterized ILIKE (safe)
 * - Never pass raw user input directly to `.order()` or `.eq()`
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Apply sorting to a Supabase query with whitelisted fields
 * 
 * SECURITY: Only columns in `allowedFields` can be used for sorting.
 * If `sortBy` is not in the whitelist, no sorting is applied.
 * 
 * @param query - Supabase query builder instance
 * @param sortBy - Column to sort by (must be in allowedFields)
 * @param sortOrder - Sort direction (asc or desc)
 * @param allowedFields - Whitelisted column names (SQL injection prevention)
 * @returns Modified query with sorting applied (if valid)
 */
export function applySorting<T>(
  query: any,
  sortBy: string | undefined,
  sortOrder: "asc" | "desc",
  allowedFields: readonly string[]
): any {
  if (!sortBy || !allowedFields.includes(sortBy)) {
    return query;
  }
  
  return query.order(sortBy, { ascending: sortOrder === "asc" });
}

/**
 * Apply search filter using OR across multiple columns
 * 
 * Uses case-insensitive ILIKE for text search.
 * 
 * Example: Search "john" in name and email
 * → WHERE name ILIKE '%john%' OR email ILIKE '%john%'
 * 
 * @param query - Supabase query builder instance
 * @param search - Search term (trimmed automatically)
 * @param columns - Column names to search across
 * @returns Modified query with search filter applied (if search provided)
 */
export function applySearch<T>(
  query: any,
  search: string | undefined,
  columns: readonly string[]
): any {
  if (!search || !search.trim() || columns.length === 0) {
    return query;
  }

  // Escape LIKE wildcards to prevent unexpected search behavior
  const escapedSearch = search.trim().replace(/[%_]/g, "\\$&");
  const searchPattern = `%${escapedSearch}%`;
  const orConditions = columns
    .map((col) => `${col}.ilike.${searchPattern}`)
    .join(",");

  return query.or(orConditions);
}
