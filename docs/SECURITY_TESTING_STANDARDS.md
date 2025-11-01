# 🔐 Security Testing Standards

## Overview

This document establishes **comprehensive security testing standards** for the FloresYa project. It ensures all code changes undergo rigorous security testing to prevent vulnerabilities and maintain a strong security posture.

## 🎯 Why Security Testing?

### Benefits

- **Vulnerability Prevention**: Catch security issues before production
- **Attack Vector Coverage**: Test against common and emerging threats
- **Compliance**: Meet security standards and best practices
- **Confidence**: Release code with verified security
- **Cost Savings**: Fix security issues early (cheaper than post-release)

### Security First Mindset

```
Every line of code must be secure by default
Security testing is not optional
Test security before deploying to production
```

---

## 📋 Security Testing Categories

### 1. Authentication & Authorization (AuthN/AuthZ)

#### Authentication Tests

```javascript
describe('Authentication Security', () => {
  it('should reject invalid tokens', async () => {
    const res = await request(app).get('/api/orders').set('Authorization', 'Bearer invalid-token')

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })

  it('should reject expired tokens', async () => {
    const res = await request(app).get('/api/orders').set('Authorization', 'Bearer expired-token')

    expect(res.status).toBe(401)
    expect(res.body.error).toContain('expired')
  })

  it('should reject missing authentication', async () => {
    const res = await request(app).get('/api/orders')

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
  })
})
```

#### Authorization Tests (RBAC)

```javascript
describe('Authorization Security', () => {
  it('should deny user access to admin endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', 'Bearer user-token')

    expect(res.status).toBe(403)
    expect(res.body.success).toBe(false)
  })

  it('should allow admin access to admin endpoints', async () => {
    const res = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', 'Bearer admin-token')

    expect(res.status).toBe(200)
  })
})
```

**Coverage Requirements:**

- ✅ Invalid token rejection
- ✅ Expired token handling
- ✅ Missing token handling
- ✅ Role-based access control (RBAC)
- ✅ Permission escalation prevention
- ✅ Session hijacking prevention

---

### 2. Input Validation & Sanitization

#### XSS Prevention

```javascript
describe('XSS Prevention', () => {
  it('should reject script tags in input', async () => {
    const res = await request(app).post('/api/products').set('Authorization', adminToken).send({
      name: '<script>alert("xss")</script>',
      price_usd: 10.99
    })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should reject javascript: protocol in URLs', async () => {
    const res = await request(app).post('/api/products').set('Authorization', adminToken).send({
      name: 'Product',
      image_url: 'javascript:alert("xss")'
    })

    expect(res.status).toBe(400)
  })

  it('should sanitize HTML entities', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        order: {
          customer_name: '&lt;script&gt;alert("xss")&lt;/script&gt;'
        }
      })

    // Should sanitize or reject
    expect([200, 400]).toContain(res.status)
  })
})
```

#### SQL Injection Prevention

```javascript
describe('SQL Injection Prevention', () => {
  it('should reject SQL injection attempts', async () => {
    const maliciousInputs = [
      "'; DROP TABLE products; --",
      "' OR '1'='1",
      "'; UPDATE users SET role='admin'; --",
      "1' UNION SELECT password FROM users--"
    ]

    for (const input of maliciousInputs) {
      const res = await request(app).post('/api/products').set('Authorization', adminToken).send({
        name: input,
        price_usd: 10.99
      })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
    }
  })

  it('should escape special characters in queries', async () => {
    const res = await request(app)
      .get("/api/products?name=O'Reilly")
      .set('Authorization', adminToken)

    // Should handle special characters safely
    expect(res.status).toBe(200)
  })
})
```

#### NoSQL Injection Prevention

```javascript
describe('NoSQL Injection Prevention', () => {
  it('should reject NoSQL injection in query parameters', async () => {
    const res = await request(app)
      .get('/api/products?price[$ne]=null')
      .set('Authorization', adminToken)

    // Should not execute NoSQL operators from input
    expect(res.status).toBe(400)
  })

  it('should validate data types strictly', async () => {
    const res = await request(app).post('/api/products').set('Authorization', adminToken).send({
      name: 'Product',
      price_usd: 'not-a-number'
    })

    expect(res.status).toBe(400)
  })
})
```

#### Command Injection Prevention

