/**
 * Reusable Zod Filter Schemas
 * 
 * Base schemas for pagination, sorting, and common filter patterns.
 * Compose these with feature-specific filters using `.merge()`.
 * 
 * Example:
 * ```typescript
 * export const memberFilterSchema = z.object({
 *   collegeId: z.string().uuid().optional(),
 *   search: z.string().max(100).trim().optional(),
 * }).merge(paginationSchema).merge(sortSchema(["full_name", "created_at"]));
 * ```
 */

import { z } from "zod";

/**
 * Pagination query params schema
 * 
 * Defaults: page=1, pageSize=20
 * Limits: page >= 1, pageSize between 1 and 100
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Sort query params schema with whitelisted fields
 * 
 * Prevents SQL injection by only allowing specific column names.
 * 
 * @param allowedFields - Array of allowed column names (min 1 required)
 * @returns Zod schema for sortBy and sortOrder
 */
export const sortSchema = (allowedFields: [string, ...string[]]) =>
  z.object({
    sortBy: z.enum(allowedFields).optional(),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  });

/**
 * Base schema for all list endpoints
 * Includes pagination + basic sort (created_at, updated_at)
 * 
 * Merge this with feature-specific filters.
 */
export const baseListSchema = paginationSchema.merge(
  sortSchema(["created_at", "updated_at"])
);

export type PaginationParams = z.infer<typeof paginationSchema>;
export type SortParams = {
  sortBy?: string;
  sortOrder: "asc" | "desc";
};
