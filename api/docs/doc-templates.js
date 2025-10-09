/**
 * Documentation Templates for OpenAPI Annotations
 * Reusable template functions for generating consistent documentation
 */

// ==================== TEMPLATE FUNCTIONS ====================

/**
 * Generates standard CRUD endpoint documentation
 * @param {string} resource - Resource name (e.g., 'products', 'orders')
 * @param {string} operation - Operation type ('create', 'read', 'update', 'delete')
 * @param {Object} options - Configuration options
 * @returns {string} JSDoc comment string
 */
export function generateCRUDEndpoint(resource, operation, options = {}) {
  const {
    method = 'get',
    path = `/api/${resource}`,
    summary = `${operation} ${resource}`,
    description = `${operation} ${resource}`,
    tags = [resource.charAt(0).toUpperCase() + resource.slice(1)],
    parameters = [],
    requestBody = null,
    responses = {},
    security = []
  } = options

  let doc = `/**
 * @swagger
 * ${path}:
 *   ${method}:
 *     tags: [${tags.join(', ')}]
 *     summary: ${summary}`

  if (description) {
    doc += `\n *     description: ${description}`
  }

  if (security.length > 0) {
    doc += `\n *     security:
 *       - bearerAuth: []`
  }

  if (parameters.length > 0) {
    doc += `\n *     parameters:`
    parameters.forEach(param => {
      doc += `\n *       - ${typeof param === 'string' ? param : formatParameter(param)}`
    })
  }

  if (requestBody) {
    doc += `\n *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             ${formatSchema(requestBody)}`
  }

  doc += `\n *     responses:`
  Object.entries(responses).forEach(([status, response]) => {
    doc += `\n *       ${status}:
 *         ${typeof response === 'string' ? response : formatResponse(response)}`
  })

  doc += `\n */`

  return doc
}

/**
 * Generates list/get all endpoint documentation
 * @param {string} resource - Resource name
 * @param {Object} options - Configuration options
 * @returns {string} JSDoc comment string
 */
export function generateListEndpoint(resource, options = {}) {
  const {
    path = `/api/${resource}`,
    description = `Returns paginated list of ${resource}`,
    parameters = [
      { $ref: '#/components/parameters/LimitParam' },
      { $ref: '#/components/parameters/OffsetParam' }
    ],
    responses = {
      200: {
        description: `${resource} retrieved successfully`,
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/SuccessResponse' },
                {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: `#/components/schemas/${resource.slice(0, -1)}` }
                    }
                  }
                }
              ]
            }
          }
        }
      },
      400: { $ref: '#/components/responses/ValidationError' },
      500: { $ref: '#/components/responses/InternalServerError' }
    }
  } = options

  return generateCRUDEndpoint(resource, 'list', {
    method: 'get',
    path,
    summary: `Get all ${resource}`,
    description,
    parameters,
    responses
  })
}

/**
 * Generates get by ID endpoint documentation
 * @param {string} resource - Resource name
 * @param {Object} options - Configuration options
 * @returns {string} JSDoc comment string
 */
export function generateGetByIdEndpoint(resource, options = {}) {
  const {
    path = `/api/${resource}/{id}`,
    description = `Returns ${resource.slice(0, -1)} details`,
    parameters = [{ $ref: '#/components/parameters/IdParam' }],
    responses = {
      200: {
        description: `${resource.slice(0, -1)} retrieved successfully`,
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/SuccessResponse' },
                {
                  type: 'object',
                  properties: {
                    data: { $ref: `#/components/schemas/${resource.slice(0, -1)}` }
                  }
                }
              ]
            }
          }
        }
      },
      404: { $ref: '#/components/responses/NotFoundError' },
      500: { $ref: '#/components/responses/InternalServerError' }
    }
  } = options

  return generateCRUDEndpoint(resource, 'get', {
    method: 'get',
    path,
    summary: `Get ${resource.slice(0, -1)} by ID`,
    description,
    parameters,
    responses
  })
}

