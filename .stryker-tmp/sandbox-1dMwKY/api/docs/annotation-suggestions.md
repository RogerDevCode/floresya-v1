# 📝 OpenAPI Annotation Suggestions

Generated: 2025-10-08T12:13:47.491Z

Found 53 functions that could benefit from JSDoc annotations.

## 1. occasionController.js - getAllOccasions

```javascript
/**
 * @swagger
 * /api/occasion/{id}:
 *   get:
 *     tags: [occasion]
 *     summary: Get all occasions
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get all occasions operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/occasion' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/occasionController.js
**Function:** getAllOccasions

---

## 2. occasionController.js - getOccasionById

```javascript
/**
 * @swagger
 * /api/occasion/{id}:
 *   get:
 *     tags: [occasion]
 *     summary: Get occasion by id
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get occasion by id operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/occasion' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/occasionController.js
**Function:** getOccasionById

---

## 3. occasionController.js - getOccasionBySlug

```javascript
/**
 * @swagger
 * /api/occasion/{id}:
 *   get:
 *     tags: [occasion]
 *     summary: Get occasion by slug
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get occasion by slug operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/occasion' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/occasionController.js
**Function:** getOccasionBySlug

---

## 4. occasionController.js - createOccasion

```javascript
/**
 * @swagger
 * /api/occasion/{id}:
 *   post:
 *     tags: [occasion]
 *     summary: Create occasion
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Create occasion operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/occasion' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/occasionController.js
**Function:** createOccasion

---

## 5. occasionController.js - updateOccasion

```javascript
/**
 * @swagger
 * /api/occasion/{id}:
 *   patch:
 *     tags: [occasion]
 *     summary: Update occasion
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Update occasion operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/occasion' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/occasionController.js
**Function:** updateOccasion

---

## 6. occasionController.js - updateDisplayOrder

```javascript
/**
 * @swagger
 * /api/occasion/{id}:
 *   patch:
 *     tags: [occasion]
 *     summary: Update display order
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Update display order operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/occasion' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/occasionController.js
**Function:** updateDisplayOrder

---

## 7. occasionController.js - deleteOccasion

```javascript
/**
 * @swagger
 * /api/occasion/{id}:
 *   delete:
 *     tags: [occasion]
 *     summary: Delete occasion
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Delete occasion operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/occasion' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/occasionController.js
**Function:** deleteOccasion

---

## 8. occasionController.js - reactivateOccasion

```javascript
/**
 * @swagger
 * /api/occasion/{id}:
 *   get:
 *     tags: [occasion]
 *     summary: Reactivate occasion
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Reactivate occasion operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/occasion' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/occasionController.js
**Function:** reactivateOccasion

---

## 9. orderController.js - getAllOrders

```javascript
/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     tags: [order]
 *     summary: Get all orders
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get all orders operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/orderController.js
**Function:** getAllOrders

---

## 10. orderController.js - getOrderById

```javascript
/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     tags: [order]
 *     summary: Get order by id
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get order by id operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/orderController.js
**Function:** getOrderById

---

## 11. orderController.js - getOrdersByUser

```javascript
/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     tags: [order]
 *     summary: Get orders by user
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get orders by user operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/orderController.js
**Function:** getOrdersByUser

---

## 12. orderController.js - getOrderStatusHistory

```javascript
/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     tags: [order]
 *     summary: Get order status history
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get order status history operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/orderController.js
**Function:** getOrderStatusHistory

---

## 13. orderController.js - createOrder

```javascript
/**
 * @swagger
 * /api/order/{id}:
 *   post:
 *     tags: [order]
 *     summary: Create order
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Create order operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/orderController.js
**Function:** createOrder

---

## 14. orderController.js - updateOrder

```javascript
/**
 * @swagger
 * /api/order/{id}:
 *   patch:
 *     tags: [order]
 *     summary: Update order
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Update order operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/orderController.js
**Function:** updateOrder

---

## 15. orderController.js - updateOrderStatus

```javascript
/**
 * @swagger
 * /api/order/{id}:
 *   patch:
 *     tags: [order]
 *     summary: Update order status
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Update order status operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/orderController.js
**Function:** updateOrderStatus

---

## 16. orderController.js - cancelOrder

```javascript
/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     tags: [order]
 *     summary: Cancel order
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Cancel order operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/order' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/orderController.js
**Function:** cancelOrder

---

## 17. paymentController.js - getPaymentMethods

```javascript
/**
 * @swagger
 * /api/payment/{id}:
 *   get:
 *     tags: [payment]
 *     summary: Get payment methods
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get payment methods operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/payment' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/paymentController.js
**Function:** getPaymentMethods

---

## 18. paymentController.js - confirmPayment

```javascript
/**
 * @swagger
 * /api/payment/{id}:
 *   get:
 *     tags: [payment]
 *     summary: Confirm payment
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Confirm payment operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/payment' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/paymentController.js
**Function:** confirmPayment

---

## 19. productController.js - getAllProducts

```javascript
/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     tags: [product]
 *     summary: Get all products
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get all products operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productController.js
**Function:** getAllProducts

---

## 20. productController.js - getProductById

```javascript
/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     tags: [product]
 *     summary: Get product by id
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get product by id operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productController.js
**Function:** getProductById

---

## 21. productController.js - getProductBySku

```javascript
/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     tags: [product]
 *     summary: Get product by sku
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get product by sku operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productController.js
**Function:** getProductBySku

---

## 22. productController.js - getCarouselProducts

```javascript
/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     tags: [product]
 *     summary: Get carousel products
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get carousel products operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productController.js
**Function:** getCarouselProducts

---

## 23. productController.js - getProductsWithOccasions

```javascript
/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     tags: [product]
 *     summary: Get products with occasions
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get products with occasions operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productController.js
**Function:** getProductsWithOccasions

---

## 24. productController.js - getProductsByOccasion

```javascript
/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     tags: [product]
 *     summary: Get products by occasion
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get products by occasion operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productController.js
**Function:** getProductsByOccasion

---

## 25. productController.js - createProduct

```javascript
/**
 * @swagger
 * /api/product/{id}:
 *   post:
 *     tags: [product]
 *     summary: Create product
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Create product operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productController.js
**Function:** createProduct

---

## 26. productController.js - createProductWithOccasions

```javascript
/**
 * @swagger
 * /api/product/{id}:
 *   post:
 *     tags: [product]
 *     summary: Create product with occasions
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Create product with occasions operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productController.js
**Function:** createProductWithOccasions

---

## 27. productController.js - updateProduct

```javascript
/**
 * @swagger
 * /api/product/{id}:
 *   patch:
 *     tags: [product]
 *     summary: Update product
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Update product operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productController.js
**Function:** updateProduct

---

## 28. productController.js - updateCarouselOrder

```javascript
/**
 * @swagger
 * /api/product/{id}:
 *   patch:
 *     tags: [product]
 *     summary: Update carousel order
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Update carousel order operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productController.js
**Function:** updateCarouselOrder

---

## 29. productController.js - updateStock

```javascript
/**
 * @swagger
 * /api/product/{id}:
 *   patch:
 *     tags: [product]
 *     summary: Update stock
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Update stock operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productController.js
**Function:** updateStock

---

## 30. productController.js - deleteProduct

```javascript
/**
 * @swagger
 * /api/product/{id}:
 *   delete:
 *     tags: [product]
 *     summary: Delete product
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Delete product operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productController.js
**Function:** deleteProduct

---

## 31. productController.js - reactivateProduct

```javascript
/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     tags: [product]
 *     summary: Reactivate product
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Reactivate product operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/product' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productController.js
**Function:** reactivateProduct

---

## 32. productImageController.js - getProductImages

```javascript
/**
 * @swagger
 * /api/productimage/{id}:
 *   get:
 *     tags: [productimage]
 *     summary: Get product images
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get product images operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productImageController.js
**Function:** getProductImages

---

## 33. productImageController.js - getPrimaryImage

```javascript
/**
 * @swagger
 * /api/productimage/{id}:
 *   get:
 *     tags: [productimage]
 *     summary: Get primary image
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get primary image operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productImageController.js
**Function:** getPrimaryImage

---

## 34. productImageController.js - createProductImages

```javascript
/**
 * @swagger
 * /api/productimage/{id}:
 *   post:
 *     tags: [productimage]
 *     summary: Create product images
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Create product images operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productImageController.js
**Function:** createProductImages

---

## 35. productImageController.js - deleteImagesByIndex

```javascript
/**
 * @swagger
 * /api/productimage/{id}:
 *   delete:
 *     tags: [productimage]
 *     summary: Delete images by index
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Delete images by index operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productImageController.js
**Function:** deleteImagesByIndex

---

## 36. productImageController.js - setPrimaryImage

```javascript
/**
 * @swagger
 * /api/productimage/{id}:
 *   get:
 *     tags: [productimage]
 *     summary: Set primary image
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Set primary image operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/productimage' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/productImageController.js
**Function:** setPrimaryImage

---

## 37. settingsController.js - getAllSettings

```javascript
/**
 * @swagger
 * /api/settings/{id}:
 *   get:
 *     tags: [settings]
 *     summary: Get all settings
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get all settings operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/settings' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/settingsController.js
**Function:** getAllSettings

---

## 38. settingsController.js - getPublicSettings

```javascript
/**
 * @swagger
 * /api/settings/{id}:
 *   get:
 *     tags: [settings]
 *     summary: Get public settings
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get public settings operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/settings' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/settingsController.js
**Function:** getPublicSettings

---

## 39. settingsController.js - getSettingsMap

```javascript
/**
 * @swagger
 * /api/settings/{id}:
 *   get:
 *     tags: [settings]
 *     summary: Get settings map
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get settings map operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/settings' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/settingsController.js
**Function:** getSettingsMap

---

## 40. settingsController.js - getSettingByKey

```javascript
/**
 * @swagger
 * /api/settings/{id}:
 *   get:
 *     tags: [settings]
 *     summary: Get setting by key
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get setting by key operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/settings' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/settingsController.js
**Function:** getSettingByKey

---

## 41. settingsController.js - createSetting

```javascript
/**
 * @swagger
 * /api/settings/{id}:
 *   post:
 *     tags: [settings]
 *     summary: Create setting
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Create setting operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/settings' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/settingsController.js
**Function:** createSetting

---

## 42. settingsController.js - updateSetting

```javascript
/**
 * @swagger
 * /api/settings/{id}:
 *   patch:
 *     tags: [settings]
 *     summary: Update setting
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Update setting operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/settings' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/settingsController.js
**Function:** updateSetting

---

## 43. settingsController.js - setSettingValue

```javascript
/**
 * @swagger
 * /api/settings/{id}:
 *   get:
 *     tags: [settings]
 *     summary: Set setting value
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Set setting value operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/settings' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/settingsController.js
**Function:** setSettingValue

---

## 44. settingsController.js - deleteSetting

```javascript
/**
 * @swagger
 * /api/settings/{id}:
 *   delete:
 *     tags: [settings]
 *     summary: Delete setting
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Delete setting operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/settings' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/settingsController.js
**Function:** deleteSetting

---

## 45. settingsController.js - getSettingValue

```javascript
/**
 * @swagger
 * /api/settings/{id}:
 *   get:
 *     tags: [settings]
 *     summary: Get setting value
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get setting value operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/settings' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/settingsController.js
**Function:** getSettingValue

---

## 46. userController.js - getAllUsers

```javascript
/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     tags: [user]
 *     summary: Get all users
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get all users operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/userController.js
**Function:** getAllUsers

---

## 47. userController.js - getUserById

```javascript
/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     tags: [user]
 *     summary: Get user by id
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get user by id operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/userController.js
**Function:** getUserById

---

## 48. userController.js - getUserByEmail

```javascript
/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     tags: [user]
 *     summary: Get user by email
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Get user by email operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/userController.js
**Function:** getUserByEmail

---

## 49. userController.js - createUser

```javascript
/**
 * @swagger
 * /api/user/{id}:
 *   post:
 *     tags: [user]
 *     summary: Create user
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Create user operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/userController.js
**Function:** createUser

---

## 50. userController.js - updateUser

```javascript
/**
 * @swagger
 * /api/user/{id}:
 *   patch:
 *     tags: [user]
 *     summary: Update user
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Update user operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/userController.js
**Function:** updateUser

---

## 51. userController.js - deleteUser

```javascript
/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     tags: [user]
 *     summary: Delete user
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Delete user operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/userController.js
**Function:** deleteUser

---

## 52. userController.js - reactivateUser

```javascript
/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     tags: [user]
 *     summary: Reactivate user
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Reactivate user operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/userController.js
**Function:** reactivateUser

---

## 53. userController.js - verifyUserEmail

```javascript
/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     tags: [user]
 *     summary: Verify user email
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Verify user email operation
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data: { $ref: '#/components/schemas/user' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       404: { $ref: '#/components/responses/NotFoundError' }
 *       500: { $ref: '#/components/responses/InternalServerError' }
 */
```

**File:** /home/manager/Sync/floresya-v1/api/controllers/userController.js
**Function:** verifyUserEmail

---
