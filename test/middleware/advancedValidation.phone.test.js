import { describe, it, expect } from 'vitest'
import { validateVenezuelanPhone } from '../../api/middleware/validation/advancedValidation.phone.js'

describe('Advanced Validation - Venezuelan Phone', () => {
  describe('validateVenezuelanPhone', () => {
    it('should accept valid mobile format 04141234567', () => {
      const result = validateVenezuelanPhone('04141234567')
      expect(result).toBeNull()
    })

    it('should accept format with country code +584141234567', () => {
      const result = validateVenezuelanPhone('+584141234567')
      expect(result).toBeNull()
    })

    it('should accept format with country code 584141234567', () => {
      const result = validateVenezuelanPhone('584141234567')
      expect(result).toBeNull()
    })

    it('should accept formatted phone (+58)-414-7166388', () => {
      const result = validateVenezuelanPhone('(+58)-414-7166388')
      expect(result).toBeNull()
    })

    it('should accept 0412 prefix', () => {
      const result = validateVenezuelanPhone('04121234567')
      expect(result).toBeNull()
    })

    it('should accept 0416 prefix', () => {
      const result = validateVenezuelanPhone('04161234567')
      expect(result).toBeNull()
    })

    it('should accept 0424 prefix', () => {
      const result = validateVenezuelanPhone('04241234567')
      expect(result).toBeNull()
    })

    it('should accept 0426 prefix', () => {
      const result = validateVenezuelanPhone('04261234567')
      expect(result).toBeNull()
    })

    it('should accept landline 02121234567', () => {
      const result = validateVenezuelanPhone('02121234567')
      expect(result).toBeNull()
    })

    it('should reject null or undefined', () => {
      expect(validateVenezuelanPhone(null)).toContain('requerido')
      expect(validateVenezuelanPhone(undefined)).toContain('requerido')
    })

    it('should reject non-string input', () => {
      expect(validateVenezuelanPhone(123)).toContain('requerido')
    })

    it('should reject too short phone', () => {
      const result = validateVenezuelanPhone('0414123')
      expect(result).toContain('10 dígitos')
    })

    it('should reject too long phone', () => {
      const result = validateVenezuelanPhone('0414123456789012345')
      expect(result).toContain('demasiados dígitos')
    })

    it('should reject invalid prefix 0499', () => {
      const result = validateVenezuelanPhone('04991234567')
      expect(result).toContain('inválido')
    })

    it('should reject invalid prefix 0111', () => {
      const result = validateVenezuelanPhone('01111234567')
      expect(result).toContain('inválido')
    })
  })
})