/**
 * Generates create endpoint documentation
 * @param {string} resource - Resource name
 * @param {Object} options - Configuration options
 * @returns {string} JSDoc comment string
 */
export function generateCreateEndpoint(resource, options = {}) {
  const {
    path = `/api/${resource}`,
    description = `Creates a new ${resource.slice(0, -1)}`,
    requestBody = {},
    responses = {
      201: {
        description: `${resource.slice(0, -1)} created successfully`,
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/SuccessResponse' },
                {
                  type: 'object',
                  properties: {
                    data: { $ref: `#/components/schemas/${resource.slice(0, -1)}` }
                  }
                }
              ]
            }
          }
        }
      },
      400: { $ref: '#/components/responses/ValidationError' },
      401: { $ref: '#/components/responses/UnauthorizedError' },
      403: { $ref: '#/components/responses/ForbiddenError' }
    },
    security = [{ bearerAuth: [] }]
  } = options

  return generateCRUDEndpoint(resource, 'create', {
    method: 'post',
    path,
    summary: `Create new ${resource.slice(0, -1)}`,
    description,
    requestBody,
    responses,
    security
  })
}

/**
 * Generates update endpoint documentation
 * @param {string} resource - Resource name
 * @param {Object} options - Configuration options
 * @returns {string} JSDoc comment string
 */
export function generateUpdateEndpoint(resource, options = {}) {
  const {
    path = `/api/${resource}/{id}`,
    description = `Updates ${resource.slice(0, -1)} fields`,
    requestBody = {},
    responses = {
      200: {
        description: `${resource.slice(0, -1)} updated successfully`,
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/SuccessResponse' },
                {
                  type: 'object',
                  properties: {
                    data: { $ref: `#/components/schemas/${resource.slice(0, -1)}` }
                  }
                }
              ]
            }
          }
        }
      },
      400: { $ref: '#/components/responses/ValidationError' },
      401: { $ref: '#/components/responses/UnauthorizedError' },
      403: { $ref: '#/components/responses/ForbiddenError' },
      404: { $ref: '#/components/responses/NotFoundError' }
    },
    security = [{ bearerAuth: [] }]
  } = options

  return generateCRUDEndpoint(resource, 'update', {
    method: 'put',
    path,
    summary: `Update ${resource.slice(0, -1)}`,
    description,
    parameters: [{ $ref: '#/components/parameters/IdParam' }],
    requestBody,
    responses,
    security
  })
}

/**
 * Generates delete endpoint documentation
 * @param {string} resource - Resource name
 * @param {Object} options - Configuration options
 * @returns {string} JSDoc comment string
 */
