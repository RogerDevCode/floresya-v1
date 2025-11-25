import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

// Mock all dependencies
vi.mock('../../api/controllers/productController.js', () => ({
  getAllProducts: vi.fn((req, res) => res.json({ success: true, data: [] })),
  getCarouselProducts: vi.fn((req, res) => res.json({ success: true, data: [] })),
  getProductsWithOccasions: vi.fn((req, res) => res.json({ success: true, data: [] })),
  getProductsByOccasion: vi.fn((req, res) => res.json({ success: true, data: [] })),
  getProductBySku: vi.fn((req, res) => res.json({ success: true, data: {} })),
  getProductById: vi.fn((req, res) => res.json({ success: true, data: {} })),
  createProduct: vi.fn((req, res) => res.status(201).json({ success: true })),
  createProductWithOccasions: vi.fn((req, res) => res.status(201).json({ success: true })),
  updateProduct: vi.fn((req, res) => res.json({ success: true })),
  updateCarouselOrder: vi.fn((req, res) => res.json({ success: true })),
  updateStock: vi.fn((req, res) => res.json({ success: true })),
  deleteProduct: vi.fn((req, res) => res.status(204).send()),
  reactivateProduct: vi.fn((req, res) => res.json({ success: true })),
  getProductOccasions: vi.fn((req, res) => res.json({ success: true, data: [] })),
  linkProductOccasion: vi.fn((req, res) => res.json({ success: true })),
  replaceProductOccasions: vi.fn((req, res) => res.json({ success: true }))
}))

vi.mock('../../api/controllers/productImageController.js', () => ({
  getPrimaryImage: vi.fn((req, res) => res.json({ success: true, data: {} })),
  getProductImages: vi.fn((req, res) => res.json({ success: true, data: [] })),
  createProductImages: vi.fn((req, res) => res.status(201).json({ success: true })),
  deleteImagesByIndex: vi.fn((req, res) => res.status(204).send()),
  setPrimaryImage: vi.fn((req, res) => res.json({ success: true }))
}))

vi.mock('../../api/middleware/auth/index.js', () => ({
  authenticate: vi.fn((req, res, next) => next()),
  authorize: vi.fn(() => (req, res, next) => next())
}))

vi.mock('../../api/middleware/validation/index.js', () => ({
  validate: vi.fn(() => (req, res, next) => next()),
  validateId: vi.fn(() => (req, res, next) => next()),
  validatePagination: vi.fn((req, res, next) => next()),
  productCreateSchema: {},
  productUpdateSchema: {}
}))

vi.mock('../../api/middleware/utilities/index.js', () => ({
  uploadSingle: vi.fn((req, res, next) => next())
}))

describe('Product Routes', () => {
  let app

  beforeEach(async () => {
    vi.clearAllMocks()
    const routes = await import('../../api/routes/productRoutes.js')
    app = express()
    app.use(express.json())
    app.use('/products', routes.default)
  })

  describe('Public Routes', () => {
    it('GET /products - should get all products', async () => {
      const res = await request(app).get('/products')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('GET /products/carousel - should get carousel products', async () => {
      const res = await request(app).get('/products/carousel')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('GET /products/with-occasions - should get products with occasions', async () => {
      const res = await request(app).get('/products/with-occasions')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('GET /products/occasion/:occasionId - should get products by occasion', async () => {
      const res = await request(app).get('/products/occasion/1')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('GET /products/sku/:sku - should get product by sku', async () => {
      const res = await request(app).get('/products/sku/TEST-SKU')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('GET /products/:id - should get product by id', async () => {
      const res = await request(app).get('/products/1')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('Product Images Routes', () => {
    it('GET /products/:id/images/primary - should get primary image', async () => {
      const res = await request(app).get('/products/1/images/primary')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('GET /products/:id/images - should get product images', async () => {
      const res = await request(app).get('/products/1/images')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('Admin Routes - Product Management', () => {
    it('POST /products - should create product', async () => {
      const res = await request(app).post('/products').send({ name: 'Test' })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
    })

    it('POST /products/with-occasions - should create product with occasions', async () => {
      const res = await request(app)
        .post('/products/with-occasions')
        .send({ product: {}, occasionIds: [1, 2] })
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
    })

    it('PUT /products/:id - should update product', async () => {
      const res = await request(app).put('/products/1').send({ name: 'Updated' })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('PATCH /products/:id/carousel-order - should update carousel order', async () => {
      const res = await request(app).patch('/products/1/carousel-order').send({ order: 1 })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('PATCH /products/:id/stock - should update stock', async () => {
      const res = await request(app).patch('/products/1/stock').send({ quantity: 10 })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('DELETE /products/:id - should delete product', async () => {
      const res = await request(app).delete('/products/1')
      expect(res.status).toBe(204)
    })

    it('PATCH /products/:id/reactivate - should reactivate product', async () => {
      const res = await request(app).patch('/products/1/reactivate')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('Admin Routes - Product Images', () => {
    it('POST /products/:id/images - should create product images', async () => {
      const res = await request(app).post('/products/1/images')
      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
    })

    it('DELETE /products/:id/images/:imageIndex - should delete image by index', async () => {
      const res = await request(app).delete('/products/1/images/0')
      expect(res.status).toBe(204)
    })

    it('PATCH /products/:id/images/primary/:imageIndex - should set primary image', async () => {
      const res = await request(app).patch('/products/1/images/primary/0')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })

  describe('Admin Routes - Product Occasions', () => {
    it('GET /products/:id/occasions - should get product occasions', async () => {
      const res = await request(app).get('/products/1/occasions')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('POST /products/:id/occasions/:occasionId - should link product occasion', async () => {
      const res = await request(app).post('/products/1/occasions/1')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('PUT /products/:id/occasions - should replace product occasions', async () => {
      const res = await request(app).put('/products/1/occasions').send({ occasion_ids: [1, 2] })
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
    })
  })
})
