/**
 * Occasion Integration Test Script
 * Tests OpenAPI client functionality and occasion management features
 * Follows the same pattern as user integration tests
 */

import { ApiClient } from './public/js/shared/api-client.js'

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  testOccasions: [
    {
      name: 'Día de la Madre',
      slug: 'dia-de-la-madre',
      description: 'Celebración especial para madres',
      display_order: 1
    },
    {
      name: 'San Valentín',
      slug: 'san-valentin',
      description: 'Día del amor y la amistad',
      display_order: 2
    },
    {
      name: 'Cumpleaños',
      slug: 'cumpleanos',
      description: 'Celebración de cumpleaños',
      display_order: 3
    }
  ]
}

// Initialize API client with base URL
const api = new ApiClient(TEST_CONFIG.baseUrl)

class OccasionIntegrationTester {
  constructor() {
    this.testResults = []
    this.errors = []
    this.createdOccasions = []
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
    this.log('Testing OpenAPI client functionality for occasions...')

    try {
      // Test 1: Get all occasions
      this.log('Test 1: Getting all occasions...')
      const occasionsResult = await api.getAllOccasions()
      if (occasionsResult.success) {
        this.log(`✓ Successfully retrieved ${occasionsResult.data.length} occasions`)
        return occasionsResult.data
      } else {
        throw new Error(occasionsResult.message || 'Failed to get occasions')
      }
    } catch (error) {
      this.error('Failed to test API client', error)
      return []
    }
  }

  async testOccasionCreation(occasions) {
    this.log('Testing occasion creation...')

    try {
      // Check if test occasion already exists
      const existingOccasion = occasions.find(o => o.slug === TEST_CONFIG.testOccasions[0].slug)

      if (existingOccasion) {
        this.log(`✓ Test occasion already exists (ID: ${existingOccasion.id})`)
        this.createdOccasions.push(existingOccasion)
        return existingOccasion
      }

      // Create new test occasion
      this.log('Creating new test occasion...')
      const createResult = await api.createOccasions(TEST_CONFIG.testOccasions[0])

      if (createResult.success) {
        this.log(`✓ Successfully created test occasion (ID: ${createResult.data.id})`)
        this.createdOccasions.push(createResult.data)
        return createResult.data
      } else {
        throw new Error(createResult.message || 'Failed to create occasion')
      }
    } catch (error) {
      this.error('Failed to test occasion creation', error)
      return null
    }
  }

  async testOccasionCreationMultiple() {
    this.log('Testing multiple occasion creation...')

    try {
      for (let i = 1; i < TEST_CONFIG.testOccasions.length; i++) {
        const occasionData = TEST_CONFIG.testOccasions[i]

        this.log(`Creating occasion: ${occasionData.name}...`)
        const createResult = await api.createOccasions(occasionData)

        if (createResult.success) {
          this.log(
            `✓ Successfully created occasion "${occasionData.name}" (ID: ${createResult.data.id})`
          )
          this.createdOccasions.push(createResult.data)
        } else {
          throw new Error(createResult.message || `Failed to create occasion: ${occasionData.name}`)
        }
      }
    } catch (error) {
      this.error('Failed to test multiple occasion creation', error)
    }
  }

  async testOccasionRetrievalById(testOccasion) {
    if (!testOccasion) {
      this.log('⚠️ Skipping ID retrieval test - no test occasion available')
      return
    }

    this.log('Testing occasion retrieval by ID...')

    try {
      this.log(`Retrieving occasion by ID: ${testOccasion.id}...`)
      const getResult = await api.getOccasionsById(testOccasion.id)

      if (getResult.success) {
        this.log(`✓ Successfully retrieved occasion by ID (${getResult.data.id})`)

        // Validate response structure
        if (getResult.data.name === testOccasion.name) {
          this.log('✓ Response data matches expected values')
        } else {
          this.log('⚠️ Response data does not match expected values')
        }
      } else {
        throw new Error(getResult.message || 'Failed to get occasion by ID')
      }
    } catch (error) {
      this.error('Failed to test occasion retrieval by ID', error)
    }
  }

  async testOccasionRetrievalBySlug(testOccasion) {
    if (!testOccasion) {
      this.log('⚠️ Skipping slug retrieval test - no test occasion available')
      return
    }

    this.log('Testing occasion retrieval by slug...')

    try {
      this.log(`Retrieving occasion by slug: ${testOccasion.slug}...`)
      const getResult = await api.getAllSlug(testOccasion.slug)

      if (getResult.success) {
        this.log(`✓ Successfully retrieved occasion by slug (${getResult.data.slug})`)

        // Validate response structure
        if (getResult.data.id === testOccasion.id) {
          this.log('✓ Slug lookup returns correct occasion')
        } else {
          this.log('⚠️ Slug lookup returned different occasion')
        }
      } else {
        throw new Error(getResult.message || 'Failed to get occasion by slug')
      }
    } catch (error) {
      this.error('Failed to test occasion retrieval by slug', error)
    }
  }

