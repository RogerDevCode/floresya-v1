/*
 * Simple development server for FloresYa
 * Serves static files from the public directory and proxies API requests
 */

import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import productsHandler from './src/api/products.js'
import ordersHandler from './src/api/orders.js'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Validate environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars)
  console.log('Please set these in your .env.local file')
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 3000

// JSON middleware (must be before routes)
app.use(express.json())

// Serve static assets FIRST (before catch-all)
app.use('/styles', express.static(path.join(__dirname, 'styles')))
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')))
app.use('/images', express.static(path.join(__dirname, 'public', 'images')))
app.use('/products', express.static(path.join(__dirname, 'public', 'products')))

// API routes - call handlers directly
app.get('/api/products', productsHandler)
app.post('/api/orders', ordersHandler)
app.get('/api/orders', ordersHandler)

// Dynamic routes for API endpoints that need path parameters
app.get('/api/products/:id', productsHandler)  // For individual product by ID
app.get('/api/occasions', (req, res) => {
  import('./src/api/occasions.js')
    .then(module => module.default(req, res))
    .catch(err => {
      console.error('Error importing occasions handler:', err)
      res.status(500).json({ success: false, error: 'Internal server error' })
    })
})
app.get('/api/occasions/:id', (req, res) => {
  import('./src/api/occasions.js')
    .then(module => module.default(req, res))
    .catch(err => {
      console.error('Error importing occasions handler:', err)
      res.status(500).json({ success: false, error: 'Internal server error' })
    })
})

// Serve static files from the public directory (HTML, etc.)
app.use(express.static(path.join(__dirname, 'public')))

// Handle root and any other routes by serving index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🌸 FloresYa Development Server running on http://localhost:${PORT}`)
  console.log('📁 Serving files from /public directory')
  console.log('🔗 API requests will be proxied to Vercel functions')
  console.log('')
  console.log('⚠️  Note: This server serves static files and proxies API requests')
  console.log('⚠️  For full Vercel dev functionality, ensure you have valid Supabase credentials')
  console.log('⚠️  in your .env.local file')
})
