/**
 * Service Mocks Utilities
 * Mock configurations for service layer testing
 */

import { vi } from 'vitest'

export const setupProductServiceMock = () => {
  const mockRepository = {
    findAllWithFilters: vi.fn(),
    findByIdWithImages: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    decrementStock: vi.fn(),
    existsBySku: vi.fn(),
    getProductsBatchWithImageSize: vi.fn()
  }

  return mockRepository
}

export const mockProductService = {
  getAllProducts: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  decrementProductStock: vi.fn(),
  decrementStock: vi.fn(),
  existsBySku: vi.fn(),
  getProductsBatchWithImageSize: vi.fn()
}
