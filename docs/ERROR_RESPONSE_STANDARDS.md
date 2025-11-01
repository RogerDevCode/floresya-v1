# 📋 Error Response Standards - FloresYa API

## Executive Summary

This document establishes **clear, consistent guidelines** for error responses across the FloresYa API. All error responses follow **RFC 7807** (Problem Details for HTTP APIs) with FloresYa-specific extensions to ensure excellent client-side error handling and developer experience.

---

## 🎯 Error Response Format

### Complete Error Response Structure

All error responses from the FloresYa API follow this standardized format:

```json
{
  "success": false,
  "error": "ValidationError",
  "code": 1001,
  "category": "validation",
  "message": "Validation failed. Please check your input.",
  "type": "https://api.floresya.com/errors/validation/validationfailed",
  "title": "Validation Failed",
  "status": 400,
  "detail": "Validation failed. Please check your input.",
  "instance": "/errors/req_123456789",
  "timestamp": "2025-10-31T13:07:16.123Z",
  "path": "/api/products",
  "requestId": "req_123456789",
  "details": {
    "validationErrors": {
      "name": ["Name is required"],
      "email": ["Must be a valid email address"]
    }
  }
}
```

### Required Fields

| Field       | Type    | Description                       | RFC 7807 | Example                  |
| ----------- | ------- | --------------------------------- | -------- | ------------------------ |
| `success`   | boolean | Always `false` for errors         | ✗        | `false`                  |
| `error`     | string  | Error class name (human-readable) | ✗        | `"ValidationError"`      |
| `code`      | number  | Numeric error code (1001-5999)    | ✗        | `1001`                   |
| `category`  | string  | Error category                    | ✗        | `"validation"`           |
| `message`   | string  | User-friendly message             | ✓        | `"Validation failed..."` |
| `title`     | string  | Short error title                 | ✓        | `"Validation Failed"`    |
| `status`    | number  | HTTP status code                  | ✓        | `400`                    |
| `type`      | string  | Error type URL                    | ✓        | `"https://..."`          |
| `detail`    | string  | Detailed error message            | ✓        | `"Validation failed..."` |
| `timestamp` | string  | ISO 8601 timestamp                | ✗        | `"2025-10-31T..."`       |
| `instance`  | string  | Error instance identifier         | ✓        | `"/errors/req_..."`      |

### Optional Fields

| Field       | Type   | Description                    | When Present                 |
| ----------- | ------ | ------------------------------ | ---------------------------- |
| `details`   | object | Additional error context       | Always (when context exists) |
| `path`      | string | Request path that caused error | Always                       |
| `requestId` | string | Correlation ID for tracing     | Always                       |
| `stack`     | string | Stack trace                    | Development only             |

---

## 📂 Error Categories

Errors are categorized into **5 main categories**, each with a numeric code range:

### 1. Validation Errors (1001-1999)

**Purpose**: Input validation failures, data type mismatches, missing fields

**HTTP Status**: `400 Bad Request`

**Examples**:

```json
{
  "success": false,
  "error": "ValidationError",
  "code": 1001,
  "category": "validation",
  "message": "Validation failed. Please check your input.",
  "details": {
    "validationErrors": {
      "email": ["Must be a valid email address"],
      "password": ["Must be at least 8 characters"]
    }
  }
}
```

**Common Codes**:

- `1001` - VALIDATION_FAILED
- `1002` - INVALID_INPUT
- `1003` - MISSING_REQUIRED_FIELD
- `1004` - INVALID_EMAIL_FORMAT
- `1005` - PASSWORD_TOO_WEAK
- `1006` - INVALID_NUMBER_FORMAT
- `1007` - VALUE_OUT_OF_RANGE
- `1008` - INVALID_STRING_LENGTH
- `1009` - INVALID_ENUM_VALUE
- `1010` - INVALID_FILE_TYPE

### 2. Authentication & Authorization (2001-2999)

**Purpose**: Authentication and permission failures

**HTTP Status**: `401 Unauthorized` or `403 Forbidden`

**Examples**:

```json
{
  "success": false,
  "error": "UnauthorizedError",
  "code": 2001,
  "category": "authentication",
  "message": "Please log in to continue.",
  "details": {
    "required": "valid JWT token",
    "provided": "none"
  }
}
```

