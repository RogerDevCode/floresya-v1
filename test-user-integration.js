/**
 * User Integration Test Script
 * Tests OpenAPI client functionality and user management features
 */

import { api } from './public/js/shared/api-client.js'

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testUser: {
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+58 412 999 9999',
    role: 'user'
  }
}

class UserIntegrationTester {
  constructor() {
    this.testResults = []
    this.errors = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`)
    this.testResults.push({ timestamp, type, message })
  }

  error(message, error) {
    const errorMsg = `${message}: ${error.message}`
    console.error(`[${new Date().toISOString()}] ERROR: ${errorMsg}`)
    this.errors.push({ message: errorMsg, error })
    this.log(errorMsg, 'error')
  }

  async testApiClient() {
    this.log('Testing OpenAPI client functionality...')

    try {
      // Test 1: Get all users
      this.log('Test 1: Getting all users...')
      const usersResult = await api.getAllUsers()
      if (usersResult.success) {
        this.log(`✓ Successfully retrieved ${usersResult.data.length} users`)
        return usersResult.data
      } else {
        throw new Error(usersResult.message || 'Failed to get users')
      }
    } catch (error) {
      this.error('Failed to test API client', error)
      return []
    }
  }

  async testUserCreation(users) {
    this.log('Testing user creation...')

    try {
      // Check if test user already exists
      const existingUser = users.find(u => u.email === TEST_CONFIG.testUser.email)

      if (existingUser) {
        this.log(`✓ Test user already exists (ID: ${existingUser.id})`)
        return existingUser
      }

      // Create new test user
      this.log('Creating new test user...')
      const createResult = await api.createUsers(TEST_CONFIG.testUser)

      if (createResult.success) {
        this.log(`✓ Successfully created test user (ID: ${createResult.data.id})`)
        return createResult.data
      } else {
        throw new Error(createResult.message || 'Failed to create user')
      }
    } catch (error) {
      this.error('Failed to test user creation', error)
      return null
    }
  }

  async testUserSearch(testUser) {
    if (!testUser) {
      this.log('⚠️ Skipping search test - no test user available')
      return
    }

    this.log('Testing user search functionality...')

    try {
      // Test search by email
      this.log('Searching by email...')
      const searchResult = await api.getAllUsers({ search: testUser.email })

      if (searchResult.success) {
        const foundUsers = searchResult.data.filter(u => u.email === testUser.email)
        if (foundUsers.length > 0) {
          this.log(`✓ Successfully found user by email search (${foundUsers.length} results)`)
        } else {
          this.log('⚠️ User not found in search results')
        }
      } else {
        throw new Error(searchResult.message || 'Search failed')
      }
    } catch (error) {
      this.error('Failed to test user search', error)
    }
  }

  async testUserFiltering(testUser) {
    if (!testUser) {
      this.log('⚠️ Skipping filter test - no test user available')
      return
    }

    this.log('Testing user filtering functionality...')

    try {
      // Test role filter
      this.log('Testing role filter...')
      const roleResult = await api.getAllUsers({ role: testUser.role })

      if (roleResult.success) {
        const filteredUsers = roleResult.data.filter(u => u.role === testUser.role)
        this.log(`✓ Role filter working (${filteredUsers.length} ${testUser.role} users found)`)
      } else {
        throw new Error(roleResult.message || 'Role filter failed')
      }

      // Test email verification filter
      this.log('Testing email verification filter...')
      const verifiedResult = await api.getAllUsers({ email_verified: false })

      if (verifiedResult.success) {
        const unverifiedUsers = verifiedResult.data.filter(u => !u.email_verified)
        this.log(
          `✓ Email verification filter working (${unverifiedUsers.length} unverified users found)`
        )
      } else {
        throw new Error(verifiedResult.message || 'Email verification filter failed')
      }
    } catch (error) {
      this.error('Failed to test user filtering', error)
    }
  }

  async testUserUpdate(testUser) {
    if (!testUser) {
      this.log('⚠️ Skipping update test - no test user available')
      return
    }

    this.log('Testing user update functionality...')

    try {
      const updateData = {
        full_name: 'Updated Test User',
        phone: '+58 412 888 8888'
      }

      this.log('Updating test user...')
      const updateResult = await api.updateUsers(testUser.id, updateData)

      if (updateResult.success) {
        this.log(`✓ Successfully updated test user (ID: ${testUser.id})`)
        return updateResult.data
      } else {
        throw new Error(updateResult.message || 'Failed to update user')
      }
    } catch (error) {
      this.error('Failed to test user update', error)
    }
  }

  async testUserDeletion(testUser) {
    if (!testUser) {
      this.log('⚠️ Skipping deletion test - no test user available')
      return
    }

    this.log('Testing user deletion (soft delete) functionality...')

    try {
      this.log('Soft deleting test user...')
      const deleteResult = await api.deleteUsers(testUser.id)

      if (deleteResult.success) {
        this.log(`✓ Successfully soft deleted test user (ID: ${testUser.id})`)
        return true
      } else {
        throw new Error(deleteResult.message || 'Failed to delete user')
      }
    } catch (error) {
      this.error('Failed to test user deletion', error)
    }
  }

  async runAllTests() {
    this.log('Starting comprehensive user integration tests...')

    try {
      // Test 1: API Client functionality
      const users = await this.testApiClient()

      // Test 2: User creation
      const testUser = await this.testUserCreation(users)

      // Test 3: User search
      await this.testUserSearch(testUser)

      // Test 4: User filtering
      await this.testUserFiltering(testUser)

      // Test 5: User update
      const updatedUser = await this.testUserUpdate(testUser)

      // Test 6: User deletion (soft delete)
      await this.testUserDeletion(updatedUser)

      this.log('All tests completed!')
      this.generateReport()
    } catch (error) {
      this.error('Test suite failed', error)
      this.generateReport()
    }
  }

  generateReport() {
    const totalTests = this.testResults.length
    const errors = this.testResults.filter(r => r.type === 'error').length
    const warnings = this.testResults.filter(r => r.type === 'warn').length
    const successes = totalTests - errors - warnings

    console.log('\n' + '='.repeat(50))
    console.log('USER INTEGRATION TEST REPORT')
    console.log('='.repeat(50))
    console.log(`Total Tests: ${totalTests}`)
    console.log(`✓ Passed: ${successes}`)
    console.log(`⚠️ Warnings: ${warnings}`)
    console.log(`✗ Errors: ${errors}`)
    console.log(`Success Rate: ${((successes / totalTests) * 100).toFixed(1)}%`)

    if (errors > 0) {
      console.log('\nERRORS:')
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.message}`)
      })
    }

    console.log('='.repeat(50))
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new UserIntegrationTester()
  tester.runAllTests()
}

export { UserIntegrationTester }
