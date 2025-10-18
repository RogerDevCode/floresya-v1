/**
 * CRUD Operations Test Script
 * Tests Create, Read, Update, Delete operations for users
 */

import { api } from './public/js/shared/api-client.js'

class CRUDTester {
  constructor() {
    this.testResults = []
    this.errors = []
    this.testUserId = null
    this.createdUsers = []
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`)
    this.testResults.push({ timestamp, type, message })
  }

  error(message, error) {
    const errorMsg = `${message}: ${error.message || error}`
    console.error(`[${new Date().toISOString()}] ERROR: ${errorMsg}`)
    this.errors.push({ message: errorMsg, error })
    this.log(errorMsg, 'error')
  }

  async testCreateUser() {
    this.log('Testing CREATE user operation...')

    try {
      const testUserData = {
        email: `testuser_${Date.now()}@example.com`,
        full_name: 'Test User CRUD',
        phone: '+58 412 999 9999',
        role: 'user'
      }

      const result = await api.createUsers(testUserData)

      if (result.success && result.data) {
        this.testUserId = result.data.id
        this.createdUsers.push(result.data.id)
        this.log(`✓ User created successfully - ID: ${result.data.id}`)
        this.log(`✓ User email: ${result.data.email}`)
        this.log(`✓ User name: ${result.data.full_name}`)
        return result.data
      } else {
        throw new Error(result.message || 'Failed to create user')
      }
    } catch (error) {
      this.error('CREATE operation failed', error)
      return null
    }
  }

  async testReadUsers() {
    this.log('Testing READ users operation...')

    try {
      // Test 1: Get all users
      const allUsersResult = await api.getAllUsers()
      if (allUsersResult.success) {
        this.log(`✓ Retrieved ${allUsersResult.data.length} users`)
      } else {
        throw new Error(allUsersResult.message || 'Failed to get all users')
      }

      // Test 2: Get user by ID (if we have a test user)
      if (this.testUserId) {
        const userByIdResult = await api.getUsersById(this.testUserId)
        if (userByIdResult.success) {
          this.log(`✓ Retrieved user by ID: ${this.testUserId}`)
        } else {
          throw new Error(userByIdResult.message || 'Failed to get user by ID')
        }
      }

      // Test 3: Get user by email (if we have a test user)
      if (this.testUserId) {
        const userData = await this.getUserById(this.testUserId)
        if (userData && userData.email) {
          const userByEmailResult = await api.getAllEmail(userData.email)
          if (userByEmailResult.success) {
            this.log(`✓ Retrieved user by email: ${userData.email}`)
          } else {
            throw new Error(userByEmailResult.message || 'Failed to get user by email')
          }
        }
      }

      return true
    } catch (error) {
      this.error('READ operations failed', error)
      return false
    }
  }

  async getUserById(userId) {
    try {
      const result = await api.getUsersById(userId)
      return result.success ? result.data : null
    } catch {
      return null
    }
  }

  async testUpdateUser(userId) {
    this.log('Testing UPDATE user operation...')

    try {
      const updateData = {
        full_name: 'Updated Test User Name',
        phone: '+58 412 888 8888'
      }

      const result = await api.updateUsers(userId, updateData)

      if (result.success) {
        this.log(`✓ User updated successfully - ID: ${userId}`)
        this.log(`✓ Updated name: ${result.data.full_name}`)
        this.log(`✓ Updated phone: ${result.data.phone}`)
        return result.data
      } else {
        throw new Error(result.message || 'Failed to update user')
      }
    } catch (error) {
      this.error('UPDATE operation failed', error)
      return null
    }
  }

  async testUserRoleUpdate(userId) {
    this.log('Testing user role update...')

    try {
      // First get current user data
      const currentUser = await this.getUserById(userId)
      if (!currentUser) {
        throw new Error('Cannot get current user data')
      }

      // Toggle role between user and admin
      const newRole = currentUser.role === 'admin' ? 'user' : 'admin'
      const updateData = { role: newRole }

      const result = await api.updateUsers(userId, updateData)

      if (result.success) {
        this.log(`✓ User role updated to: ${result.data.role}`)
        return result.data
      } else {
        throw new Error(result.message || 'Failed to update user role')
      }
    } catch (error) {
      this.error('Role update operation failed', error)
      return null
    }
  }

  async testEmailVerification(userId) {
    this.log('Testing email verification update...')

    try {
      // First get current user data
      const currentUser = await this.getUserById(userId)
      if (!currentUser) {
        throw new Error('Cannot get current user data')
      }

      // Toggle email verification status
      const newVerificationStatus = !currentUser.email_verified

      let result
      if (newVerificationStatus) {
        // Verify email
        result = await api.verifyUserEmail(userId, {})
      } else {
        // Unverify email (using update)
        result = await api.updateUsers(userId, { email_verified: false })
      }

      if (result.success) {
        this.log(`✓ Email verification updated to: ${result.data.email_verified}`)
        return result.data
      } else {
        throw new Error(result.message || 'Failed to update email verification')
      }
    } catch (error) {
      this.error('Email verification update failed', error)
      return null
    }
  }

  async testSoftDeleteUser(userId) {
    this.log('Testing soft DELETE user operation...')

    try {
      const result = await api.deleteUsers(userId)

      if (result.success) {
        this.log(`✓ User soft deleted successfully - ID: ${userId}`)
        return result.data
      } else {
        throw new Error(result.message || 'Failed to soft delete user')
      }
    } catch (error) {
      this.error('Soft DELETE operation failed', error)
      return null
    }
  }

  async testReactivateUser(userId) {
    this.log('Testing user REACTIVATION operation...')

    try {
      const result = await api.reactivateUsers(userId, {})

      if (result.success) {
        this.log(`✓ User reactivated successfully - ID: ${userId}`)
        return result.data
      } else {
        throw new Error(result.message || 'Failed to reactivate user')
      }
    } catch (error) {
      this.error('REACTIVATE operation failed', error)
      return null
    }
  }

  async testSearchFunctionality() {
    this.log('Testing search functionality...')

    try {
      // Test search with existing user email
      const searchTerm = 'admin@floresya.com'
      const result = await api.getAllUsers({ search: searchTerm })

      if (result.success) {
        const foundUsers = result.data.filter(u => u.email.includes(searchTerm))
        this.log(`✓ Search found ${foundUsers.length} users for term: "${searchTerm}"`)
        return true
      } else {
        throw new Error(result.message || 'Search failed')
      }
    } catch (error) {
      this.error('Search functionality failed', error)
      return false
    }
  }

  async testFiltering() {
    this.log('Testing filtering functionality...')

    try {
      // Test role filter
      const roleResult = await api.getAllUsers({ role: 'admin' })
      if (roleResult.success) {
        const adminUsers = roleResult.data.filter(u => u.role === 'admin')
        this.log(`✓ Role filter found ${adminUsers.length} admin users`)
      } else {
        throw new Error(roleResult.message || 'Role filter failed')
      }

      // Test email verification filter
      const verifiedResult = await api.getAllUsers({ email_verified: true })
      if (verifiedResult.success) {
        const verifiedUsers = verifiedResult.data.filter(u => u.email_verified)
        this.log(`✓ Email verification filter found ${verifiedUsers.length} verified users`)
      } else {
        throw new Error(verifiedResult.message || 'Email verification filter failed')
      }

      // Test active status filter
      const activeResult = await api.getAllUsers({ is_active: true })
      if (activeResult.success) {
        const activeUsers = activeResult.data.filter(u => u.is_active)
        this.log(`✓ Active status filter found ${activeUsers.length} active users`)
      } else {
        throw new Error(activeResult.message || 'Active status filter failed')
      }

      return true
    } catch (error) {
      this.error('Filtering functionality failed', error)
      return false
    }
  }

  async cleanup() {
    this.log('Cleaning up test users...')

    for (const userId of this.createdUsers) {
      try {
        await api.deleteUsers(userId)
        this.log(`✓ Cleaned up test user ID: ${userId}`)
      } catch (error) {
        this.log(`⚠️ Failed to cleanup user ID: ${userId}`, 'warn')
      }
    }
  }

  async runAllTests() {
    this.log('Starting comprehensive CRUD operations tests...')

    try {
      // Test CREATE
      const createdUser = await this.testCreateUser()
      if (!createdUser) {
        throw new Error('User creation failed - cannot continue tests')
      }

      // Test READ operations
      await this.testReadUsers()

      // Test UPDATE operations
      await this.testUpdateUser(createdUser.id)
      await this.testUserRoleUpdate(createdUser.id)
      await this.testEmailVerification(createdUser.id)

      // Test soft DELETE
      await this.testSoftDeleteUser(createdUser.id)

      // Test REACTIVATE
      await this.testReactivateUser(createdUser.id)

      // Test search and filtering (independent of test user)
      await this.testSearchFunctionality()
      await this.testFiltering()

      // Cleanup
      await this.cleanup()

      this.log('All CRUD tests completed!')
      this.generateReport()
    } catch (error) {
      this.error('CRUD test suite failed', error)
      this.generateReport()
    }
  }

  generateReport() {
    const totalTests = this.testResults.length
    const errors = this.testResults.filter(r => r.type === 'error').length
    const warnings = this.testResults.filter(r => r.type === 'warn').length
    const successes = totalTests - errors - warnings

    console.log('\n' + '='.repeat(50))
    console.log('CRUD OPERATIONS TEST REPORT')
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

// Export for use
export { CRUDTester }

// Auto-run if this script is executed directly
if (typeof window === 'undefined') {
  const tester = new CRUDTester()
  tester.runAllTests()
}
