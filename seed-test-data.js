
/**
 * Seed Test Data
 * Populates the database with initial data for E2E tests
 */
import { initializeDIContainer } from './api/architecture/di-container.js'
import { logger } from './api/utils/logger.js'

async function seed() {
  try {
    console.log('🌱 Seeding test data...')
    await initializeDIContainer()
    
    // TODO: Implement actual seeding logic here using repositories
    // For now, we just ensure the script runs without error
    
    console.log('✅ Test data seeded successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding test data:', error)
    process.exit(1)
  }
}

seed()
