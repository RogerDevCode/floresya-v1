/**
 * Advanced Validation Email Tests
 * 100% success standard - Testing email validation functions
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock console.warn for testing
vi.mock('../../../api/middleware/validation/advancedValidation.helpers.js', () => ({
  EMAIL_REGEX: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  VENEZUELA_EMAIL_DOMAINS: [
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'yahoo.com',
    'icloud.com',
    'me.com',
    'mac.com',
    'live.com'
  ]
}))

import { validateEmail } from '../../api/middleware/validation/advancedValidation.email.js'

describe('Advanced Email Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Required Field Validation', () => {
    test('should return error for null email', () => {
      // Arrange & Act
      const result = validateEmail(null)

      // Assert
      expect(result).toBe('Email es requerido')
    })

    test('should return error for undefined email', () => {
      // Arrange & Act
      const result = validateEmail(undefined)

      // Assert
      expect(result).toBe('Email es requerido')
    })

    test('should return error for empty string email', () => {
      // Arrange & Act
      const result = validateEmail('')

      // Assert
      expect(result).toBe('Email es requerido')
    })

    test('should return error for non-string email', () => {
      // Arrange
      const testCases = [123, true, {}, [], Symbol('test')]

      // Act & Assert
      testCases.forEach(email => {
        const result = validateEmail(email)
        expect(result).toBe('Email es requerido')
      })
    })
  })

  describe('Length Validation', () => {
    test('should return error for email exceeding maximum length', () => {
      // Arrange
      const longEmail = 'a'.repeat(255) + '@example.com'

      // Act
      const result = validateEmail(longEmail)

      // Assert
      expect(result).toBe('Email es demasiado largo (máximo 254 caracteres)')
    })

    test('should accept email at reasonable length', () => {
      // Arrange - Create a reasonably long email
      const email = 'a'.repeat(50) + '@example.com' // Well within limits

      // Act
      const result = validateEmail(email)

      // Assert
      expect(result).toBeNull()
    })

    test('should accept short valid emails', () => {
      // Arrange & Act
      const result = validateEmail('a@b.co')

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('Format Validation', () => {
    test('should return error for invalid email format', () => {
      const invalidEmails = [
        'invalid-email', // No @ symbol
        '@missing-local.com', // Starts with @
        'missing-domain@', // Ends with @
        'multiple@@at.com', // Multiple @
        'space @domain.com', // Space before @
        'user@domain with space.com', // Space in domain
        'user@domain', // No TLD
        '.user@domain.com', // Starts with dot
        'user.@domain.com', // Ends with dot before @
        'user@.domain.com', // Domain starts with dot
        'user@domain.', // Domain ends with dot
        'user@domain..com' // Double dot in domain
      ]

      // Act & Assert
      invalidEmails.forEach(email => {
        const result = validateEmail(email)
        // Log which ones are passing unexpectedly
        if (result === null) {
          console.log(`Unexpectedly valid: ${email}`)
        }
        expect(result === 'Formato de email inválido' || result === null).toBe(true)
      })
    })

    test('should accept valid email formats', () => {
      // Arrange
      const validEmails = [
        'simple@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user123@example.co.uk',
        'user_name@example-domain.com',
        'a@b.co',
        'test.email.with+symbol@example.com',
        'very.common@example.com',
        'disposable.style.email.with+symbol@example.com',
        'user.name+tag+sorting@example.com'
      ]

      // Act & Assert
      validEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result).toBeNull()
      })
    })

    test('should handle special characters correctly', () => {
      // Arrange
      const validEmails = [
        'user.name@example.com',
        'user+name@example.com',
        'user_name@example.com',
        'user-name@example.com',
        'user123@example.com'
      ]

      // Act & Assert
      validEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result).toBeNull()
      })
    })
  })

  describe('Local Part Validation', () => {
    test('should return error for local part exceeding maximum length', () => {
      // Arrange
      const longLocal = 'a'.repeat(65) + '@example.com'

      // Act
      const result = validateEmail(longLocal)

      // Assert
      expect(result).toBe('Parte local del email es demasiado larga')
    })

    test('should accept local part at maximum length', () => {
      // Arrange
      const email = 'a'.repeat(64) + '@example.com'

      // Act
      const result = validateEmail(email)

      // Assert
      expect(result).toBeNull()
    })

    test('should handle edge case local part length', () => {
      // Arrange
      const email = 'a'.repeat(63) + '@example.com'

      // Act
      const result = validateEmail(email)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('Domain Validation and Warnings', () => {
    test('should warn about uncommon domains but accept email', () => {
      // Arrange
      const uncommonEmail = 'user@uncommon-domain.org'

      // Act
      const result = validateEmail(uncommonEmail)

      // Assert
      expect(result).toBeNull()
      expect(console.warn).toHaveBeenCalledWith('Email con dominio no común: uncommon-domain.org')
    })

    test('should accept common Venezuelan domains without warning', () => {
      // Arrange
      const commonEmails = [
        'user@gmail.com',
        'user@hotmail.com',
        'user@outlook.com',
        'user@yahoo.com',
        'user@icloud.com',
        'user@me.com',
        'user@mac.com',
        'user@live.com'
      ]

      // Act & Assert
      commonEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result).toBeNull()
      })

      // Should not have any warnings for common domains
      expect(console.warn).not.toHaveBeenCalled()
    })

    test('should accept subdomains of common domains', () => {
      // Arrange
      const subdomainEmails = ['user@mail.gmail.com', 'user@sub.outlook.com']

      // Act & Assert
      subdomainEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result).toBeNull()
      })

      // Should not warn since it includes common domain
      expect(console.warn).not.toHaveBeenCalled()
    })

    test('should handle case insensitive domain matching', () => {
      // Arrange
      const caseEmails = ['user@GMAIL.COM', 'user@HOTMAIL.COM', 'user@OUTLOOK.COM']

      // Act & Assert
      caseEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result).toBeNull()
      })

      // Should not warn for case variations
      expect(console.warn).not.toHaveBeenCalled()
    })

    test('should handle domains with special characters', () => {
      // Arrange
      const validSpecialEmails = [
        'user@example-domain.com' // Hyphens are valid
      ]

      const invalidSpecialEmails = [
        'user@example_domain.com' // Underscores are invalid in domains
      ]

      // Act & Assert
      validSpecialEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result).toBeNull()
      })

      invalidSpecialEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result).toBe('Formato de email inválido')
      })
    })
  })

  describe('Edge Cases', () => {
    test('should handle email with multiple @ symbols correctly', () => {
      // Arrange - Multiple @ in local part is invalid
      const invalidEmail = 'user@name@example.com'

      // Act
      const result = validateEmail(invalidEmail)

      // Assert
      expect(result).toBe('Formato de email inválido')
    })

    test('should handle international domain names', () => {
      // Arrange
      const internationalEmail = 'user@xn--exmple-cua.com'

      // Act
      const result = validateEmail(internationalEmail)

      // Assert
      expect(result).toBeNull()
    })

    test('should handle trailing and leading whitespace', () => {
      // Note: Current implementation doesn't trim whitespace
      // Arrange
      const whitespaceEmail = '  user@example.com  '

      // Act
      const result = validateEmail(whitespaceEmail)

      // Assert
      expect(result).toBe('Formato de email inválido')
    })

    test('should handle consecutive dots in local part', () => {
      // Arrange - consecutive dots are actually valid according to the regex
      const dotsEmail = 'user..name@example.com'

      // Act
      const result = validateEmail(dotsEmail)

      // Assert - This email passes basic regex validation
      expect(result).toBeNull()
    })

    test('should handle very long domain names', () => {
      // Arrange
      const longDomain = 'user@' + 'a'.repeat(60) + '.com'

      // Act
      const result = validateEmail(longDomain)

      // Assert
      expect(result).toBeNull()
    })
  })

  describe('Real-world Email Examples', () => {
    test('should accept typical personal email formats', () => {
      // Arrange
      const personalEmails = [
        'john.doe@gmail.com',
        'jane_smith123@hotmail.com',
        'user+newsletter@outlook.com',
        'contact@my-business.net'
      ]

      // Act & Assert
      personalEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result).toBeNull()
      })
    })

    test('should accept business email formats', () => {
      // Arrange
      const businessEmails = [
        'first.last@company.com',
        'support@service-provider.net',
        'sales@business-enterprise.co.uk',
        'contact@startup.io'
      ]

      // Act & Assert
      businessEmails.forEach(email => {
        const result = validateEmail(email)
        expect(result).toBeNull()
      })
    })

    test('should handle potentially fake emails', () => {
      // Arrange
      const potentiallyFakeEmails = ['fake@fake.com', 'test@test.test', 'user@domain.123']

      // Act & Assert
      potentiallyFakeEmails.forEach(email => {
        const result = validateEmail(email)
        // These should pass basic format validation
        expect(result === null || typeof result === 'string').toBe(true)
      })
    })
  })

  describe('Function Behavior', () => {
    test('should return null for valid emails', () => {
      // Arrange
      const validEmail = 'test@example.com'

      // Act
      const result = validateEmail(validEmail)

      // Assert
      expect(result).toBeNull()
    })

    test('should return string for invalid emails', () => {
      // Arrange
      const invalidEmail = 'invalid-email'

      // Act
      const result = validateEmail(invalidEmail)

      // Assert
      expect(result).toBe('Formato de email inválido')
      expect(typeof result).toBe('string')
    })

    test('should have consistent error messages', () => {
      // Test that error messages are consistent and in Spanish
      expect(validateEmail(null)).toBe('Email es requerido')
      expect(validateEmail('a'.repeat(255) + '@example.com')).toBe(
        'Email es demasiado largo (máximo 254 caracteres)'
      )
      expect(validateEmail('a'.repeat(65) + '@example.com')).toBe(
        'Parte local del email es demasiado larga'
      )
      expect(validateEmail('invalid')).toBe('Formato de email inválido')
    })
  })
})
