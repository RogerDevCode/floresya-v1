/**
 * Comprehensive Supabase Client Tests - Vitest Edition
 * Tests database operations, RPC functions, transactions, error handling, and data consistency
 * Following Supabase official documentation and MIT/Stanford best practices
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import {
  createSupabaseClientMock,
  UserRepository,
  ProfileRepository,
  DIContainer,
  UserService,
  PerformanceMonitor
} from './mocks/mocks.js'

// Helper function to create test client
function createTestClient() {
  return createSupabaseClientMock({
    url: 'https://test-project.supabase.co',
    anonKey: 'test-anon-key'
  })
}

describe('Repository Pattern Tests', () => {
  let client
  let userRepository
  let profileRepository

  beforeEach(() => {
    client = createTestClient()
    userRepository = new UserRepository(client)
    profileRepository = new ProfileRepository(client)
  })

  afterEach(() => {
    client.reset()
  })

  describe('BaseRepository Operations', () => {
    test('should find record by ID', async () => {
      const user = await userRepository.findById(1)

      expect(user).not.toBeNull()
      expect(user.id).toBe(1)
      expect(user.email).toEqual(expect.any(String))
    })

    test('should find one record with filters', async () => {
      const user = await userRepository.findOne({ email: 'user1@example.com' })

      expect(user).not.toBeNull()
      expect(user.email).toBe('user1@example.com')
    })

    test('should find many records with filters', async () => {
      const users = await userRepository.findMany({}, { limit: 10 })

      expect(Array.isArray(users)).toBe(true)
      expect(users.length).toBeGreaterThan(0)
    })

    test('should create new record', async () => {
      const userData = {
        email: 'repo-test@example.com',
        name: 'Repository Test User'
      }

      const user = await userRepository.create(userData)

      expect(user).not.toBeNull()
      expect(user.email).toBe(userData.email)
      expect(user.name).toBe(userData.name)
      expect(user.id).toEqual(expect.any(Number))
    })

    test('should update record', async () => {
      const updates = { name: 'Updated Repository User' }
      const user = await userRepository.update(1, updates)

      expect(user).not.toBeNull()
      expect(user.name).toBe(updates.name)
    })

    test('should update multiple records', async () => {
      const updates = { name: 'Batch Updated' }
      const users = await userRepository.updateMany({}, updates)

      expect(Array.isArray(users)).toBe(true)
      expect(users.every(user => user.name === updates.name)).toBe(true)
    })

    test('should delete record', async () => {
      const user = await userRepository.delete(1)

      expect(user).not.toBeNull()
      expect(user.id).toBe(1)
    })

    test('should soft delete record', async () => {
      const user = await userRepository.softDelete(1)

      expect(user).not.toBeNull()
      expect(user.deleted_at).not.toBeNull()
    })

    test('should find only active records', async () => {
      // Soft delete a user first
      await userRepository.softDelete(1)

      const activeUsers = await userRepository.findActive()

      expect(activeUsers.every(user => user.deleted_at === null)).toBe(true)
    })
  })

  describe('UserRepository Specific Operations', () => {
    test('should find user by email', async () => {
      const user = await userRepository.findByEmail('user1@example.com')

      expect(user).not.toBeNull()
      expect(user.email).toBe('user1@example.com')
    })

    test('should find user with profile', async () => {
      const userWithProfile = await userRepository.findWithProfile(1)

      expect(userWithProfile).not.toBeNull()
      expect(userWithProfile.id).toBe(1)
      expect(userWithProfile.profiles).toEqual(expect.any(Array))
      expect(Array.isArray(userWithProfile.profiles)).toBe(true)
    })

    test('should create user with profile transaction', async () => {
      const userData = {
        email: 'user-with-profile@example.com',
        name: 'User With Profile'
      }
      const profileData = {
        bio: 'Profile bio for transaction test'
      }

      const result = await userRepository.createUserWithProfile(userData, profileData)

      expect(result.user).not.toBeNull()
      expect(result.profile).not.toBeNull()
      expect(result.user.email).toBe(userData.email)
      expect(result.profile.bio).toBe(profileData.bio)
      expect(result.profile.user_id).toBe(result.user.id)
    })
  })

  describe('ProfileRepository Specific Operations', () => {
    test('should find profile by user ID', async () => {
      const profile = await profileRepository.findByUserId(1)

      expect(profile).not.toBeNull()
      expect(profile.user_id).toBe(1)
    })

    test('should update profile by user ID', async () => {
      const updates = { bio: 'Updated bio' }
      const profile = await profileRepository.updateByUserId(1, updates)

      expect(profile).not.toBeNull()
      expect(profile.bio).toBe(updates.bio)
    })
  })
})

describe('Service Layer Integration Tests with DI Container', () => {
  let container
  let client
  let userService

  beforeEach(() => {
    client = createTestClient()
    container = new DIContainer()

    // Register dependencies
    container.register('supabaseClient', () => client, { singleton: true })
    container.register('userRepository', client => new UserRepository(client), {
      dependencies: ['supabaseClient'],
      singleton: true
    })
    container.register('profileRepository', client => new ProfileRepository(client), {
      dependencies: ['supabaseClient'],
      singleton: true
    })
    container.register('performanceMonitor', () => client.performanceMonitor, {
      singleton: true
    })
    container.register(
      'userService',
      (userRepo, profileRepo, perfMonitor) => new UserService(userRepo, profileRepo, perfMonitor),
      {
        dependencies: ['userRepository', 'profileRepository', 'performanceMonitor'],
        singleton: true
      }
    )

    userService = container.get('userService')
  })

  afterEach(() => {
    client.reset()
    container.clear()
  })

  test('should resolve dependencies correctly', () => {
    expect(container.has('userService')).toBe(true)
    expect(container.has('userRepository')).toBe(true)
    expect(container.has('profileRepository')).toBe(true)

    const userRepo = container.get('userRepository')
    const profileRepo = container.get('profileRepository')
    const perfMonitor = container.get('performanceMonitor')

    expect(userRepo).toBeInstanceOf(UserRepository)
    expect(profileRepo).toBeInstanceOf(ProfileRepository)
    expect(perfMonitor).toBeInstanceOf(PerformanceMonitor)
  })

  test('should use singleton pattern correctly', () => {
    const userService1 = container.get('userService')
    const userService2 = container.get('userService')

    expect(userService1).toBe(userService2)
  })

  test('should get user with profile through service layer', async () => {
    const result = await userService.getUserWithProfile(1)

    expect(result).not.toBeNull()
    expect(result.id).toBe(1)
    expect(result.profiles).toEqual(expect.any(Array))

    // Check performance monitoring
    const metrics = client.getPerformanceMetrics()
    expect(metrics.totalQueries).toBeGreaterThan(0)
    expect(metrics.queries.some(q => q.operation === 'service')).toBe(true)
  })

  test('should create user with profile through service layer', async () => {
    const userData = {
      email: 'service-user@example.com',
      name: 'Service User'
    }
    const profileData = {
      bio: 'Service user bio'
    }

    const result = await userService.createUserWithProfile(userData, profileData)

    expect(result.user).not.toBeNull()
    expect(result.profile).not.toBeNull()
    expect(result.user.email).toBe(userData.email)
    expect(result.profile.user_id).toBe(result.user.id)

    // Check performance monitoring
    const metrics = client.getPerformanceMetrics()
    expect(
      metrics.queries.some(q => q.operation === 'service' && q.method === 'createUserWithProfile')
    ).toBe(true)
  })

  test('should soft delete user through service layer', async () => {
    // Create a user first
    const { user } = await userService.createUserWithProfile(
      { email: 'delete-me@example.com', name: 'Delete Me' },
      { bio: 'To be deleted' }
    )

    const result = await userService.softDeleteUser(user.id)

    expect(result).toBe(true)

    // Verify user is soft deleted
    const deletedUser = await userService.getUserWithProfile(user.id)
    expect(deletedUser.deleted_at).not.toBeNull()
  })

  test('should handle service layer errors with performance tracking', async () => {
    // Simulate an error
    const originalMethod = userService.userRepository.findById
    userService.userRepository.findById = vi.fn().mockRejectedValue(new Error('Service error'))

    try {
      await userService.getUserWithProfile(999)
      throw new Error('Should have thrown an error')
    } catch (error) {
      expect(error).not.toBeNull()

      // Check that error was tracked in performance monitoring
      const metrics = client.getPerformanceMetrics()
      expect(metrics.failedQueries).toBeGreaterThan(0)
      expect(metrics.queries.some(q => q.success === false)).toBe(true)
    }

    // Restore original method
    userService.userRepository.findById = originalMethod
  })
})
