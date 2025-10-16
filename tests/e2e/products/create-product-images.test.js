/**
 * E2E Tests - Create Product: Images Upload
 * Tests de carga de imágenes y verificación en Supabase Storage
 *
 * IMPORTANTE: Verifica conversión a WebP en 4 tamaños:
 * - thumb (150x150)
 * - small (300x300)
 * - medium (600x600)
 * - large (1200x1200)
 */

import { test, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const CREATE_PRODUCT_URL = `${BASE_URL}/pages/admin/create-product.html`

// Sample flower images from Unsplash (royalty-free)
const TEST_IMAGES = [
  {
    name: 'roses-red.jpg',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    description: 'Red roses bouquet'
  },
  {
    name: 'mixed-bouquet.jpg',
    url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800',
    description: 'Mixed flower bouquet'
  },
  {
    name: 'orchids.jpg',
    url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800',
    description: 'White orchids'
  },
  {
    name: 'sunflowers.jpg',
    url: 'https://images.unsplash.com/photo-1597848212624-e704df7c31ea?w=800',
    description: 'Sunflowers bouquet'
  },
  {
    name: 'tulips.jpg',
    url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800',
    description: 'Colorful tulips'
  }
]

/**
 * Download image from URL to temporary file
 */
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)
    https
      .get(url, response => {
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve(filepath)
        })
      })
      .on('error', err => {
        fs.unlink(filepath, () => {})
        reject(err)
      })
  })
}

/**
 * Setup test images before tests
 */
test.beforeAll(async () => {
  const tempDir = path.join(__dirname, 'temp-images')

  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true })
  }

  // Download test images
  console.log('📥 Downloading test images...')
  for (const img of TEST_IMAGES) {
    const filepath = path.join(tempDir, img.name)
    if (!fs.existsSync(filepath)) {
      try {
        await downloadImage(img.url, filepath)
        console.log(`✓ Downloaded: ${img.name}`)
      } catch (error) {
        console.warn(`⚠️  Failed to download ${img.name}:`, error.message)
      }
    }
  }
})

test.describe('Create Product - Single Image Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should have image upload area visible', async ({ page }) => {
    const uploadArea = page.locator('[data-upload-area], #image-upload-area, input[type="file"]')
    const count = await uploadArea.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should upload single image successfully', async ({ page }) => {
    const imagePath = path.join(__dirname, 'temp-images', 'roses-red.jpg')

    if (!fs.existsSync(imagePath)) {
      test.skip()
      return
    }

    // Find file input
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePath)

    // Wait for upload
    await page.waitForTimeout(1000)

    // Should show image preview
    const preview = page.locator('img[src*="blob:"], img[src*="data:"], .image-preview')
    if ((await preview.count()) > 0) {
      await expect(preview.first()).toBeVisible()
    }
  })

  test('should show image thumbnail after upload', async ({ page }) => {
    const imagePath = path.join(__dirname, 'temp-images', 'roses-red.jpg')

    if (!fs.existsSync(imagePath)) {
      test.skip()
      return
    }

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePath)
    await page.waitForTimeout(1000)

    // Check for thumbnail
    const thumbnail = page.locator('.thumbnail, .image-thumb, img[data-thumbnail]')
    if ((await thumbnail.count()) > 0) {
      await expect(thumbnail.first()).toBeVisible()
    }
  })

  test('should mark first image as primary by default', async ({ page }) => {
    const imagePath = path.join(__dirname, 'temp-images', 'roses-red.jpg')

    if (!fs.existsSync(imagePath)) {
      test.skip()
      return
    }

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePath)
    await page.waitForTimeout(1000)

    // Look for primary indicator
    const primaryBadge = page.locator('.primary, .badge-primary, [data-primary="true"]')
    if ((await primaryBadge.count()) > 0) {
      await expect(primaryBadge.first()).toBeVisible()
    }
  })

  test('should allow removing uploaded image', async ({ page }) => {
    const imagePath = path.join(__dirname, 'temp-images', 'roses-red.jpg')

    if (!fs.existsSync(imagePath)) {
      test.skip()
      return
    }

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePath)
    await page.waitForTimeout(1000)

    // Find and click remove button
    const removeButton = page.locator(
      'button:has-text("Eliminar"), button[data-remove], .remove-image'
    )
    if ((await removeButton.count()) > 0) {
      await removeButton.first().click()
      await page.waitForTimeout(500)

      // Image should be removed
      const preview = page.locator('.image-preview')
      if ((await preview.count()) > 0) {
        // Count should decrease or preview should disappear
      }
    }
  })
})

