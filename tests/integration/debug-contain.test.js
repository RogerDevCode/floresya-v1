import { describe, it, expect } from 'vitest'

describe('Debug contain matcher', () => {
  it('should pass when string contains substring with correct case', () => {
    expect('ValidationError').toContain('Validation')
  })

  it('should fail when string does not contain substring', () => {
    expect('ValidationError').not.toContain('invalid')
  })

  it('should handle case sensitivity', () => {
    // Check if toContain is case sensitive
    expect('ValidationError').not.toContain('validation') // This should pass - case sensitive
    expect('ValidationError').toContain('ValidationError') // This should pass
  })

  it('should pass when string contains lowercase validation', () => {
    expect('validationError').toContain('validation') // This should pass
  })
})
