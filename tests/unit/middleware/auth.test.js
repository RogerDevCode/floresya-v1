import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Use vi.hoisted to properly handle variable references for mocking
const { mockIsDev, mockGetUserRole } = vi.hoisted(() => {
  const mockIsDev = vi.fn(() => true)
  const mockGetUserRole = vi.fn(() => 'user')
  return { mockIsDev, mockGetUserRole }
})

// Mock all dependencies first with proper hoisting
vi.mock('../../../api/services/authService.index.js', () => ({
  getUser: vi.fn()
}))

vi.mock('../../../api/utils/logger.js', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

vi.mock('../../../api/config/constants.js', () => ({
  ROLE_PERMISSIONS: {
    admin: ['read', 'write', 'delete'],
    user: ['read']
  }
}))

vi.mock('../../../api/config/configLoader.js', () => ({
  default: {
    IS_DEVELOPMENT: true
  }
}))

vi.mock('../../../api/config/swagger.js', () => ({
  swaggerSpec: {},
  loadSwaggerSpec: vi.fn(() => ({}))
}))

// Mock auth helpers using the hoisted variables
vi.mock('../../../api/middleware/auth/auth.helpers.js', () => ({
  get IS_DEV() {
    return mockIsDev()
  },
  get DEV_MOCK_USER() {
    return {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'dev@floresya.local',
      user_metadata: {
        full_name: 'Developer User',
        phone: '+584141234567',
        role: 'admin'
      },
      email_confirmed_at: expect.any(String),
      created_at: expect.any(String)
    }
  },
  getUserRole: mockGetUserRole
}))

// Now import the functions we need to test
import {
  authenticate,
  authorize,
  authorizeByPermission,
  requireEmailVerified,
  optionalAuth,
  checkOwnership
} from '../../../api/middleware/auth/auth.middleware.js'

import { getUser } from '../../../api/services/authService.index.js'
import { UnauthorizedError, ForbiddenError } from '../../../api/errors/AppError.js'
import { log as logger } from '../../../api/utils/logger.js'

describe('Authentication Middleware', () => {
  let mockReq, mockRes, mockNext

  beforeEach(() => {
    mockReq = {
      headers: {},
      path: '/test',
      method: 'GET',
      ip: '127.0.0.1'
    }
    mockRes = {}
    mockNext = vi.fn()

    // Reset all mocks
    vi.clearAllMocks()

    // Reset auth helpers to default (dev mode)
    mockIsDev.mockReturnValue(true)
    mockGetUserRole.mockReturnValue('user')
    getUser.mockResolvedValue({ id: 'test-user', email: 'test@example.com' })

    // Set NODE_ENV to development for dev mode tests
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('authenticate', () => {
    describe('development mode', () => {
      beforeEach(() => {
        mockIsDev.mockReturnValue(true)
        process.env.NODE_ENV = 'development'
      })

      it('should auto-inject mock user and call next', async () => {
        await authenticate(mockReq, mockRes, mockNext)

        expect(mockReq.user).toEqual({
          id: '00000000-0000-0000-0000-000000000001',
          email: 'dev@floresya.local',
          user_metadata: {
            full_name: 'Developer User',
            phone: '+584141234567',
            role: 'admin'
          },
          email_confirmed_at: expect.any(String),
          created_at: expect.any(String)
        })
        expect(mockReq.token).toBe('dev-mock-token')
        expect(mockNext).toHaveBeenCalled()
        expect(logger.info).toHaveBeenCalledWith('🔓 DEV MODE: Auto-authenticated', {
          email: 'dev@floresya.local',
          role: 'admin'
        })
      })
    })

    describe('production mode', () => {
      beforeEach(() => {
        mockIsDev.mockReturnValue(false)
      })

      it('should throw UnauthorizedError when no auth header', async () => {
        await authenticate(mockReq, mockRes, mockNext)

        expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError))
        expect(logger.warn).toHaveBeenCalledWith('Authentication failed: No token provided', {
          path: mockReq.path,
          method: mockReq.method,
          ip: mockReq.ip
        })
      })

      it('should throw UnauthorizedError when invalid auth header', async () => {
        mockReq.headers.authorization = 'Invalid'

        await authenticate(mockReq, mockRes, mockNext)

        expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError))
      })

      it('should authenticate successfully with valid token', async () => {
        const mockUser = { id: 'user-id', email: 'user@example.com' }
        mockReq.headers.authorization = 'Bearer valid-token'
        getUser.mockResolvedValue(mockUser)

        await authenticate(mockReq, mockRes, mockNext)

        expect(getUser).toHaveBeenCalledWith('valid-token')
        expect(mockReq.user).toEqual(mockUser)
        expect(mockReq.token).toBe('valid-token')
        expect(mockNext).toHaveBeenCalled()
        expect(logger.info).toHaveBeenCalledWith('User authenticated successfully', {
          userId: mockUser.id,
          email: mockUser.email,
          role: 'user',
          path: mockReq.path
        })
      })

      it('should handle authentication failure', async () => {
        mockReq.headers.authorization = 'Bearer invalid-token'
        const error = new Error('Invalid token')
        getUser.mockRejectedValue(error)

        await authenticate(mockReq, mockRes, mockNext)

        expect(mockNext).toHaveBeenCalledWith(error)
        expect(logger.warn).toHaveBeenCalledWith('Authentication failed', {
          error: error.message,
          path: mockReq.path,
          method: mockReq.method,
          ip: mockReq.ip
        })
      })
    })
  })

  describe('authorize', () => {
    it('should throw UnauthorizedError when no user', () => {
      const middleware = authorize('admin')

      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError))
    })

    it('should call next when user has allowed role', () => {
      mockReq.user = { id: 'user-id', email: 'user@example.com' }
      mockGetUserRole.mockReturnValue('admin')
      const middleware = authorize('admin')

      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith('Authorization granted (role-based)', {
        userId: mockReq.user.id,
        role: 'admin',
        path: mockReq.path
      })
    })

    it('should throw ForbiddenError when user lacks required role', () => {
      mockReq.user = { id: 'user-id', email: 'user@example.com' }
      mockGetUserRole.mockReturnValue('user')
      const middleware = authorize('admin')

      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError))
      expect(logger.warn).toHaveBeenCalledWith('Access denied - insufficient role', {
        userId: mockReq.user.id,
        email: mockReq.user.email,
        role: 'user',
        requiredRoles: ['admin'],
        path: mockReq.path,
        method: mockReq.method
      })
    })

    it('should handle array of allowed roles', () => {
      mockReq.user = { id: 'user-id', email: 'user@example.com' }
      mockGetUserRole.mockReturnValue('moderator')
      const middleware = authorize(['admin', 'moderator'])

      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('authorizeByPermission', () => {
    it('should throw UnauthorizedError when no user', () => {
      const middleware = authorizeByPermission('write')

      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError))
    })

    it('should call next when user has required permission', () => {
      mockReq.user = { id: 'user-id', email: 'user@example.com' }
      mockGetUserRole.mockReturnValue('admin')
      const middleware = authorizeByPermission('write')

      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })

    it('should throw ForbiddenError when user lacks permission', () => {
      mockReq.user = { id: 'user-id', email: 'user@example.com' }
      mockGetUserRole.mockReturnValue('user')
      const middleware = authorizeByPermission('write')

      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError))
    })

    it('should handle array of required permissions', () => {
      mockReq.user = { id: 'user-id', email: 'user@example.com' }
      mockGetUserRole.mockReturnValue('admin')
      const middleware = authorizeByPermission(['read', 'write'])

      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })
  })

  describe('requireEmailVerified', () => {
    describe('development mode', () => {
      beforeEach(() => {
        mockIsDev.mockReturnValue(true)
      })

      it('should call next without checking email', () => {
        requireEmailVerified(mockReq, mockRes, mockNext)

        expect(mockNext).toHaveBeenCalled()
      })
    })

    describe('production mode', () => {
      beforeEach(() => {
        mockIsDev.mockReturnValue(false)
        process.env.NODE_ENV = 'test'
      })

      it('should throw UnauthorizedError when no user', () => {
        requireEmailVerified(mockReq, mockRes, mockNext)

        expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError))
      })

      it('should throw ForbiddenError when email not verified', () => {
        mockReq.user = { id: 'user-id', email: 'user@example.com' }

        requireEmailVerified(mockReq, mockRes, mockNext)

        expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError))
      })

      it('should call next when email is verified', () => {
        mockReq.user = {
          id: 'user-id',
          email: 'user@example.com',
          email_confirmed_at: '2023-01-01T00:00:00Z'
        }

        requireEmailVerified(mockReq, mockRes, mockNext)

        expect(mockNext).toHaveBeenCalled()
      })
    })
  })

  describe('optionalAuth', () => {
    describe('development mode', () => {
      beforeEach(() => {
        mockIsDev.mockReturnValue(true)
      })

      it('should inject mock user and call next', () => {
        optionalAuth(mockReq, mockRes, mockNext)

        expect(mockReq.user).toEqual({
          id: '00000000-0000-0000-0000-000000000001',
          email: 'dev@floresya.local',
          user_metadata: {
            full_name: 'Developer User',
            phone: '+584141234567',
            role: 'admin'
          },
          email_confirmed_at: expect.any(String),
          created_at: expect.any(String)
        })
        expect(mockReq.token).toBe('dev-mock-token')
        expect(mockNext).toHaveBeenCalled()
      })
    })

    describe('production mode', () => {
      beforeEach(() => {
        mockIsDev.mockReturnValue(false)
      })

      it('should call next when no auth header', async () => {
        await new Promise(resolve => {
          mockNext.mockImplementation(resolve)
          optionalAuth(mockReq, mockRes, mockNext)
        })

        expect(mockNext).toHaveBeenCalled()
        expect(mockReq.user).toBeUndefined()
      })

      it('should authenticate when valid token provided', async () => {
        const mockUser = { id: 'user-id', email: 'user@example.com' }
        mockReq.headers.authorization = 'Bearer valid-token'
        getUser.mockResolvedValue(mockUser)

        await new Promise(resolve => {
          mockNext.mockImplementation(resolve)
          optionalAuth(mockReq, mockRes, mockNext)
        })

        expect(mockReq.user).toEqual(mockUser)
        expect(mockReq.token).toBe('valid-token')
        expect(mockNext).toHaveBeenCalled()
      })

      it('should silently fail when token is invalid', async () => {
        mockReq.headers.authorization = 'Bearer invalid-token'
        getUser.mockRejectedValue(new Error('Invalid token'))

        await new Promise(resolve => {
          mockNext.mockImplementation(resolve)
          optionalAuth(mockReq, mockRes, mockNext)
        })

        expect(mockReq.user).toBeUndefined()
        expect(mockNext).toHaveBeenCalled()
        expect(logger.debug).toHaveBeenCalledWith('Optional auth failed')
      })
    })
  })

  describe('checkOwnership', () => {
    const getOwnerId = req => req.params.id

    it('should throw UnauthorizedError when no user', () => {
      const middleware = checkOwnership(getOwnerId)

      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(UnauthorizedError))
    })

    it('should call next for admin user', () => {
      mockReq.user = { id: 'admin-id', user_metadata: { role: 'admin' } }
      mockReq.params = { id: 'different-id' }
      const middleware = checkOwnership(getOwnerId)

      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
      expect(logger.info).toHaveBeenCalledWith('Ownership check bypassed (admin)', {
        userId: mockReq.user.id,
        path: mockReq.path
      })
    })

    it('should call next when user owns resource', () => {
      mockReq.user = { id: 'user-id' }
      mockReq.params = { id: 'user-id' }
      const middleware = checkOwnership(getOwnerId)

      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalled()
    })

    it('should throw ForbiddenError when user does not own resource', () => {
      mockReq.user = { id: 'user-id' }
      mockReq.params = { id: 'different-id' }
      const middleware = checkOwnership(getOwnerId)

      middleware(mockReq, mockRes, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(ForbiddenError))
      expect(logger.warn).toHaveBeenCalledWith('Ownership check failed', {
        userId: mockReq.user.id,
        resourceOwnerId: 'different-id',
        path: mockReq.path
      })
    })
  })
})
