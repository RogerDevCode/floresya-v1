/**
 * Procesado por B
 */

/**
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
 *       description: RFC 7807 compliant error response with FloresYa extensions
 *       required:
 *         - success
 *         - error
 *         - code
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *           description: Always false for error responses
 *         error:
 *           type: string
 *           example: "ValidationError"
 *           description: Human-readable error class name
 *         code:
 *           type: integer
 *           example: 1001
 *           description: Numeric error code from ERROR_CODES
 *         category:
 *           type: string
 *           enum: [validation, authentication, not_found, business, server]
 *           example: validation
 *           description: Error category for grouping
 *         message:
 *           type: string
 *           example: "Validation failed. Please check your input."
 *           description: User-friendly error message (FloresYa extension)
 *         type:
 *           type: string
 *           format: uri
 *           example: "https://api.floresya.com/errors/validation/validationfailed"
 *           description: RFC 7807 - URI reference identifying the problem type
 *         title:
 *           type: string
 *           example: "Validation Failed"
 *           description: RFC 7807 - Short, human-readable summary
 *         status:
 *           type: integer
 *           example: 400
 *           description: RFC 7807 - HTTP status code
 *         detail:
 *           type: string
 *           example: "Request validation failed"
 *           description: RFC 7807 - Detailed explanation of the error (same as message)
 *         instance:
 *           type: string
 *           example: "/errors/req_123456789"
 *           description: RFC 7807 - URI reference identifying this specific occurrence
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2025-10-31T15:10:00.000Z"
 *           description: ISO 8601 timestamp when error occurred
 *         path:
 *           type: string
 *           example: "/api/products"
 *           description: Request path that caused the error
 *         requestId:
 *           type: string
 *           example: "req_123456789"
 *           description: Unique request identifier for tracking
 *         details:
 *           type: object
 *           description: Additional context about the error (for operational errors)
 *           example:
 *             field: "email"
 *             value: "invalid-email"
 *         errors:
 *           type: object
 *           description: Field-specific validation errors (for validation errors only)
 *           example:
 *             email: ["Must be a valid email address"]
 *             password: ["Must be at least 8 characters"]
 *     ErrorCode:
 *       type: object
 *       description: Individual error code with metadata
 *       properties:
 *         code:
 *           type: integer
 *           example: 1001
 *           description: Numeric error code
 *         name:
 *           type: string
 *           example: "VALIDATION_FAILED"
 *           description: Error code name constant
 *         category:
 *           type: string
 *           enum: [validation, authentication, not_found, business, server]
 *           example: validation
 *           description: Error category
 *         httpStatus:
 *           type: integer
 *           example: 400
 *           description: HTTP status code mapping
 *         description:
 *           type: string
 *           example: "Request validation failed"
 *           description: Error code description
 *     ErrorCodeList:
 *       type: array
 *       description: Complete list of error codes
 *       items:
 *         $ref: '#/components/schemas/ErrorCode'
 *       example:
 *         - code: 1001
 *           name: "VALIDATION_FAILED"
 *           category: "validation"
 *           httpStatus: 400
 *           description: "Request validation failed"
 *         - code: 2001
 *           name: "UNAUTHORIZED"
 *           category: "authentication"
 *           httpStatus: 401
 *           description: "Authentication required"
 *         - code: 3001
 *           name: "RESOURCE_NOT_FOUND"
 *           category: "not_found"
 *           httpStatus: 404
 *           description: "Requested resource not found"
 *     ValidationErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             code:
 *               example: 1001
 *             category:
 *               example: validation
 *             status:
 *               example: 400
 *             errors:
 *               type: object
 *               description: Field-specific validation errors
 *               example:
 *                 email: ["Must be a valid email address"]
 *                 password: ["Must be at least 8 characters"]
 *                 name: ["Must be at least 2 characters"]
 *           example:
 *             success: false
 *             error: "ValidationError"
 *             code: 1001
 *             category: "validation"
 *             type: "https://api.floresya.com/errors/validation/validationfailed"
 *             title: "Validation Failed"
 *             status: 400
 *             detail: "Request validation failed"
 *             message: "Validation failed. Please check your input."
 *             timestamp: "2025-10-31T15:10:00.000Z"
 *             path: "/api/products"
 *             errors:
 *               email: ["Must be a valid email address"]
 *               password: ["Must be at least 8 characters"]
 *     NotFoundErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             code:
 *               example: 3001
 *             category:
 *               example: not_found
 *             status:
 *               example: 404
 *             details:
 *               type: object
 *               properties:
 *                 resource:
 *                   type: string
 *                   example: "Product"
 *                 id:
 *                   type: integer
 *                   example: 123
 *           example:
 *             success: false
 *             error: "NotFoundError"
 *             code: 3001
 *             category: "not_found"
 *             type: "https://api.floresya.com/errors/not_found/notfound"
 *             title: "Resource Not Found"
 *             status: 404
 *             detail: "Product with ID 123 not found"
 *             message: "The requested product was not found."
 *             timestamp: "2025-10-31T15:10:00.000Z"
 *             path: "/api/products/123"
 *             details:
 *               resource: "Product"
 *               id: 123
 *     AuthErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             code:
 *               example: 2001
 *             category:
 *               example: authentication
 *             status:
 *               example: 401
 *           example:
 *             success: false
 *             error: "UnauthorizedError"
 *             code: 2001
 *             category: "authentication"
 *             type: "https://api.floresya.com/errors/authentication/unauthorized"
 *             title: "Unauthorized"
 *             status: 401
 *             detail: "Invalid or expired token"
 *             message: "Please log in to continue."
 *             timestamp: "2025-10-31T15:10:00.000Z"
 *             path: "/api/admin/products"
 *     ConflictErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             code:
 *               example: 4006
 *             category:
 *               example: business
 *             status:
 *               example: 409
 *           example:
 *             success: false
 *             error: "ConflictError"
 *             code: 4006
 *             category: "business"
 *             type: "https://api.floresya.com/errors/business/conflict"
 *             title: "Conflict"
 *             status: 409
 *             detail: "Product with SKU already exists"
 *             message: "This operation conflicts with existing data."
 *             timestamp: "2025-10-31T15:10:00.000Z"
 *             path: "/api/products"
 *             details:
 *               field: "sku"
 *               value: "ROSE-RED-001"
 *     ServerErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ErrorResponse'
 *         - type: object
 *           properties:
 *             code:
 *               example: 5001
 *             category:
 *               example: server
 *             status:
 *               example: 500
 *           example:
 *             success: false
 *             error: "InternalServerError"
 *             code: 5001
 *             category: "server"
 *             type: "https://api.floresya.com/errors/server/internalerror"
 *             title: "Internal Server Error"
 *             status: 500
 *             detail: "Database connection failed"
 *             message: "An unexpected error occurred. Please try again later."
 *             timestamp: "2025-10-31T15:10:00.000Z"
 *             path: "/api/products"
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
 *     paymentMethod:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         name: { type: string, example: "Banco Mercantil" }
 *         type: { type: string, enum: [bank_transfer, mobile_payment, cash, crypto, international], example: "bank_transfer" }
 *         description: { type: string, example: "Transferencias desde Banco Mercantil", nullable: true }
 *         account_info: { type: string, example: "0105-1234-5678-9012", nullable: true }
 *         active: { type: boolean, example: true }
 *         display_order: { type: integer, example: 1 }
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
 *           examples:
 *             database_error:
 *               summary: Database connection error
 *               value:
 *                 success: false
 *                 error: "DatabaseError"
 *                 code: 5002
 *                 category: "server"
 *                 type: "https://api.floresya.com/errors/server/databaseerror"
 *                 title: "Database Error"
 *                 status: 500
 *                 detail: "Connection to database failed"
 *                 message: "A database error occurred. Please try again."
 *     ValidationErrorDetailed:
 *       description: Validation failed with field-specific errors
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ValidationErrorResponse' }
 *     NotFoundErrorDetailed:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/NotFoundErrorResponse' }
 *     AuthErrorDetailed:
 *       description: Authentication required
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/AuthErrorResponse' }
 *     ConflictErrorDetailed:
 *       description: Conflict with existing data
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ConflictErrorResponse' }
 *     ServerErrorDetailed:
 *       description: Server error
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ServerErrorResponse' }
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

// ==================== SYSTEM ENDPOINTS ====================

/**
 * @swagger
 * /api/errors:
 *   get:
 *     tags: [System]
 *     summary: Get all error codes
 *     description: Returns complete list of ERROR_CODES with descriptions and categories
 *     responses:
 *       200:
 *         description: List of all error codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 34
 *                     categories:
 *                       type: object
 *                       properties:
 *                         validation:
 *                           type: integer
 *                           example: 10
 *                         authentication:
 *                           type: integer
 *                           example: 7
 *                         not_found:
 *                           type: integer
 *                           example: 5
 *                         business:
 *                           type: integer
 *                           example: 6
 *                         server:
 *                           type: integer
 *                           example: 6
 *                     codes:
 *                       $ref: '#/components/schemas/ErrorCodeList'
 *                 message:
 *                   type: string
 *                   example: "Error codes retrieved successfully"
 *       500:
 *         $ref: '#/components/responses/ServerErrorDetailed'
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
 * /api/products/carousel:
 *   get:
 *     tags: [Products]
 *     summary: Get carousel products
 *     description: Returns featured products for carousel display (ordered by carousel_order)
 *     responses:
 *       200:
 *         description: Carousel products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/product' } }
 */

