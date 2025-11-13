# FloresYa v1 - Architecture Documentation

## Overview

FloresYa v1 is a modular e-commerce platform built with **Clean Architecture** principles, featuring a complete separation of concerns, dependency inversion, and maintainable code structure.

## Technology Stack

### Backend

- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **Supabase** - PostgreSQL database and authentication
- **ES6 Modules** - Module system

### Frontend

- **HTML5/CSS3** - Structure and styling
- **JavaScript ES6+** - Client-side logic
- **Tailwind CSS v4** - Utility-first CSS framework

### Testing

- **Cypress** - E2E testing
- **Vitest** - Unit testing
- **Playwright** - Cross-browser testing

## Architecture Principles

### 1. Service Layer Exclusive

**Rule:** Only services in `api/services/` can access the database via `supabaseClient.js`

```
Controllers → Services → Repositories → Database
```

Controllers NEVER access the database directly. All business logic is centralized in services.

### 2. Repository Pattern

Each entity has its own repository with single responsibility:

- `ProductRepository` - Products only
- `OrderRepository` - Orders only
- `UserRepository` - Users only
- `BaseRepository` - Generic CRUD operations

### 3. Dependency Inversion

- Services depend on repository abstractions, not implementations
- DI Container (`api/architecture/di-container.js`) manages dependencies
- Loose coupling enables easy testing and maintenance

### 4. Soft Delete Pattern

- All tables use `active`/`is_active` flags instead of physical deletion
- Default queries filter out inactive records (`includeDeactivated: false`)
- Admin operations can include deactivated records

### 5. Fail Fast Error Handling

- Custom error classes in `api/errors/AppError.js`
- Immediate error propagation with detailed context
- No silent failures or fallbacks (`||`, `??` operators forbidden)

### 6. Modular Architecture

Large files are modularized into focused, single-purpose files:

- 51+ service modules
- 23 middleware modules
- Barrel exports (`index.js`) maintain 100% backward compatibility

## Project Structure

