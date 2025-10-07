/**
 * OpenAPI JSDoc Annotations
 * Centralized documentation for all API endpoints
 * This file is scanned by swagger-jsdoc to generate OpenAPI spec
 */

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
 *                     data: { type: array, items: { $ref: '#/components/schemas/Product' } }
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
 *                     data: { $ref: '#/components/schemas/Product' }
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *                     data: { $ref: '#/components/schemas/Product' }
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/carousel:
 *   get:
 *     tags: [Products]
 *     summary: Get carousel products
 *     description: Returns featured products sorted by carousel_order
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
 *                     data: { type: array, items: { $ref: '#/components/schemas/Product' } }
 */

/**
 * @swagger
 * /api/products/with-occasions:
 *   get:
 *     tags: [Products]
 *     summary: Get products with occasions
 *     description: Returns products with their associated occasions (uses stored function)
 *     parameters:
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/OffsetParam'
 *     responses:
 *       200:
 *         description: Products with occasions retrieved successfully
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
 *         schema: { type: integer }
 *         description: Occasion ID
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Products retrieved successfully
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
 *                     data: { $ref: '#/components/schemas/Product' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

/**
 * @swagger
 * /api/products/with-occasions:
 *   post:
 *     tags: [Products]
 *     summary: Create product with occasions (atomic)
 *     description: Admin only - Creates product and associates it with occasions in a single transaction
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
 *               product: { type: object }
 *               occasionIds: { type: array, items: { type: integer } }
 *     responses:
 *       201:
 *         description: Product with occasions created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update product
 *     description: Admin only - Updates product fields
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
 *               name: { type: string }
 *               summary: { type: string }
 *               description: { type: string }
 *               price_usd: { type: number }
 *               price_ves: { type: number }
 *               stock: { type: integer }
 *               sku: { type: string }
 *               featured: { type: boolean }
 *               carousel_order: { type: integer }
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
 *                     data: { $ref: '#/components/schemas/Product' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/{id}/carousel-order:
 *   patch:
 *     tags: [Products]
 *     summary: Update carousel order (atomic)
 *     description: Admin only - Updates carousel order using atomic stored function
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/products/{id}/stock:
 *   patch:
 *     tags: [Products]
 *     summary: Update stock
 *     description: Admin only - Updates product stock quantity
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Soft-delete product
 *     description: Admin only - Deactivates product (soft-delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Product deactivated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/products/{id}/images:
 *   get:
 *     tags: [Products]
 *     summary: Get product images
 *     description: Public - Returns all images for a product, filtered by size if specified
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - name: size
 *         in: query
 *         schema:
 *           type: string
 *           enum: [thumb, small, medium, large]
 *         description: Filter images by size
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
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ProductImage'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/{id}/images/primary:
 *   get:
 *     tags: [Products]
 *     summary: Get primary product image
 *     description: Public - Returns the primary (featured) image for a product (medium size)
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
 *                     data:
 *                       $ref: '#/components/schemas/ProductImage'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/products/{id}/images:
 *   post:
 *     tags: [Products]
 *     summary: Create product images
 *     description: Admin only - Batch insert all sizes for a single image_index (1-5)
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
 *             required: [image_index, images]
 *             properties:
 *               image_index:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Image index (1-5) for ordering in carousel
 *               images:
 *                 type: array
 *                 description: All sizes for this image (thumb, small, medium, large)
 *                 items:
 *                   type: object
 *                   required: [size, url, file_hash, mime_type]
 *                   properties:
 *                     size:
 *                       type: string
 *                       enum: [thumb, small, medium, large]
 *                     url:
 *                       type: string
 *                       format: uri
 *                       description: Image URL (CDN or storage path)
 *                     file_hash:
 *                       type: string
 *                       description: Hash for deduplication
 *                     mime_type:
 *                       type: string
 *                       example: image/webp
 *               is_primary:
 *                 type: boolean
 *                 default: false
 *                 description: Mark this image as primary/featured
 *     responses:
 *       201:
 *         description: Images created successfully
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
 *                         $ref: '#/components/schemas/ProductImage'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/products/{id}/images/{imageIndex}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete images by image_index
 *     description: Admin only - Deletes all sizes for a specific image_index (1-5)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - name: imageIndex
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Image index to delete
 *     responses:
 *       200:
 *         description: Images deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         deleted_count:
 *                           type: integer
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
 * /api/products/{id}/images/primary/{imageIndex}:
 *   patch:
 *     tags: [Products]
 *     summary: Set primary image by image_index
 *     description: Admin only - Marks a specific image_index as primary/featured
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - name: imageIndex
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Image index to set as primary
 *     responses:
 *       200:
 *         description: Primary image set successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProductImage'
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
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
 *                     data: { type: array, items: { $ref: '#/components/schemas/Order' } }
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
 *     summary: Get order by ID with items
 *     description: Owner or admin - Returns order details with order_items (uses idx_order_items_order_id for JOIN performance)
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
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Order'
 *                         - type: object
 *                           properties:
 *                             order_items:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/OrderItem'
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
 *     summary: Get orders by user with items
 *     description: Owner or admin - Returns user's orders with items (uses idx_orders_user_id)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema: { type: integer }
 *         description: User ID
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, verified, preparing, shipped, delivered, cancelled]
 *         description: Filter by status
 *       - name: limit
 *         in: query
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *         description: Limit results
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
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Order'
 *                           - type: object
 *                             properties:
 *                               order_items:
 *                                 type: array
 *                                 items:
 *                                   $ref: '#/components/schemas/OrderItem'
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
 *     description: Authenticated - Returns complete status change history ordered by created_at DESC (uses idx_order_status_history_created_at)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Status history retrieved successfully
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
 *                         $ref: '#/components/schemas/OrderStatusHistory'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create order (atomic)
 *     description: Authenticated - Creates order with items in single transaction
 *     security:
 *       - bearerAuth: []
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
 *                 required: [customer_email, customer_name, customer_phone, delivery_address, delivery_city, delivery_state, total_amount_usd]
 *                 properties:
 *                   customer_email: { type: string, format: email }
 *                   customer_name: { type: string, minLength: 2, maxLength: 255 }
 *                   customer_phone: { type: string, pattern: '^\\+?[\\d\\s-()]+$' }
 *                   delivery_address: { type: string, minLength: 10, maxLength: 500 }
 *                   delivery_city: { type: string, minLength: 2, maxLength: 100 }
 *                   delivery_state: { type: string, minLength: 2, maxLength: 100 }
 *                   delivery_zip: { type: string, maxLength: 20 }
 *                   delivery_date: { type: string, format: date }
 *                   delivery_time_slot: { type: string, maxLength: 100 }
 *                   delivery_notes: { type: string, maxLength: 500 }
 *                   total_amount_usd: { type: number, minimum: 0 }
 *                   total_amount_ves: { type: number, minimum: 0 }
 *                   currency_rate: { type: number, minimum: 0 }
 *                   status: { type: string, enum: [pending, verified, preparing, shipped, delivered, cancelled], default: pending }
 *                   notes: { type: string, maxLength: 1000 }
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [product_id, product_name, unit_price_usd, quantity]
 *                   properties:
 *                     product_id: { type: integer }
 *                     product_name: { type: string }
 *                     product_summary: { type: string }
 *                     unit_price_usd: { type: number }
 *                     unit_price_ves: { type: number }
 *                     quantity: { type: integer, minimum: 1 }
 *                     subtotal_usd: { type: number }
 *                     subtotal_ves: { type: number }
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
 *                     data: { $ref: '#/components/schemas/Order' }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status
 *     description: Admin only - Updates order status and creates history record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrderStatusUpdate'
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: Cancel order
 *     description: Owner or admin - Cancels order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Order cancelled successfully
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
 *                     data: { type: array, items: { $ref: '#/components/schemas/User' } }
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
 *     description: Owner or admin - Returns user details
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
 *                     data: { $ref: '#/components/schemas/User' }
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
 *     summary: Create user (public registration)
 *     description: Public endpoint for user registration
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *               full_name: { type: string, minLength: 2, maxLength: 255 }
 *               phone: { type: string, pattern: '^\\+?[\\d\\s-()]+$' }
 *               password_hash: { type: string }
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     description: Owner or admin - Updates user profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name: { type: string }
 *               phone: { type: string }
 *               role: { type: string, enum: [user, admin] }
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Soft-delete user
 *     description: Admin only - Deactivates user account
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User deactivated successfully
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
 *                     data: { type: array, items: { $ref: '#/components/schemas/Payment' } }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/payments/methods:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment methods
 *     description: Public - Returns active payment methods
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Create payment
 *     description: Authenticated - Creates payment record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order_id, amount_usd, payment_method_name]
 *             properties:
 *               order_id: { type: integer }
 *               amount_usd: { type: number, minimum: 0 }
 *               amount_ves: { type: number }
 *               payment_method_name: { type: string }
 *               transaction_id: { type: string }
 *               reference_number: { type: string }
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed, refunded, partially_refunded]
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/payments/{id}/confirm:
 *   post:
 *     tags: [Payments]
 *     summary: Confirm payment
 *     description: Authenticated - Confirms payment for an order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentConfirm'
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
 *                     data: { $ref: '#/components/schemas/Payment' }
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
 *                     data: { type: array, items: { $ref: '#/components/schemas/Occasion' } }
 */

/**
 * @swagger
 * /api/occasions/slug/{slug}:
 *   get:
 *     tags: [Occasions]
 *     summary: Get occasion by slug
 *     description: Public - Returns occasion by slug (SEO-friendly)
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Occasion retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /api/occasions:
 *   post:
 *     tags: [Occasions]
 *     summary: Create occasion
 *     description: Admin only - Creates new occasion
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
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *               description: { type: string }
 *               slug: { type: string, pattern: '^[a-z0-9-]+$' }
 *               display_order: { type: integer, minimum: 0 }
 *     responses:
 *       201:
 *         description: Occasion created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
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
 *                     data: { type: array, items: { $ref: '#/components/schemas/Setting' } }
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /api/settings:
 *   post:
 *     tags: [Settings]
 *     summary: Create setting
 *     description: Admin only - Creates new setting
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
