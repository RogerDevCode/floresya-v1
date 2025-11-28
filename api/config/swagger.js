/**
 * Procesado por B
 */

/**
 * OpenAPI 3.1 Configuration
 * Auto-generates API documentation from JSDoc comments
 */

import swaggerJsdoc from 'swagger-jsdoc'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, existsSync } from 'fs'
import yaml from 'js-yaml'
import { logger } from '../utils/logger.js'
// Import OpenAPI annotations to ensure they're loaded
import '../docs/openapi-annotations.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Function to load OpenAPI spec from generated file
function loadSwaggerSpec() {
  try {
    const specPath = join(__dirname, '../docs/openapi-spec.json')
    logger.info('Loading OpenAPI spec from:', specPath)
    if (existsSync(specPath)) {
      const specContent = readFileSync(specPath, 'utf8')
      const spec = yaml.load(specContent)
      logger.info(
        'Successfully loaded OpenAPI spec with',
        Object.keys(spec.components?.schemas || {}).length,
        'schemas'
      )
      logger.info('Available schemas:', Object.keys(spec.components?.schemas || {}))
      // Force reload by adding timestamp (but remove for validation)
      const specWithTimestamp = { ...spec }
      delete specWithTimestamp._loadedAt
      return specWithTimestamp
    } else {
      logger.warn('Generated OpenAPI spec file not found at:', specPath)
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
export { loadSwaggerSpec }