export function generateDeleteEndpoint(resource, options = {}) {
  const {
    path = `/api/${resource}/{id}`,
    description = `Deletes a ${resource.slice(0, -1)}`,
    responses = {
      200: {
        description: `${resource.slice(0, -1)} deleted successfully`
      },
      401: { $ref: '#/components/responses/UnauthorizedError' },
      403: { $ref: '#/components/responses/ForbiddenError' },
      404: { $ref: '#/components/responses/NotFoundError' }
    },
    security = [{ bearerAuth: [] }]
  } = options

  return generateCRUDEndpoint(resource, 'delete', {
    method: 'delete',
    path,
    summary: `Delete ${resource.slice(0, -1)}`,
    description,
    parameters: [{ $ref: '#/components/parameters/IdParam' }],
    responses,
    security
  })
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Formats a parameter object for JSDoc
 * @param {Object} param - Parameter object
 * @returns {string} Formatted parameter string
 */
function formatParameter(param) {
  if (typeof param === 'string') {
    return param
  }

  if (param.$ref) {
    return param.$ref
  }

  let paramStr = `${param.name}:\n *         in: ${param.in}\n *         schema: ${formatSchema(param.schema)}`

  if (param.description) {
    paramStr += `\n *         description: ${param.description}`
  }

  if (param.required) {
    paramStr += `\n *         required: ${param.required}`
  }

  return paramStr
}

/**
 * Formats a schema object for JSDoc
 * @param {Object} schema - Schema object
 * @returns {string} Formatted schema string
 */
function formatSchema(schema) {
  if (typeof schema === 'string') {
    return schema
  }

  if (schema.$ref) {
    return schema.$ref
  }

  if (schema.allOf) {
    return `allOf:\n *               ${schema.allOf.map(ref => ref.$ref || JSON.stringify(ref)).join('\n *               ')}`
  }

  let schemaStr = ''

  if (schema.type) {
    schemaStr += `type: ${schema.type}`
  }

  if (schema.required) {
    schemaStr += `\n *             required: [${schema.required.join(', ')}]`
  }

  if (schema.properties) {
    schemaStr += `\n *             properties:`
    Object.entries(schema.properties).forEach(([key, value]) => {
      schemaStr += `\n *               ${key}: ${formatSchema(value)}`
    })
  }

  return schemaStr
}

/**
 * Formats a response object for JSDoc
 * @param {Object|string} response - Response object or string
 * @returns {string} Formatted response string
 */
function formatResponse(response) {
  if (typeof response === 'string') {
    return response
  }

  if (response.$ref) {
    return response.$ref
  }

  let responseStr = ''

  if (response.description) {
    responseStr += `description: ${response.description}`
  }

  if (response.content) {
    responseStr += `\n *         content:`
    Object.entries(response.content).forEach(([contentType, content]) => {
      responseStr += `\n *           ${contentType}:`
      if (content.schema) {
        responseStr += `\n *             schema: ${formatSchema(content.schema)}`
      }
    })
  }

  return responseStr
}

// ==================== COMMON PARAMETER TEMPLATES ====================

/**
 * Common filter parameters for list endpoints
 */
export const COMMON_FILTER_PARAMETERS = {
  search: {
    name: 'search',
    in: 'query',
    schema: { type: 'string' },
    description: 'Search in relevant fields (accent-insensitive, uses indexed normalized columns)'
  },
  featured: {
    name: 'featured',
    in: 'query',
    schema: { type: 'boolean' },
    description: 'Filter by featured items'
  },
  status: {
    name: 'status',
    in: 'query',
    schema: { type: 'string' },
    description: 'Filter by status'
  },
  sortBy: {
    name: 'sortBy',
    in: 'query',
    schema: { type: 'string' },
    description: 'Sort field with direction'
  }
}

/**
 * Common image size parameter
 */
export const IMAGE_SIZE_PARAMETER = {
  name: 'imageSize',
  in: 'query',
  schema: {
    type: 'string',
    enum: ['thumb', 'small', 'medium', 'large']
  },
  description: 'Include items with specific image size'
}

/**
 * Common slug parameter
 */
export const SLUG_PARAMETER = {
  name: 'slug',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: 'Resource slug'
}

// ==================== COMMON RESPONSE TEMPLATES ====================

/**
 * Standard admin-only endpoint responses
 */
export const ADMIN_RESPONSES = {
  200: { description: 'Operation completed successfully' },
  401: { $ref: '#/components/responses/UnauthorizedError' },
  403: { $ref: '#/components/responses/ForbiddenError' },
  404: { $ref: '#/components/responses/NotFoundError' },
  400: { $ref: '#/components/responses/ValidationError' },
  500: { $ref: '#/components/responses/InternalServerError' }
}

/**
 * Standard public endpoint responses
 */
export const PUBLIC_RESPONSES = {
  200: { description: 'Operation completed successfully' },
  400: { $ref: '#/components/responses/ValidationError' },
  404: { $ref: '#/components/responses/NotFoundError' },
  500: { $ref: '#/components/responses/InternalServerError' }
}

/**
 * Standard authenticated endpoint responses
 */
export const AUTHENTICATED_RESPONSES = {
  200: { description: 'Operation completed successfully' },
  401: { $ref: '#/components/responses/UnauthorizedError' },
  400: { $ref: '#/components/responses/ValidationError' },
  500: { $ref: '#/components/responses/InternalServerError' }
}

// ==================== SPECIALIZED TEMPLATES ====================

/**
 * Generates product-specific endpoint documentation
 * @param {string} operation - Operation type
 * @param {Object} options - Configuration options
 * @returns {string} JSDoc comment string
 */
export function generateProductEndpoint(operation, options = {}) {
  const baseOptions = {
    tags: ['Products'],
    ...options
  }

  switch (operation) {
    case 'list':
      return generateListEndpoint('products', {
        ...baseOptions,
        parameters: [
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/OffsetParam' },
          COMMON_FILTER_PARAMETERS.featured,
          COMMON_FILTER_PARAMETERS.search,
          COMMON_FILTER_PARAMETERS.sortBy,
          IMAGE_SIZE_PARAMETER,
          COMMON_FILTER_PARAMETERS.occasion
        ]
      })

    case 'getById':
      return generateGetByIdEndpoint('products', {
        ...baseOptions,
        parameters: [{ $ref: '#/components/parameters/IdParam' }, IMAGE_SIZE_PARAMETER]
      })

    case 'create':
      return generateCreateEndpoint('products', baseOptions)

    case 'update':
      return generateUpdateEndpoint('products', baseOptions)

    case 'delete':
      return generateDeleteEndpoint('products', {
        ...baseOptions,
        description: 'Admin only - Deactivates product (soft-delete)'
      })

    default:
      return generateCRUDEndpoint('products', operation, baseOptions)
  }
}

/**
 * Generates order-specific endpoint documentation
 * @param {string} operation - Operation type
 * @param {Object} options - Configuration options
 * @returns {string} JSDoc comment string
 */
export function generateOrderEndpoint(operation, options = {}) {
  const baseOptions = {
    tags: ['Orders'],
    ...options
  }

  switch (operation) {
    case 'list':
      return generateListEndpoint('orders', {
        ...baseOptions,
        description: 'Admin only - Returns paginated list of orders with optional filters',
        parameters: [
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/OffsetParam' },
          COMMON_FILTER_PARAMETERS.status,
          {
            name: 'user_id',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filter by user ID'
          },
          {
            name: 'date_from',
            in: 'query',
            schema: { type: 'string', format: 'date-time' },
            description: 'Filter orders from date'
          },
          {
            name: 'date_to',
            in: 'query',
            schema: { type: 'string', format: 'date-time' },
            description: 'Filter orders to date'
          },
          COMMON_FILTER_PARAMETERS.search
        ],
        security: [{ bearerAuth: [] }]
      })

    case 'getById':
      return generateGetByIdEndpoint('orders', {
        ...baseOptions,
        description: 'Owner or admin - Returns order details with order_items',
        security: [{ bearerAuth: [] }]
      })

    case 'create':
      return generateCRUDEndpoint('orders', 'create', {
        ...baseOptions,
        summary: 'Create order (atomic)',
        description: 'Public - Creates order with items in single transaction (checkout process)',
        requestBody: {
          type: 'object',
          required: ['order', 'items'],
          properties: {
            order: {
              type: 'object',
              required: [
                'customer_email',
                'customer_name',
                'customer_phone',
                'delivery_address',
                'total_amount_usd'
              ],
              properties: {
                customer_email: { type: 'string', format: 'email' },
                customer_name: { type: 'string', minLength: 2, maxLength: 255 },
                customer_phone: { type: 'string', minLength: 7, maxLength: 20 },
                delivery_address: { type: 'string', minLength: 10, maxLength: 500 },
                delivery_date: { type: 'string', format: 'date' },
                delivery_time_slot: { type: 'string', maxLength: 100 },
                delivery_notes: { type: 'string', maxLength: 500 },
                total_amount_usd: { type: 'number', minimum: 0 },
                total_amount_ves: { type: 'number', minimum: 0 },
                currency_rate: { type: 'number', minimum: 0 },
                status: {
                  type: 'string',
                  enum: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled'],
                  default: 'pending'
                },
                notes: { type: 'string', maxLength: 1000 }
              }
            },
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['product_id', 'product_name', 'unit_price_usd', 'quantity'],
                properties: {
                  product_id: { type: 'integer' },
                  product_name: { type: 'string' },
                  product_summary: { type: 'string' },
                  unit_price_usd: { type: 'number' },
                  unit_price_ves: { type: 'number' },
                  quantity: { type: 'integer', minimum: 1 },
                  subtotal_usd: { type: 'number' },
                  subtotal_ves: { type: 'number' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Order created successfully',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: { $ref: '#/components/schemas/order' }
                      }
                    }
                  ]
                }
              }
            }
          },
          401: { $ref: '#/components/responses/UnauthorizedError' },
          400: { $ref: '#/components/responses/ValidationError' }
        }
      })

    default:
      return generateCRUDEndpoint('orders', operation, baseOptions)
  }
}

