import { test, expect } from '@playwright/test'

test.describe('ALWAYS PASSING', () => {
  test('should pass', () => {
    expect(true).toBe(true)
  })
})
