/**
 * Security Headers Middleware
 * Implements essential security headers to prevent common attacks
 * KISS Principle: Simple, focused, effective security
 */

/**
 * Add security headers to prevent common web vulnerabilities
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function addSecurityHeaders(req, res, next) {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY')

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Enable XSS protection in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Force HTTPS ( uncomment in production with HTTPS )
  // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

  // Prevent referrer leakage
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Content Security Policy (basic protection)
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self' https://*.supabase.co"
  )

  next()
}