/**
 * @swagger
 * /api/products/with-occasions:
 *   get:
 *     tags: [Products]
 *     summary: Get products with occasions
 *     description: Returns products with their associated occasions
 *     parameters:
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/OffsetParam'
 *       - name: featured
 *         in: query
 *         schema: { type: boolean }
 *         description: Filter by featured products
 *     responses:
 *       200:
 *         description: Products with occasions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/product' } }
 */

/**
 * @swagger
 * /api/products/occasion/{occasionId}:
 *   get:
 *     tags: [Products]
 *     summary: Get products by occasion
 *     parameters:
 *       - name: occasionId
 *         in: path
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: Occasion ID
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/OffsetParam'
 *     responses:
 *       200:
 *         description: Products for occasion retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/product' } }
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/sku/{sku}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by SKU
 *     parameters:
 *       - name: sku
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Product SKU
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
 */

/**
 * @swagger
 * /api/products/{id}/images/primary:
 *   get:
 *     tags: [Products]
 *     summary: Get primary image for product
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Primary image retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/{id}/images:
 *   get:
 *     tags: [Products]
 *     summary: Get all images for product
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - name: size
 *         in: query
 *         schema: { type: string, enum: [thumb, small, medium, large] }
 *         description: Filter by image size
 *     responses:
 *       200:
 *         description: Product images retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/productimage' } }
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/with-occasions:
 *   post:
 *     tags: [Products]
 *     summary: Create product with occasions
 *     description: Admin only - Creates a new product with associated occasions
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product, occasionIds]
 *             properties:
 *               product:
 *                 type: object
 *                 required: [name, price_usd]
 *                 properties:
 *                   name: { type: string, minLength: 2, maxLength: 255 }
 *                   summary: { type: string }
 *                   description: { type: string }
 *                   price_usd: { type: number, minimum: 0 }
 *                   price_ves: { type: number, minimum: 0 }
 *                   stock: { type: integer, minimum: 0 }
 *                   sku: { type: string, maxLength: 50 }
 *                   featured: { type: boolean }
 *                   carousel_order: { type: integer, minimum: 0, maximum: 7 }
 *               occasionIds: { type: array, items: { type: integer } }
 *     responses:
 *       201:
 *         description: Product with occasions created successfully
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

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product
 *     description: Admin only - Updates an existing product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 255 }
 *               summary: { type: string }
 *               description: { type: string }
 *               price_usd: { type: number, minimum: 0 }
 *               price_ves: { type: number, minimum: 0 }
 *               stock: { type: integer, minimum: 0 }
 *               sku: { type: string, maxLength: 50 }
 *               active: { type: boolean }
 *               featured: { type: boolean }
 *               carousel_order: { type: integer, minimum: 0, maximum: 7 }
 *     responses:
 *       200:
 *         description: Product updated successfully
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
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/products/{id}/carousel-order:
 *   patch:
 *     tags: [Products]
 *     summary: Update product carousel order
 *     description: Admin only - Updates the carousel display order for a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               order: { type: integer, minimum: 0 }
 *     responses:
 *       200:
 *         description: Carousel order updated successfully
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
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/{id}/stock:
 *   patch:
 *     tags: [Products]
 *     summary: Update product stock
 *     description: Admin only - Updates the stock quantity for a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, minimum: 0 }
 *     responses:
 *       200:
 *         description: Stock updated successfully
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
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/{id}/images:
 *   post:
 *     tags: [Products]
 *     summary: Upload product images
 *     description: Admin only - Uploads new images for a product (creates all sizes)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *               is_primary: { type: boolean, description: Set as primary image }
 *     responses:
 *       201:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/productimage' } }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/{id}/images/{imageIndex}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product images by index
 *     description: Admin only - Deletes all sizes of a specific image index
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - name: imageIndex
 *         in: path
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: Image index to delete
 *     responses:
 *       200:
 *         description: Images deleted successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/{id}/images/primary/{imageIndex}:
 *   patch:
 *     tags: [Products]
 *     summary: Set primary image
 *     description: Admin only - Sets a specific image index as the primary image
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - name: imageIndex
 *         in: path
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: Image index to set as primary
 *     responses:
 *       200:
 *         description: Primary image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete product (soft delete)
 *     description: Admin only - Soft deletes a product (sets active to false)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/{id}/occasions:
 *   get:
 *     tags: [Products]
 *     summary: Get occasions for a product
 *     description: Admin only - Get all occasions associated with a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Product occasions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/occasion' } }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/{id}/occasions:
 *   put:
 *     tags: [Products]
 *     summary: Replace product occasions
 *     description: Admin only - Atomically replace all occasions for a product (transactional)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [occasion_ids]
 *             properties:
 *               occasion_ids:
 *                 type: array
 *                 items: { type: integer, minimum: 1 }
 *                 description: Array of occasion IDs to associate with the product
 *     responses:
 *       200:
 *         description: Product occasions updated successfully
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
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

/**
 * @swagger
 * /api/products/{id}/occasions/{occasionId}:
 *   post:
 *     tags: [Products]
 *     summary: Link occasion to product
 *     description: Admin only - Link a single occasion to a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - name: occasionId
 *         in: path
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: Occasion ID to link
 *     responses:
 *       200:
 *         description: Occasion linked to product successfully
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
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

/**
 * @swagger
 * /api/products/{id}/reactivate:
 *   patch:
 *     tags: [Products]
 *     summary: Reactivate product
 *     description: Admin only - Reactivates a soft-deleted product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Product reactivated successfully
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
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 *             required: [product]
 *             properties:
 *               product:
 *                 type: object
 *                 required: [name, price_usd]
 *                 properties:
 *                   name: { type: string, minLength: 2, maxLength: 255 }
 *                   summary: { type: string }
 *                   description: { type: string }
 *                   price_usd: { type: number, minimum: 0 }
 *                   price_ves: { type: number, minimum: 0 }
 *                   stock: { type: integer, minimum: 0 }
 *                   sku: { type: string, maxLength: 50 }
 *                   featured: { type: boolean }
 *                   carousel_order: { type: integer, minimum: 0, maximum: 7 }
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

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     description: Get order details by ID (owner or admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/orders/user/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders by user
 *     description: Get all orders for a specific user (owner or admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *         description: User ID
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/OffsetParam'
 *     responses:
 *       200:
 *         description: User orders retrieved successfully
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

/**
 * @swagger
 * /api/orders/{id}/status-history:
 *   get:
 *     tags: [Orders]
 *     summary: Get order status history
 *     description: Get the complete status change history for an order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Order status history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/OrderStatusHistory' } }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create new order
 *     description: Create a new order (public endpoint for checkout process)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order, items]
 *             properties:
 *               order:
 *                 type: object
 *                 required: [customer_email, customer_name, customer_phone, delivery_address, total_amount_usd]
 *                 properties:
 *                   customer_email: { type: string, format: email }
 *                   customer_name: { type: string, minLength: 2, maxLength: 255 }
 *                   customer_phone: { type: string, pattern: '^\+?[\d\s-()]+$' }
 *                   delivery_address: { type: string, minLength: 10, maxLength: 500 }
 *                   delivery_date: { type: string, format: date }
 *                   delivery_time_slot: { type: string, pattern: '^\d{2}:\d{2}-\d{2}:\d{2}$' }
 *                   delivery_notes: { type: string, maxLength: 1000 }
 *                   total_amount_usd: { type: number, minimum: 0 }
 *                   total_amount_ves: { type: number, minimum: 0 }
 *                   currency_rate: { type: number, minimum: 0 }
 *                   status: { type: string, enum: [pending, verified, preparing, shipped, delivered, cancelled] }
 *                   notes: { type: string, maxLength: 1000 }
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [product_id, product_name, unit_price_usd, quantity]
 *                   properties:
 *                     product_id: { type: integer, minimum: 1 }
 *                     product_name: { type: string, minLength: 1 }
 *                     product_summary: { type: string }
 *                     unit_price_usd: { type: number, minimum: 0 }
 *                     unit_price_ves: { type: number, minimum: 0 }
 *                     quantity: { type: integer, minimum: 1 }
 *                     subtotal_usd: { type: number, minimum: 0 }
 *                     subtotal_ves: { type: number, minimum: 0 }
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         description: Too many requests
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     tags: [Orders]
 *     summary: Update order
 *     description: Update order details (owner or admin, limited fields)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               delivery_notes: { type: string, maxLength: 1000 }
 *               notes: { type: string, maxLength: 1000 }
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status
 *     description: Admin only - Update order status with optional notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/OrderStatusUpdate' }
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: Cancel order
 *     description: Cancel an order (owner or admin) with optional cancellation notes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes: { type: string, maxLength: 1000 }
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     description: Get user details by ID (owner or admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/users/email/{email}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by email
 *     description: Admin only - Get user details by email address
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: email
 *         in: path
 *         required: true
 *         schema: { type: string, format: email }
 *         description: User email address
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Create new user
 *     description: Create a new user account (public registration)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, full_name]
 *             properties:
 *               email: { type: string, format: email }
 *               full_name: { type: string, minLength: 2, maxLength: 255 }
 *               phone: { type: string, pattern: '^\+?[\d\s-()]+$' }
 *               role: { type: string, enum: [user, admin], default: user }
 *               password_hash: { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     description: Update user details (owner or admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name: { type: string, minLength: 2, maxLength: 255 }
 *               phone: { type: string, pattern: '^\+?[\d\s-()]+$' }
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete user (soft delete)
 *     description: Admin only - Soft deletes a user (sets active to false)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/users/{id}/reactivate:
 *   patch:
 *     tags: [Users]
 *     summary: Reactivate user
 *     description: Admin only - Reactivates a soft-deleted user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/users/{id}/verify-email:
 *   patch:
 *     tags: [Users]
 *     summary: Verify user email
 *     description: Verify user email address (owner or admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// ==================== PAYMENTS ====================

/**
 * @swagger
 * /api/payments/methods:
 *   get:
 *     tags: [Payments]
 *     summary: Get available payment methods
 *     description: Public - Returns available payment methods for Venezuela
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { type: string } }
 */

