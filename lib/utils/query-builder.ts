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

/**
 * Minimal shape of a Supabase query builder needed by these utilities.
 * Using an interface instead of `any` keeps things type-safe without
 * importing the full SupabaseClient generic chain.
 */
interface ChainableQuery {
  order(column: string, options?: { ascending?: boolean }): ChainableQuery;
  or(filters: string): ChainableQuery;
}

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
export function applySorting<Q extends ChainableQuery>(
  query: Q,
  sortBy: string | undefined,
  sortOrder: "asc" | "desc",
  allowedFields: readonly string[]
): Q {
  if (!sortBy || !allowedFields.includes(sortBy)) {
    return query;
  }
  
  return query.order(sortBy, { ascending: sortOrder === "asc" }) as Q;
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
export function applySearch<Q extends ChainableQuery>(
  query: Q,
  search: string | undefined,
  columns: readonly string[]
): Q {
  if (!search || !search.trim() || columns.length === 0) {
    return query;
  }

  // Escape LIKE wildcards to prevent unexpected search behavior
  const escapedSearch = search.trim().replace(/[%_]/g, "\\$&");
  const searchPattern = `%${escapedSearch}%`;
  const orConditions = columns
    .map((col) => `${col}.ilike.${searchPattern}`)
    .join(",");

  return query.or(orConditions) as Q;
}
