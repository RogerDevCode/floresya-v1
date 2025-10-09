#!/usr/bin/env node

/**
 * OpenAPI Specification Auto-Generator
 * Generates OpenAPI 3.1 specification from JSDoc annotations
 * Validates contract compliance and generates documentation
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import swaggerJsdoc from 'swagger-jsdoc'
import yaml from 'js-yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Generate OpenAPI specification from JSDoc annotations
 */
async function generateOpenApiSpec() {
  try {
    console.log('🚀 Starting OpenAPI specification generation...')

    // Configuration for swagger-jsdoc
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
              description: 'JWT token authentication'
            }
          },
          schemas: {
            // Standard response wrapper
            SuccessResponse: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                data: { type: 'object', description: 'Response data' },
                message: { type: 'string', example: 'Operation completed successfully' }
              }
            },
            ErrorResponse: {
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
            },
            // Domain models
            user: {
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
            product: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                name: { type: 'string', example: 'Red Roses Bouquet' },
                summary: { type: 'string', example: 'Dozen red roses', nullable: true },
                description: { type: 'string', example: 'Beautiful red roses', nullable: true },
                price_usd: { type: 'number', format: 'decimal', example: 29.99 },
                price_ves: { type: 'number', format: 'decimal', example: 1200.0, nullable: true },
                stock: { type: 'integer', example: 50 },
                sku: { type: 'string', example: 'ROSE-RED-001', nullable: true },
                featured: { type: 'boolean', example: true },
                carousel_order: { type: 'integer', example: 1, nullable: true },
                active: { type: 'boolean', example: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
              }
            },
            occasion: {
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
            productimage: {
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
                  example:
                    'https://abc123.supabase.co/storage/v1/object/public/product-images/67_1_small.webp'
                },
                file_hash: { type: 'string', example: 'abc123def456...' },
                mime_type: { type: 'string', example: 'image/webp' },
                is_primary: { type: 'boolean', example: false },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
              }
            },
            order: {
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
                currency_rate: { type: 'number', format: 'decimal', example: 40.0 },
                notes: { type: 'string', example: 'Ocasión especial' },
                admin_notes: { type: 'string', example: 'Cliente frecuente' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
              }
            },
            OrderItem: {
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
            },
            OrderStatusHistory: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                order_id: { type: 'integer', example: 1001 },
                old_status: {
                  type: 'string',
                  enum: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled'],
                  example: 'pending'
                },
                new_status: {
                  type: 'string',
                  enum: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled'],
                  example: 'verified'
                },
                notes: { type: 'string', example: 'Pago verificado' },
                changed_by: { type: 'integer', example: 1 },
                created_at: { type: 'string', format: 'date-time' }
              }
            },
            payment: {
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
            settings: {
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
            },
            OrderStatusUpdate: {
              type: 'object',
              required: ['status'],
              properties: {
                status: {
                  type: 'string',
                  enum: ['pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled'],
                  example: 'verified'
                },
                notes: {
                  type: 'string',
                  example: 'Payment confirmed'
                }
              }
            },
            PaymentConfirm: {
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
            },
            OrderCreate: {
              type: 'object',
              required: ['order', 'items'],
              properties: {
                order: {
                  type: 'object',
                  required: [
                    'customer_email',
                    'customer_name',
                    'delivery_address',
                    'total_amount_usd'
                  ],
                  properties: {
                    customer_email: { type: 'string', format: 'email' },
                    customer_name: { type: 'string', minLength: 2, maxLength: 255 },
                    customer_phone: { type: 'string', pattern: '^\\+?[\\d\\s-()]+$' },
                    delivery_address: { type: 'string', minLength: 10, maxLength: 500 },
                    delivery_date: { type: 'string', format: 'date' },
                    delivery_time_slot: {
                      type: 'string',
                      pattern: '^\\d{2}:\\d{2}-\\d{2}:\\d{2}$'
                    },
                    delivery_notes: { type: 'string', maxLength: 1000 },
                    total_amount_usd: { type: 'number', minimum: 0 },
                    total_amount_ves: { type: 'number', minimum: 0 },
                    currency_rate: { type: 'number', minimum: 0 },
                    status: {
                      type: 'string',
                      enum: [
                        'pending',
                        'verified',
                        'preparing',
                        'shipped',
                        'delivered',
                        'cancelled'
                      ]
                    },
                    notes: { type: 'string', maxLength: 1000 }
                  }
                },
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['product_id', 'product_name', 'unit_price_usd', 'quantity'],
                    properties: {
                      product_id: { type: 'integer', minimum: 1 },
                      product_name: { type: 'string', minLength: 1 },
                      product_summary: { type: 'string' },
                      unit_price_usd: { type: 'number', minimum: 0 },
                      unit_price_ves: { type: 'number', minimum: 0 },
                      quantity: { type: 'integer', minimum: 1 },
                      subtotal_usd: { type: 'number', minimum: 0 },
                      subtotal_ves: { type: 'number', minimum: 0 }
                    }
                  }
                }
              }
            }
          },
          responses: {
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
      apis: ['./api/docs/openapi-annotations.js', './api/controllers/*.js', './api/routes/*.js']
    }

    // Generate the OpenAPI specification
    console.log('📝 Generating OpenAPI specification from JSDoc annotations...')
    const swaggerSpec = swaggerJsdoc(options)

    // Validate the generated specification
    if (!swaggerSpec || !swaggerSpec.paths) {
      throw new Error('Failed to generate OpenAPI specification - no paths found')
    }

    // Save as JSON
    const jsonPath = path.join(__dirname, '../api/docs/openapi-spec.json')
    await fs.writeFile(jsonPath, JSON.stringify(swaggerSpec, null, 2))
    console.log(`✅ OpenAPI JSON specification saved to: ${jsonPath}`)

    // Save as YAML
    const yamlPath = path.join(__dirname, '../api/docs/openapi-spec.yaml')
    const yamlSpec = yaml.dump(swaggerSpec, {
      indent: 2,
      lineWidth: -1,
      noRefs: false,
      sortKeys: false
    })
    await fs.writeFile(yamlPath, yamlSpec)
    console.log(`✅ OpenAPI YAML specification saved to: ${yamlPath}`)

    // Generate summary report
    const summary = {
      timestamp: new Date().toISOString(),
      version: swaggerSpec.info.version,
      endpoints: Object.keys(swaggerSpec.paths).length,
      schemas: Object.keys(swaggerSpec.components?.schemas || {}).length,
      tags: swaggerSpec.tags?.length || 0,
      generation: {
        success: true,
        files: {
          json: jsonPath,
          yaml: yamlPath
        }
      }
    }

    const summaryPath = path.join(__dirname, '../api/docs/generation-summary.json')
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2))
    console.log(`📊 Generation summary saved to: ${summaryPath}`)

    console.log('\n🎉 OpenAPI specification generation completed successfully!')
    console.log(`📋 Generated ${summary.endpoints} endpoints`)
    console.log(`🏷️  Found ${summary.schemas} schemas`)
    console.log(`🏷️  Organized in ${summary.tags} categories`)

    return summary
  } catch (error) {
    console.error('❌ Failed to generate OpenAPI specification:', error)
    throw error
  }
}