/**
 * Generates user-specific endpoint documentation
 * @param {string} operation - Operation type
 * @param {Object} options - Configuration options
 * @returns {string} JSDoc comment string
 */
export function generateUserEndpoint(operation, options = {}) {
  const baseOptions = {
    tags: ['Users'],
    ...options
  }

  switch (operation) {
    case 'list':
      return generateListEndpoint('users', {
        ...baseOptions,
        description: 'Admin only - Returns paginated list of all users',
        parameters: [
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/OffsetParam' },
          {
            name: 'role',
            in: 'query',
            schema: { type: 'string', enum: ['user', 'admin'] },
            description: 'Filter by user role'
          },
          {
            name: 'email_verified',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter by email verification status'
          },
          COMMON_FILTER_PARAMETERS.search
        ],
        security: [{ bearerAuth: [] }]
      })

    case 'getById':
      return generateGetByIdEndpoint('users', {
        ...baseOptions,
        description: 'Owner or admin - Returns user details',
        security: [{ bearerAuth: [] }]
      })

    case 'create':
      return generateCRUDEndpoint('users', 'create', {
        ...baseOptions,
        summary: 'Create user (public registration)',
        description: 'Public endpoint for user registration',
        requestBody: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
            full_name: { type: 'string', minLength: 2, maxLength: 255 },
            phone: { type: 'string', pattern: '^\\+?[\\d\\s\\-()]+$' },
            password_hash: { type: 'string' }
          }
        },
        responses: {
          201: { description: 'User created successfully' },
          400: { $ref: '#/components/responses/ValidationError' }
        }
      })

    default:
      return generateCRUDEndpoint('users', operation, baseOptions)
  }
}

