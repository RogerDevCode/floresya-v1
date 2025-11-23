/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Centralized Schema Templates for OpenAPI Documentation
 * Reusable schema definitions following DRY and KISS principles
 */

// ==================== COMMON RESPONSE SCHEMAS ====================

/**
 * Standard success response schema
 * @swagger
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: true }
 *         data: { type: object, description: Response data }
 *         message: { type: string, example: "Operation completed successfully" }
 */
export const SUCCESS_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    data: { type: 'object', description: 'Response data' },
    message: { type: 'string', example: 'Operation completed successfully' }
  }
}

/**
 * Standard error response schema
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         error: { type: string, example: "Error message" }
 *         message: { type: string, example: "Operation failed" }
 *         details: { type: array, items: { type: string }, description: "Validation errors (if applicable)" }
 */
export const ERROR_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    error: { type: 'string', example: 'Error message' },
    message: { type: 'string', example: 'Operation failed' },
    details: {
      type: 'array',
      items: { type: 'string' },
      description: 'Validation errors (if applicable)'
    }
  }
}

// ==================== ENTITY SCHEMAS ====================

/**
 * User entity schema
 * @swagger
 * components:
 *   schemas:
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
 */
export const USER_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    email: { type: 'string', format: 'email', example: 'user@example.com' },
    full_name: { type: 'string', example: 'John Doe' },
    phone: { type: 'string', example: '+1234567890' },
    role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
    email_verified: { type: 'boolean', example: false },
    active: { type: 'boolean', example: true },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  }
}

/**
 * Product entity schema
 * @swagger
 * components:
 *   schemas:
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
 */
export const PRODUCT_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    name: { type: 'string', example: 'Red Roses Bouquet' },
    summary: { type: 'string', example: 'Dozen red roses', nullable: true },
    description: { type: 'string', example: 'Beautiful red roses', nullable: true },
    price_usd: { type: 'number', format: 'decimal', example: 29.99 },
    price_ves: { type: 'number', format: 'decimal', example: 1200, nullable: true },
    stock: { type: 'integer', example: 50 },
    sku: { type: 'string', example: 'ROSE-RED-001', nullable: true },
    featured: { type: 'boolean', example: true },
    carousel_order: { type: 'integer', example: 1, nullable: true },
    active: { type: 'boolean', example: true },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  }
}

/**
 * Order entity schema
 * @swagger
 * components:
 *   schemas:
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
 */
export const ORDER_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1001 },
    user_id: { type: 'integer', example: 5 },
    customer_email: { type: 'string', format: 'email', example: 'maria@example.com' },
    customer_name: { type: 'string', example: 'María González' },
    customer_phone: { type: 'string', example: '+58 412-1234567' },
    delivery_address: { type: 'string', example: 'Av. Principal, Caracas' },
    delivery_date: { type: 'string', format: 'date', example: '2025-10-05' },
    delivery_time_slot: { type: 'string', example: '10:00-12:00' },
    delivery_notes: { type: 'string', example: 'Llamar al llegar' },
    status: {
      type: 'string',
      enum: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled'],
      example: 'pending'
    },
    total_amount_usd: { type: 'number', format: 'decimal', example: 89.99 },
    total_amount_ves: { type: 'number', format: 'decimal', example: 3599.6 },
    currency_rate: { type: 'number', format: 'decimal', example: 40 },
    notes: { type: 'string', example: 'Ocasión especial' },
    admin_notes: { type: 'string', example: 'Cliente frecuente' },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  }
}

/**
 * Order item schema
 * @swagger
 * components:
 *   schemas:
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
 */
export const ORDER_ITEM_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    order_id: { type: 'integer', example: 1001 },
    product_id: { type: 'integer', example: 67 },
    product_name: { type: 'string', example: 'Ramo Tropical Vibrante' },
    product_summary: { type: 'string', example: 'Flores tropicales vibrantes' },
    unit_price_usd: { type: 'number', format: 'decimal', example: 45.99 },
    unit_price_ves: { type: 'number', format: 'decimal', example: 1839.6 },
    quantity: { type: 'integer', example: 2 },
    subtotal_usd: { type: 'number', format: 'decimal', example: 91.98 },
    subtotal_ves: { type: 'number', format: 'decimal', example: 3679.2 },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  }
}

