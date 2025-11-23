/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Text normalization utilities for accent-insensitive search
 * Matches the PostgreSQL GENERATED column logic
 */

/**
 * Normalize text for search (remove accents, lowercase, clean)
 * Matches database normalization:
 * - lowercase
 * - remove accents/diacritics
 * - keep only alphanumeric + spaces
 *
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
export function normalizeSearch(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text
    .toLowerCase()
    .normalize('NFD') // Decompose combined characters (é → e + ́)
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/[^a-z0-9 ]/g, '') // Keep only alphanumeric + spaces
    .trim()
}

/**
 * Escape special characters for SQL LIKE pattern
 * Prevents SQL injection in LIKE queries
 *
 * @param {string} text - Text to escape
 * @returns {string} Escaped text safe for LIKE
 */
export function escapeLikePattern(text) {
  if (!text || typeof text !== 'string') {
    return ''
  }

  return text.replace(/[%_\\]/g, '\\$&')
}

/**
 * Build LIKE pattern for search (wraps with %)
 *
 * @param {string} searchTerm - Search term
 * @returns {string} Pattern for LIKE query (e.g., '%jose%')
 */
export function buildLikePattern(searchTerm) {
  const normalized = normalizeSearch(searchTerm)
  const escaped = escapeLikePattern(normalized)
  return `%${escaped}%`
}

/**
 * Build OR condition for multiple columns search
 * Example: "customer_name_normalized.ilike.%jose%,customer_email_normalized.ilike.%jose%"
 *
 * @param {string[]} columns - Column names to search (must be *_normalized columns)
 * @param {string} searchTerm - Search term
 * @returns {string|null} OR condition string for Supabase, or null if no search term
 */
export function buildSearchCondition(columns, searchTerm) {
  if (!searchTerm || !searchTerm.trim()) {
    return null
  }

  const pattern = buildLikePattern(searchTerm)

  const conditions = columns.map(col => `${col}.ilike.${pattern}`)

  return conditions.join(',')
}
