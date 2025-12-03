#!/usr/bin/env node

/**
 * Improved Seed Test Data
 * Populates the database with initial data for E2E tests with enhanced error handling
 */

import { initializeDIContainer } from './api/architecture/di-container.js'
import { logger } from './api/config/logger.js'

// Enhanced error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception in seed script:', error)
  logger.error('Uncaught Exception in seed script', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection in seed script:', reason)
  logger.error('Unhandled Rejection in seed script', reason)
  process.exit(1)
})

async function waitForDatabaseConnection(maxRetries = 5, retryDelay = 5000) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(`🔗 Attempting database connection (${i}/${maxRetries})...`)
      
      // Initialize DI container to test connection
      const container = await initializeDIContainer()
      
      // Test connection by trying to get a repository
      const productRepository = container.get('productRepository')
      console.log('✅ Database connection established')
      return container
    } catch (error) {
      console.error(`❌ Database connection attempt ${i} failed:`, error.message)
      
      if (i === maxRetries) {
        throw new Error(`Failed to establish database connection after ${maxRetries} attempts: ${error.message}`)
      }
      
      console.log(`⏳ Waiting ${retryDelay/1000} seconds before retry...`)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
    }
  }
}

async function seedWithRetry(seedFunction, maxRetries = 3, entityType = 'data') {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(`🌱 Seeding ${entityType} (attempt ${i}/${maxRetries})...`)
      await seedFunction()
      console.log(`✅ Successfully seeded ${entityType}`)
      return true
    } catch (error) {
      console.error(`❌ Failed to seed ${entityType} (attempt ${i}):`, error.message)
      logger.error(`Failed to seed ${entityType} (attempt ${i})`, error)
      
      if (i === maxRetries) {
        console.error(`❌ Giving up on seeding ${entityType} after ${maxRetries} attempts`)
        return false
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
}

async function seedOccasions(occasionRepository) {
  return await seedWithRetry(async () => {
    const existingOccasions = await occasionRepository.findAll()
    
    if (existingOccasions.length === 0) {
      console.log('📅 Creating occasions...')
      
      const occasions = [
        { name: 'Birthday', description: 'Birthday celebrations' },
        { name: 'Anniversary', description: 'Anniversary celebrations' },
        { name: 'Wedding', description: 'Wedding ceremonies' },
        { name: 'Get Well', description: 'Get well soon wishes' },
        { name: 'Sympathy', description: 'Sympathy and condolences' }
      ]
      
      const createdOccasions = []
      for (const occasion of occasions) {
        try {
          const created = await occasionRepository.create(occasion)
          createdOccasions.push(created)
          console.log(`✅ Created occasion: ${occasion.name}`)
        } catch (error) {
          console.error(`❌ Failed to create occasion ${occasion.name}:`, error.message)
          throw error
        }
      }
      
      console.log(`✅ Created ${createdOccasions.length} occasions`)
      return createdOccasions
    } else {
      console.log(`✅ Found ${existingOccasions.length} existing occasions`)
      return existingOccasions
    }
  }, 3, 'occasions')
}

async function seedProducts(productRepository, occasions) {
  return await seedWithRetry(async () => {
    const existingProducts = await productRepository.findAll()
    
    if (existingProducts.length === 0) {
      console.log('🌹 Creating products...')
      
      const products = [
        {
          name: 'Classic Rose Bouquet',
          description: 'Beautiful red roses arrangement',
          price: 49.99,
          stock: 50,
          image_url: '/images/products/classic-roses.jpg',
          category: 'flowers'
        },
        {
          name: 'Spring Mix',
          description: 'Colorful spring flowers arrangement',
          price: 39.99,
          stock: 30,
          image_url: '/images/products/spring-mix.jpg',
          category: 'flowers'
        },
        {
          name: 'Elegant Lilies',
          description: 'White lilies with greenery',
          price: 59.99,
          stock: 25,
          image_url: '/images/products/elegant-lilies.jpg',
          category: 'flowers'
        }
      ]
      
      const createdProducts = []
      for (const product of products) {
        try {
          const created = await productRepository.create(product)
          createdProducts.push(created)
          console.log(`✅ Created product: ${product.name}`)
        } catch (error) {
          console.error(`❌ Failed to create product ${product.name}:`, error.message)
          throw error
        }
      }
      
      console.log(`✅ Created ${createdProducts.length} products`)
      return createdProducts
    } else {
      console.log(`✅ Found ${existingProducts.length} existing products`)
      return existingProducts
    }
  }, 3, 'products')
}

async function seedUsers(userRepository) {
  return await seedWithRetry(async () => {
    const existingUsers = await userRepository.findAll()
    
    if (existingUsers.length === 0) {
      console.log('👤 Creating test users...')
      
      const users = [
        {
          email: 'test@example.com',
          name: 'Test User',
          password: 'test123456',
          role: 'customer'
        },
        {
          email: 'admin@example.com',
          name: 'Admin User',
          password: 'admin123456',
          role: 'admin'
        }
      ]
      
      const createdUsers = []
      for (const user of users) {
        try {
          const created = await userRepository.create(user)
          createdUsers.push(created)
          console.log(`✅ Created user: ${user.email}`)
        } catch (error) {
          console.error(`❌ Failed to create user ${user.email}:`, error.message)
          throw error
        }
      }
      
      console.log(`✅ Created ${createdUsers.length} users`)
      return createdUsers
    } else {
      console.log(`✅ Found ${existingUsers.length} existing users`)
      return existingUsers
    }
  }, 3, 'users')
}

async function seed() {
  const startTime = Date.now()
  console.log('🌱 Starting improved seed process...')
  
  try {
    // Validate environment variables
    const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
    }
    
    console.log('✅ Environment variables validated')
    
    // Wait for database connection with retry logic
    const container = await waitForDatabaseConnection()
    
    // Get repositories
    const productRepository = container.get('productRepository')
    const occasionRepository = container.get('occasionRepository')
    const userRepository = container.get('userRepository')
    
    console.log('✅ Repositories initialized')
    
    // Seed data with error handling
    const occasionsSuccess = await seedOccasions(occasionRepository)
    const productsSuccess = await seedProducts(productRepository, occasionsSuccess || [])
    const usersSuccess = await seedUsers(userRepository)
    
    // Summary
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    console.log('\n📊 Seeding Summary')
    console.log('==================')
    console.log(`⏱️ Duration: ${duration}s`)
    console.log(`📅 Occasions: ${occasionsSuccess ? '✅ Success' : '❌ Failed'}`)
    console.log(`🌹 Products: ${productsSuccess ? '✅ Success' : '❌ Failed'}`)
    console.log(`👤 Users: ${usersSuccess ? '✅ Success' : '❌ Failed'}`)
    
    if (occasionsSuccess && productsSuccess && usersSuccess) {
      console.log('✅ All test data seeded successfully!')
      logger.info('Seed process completed successfully', { duration })
      process.exit(0)
    } else {
      console.log('❌ Some seeding operations failed')
      logger.error('Seed process partially failed', {
        occasions: occasionsSuccess,
        products: productsSuccess,
        users: usersSuccess,
        duration
      })
      process.exit(1)
    }
  } catch (error) {
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)
    
    console.error('❌ Critical error during seeding:', error.message)
    console.error('Stack trace:', error.stack)
    logger.error('Seed process failed critically', { 
      error: error.message, 
      stack: error.stack,
      duration 
    })
    process.exit(1)
  }
}

// Run the seed function
seed().catch(error => {
  console.error('❌ Unhandled error in seed script:', error)
  logger.error('Unhandled error in seed script', error)
  process.exit(1)
})