/**
 * Payment entity schema
 * @swagger
 * components:
 *   schemas:
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
 */
export const PAYMENT_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    order_id: { type: 'integer', example: 1 },
    user_id: { type: 'integer', example: 1 },
    amount_usd: { type: 'number', format: 'decimal', example: 59.99 },
    amount_ves: { type: 'number', format: 'decimal', example: 2400 },
    payment_method_name: { type: 'string', example: 'Bank Transfer' },
    transaction_id: { type: 'string', example: 'TXN123456' },
    reference_number: { type: 'string', example: 'REF789' },
    status: {
      type: 'string',
      enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
      example: 'pending'
    },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  }
}

/**
 * Occasion entity schema
 * @swagger
 * components:
 *   schemas:
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
 */
export const OCCASION_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    name: { type: 'string', example: 'Birthday' },
    description: { type: 'string', example: 'Flowers for birthdays' },
    slug: { type: 'string', example: 'birthday' },
    display_order: { type: 'integer', example: 1 },
    active: { type: 'boolean', example: true },
    created_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' },
    updated_at: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00Z' }
  }
}

/**
 * Product image schema
 * @swagger
 * components:
 *   schemas:
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
 */
export const PRODUCT_IMAGE_SCHEMA = {
  type: 'object',
  properties: {
    id: { type: 'integer', example: 1 },
    product_id: { type: 'integer', example: 67 },
    image_index: { type: 'integer', example: 1 },
    size: {
      type: 'string',
      enum: ['thumb', 'small', 'medium', 'large'],
      example: 'small'
    },
    url: {
      type: 'string',
      format: 'uri',
      example: 'https://abc123.supabase.co/storage/v1/object/public/product-images/67_1_small.webp'
    },
    file_hash: { type: 'string', example: 'abc123def456...' },
    mime_type: { type: 'string', example: 'image/webp' },
    is_primary: { type: 'boolean', example: false },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  }
}

/**
 * Settings entity schema
 * @swagger
 * components:
 *   schemas:
 *     settings:
 *       type: object
 *       properties:
 *         key: { type: string, example: "site_name" }
 *         value: { type: string, example: "FloresYa" }
 *         description: { type: string, example: "Site name for branding" }
 *         is_public: { type: boolean, example: true }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 */
export const SETTINGS_SCHEMA = {
  type: 'object',
  properties: {
    key: { type: 'string', example: 'site_name' },
    value: { type: 'string', example: 'FloresYa' },
    description: { type: 'string', example: 'Site name for branding' },
    is_public: { type: 'boolean', example: true },
    created_at: { type: 'string', format: 'date-time' },
    updated_at: { type: 'string', format: 'date-time' }
  }
}

// ==================== COMMON PARAMETER SCHEMAS ====================

/**
 * Common pagination parameters
 * @swagger
 * components:
 *   parameters:
 *     PaginationParams:
 *       type: object
 *       properties:
 *         limit: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *         offset: { type: integer, minimum: 0, default: 0 }
 *         page: { type: integer, minimum: 1 }
 */
export const PAGINATION_PARAMS_SCHEMA = {
  type: 'object',
  properties: {
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    offset: { type: 'integer', minimum: 0, default: 0 },
    page: { type: 'integer', minimum: 1 }
  }
}

/**
 * ID parameter schema
 * @swagger
 * components:
 *   parameters:
 *     IdParam:
 *       name: id
 *       in: path
 *       required: true
 *       schema: { type: integer, minimum: 1 }
 *       description: Resource ID
 */
export const ID_PARAM_SCHEMA = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer', minimum: 1 },
  description: 'Resource ID'
}

/**
 * Limit parameter schema
 * @swagger
 * components:
 *   parameters:
 *     LimitParam:
 *       name: limit
 *       in: query
 *       schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       description: Number of items to return
 */
export const LIMIT_PARAM_SCHEMA = {
  name: 'limit',
  in: 'query',
  schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
  description: 'Number of items to return'
}

/**
 * Offset parameter schema
 * @swagger
 * components:
 *   parameters:
 *     OffsetParam:
 *       name: offset
 *       in: query
 *       schema: { type: integer, minimum: 0, default: 0 }
 *       description: Number of items to skip
 */
