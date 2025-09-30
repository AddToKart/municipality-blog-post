/**
 * SQL Injection Prevention Utilities
 *
 * Additional layer of security for database operations
 * Note: Always use parameterized queries as the primary defense!
 */

/**
 * Whitelist of allowed characters for different input types
 */
const WHITELISTS = {
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
  email:
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

/**
 * Dangerous SQL keywords and patterns
 */
const DANGEROUS_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|REPLACE|EXEC|EXECUTE|UNION|GRANT|REVOKE)\b)/gi,
  /(--|\||;|'|"|\/\*|\*\/|xp_|sp_|0x)/gi,
  /(\bOR\b\s+\d+\s*=\s*\d+)/gi,
  /(\bAND\b\s+\d+\s*=\s*\d+)/gi,
  /(UNION\s+ALL\s+SELECT)/gi,
];

/**
 * Validate that a value matches expected type
 */
export function validateInputType(
  value: any,
  type: keyof typeof WHITELISTS
): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  const str = String(value);
  return WHITELISTS[type].test(str);
}

/**
 * Detect potential SQL injection attempts
 */
export function detectSQLInjection(input: string): boolean {
  if (!input || typeof input !== "string") {
    return false;
  }

  // Check against dangerous patterns
  return DANGEROUS_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Escape special characters in LIKE queries
 * Use this when building LIKE patterns for search
 */
export function escapeLikePattern(pattern: string): string {
  if (!pattern || typeof pattern !== "string") {
    return "";
  }

  // Escape special LIKE characters: %, _, [, ]
  return pattern
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

/**
 * Validate and sanitize integer ID
 */
export function validateId(id: any): number | null {
  const parsed = parseInt(String(id), 10);

  if (isNaN(parsed) || !isFinite(parsed) || parsed < 1) {
    return null;
  }

  // Prevent integer overflow
  if (parsed > Number.MAX_SAFE_INTEGER) {
    return null;
  }

  return parsed;
}

/**
 * Validate array of IDs
 */
export function validateIdArray(ids: any[]): number[] | null {
  if (!Array.isArray(ids) || ids.length === 0) {
    return null;
  }

  // Limit array size to prevent DOS
  if (ids.length > 1000) {
    return null;
  }

  const validIds: number[] = [];

  for (const id of ids) {
    const validId = validateId(id);
    if (validId === null) {
      return null; // Return null if any ID is invalid
    }
    validIds.push(validId);
  }

  return validIds;
}

/**
 * Validate slug format
 */
export function validateSlug(slug: any): boolean {
  if (!slug || typeof slug !== "string") {
    return false;
  }

  // Slugs should be lowercase, alphanumeric with hyphens
  // Length between 1 and 200 characters
  if (slug.length < 1 || slug.length > 200) {
    return false;
  }

  return WHITELISTS.slug.test(slug);
}

/**
 * Validate enum value against allowed values
 */
export function validateEnum<T extends string>(
  value: any,
  allowedValues: T[]
): T | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  if (!allowedValues.includes(value as T)) {
    return null;
  }

  return value as T;
}

/**
 * Validate order direction for SQL ORDER BY
 */
export function validateOrderDirection(direction: any): "ASC" | "DESC" {
  const normalized = String(direction).toUpperCase();
  return normalized === "DESC" ? "DESC" : "ASC";
}

/**
 * Validate column name against whitelist
 * Prevents SQL injection in ORDER BY and other dynamic column references
 */
export function validateColumnName(
  column: string,
  allowedColumns: string[]
): string | null {
  if (!column || typeof column !== "string") {
    return null;
  }

  // Must be in whitelist
  if (!allowedColumns.includes(column)) {
    return null;
  }

  // Additional validation - column names should be alphanumeric with underscores
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(column)) {
    return null;
  }

  return column;
}

/**
 * Build safe ILIKE search pattern
 */
export function buildSafeSearchPattern(search: string): string {
  if (!search || typeof search !== "string") {
    return "";
  }

  // Limit search length
  const truncated = search.substring(0, 100);

  // Escape LIKE special characters
  const escaped = escapeLikePattern(truncated);

  return `%${escaped}%`;
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page: any,
  limit: any
): { page: number; limit: number; offset: number } | null {
  const pageNum = parseInt(String(page), 10);
  const limitNum = parseInt(String(limit), 10);

  if (isNaN(pageNum) || isNaN(limitNum)) {
    return null;
  }

  if (pageNum < 1 || limitNum < 1) {
    return null;
  }

  // Limit maximum items per page to prevent DOS
  if (limitNum > 100) {
    return null;
  }

  // Calculate offset
  const offset = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    offset,
  };
}

/**
 * Security audit helper - check if query uses parameterization
 * For development/testing only
 */
export function auditQuery(query: string, params: any[]): void {
  if (process.env["NODE_ENV"] === "development") {
    // Check if query contains string concatenation patterns
    const hasInterpolation = /\$\{|\+\s*["'`]/.test(query);

    if (hasInterpolation) {
      console.warn(
        "⚠️  SECURITY WARNING: Query may use string interpolation instead of parameters!"
      );
      console.warn("Query:", query);
    }

    // Check if parameter count matches placeholders
    const placeholders = (query.match(/\$\d+/g) || []).length;

    if (placeholders !== params.length) {
      console.warn("⚠️  WARNING: Parameter count mismatch!");
      console.warn(`Expected ${placeholders} parameters, got ${params.length}`);
    }
  }
}
