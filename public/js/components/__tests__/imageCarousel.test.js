/**
 * Image Carousel Component Tests (Frontend)
 * Testing carousel creation, navigation, and interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createImageCarousel } from '../imageCarousel.js'

// Configure happy-dom for DOM testing
import { Window } from 'happy-dom'

const window = new Window()
global.document = window.document
global.HTMLElement = window.HTMLElement
global.fetch = vi.fn()

describe('imageCarousel', () => {
  let container

  beforeEach(() => {
    // Create fresh container for each test
    container = document.createElement('div')
    container.setAttribute('data-testid', 'carousel-container')
    document.body.appendChild(container)

    // Reset fetch mock
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
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
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
      })

      const carousel = await createImageCarousel(container, 67)

      // Verify carousel HTML structure
      expect(container.querySelector('.carousel-container')).toBeTruthy()
      expect(container.querySelector('.carousel-track')).toBeTruthy()

      // Verify slides
      const slides = container.querySelectorAll('.carousel-slide')
      expect(slides.length).toBe(3)

      // Verify first slide is active
      expect(slides[0].classList.contains('active')).toBe(true)

      // Verify arrows exist (more than 1 image)
      expect(container.querySelector('.carousel-arrow-prev')).toBeTruthy()
      expect(container.querySelector('.carousel-arrow-next')).toBeTruthy()

      // Verify dots exist
      const dots = container.querySelectorAll('.carousel-dot')
      expect(dots.length).toBe(3)
      expect(dots[0].classList.contains('active')).toBe(true)

      // Verify carousel instance has control methods
      expect(carousel).toHaveProperty('next')
      expect(carousel).toHaveProperty('prev')
      expect(carousel).toHaveProperty('goTo')
      expect(carousel).toHaveProperty('destroy')
    })

    it('should create static image when only 1 image exists', async () => {
      // Mock API response with single image
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
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
      })

      await createImageCarousel(container, 67)

      // Should not have carousel controls
      expect(container.querySelector('.carousel-arrow')).toBeFalsy()
      expect(container.querySelector('.carousel-dot')).toBeFalsy()

      // Should have single image
      expect(container.querySelector('.carousel-image-wrapper')).toBeTruthy()
      expect(container.querySelector('.carousel-image')).toBeTruthy()
    })

    it('should show placeholder when no images found', async () => {
      // Mock API response with no images
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: []
        })
      })

      await createImageCarousel(container, 67)

      // Should show placeholder
      expect(container.querySelector('.carousel-placeholder')).toBeTruthy()
      expect(container.textContent).toContain('No images available')
    })

    it('should handle API errors gracefully', async () => {
      // Mock API error
      global.fetch.mockRejectedValueOnce(new Error('Network error'))

      await createImageCarousel(container, 67)

      // Should show placeholder on error
      expect(container.querySelector('.carousel-placeholder')).toBeTruthy()
    })
  })

  describe('Image sorting', () => {
    it('should sort images by image_index', async () => {
      // Mock API response with unsorted images
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { id: 3, image_index: 3, url: 'img3.webp', size: 'small' },
            { id: 1, image_index: 1, url: 'img1.webp', size: 'small' },
            { id: 2, image_index: 2, url: 'img2.webp', size: 'small' }
          ]
        })
      })

      await createImageCarousel(container, 67)

      const slides = container.querySelectorAll('.carousel-slide')
      const images = Array.from(slides).map(slide => slide.querySelector('img').src)

      // Verify images are sorted by index
      expect(images[0]).toContain('img1.webp')
      expect(images[1]).toContain('img2.webp')
      expect(images[2]).toContain('img3.webp')
    })
  })

  describe('API integration', () => {
    it('should call correct API endpoint with productId and size', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [{ id: 1, image_index: 1, url: 'img.webp', size: 'small' }]
        })
      })

      await createImageCarousel(container, 67)

      // Verify fetch was called with correct URL
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/products/67/images?size=small',
        expect.any(Object)
      )
    })

    it('should set correct Content-Type header', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: []
        })
      })

      await createImageCarousel(container, 67)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })
  })

  describe('Lazy loading', () => {
    it('should set loading="lazy" on images', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { id: 1, image_index: 1, url: 'img1.webp', size: 'small' },
            { id: 2, image_index: 2, url: 'img2.webp', size: 'small' }
          ]
        })
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
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { id: 1, image_index: 1, url: 'img1.webp', size: 'small' },
            { id: 2, image_index: 2, url: 'img2.webp', size: 'small' }
          ]
        })
      })

      await createImageCarousel(container, 67)

      const prevBtn = container.querySelector('.carousel-arrow-prev')
      const nextBtn = container.querySelector('.carousel-arrow-next')

      expect(prevBtn.getAttribute('aria-label')).toBe('Previous image')
      expect(nextBtn.getAttribute('aria-label')).toBe('Next image')
    })

    it('should have proper ARIA labels on dots', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { id: 1, image_index: 1, url: 'img1.webp', size: 'small' },
            { id: 2, image_index: 2, url: 'img2.webp', size: 'small' }
          ]
        })
      })

      await createImageCarousel(container, 67)

      const dots = container.querySelectorAll('.carousel-dot')
      expect(dots[0].getAttribute('aria-label')).toBe('Go to image 1')
      expect(dots[1].getAttribute('aria-label')).toBe('Go to image 2')
    })
  })
})