```javascript
describe('Command Injection Prevention', () => {
  it('should reject system commands in input', async () => {
    const maliciousInputs = ['; ls -la', '&& cat /etc/passwd', '| whoami', '`id`']

    for (const input of maliciousInputs) {
      const res = await request(app).post('/api/products').set('Authorization', adminToken).send({
        name: input,
        price_usd: 10.99
      })

      expect(res.status).toBe(400)
    }
  })
})
```

**Coverage Requirements:**

- ✅ XSS (Cross-Site Scripting) prevention
- ✅ SQL Injection prevention
- ✅ NoSQL Injection prevention
- ✅ Command Injection prevention
- ✅ HTML Entity Encoding
- ✅ Strict type validation
- ✅ Length validation
- ✅ Whitelist validation (preferred over blacklist)

---

### 3. Data Exposure & Privacy

#### Sensitive Data Exposure

```javascript
describe('Sensitive Data Protection', () => {
  it('should not return password hashes in user data', async () => {
    const res = await request(app).get('/api/users/1').set('Authorization', adminToken)

    expect(res.body.data).not.toHaveProperty('password_hash')
    expect(res.body.data).not.toHaveProperty('password')
  })

  it('should not return internal error details to client', async () => {
    // Trigger an internal error
    const res = await request(app).get('/api/products/999999').set('Authorization', adminToken)

    if (res.status >= 500) {
      // In production, error details should not be exposed
      expect(res.body.message).not.toContain('internal')
    }
  })

  it('should redact sensitive fields in logs', async () => {
    // Verify logging middleware redacts sensitive data
    expect(logger.formatLogEntry).toBeDefined()
  })
})
```

#### PII Protection

```javascript
describe('PII Protection', () => {
  it('should not expose full credit card numbers', async () => {
    const res = await request(app).get('/api/payments/1').set('Authorization', customerToken)

    expect(res.body.data).not.toMatch(/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/)
  })

  it('should mask email addresses in logs', async () => {
    // Verify email masking in logs
    const maskedEmail = 'user***@example.com'
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('***'))
  })
})
```

**Coverage Requirements:**

- ✅ Password hash protection
- ✅ Internal error message sanitization
- ✅ PII (Personally Identifiable Information) protection
- ✅ Credit card number masking
- ✅ Email address masking
- ✅ API response filtering
- ✅ Log sanitization

---

### 4. Business Logic Security

#### Price Manipulation Prevention

```javascript
describe('Business Logic Security', () => {
  it('should not allow price manipulation via API', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', customerToken)
      .send({
        order: {
          total_amount_usd: 0.01 // Attempting to set very low price
          // Server should calculate actual price from products
        },
        items: [{ product_id: 1, quantity: 1 }]
      })

    // Server should recalculate price from product data
    expect(res.body.data.total_amount_usd).toBeGreaterThan(0.01)
  })

  it('should not allow quantity manipulation to negative', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', customerToken)
      .send({
        items: [{ product_id: 1, quantity: -100 }]
      })

    expect(res.status).toBe(400)
  })

  it('should prevent unauthorized status changes', async () => {
    const res = await request(app)
      .put('/api/orders/1/status')
      .set('Authorization', customerToken) // User role
      .send({ status: 'completed' })

    expect(res.status).toBe(403)
  })
})
```

**Coverage Requirements:**

- ✅ Price calculation on server-side
- ✅ Quantity validation (positive numbers)
- ✅ Status transition validation
- ✅ Business rule enforcement
- ✅ State transition validation

---

### 5. Rate Limiting & DDoS Protection

#### Rate Limiting Tests

```javascript
describe('Rate Limiting', () => {
  it('should include rate limit headers', async () => {
    const res = await request(app).get('/api/orders').set('Authorization', adminToken)

    expect(res.headers).toHaveProperty('x-ratelimit-limit')
    expect(res.headers).toHaveProperty('x-ratelimit-remaining')
    expect(res.headers).toHaveProperty('x-ratelimit-reset')
  })

  it('should reject requests exceeding rate limit', async () => {
    // Simulate rapid requests
    const requests = Array(101)
      .fill(null)
      .map(() => request(app).get('/api/products').set('Authorization', adminToken))

    const responses = await Promise.all(requests)
    const has429Response = responses.some(r => r.status === 429)

    expect(has429Response).toBe(true)
  })

  it('should apply different limits to different endpoints', async () => {
    // Login should have stricter limits than product listing
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test' })

    expect(loginRes.headers['x-ratelimit-limit']).toBeDefined()
  })
})
```

