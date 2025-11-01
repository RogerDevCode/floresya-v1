/**
 * Cache Headers Middleware
 * Simple, reliable HTTP caching without Service Workers
 */

/**
 * Cache strategies for different resource types
 */
const CACHE_STRATEGIES = {
  // No cache for dynamic API responses
  NO_CACHE: 'no-store, no-cache, must-revalidate, proxy-revalidate',

  // Short cache for frequently changing data (5 minutes)
  SHORT: 'public, max-age=300, stale-while-revalidate=60',

  // Medium cache for semi-static data (1 hour)
  MEDIUM: 'public, max-age=3600, stale-while-revalidate=300',

  // Long cache for static assets (1 year)
  LONG: 'public, max-age=31536000, immutable',

  // CDN cache with revalidation (1 day)
  CDN: 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600'
}

/**
 * Apply cache headers based on route patterns
 */
export function cacheMiddleware(req, res, next) {
  const url = req.url || req.originalUrl
  let cacheControl = CACHE_STRATEGIES.NO_CACHE

  // Static assets (CSS, JS, images) - Long cache with immutable
  if (url.match(/\.(css|js|jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot)$/)) {
    cacheControl = CACHE_STRATEGIES.LONG
  }
  // API routes - No cache (fresh data)
  else if (url.startsWith('/api/')) {
    cacheControl = CACHE_STRATEGIES.NO_CACHE
  }
  // HTML pages - CDN cache with revalidation
  else if (url.match(/\.html$/) || url === '/') {
    cacheControl = CACHE_STRATEGIES.CDN
  }
  // Health check - No cache
  else if (url.startsWith('/health')) {
    cacheControl = CACHE_STRATEGIES.NO_CACHE
  }

  // Set Cache-Control header
  res.setHeader('Cache-Control', cacheControl)

  // Add ETag support for validation
  res.setHeader('ETag', `W/"${Date.now()}"`)

  // Add Vary header for proper caching
  res.setHeader('Vary', 'Accept-Encoding, Accept')

  next()
}

/**
 * Disable caching for specific routes (admin, checkout, etc.)
 */
export function noCache(req, res, next) {
  res.setHeader('Cache-Control', CACHE_STRATEGIES.NO_CACHE)
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  next()
}

/**
 * Force cache for specific routes
 */
export function forceCache(strategy = 'MEDIUM') {
  return (req, res, next) => {
    res.setHeader('Cache-Control', CACHE_STRATEGIES[strategy] || CACHE_STRATEGIES.MEDIUM)
    next()
  }
}

/**
 * Conditional GET support (304 Not Modified)
 */
export function conditionalGet(req, res, next) {
  // Check If-None-Match (ETag)
  const etag = res.getHeader('ETag')
  const ifNoneMatch = req.headers['if-none-match']

  if (etag && ifNoneMatch === etag) {
    res.status(304).end()
    return
  }

  // Check If-Modified-Since (Last-Modified)
  const lastModified = res.getHeader('Last-Modified')
  const ifModifiedSince = req.headers['if-modified-since']

  if (lastModified && ifModifiedSince && new Date(lastModified) <= new Date(ifModifiedSince)) {
    res.status(304).end()
    return
  }

  next()
}

export default {
  cacheMiddleware,
  noCache,
  forceCache,
  conditionalGet,
  CACHE_STRATEGIES
}
