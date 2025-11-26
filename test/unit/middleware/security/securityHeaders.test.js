import { describe, it, expect, beforeEach, vi } from 'vitest'
import { addSecurityHeaders } from '../../../../api/middleware/security/securityHeaders.js'

describe('Security Headers Middleware', () => {
  let mockReq, mockRes, mockNext

  beforeEach(() => {
    mockReq = {}
    mockRes = {
      setHeader: vi.fn()
    }
    mockNext = vi.fn()
  })

  it('should add X-Frame-Options: DENY', () => {
    addSecurityHeaders(mockReq, mockRes, mockNext)

    expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY')
  })

  it('should add X-Content-Type-Options: nosniff', () => {
    addSecurityHeaders(mockReq, mockRes, mockNext)

    expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff')
  })

  it('should add X-XSS-Protection header', () => {
    addSecurityHeaders(mockReq, mockRes, mockNext)

    expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block')
  })

  it('should add Referrer-Policy header', () => {
    addSecurityHeaders(mockReq, mockRes, mockNext)

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Referrer-Policy',
      'strict-origin-when-cross-origin'
    )
  })

  it('should add Content-Security-Policy header', () => {
    addSecurityHeaders(mockReq, mockRes, mockNext)

    const cspCall = mockRes.setHeader.mock.calls.find(call => call[0] === 'Content-Security-Policy')

    expect(cspCall).toBeDefined()
    expect(cspCall[1]).toContain("default-src 'self'")
    expect(cspCall[1]).toContain("script-src 'self'")
    expect(cspCall[1]).toContain('https://*.supabase.co')
  })

  it('should call next() function', () => {
    addSecurityHeaders(mockReq, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalledOnce()
  })

  it('should not throw errors', () => {
    expect(() => {
      addSecurityHeaders(mockReq, mockRes, mockNext)
    }).not.toThrow()
  })
})
