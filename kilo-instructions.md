# Kilo Code - Initial Instructions for FloresYa Project

## Project Overview

FloresYa is a KISS-based e-commerce platform for flower delivery built with:

- **Backend**: Express 5 + Node.js + Supabase (PostgreSQL)
- **Frontend**: Vanilla JS (ES6 Modules) + Tailwind v4
- **Architecture**: Strict MVC with Service Layer exclusivity
- **Documentation**: OpenAPI 3.1 with auto-generated client
- **Testing**: Vitest + Happy DOM + Playwright

## Core Principles (Non-negotiable)

### 1. KISS First

- Prioritize simple solutions over complex ones
- No unnecessary abstractions that complicate maintenance
- Direct, readable code over clever patterns

### 2. MVC Strict Architecture

```
Frontend (fetch) → HTTP Request
Router (routes/) → Middleware (validate, auth)
Controller (controllers/) → Extract params, call service
Service (services/) → Business logic, Supabase query
Database (PostgreSQL) → Return data
Service → Controller → JSON Response
```

**CRITICAL**: Only `api/services/` can import `supabaseClient.js`

### 3. Service Layer Exclusivity

- **ONLY** files in `api/services/` can import and access Supabase
- Any violation must be corrected immediately
- Controllers handle HTTP, Services handle business logic

### 4. Fail Fast Error Handling

- Throw specific errors immediately in critical operations
- No silent defaults or fallback operators (`||`, `??`)
- Every try-catch must log the error and re-throw
- Use custom error classes from `api/errors/AppError.js`

### 5. Soft-Delete Pattern

- Use `active` or `is_active` flags to deactivate records
- Never delete data physically
- Implement `includeInactive` parameter (default: false)
- Admin role controls access to inactive records

### 6. OpenAPI Contract First

- All API endpoints documented in `api/docs/openapi-annotations.js`
- Use JSDoc annotations with proper schemas
- Regenerate client with `npm run generate:client`
- Validate requests against OpenAPI spec

### 7. ESLint Compliance

- All JavaScript must comply 100% with `eslint.config.js`
- Fix violations silently when possible
- No unused imports, variables, or console.errors without context

## Development Workflow

### Backend Development

1. **Services First**: Start with service layer logic
2. **Controllers Next**: Handle HTTP request/response
3. **Routes Then**: Define endpoints and middleware
4. **Documentation**: Add OpenAPI annotations immediately
5. **Tests**: Write unit and integration tests

### Frontend Development

1. **No Inline JS/CSS**: Use ES6 modules only
2. **API Client**: Use generated `api-client.js` methods
3. **Component Structure**: Reusable components in `js/components/`
4. **Shared Logic**: Common functions in `js/shared/`

### Code Quality

1. **Error Handling**: Custom errors with proper metadata
2. **Validation**: Manual validation using `api/middleware/schemas.js`
3. **Logging**: Proper error logging with context
4. **Testing**: Unit tests for services, integration tests for APIs

## Key Directories

```
api/
├── controllers/     # HTTP layer - request/response handling
├── services/        # Business logic - ONLY database access
├── routes/          # Route definitions and middleware
├── middleware/      # Auth, validation, security
├── docs/           # OpenAPI annotations and generated specs
└── errors/         # Custom error classes

public/
├── pages/          # HTML + paired JS modules
├── js/shared/      # SSOT for common frontend logic
└── js/components/  # Reusable UI components
```

## Common Patterns

### Service Pattern

```javascript
import { supabase, DB_SCHEMA } from './supabaseClient.js'
import { NotFoundError, DatabaseError } from '../errors/AppError.js'

const TABLE = DB_SCHEMA.products.table

export async function getProductById(id, includeInactive = false) {
  try {
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid product ID', { productId: id })
    }

    let query = supabase.from(TABLE).select('*').eq('id', id)
    if (!includeInactive) query = query.eq('active', true)

    const { data, error } = await query.single()
    if (error) {
      if (error.code === 'PGRST116') throw new NotFoundError('Product', id)
      throw new DatabaseError('SELECT', TABLE, error, { productId: id })
    }
    if (!data) throw new NotFoundError('Product', id)

    return data
  } catch (error) {
    if (error.name?.includes('Error')) throw error
    console.error(`getProductById(${id}) failed:`, error)
    throw new DatabaseError('SELECT', TABLE, error, { productId: id })
  }
}
```