**Common Codes**:

- `2001` - UNAUTHORIZED
- `2002` - INVALID_TOKEN
- `2003` - TOKEN_EXPIRED
- `2004` - FORBIDDEN
- `2005` - INSUFFICIENT_PERMISSIONS
- `2006` - ACCOUNT_LOCKED
- `2007` - SESSION_EXPIRED

### 3. Not Found (3001-3999)

**Purpose**: Requested resources not found

**HTTP Status**: `404 Not Found`

**Examples**:

```json
{
  "success": false,
  "error": "NotFoundError",
  "code": 3003,
  "category": "not_found",
  "message": "Product not found.",
  "details": {
    "resource": "Product",
    "id": 999
  }
}
```

**Common Codes**:

- `3001` - RESOURCE_NOT_FOUND
- `3002` - USER_NOT_FOUND
- `3003` - PRODUCT_NOT_FOUND
- `3004` - ORDER_NOT_FOUND
- `3005` - PAYMENT_NOT_FOUND

### 4. Business Logic (4001-4999)

**Purpose**: Business rule violations, workflow issues

**HTTP Status**: `400`, `409`, or `422`

**Examples**:

```json
{
  "success": false,
  "error": "ConflictError",
  "code": 4005,
  "category": "business",
  "message": "This email is already registered.",
  "details": {
    "field": "email",
    "value": "user@example.com",
    "constraint": "unique"
  }
}
```

**Common Codes**:

- `4001` - INSUFFICIENT_STOCK
- `4002` - PAYMENT_FAILED
- `4003` - ORDER_CANNOT_BE_PROCESSED
- `4004` - INVALID_STATE_TRANSITION
- `4005` - RESOURCE_ALREADY_EXISTS
- `4006` - RESOURCE_CONFLICT

### 5. Server Errors (5001-5999)

**Purpose**: Internal server errors, external service failures

**HTTP Status**: `500` or `503`

**Examples**:

```json
{
  "success": false,
  "error": "InternalServerError",
  "code": 5001,
  "category": "server",
  "message": "An unexpected error occurred. Please try again later.",
  "details": {
    "operation": "database_query",
    "table": "products"
  }
}
```

**Common Codes**:

- `5001` - INTERNAL_SERVER_ERROR
- `5002` - DATABASE_ERROR
- `5003` - EXTERNAL_SERVICE_ERROR
- `5004` - SERVICE_UNAVAILABLE
- `5005` - CONFIGURATION_ERROR
- `5006` - NETWORK_ERROR

---

## 🏗️ Response Structure Guidelines

### Success Responses

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

**Fields**:

- `success`: Always `true`
- `data`: The requested data or created resource
- `message`: Human-readable success message

### Error Responses

```json
{
  "success": false,
  "error": "ErrorClassName",
  "code": 1001,
  "category": "validation",
  "message": "User-friendly error message",
  ...
}
```

**Fields**:

- `success`: Always `false`
- `error`: Error class name from server
- `code`: Numeric error code for programmatic handling
- `category`: Error category for client-side routing
- `message`: User-friendly message for display

---

## 🔍 Error Context (`details` object)

The `details` object provides additional context specific to the error type:

### Validation Errors

```json
{
  "details": {
    "validationErrors": {
      "fieldName": ["error message", "another error"]
    }
  }
}
```

### Not Found Errors

```json
{
  "details": {
    "resource": "Product",
    "id": 999
  }
}
```

### Authentication Errors

```json
{
  "details": {
    "required": "valid JWT token",
    "provided": "none",
    "header": "Authorization: Bearer <token>"
  }
}
```

### Database Errors

```json
{
  "details": {
    "operation": "SELECT",
    "table": "products",
    "constraint": "products_pkey",
    "code": "23505"
  }
}
```

### Business Logic Errors

```json
{
  "details": {
    "rule": "minimum_order_amount",
    "current": 0.5,
    "minimum": 1.0
  }
}
```

---

## 🚀 Client-Side Error Handling Guide

### Basic Error Handling Pattern