export const OFFSET_PARAM_SCHEMA = {
  name: 'offset',
  in: 'query',
  schema: { type: 'integer', minimum: 0, default: 0 },
  description: 'Number of items to skip'
}

// ==================== REQUEST/RESPONSE SCHEMAS ====================

/**
 * Order status update schema
 * @swagger
 * components:
 *   schemas:
 *     OrderStatusUpdate:
 *       type: object
 *       required: [status]
 *       properties:
 *         status: { type: string, enum: [pending, verified, preparing, shipped, delivered, cancelled], example: "verified" }
 *         notes: { type: string, example: "Payment confirmed" }
 */
export const ORDER_STATUS_UPDATE_SCHEMA = {
  type: 'object',
  required: ['status'],
  properties: {
    status: {
      type: 'string',
      enum: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled'],
      example: 'verified'
    },
    notes: { type: 'string', example: 'Payment confirmed' }
  }
}

/**
 * Payment confirmation schema
 * @swagger
 * components:
 *   schemas:
 *     PaymentConfirm:
 *       type: object
 *       required: [payment_method, reference_number]
 *       properties:
 *         payment_method: { type: string, enum: [cash, mobile_payment, bank_transfer, zelle, crypto], example: "bank_transfer" }
 *         reference_number: { type: string, minLength: 3, maxLength: 100, example: "TF-20231101-001" }
 *         payment_details: { type: object, example: { bank: "Banco Mercantil", payer: "José Pérez" } }
 *         receipt_image_url: { type: string, format: uri, example: "https://example.com/receipt.jpg" }
 */
export const PAYMENT_CONFIRM_SCHEMA = {
  type: 'object',
  required: ['payment_method', 'reference_number'],
  properties: {
    payment_method: {
      type: 'string',
      enum: ['cash', 'mobile_payment', 'bank_transfer', 'zelle', 'crypto'],
      example: 'bank_transfer'
    },
    reference_number: {
      type: 'string',
      minLength: 3,
      maxLength: 100,
      example: 'TF-20231101-001'
    },
    payment_details: {
      type: 'object',
      example: { bank: 'Banco Mercantil', payer: 'José Pérez' }
    },
    receipt_image_url: {
      type: 'string',
      format: 'uri',
      example: 'https://example.com/receipt.jpg'
    }
  }
}

// ==================== COMMON RESPONSE REFERENCES ====================

/**
 * Standard error response references
 * @swagger
 * components:
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
 */
export const ERROR_RESPONSES = {
  UnauthorizedError: {
    description: 'Authentication required',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' }
      }
    }
  },
  ForbiddenError: {
    description: 'Insufficient permissions',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' }
      }
    }
  },
  NotFoundError: {
    description: 'Resource not found',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' }
      }
    }
  },
  ValidationError: {
    description: 'Validation failed',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' }
      }
    }
  },
  InternalServerError: {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ErrorResponse' }
      }
    }
  }
}

// ==================== COMMON PARAMETERS ====================

/**
 * Common parameter definitions
 * @swagger
 * components:
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
export const COMMON_PARAMETERS = {
  IdParam: ID_PARAM_SCHEMA,
  LimitParam: LIMIT_PARAM_SCHEMA,
  OffsetParam: OFFSET_PARAM_SCHEMA
}

// ==================== SUCCESS RESPONSE WRAPPER ====================

/**
 * Creates a standardized success response schema
 * @param {Object} dataSchema - Schema for the data property
 * @param {string} message - Success message
 * @returns {Object} Complete success response schema
 */
export function createSuccessResponse(dataSchema, message = 'Operation completed successfully') {
  return {
    allOf: [
      { $ref: '#/components/schemas/SuccessResponse' },
      {
        type: 'object',
        properties: {
          data: dataSchema,
          message: { type: 'string', example: message }
        }
      }
    ]
  }
}

/**
 * Creates a paginated success response schema
 * @param {Object} itemsSchema - Schema for array items
 * @returns {Object} Paginated response schema
 */
export function createPaginatedResponse(itemsSchema) {
  return {
    allOf: [
      { $ref: '#/components/schemas/SuccessResponse' },
      {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: itemsSchema
          }
        }
      }
    ]
  }
}