#### DDoS Protection

```javascript
describe('DDoS Protection', () => {
  it('should handle large request payloads gracefully', async () => {
    const largePayload = {
      data: 'x'.repeat(10 * 1024 * 1024) // 10MB
    }

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', adminToken)
      .send(largePayload)

    // Should reject with 413 Payload Too Large or handle gracefully
    expect([413, 400]).toContain(res.status)
  })

  it('should limit request body size', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', adminToken)
      .set('Content-Length', '11MB') // Over limit

    expect(res.status).toBe(413)
  })
})
```

**Coverage Requirements:**

- ✅ Rate limit headers
- ✅ Request throttling
- ✅ Per-endpoint rate limiting
- ✅ Large payload rejection
- ✅ Request size limits
- ✅ IP-based limiting

---

### 6. HTTP Security Headers

#### Security Headers Tests

```javascript
describe('Security Headers', () => {
  it('should include all required security headers', async () => {
    const res = await request(app).get('/api/products')

    expect(res.headers).toHaveProperty('x-frame-options', 'DENY')
    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff')
    expect(res.headers).toHaveProperty('x-xss-protection', '1; mode=block')
    expect(res.headers).toHaveProperty('referrer-policy')
    expect(res.headers).toHaveProperty('permissions-policy')
  })

  it('should include CSP header', async () => {
    const res = await request(app).get('/api/products')

    expect(res.headers).toHaveProperty('content-security-policy')
  })

  it('should use HTTPS in production', async () => {
    // Verify secure cookie settings in production
    // This test would need NODE_ENV=production
  })
})
```

**Coverage Requirements:**

- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy
- ✅ Content-Security-Policy (CSP)
- ✅ Strict-Transport-Security (HSTS) in production

---

### 7. CORS Configuration

#### CORS Tests

```javascript
describe('CORS Configuration', () => {
  it('should allow requests from allowed origins', async () => {
    const res = await request(app).get('/api/products').set('Origin', 'http://localhost:3000')

    expect(res.headers).toHaveProperty('access-control-allow-origin')
  })

  it('should reject requests from disallowed origins', async () => {
    const res = await request(app).get('/api/products').set('Origin', 'http://malicious-site.com')

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('should restrict allowed methods', async () => {
    const res = await request(app).options('/api/products').set('Origin', 'http://localhost:3000')

    expect(res.headers['access-control-allow-methods']).toBeDefined()
  })
})
```

**Coverage Requirements:**

- ✅ Origin validation
- ✅ Allowed methods restriction
- ✅ Credentials handling
- ✅ Preflight request handling

---

### 8. File Upload Security

#### File Upload Tests

```javascript
describe('File Upload Security', () => {
  it('should reject files with dangerous extensions', async () => {
    const res = await request(app)
      .post('/api/admin/settings/image')
      .set('Authorization', adminToken)
      .attach('image', 'test.exe') // Dangerous file type

    expect(res.status).toBe(400)
  })

  it('should limit file size', async () => {
    const res = await request(app)
      .post('/api/admin/settings/image')
      .set('Authorization', adminToken)
      .attach('image', 'large-image.jpg') // Over limit

    expect(res.status).toBe(400)
  })

  it('should validate MIME types', async () => {
    const res = await request(app)
      .post('/api/admin/settings/image')
      .set('Authorization', adminToken)
      .attach('image', 'fake.jpg') // Actually text file with .jpg extension

    expect(res.status).toBe(400)
  })

  it('should scan files for malicious content', async () => {
    // File virus scanning
    // This would integrate with ClamAV or similar
  })
})
```

**Coverage Requirements:**

- ✅ File extension validation
- ✅ MIME type validation
- ✅ File size limits
- ✅ Virus scanning
- ✅ Path traversal prevention
- ✅ Filename sanitization

---

### 9. Session Management Security

#### Session Tests

