import { describe, test, expect } from 'vitest'
import { createSupabaseClientMock } from './supabase-client/mocks/mocks.js'

describe('Simple Supabase Mock Test', () => {
  test('should create client', () => {
    const client = createSupabaseClientMock()
    expect(client).toHaveProperty('from')
    expect(typeof client.from).toBe('function')
  })

  test('should select from users', async () => {
    const client = createSupabaseClientMock()
    const { data, error } = await client.from('users').select()
    expect(error).toBeNull()
    expect(data).toEqual(expect.any(Array))
    expect(data.length).toBeGreaterThan(0)
    expect(Array.isArray(data)).toBe(true)
  })
})