/**
 * Generates payment-specific endpoint documentation
 * @param {string} operation - Operation type
 * @param {Object} options - Configuration options
 * @returns {string} JSDoc comment string
 */
export function generatePaymentEndpoint(operation, options = {}) {
  const baseOptions = {
    tags: ['Payments'],
    ...options
  }

  switch (operation) {
    case 'list':
      return generateListEndpoint('payments', {
        ...baseOptions,
        description: 'Admin only - Returns paginated list of payments with optional filters',
        parameters: [
          { $ref: '#/components/parameters/LimitParam' },
          { $ref: '#/components/parameters/OffsetParam' },
          COMMON_FILTER_PARAMETERS.status,
          {
            name: 'order_id',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filter by order ID'
          },
          {
            name: 'payment_method_id',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filter by payment method'
          },
          {
            name: 'user_id',
            in: 'query',
            schema: { type: 'integer' },
            description: 'Filter by user ID'
          }
        ],
        security: [{ bearerAuth: [] }]
      })

    case 'create':
      return generateCRUDEndpoint('payments', 'create', {
        ...baseOptions,
        summary: 'Create payment',
        description: 'Authenticated - Creates payment record',
        security: [{ bearerAuth: [] }],
        requestBody: {
          type: 'object',
          required: ['order_id', 'amount_usd', 'payment_method_name'],
          properties: {
            order_id: { type: 'integer' },
            amount_usd: { type: 'number', minimum: 0 },
            amount_ves: { type: 'number' },
            payment_method_name: { type: 'string' },
            transaction_id: { type: 'string' },
            reference_number: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded']
            }
          }
        },
        responses: {
          201: { description: 'Payment created successfully' },
          401: { $ref: '#/components/responses/UnauthorizedError' }
        }
      })

    default:
      return generateCRUDEndpoint('payments', operation, baseOptions)
  }
}

