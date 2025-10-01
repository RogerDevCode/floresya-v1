/**
 * OpenAPI 3.1 Configuration
 * Auto-generates API documentation from JSDoc comments
 */

import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'FloresYa API',
      version: '1.0.0',
      description: 'E-commerce API for flower delivery - Built with KISS principles',
      contact: {
        name: 'FloresYa Team',
        email: 'support@floresya.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://floresya.vercel.app',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Simulated JWT token (format: Bearer user:ID:ROLE) - TODO: Implement real JWT'
        }
      },
      schemas: {
        // Standard response wrapper
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Error message'
            },
            message: {
              type: 'string',
              example: 'Operation failed'
            },
            details: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Validation errors (if applicable)'
            }
          }
        },
        // Domain models
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            full_name: { type: 'string', example: 'John Doe' },
            phone: { type: 'string', example: '+1234567890' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            email_verified: { type: 'boolean', example: false },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Occasion: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Birthday' },
            description: { type: 'string', example: 'Flowers for birthdays' },
            slug: { type: 'string', example: 'birthday' },
            display_order: { type: 'integer', example: 1 },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Red Roses Bouquet' },
            description: { type: 'string', example: 'Beautiful red roses' },
            price_usd: { type: 'number', format: 'decimal', example: 29.99 },
            price_ves: { type: 'number', format: 'decimal', example: 1200.0 },
            stock: { type: 'integer', example: 50 },
            sku: { type: 'string', example: 'ROSE-RED-001' },
            featured: { type: 'boolean', example: true },
            carousel_order: { type: 'integer', example: 1 },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        ProductImage: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            product_id: { type: 'integer', example: 67 },
            image_index: { type: 'integer', example: 1 },
            size: { type: 'string', enum: ['thumb', 'small', 'medium', 'large'], example: 'small' },
            url: {
              type: 'string',
              format: 'uri',
              example:
                'https://abc123.supabase.co/storage/v1/object/public/product-images/67_1_small.webp'
            },
            file_hash: { type: 'string', example: 'abc123def456...' },
            mime_type: { type: 'string', example: 'image/webp' },
            is_primary: { type: 'boolean', example: false },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            customer_name: { type: 'string', example: 'John Doe' },
            customer_email: { type: 'string', format: 'email', example: 'john@example.com' },
            customer_phone: { type: 'string', example: '+1234567890' },
            delivery_address: { type: 'string', example: '123 Main St, City' },
            delivery_date: { type: 'string', format: 'date' },
            delivery_notes: { type: 'string', example: 'Leave at door' },
            status: {
              type: 'string',
              enum: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled'],
              example: 'pending'
            },
            total_amount_usd: { type: 'number', format: 'decimal', example: 59.99 },
            total_amount_ves: { type: 'number', format: 'decimal', example: 2400.0 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Payment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            order_id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            amount_usd: { type: 'number', format: 'decimal', example: 59.99 },
            amount_ves: { type: 'number', format: 'decimal', example: 2400.0 },
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
        },
        Setting: {
          type: 'object',
          properties: {
            key: { type: 'string', example: 'site_name' },
            value: { type: 'string', example: 'FloresYa' },
            description: { type: 'string', example: 'Site name for branding' },
            is_public: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        // Common query parameters
        PaginationParams: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
            offset: { type: 'integer', minimum: 0, default: 0 },
            page: { type: 'integer', minimum: 1 }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: 'No authorization token provided',
                message: 'No authorization token provided'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: 'Insufficient permissions',
                message: 'Insufficient permissions'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: 'Resource not found',
                message: 'Resource not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: 'Validation failed',
                message: 'Validation failed',
                details: ['name is required', 'email must be valid']
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: {
                success: false,
                error: 'Internal server error',
                message: 'Internal server error'
              }
            }
          }
        }
      },
      parameters: {
        IdParam: {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer', minimum: 1 },
          description: 'Resource ID'
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Number of items to return'
        },
        OffsetParam: {
          name: 'offset',
          in: 'query',
          schema: { type: 'integer', minimum: 0, default: 0 },
          description: 'Number of items to skip'
        },
        PageParam: {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', minimum: 1 },
          description: 'Page number (alternative to offset)'
        }
      }
    },
    tags: [
      { name: 'Products', description: 'Product management endpoints' },
      { name: 'Orders', description: 'Order management endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Payments', description: 'Payment management endpoints' },
      { name: 'Occasions', description: 'Occasion management endpoints' },
      { name: 'Settings', description: 'Settings management endpoints' }
    ]
  },
  apis: ['./api/docs/openapi-annotations.js']
}

export const swaggerSpec = swaggerJsdoc(options)
