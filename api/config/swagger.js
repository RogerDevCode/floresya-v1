/**
 * OpenAPI 3.1 Configuration
 * Auto-generates API documentation from JSDoc comments
 */

import swaggerJsdoc from 'swagger-jsdoc'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to load OpenAPI spec from generated file
function loadSwaggerSpec() {
  try {
    const specPath = path.join(__dirname, '../docs/openapi-spec.json')
    console.log('Loading OpenAPI spec from:', specPath)
    if (fs.existsSync(specPath)) {
      const specContent = fs.readFileSync(specPath, 'utf8')
      const spec = JSON.parse(specContent)
      console.log(
        'Successfully loaded OpenAPI spec with',
        Object.keys(spec.components?.schemas || {}).length,
        'schemas'
      )
      console.log('Available schemas:', Object.keys(spec.components?.schemas || {}))
      // Force reload by adding timestamp
      spec._loadedAt = new Date().toISOString()
      return spec
    } else {
      console.warn('Generated OpenAPI spec file not found at:', specPath)
    }
  } catch (error) {
    console.warn(
      'Failed to load generated OpenAPI spec, falling back to basic config:',
      error.message
    )
  }

  // Fallback to basic configuration if generated spec is not available
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

  return swaggerJsdoc(options)
}

// Export the spec - this will be loaded dynamically
export const swaggerSpec = loadSwaggerSpec()
