import { describe, test, expect } from 'vitest'
import { createSupabaseClientMock } from './supabase-client/mocks/mocks.js'

describe('Simple Supabase Mock Test', () => {
  test('should create client', () => {
    const client = createSupabaseClientMock()
    expect(client).toBeDefined()
  })

  test('should select from users', async () => {
    const client = createSupabaseClientMock()
    const { data, error } = await client.from('users').select()
    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(Array.isArray(data)).toBe(true)
  })
})