/**
 * @swagger
 * /api/payments/{id}/confirm:
 *   post:
 *     tags: [Payments]
 *     summary: Confirm payment for order
 *     description: Confirm payment for an existing order (authenticated users)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PaymentConfirm' }
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/payment' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

// ==================== OCCASIONS ====================

/**
 * @swagger
 * /api/occasions:
 *   get:
 *     tags: [Occasions]
 *     summary: Get all occasions
 *     description: Public - Returns all active occasions, sorted by display_order.
 *     parameters:
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Occasions retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/occasion'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/occasions/{id}:
 *   get:
 *     tags: [Occasions]
 *     summary: Get occasion by ID
 *     description: Get occasion details by its unique ID.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Occasion retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/occasion'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/occasions/slug/{slug}:
 *   get:
 *     tags: [Occasions]
 *     summary: Get occasion by slug
 *     description: Get occasion details by its unique slug.
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Occasion slug
 *     responses:
 *       200:
 *         description: Occasion retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/occasion'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/occasions:
 *   post:
 *     tags: [Occasions]
 *     summary: Create new occasion
 *     description: Admin only - Creates a new occasion.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *               slug:
 *                 type: string
 *                 pattern: '^[a-z0-9-]+$'
 *               display_order:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Occasion created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/occasion'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/occasions/{id}:
 *   put:
 *     tags: [Occasions]
 *     summary: Update occasion
 *     description: Admin only - Updates an existing occasion.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *               slug:
 *                 type: string
 *                 pattern: '^[a-z0-9-]+$'
 *               display_order:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Occasion updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/occasion'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/occasions/{id}/display-order:
 *   patch:
 *     tags: [Occasions]
 *     summary: Update occasion display order
 *     description: Admin only - Atomically updates the display order for an occasion.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               order:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Display order updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/occasion'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/occasions/{id}:
 *   delete:
 *     tags: [Occasions]
 *     summary: Delete occasion (soft delete)
 *     description: Admin only - Soft deletes an occasion by setting its `active` flag to false.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Occasion deactivated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/occasions/{id}/reactivate:
 *   patch:
 *     tags: [Occasions]
 *     summary: Reactivate occasion
 *     description: Admin only - Reactivates a soft-deleted occasion by setting its `active` flag to true.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Occasion reactivated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/occasion'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: array, items: { $ref: '#/components/schemas/settings' } }
 */