```javascript
async function handleApiRequest(url, options = {}) {
  try {
    const response = await fetch(url, options)

    // Parse response
    const data = await response.json()

    // Check if request was successful
    if (!data.success) {
      // Handle error response
      handleError(data, response.status)
      return null
    }

    // Return successful response data
    return data.data
  } catch (error) {
    // Handle network/parse errors
    console.error('Request failed:', error)
    return null
  }
}

function handleError(errorResponse, httpStatus) {
  const { code, category, message, details } = errorResponse

  // Route errors based on category
  switch (category) {
    case 'validation':
      handleValidationError(message, details)
      break

    case 'authentication':
      handleAuthError(message, code, httpStatus)
      break

    case 'not_found':
      handleNotFound(message, details)
      break

    case 'business':
      handleBusinessError(message, details)
      break

    case 'server':
      handleServerError(message, httpStatus)
      break

    default:
      console.error('Unknown error category:', category)
  }
}
```

### Handling Different Error Categories

#### Validation Errors

```javascript
function handleValidationError(message, details) {
  // Display field-specific errors
  if (details?.validationErrors) {
    Object.entries(details.validationErrors).forEach(([field, errors]) => {
      const errorElement = document.getElementById(`${field}-error`)
      if (errorElement) {
        errorElement.textContent = errors[0] // Show first error
        errorElement.style.display = 'block'
      }

      // Highlight invalid field
      const fieldElement = document.getElementById(field)
      if (fieldElement) {
        fieldElement.classList.add('is-invalid')
      }
    })
  } else {
    // Show general validation message
    showToast(message, 'error')
  }
}
```

#### Authentication Errors

```javascript
function handleAuthError(message, code, httpStatus) {
  if (httpStatus === 401) {
    // Token expired or missing - redirect to login
    redirectToLogin()
  } else if (httpStatus === 403) {
    // Insufficient permissions - show access denied
    showToast('You do not have permission to perform this action.', 'warning')
  } else {
    // Other auth errors
    showToast(message, 'error')
  }
}

function redirectToLogin() {
  const currentUrl = encodeURIComponent(window.location.pathname)
  window.location.href = `/login?redirect=${currentUrl}`
}
```

#### Not Found Errors

```javascript
function handleNotFound(message, details) {
  if (details?.resource === 'Product') {
    // Show product not found page
    window.location.href = '/products-not-found'
  } else {
    // Generic not found
    showToast(message, 'info')
  }
}
```

#### Business Logic Errors

```javascript
function handleBusinessError(message, details) {
  // Business errors often require specific handling
  if (details?.rule === 'minimum_order_amount') {
    showToast(`Minimum order amount is $${details.minimum}`, 'warning')
  } else if (details?.constraint === 'unique') {
    showToast('This resource already exists. Please choose a different one.', 'warning')
  } else {
    showToast(message, 'warning')
  }
}
```

#### Server Errors

```javascript
function handleServerError(message, httpStatus) {
  if (httpStatus >= 500) {
    // Server errors - user cannot fix
    showToast('An unexpected error occurred. Our team has been notified.', 'error')

    // Optionally, report to error tracking service
    reportErrorToService(message, httpStatus)
  }
}
```

---

## 🔗 RFC 7807 Compliance

FloresYa API error responses are **RFC 7807 compliant** with FloresYa-specific extensions:

### RFC 7807 Standard Fields

| Field      | RFC 7807 | FloresYa      | Required |
| ---------- | -------- | ------------- | -------- |
| `type`     | ✓        | ✓ (extension) | Yes      |
| `title`    | ✓        | ✓             | Yes      |
| `status`   | ✓        | ✓             | Yes      |
| `detail`   | ✓        | ✓             | Yes      |
| `instance` | ✓        | ✓             | Yes      |

### FloresYa Extensions

| Field       | Purpose                 | Example                  |
| ----------- | ----------------------- | ------------------------ |
| `success`   | Always false for errors | `false`                  |
| `error`     | Error class name        | `"ValidationError"`      |
| `code`      | Numeric error code      | `1001`                   |
| `category`  | Error category          | `"validation"`           |
| `message`   | User-friendly message   | `"Validation failed..."` |
| `timestamp` | ISO timestamp           | `"2025-10-31T..."`       |
| `path`      | Request path            | `"/api/products"`        |
| `requestId` | Correlation ID          | `"req_123456789"`        |