```
api/
├── architecture/           # Architectural components
│   ├── di-container.js           # Dependency injection container
│   ├── soft-delete-service.js    # Soft delete implementation
│   └── README.md                 # Architecture decisions
│
├── config/                # Configuration
│   ├── configLoader.js           # Environment configuration
│   ├── constants.js              # Application constants
│   ├── swagger.js                # OpenAPI setup
│   └── connectionPool.js         # Connection pooling & metrics
│
├── controllers/           # HTTP request handlers (9 controllers)
│   ├── productController.js
│   ├── orderController.js
│   ├── userController.js
│   └── ... (others)
│
├── errors/               # Custom error classes
│   └── AppError.js
│
├── middleware/           # Express middleware
│   ├── api/                   # API-specific middleware
│   │   ├── openapiValidator.js
│   │   ├── responseStandard.js
│   │   └── index.js
│   │
│   ├── auth/                  # Authentication middleware
│   │   ├── auth.js
│   │   ├── middleware.js
│   │   └── index.js
│   │
│   ├── error/                 # Error handling middleware
│   │   ├── errorHandler.js
│   │   ├── index.js
│   │   └── supabaseErrorMapper/
│   │
│   ├── performance/           # Performance middleware
│   │   ├── cache.js
│   │   ├── circuitBreaker.js
│   │   ├── performanceMonitor.js
│   │   └── index.js
│   │
│   ├── security/              # Security middleware
│   │   ├── security.js
│   │   ├── rateLimit.js
│   │   ├── securityAudit.js
│   │   ├── hardenedValidation.js
│   │   └── index.js
│   │
│   ├── validation/            # Input validation middleware
│   │   ├── schemas/
│   │   │   ├── product.js
│   │   │   ├── order.js
│   │   │   ├── user.js
│   │   │   └── index.js
│   │   │
│   │   ├── advancedValidation/
│   │   │   ├── email.js
│   │   │   ├── phone.js
│   │   │   ├── helpers.js
│   │   │   └── index.js
│   │   │
│   │   ├── validate.js
│   │   └── index.js
│   │
│   └── utilities/
│       ├── uploadImage.js
│       └── index.js
│
├── repositories/         # Data access layer
│   ├── BaseRepository.js       # Generic CRUD repository
│   ├── ProductRepository.js    # Product-specific operations
│   ├── OrderRepository.js      # Order-specific operations
│   ├── UserRepository.js       # User-specific operations
│   └── PaymentRepository.js    # Payment-specific operations
│
├── services/             # Business logic layer (51+ modules)
│   ├── productService/         # Product business logic (8 files)
│   │   ├── read.js
│   │   ├── create.js
│   │   ├── update.js
│   │   ├── delete.js
│   │   ├── inventory.js
│   │   ├── relationships.js
│   │   ├── helpers.js
│   │   └── index.js (barrel export)
│   │
│   ├── orderService/           # Order business logic (7 files)
│   │   ├── read.js
│   │   ├── create.js
│   │   ├── update.js
│   │   ├── cancel.js
│   │   ├── status.js
│   │   ├── helpers.js
│   │   └── index.js
│   │
│   ├── userService/            # User business logic (7 files)
│   │   ├── read.js
│   │   ├── create.js
│   │   ├── update.js
│   │   ├── delete.js
│   │   ├── verify.js
│   │   ├── helpers.js
│   │   └── index.js
│   │
│   ├── authService/            # Authentication (5 files)
│   ├── paymentService/         # Payment processing (5 files)
│   ├── settingsService/        # Settings management (6 files)
│   ├── occasionService/        # Occasion management (5 files)
│   │
│   ├── ProductCacheService.js  # Caching layer
│   ├── ProductFilterService.js # Filter optimization
│   ├── QueryOptimizationService.js # Query optimization
│   └── supabaseStorageService.js # File storage
│
├── utils/                # Utility functions
│   ├── logger.js              # Structured logging
│   ├── sanitize.js            # Input sanitization
│   ├── normalize.js           # Data normalization
│   └── validation.js          # General validation
│
├── routes/               # Express routes
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   ├── userRoutes.js
│   └── ... (others)
│
└── server.js            # Application entry point
```

## Data Flow

### Typical Request Flow

```
1. HTTP Request → Express Router
2. Router → Controller
3. Controller → Service Method
4. Service → Repository Method
5. Repository → Supabase (Database)
6. Result flows back: Repository → Service → Controller → HTTP Response
```

### Example: Create Product

```javascript
// Route
POST /api/products

// Controller (productController.js)
export async function createProduct(req, res) {
  const product = await createProductService(req.body)
  res.json({ success: true, data: product })
}

// Service (productService/create.js)
export async function createProduct(data) {
  const validated = validateProductData(data)
  const product = await productRepository.create(validated)
  return product
}

// Repository (ProductRepository.js)
export class ProductRepository {
  async create(data) {
    const { data: product, error } = await supabase
      .from('products')
      .insert(data)
      .select()
      .single()

    if (error) throw new DatabaseError(...)
    return product
  }
}
```

## Key Design Patterns

### 1. Repository Pattern

**Purpose:** Abstract database operations

```javascript
class ProductRepository {
  async findById(id) {
    /* ... */
  }
  async findAllWithFilters(filters, options) {
    /* ... */
  }
  async create(data) {
    /* ... */
  }
  async update(id, data) {
    /* ... */
  }
  async delete(id) {
    /* ... */
  }
}
```

### 2. Dependency Injection

**Purpose:** Loose coupling, testability

```javascript
// DI Container
const container = new DIContainer()
container.register('ProductRepository', new ProductRepository())
container.register('ProductService', new ProductService())

// Service uses repository
class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository
  }
}
```

### 3. Composition Pattern (BaseRepository)

**Purpose:** Reuse common operations

