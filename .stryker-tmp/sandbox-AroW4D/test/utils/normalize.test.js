/**
 * Normalize Utils Tests
 */
// @ts-nocheck

import { describe, it, expect } from 'vitest'
import {
  normalizeSearch,
  escapeLikePattern,
  buildLikePattern,
  buildSearchCondition
} from '../../api/utils/normalize.js'

describe('Normalize Utils', () => {
  describe('normalizeSearch', () => {
    it('should lowercase text', () => {
      expect(normalizeSearch('HELLO WORLD')).toBe('hello world')
    })

    it('should remove accents', () => {
      expect(normalizeSearch('José García')).toBe('jose garcia')
      expect(normalizeSearch('Álvarez')).toBe('alvarez')
      expect(normalizeSearch('Mónica')).toBe('monica')
    })

    it('should remove special characters', () => {
      expect(normalizeSearch('hello@world.com')).toBe('helloworldcom')
      expect(normalizeSearch('test-value_123')).toBe('testvalue123')
    })

    it('should trim whitespace', () => {
      expect(normalizeSearch('  hello  ')).toBe('hello')
    })

    it('should handle empty strings', () => {
      expect(normalizeSearch('')).toBe('')
      expect(normalizeSearch(null)).toBe('')
      expect(normalizeSearch(undefined)).toBe('')
    })

    it('should handle non-string input', () => {
      expect(normalizeSearch(123)).toBe('')
      expect(normalizeSearch({})).toBe('')
    })

    it('should handle complex accented text', () => {
      expect(normalizeSearch('Ñoño Peña')).toBe('nono pena')
      expect(normalizeSearch('Café Français')).toBe('cafe francais')
    })

    it('should preserve spaces between words', () => {
      expect(normalizeSearch('hello world test')).toBe('hello world test')
    })
  })

  describe('escapeLikePattern', () => {
    it('should escape % character', () => {
      expect(escapeLikePattern('50%')).toBe('50\\%')
    })

    it('should escape _ character', () => {
      expect(escapeLikePattern('test_value')).toBe('test\\_value')
    })

    it('should escape backslash', () => {
      expect(escapeLikePattern('path\\to\\file')).toBe('path\\\\to\\\\file')
    })

    it('should escape multiple special characters', () => {
      expect(escapeLikePattern('100%_off')).toBe('100\\%\\_off')
    })

    it('should handle empty strings', () => {
      expect(escapeLikePattern('')).toBe('')
      expect(escapeLikePattern(null)).toBe('')
    })

    it('should not escape normal text', () => {
      expect(escapeLikePattern('hello world')).toBe('hello world')
    })
  })

  describe('buildLikePattern', () => {
    it('should wrap pattern with %', () => {
      expect(buildLikePattern('test')).toBe('%test%')
    })

    it('should normalize and escape', () => {
      expect(buildLikePattern('José')).toBe('%jose%')
    })

    it('should handle special characters', () => {
      // The normalize function removes % so it won't be in the pattern
      const result = buildLikePattern('50%')
      expect(result).toContain('50')
      expect(result).toMatch(/%.*50.*%/)
    })

    it('should handle empty strings', () => {
      expect(buildLikePattern('')).toBe('%%')
    })

    it('should trim whitespace before wrapping', () => {
      expect(buildLikePattern('  test  ')).toBe('%test%')
    })

    it('should handle accented text in pattern', () => {
      expect(buildLikePattern('García')).toBe('%garcia%')
    })
  })

  describe('buildSearchCondition', () => {
    it('should build OR condition for multiple columns', () => {
      const columns = ['name_normalized', 'email_normalized']
      const condition = buildSearchCondition(columns, 'jose')

      expect(condition).toBe('name_normalized.ilike.%jose%,email_normalized.ilike.%jose%')
    })

    it('should normalize search term', () => {
      const columns = ['name_normalized']
      const condition = buildSearchCondition(columns, 'José García')

      expect(condition).toContain('jose garcia')
    })

    it('should return null for empty search term', () => {
      const columns = ['name_normalized']

      expect(buildSearchCondition(columns, '')).toBeNull()
      expect(buildSearchCondition(columns, '  ')).toBeNull()
      expect(buildSearchCondition(columns, null)).toBeNull()
    })

    it('should handle single column', () => {
      const columns = ['name_normalized']
      const condition = buildSearchCondition(columns, 'test')

      expect(condition).toBe('name_normalized.ilike.%test%')
    })

    it('should handle three columns', () => {
      const columns = ['name_normalized', 'email_normalized', 'phone_normalized']
      const condition = buildSearchCondition(columns, 'test')

      expect(condition).toBe(
        'name_normalized.ilike.%test%,email_normalized.ilike.%test%,phone_normalized.ilike.%test%'
      )
    })

    it('should handle special characters in condition', () => {
      const columns = ['name_normalized']
      const condition = buildSearchCondition(columns, '50%')

      // The normalize function removes % so pattern is just '50'
      expect(condition).toContain('50')
      expect(condition).toContain('.ilike.')
    })

    it('should trim search term', () => {
      const columns = ['name_normalized']
      const condition = buildSearchCondition(columns, '  test  ')

      expect(condition).toBe('name_normalized.ilike.%test%')
    })
  })

  describe('Integration tests', () => {
    it('should handle full search workflow', () => {
      const searchTerm = 'José García 50%'
      const normalized = normalizeSearch(searchTerm)
      const pattern = buildLikePattern(searchTerm)

      expect(normalized).toBe('jose garcia 50')
      expect(pattern).toBe('%jose garcia 50%')
    })

    it('should match database normalization behavior', () => {
      // These should match the GENERATED column behavior in PostgreSQL
      const testCases = [
        { input: 'José García', expected: 'jose garcia' },
        { input: 'María José', expected: 'maria jose' },
        { input: 'Ñoño', expected: 'nono' },
        { input: 'café', expected: 'cafe' }
      ]

      testCases.forEach(({ input, expected }) => {
        expect(normalizeSearch(input)).toBe(expected)
      })
    })
  })
})