  async testOccasionUpdate(testOccasion) {
    if (!testOccasion) {
      this.log('⚠️ Skipping update test - no test occasion available')
      return
    }

    this.log('Testing occasion update functionality...')

    try {
      const updateData = {
        description: 'Updated description for testing',
        display_order: 99
      }

      this.log('Updating test occasion...')
      const updateResult = await api.updateOccasions(testOccasion.id, updateData)

      if (updateResult.success) {
        this.log(`✓ Successfully updated test occasion (ID: ${testOccasion.id})`)

        // Verify the update
        const verifyResult = await api.getOccasionsById(testOccasion.id)
        if (verifyResult.success) {
          if (verifyResult.data.description === updateData.description) {
            this.log('✓ Update verified - description changed correctly')
          } else {
            this.log('⚠️ Update not reflected in database')
          }
        }

        return updateResult.data
      } else {
        throw new Error(updateResult.message || 'Failed to update occasion')
      }
    } catch (error) {
      this.error('Failed to test occasion update', error)
    }
  }

  async testDisplayOrderUpdate(testOccasion) {
    if (!testOccasion) {
      this.log('⚠️ Skipping display order test - no test occasion available')
      return
    }

    this.log('Testing display order update functionality...')

    try {
      const newOrder = { order: 50 }

      this.log('Updating display order...')
      const updateResult = await api.updateOccasionDisplayOrder(testOccasion.id, newOrder)

      if (updateResult.success) {
        this.log(`✓ Successfully updated display order for occasion (ID: ${testOccasion.id})`)

        // Verify the update
        const verifyResult = await api.getOccasionsById(testOccasion.id)
        if (verifyResult.success) {
          if (verifyResult.data.display_order === newOrder.order) {
            this.log('✓ Display order update verified')
          } else {
            this.log('⚠️ Display order update not reflected in database')
          }
        }
      } else {
        throw new Error(updateResult.message || 'Failed to update display order')
      }
    } catch (error) {
      this.error('Failed to test display order update', error)
    }
  }

  async testOccasionDeletion(testOccasion) {
    if (!testOccasion) {
      this.log('⚠️ Skipping deletion test - no test occasion available')
      return
    }

    this.log('Testing occasion deletion (soft delete) functionality...')

    try {
      this.log('Soft deleting test occasion...')
      const deleteResult = await api.deleteOccasions(testOccasion.id)

      if (deleteResult.success) {
        this.log(`✓ Successfully soft deleted test occasion (ID: ${testOccasion.id})`)

        // Verify it's no longer in active list
        const allOccasionsResult = await api.getAllOccasions()
        if (allOccasionsResult.success) {
          const stillExists = allOccasionsResult.data.find(o => o.id === testOccasion.id)
          if (!stillExists) {
            this.log('✓ Soft deleted occasion no longer appears in active list')
          } else {
            this.log('⚠️ Soft deleted occasion still appears in active list')
          }
        }

        return true
      } else {
        throw new Error(deleteResult.message || 'Failed to delete occasion')
      }
    } catch (error) {
      this.error('Failed to test occasion deletion', error)
    }
  }

  async testOccasionReactivation(testOccasion) {
    if (!testOccasion) {
      this.log('⚠️ Skipping reactivation test - no test occasion available')
      return
    }

    this.log('Testing occasion reactivation functionality...')

    try {
      this.log('Reactivating test occasion...')
      const reactivateResult = await api.reactivateOccasions(testOccasion.id, {})

      if (reactivateResult.success) {
        this.log(`✓ Successfully reactivated test occasion (ID: ${testOccasion.id})`)

        // Verify it's back in active list
        const allOccasionsResult = await api.getAllOccasions()
        if (allOccasionsResult.success) {
          const reactivated = allOccasionsResult.data.find(o => o.id === testOccasion.id)
          if (reactivated) {
            this.log('✓ Reactivated occasion appears in active list')
          } else {
            this.log('⚠️ Reactivated occasion does not appear in active list')
          }
        }

        return true
      } else {
        throw new Error(reactivateResult.message || 'Failed to reactivate occasion')
      }
    } catch (error) {
      this.error('Failed to test occasion reactivation', error)
    }
  }

  async testErrorHandling() {
    this.log('Testing error handling and validation...')

    try {
      // Test 1: Invalid ID
      this.log('Testing invalid ID handling...')
      try {
        await api.getOccasionsById(99999)
        this.log('⚠️ Expected error for invalid ID was not thrown')
      } catch (error) {
        this.log('✓ Invalid ID correctly returns error')
      }

      // Test 2: Invalid slug
      this.log('Testing invalid slug handling...')
      try {
        await api.getAllSlug('non-existent-slug-12345')
        this.log('⚠️ Expected error for invalid slug was not thrown')
      } catch (error) {
        this.log('✓ Invalid slug correctly returns error')
      }

      // Test 3: Missing required data for creation
      this.log('Testing missing required data handling...')
      try {
        await api.createOccasions({})
        this.log('⚠️ Expected error for missing data was not thrown')
      } catch (error) {
        this.log('✓ Missing required data correctly returns error')
      }

      // Test 4: Invalid slug format
      this.log('Testing invalid slug format handling...')
      try {
        await api.createOccasions({
          name: 'Test Occasion',
          slug: 'Invalid Slug With Spaces',
          display_order: 1
        })
        this.log('⚠️ Expected error for invalid slug format was not thrown')
      } catch (error) {
        this.log('✓ Invalid slug format correctly returns error')
      }
    } catch (error) {
      this.error('Failed to test error handling', error)
    }
  }