```javascript
class BaseRepository {
  async findById(id) {
    /* generic implementation */
  }
  async findMany(criteria) {
    /* generic implementation */
  }
}

class ProductRepository extends BaseRepository {
  // Inherits generic methods
  // Adds product-specific methods
}
```

### 4. Barrel Export Pattern

**Purpose:** Maintain backward compatibility

```javascript
// productService.index.js (barrel export)
export * from './read.js'
export * from './create.js'
export * from './update.js'
export * from './delete.js'

// Old import still works
import { getProductById } from './productService.js'
```

### 5. Soft Delete Pattern

**Purpose:** Data retention, audit trail

```javascript
// Instead of: DELETE FROM products WHERE id = ?
// We use: UPDATE products SET active = false WHERE id = ?

// Service
export async function deleteProduct(id, auditInfo) {
  const product = await productRepository.softDelete(id, auditInfo)
  return product
}

// Repository
async softDelete(id, auditInfo) {
  const { data, error } = await supabase
    .from('products')
    .update({
      active: false,
      deleted_at: new Date().toISOString(),
      deleted_by: auditInfo.deletedBy,
      deletion_reason: auditInfo.reason
    })
    .eq('id', id)
    .eq('active', true)
    .select()
    .single()

  if (error) throw new DatabaseError(...)
  return data
}
```

## Database Schema

### Core Tables

- **products** - Product catalog (with images)
- **users** - Customer accounts
- **orders** - Purchase orders
- **order_items** - Order line items
- **payment_methods** - Payment options
- **occasions** - Flower occasions (birthday, wedding, etc.)
- **settings** - Application settings

### Soft Delete Columns

All tables include:

- `active` (boolean) - Is record active?
- `deleted_at` (timestamp) - When was it deleted?
- `deleted_by` (bigint) - Who deleted it?
- `deletion_reason` (text) - Why was it deleted?
- `reactivated_at` (timestamp) - When was it reactivated?
- `reactivated_by` (bigint) - Who reactivated it?

### Example: Products Table

