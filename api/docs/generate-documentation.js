/**
 * Procesado por B
 */

#!/usr/bin/env node

/**
 * Documentation Generator for OpenAPI Annotations
 * Uses templates to generate consistent JSDoc comments
 */

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Template imports removed - documentation generated directly as strings

/**
 * Generates complete endpoint documentation using templates
 */
function generateEndpointDocumentation() {
  const documentation = `/**
 * OpenAPI JSDoc Annotations
 * Centralized documentation for all API endpoints
 * This file is scanned by swagger-jsdoc to generate OpenAPI spec
 *
 * Generated using template system for consistency and maintainability
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token authentication
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: true }
 *         data: { type: object, description: Response data }
 *         message: { type: string, example: "Operation completed successfully" }
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         error: { type: string, example: "Error message" }
 *         message: { type: string, example: "Operation failed" }
 *         details: { type: array, items: { type: string }, description: "Validation errors (if applicable)" }
 *     user:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         email: { type: string, format: email, example: "user@example.com" }
 *         full_name: { type: string, example: "John Doe" }
 *         phone: { type: string, example: "+1234567890" }
 *         role: { type: string, enum: [user, admin], example: "user" }
 *         email_verified: { type: boolean, example: false }
 *         active: { type: boolean, example: true }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     product:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         name: { type: string, example: "Red Roses Bouquet" }
 *         summary: { type: string, example: "Dozen red roses", nullable: true }
 *         description: { type: string, example: "Beautiful red roses", nullable: true }
 *         price_usd: { type: number, format: decimal, example: 29.99 }
 *         price_ves: { type: number, format: decimal, example: 1200, nullable: true }
 *         stock: { type: integer, example: 50 }
 *         sku: { type: string, example: "ROSE-RED-001", nullable: true }
 *         featured: { type: boolean, example: true }
 *         carousel_order: { type: integer, example: 1, nullable: true }
 *         active: { type: boolean, example: true }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     occasion:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         name: { type: string, example: "Birthday" }
 *         description: { type: string, example: "Flowers for birthdays" }
 *         slug: { type: string, example: "birthday" }
 *         display_order: { type: integer, example: 1 }
 *         active: { type: boolean, example: true }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     productimage:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         product_id: { type: integer, example: 67 }
 *         image_index: { type: integer, example: 1 }
 *         size: { type: string, enum: [thumb, small, medium, large], example: "small" }
 *         url: { type: string, format: uri, example: "https://abc123.supabase.co/storage/v1/object/public/product-images/67_1_small.webp" }
 *         file_hash: { type: string, example: "abc123def456..." }
 *         mime_type: { type: string, example: "image/webp" }
 *         is_primary: { type: boolean, example: false }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     order:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1001 }
 *         user_id: { type: integer, example: 5 }
 *         customer_email: { type: string, format: email, example: "maria@example.com" }
 *         customer_name: { type: string, example: "María González" }
 *         customer_phone: { type: string, example: "+58 412-1234567" }
 *         delivery_address: { type: string, example: "Av. Principal, Caracas" }
 *         delivery_date: { type: string, format: date, example: "2025-10-05" }
 *         delivery_time_slot: { type: string, example: "10:00-12:00" }
 *         delivery_notes: { type: string, example: "Llamar al llegar" }
 *         status: { type: string, enum: [pending, verified, preparing, shipped, delivered, cancelled], example: "pending" }
 *         total_amount_usd: { type: number, format: decimal, example: 89.99 }
 *         total_amount_ves: { type: number, format: decimal, example: 3599.6 }
 *         currency_rate: { type: number, format: decimal, example: 40 }
 *         notes: { type: string, example: "Ocasión especial" }
 *         admin_notes: { type: string, example: "Cliente frecuente" }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     OrderItem:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         order_id: { type: integer, example: 1001 }
 *         product_id: { type: integer, example: 67 }
 *         product_name: { type: string, example: "Ramo Tropical Vibrante" }
 *         product_summary: { type: string, example: "Flores tropicales vibrantes" }
 *         unit_price_usd: { type: number, format: decimal, example: 45.99 }
 *         unit_price_ves: { type: number, format: decimal, example: 1839.6 }
 *         quantity: { type: integer, example: 2 }
 *         subtotal_usd: { type: number, format: decimal, example: 91.98 }
 *         subtotal_ves: { type: number, format: decimal, example: 3679.2 }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     OrderStatusHistory:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         order_id: { type: integer, example: 1001 }
 *         old_status: { type: string, enum: [pending, verified, preparing, shipped, delivered, cancelled], example: "pending" }
 *         new_status: { type: string, enum: [pending, verified, preparing, shipped, delivered, cancelled], example: "verified" }
 *         notes: { type: string, example: "Pago verificado" }
 *         changed_by: { type: integer, example: 1 }
 *         created_at: { type: string, format: date-time }
 *     payment:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         order_id: { type: integer, example: 1 }
 *         user_id: { type: integer, example: 1 }
 *         amount_usd: { type: number, format: decimal, example: 59.99 }
 *         amount_ves: { type: number, format: decimal, example: 2400 }
 *         payment_method_name: { type: string, example: "Bank Transfer" }
 *         transaction_id: { type: string, example: "TXN123456" }
 *         reference_number: { type: string, example: "REF789" }
 *         status: { type: string, enum: [pending, completed, failed, refunded, partially_refunded], example: "pending" }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     settings:
 *       type: object
 *       properties:
 *         key: { type: string, example: "site_name" }
 *         value: { type: string, example: "FloresYa" }
 *         description: { type: string, example: "Site name for branding" }
 *         is_public: { type: boolean, example: true }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     PaginationParams:
 *       type: object
 *       properties:
 *         limit: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *         offset: { type: integer, minimum: 0, default: 0 }
 *         page: { type: integer, minimum: 1 }
 *     OrderStatusUpdate:
 *       type: object
 *       required: [status]
 *       properties:
 *         status: { type: string, enum: [pending, verified, preparing, shipped, delivered, cancelled], example: "verified" }
 *         notes: { type: string, example: "Payment confirmed" }
 *     PaymentConfirm:
 *       type: object
 *       required: [payment_method, reference_number]
 *       properties:
 *         payment_method: { type: string, enum: [cash, mobile_payment, bank_transfer, zelle, crypto], example: "bank_transfer" }
 *         reference_number: { type: string, minLength: 3, maxLength: 100, example: "TF-20231101-001" }
 *         payment_details: { type: object, example: { bank: "Banco Mercantil", payer: "José Pérez" } }
 *         receipt_image_url: { type: string, format: uri, example: "https://example.com/receipt.jpg" }
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication required
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorResponse' }
 *     ForbiddenError:
 *       description: Insufficient permissions
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorResponse' }
 *     NotFoundError:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorResponse' }
 *     ValidationError:
 *       description: Validation failed
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorResponse' }
 *     InternalServerError:
 *       description: Internal server error
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   parameters:
 *     IdParam:
 *       name: id
 *       in: path
 *       required: true
 *       schema: { type: integer, minimum: 1 }
 *       description: Resource ID
 *     LimitParam:
 *       name: limit
 *       in: query
 *       schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       description: Number of items to return
 *     OffsetParam:
 *       name: offset
 *       in: query
 *       schema: { type: integer, minimum: 0, default: 0 }
 *       description: Number of items to skip
 */

// ==================== PRODUCTS ====================

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products with filters
 *     description: Returns paginated list of active products with optional filters (uses indexed columns for performance)
 *     parameters:
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/OffsetParam'
 *       - name: featured
 *         in: query
 *         schema: { type: boolean }
 *         description: Filter by featured products (uses idx_products_featured)
 *       - name: sku
 *         in: query
 *         schema: { type: string }
 *         description: Filter by SKU (uses idx_products_sku)
 *       - name: search
 *         in: query
 *         schema: { type: string }
 *         description: Search in name and description (accent-insensitive, uses indexed normalized columns)
 *       - name: sortBy
 *         in: query
 *         schema: { type: string, enum: [name_asc, name_desc, price_asc, price_desc, created_at, carousel_order] }
 *         description: Sort field with direction
 *       - name: imageSize
 *         in: query
 *         schema: { type: string, enum: [thumb, small, medium, large] }
 *         description: Include product with specific image size
 *       - name: occasion
 *         in: query
 *         schema: { type: string }
 *         description: Filter by occasion slug (joins with product_occasions table)
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/product' } }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - name: imageSize
 *         in: query
 *         schema: { type: string, enum: [thumb, small, medium, large] }
 *         description: Include product with specific image size
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Create new product
 *     description: Admin only - Creates a new product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price_usd]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 255 }
 *               summary: { type: string }
 *               description: { type: string }
 *               price_usd: { type: number, minimum: 0 }
 *               price_ves: { type: number, minimum: 0 }
 *               stock: { type: integer, minimum: 0 }
 *               sku: { type: string, maxLength: 50 }
 *               featured: { type: boolean }
 *               carousel_order: { type: integer, minimum: 0 }
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

// ==================== ORDERS ====================

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get all orders with filters
 *     description: Admin only - Returns paginated list of orders with optional filters (uses indexed columns for performance)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/OffsetParam'
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, verified, preparing, shipped, delivered, cancelled]
 *         description: Filter by order status (uses idx_orders_status)
 *       - name: user_id
 *         in: query
 *         schema: { type: integer }
 *         description: Filter by user ID (uses idx_orders_user_id)
 *       - name: date_from
 *         in: query
 *         schema: { type: string, format: date-time }
 *         description: Filter orders from date (uses idx_orders_created_at)
 *       - name: date_to
 *         in: query
 *         schema: { type: string, format: date-time }
 *         description: Filter orders to date
 *       - name: search
 *         in: query
 *         schema: { type: string }
 *         description: Search in customer_name and customer_email (accent-insensitive, uses indexed normalized columns)
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/order' } }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

// ==================== USERS ====================

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users
 *     description: Admin only - Returns paginated list of all users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/OffsetParam'
 *       - name: role
 *         in: query
 *         schema:
 *           type: string
 *           enum: [user, admin]
 *         description: Filter by user role
 *       - name: email_verified
 *         in: query
 *         schema: { type: boolean }
 *         description: Filter by email verification status
 *       - name: search
 *         in: query
 *         schema: { type: string }
 *         description: Search in full_name and email (accent-insensitive, uses indexed normalized columns)
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/user' } }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

// ==================== PAYMENTS ====================

/**
 * @swagger
 * /api/payments:
 *   get:
 *     tags: [Payments]
 *     summary: Get all payments with filters
 *     description: Admin only - Returns paginated list of payments with optional filters (uses indexed columns)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/OffsetParam'
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, refunded, partially_refunded]
 *         description: Filter by payment status (uses idx_payments_status)
 *       - name: order_id
 *         in: query
 *         schema: { type: integer }
 *         description: Filter by order ID (uses idx_payments_order_id)
 *       - name: payment_method_id
 *         in: query
 *         schema: { type: integer }
 *         description: Filter by payment method (uses idx_payments_payment_method_id)
 *       - name: user_id
 *         in: query
 *         schema: { type: integer }
 *         description: Filter by user ID (uses idx_payments_user_id)
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/payment' } }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

// ==================== OCCASIONS ====================

/**
 * @swagger
 * /api/occasions:
 *   get:
 *     tags: [Occasions]
 *     summary: Get all occasions
 *     description: Public - Returns all active occasions
 *     responses:
 *       200:
 *         description: Occasions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/occasion' } }
 */

// ==================== SETTINGS ====================

/**
 * @swagger
 * /api/settings/public:
 *   get:
 *     tags: [Settings]
 *     summary: Get public settings
 *     description: Public - Returns public settings only
 *     responses:
 *       200:
 *         description: Public settings retrieved successfully
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     tags: [Settings]
 *     summary: Get all settings
 *     description: Admin only - Returns all settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/settings' } }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

`

  return documentation
}

/**
 * Main generation function
 */
function main() {
  console.log('🚀 Generating optimized OpenAPI documentation...')

  try {
    const documentation = generateEndpointDocumentation()

    // Write to openapi-annotations.js
    const outputPath = join(__dirname, 'openapi-annotations.js')
    writeFileSync(outputPath, documentation)

    console.log('✅ Documentation generated successfully!')
    console.log(`📝 Generated: ${outputPath}`)
    console.log('🔄 Run "npm run watch:openapi" to regenerate OpenAPI spec')
  } catch (error) {
    console.error('❌ Error generating documentation:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { generateEndpointDocumentation }
