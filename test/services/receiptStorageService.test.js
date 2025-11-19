/**
 * Receipt Storage Service Tests
 * @module test/services/receiptStorageService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import receiptStorageService from '../../api/services/receiptStorageService.js'
import { supabase } from '../../api/services/supabaseClient.js'

// Mock Supabase
vi.mock('../../api/services/supabaseClient.js', () => ({
  supabase: {
    storage: {
      from: vi.fn(),
      listBuckets: vi.fn(),
      createBucket: vi.fn()
    }
  }
}))

describe('ReceiptStorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('uploadReceipt', () => {
    it('should upload receipt successfully', async () => {
      const mockBuffer = Buffer.from('test file content')
      const fileName = 'receipt.pdf'
      const mimeType = 'application/pdf'
      const userId = 1

      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: `${userId}/123456_receipt.pdf` },
        error: null
      })

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://supabase.co/storage/receipts/1/123456_receipt.pdf' }
      })

      supabase.storage.from.mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl
      })

      const result = await receiptStorageService.uploadReceipt(
        mockBuffer,
        fileName,
        mimeType,
        userId
      )

      expect(result).toBe('https://supabase.co/storage/receipts/1/123456_receipt.pdf')
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining(`${userId}/`),
        mockBuffer,
        {
          contentType: mimeType,
          cacheControl: '3600',
          upsert: false
        }
      )
    })

    it('should handle upload error', async () => {
      const mockBuffer = Buffer.from('test')
      
      const mockUpload = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Storage error' }
      })

      supabase.storage.from.mockReturnValue({
        upload: mockUpload
      })

      await expect(
        receiptStorageService.uploadReceipt(mockBuffer, 'test.pdf', 'application/pdf', 1)
      ).rejects.toThrow('Failed to upload receipt')
    })

    it('should sanitize filename', async () => {
      const mockBuffer = Buffer.from('test')
      const dirtyFileName = 'receipt@#$%^&.pdf'
      
      const mockUpload = vi.fn().mockResolvedValue({
        data: { path: '1/123_receipt______.pdf' },
        error: null
      })

      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: 'https://test.com/file.pdf' }
      })

      supabase.storage.from.mockReturnValue({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl
      })

      await receiptStorageService.uploadReceipt(mockBuffer, dirtyFileName, 'application/pdf', 1)

      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringMatching(/^1\/\d+_receipt______.pdf$/),
        expect.any(Buffer),
        expect.any(Object)
      )
    })
  })

  describe('deleteReceipt', () => {
    it('should delete receipt successfully', async () => {
      const receiptUrl = 'https://supabase.co/storage/receipts/1/123_receipt.pdf'
      
      const mockRemove = vi.fn().mockResolvedValue({
        data: {},
        error: null
      })

      supabase.storage.from.mockReturnValue({
        remove: mockRemove
      })

      const result = await receiptStorageService.deleteReceipt(receiptUrl)

      expect(result).toBe(true)
      expect(mockRemove).toHaveBeenCalledWith(['1/123_receipt.pdf'])
    })

    it('should handle invalid URL gracefully', async () => {
      const result = await receiptStorageService.deleteReceipt('invalid-url')
      expect(result).toBe(false)
    })

    it('should handle empty URL', async () => {
      const result = await receiptStorageService.deleteReceipt(null)
      expect(result).toBe(true)
    })

    it('should handle deletion error', async () => {
      const receiptUrl = 'https://supabase.co/storage/receipts/1/123_receipt.pdf'
      
      const mockRemove = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Delete error' }
      })

      supabase.storage.from.mockReturnValue({
        remove: mockRemove
      })

      const result = await receiptStorageService.deleteReceipt(receiptUrl)
      expect(result).toBe(false)
    })
  })

  describe('initializeBucket', () => {
    it('should create bucket if not exists', async () => {
      const mockListBuckets = vi.fn().mockResolvedValue({
        data: []
      })

      const mockCreateBucket = vi.fn().mockResolvedValue({
        data: {},
        error: null
      })

      supabase.storage.listBuckets = mockListBuckets
      supabase.storage.createBucket = mockCreateBucket

      await receiptStorageService.initializeBucket()

      expect(mockCreateBucket).toHaveBeenCalledWith('receipts', {
        public: true,
        fileSizeLimit: 5242880
      })
    })

    it('should not create bucket if exists', async () => {
      const mockListBuckets = vi.fn().mockResolvedValue({
        data: [{ name: 'receipts' }]
      })

      const mockCreateBucket = vi.fn()

      supabase.storage.listBuckets = mockListBuckets
      supabase.storage.createBucket = mockCreateBucket

      await receiptStorageService.initializeBucket()

      expect(mockCreateBucket).not.toHaveBeenCalled()
    })
  })
})
