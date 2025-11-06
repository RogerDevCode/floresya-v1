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
 *               is_active:
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
 *               is_active:
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
 *     description: Admin only - Soft deletes a payment method by setting its `is_active` flag to false.
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
 *     description: Admin only - Reactivates a soft-deleted payment method by setting its `is_active` flag to true.
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