---

## 📊 Error Code Reference

### Quick Reference Table

| Code | Category   | Error                   | Status | Usage                     |
| ---- | ---------- | ----------------------- | ------ | ------------------------- |
| 1001 | validation | VALIDATION_FAILED       | 400    | General validation error  |
| 1002 | validation | INVALID_INPUT           | 400    | Invalid input data        |
| 1003 | validation | MISSING_REQUIRED_FIELD  | 400    | Required field missing    |
| 1004 | validation | INVALID_EMAIL_FORMAT    | 400    | Invalid email             |
| 2001 | auth       | UNAUTHORIZED            | 401    | No authentication         |
| 2002 | auth       | INVALID_TOKEN           | 401    | Invalid token             |
| 2003 | auth       | TOKEN_EXPIRED           | 401    | Token expired             |
| 2004 | auth       | FORBIDDEN               | 403    | Insufficient permissions  |
| 3001 | not_found  | RESOURCE_NOT_FOUND      | 404    | Generic not found         |
| 3003 | not_found  | PRODUCT_NOT_FOUND       | 404    | Product not found         |
| 3004 | not_found  | ORDER_NOT_FOUND         | 404    | Order not found           |
| 4001 | business   | INSUFFICIENT_STOCK      | 400    | Not enough inventory      |
| 4002 | business   | PAYMENT_FAILED          | 400    | Payment processing failed |
| 4005 | business   | RESOURCE_ALREADY_EXISTS | 409    | Resource already exists   |
| 5001 | server     | INTERNAL_SERVER_ERROR   | 500    | Generic server error      |
| 5002 | server     | DATABASE_ERROR          | 500    | Database operation failed |

### Full Error Code List

**Validation Errors (1001-1999)**:

- 1001: VALIDATION_FAILED
- 1002: INVALID_INPUT
- 1003: MISSING_REQUIRED_FIELD
- 1004: INVALID_EMAIL_FORMAT
- 1005: PASSWORD_TOO_WEAK
- 1006: INVALID_NUMBER_FORMAT
- 1007: VALUE_OUT_OF_RANGE
- 1008: INVALID_STRING_LENGTH
- 1009: INVALID_ENUM_VALUE
- 1010: INVALID_FILE_TYPE

**Authentication Errors (2001-2999)**:

- 2001: UNAUTHORIZED
- 2002: INVALID_TOKEN
- 2003: TOKEN_EXPIRED
- 2004: FORBIDDEN
- 2005: INSUFFICIENT_PERMISSIONS
- 2006: ACCOUNT_LOCKED
- 2007: SESSION_EXPIRED

**Not Found Errors (3001-3999)**:

- 3001: RESOURCE_NOT_FOUND
- 3002: USER_NOT_FOUND
- 3003: PRODUCT_NOT_FOUND
- 3004: ORDER_NOT_FOUND
- 3005: PAYMENT_NOT_FOUND

**Business Logic Errors (4001-4999)**:

- 4001: INSUFFICIENT_STOCK
- 4002: PAYMENT_FAILED
- 4003: ORDER_CANNOT_BE_PROCESSED
- 4004: INVALID_STATE_TRANSITION
- 4005: RESOURCE_ALREADY_EXISTS
- 4006: RESOURCE_CONFLICT

**Server Errors (5001-5999)**:

- 5001: INTERNAL_SERVER_ERROR
- 5002: DATABASE_ERROR
- 5003: EXTERNAL_SERVICE_ERROR
- 5004: SERVICE_UNAVAILABLE
- 5005: CONFIGURATION_ERROR
- 5006: NETWORK_ERROR

---

## 🛠️ Developer Tools

### Error Response Validator

