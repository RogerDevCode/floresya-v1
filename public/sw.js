// Service Worker para FloresYa
const CACHE_NAME = 'floresya-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/tailwind.css',
  '/js/lucide-icons.js',
  '/js/shared/api-client.js',
  '/js/shared/cart.js',
  '/index.js',
  '/images/logoFloresYa.jpeg',
  '/images/hero-flowers.webp',
  '/images/placeholder-flower.svg'
]

// Simple API client implementation for service worker (avoids importScripts issues)
class ServiceWorkerApiClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    }
  }

  async request(endpoint, options = {}) {
    try {
      const url = this.baseUrl + endpoint
      const config = {
        method: options.method || 'GET',
        headers: { ...this.defaultHeaders, ...options.headers }
      }

      if (options.body && options.method !== 'GET') {
        config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
      }

      const response = await self.fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }

      return await response.text()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }
}

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)))
})

self.addEventListener('fetch', event => {
  console.log(`🔄 [SW DEBUG] Fetch event for: ${event.request.url}`)
  console.log(`🔄 [SW DEBUG] Request method: ${event.request.method}`)
  console.log(`🔄 [SW DEBUG] Is API request: ${event.request.url.includes('/api/')}`)

  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache hit - return response
      if (response) {
        console.log(`✅ [SW DEBUG] Cache hit for: ${event.request.url}`)
        return response
      }

      console.log(`❌ [SW DEBUG] Cache miss for: ${event.request.url}`)

      // Use API client for API requests
      if (event.request.url.includes('/api/')) {
        console.log(`🔧 [SW DEBUG] Handling API request: ${event.request.url}`)
        return handleApiRequest(event.request)
      } else {
        console.log(`🌐 [SW DEBUG] Handling non-API request: ${event.request.url}`)
        // For non-API requests, use self.fetch (service worker context)
        return handleNonApiRequest(event.request)
      }
    })
  )
})

/**
 * Handle API requests using the API client
 * @param {Request} request - The request object
 * @returns {Promise<Response>} The response
 */
async function handleApiRequest(request) {
  try {
    console.log(`🔧 [SW DEBUG] handleApiRequest called for: ${request.url}`)

    // Extract URL and options from the request
    const url = new URL(request.url)
    const apiUrl = url.pathname + url.search

    console.log(`🔧 [SW DEBUG] Extracted API URL: ${apiUrl}`)
    console.log(`🔧 [SW DEBUG] URL origin: ${url.origin}`)

    // Create API client instance for service worker use
    const apiClient = new ServiceWorkerApiClient(url.origin)

    console.log(`🔧 [SW DEBUG] Created API client, making request...`)

    // Make the request using the API client
    const response = await apiClient.request(apiUrl, {
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: request.method !== 'GET' ? await request.text() : undefined
    })

    console.log(`✅ [SW DEBUG] API request successful, response:`, response)

    // Convert the response data back to a Response object
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('❌ [SW DEBUG] API request failed in service worker:', error)
    console.error('❌ [SW DEBUG] Error details:', {
      message: error.message,
      stack: error.stack,
      requestUrl: request.url
    })
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

/**
 * Handle non-API requests using self.fetch (service worker context)
 * @param {Request} request - The request object
 * @returns {Promise<Response>} The response
 */
async function handleNonApiRequest(request) {
  try {
    // Use self.fetch in service worker context (not a violation)
    return await self.fetch(request)
  } catch (error) {
    console.error('Fetch failed in service worker:', error)
    return new Response('Offline', { status: 503 })
  }
}