### Controller Pattern

```javascript
import * as productService from '../services/productService.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getAllProducts = asyncHandler(async (req, res) => {
  const { limit, offset, featured, search } = req.query
  const includeInactive = req.user?.role === 'admin' && req.query.includeInactive === 'true'
  const filters = { limit, offset, featured, search }

  const products = await productService.getAllProducts(filters, includeInactive)
  res.status(200).json({
    success: true,
    data: products,
    message: 'Products retrieved successfully'
  })
})
```

### Frontend API Pattern

```javascript
import { api } from '../js/shared/api-client.js'
import { showError, showLoading } from '../js/shared/dom.js'

async function loadProducts() {
  try {
    showLoading('container')
    const products = await api.getAllProducts({ limit: 10 })
    renderProducts(products)
  } catch (error) {
    console.error('loadProducts failed:', error)
    showError(error.message, 'container')
    throw error
  }
}
```

## Critical Rules

### Database Access

- **NEVER** import `supabaseClient.js` outside `api/services/`
- **ALWAYS** use services for data operations
- **IMPLEMENT** `includeInactive` for soft-delete queries

### Error Handling

- **USE** custom error classes from `AppError.js`
- **LOG** errors with `console.error(error)`
- **RETHROW** errors after logging
- **NEVER** use `new Error('message')`

### Frontend Rules

- **NO** inline JS/CSS (violates CSP)
- **USE** `type="module"` for all scripts
- **IMPORT** from `api-client.js` for API calls
- **NEVER** use direct `fetch()` in frontend

### OpenAPI Documentation

- **DOCUMENT** all endpoints in `openapi-annotations.js`
- **USE** proper JSDoc syntax
- **REGENERATE** client after changes
- **VALIDATE** against spec in middleware

## Business Rules

### "Una venta cancelada no es una venta"

- Cancelled orders are excluded from sales calculations
- Apply this rule in all relevant services
- Filter by status when calculating metrics

### Accent-Insensitive Search

- Use normalized columns with B-tree indexes
- Backend: `buildSearchCondition` from `utils/normalize.js`
- Frontend: `normalizeSearch` from shared utilities

## Testing Strategy

### Unit Tests

- Test all service methods with mock data
- Test error handling paths
- Test validation logic

### Integration Tests

- Test API endpoints end-to-end
- Test request/response flow
- Test error responses

### E2E Tests

- Test user workflows with Playwright
- Test critical paths: checkout, admin operations

## Deployment

### Local Development

```bash
npm run dev          # Start with CSS build
npm run watch:css    # Watch CSS changes
npm run test         # Run all tests
```

### Production

- Deploy to Vercel (serverless + static)
- Environment variables: `SUPABASE_URL`, `SUPABASE_KEY`, `NODE_ENV`
- Build steps: CSS compilation, OpenAPI generation

## Final Philosophy

"Go all out! Don't hold back, just do it. Go hard or go home."

- **KISS > Complexity**: Simple solutions over complex potential failures
- **Fail Fast**: Break early rather than corrupt silently
- **Service Layer is Law**: Only source of business logic
- **MVC Strict**: Controllers → Services → Database
- **OpenAPI First**: API contract is truth
- **Soft-Delete Always**: Never delete data, deactivate

## Proactive Development

- **Anticipate needs** without explicit instructions
- **Add missing validations** when found
- **Refactor duplicate code** immediately
- **Fix layer violations** aggressively
- **Replace fallbacks** with fail-fast
- **Delete dead code** without hesitation

If it violates these principles, fix it immediately. No exceptions.