  async testResponseStructure() {
    this.log('Testing response structure consistency...')

    try {
      // Test GET all occasions response structure
      const allResult = await api.getAllOccasions()
      if (allResult.success) {
        if (allResult.success === true && allResult.data && Array.isArray(allResult.data)) {
          this.log('✓ GET all occasions response structure is correct')
        } else {
          this.log('⚠️ GET all occasions response structure is incorrect')
        }
      }

      // Test GET by ID response structure
      if (this.createdOccasions.length > 0) {
        const testOccasion = this.createdOccasions[0]
        const idResult = await api.getOccasionsById(testOccasion.id)
        if (idResult.success) {
          if (idResult.success === true && idResult.data && typeof idResult.data === 'object') {
            this.log('✓ GET by ID response structure is correct')
          } else {
            this.log('⚠️ GET by ID response structure is incorrect')
          }
        }
      }
    } catch (error) {
      this.error('Failed to test response structure', error)
    }
  }

  async testDatabaseIntegration() {
    this.log('Testing database integration and data persistence...')

    try {
      // Create a test occasion for database testing
      const testData = {
        name: 'Database Test Occasion',
        slug: 'database-test-occasion',
        description: 'Testing database operations',
        display_order: 999
      }

      this.log('Creating test occasion for database verification...')
      const createResult = await api.createOccasions(testData)

      if (createResult.success) {
        const testId = createResult.data.id
        this.log(`✓ Created test occasion (ID: ${testId})`)

        // Test 1: Verify data persistence
        const retrieveResult = await api.getOccasionsById(testId)
        if (retrieveResult.success) {
          const retrieved = retrieveResult.data

          if (
            retrieved.name === testData.name &&
            retrieved.slug === testData.slug &&
            retrieved.description === testData.description
          ) {
            this.log('✓ Data persistence verified - all fields match')
          } else {
            this.log('⚠️ Data persistence issue - fields do not match')
          }
        }

        // Test 2: Test soft delete persistence
        const deleteResult = await api.deleteOccasions(testId)
        if (deleteResult.success) {
          this.log('✓ Soft delete executed successfully')

          // Verify it's no longer in active list
          const allResult = await api.getAllOccasions()
          if (allResult.success) {
            const stillActive = allResult.data.find(o => o.id === testId)
            if (!stillActive) {
              this.log('✓ Soft delete persistence verified')
            } else {
              this.log('⚠️ Soft delete not persisted correctly')
            }
          }
        }

        // Test 3: Test reactivation persistence
        const reactivateResult = await api.reactivateOccasions(testId, {})
        if (reactivateResult.success) {
          this.log('✓ Reactivation executed successfully')

          // Verify it's back in active list
          const allResult = await api.getAllOccasions()
          if (allResult.success) {
            const reactivated = allResult.data.find(o => o.id === testId)
            if (reactivated) {
              this.log('✓ Reactivation persistence verified')
            } else {
              this.log('⚠️ Reactivation not persisted correctly')
            }
          }
        }

        // Cleanup: Delete the test occasion
        await api.deleteOccasions(testId)
        this.log('✓ Database integration test completed and cleaned up')
      }
    } catch (error) {
      this.error('Failed to test database integration', error)
    }
  }

  async runAllTests() {
    this.log('Starting comprehensive occasion integration tests...')

    try {
      // Test 1: API Client functionality
      const occasions = await this.testApiClient()

      // Test 2: Single occasion creation
      const testOccasion = await this.testOccasionCreation(occasions)

      // Test 3: Multiple occasion creation
      await this.testOccasionCreationMultiple()

      // Test 4: Occasion retrieval by ID
      await this.testOccasionRetrievalById(testOccasion)

      // Test 5: Occasion retrieval by slug
      await this.testOccasionRetrievalBySlug(testOccasion)

      // Test 6: Occasion update
      const updatedOccasion = await this.testOccasionUpdate(testOccasion)

      // Test 7: Display order update
      await this.testDisplayOrderUpdate(updatedOccasion)

      // Test 8: Error handling and validation
      await this.testErrorHandling()

      // Test 9: Response structure consistency
      await this.testResponseStructure()

      // Test 10: Database integration and persistence
      await this.testDatabaseIntegration()

      // Test 11: Occasion deletion (soft delete)
      await this.testOccasionDeletion(updatedOccasion)

      // Test 12: Occasion reactivation
      await this.testOccasionReactivation(updatedOccasion)

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

    console.log('\n' + '='.repeat(60))
    console.log('OCCASION INTEGRATION TEST REPORT')
    console.log('='.repeat(60))
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

    console.log('='.repeat(60))
  }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new OccasionIntegrationTester()
  tester.runAllTests()
}

export { OccasionIntegrationTester }