/**
 * Validate contract compliance
 */
async function validateContractCompliance() {
  try {
    console.log('\n🔍 Validating contract compliance...')

    // Check if generated files exist and are valid
    const jsonPath = path.join(__dirname, '../api/docs/openapi-spec.json')
    const yamlPath = path.join(__dirname, '../api/docs/openapi-spec.yaml')

    try {
      await fs.access(jsonPath)
      await fs.access(yamlPath)
      console.log('✅ Generated specification files exist')
    } catch (_error) {
      throw new Error('Generated specification files not found')
    }

    // Validate JSON structure
    const jsonContent = await fs.readFile(jsonPath, 'utf8')
    const spec = JSON.parse(jsonContent)

    if (!spec.openapi || !spec.info || !spec.paths) {
      throw new Error('Invalid OpenAPI specification structure')
    }

    console.log('✅ OpenAPI specification structure is valid')

    // Check for common issues
    const issues = []

    // Check if all endpoints have proper responses
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (
          method !== 'parameters' &&
          (!operation.responses || Object.keys(operation.responses).length === 0)
        ) {
          issues.push(`Endpoint ${method.toUpperCase()} ${path} missing response definitions`)
        }
      }
    }

    if (issues.length > 0) {
      console.warn('⚠️  Found potential issues:')
      issues.forEach(issue => console.warn(`   - ${issue}`))
    } else {
      console.log('✅ No contract compliance issues found')
    }

    return { valid: true, issues }
  } catch (error) {
    console.error('❌ Contract validation failed:', error)
    return { valid: false, error: error.message }
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Generate OpenAPI specification
    const _summary = await generateOpenApiSpec()

    // Validate contract compliance
    const validation = await validateContractCompliance()

    // Exit with appropriate code
    if (validation.valid) {
      console.log('\n🎯 OpenAPI automation completed successfully!')
      process.exit(0)
    } else {
      console.error('\n❌ OpenAPI automation completed with errors')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n💥 OpenAPI automation failed:', error)
    process.exit(1)
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { generateOpenApiSpec, validateContractCompliance }
