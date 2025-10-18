/**
 * User Service Tests
 * Tests each functionality separately (one test per function)
 * Tests all possible combinations of filters and scenarios
 */

import { describe, it, expect, vi } from 'vitest'
import * as userService from '../userService.js'
import { supabase } from '../supabaseClient.js'
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  BadRequestError
} from '../../errors/AppError.js'

// Mock supabase
vi.mock('../supabaseClient.js', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            range: vi.fn()
          }))
        })),
        or: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              range: vi.fn()
            }))
          }))
        })),
        order: vi.fn(() => ({
          range: vi.fn()
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      }))
    }))
  },
  DB_SCHEMA: {
    users: {
      table: 'users',
      enums: {
        role: ['user', 'admin']
      }
    }
  }
}))

// Mock console.error to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('getAllUsers', () => {
  it('should get all active users with no filters', async () => {
    const mockUsers = [
      { id: 1, email: 'user1@test.com', role: 'user', is_active: true },
      { id: 2, email: 'user2@test.com', role: 'user', is_active: true }
    ]

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({
              data: mockUsers,
              error: null
            })
          })
        })
      })
    })

    const result = await userService.getAllUsers({}, false)

    expect(result).toEqual(mockUsers)
    expect(supabase.from).toHaveBeenCalledWith('users')
  })

  it('should filter by role', async () => {
    const mockUsers = [{ id: 1, email: 'admin@test.com', role: 'admin', is_active: true }]

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({
                data: mockUsers,
                error: null
              })
            })
          })
        })
      })
    })

    const result = await userService.getAllUsers({ role: 'admin' }, false)

    expect(result).toEqual(mockUsers)
  })

  it('should filter by email verified status', async () => {
    const mockUsers = [{ id: 1, email: 'user@test.com', email_verified: true, is_active: true }]

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({
                data: mockUsers,
                error: null
              })
            })
          })
        })
      })
    })

    const result = await userService.getAllUsers({ email_verified: true }, false)

    expect(result).toEqual(mockUsers)
  })

  it('should search by email and name', async () => {
    const mockUsers = [{ id: 1, email: 'test@test.com', full_name: 'Test User', is_active: true }]

    const mockQuery = {
      or: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: mockUsers,
        error: null
      })
    }

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue(mockQuery)
    })

    const result = await userService.getAllUsers({ search: 'test' }, false)

    expect(result).toEqual(mockUsers)
  })

  it('should include inactive users for admin', async () => {
    const mockUsers = [
      { id: 1, email: 'user1@test.com', is_active: true },
      { id: 2, email: 'user2@test.com', is_active: false }
    ]

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({
            data: mockUsers,
            error: null
          })
        })
      })
    })

    const result = await userService.getAllUsers({}, true)

    expect(result).toEqual(mockUsers)
  })

  it('should throw NotFoundError when no users found', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      })
    })

    await expect(userService.getAllUsers({}, false)).rejects.toThrow(NotFoundError)
  })

  it('should throw DatabaseError on database error', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' }
            })
          })
        })
      })
    })

    await expect(userService.getAllUsers({}, false)).rejects.toThrow(DatabaseError)
  })
})

describe('getUserById', () => {
  it('should get user by valid ID', async () => {
    const mockUser = { id: 1, email: 'user@test.com', role: 'user', is_active: true }

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      })
    })

    const result = await userService.getUserById(1, false)

    expect(result).toEqual(mockUser)
  })

  it('should throw BadRequestError for invalid ID', async () => {
    await expect(userService.getUserById(null, false)).rejects.toThrow(BadRequestError)
    await expect(userService.getUserById('invalid', false)).rejects.toThrow(BadRequestError)
  })

  it('should throw NotFoundError when user not found', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      })
    })

    await expect(userService.getUserById(999, false)).rejects.toThrow(NotFoundError)
  })

  it('should include inactive users for admin', async () => {
    const mockUser = { id: 1, email: 'user@test.com', is_active: false }

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockUser,
            error: null
          })
        })
      })
    })

    const result = await userService.getUserById(1, true)

    expect(result).toEqual(mockUser)
  })
})

describe('getUserByEmail', () => {
  it('should get user by valid email', async () => {
    const mockUser = { id: 1, email: 'user@test.com', role: 'user', is_active: true }

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      })
    })

    const result = await userService.getUserByEmail('user@test.com', false)

    expect(result).toEqual(mockUser)
  })

  it('should throw BadRequestError for invalid email', async () => {
    await expect(userService.getUserByEmail(null, false)).rejects.toThrow(BadRequestError)
    await expect(userService.getUserByEmail('', false)).rejects.toThrow(BadRequestError)
    await expect(userService.getUserByEmail(123, false)).rejects.toThrow(BadRequestError)
  })

  it('should throw NotFoundError when user not found', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116' }
            })
          })
        })
      })
    })

    await expect(userService.getUserByEmail('nonexistent@test.com', false)).rejects.toThrow(
      NotFoundError
    )
  })
})