/**
 * Generates occasion-specific endpoint documentation
 * @param {string} operation - Operation type
 * @param {Object} options - Configuration options
 * @returns {string} JSDoc comment string
 */
export function generateOccasionEndpoint(operation, options = {}) {
  const baseOptions = {
    tags: ['Occasions'],
    ...options
  }

  switch (operation) {
    case 'list':
      return generateListEndpoint('occasions', {
        ...baseOptions,
        description: 'Public - Returns all active occasions'
      })

    case 'getBySlug':
      return generateCRUDEndpoint('occasions', 'get', {
        ...baseOptions,
        path: '/api/occasions/slug/{slug}',
        summary: 'Get occasion by slug',
        description: 'Public - Returns occasion by slug (SEO-friendly)',
        parameters: [SLUG_PARAMETER]
      })

    case 'create':
      return generateCreateEndpoint('occasions', {
        ...baseOptions,
        requestBody: {
          type: 'object',
          required: ['name', 'slug'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 100 },
            description: { type: 'string' },
            slug: { type: 'string', pattern: '^[a-z0-9-]+$' },
            display_order: { type: 'integer', minimum: 0 }
          }
        }
      })

    default:
      return generateCRUDEndpoint('occasions', operation, baseOptions)
  }
}

/**
 * Generates settings-specific endpoint documentation
 * @param {string} operation - Operation type
 * @param {Object} options - Configuration options
 * @returns {string} JSDoc comment string
 */
export function generateSettingsEndpoint(operation, options = {}) {
  const baseOptions = {
    tags: ['Settings'],
    ...options
  }

  switch (operation) {
    case 'getPublic':
      return generateCRUDEndpoint('settings', 'get', {
        ...baseOptions,
        path: '/api/settings/public',
        summary: 'Get public settings',
        description: 'Public - Returns public settings only'
      })

    case 'getMap':
      return generateCRUDEndpoint('settings', 'get', {
        ...baseOptions,
        path: '/api/settings/map',
        summary: 'Get settings map',
        description: 'Public - Returns settings as key-value map'
      })

    case 'getByKey':
      return generateCRUDEndpoint('settings', 'get', {
        ...baseOptions,
        path: '/api/settings/{key}/value',
        summary: 'Get setting value by key',
        description: 'Public - Returns single setting value by key',
        parameters: [
          {
            name: 'key',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Setting key'
          }
        ]
      })

    case 'list':
      return generateListEndpoint('settings', {
        ...baseOptions,
        description: 'Admin only - Returns all settings',
        security: [{ bearerAuth: [] }]
      })

    case 'create':
      return generateCreateEndpoint('settings', {
        ...baseOptions,
        requestBody: {
          type: 'object',
          required: ['key', 'value'],
          properties: {
            key: { type: 'string', pattern: '^[a-z0-9_]+$' },
            value: { type: 'string' },
            description: { type: 'string' },
            is_public: { type: 'boolean' }
          }
        }
      })

    default:
      return generateCRUDEndpoint('settings', operation, baseOptions)
  }
}