```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price_usd DECIMAL(10, 2) NOT NULL,
  sku VARCHAR(100) UNIQUE,
  featured BOOLEAN DEFAULT false,
  carousel_order INTEGER,
  active BOOLEAN DEFAULT true,

  -- Soft delete columns
  deleted_at TIMESTAMPTZ,
  deleted_by BIGINT REFERENCES users(id),
  deletion_reason TEXT,
  reactivated_at TIMESTAMPTZ,
  reactivated_by BIGINT REFERENCES users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Documentation

All API endpoints are documented using **OpenAPI 3.1** with JSDoc annotations in `api/docs/openapi-annotations.js`.

### Response Format

All endpoints return standardized JSON:

**Success Response:**

```json
{
  "success": true,
  "data": {
    /* response data */
  },
  "message": "Operation successful"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {
    /* additional error context */
  }
}
```

### Pagination

List endpoints support pagination:

```javascript
GET /api/products?limit=50&offset=0
GET /api/orders?limit=20&offset=100
```

### Filtering

Most list endpoints support filtering:

```javascript
GET /api/products?featured=true&price_min=10&price_max=100
GET /api/products?search=roses&occasionId=5
```

## Security

### Multi-Layer Validation

1. **Client-side** - Basic UX validation
2. **Middleware** - Sanitization and format checking
3. **Service layer** - Business logic validation
4. **Database** - Constraints and types

### Security Measures

- **SQL Injection Prevention** - Parameterized queries, input sanitization
- **XSS Prevention** - HTML encoding, script tag removal
- **CSRF Protection** - Token validation
- **Rate Limiting** - Per-IP request limiting
- **Input Sanitization** - Dangerous character removal
- **Security Headers** - XSS-Protection, Content-Security-Policy, etc.
- **Authentication** - JWT token validation
- **Authorization** - Role-based access control

### Security Middleware

```javascript
import {
  securityHeaders,
  sanitizeInput,
  detectSuspiciousActivity,
  validateAuth,
  requirePermissions,
  ipRateLimit
} from './middleware/security/index.js'
```

## Performance Optimizations

### 1. Connection Pooling

- Optimized Supabase connection management
- Rate limiting with metrics tracking
- Batch query execution

### 2. Caching

- `ProductCacheService.js` - In-memory product caching
- TTL-based cache invalidation
- Cache warm-up on startup

### 3. Database Optimizations

- Strategic indexes on frequently queried columns
- Query optimization service
- Slow query monitoring

### 4. Performance Monitoring

- Real-time response time tracking
- Memory usage monitoring
- Request metrics collection
- Automatic slow request logging (>500ms)

### Performance Middleware

```javascript
import { performanceMonitor, getMetrics, metricsEndpoint } from './middleware/performance/index.js'
```

## Testing Strategy

### Testing Pyramid

1. **Unit Tests** (70%) - Individual functions and methods
2. **Integration Tests** (20%) - Service and repository interactions
3. **E2E Tests** (10%) - Complete user workflows

### Test Files

- `tests/unit/` - Unit tests for services, repositories, utilities
- `tests/integration/` - Integration tests for API endpoints
- `tests/e2e/` - End-to-end tests for user flows
- `tests/functional/` - Feature-based tests
- `tests/architecture/` - Architectural compliance tests
- `tests/load/` - Performance and load tests

### Example Test

```javascript
describe('ProductService', () => {
  it('should create product with valid data', async () => {
    const productData = {
      name: 'Test Product',
      price_usd: 29.99
    }

    const product = await createProductService(productData)

    expect(product).toHaveProperty('id')
    expect(product.name).toBe(productData.name)
    expect(product.active).toBe(true)
  })
})
```

## Error Handling

### Custom Error Classes

```javascript
// api/errors/AppError.js
export class BadRequestError extends AppError {
  constructor(message, code, context) {
    super(message, 400, code, context)
  }
}

export class NotFoundError extends AppError {
  constructor(message, code, context) {
    super(message, 404, code, context)
  }
}

export class DatabaseError extends AppError {
  constructor(message, code, context) {
    super(message, 500, code, context)
  }
}
```

### Error Propagation

```javascript
// Service layer
export async function getProductById(id) {
  try {
    const product = await productRepository.findById(id)
    if (!product) {
      throw new NotFoundError('Product not found', 'PRODUCT_NOT_FOUND', { id })
    }
    return product
  } catch (error) {
    console.error('ProductService.getProductById failed:', error)
    throw error // Re-throw with context
  }
}
```

## Internationalization

### Supported Languages

- Spanish (primary)
- French
- Japanese
- Russian
- Arabic
- Chinese

### Phone Validation

Venezuelan mobile number format:

- 10 digits
- Valid prefixes: 0412, 0414, 0416, 0424, 0426, 0410, 0411, 0418, 0425

### Special Characters

Full Unicode support including:

- Emojis: 😀 🎁 🌹
- Symbols: © ® ™ € £ ¥
- Accented characters: café, naïve, résumé

## Deployment

### Environment Configuration

- `.env` - Development environment variables
- `.env.production` - Production environment variables
- `api/config/configLoader.js` - Environment variable loader

### Key Environment Variables

```bash
NODE_ENV=development
PORT=3000

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Logging configured
- [ ] Monitoring enabled
- [ ] Backups scheduled
- [ ] Performance tests passed
- [ ] Security audit completed

## Maintenance

### Regular Tasks

1. **Database Maintenance**
   - Analyze query performance
   - Update statistics
   - Monitor index usage

2. **Security Updates**
   - Update dependencies
   - Review access logs
   - Audit user permissions

3. **Performance Monitoring**
   - Review metrics dashboard
   - Identify slow queries
   - Optimize hotspots