describe('getUsersByFilter', () => {
  it('should filter by role only', async () => {
    const mockUsers = [{ id: 1, email: 'admin@test.com', role: 'admin', is_active: true }]

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({
              data: mockUsers,
              error: null
            })
          })
        })
      })
    })

    const result = await userService.getUsersByFilter({ role: 'admin' })

    expect(result).toEqual(mockUsers)
  })

  it('should filter by state only', async () => {
    const mockUsers = [{ id: 1, email: 'user@test.com', is_active: false }]

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({
              data: mockUsers,
              error: null
            })
          })
        })
      })
    })

    const result = await userService.getUsersByFilter({ state: false })

    expect(result).toEqual(mockUsers)
  })

  it('should filter by email verified only', async () => {
    const mockUsers = [{ id: 1, email: 'user@test.com', email_verified: true, is_active: true }]

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({
              data: mockUsers,
              error: null
            })
          })
        })
      })
    })

    const result = await userService.getUsersByFilter({ email_verified: true })

    expect(result).toEqual(mockUsers)
  })

  it('should combine multiple filters', async () => {
    const mockUsers = [
      { id: 1, email: 'admin@test.com', role: 'admin', is_active: true, email_verified: true }
    ]

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({
                  data: mockUsers,
                  error: null
                })
              })
            })
          })
        })
      })
    })

    const result = await userService.getUsersByFilter({
      role: 'admin',
      state: true,
      email_verified: true
    })

    expect(result).toEqual(mockUsers)
  })

  it('should return all active users when no filters provided', async () => {
    const mockUsers = [
      { id: 1, email: 'user1@test.com', is_active: true },
      { id: 2, email: 'user2@test.com', is_active: true }
    ]

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({
              data: mockUsers,
              error: null
            })
          })
        })
      })
    })

    const result = await userService.getUsersByFilter({})

    expect(result).toEqual(mockUsers)
  })
})

describe('createUser', () => {
  it('should create user with minimal data (client registration)', async () => {
    const userData = {
      email: 'client@test.com',
      full_name: 'Client User'
    }

    const mockCreatedUser = {
      id: 1,
      ...userData,
      role: 'user',
      is_active: true,
      email_verified: false,
      password_hash: null
    }

    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockCreatedUser,
            error: null
          })
        })
      })
    })

    const result = await userService.createUser(userData)

    expect(result).toEqual(mockCreatedUser)
  })

  it('should create admin user with password', async () => {
    const userData = {
      email: 'admin@test.com',
      full_name: 'Admin User',
      role: 'admin',
      password_hash: 'hashed_password'
    }

    const mockCreatedUser = {
      id: 1,
      ...userData,
      is_active: true,
      email_verified: false
    }

    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockCreatedUser,
            error: null
          })
        })
      })
    })

    const result = await userService.createUser(userData)

    expect(result).toEqual(mockCreatedUser)
  })

  it('should throw ValidationError for missing email', async () => {
    await expect(userService.createUser({ full_name: 'Test' })).rejects.toThrow(ValidationError)
  })

  it('should throw ValidationError for invalid email', async () => {
    await expect(userService.createUser({ email: 'invalid-email' })).rejects.toThrow(
      ValidationError
    )
  })

  it('should throw ValidationError for admin without password', async () => {
    await expect(
      userService.createUser({
        email: 'admin@test.com',
        role: 'admin'
      })
    ).rejects.toThrow(ValidationError)
  })

  it('should throw ValidationError for invalid role', async () => {
    await expect(
      userService.createUser({
        email: 'user@test.com',
        role: 'invalid_role'
      })
    ).rejects.toThrow(ValidationError)
  })

  it('should throw DatabaseError on database error', async () => {
    supabase.from.mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' }
          })
        })
      })
    })

    await expect(
      userService.createUser({
        email: 'user@test.com'
      })
    ).rejects.toThrow(DatabaseError)
  })
})

describe('updateUser', () => {
  it('should update user with valid data', async () => {
    const updates = { full_name: 'Updated Name' }
    const mockUpdatedUser = {
      id: 1,
      email: 'user@test.com',
      full_name: 'Updated Name',
      is_active: true
    }

    supabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdatedUser,
                error: null
              })
            })
          })
        })
      })
    })

    const result = await userService.updateUser(1, updates)

    expect(result).toEqual(mockUpdatedUser)
  })

  it('should throw BadRequestError for invalid ID', async () => {
    await expect(userService.updateUser(null, { full_name: 'Test' })).rejects.toThrow(
      BadRequestError
    )
    await expect(userService.updateUser('invalid', { full_name: 'Test' })).rejects.toThrow(
      BadRequestError
    )
  })

  it('should throw BadRequestError for no updates', async () => {
    await expect(userService.updateUser(1, {})).rejects.toThrow(BadRequestError)
  })

  it('should throw ValidationError for invalid role', async () => {
    await expect(userService.updateUser(1, { role: 'invalid_role' })).rejects.toThrow(
      ValidationError
    )
  })

  it('should throw NotFoundError when user not found', async () => {
    supabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            })
          })
        })
      })
    })

    await expect(userService.updateUser(999, { full_name: 'Test' })).rejects.toThrow(NotFoundError)
  })
})

describe('deleteUser', () => {
  it('should soft delete user', async () => {
    const mockDeletedUser = {
      id: 1,
      email: 'user@test.com',
      is_active: false
    }

    supabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockDeletedUser,
                error: null
              })
            })
          })
        })
      })
    })

    const result = await userService.deleteUser(1)

    expect(result).toEqual(mockDeletedUser)
    expect(result.is_active).toBe(false)
  })

  it('should throw BadRequestError for invalid ID', async () => {
    await expect(userService.deleteUser(null)).rejects.toThrow(BadRequestError)
    await expect(userService.deleteUser('invalid')).rejects.toThrow(BadRequestError)
  })

  it('should throw NotFoundError when user not found', async () => {
    supabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }
              })
            })
          })
        })
      })
    })

    await expect(userService.deleteUser(999)).rejects.toThrow(NotFoundError)
  })
})
