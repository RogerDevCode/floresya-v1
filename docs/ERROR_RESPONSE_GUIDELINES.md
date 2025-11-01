# Error Response Guidelines

## Based on RFC 7807, JSON:API, OpenAPI 3.1, and Silicon Valley Best Practices

---

## Table of Contents

1. [Overview](#overview)
2. [Response Structure](#response-structure)
3. [Error Categories](#error-categories)
4. [HTTP Status Mapping](#http-status-mapping)
5. [Error Code Taxonomy](#error-code-taxonomy)
6. [Testing Standards](#testing-standards)
7. [OpenAPI Documentation](#openapi-documentation)
8. [Client Implementation](#client-implementation)
9. [Security Considerations](#security-considerations)
10. [Monitoring & Logging](#monitoring--logging)

---

## Overview

This document establishes standardized guidelines for error handling across the FloresYa API based on industry best practices from:

- **RFC 7807**: Problem Details for HTTP APIs
- **JSON:API**: Error format specification
- **OpenAPI 3.1**: API documentation standard
- **Silicon Valley companies**: Google, Stripe, Netflix, GitHub

### Design Principles

1. **RFC 7807 Compliant**: All error responses include standard Problem Details fields
2. **Machine-Readable**: Numeric error codes for programmatic handling
3. **Human-Readable**: Clear messages for developers and users
4. **Debug-Friendly**: Rich context for troubleshooting
5. **Consistent**: Standardized format across all endpoints
6. **Secure**: No sensitive information in error responses

---

## Response Structure

### Base Error Response Format

```json
{
  "success": false,
  "error": "ValidationError",
  "code": 1001,
  "category": "validation",
  "type": "https://api.floresya.com/errors/validation/validationfailed",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Request validation failed",
  "instance": "/errors/req_123456789",
  "message": "Validation failed. Please check your input.",
  "timestamp": "2025-10-31T15:10:00.000Z",
  "path": "/api/products",
  "requestId": "req_123456789",
  "errors": {
    "email": ["Must be a valid email address"],
    "password": ["Must be at least 8 characters"]
  }
}
```

### Field Definitions

| Field       | Type    | Required    | Description                                                             |
| ----------- | ------- | ----------- | ----------------------------------------------------------------------- |
| `success`   | boolean | ✅          | Always `false` for errors                                               |
| `error`     | string  | ✅          | Error class name (e.g., "ValidationError")                              |
| `code`      | integer | ✅          | Numeric error code from ERROR_CODES                                     |
| `category`  | string  | ✅          | Error category: validation, authentication, not_found, business, server |
| `type`      | string  | ✅ RFC 7807 | URI identifying problem type                                            |
| `title`     | string  | ✅ RFC 7807 | Short, human-readable summary                                           |
| `status`    | integer | ✅ RFC 7807 | HTTP status code                                                        |
| `detail`    | string  | ✅ RFC 7807 | Detailed explanation                                                    |
| `instance`  | string  | ✅ RFC 7807 | URI identifying specific occurrence                                     |
| `message`   | string  | ✅          | User-friendly message                                                   |
| `timestamp` | string  | ISO 8601    | When error occurred                                                     |
| `path`      | string  | -           | Request path that caused error                                          |
| `requestId` | string  | -           | Unique request identifier                                               |
| `errors`    | object  | -           | Field-specific validation errors                                        |
| `details`   | object  | -           | Additional context (operational errors only)                            |

### RFC 7807 Fields

The following fields ensure RFC 7807 compliance:

- `type`: URI reference (e.g., `https://api.floresya.com/errors/validation/validationfailed`)
- `title`: Short summary (e.g., "Validation Failed")
- `status`: HTTP status code
- `detail`: Detailed explanation
- `instance`: URI identifying this occurrence

### FloresYa Extensions

Additional fields beyond RFC 7807:

- `success`: For API consistency
- `error`: Error class name
- `code`: Numeric code
- `category`: Error grouping
- `message`: User-friendly message
- `timestamp`: ISO 8601 timestamp
- `path`: Request path
- `requestId`: Correlation ID
- `errors`: Field-specific validation errors
- `details`: Additional context

---

## Error Categories

### 1. Validation (1001-1999)

**Purpose**: Client input errors

**HTTP Status**: 400 (Bad Request)

**Examples**:

- Missing required fields
- Invalid email format
- Password too weak
- Value out of range

**Characteristics**:

- User can fix by changing input
- `isOperational`: true
- `severity`: low
- Include `errors` field with field-specific messages

### 2. Authentication (2001-2999)

**Purpose**: Authentication and authorization issues

**HTTP Status**:

- 401 (Unauthorized): Invalid/missing token
- 403 (Forbidden): Valid token, insufficient permissions

**Examples**:

- Invalid JWT token
- Token expired
- Insufficient permissions
- Account locked

**Characteristics**:

- Requires authentication
- `isOperational`: true
- `severity`: medium
- Do not include sensitive details

### 3. Not Found (3001-3999)

**Purpose**: Requested resource doesn't exist

**HTTP Status**: 404 (Not Found)

**Examples**:

- Product not found
- User not found
- Order not found

**Characteristics**:

- Resource doesn't exist
- `isOperational`: true
- `severity`: low
- Include resource type and ID in `details`

### 4. Business Logic (4001-4999)

**Purpose**: Business rule violations

**HTTP Status**:

- 400 (Bad Request): General business error
- 409 (Conflict): Resource conflict
- 422 (Unprocessable Entity): Cannot process request

**Examples**:

- Insufficient stock
- Payment failed
- Invalid state transition
- Resource already exists

**Characteristics**:

- Business rules violation
- `isOperational`: true
- `severity`: medium/high
- Include relevant context in `details`

### 5. Server (5001-5999)

**Purpose**: System and infrastructure errors

**HTTP Status**: 5xx (Server Errors)

**Examples**:

- Database connection failed
- External service unavailable
- Internal server error
- Configuration error

**Characteristics**:

- System-level error
- `isOperational`: false
- `severity`: high/critical
- Do not expose internal details to clients

---

## HTTP Status Mapping

### 4xx Client Errors

| HTTP Status | Error Types                      | Description                |
| ----------- | -------------------------------- | -------------------------- |
| 400         | ValidationError, BadRequestError | Bad request, invalid input |
| 401         | UnauthorizedError                | Authentication required    |
| 403         | ForbiddenError                   | Insufficient permissions   |
| 404         | NotFoundError                    | Resource not found         |
| 409         | ConflictError                    | Resource conflict          |
| 422         | OrderNotProcessableError         | Cannot process entity      |
| 429         | RateLimitExceededError           | Too many requests          |

### 5xx Server Errors

| HTTP Status | Error Types                                      | Description           |
| ----------- | ------------------------------------------------ | --------------------- |
| 500         | InternalServerError, DatabaseError               | Internal server error |
| 502         | ExternalServiceError                             | Bad gateway           |
| 503         | ServiceUnavailableError, DatabaseConnectionError | Service unavailable   |

### Status Property

Error responses include `status` property:

- For 4xx errors: `"fail"`
- For 5xx errors: `"error"`

---

## Error Code Taxonomy

### Format

Error codes follow pattern: `CATEGTYPE-NNNN`

Where:

- `CATEGORY`: First digit (1-5)
- `TYPE`: Error type
- `NNNN`: Sequential number

### Code Ranges

```
1000-1999: Validation & Input Errors
  1001: VALIDATION_FAILED
  1002: INVALID_INPUT
  1003: MISSING_REQUIRED_FIELD
  1004: INVALID_EMAIL_FORMAT
  1005: PASSWORD_TOO_WEAK
  1006: INVALID_NUMBER_FORMAT
  1007: VALUE_OUT_OF_RANGE
  1008: INVALID_STRING_LENGTH
  1009: INVALID_ENUM_VALUE
  1010: INVALID_FILE_TYPE

2000-2999: Authentication & Authorization
  2001: UNAUTHORIZED
  2002: INVALID_TOKEN
  2003: TOKEN_EXPIRED
  2004: FORBIDDEN
  2005: INSUFFICIENT_PERMISSIONS
  2006: ACCOUNT_LOCKED
  2007: SESSION_EXPIRED

3000-3999: Not Found Errors
  3001: RESOURCE_NOT_FOUND
  3002: USER_NOT_FOUND
  3003: PRODUCT_NOT_FOUND
  3004: ORDER_NOT_FOUND
  3005: PAYMENT_NOT_FOUND

4000-4999: Business Logic Errors
  4001: INSUFFICIENT_STOCK
  4002: PAYMENT_FAILED
  4003: ORDER_CANNOT_BE_PROCESSED
  4004: INVALID_STATE_TRANSITION
  4005: RESOURCE_ALREADY_EXISTS
  4006: RESOURCE_CONFLICT

5000-5999: Server & System Errors
  5001: INTERNAL_SERVER_ERROR
  5002: DATABASE_ERROR
  5003: EXTERNAL_SERVICE_ERROR
  5004: SERVICE_UNAVAILABLE
  5005: CONFIGURATION_ERROR
  5006: NETWORK_ERROR
```

### Using Error Codes

```javascript
import { ERROR_CODES } from '../config/errorCodes.js'
import { isValidationError, isServerError } from '../config/errorCodes.js'

// Check specific error
if (error.code === ERROR_CODES.VALIDATION_FAILED) {
  // Handle validation error
}

// Check error category
if (isValidationError(error.code)) {
  // Handle any validation error
}

if (isServerError(error.code)) {
  // Log server errors (critical)
}
```

---

## Testing Standards

### Test Error Responses

Use standardized test utilities:

```javascript
import {
  validateErrorResponse,
  validateValidationError,
  validateNotFoundError,
  assertErrorProperties
} from '../utils/errorTestUtils.js'

it('should return validation error', () => {
  const error = new ValidationError('Invalid', { field: 'email' })

  validateErrorResponse(error.toJSON())
  validateValidationError(error)
  assertErrorProperties(error, {
    expectedStatus: 400,
    expectedCategory: 'validation'
  })
})
```

### Error Factory Pattern

```javascript
import { ErrorFactory } from '../utils/errorTestUtils.js'

it('should handle validation errors', () => {
  const error = ErrorFactory.validation('email', 'Invalid email')

  expect(error.name).toBe('ValidationError')
  expect(error.statusCode).toBe(400)
})
```

### Custom Matchers

```javascript
// In test setup
import { customMatchers } from '../utils/errorTestUtils.js'
expect.extend(customMatchers)

// In tests
expect(error).toBeValidError()
expect(error).toHaveErrorCode(1001)
expect(error).toBeValidationError()
```

See: `/tests/utils/errorTestUtils.js` for complete testing utilities.

---

## OpenAPI Documentation

### Error Response Schema

All endpoints must document error responses:

```yaml
paths:
  /api/products:
    get:
      responses:
        '400':
          $ref: '#/components/responses/ValidationErrorDetailed'
        '401':
          $ref: '#/components/responses/AuthErrorDetailed'
        '404':
          $ref: '#/components/responses/NotFoundErrorDetailed'
        '500':
          $ref: '#/components/responses/ServerErrorDetailed'
```

### Error Response Components

Pre-defined response schemas in `openapi-annotations.js`:

- `ErrorResponse`: Base error schema
- `ValidationErrorResponse`: For 400 validation errors
- `NotFoundErrorResponse`: For 404 errors
- `AuthErrorResponse`: For 401/403 errors
- `ConflictErrorResponse`: For 409 errors
- `ServerErrorResponse`: For 5xx errors

### Error Code Documentation

Endpoint `/api/errors` documents all error codes:

```yaml
/api/errors:
  get:
    summary: Get all error codes
    responses:
      '200':
        description: List of all error codes
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ErrorCodeList'
```

---

## Client Implementation

### Error Handling Pattern

```javascript
async function apiCall(endpoint) {
  try {
    const response = await fetch(endpoint)
    const data = await response.json()

    if (!response.ok) {
      // Handle error
      handleApiError(data)
      return
    }

    return data
  } catch (error) {
    // Network or other error
    console.error('API call failed:', error)
  }
}

function handleApiError(errorResponse) {
  const { code, category, message, errors } = errorResponse

  // Handle by category
  switch (category) {
    case 'validation':
      // Show field-specific errors
      Object.entries(errors).forEach(([field, messages]) => {
        displayFieldError(field, messages[0])
      })
      break

    case 'authentication':
      // Redirect to login
      window.location.href = '/login'
      break

    case 'not_found':
      // Show 404 page
      showNotFoundPage()
      break

    case 'business':
      // Show business error message
      alert(message)
      break

    case 'server':
      // Log server errors
      console.error('Server error:', errorResponse)
      // Show generic error message
      alert('An unexpected error occurred')
      break
  }

  // Log all errors for monitoring
  logError(errorResponse)
}
```

### Error Code Constants

```javascript
const ERROR_CODES = {
  VALIDATION_FAILED: 1001,
  UNAUTHORIZED: 2001,
  RESOURCE_NOT_FOUND: 3001,
  INSUFFICIENT_STOCK: 4001,
  INTERNAL_SERVER_ERROR: 5001
}

// Check for specific errors
if (error.code === ERROR_CODES.VALIDATION_FAILED) {
  // Handle validation error
}
```

---

## Security Considerations

### ✅ DO

1. **Return generic messages for server errors**
   - Don't expose stack traces
   - Don't expose database schema
   - Don't expose internal system details

2. **Log detailed errors server-side**
   - Log full stack traces
   - Log error codes and context
   - Use request IDs for correlation

3. **Validate all input**
   - Sanitize user input
   - Use validation schemas
   - Reject malicious input

4. **Use appropriate status codes**
   - 4xx for client errors
   - 5xx for server errors

### ❌ DON'T

1. **Don't expose sensitive information**
   - Database credentials
   - Internal IP addresses
   - System file paths
   - Stack traces (in production)

2. **Don't use generic error messages**
   - "Something went wrong" for all errors
   - Makes debugging difficult

3. **Don't ignore errors**
   - Always handle errors
   - Always log errors
   - Always return appropriate status codes

### Sensitive Data Handling

For errors that might contain sensitive data:

```javascript
// In production, sanitize error details
if (process.env.NODE_ENV === 'production') {
  const sanitizedContext = {
    ...error.context,
    // Remove sensitive fields
    password: undefined,
    apiKey: undefined
  }
}
```

---

## Monitoring & Logging

### Error Logging

All errors should be logged with:

```javascript
try {
  // Operation
} catch (error) {
  // Log structured error
  console.error('Operation failed:', {
    errorCode: error.code,
    errorName: error.name,
    statusCode: error.statusCode,
    category: error.category,
    isOperational: error.isOperational,
    timestamp: error.timestamp,
    path: req.path,
    method: req.method,
    requestId: req.id,
    userId: req.user?.id,
    stack: error.stack,
    context: error.context
  })

  throw error
}
```

### Monitoring Metrics

Track these metrics:

1. **Error Rate**: Errors per request
2. **Error by Category**:
   - Validation errors
   - Authentication errors
   - Business logic errors
   - Server errors

3. **Top Error Codes**: Most frequent errors
4. **Error Trends**: Error rate over time

### Alerting

Set up alerts for:

- High error rate (>5% of requests)
- Server errors (5xx) > 1%
- Authentication errors spike
- New error codes appearing

### Request Correlation

Use `requestId` to correlate:

- API logs
- Application logs
- Database logs
- External service logs

---

## Best Practices Summary

### For Developers

1. **Always use custom error classes**
   - Don't use `new Error('message')`
   - Use `new ValidationError('message', context)`

2. **Include context in errors**
   - Add relevant metadata
   - Include field names
   - Include expected vs actual values

3. **Test error responses**
   - Use standardized test utilities
   - Test all error scenarios
   - Validate response structure

4. **Document error responses**
   - Add to OpenAPI spec
   - Include examples
   - Reference error codes

### For API Consumers

1. **Check HTTP status first**
   - 4xx: Client error, fix request
   - 5xx: Server error, retry later

2. **Handle errors by category**
   - Different handling for each category
   - Show appropriate UI feedback

3. **Log errors for debugging**
   - Include error code and message
   - Include request ID

4. **Retry with exponential backoff**
   - For 5xx errors
   - For rate limiting (429)

---

## Example: Complete Error Flow

### 1. Error Thrown

```javascript
// In service
export async function createProduct(data) {
  if (!data.name) {
    throw new ValidationError('Product name is required', {
      field: 'name',
      value: data.name,
      code: ERROR_CODES.MISSING_REQUIRED_FIELD
    })
  }
  // ...
}
```

### 2. Error Propagated

```javascript
// In controller
export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body)
  res.status(201).json({
    success: true,
    data: product,
    message: 'Product created successfully'
  })
})
```

### 3. Error Handled

```javascript
// In error middleware
app.use((error, req, res, next) => {
  // Log error
  console.error('Error:', error)

  // Send error response
  res.status(error.statusCode || 500).json(error.toJSON())
})
```

### 4. Client Receives

```json
{
  "success": false,
  "error": "ValidationError",
  "code": 1003,
  "category": "validation",
  "type": "https://api.floresya.com/errors/validation/validationfailed",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Product name is required",
  "instance": "/errors/req_123456789",
  "message": "Validation failed. Please check your input.",
  "timestamp": "2025-10-31T15:10:00.000Z",
  "path": "/api/products",
  "requestId": "req_123456789",
  "details": {
    "field": "name",
    "value": null
  }
}
```

---

## Conclusion

This error response standard provides:

✅ **RFC 7807 Compliance**: Industry-standard format
✅ **Machine-Readable Codes**: Easy programmatic handling
✅ **Developer-Friendly**: Clear messages and context
✅ **Well-Documented**: Complete OpenAPI documentation
✅ **Tested**: Standardized testing utilities
✅ **Secure**: No sensitive data exposure
✅ **Monitorable**: Structured logging and metrics

By following these guidelines, the FloresYa API provides a consistent, reliable, and professional error handling experience for both developers and users.

---

## References

- [RFC 7807: Problem Details for HTTP APIs](https://tools.ietf.org/html/rfc7807)
- [JSON:API Error Format](https://jsonapi.org/format/#error-objects)
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/latest.html)
- [Google Cloud API Error Format](https://cloud.google.com/storage/docs/json_api/v1/status-codes)
- [Stripe Error Handling](https://stripe.com/docs/api/errors)
- [GitHub API Error Format](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#http-verbs)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-31
**Status**: ✅ Approved
