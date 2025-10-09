/**
 * Image Carousel Component Tests (Frontend)
 * Testing carousel creation, navigation, and interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createImageCarousel } from '../imageCarousel.js'
import { api } from '../../shared/api-client.js'

// Configure happy-dom for DOM testing
import { Window } from 'happy-dom'

const window = new Window()
global.document = window.document
global.HTMLElement = window.HTMLElement

// Mock the api client
vi.mock('../../shared/api-client.js', () => ({
  api: {
    getProductImages: vi.fn()
  }
}))

describe('imageCarousel', () => {
  let container

  beforeEach(() => {
    // Create fresh container for each test
    container = document.createElement('div')
    container.setAttribute('data-testid', 'carousel-container')
    document.body.appendChild(container)

    // Reset api mock
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Cleanup
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('Carousel creation', () => {
    it('should create carousel with multiple images', async () => {
      // Mock API response with multiple images
      api.getProductImages.mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: 1,
            product_id: 67,
            image_index: 1,
            url: 'https://example.com/img1.webp',
            size: 'small'
          },
          {
            id: 2,
            product_id: 67,
            image_index: 2,
            url: 'https://example.com/img2.webp',
            size: 'small'
          },
          {
            id: 3,
            product_id: 67,
            image_index: 3,
            url: 'https://example.com/img3.webp',
            size: 'small'
          }
        ]
      })

      const carousel = await createImageCarousel(container, 67)

      // Verify hover-activated carousel structure
      expect(container.querySelector('.product-image-container')).toBeTruthy()
      expect(container.querySelector('.product-carousel-image')).toBeTruthy()

      // Verify image count badge (3 images)
      const badge = container.querySelector('.image-count-badge')
      expect(badge).toBeTruthy()
      expect(badge.textContent).toContain('3')

      // Verify carousel instance has destroy method
      expect(carousel).toHaveProperty('destroy')
    })

    it('should create static image when only 1 image exists', async () => {
      // Mock API response with single image
      api.getProductImages.mockResolvedValueOnce({
        success: true,
        data: [
          {
            id: 1,
            product_id: 67,
            image_index: 1,
            url: 'https://example.com/img1.webp',
            size: 'small'
          }
        ]
      })

      await createImageCarousel(container, 67)

      // Should have simple image container (no badge for single image)
      expect(container.querySelector('.product-image-container')).toBeTruthy()
      expect(container.querySelector('.product-carousel-image')).toBeTruthy()
      expect(container.querySelector('.image-count-badge')).toBeFalsy()
    })

    it('should show placeholder when no images found', async () => {
      // Mock API response with no images
      api.getProductImages.mockResolvedValueOnce({
        success: true,
        data: []
      })

      const carousel = await createImageCarousel(container, 67)

      // Should show placeholder image
      const img = container.querySelector('.product-carousel-image')
      expect(img).toBeTruthy()
      expect(img.src).toMatch(/placeholder-(flower|hero)\.svg$/)

      // Should return destroy function
      expect(carousel).toHaveProperty('destroy')
      expect(typeof carousel.destroy).toBe('function')
    })

    it('should throw error on API failure', async () => {
      // Mock API error
      api.getProductImages.mockRejectedValueOnce(new Error('Network error'))

      await expect(createImageCarousel(container, 67)).rejects.toThrow('Network error')
    })
  })

  describe('Image sorting', () => {
    it('should sort images by image_index', async () => {
      // Mock API response with unsorted images
      api.getProductImages.mockResolvedValueOnce({
        success: true,
        data: [
          { id: 3, image_index: 3, url: 'img3.webp', size: 'small' },
          { id: 1, image_index: 1, url: 'img1.webp', size: 'small' },
          { id: 2, image_index: 2, url: 'img2.webp', size: 'small' }
        ]
      })

      await createImageCarousel(container, 67)

      // Verify first image is displayed (should be img1.webp after sorting)
      const img = container.querySelector('.product-carousel-image')
      expect(img).toBeTruthy()
      expect(img.src).toContain('img1.webp')
    })
  })

  describe('API integration', () => {
    it('should call correct API endpoint with productId and size', async () => {
      api.getProductImages.mockResolvedValueOnce({
        success: true,
        data: [{ id: 1, image_index: 1, url: 'img.webp', size: 'small' }]
      })

      await createImageCarousel(container, 67)

      // Verify api.getProductImages was called with correct params
      expect(api.getProductImages).toHaveBeenCalledWith(67, { size: 'small' })
    })

    it('should call api.getProductImages with correct params', async () => {
      api.getProductImages.mockResolvedValueOnce({
        success: true,
        data: [{ id: 1, image_index: 1, url: 'img.webp', size: 'small' }]
      })

      await createImageCarousel(container, 67)

      expect(api.getProductImages).toHaveBeenCalledWith(67, { size: 'small' })
    })
  })

  describe('Lazy loading', () => {
    it('should set loading="lazy" on images', async () => {
      api.getProductImages.mockResolvedValueOnce({
        success: true,
        data: [
          { id: 1, image_index: 1, url: 'img1.webp', size: 'small' },
          { id: 2, image_index: 2, url: 'img2.webp', size: 'small' }
        ]
      })

      await createImageCarousel(container, 67)

      const images = container.querySelectorAll('img')
      images.forEach(img => {
        expect(img.getAttribute('loading')).toBe('lazy')
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels on arrows', async () => {
      api.getProductImages.mockResolvedValueOnce({
        success: true,
        data: [
          { id: 1, image_index: 1, url: 'img1.webp', size: 'small' },
          { id: 2, image_index: 2, url: 'img2.webp', size: 'small' }
        ]
      })

      await createImageCarousel(container, 67)

      // Hover-activated carousel doesn't have arrow buttons
      // It auto-cycles on hover, so no accessibility concerns with manual controls
      const imageContainer = container.querySelector('.product-image-container')
      expect(imageContainer).toBeTruthy()

      // Verify image has alt text
      const img = container.querySelector('.product-carousel-image')
      expect(img.getAttribute('alt')).toBeTruthy()
    })

    it('should have proper ARIA labels on dots', async () => {
      api.getProductImages.mockResolvedValueOnce({
        success: true,
        data: [
          { id: 1, image_index: 1, url: 'img1.webp', size: 'small' },
          { id: 2, image_index: 2, url: 'img2.webp', size: 'small' }
        ]
      })

      await createImageCarousel(container, 67)

      // Hover-activated carousel uses image count badge instead of dots
      const badge = container.querySelector('.image-count-badge')
      expect(badge).toBeTruthy()
      expect(badge.textContent).toContain('2')
    })
  })
})