```javascript
/**
 * Validates error response structure
 * @param {Object} response - Response to validate
 * @returns {boolean} True if valid
 */
function validateErrorResponse(response) {
  const required = ['success', 'error', 'code', 'category', 'message']
  const rfc7807 = ['type', 'title', 'status', 'detail', 'instance']

  // Check required fields
  for (const field of required) {
    if (!(field in response)) {
      console.error(`Missing required field: ${field}`)
      return false
    }
  }

  // Check RFC 7807 fields
  for (const field of rfc7807) {
    if (!(field in response)) {
      console.error(`Missing RFC 7807 field: ${field}`)
      return false
    }
  }

  // Validate values
  if (response.success !== false) {
    console.error('Error response must have success: false')
    return false
  }

  if (typeof response.code !== 'number') {
    console.error('Error code must be a number')
    return false
  }

  const validCategories = ['validation', 'authentication', 'not_found', 'business', 'server']
  if (!validCategories.includes(response.category)) {
    console.error(`Invalid category: ${response.category}`)
    return false
  }

  return true
}
```

### HTTP Status Helper

```javascript
const HTTP_STATUS = {
  // 2xx Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // 4xx Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,

  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
}

/**
 * Get error category from HTTP status code
 */
function getErrorCategoryFromStatus(status) {
  if (status >= 400 && status < 500) {
    if (status === 401) return 'authentication'
    if (status === 403) return 'authentication'
    if (status === 404) return 'not_found'
    return 'validation'
  }
  if (status >= 500) return 'server'
  return 'unknown'
}
```

---

## ✅ Compliance Checklist

When returning errors, ensure:

- [ ] `success` is `false`
- [ ] `error` contains error class name
- [ ] `code` contains numeric error code (1001-5999)
- [ ] `category` is one of: validation, authentication, not_found, business, server
- [ ] `message` contains user-friendly message (no technical details)
- [ ] `type` contains RFC 7807 type URL
- [ ] `title` contains short error title
- [ ] `status` contains HTTP status code
- [ ] `detail` contains detailed error message
- [ ] `instance` contains error instance identifier
- [ ] `timestamp` contains ISO 8601 timestamp
- [ ] `details` contains additional context (when available)
- [ ] No sensitive information in production errors
- [ ] Stack traces only included in development mode

---

## 📚 Additional Resources

### Error Codes Reference

- File: `/api/config/errorCodes.js`
- Contains: All error codes with descriptions

### Error Classes

- File: `/api/errors/AppError.js`
- Contains: Custom error classes with toJSON() implementation

### Error Handler Middleware

- File: `/api/middleware/errorHandler.js`
- Contains: Centralized error handling logic

### Test Utilities

- File: `/tests/utils/errorTestUtils.js`
- Contains: Error validation utilities for testing

---

## 🎯 Best Practices

### For API Developers

1. **Always use error classes**: Don't throw plain Error objects
2. **Include context**: Add relevant details to error.context
3. **User-friendly messages**: Use `userMessage` for client-facing errors
4. **Appropriate codes**: Use correct error codes from ERROR_CODES
5. **Security first**: Never expose sensitive data in error responses

### For Client Developers

1. **Check success field**: Always check `response.success` first
2. **Handle by category**: Route errors based on `category` field
3. **Use error codes**: Programmatic handling based on `code` field
4. **Show user messages**: Display `message` field to users
5. **Log server errors**: Log 5xx errors for debugging

### For Both

1. **Use requestId**: Include `requestId` in logs for correlation
2. **RFC 7807 compliant**: Both sides should understand standard fields
3. **Consistent format**: Never deviate from standard error format
4. **Document errors**: Update this document when adding new error types

---

## 🔄 Version History

- **v1.0** (2025-10-31): Initial error response standards
  - RFC 7807 compliance
  - 5 error categories
  - Complete error code reference
  - Client-side handling guide

---

## ✅ Conclusion

This document establishes **comprehensive, consistent error response standards** for the FloresYa API:

✅ **RFC 7807 Compliant**: Follows industry standard for HTTP API errors
✅ **Clear Categories**: 5 well-defined error categories
✅ **Comprehensive Codes**: 50+ error codes covering all scenarios
✅ **Developer-Friendly**: Consistent format with helpful metadata
✅ **Client Support**: Complete guide for client-side error handling
✅ **Best Practices**: Guidelines for both API and client developers

**All FloresYa API error responses now follow these standards!** 🎉

---

**Status**: ✅ **COMPLETE & IMPLEMENTED**

---

**Last Updated**: 2025-10-31
**Version**: 1.0
**Author**: Claude Code Implementation
**License**: Proprietary - FloresYa E-Commerce Platform