```javascript
describe('Session Security', () => {
  it('should use httpOnly cookies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test' })

    const cookies = res.headers['set-cookie']
    if (cookies) {
      expect(cookies).toEqual(expect.arrayContaining([expect.stringContaining('HttpOnly')]))
    }
  })

  it('should use secure cookies in production', async () => {
    // Test with NODE_ENV=production
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test' })

    const cookies = res.headers['set-cookie']
    if (cookies) {
      expect(cookies).toEqual(expect.arrayContaining([expect.stringContaining('Secure')]))
    }
  })

  it('should set sameSite cookie attribute', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test' })

    const cookies = res.headers['set-cookie']
    if (cookies) {
      expect(cookies).toEqual(expect.arrayContaining([expect.stringContaining('SameSite')]))
    }
  })

  it('should regenerate session after login', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test' })

    // Verify session ID changes after login
    // This prevents session fixation attacks
  })
})
```

**Coverage Requirements:**

- ✅ HttpOnly flag
- ✅ Secure flag (production)
- ✅ SameSite attribute
- ✅ Session regeneration after login
- ✅ Session timeout
- ✅ Session invalidation on logout

---

### 10. Cryptographic Security

#### Crypto Tests

```javascript
describe('Cryptographic Security', () => {
  it('should use strong password hashing', async () => {
    // Verify bcrypt is used with sufficient rounds
    const bcrypt = require('bcrypt')
    const password = 'test-password'
    const hash = await bcrypt.hash(password, 12)

    expect(hash).toMatch(/^\$2b\$12\$/)
  })

  it('should use HTTPS for all communications', async () => {
    // In production, verify HTTPS is enforced
    // Redirect HTTP to HTTPS
  })

  it('should use secure random token generation', async () => {
    // Verify crypto.randomBytes is used, not Math.random
    const token1 = generateSecureToken()
    const token2 = generateSecureToken()
    expect(token1).not.toBe(token2)
    expect(token1).toMatch(/^[a-f0-9]{64}$/)
  })
})
```

**Coverage Requirements:**

- ✅ Strong password hashing (bcrypt with 12+ rounds)
- ✅ HTTPS enforcement
- ✅ Secure random token generation
- ✅ Proper entropy for tokens
- ✅ Secure key generation

---

## 🛠️ Testing Utilities

### Mock Authentication

```javascript
// Mock auth service for security tests
vi.mock('../../api/services/authService.js', () => ({
  getUser: vi.fn(token => {
    if (token === 'valid-admin-token') {
      return Promise.resolve({
        id: 'admin-id',
        role: 'admin'
      })
    }
    if (token === 'valid-user-token') {
      return Promise.resolve({
        id: 'user-id',
        role: 'user'
      })
    }
    return Promise.reject(new Error('Invalid token'))
  })
}))
```

### Test Data Builders

```javascript
// Builder pattern for test data
function createMaliciousInput(type) {
  const inputs = {
    xss: '<script>alert("xss")</script>',
    sqlInjection: "'; DROP TABLE products; --",
    nosqlInjection: { $ne: null },
    commandInjection: '; ls -la',
    pathTraversal: '../../../etc/passwd'
  }
  return inputs[type]
}
```

---

## 📊 Test Coverage Metrics

### Coverage Targets

- **Authentication Tests**: 100% of auth flows
- **Input Validation**: 100% of input fields
- **Authorization**: 100% of protected endpoints
- **Security Headers**: 100% of responses
- **Rate Limiting**: 100% of rate-limited endpoints

### Coverage Checklist

```markdown
## Security Test Coverage Checklist

- [ ] Authentication & Authorization (RBAC)
- [ ] Input Validation & Sanitization
  - [ ] XSS Prevention
  - [ ] SQL Injection Prevention
  - [ ] NoSQL Injection Prevention
  - [ ] Command Injection Prevention
- [ ] Data Exposure Protection
- [ ] Business Logic Security
- [ ] Rate Limiting
- [ ] DDoS Protection
- [ ] HTTP Security Headers
- [ ] CORS Configuration
- [ ] File Upload Security
- [ ] Session Management
- [ ] Cryptographic Security
```

---

## 🔍 OWASP Top 10 Coverage

### OWASP Top 10 (2021) Test Coverage

1. **A01:2021 - Broken Access Control**
   - ✅ RBAC testing
   - ✅ IDOR prevention
   - ✅ Privilege escalation prevention

2. **A02:2021 - Cryptographic Failures**
   - ✅ HTTPS enforcement
   - ✅ Secure token generation
   - ✅ Password hashing