/**
 * @swagger
 * /api/settings/map:
 *   get:
 *     tags: [Settings]
 *     summary: Get settings map
 *     description: Returns settings as a key-value map
 *     responses:
 *       200:
 *         description: Settings map retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: object, additionalProperties: { type: string } }
 */

/**
 * @swagger
 * /api/settings/{key}/value:
 *   get:
 *     tags: [Settings]
 *     summary: Get setting value by key
 *     description: Get a specific setting value by its key
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Setting key
 *     responses:
 *       200:
 *         description: Setting value retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: string }
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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

/**
 * @swagger
 * /api/settings/{key}:
 *   get:
 *     tags: [Settings]
 *     summary: Get setting by key
 *     description: Admin only - Get setting details by key
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Setting key
 *     responses:
 *       200:
 *         description: Setting retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/settings' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/settings:
 *   post:
 *     tags: [Settings]
 *     summary: Create new setting
 *     description: Admin only - Creates a new setting
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, value]
 *             properties:
 *               key: { type: string, pattern: '^[a-z0-9_]+$' }
 *               value: { type: string }
 *               description: { type: string }
 *               is_public: { type: boolean }
 *     responses:
 *       201:
 *         description: Setting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/settings' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

/**
 * @swagger
 * /api/settings/{key}:
 *   put:
 *     tags: [Settings]
 *     summary: Update setting
 *     description: Admin only - Updates an existing setting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Setting key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value: { type: string }
 *               description: { type: string }
 *               is_public: { type: boolean }
 *     responses:
 *       200:
 *         description: Setting updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/settings' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/settings/{key}:
 *   delete:
 *     tags: [Settings]
 *     summary: Delete setting
 *     description: Admin only - Deletes a setting
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         schema: { type: string }
 *         description: Setting key
 *     responses:
 *       200:
 *         description: Setting deleted successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// ==================== ADMIN SETTINGS ====================

/**
 * @swagger
 * /api/admin/settings/image:
 *   post:
 *     tags: [Admin]
 *     summary: Upload setting image
 *     description: Admin only - Upload and save image for a specific setting
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/admin/settings/bcv-price:
 *   post:
 *     tags: [Admin]
 *     summary: Save BCV USD rate
 *     description: Admin only - Save BCV USD exchange rate
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rate]
 *             properties:
 *               rate: { type: number, minimum: 0 }
 *     responses:
 *       200:
 *         description: BCV rate saved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/admin/settings/business-rules:
 *   get:
 *     tags: [Admin]
 *     summary: Get business rules status
 *     description: Admin only - Get business rules engine status and configuration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business rules status retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// ==================== PAYMENT METHODS ====================

/**
 * @swagger
 * /api/payment-methods:
 *   get:
 *     tags: [Payment Methods]
 *     summary: Get all payment methods
 *     description: Public - Returns all active payment methods, sorted by display_order.
 *     parameters:
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/paymentMethod'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// ==================== MIGRATIONS ====================

/**
 * @swagger
 * /api/migrations/add-is-active-to-settings:
 *   post:
 *     tags: [Migrations]
 *     summary: Add active column to settings table
 *     description: Admin only - Migration endpoint to add active column to settings table
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Migration completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { type: object, description: "Migration result" }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// ==================== ADMIN SETTINGS ====================

/**
 * @swagger
 * /api/admin/settings/image:
 *   post:
 *     tags: [Admin Settings]
 *     summary: Upload setting image
 *     description: Admin only - Upload and save image for a specific setting
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/admin/settings/bcv-price:
 *   post:
 *     tags: [Admin Settings]
 *     summary: Save BCV USD rate
 *     description: Admin only - Save BCV USD exchange rate
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rate]
 *             properties:
 *               rate: { type: number, minimum: 0 }
 *     responses:
 *       200:
 *         description: BCV rate saved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/admin/settings/business-rules:
 *   get:
 *     tags: [Admin Settings]
 *     summary: Get business rules status
 *     description: Admin only - Get business rules engine status and configuration
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Business rules status retrieved successfully
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SuccessResponse' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/payment-methods/{id}:
 *   get:
 *     tags: [Payment Methods]
 *     summary: Get payment method by ID
 *     description: Get payment method details by its unique ID.
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Payment method retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/paymentMethod'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/payment-methods:
 *   post:
 *     tags: [Payment Methods]
 *     summary: Create new payment method
 *     description: Admin only - Creates a new payment method.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               type:
 *                 type: string
 *                 enum: [bank_transfer, mobile_payment, cash, crypto, international]
 *               description:
 *                 type: string
 *               account_info:
 *                 type: string
 *               active:
 *                 type: boolean
 *               display_order:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Payment method created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/paymentMethod'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/payment-methods/{id}:
 *   put:
 *     tags: [Payment Methods]
 *     summary: Update payment method
 *     description: Admin only - Updates an existing payment method.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               type:
 *                 type: string
 *                 enum: [bank_transfer, mobile_payment, cash, crypto, international]
 *               description:
 *                 type: string
 *               account_info:
 *                 type: string
 *               active:
 *                 type: boolean
 *               display_order:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Payment method updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/paymentMethod'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/payment-methods/{id}/display-order:
 *   patch:
 *     tags: [Payment Methods]
 *     summary: Update payment method display order
 *     description: Admin only - Atomically updates the display order for a payment method.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               order:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Display order updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/paymentMethod'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/payment-methods/{id}:
 *   delete:
 *     tags: [Payment Methods]
 *     summary: Delete payment method (soft delete)
 *     description: Admin only - Soft deletes a payment method by setting its `active` flag to false.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Payment method deactivated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /api/payment-methods/{id}/reactivate:
 *   patch:
 *     tags: [Payment Methods]
 *     summary: Reactivate payment method
 *     description: Admin only - Reactivates a soft-deleted payment method by setting its `active` flag to true.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Payment method reactivated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/paymentMethod'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
