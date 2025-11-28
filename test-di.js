import { initializeDIContainer, DIContainer } from './api/architecture/di-container.js'
import { logger } from './api/utils/logger.js'

async function testDI() {
  try {
    console.log('Initializing DI Container...')
    await initializeDIContainer()

    console.log('Resolving ProductRepository...')
    const productRepo = await DIContainer.resolve('ProductRepository')

    console.log('ProductRepository resolved:', !!productRepo)
    console.log('Is object:', typeof productRepo === 'object')
    console.log('Has findAll method:', typeof productRepo.findAll === 'function')
    console.log(
      'Has findByIdWithImages method:',
      typeof productRepo.findByIdWithImages === 'function'
    )

    if (typeof productRepo.findAll === 'function') {
      console.log('SUCCESS: Repository has methods')
    } else {
      console.error('FAILURE: Repository missing methods')
      process.exit(1)
    }
  } catch (error) {
    console.error('Test failed:', error)
    process.exit(1)
  }
}

testDI()