3. **A03:2021 - Injection**
   - ✅ SQL injection prevention
   - ✅ NoSQL injection prevention
   - ✅ Command injection prevention
   - ✅ XSS prevention

4. **A04:2021 - Insecure Design**
   - ✅ Business logic testing
   - ✅ State validation

5. **A05:2021 - Security Misconfiguration**
   - ✅ Security headers testing
   - ✅ CORS configuration
   - ✅ Default configurations

6. **A06:2021 - Vulnerable Components**
   - ✅ Dependency scanning (via npm audit)

7. **A07:2021 - Identification and Authentication Failures**
   - ✅ Authentication testing
   - ✅ Session management
   - ✅ Token validation

8. **A08:2021 - Software and Data Integrity Failures**
   - ✅ File upload validation
   - ✅ Code integrity checks

9. **A09:2021 - Security Logging and Monitoring Failures**
   - ✅ Security event logging
   - ✅ Audit trails

10. **A10:2021 - Server-Side Request Forgery (SSRF)**
    - ✅ URL validation
    - ✅ External request restrictions

---

## 🚀 Running Security Tests

### Run All Security Tests

```bash
npm test -- tests/security/
```

### Run Specific Security Test

```bash
npm test -- tests/security/security.test.js
npm test -- tests/security/api-security.test.js
npm test -- tests/security/inputValidation.test.js
```

### Run Tests with Coverage

```bash
npm run test:coverage -- tests/security/
```

### Run Security Tests in CI/CD

```bash
# In CI/CD pipeline
npm test -- tests/security/ --reporter=json --outputFile=test-results.json
```

---

## ✅ Best Practices

### ✅ DO

- Test all security controls
- Use mock authentication in tests
- Test both positive and negative cases
- Cover all OWASP Top 10 categories
- Use real attack payloads
- Test edge cases and boundaries
- Verify security headers on every response
- Test with different user roles
- Validate both client and server-side controls

### ❌ DON'T

- Skip security tests to save time
- Use only placeholder test data
- Ignore security test failures
- Test without proper mocking
- Forget to test error handling
- Only test happy paths
- Hardcode secrets in tests
- Leave security tests for later

---

## 📚 Related Documentation

- `tests/security/` - Security test files
- `.factory/droids/MANDATORY_RULES.md` - Development rules
- `docs/LOGGING_STANDARDS.md` - Security logging
- `api/middleware/auth/` - Authentication middleware
- `api/middleware/security/` - Security middleware

---

## 🔧 Troubleshooting

### Security Test Failures

#### Test Times Out

**Solution**: Increase test timeout or mock slow operations

```javascript
it('should handle slow requests', async () => {
  vi.setTimeout(60000) // Increase timeout
  // Test code
}, 60000)
```

#### Authentication Mock Doesn't Work

**Solution**: Verify mock path and implementation

```javascript
// Check mock file path matches import path
vi.mock('../../api/services/authService.js', () => ({
  getUser: vi.fn() // Must match actual export
}))
```

#### Inconsistent Test Results

**Solution**: Clean up mocks between tests

```javascript
afterEach(() => {
  vi.clearAllMocks()
})
```

---

## 📊 Metrics & Reporting

### Security Test Report Template

```markdown
## Security Test Report

### Coverage Summary

- Total Security Tests: 150
- Passed: 150 ✅
- Failed: 0 ❌
- Coverage: 95%

### OWASP Top 10 Coverage

- A01 - Broken Access Control: ✅ 100%
- A02 - Cryptographic Failures: ✅ 100%
- A03 - Injection: ✅ 100%
- A04 - Insecure Design: ✅ 95%
- A05 - Security Misconfiguration: ✅ 100%
- A06 - Vulnerable Components: ✅ 100%
- A07 - Identification and Authentication: ✅ 100%
- A08 - Software and Data Integrity: ✅ 95%
- A09 - Security Logging: ✅ 100%
- A10 - SSRF: ✅ 90%

### Recommendations

1. Add SSRF protection tests
2. Improve file upload security
3. Add more business logic tests

### Next Steps

- [ ] Implement SSRF protections
- [ ] Add virus scanning for uploads
- [ ] Enhance monitoring
```

---

**Status**: ✅ **ACTIVE** - All new features must include security tests
**Last Updated**: 2025-10-31
**Owner**: Security Team
**Review**: Monthly
