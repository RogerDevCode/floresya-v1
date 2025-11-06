/**
 * Order Controller - Granular Unit Tests
 * HTTP Handler Layer Testing
 *
 * Coverage Target: 85%
 * Speed Target: < 100ms per test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

const mockOrderService = {
  getAllOrders: vi.fn(),
  getOrderById: vi.fn(),
  createOrderWithItems: vi.fn(),
  updateOrderStatus: vi.fn()
}

const mockPaymentService = {
  confirmPayment: vi.fn()
}

vi.mock('../../../api/services/orderService.js', async () => {
  const actual = await vi.importActual('../../../api/services/orderService.js')
  return {
    ...actual,
    ...mockOrderService
  }
})

vi.mock('../../../api/services/paymentService.js', async () => {
  const actual = await vi.importActual('../../../api/services/paymentService.js')
  return {
    ...actual,
    ...mockPaymentService
  }
})

vi.mock('../../../api/middleware/error/index.js', () => ({
  errorHandler: vi.fn((err, req, res, next) => next(err)),
  notFoundHandler: vi.fn((req, res, next) => next()),
  asyncHandler: vi.fn(fn => (req, res, next) => fn(req, res, next)),
  withErrorMapping: vi.fn(fn => fn),
  createTableOperations: vi.fn(() => ({
    findById: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  }))
}))

const mockOrder = {
  id: 1,
  customer_name: 'Test Customer',
  customer_email: 'customer@example.com',
  customer_phone: '+58 412-1234567',
  delivery_address: 'Test Address',
  delivery_date: '2024-02-01',
  delivery_time_slot: '09:00-12:00',
  status: 'pending',
  total_amount_usd: 50.0,
  total_amount_ves: 1822.5,
  currency_rate: 36.45,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

const mockOrderItem = {
  id: 1,
  order_id: 1,
  product_id: 1,
  product_name: 'Test Product',
  unit_price_usd: 25.0,
  quantity: 2,
  subtotal_usd: 50.0
}

const mockRes = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis()
  }
  return res
}

const mockReq = (overrides = {}) => ({
  query: {},
  params: {},
  body: {},
  ...overrides
})

describe('OrderController - Granular Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllOrders()', () => {
    it('should return all orders with default filters', async () => {
      // Arrange
      mockOrderService.getAllOrders.mockResolvedValue([mockOrder])
      const { getAllOrders } = await import('../../../api/controllers/orderController.js')
      const req = mockReq()
      const res = mockRes()

      // Act
      await getAllOrders(req, res)

      // Assert
      expect(mockOrderService.getAllOrders).toHaveBeenCalledWith({}, false)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockOrder],
        message: 'Orders retrieved successfully'
      })
    })

    it('should filter by status', async () => {
      // Arrange
      mockOrderService.getAllOrders.mockResolvedValue([mockOrder])
      const { getAllOrders } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({ query: { status: 'pending' } })
      const res = mockRes()

      // Act
      await getAllOrders(req, res)

      // Assert
      expect(mockOrderService.getAllOrders).toHaveBeenCalledWith({ status: 'pending' }, false)
    })

    it('should filter by date range', async () => {
      // Arrange
      mockOrderService.getAllOrders.mockResolvedValue([mockOrder])
      const { getAllOrders } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({
        query: { dateFrom: '2024-01-01', dateTo: '2024-01-31' }
      })
      const res = mockRes()

      // Act
      await getAllOrders(req, res)

      // Assert
      expect(mockOrderService.getAllOrders).toHaveBeenCalledWith(
        { dateFrom: '2024-01-01', dateTo: '2024-01-31' },
        false
      )
    })

    it('should filter by minimum total', async () => {
      // Arrange
      mockOrderService.getAllOrders.mockResolvedValue([mockOrder])
      const { getAllOrders } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({ query: { minTotal: '25.00' } })
      const res = mockRes()

      // Act
      await getAllOrders(req, res)

      // Assert
      expect(mockOrderService.getAllOrders).toHaveBeenCalledWith({ minTotal: 25 }, false)
    })

    it('should apply search term', async () => {
      // Arrange
      mockOrderService.getAllOrders.mockResolvedValue([mockOrder])
      const { getAllOrders } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({ query: { search: 'customer' } })
      const res = mockRes()

      // Act
      await getAllOrders(req, res)

      // Assert
      expect(mockOrderService.getAllOrders).toHaveBeenCalledWith({ search: 'customer' }, false)
    })

    it('should include deactivated orders for admin', async () => {
      // Arrange
      mockOrderService.getAllOrders.mockResolvedValue([mockOrder])
      const { getAllOrders } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({ query: { includeDeactivated: 'true' } })
      const res = mockRes()

      // Act
      await getAllOrders(req, res)

      // Assert
      expect(mockOrderService.getAllOrders).toHaveBeenCalledWith({}, true)
    })

    it('should apply pagination', async () => {
      // Arrange
      mockOrderService.getAllOrders.mockResolvedValue([mockOrder])
      const { getAllOrders } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({ query: { limit: '10', offset: '5' } })
      const res = mockRes()

      // Act
      await getAllOrders(req, res)

      // Assert
      expect(mockOrderService.getAllOrders).toHaveBeenCalledWith({ limit: 10, offset: 5 }, false)
    })

    it('should return empty array when no orders found', async () => {
      // Arrange
      mockOrderService.getAllOrders.mockResolvedValue([])
      const { getAllOrders } = await import('../../../api/controllers/orderController.js')
      const req = mockReq()
      const res = mockRes()

      // Act
      await getAllOrders(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        message: 'Orders retrieved successfully'
      })
    })
  })

  describe('getOrderById()', () => {
    it('should return order by valid ID', async () => {
      // Arrange
      mockOrderService.getOrderById.mockResolvedValue({
        ...mockOrder,
        order_items: [mockOrderItem]
      })
      const { getOrderById } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({ params: { id: '1' } })
      const res = mockRes()

      // Act
      await getOrderById(req, res)

      // Assert
      expect(mockOrderService.getOrderById).toHaveBeenCalledWith(1, false)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          order_items: [mockOrderItem]
        }),
        message: 'Order retrieved successfully'
      })
    })

    it('should include deactivated order for admin', async () => {
      // Arrange
      mockOrderService.getOrderById.mockResolvedValue(mockOrder)
      const { getOrderById } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({ params: { id: '1' }, query: { includeDeactivated: 'true' } })
      const res = mockRes()

      // Act
      await getOrderById(req, res)

      // Assert
      expect(mockOrderService.getOrderById).toHaveBeenCalledWith(1, true)
    })

    it('should return 404 when order not found', async () => {
      // Arrange
      const error = new Error('Order with ID 999 not found')
      error.name = 'NotFoundError'
      mockOrderService.getOrderById.mockRejectedValue(error)
      const { getOrderById } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({ params: { id: '999' } })
      const res = mockRes()

      // Act
      await getOrderById(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Order with ID 999 not found'
      })
    })
  })

  describe('createOrder()', () => {
    const mockOrderData = {
      customer_name: 'New Customer',
      customer_email: 'newcustomer@example.com',
      customer_phone: '+58 414-1234567',
      delivery_address: 'New Address',
      delivery_date: '2024-02-01',
      delivery_time_slot: '09:00-12:00',
      items: [
        {
          product_id: 1,
          quantity: 2
        }
      ]
    }

    it('should create order with valid data', async () => {
      // Arrange
      mockOrderService.createOrderWithItems.mockResolvedValue({
        id: 2,
        ...mockOrderData
      })
      const { createOrder } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({ body: mockOrderData })
      const res = mockRes()

      // Act
      await createOrder(req, res)

      // Assert
      expect(mockOrderService.createOrderWithItems).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining(mockOrderData),
        message: 'Order created successfully'
      })
    })

    it('should return 400 when validation fails', async () => {
      // Arrange
      const error = new Error('Validation failed')
      error.name = 'ValidationError'
      mockOrderService.createOrderWithItems.mockRejectedValue(error)
      const { createOrder } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({ body: { customer_name: '' } })
      const res = mockRes()

      // Act
      await createOrder(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed'
      })
    })

    it('should return 400 when products are invalid', async () => {
      // Arrange
      const error = new Error('Invalid product in order')
      error.name = 'BadRequestError'
      mockOrderService.createOrderWithItems.mockRejectedValue(error)
      const { createOrder } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({ body: { ...mockOrderData, items: [] } })
      const res = mockRes()

      // Act
      await createOrder(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid product in order'
      })
    })
  })

  describe('updateOrderStatus()', () => {
    it('should update order status to processing', async () => {
      // Arrange
      mockOrderService.updateOrderStatus.mockResolvedValue({
        ...mockOrder,
        status: 'processing'
      })
      const { updateOrderStatus } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({
        params: { id: '1' },
        body: { status: 'processing' }
      })
      const res = mockRes()

      // Act
      await updateOrderStatus(req, res)

      // Assert
      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(1, 'processing', undefined)
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ status: 'processing' }),
        message: 'Order updated successfully'
      })
    })

    it('should update order status to shipped', async () => {
      // Arrange
      mockOrderService.updateOrderStatus.mockResolvedValue({
        ...mockOrder,
        status: 'shipped'
      })
      const { updateOrderStatus } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({
        params: { id: '1' },
        body: { status: 'shipped' }
      })
      const res = mockRes()

      // Act
      await updateOrderStatus(req, res)

      // Assert
      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(1, 'shipped', undefined)
    })

    it('should update order status to delivered', async () => {
      // Arrange
      mockOrderService.updateOrderStatus.mockResolvedValue({
        ...mockOrder,
        status: 'delivered'
      })
      const { updateOrderStatus } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({
        params: { id: '1' },
        body: { status: 'delivered' }
      })
      const res = mockRes()

      // Act
      await updateOrderStatus(req, res)

      // Assert
      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(1, 'delivered', undefined)
    })

    it('should cancel order with reason', async () => {
      // Arrange
      mockOrderService.updateOrderStatus.mockResolvedValue({
        ...mockOrder,
        status: 'cancelled'
      })
      const { updateOrderStatus } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({
        params: { id: '1' },
        body: { status: 'cancelled', reason: 'Customer request' }
      })
      const res = mockRes()

      // Act
      await updateOrderStatus(req, res)

      // Assert
      expect(mockOrderService.updateOrderStatus).toHaveBeenCalledWith(
        1,
        'cancelled',
        'Customer request'
      )
    })

    it('should return 400 for invalid status', async () => {
      // Arrange
      const error = new Error(
        'Invalid status: must be pending, processing, shipped, delivered, or cancelled'
      )
      error.name = 'ValidationError'
      mockOrderService.updateOrderStatus.mockRejectedValue(error)
      const { updateOrderStatus } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({
        params: { id: '1' },
        body: { status: 'invalid' }
      })
      const res = mockRes()

      // Act
      await updateOrderStatus(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid status: must be pending, processing, shipped, delivered, or cancelled'
      })
    })

    it('should return 404 when order not found', async () => {
      // Arrange
      const error = new Error('Order with ID 999 not found')
      error.name = 'NotFoundError'
      mockOrderService.updateOrderStatus.mockRejectedValue(error)
      const { updateOrderStatus } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({
        params: { id: '999' },
        body: { status: 'processing' }
      })
      const res = mockRes()

      // Act
      await updateOrderStatus(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Order with ID 999 not found'
      })
    })
  })

  describe('confirmPayment()', () => {
    it('should confirm payment for order', async () => {
      // Arrange
      mockPaymentService.confirmPayment.mockResolvedValue({
        id: 1,
        order_id: 1,
        status: 'confirmed'
      })
      mockOrderService.updateOrderStatus.mockResolvedValue({
        ...mockOrder,
        status: 'verified'
      })
      const { confirmPayment } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({
        params: { id: '1' },
        body: {
          payment_method: 'bank_transfer',
          reference_number: 'REF-123456'
        }
      })
      const res = mockRes()

      // Act
      await confirmPayment(req, res)

      // Assert
      expect(mockPaymentService.confirmPayment).toHaveBeenCalledWith(1, {
        payment_method: 'bank_transfer',
        reference_number: 'REF-123456'
      })
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: 'Payment confirmed and order updated successfully'
      })
    })

    it('should return 400 when payment_method is missing', async () => {
      // Arrange
      const error = new Error('Payment method is required')
      error.name = 'ValidationError'
      mockPaymentService.confirmPayment.mockRejectedValue(error)
      const { confirmPayment } = await import('../../../api/controllers/orderController.js')
      const req = mockReq({
        params: { id: '1' },
        body: { reference_number: 'REF-123456' }
      })
      const res = mockRes()

      // Act
      await confirmPayment(req, res)

      // Assert
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Payment method is required'
      })
    })
  })
})
