import { productController } from './api/controllers/productController.js'
import { logger } from './api/utils/logger.js'
import { initializeDIContainer } from './api/architecture/di-container.js'

async function test() {
  try {
    console.log('Initializing DI...')
    await initializeDIContainer()

    console.log('Testing getAllProducts...')
    const req = {
      query: {
        limit: '16',
        page: '1',
        sortBy: 'created_desc'
      },
      user: { role: 'user' }
    }
    const res = {
      status: code => {
        console.log('Status:', code)
        return {
          json: data => console.log('Data received:', data?.data?.length || 0, 'items')
        }
      },
      json: data => console.log('Data received:', data?.data?.length || 0, 'items'),
      setHeader: (k, v) => console.log('Header:', k, v),
      headersSent: false
    }
    const next = err => {
      if (err) console.error('Next called with error:', err)
      else console.log('Next called without error')
    }

    await productController.getAllProducts(req, res, next)
    console.log('Done.')
  } catch (error) {
    console.error('Error:', error)
  }
}

test()