4. **Backup & Recovery**
   - Daily database backups
   - Test restoration procedures
   - Document recovery plan

## Developer Guidelines

### Code Standards

- **100% ESLint compliance** - No warnings allowed
- **SOLID principles** - Single Responsibility, Open/Closed, etc.
- **Clean code** - Readable, maintainable, no dead code
- **Consistent formatting** - Prettier configuration
- **Comprehensive documentation** - JSDoc for all public APIs

### Git Workflow

1. Create feature branch from `main`
2. Write tests first (TDD approach)
3. Implement feature with passing tests
4. Update documentation
5. Create Pull Request
6. Code review required
7. Merge after approval

### Adding New Features

1. Create repository if needed
2. Create service layer
3. Create controller
4. Add routes
5. Write tests
6. Update OpenAPI documentation
7. Add validation rules

### Refactoring Guidelines

1. **Automate when possible** - Use modularization scripts
2. **Maintain backward compatibility** - Use barrel exports
3. **Test thoroughly** - Ensure all tests pass
4. **Update documentation** - Keep docs current
5. **Gradual rollout** - Incremental changes

## Automation Tools

### Modularization Scripts

- `scripts/modularization/modularize-service.js` - Automate service splitting
- `scripts/modularization/modularize-controller.js` - Automate controller splitting
- `scripts/modularization/validate-refactoring.js` - Validate modularization

### Database Scripts

- `scripts/database/verify-phase1-ready.js` - Verify database readiness
- `scripts/database/validate-sql-syntax.js` - Validate SQL syntax
- `scripts/database/optimize-queries.sql` - Query optimization

### Testing Scripts

- `scripts/setup-tests.sh` - Setup test environment
- `scripts/dev-tools/generate-granular-tests.js` - Generate test templates

## Metrics & Monitoring

### Performance Metrics

- Response times (p50, p95, p99)
- Throughput (requests/second)
- Error rates
- Memory usage
- Database connection pool status

### Business Metrics

- Active users
- Product views
- Conversion rates
- Order values
- Popular products/occasions

### Alert Thresholds

- Response time > 1s
- Error rate > 1%
- Memory usage > 80%
- Disk usage > 85%
- Database connections > 80% of pool

## Future Enhancements

### Phase 2 Roadmap

1. **Microservices Migration**
   - Separate products service
   - Separate orders service
   - API Gateway implementation

2. **Advanced Caching**
   - Redis integration
   - Multi-level cache hierarchy
   - Cache warming strategies

3. **Real-time Features**
   - WebSocket integration
   - Live order tracking
   - Inventory updates

4. **Advanced Analytics**
   - User behavior tracking
   - Sales analytics
   - A/B testing framework

5. **Mobile Applications**
   - React Native app
   - Offline support
   - Push notifications

## Resources

### Documentation

- `ARCHITECTURE.md` (this file) - System architecture
- `CLAUDE.md` - Development guidelines
- `uiux.md` - UI/UX guidelines
- `api/docs/openapi-spec.yaml` - API documentation

### Tools

- Supabase Dashboard - Database management
- GitHub - Version control
- Cypress Dashboard - E2E test reports
- ESLint - Code linting

### External Resources

- [Express.js Documentation](https://expressjs.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Clean Architecture (Robert Martin)](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html)

## Support

For questions or issues:

1. Review this documentation
2. Check `CLAUDE.md` for development guidelines
3. Review test files for examples
4. Contact the development team

## Version History

- **v1.0** - Initial architecture with Clean Architecture principles
- **v1.1** - Service layer modularization (51+ files)
- **v1.2** - Middleware refactoring (23 files)
- **v1.3** - Performance optimizations (connection pooling, caching)
- **v1.4** - Security hardening (comprehensive security middleware)
- **v1.5** - Documentation and testing improvements

---

**Maintained by:** FloresYa Development Team
**Last Updated:** 2025-11-11
**Version:** 1.5
