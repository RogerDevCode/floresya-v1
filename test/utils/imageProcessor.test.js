import { describe, it, expect, vi } from 'vitest'
import { calculateBufferHash } from '../../api/utils/imageProcessor.js'

// Mock sharp module
vi.mock('sharp', () => {
  const mockSharp = vi.fn(() => ({
    metadata: vi.fn().mockResolvedValue({
      width: 1000,
      height: 1000,
      format: 'jpeg'
    }),
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue(Buffer.from('processed-image'))
  }))
  return { default: mockSharp }
})

describe('Image Processor Utils', () => {
  describe('calculateBufferHash', () => {
    it('should calculate SHA-256 hash of buffer', () => {
      const buffer = Buffer.from('test-image-data')
      const hash = calculateBufferHash(buffer)
      
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash).toHaveLength(64) // SHA-256 produces 64 hex characters
    })

    it('should produce consistent hash for same buffer', () => {
      const buffer = Buffer.from('test-image-data')
      const hash1 = calculateBufferHash(buffer)
      const hash2 = calculateBufferHash(buffer)
      
      expect(hash1).toBe(hash2)
    })

    it('should produce different hashes for different buffers', () => {
      const buffer1 = Buffer.from('test-image-1')
      const buffer2 = Buffer.from('test-image-2')
      
      const hash1 = calculateBufferHash(buffer1)
      const hash2 = calculateBufferHash(buffer2)
      
      expect(hash1).not.toBe(hash2)
    })

    it('should handle empty buffer', () => {
      const buffer = Buffer.from('')
      const hash = calculateBufferHash(buffer)
      
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash).toHaveLength(64)
    })

    it('should handle large buffers', () => {
      const largeBuffer = Buffer.alloc(1024 * 1024) // 1MB
      const hash = calculateBufferHash(largeBuffer)
      
      expect(hash).toBeDefined()
      expect(typeof hash).toBe('string')
      expect(hash).toHaveLength(64)
    })
  })
})
