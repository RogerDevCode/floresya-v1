import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adminAuth } from '../../../api/middleware/auth/adminAuth.js';

describe('Admin Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      session: {},
      path: '/admin/dashboard'
    };
    res = {
      redirect: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  describe('Role-Based Access Control', () => {
    it('should allow admin users to access admin routes', () => {
      req.session.user = {
        id: 1,
        email: 'admin@test.com',
        role: 'admin'
      };

      adminAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('should block customer users from accessing admin routes', () => {
      req.session.user = {
        id: 2,
        email: 'customer@test.com',
        role: 'customer'
      };

      adminAuth(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/');
      expect(next).not.toHaveBeenCalled();
    });

    it('should block unauthenticated users from accessing admin routes', () => {
      req.session.user = null;

      adminAuth(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(next).not.toHaveBeenCalled();
    });

    it('should block users without role field', () => {
      req.session.user = {
        id: 3,
        email: 'norole@test.com'
      };

      adminAuth(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/');
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle missing session gracefully', () => {
      req.session = null;

      adminAuth(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should reject role with case mismatch', () => {
      req.session.user = {
        id: 4,
        email: 'admin@test.com',
        role: 'ADMIN'
      };

      adminAuth(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/');
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject null role', () => {
      req.session.user = {
        id: 5,
        email: 'nullrole@test.com',
        role: null
      };

      adminAuth(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/');
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject empty string role', () => {
      req.session.user = {
        id: 6,
        email: 'emptyrole@test.com',
        role: ''
      };

      adminAuth(req, res, next);

      expect(res.redirect).toHaveBeenCalledWith('/');
      expect(next).not.toHaveBeenCalled();
    });
  });
});
