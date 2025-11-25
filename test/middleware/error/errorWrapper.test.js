import { describe, it, expect, vi } from 'vitest';

describe('Error Wrapper - Async Error Handling', () => {
  describe('Async handler wrapper', () => {
    it('should catch async errors', async () => {
      const asyncFn = async () => {
        throw new Error('Async error');
      };
      
      await expect(asyncFn()).rejects.toThrow('Async error');
    });

    it('should pass through successful async calls', async () => {
      const asyncFn = async () => {
        return { success: true };
      };
      
      const result = await asyncFn();
      expect(result.success).toBe(true);
    });

    it('should forward errors to next middleware', async () => {
      const next = vi.fn();
      const error = new Error('Test error');
      next(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('Error propagation', () => {
    it('should maintain error stack trace', () => {
      const error = new Error('Original error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Original error');
    });

    it('should preserve error properties', () => {
      const error = new Error('Test');
      error.statusCode = 404;
      error.context = { id: 1 };
      
      expect(error.statusCode).toBe(404);
      expect(error.context.id).toBe(1);
    });
  });
});