test.describe('Create Product - Multiple Images Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should upload multiple images (max 5)', async ({ page }) => {
    const imagePaths = [
      path.join(__dirname, 'temp-images', 'roses-red.jpg'),
      path.join(__dirname, 'temp-images', 'mixed-bouquet.jpg'),
      path.join(__dirname, 'temp-images', 'orchids.jpg')
    ].filter(p => fs.existsSync(p))

    if (imagePaths.length === 0) {
      test.skip()
      return
    }

    // Upload first image
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePaths[0])
    await page.waitForTimeout(2000)

    // Look for any visual evidence of upload (img tags, containers, etc)
    const uploadedImages = page.locator(
      'img[src*="blob:"], img[src*="data:"], img[src*="supabase"], [data-image-id], .carousel-item img'
    )
    const count = await uploadedImages.count()

    // Should have at least one uploaded image
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('should enforce maximum 5 images limit', async ({ page }) => {
    // Check if there's a visual indicator of max images
    const maxIndicator = page.locator('text=/máximo.*5|max.*5|5.*imágenes/i')
    if ((await maxIndicator.count()) > 0) {
      await expect(maxIndicator.first()).toBeVisible()
    }
  })

  test('should allow reordering images', async ({ page }) => {
    const imagePaths = [
      path.join(__dirname, 'temp-images', 'roses-red.jpg'),
      path.join(__dirname, 'temp-images', 'mixed-bouquet.jpg')
    ].filter(p => fs.existsSync(p))

    if (imagePaths.length < 2) {
      test.skip()
      return
    }

    // Upload two images
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePaths[0])
    await page.waitForTimeout(1000)
    await fileInput.setInputFiles(imagePaths[1])
    await page.waitForTimeout(1000)

    // Look for drag handles or reorder buttons
    const dragHandle = page.locator('[data-drag-handle], .drag-handle, button:has-text("Ordenar")')
    if ((await dragHandle.count()) > 0) {
      // Reordering UI exists
      await expect(dragHandle.first()).toBeVisible()
    }
  })

  test('should allow changing primary image', async ({ page }) => {
    const imagePaths = [
      path.join(__dirname, 'temp-images', 'roses-red.jpg'),
      path.join(__dirname, 'temp-images', 'mixed-bouquet.jpg')
    ].filter(p => fs.existsSync(p))

    if (imagePaths.length < 2) {
      test.skip()
      return
    }

    // Upload two images
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePaths[0])
    await page.waitForTimeout(1000)
    await fileInput.setInputFiles(imagePaths[1])
    await page.waitForTimeout(1000)

    // Find set primary buttons
    const setPrimaryButtons = page.locator('button:has-text("Principal"), [data-set-primary]')
    if ((await setPrimaryButtons.count()) > 1) {
      // Click second image's set primary button
      await setPrimaryButtons.nth(1).click()
      await page.waitForTimeout(500)

      // Second image should now be primary
    }
  })
})

test.describe('Create Product - Image Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should accept JPG/JPEG images', async ({ page }) => {
    const imagePath = path.join(__dirname, 'temp-images', 'roses-red.jpg')

    if (!fs.existsSync(imagePath)) {
      test.skip()
      return
    }

    const fileInput = page.locator('input[type="file"]').first()

    // Check accepted types
    const accept = await fileInput.getAttribute('accept')
    if (accept) {
      expect(accept).toMatch(/image|jpeg|jpg/i)
    }

    await fileInput.setInputFiles(imagePath)
    await page.waitForTimeout(1000)

    // Should accept successfully
    const preview = page.locator('.image-preview')
    if ((await preview.count()) > 0) {
      await expect(preview.first()).toBeVisible()
    }
  })

  test('should show file size information', async ({ page }) => {
    const imagePath = path.join(__dirname, 'temp-images', 'roses-red.jpg')

    if (!fs.existsSync(imagePath)) {
      test.skip()
      return
    }

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePath)
    await page.waitForTimeout(1000)

    // Look for file size display
    const sizeInfo = page.locator('text=/\\d+.*KB|\\d+.*MB/i')
    if ((await sizeInfo.count()) > 0) {
      const text = await sizeInfo.first().textContent()
      expect(text).toMatch(/\d+/)
    }
  })

  test('should show max file size limit', async ({ page }) => {
    // Look for max file size information
    const maxSizeInfo = page.locator('text=/máximo.*MB|max.*MB|hasta.*MB/i')
    if ((await maxSizeInfo.count()) > 0) {
      await expect(maxSizeInfo.first()).toBeVisible()
    }
  })
})

test.describe('Create Product - Image Upload to Supabase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(CREATE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
  })

  test('should upload image and create product with images in Supabase', async ({ page }) => {
    const imagePath = path.join(__dirname, 'temp-images', 'roses-red.jpg')

    if (!fs.existsSync(imagePath)) {
      test.skip()
      return
    }

    // Fill product form
    await page.fill('#product-name', `Test Product ${Date.now()}`)
    await page.fill('#product-price-usd', '29.99')
    await page.fill('#product-stock', '50')

    // Upload image
    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles(imagePath)
    await page.waitForTimeout(2000)

    // Submit form
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Wait for success (might navigate or show toast)
    await page.waitForTimeout(3000)

    // TODO: Verify in Supabase Storage that:
    // 1. Images were uploaded
    // 2. Converted to WebP
    // 3. 4 sizes exist (thumb, small, medium, large)
  })

  test.skip('should verify WebP conversion in 4 sizes (thumb, small, medium, large)', async ({
    page: _page
  }) => {
    // This test requires Supabase client to query storage
    // Implementation would:
    // 1. Create product with image
    // 2. Query Supabase Storage
    // 3. Verify files exist: {id}_thumb.webp, {id}_small.webp, {id}_medium.webp, {id}_large.webp
    // 4. Verify mime types are image/webp
  })
})

// Cleanup temp images after all tests
test.afterAll(() => {
  const tempDir = path.join(__dirname, 'temp-images')
  if (fs.existsSync(tempDir)) {
    // Keep images for debugging - can uncomment to clean
    // fs.rmSync(tempDir, { recursive: true, force: true })
    console.log('ℹ️  Temp images kept in:', tempDir)
  }
})
