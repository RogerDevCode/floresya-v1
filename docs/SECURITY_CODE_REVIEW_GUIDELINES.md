# 🔐 Security Code Review Guidelines

## Overview

This document provides **comprehensive security code review guidelines** for the FloresYa project. It ensures all code changes undergo thorough security review before merging, preventing vulnerabilities from reaching production.

## 🎯 Security Review Checklist

### Pre-Review Requirements

Before requesting a security review, ensure:

- [ ] All security tests pass
- [ ] No console.log statements in security-critical code
- [ ] All input fields are validated
- [ ] Authentication/authorization is properly implemented
- [ ] No sensitive data is logged or exposed

---

## 🔍 Authentication & Authorization Review

### ✅ Authentication Checks

#### Token Validation

```javascript
// ❌ WRONG - No token validation
export async function getProduct(req, res) {
  const userId = req.user.id // Assumes user is authenticated
  // No check if user is actually authenticated
}

// ✅ CORRECT - Verify authentication
export async function getProduct(req, res, next) {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required')
  }
  const userId = req.user.id
}
```

**Review Points:**

- ✅ Verify all protected routes check for authentication
- ✅ Check for proper token validation
- ✅ Ensure tokens are validated on every request
- ✅ Verify token expiration handling
- ✅ Check for token blacklisting on logout

#### JWT Security

```javascript
// ❌ WRONG - Weak JWT implementation
const token = jwt.sign({ userId }, 'secret', { expiresIn: '1d' })

// ✅ CORRECT - Strong JWT implementation
const token = jwt.sign(
  {
    userId: user.id,
    role: user.role,
    sessionId: session.id
  },
  process.env.JWT_SECRET,
  {
    algorithm: 'HS256',
    expiresIn: '15m',
    issuer: 'floresya.com',
    audience: 'floresya-api'
  }
)
```

**Review Points:**

- ✅ Strong secret key (min 32 characters)
- ✅ Proper algorithm (HS256/RS256)
- ✅ Short expiration time
- ✅ Include issuer and audience claims
- ✅ Verify signature on every request

### ✅ Authorization Checks

#### Role-Based Access Control (RBAC)

```javascript
// ❌ WRONG - No role verification
export async function deleteUser(req, res) {
  await userService.deleteUser(req.params.id) // Anyone can delete!
}

// ✅ CORRECT - Role verification
export async function deleteUser(req, res) {
  if (req.user.role !== 'admin') {
    throw new ForbiddenError('Admin access required')
  }
  await userService.deleteUser(req.params.id)
}

// ✅ EVEN BETTER - Use middleware
export const deleteUser = [
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    await userService.deleteUser(req.params.id)
  })
]
```

**Review Points:**

- ✅ Verify role-based access control on all admin routes
- ✅ Check for privilege escalation vulnerabilities
- ✅ Ensure default-deny policy (deny all, allow specific)
- ✅ Verify role hierarchy if applicable
- ✅ Test with different user roles

#### Object-Level Authorization

```javascript
// ❌ WRONG - No resource ownership check
export async function updateOrder(req, res) {
  await orderService.updateOrder(req.params.id, req.body)
}

// ✅ CORRECT - Check ownership
export async function updateOrder(req, res) {
  const order = await orderService.getOrder(req.params.id)
  if (order.user_id !== req.user.id && req.user.role !== 'admin') {
    throw new ForbiddenError('Cannot modify other users orders')
  }
  await orderService.updateOrder(req.params.id, req.body)
}
```

**Review Points:**

- ✅ Verify object-level authorization (OWASP A01)
- ✅ Check for IDOR (Insecure Direct Object Reference)
- ✅ Ensure users can only access their own resources
- ✅ Admin role bypass verification

---

## 🛡️ Input Validation & Sanitization Review

### ✅ XSS Prevention

#### Input Sanitization

```javascript
// ❌ WRONG - No sanitization
export async function createProduct(req, res) {
  const product = await productService.createProduct({
    name: req.body.name, // Directly used without sanitization!
    description: req.body.description
  })
}

// ✅ CORRECT - Input sanitization
import DOMPurify from 'dompurify'

export async function createProduct(req, res) {
  const product = await productService.createProduct({
    name: DOMPurify.sanitize(req.body.name),
    description: DOMPurify.sanitize(req.body.description)
  })
}
```

#### Output Encoding

```javascript
// ❌ WRONG - No output encoding
res.json({
  name: product.name // Could contain XSS
})

// ✅ CORRECT - Output encoding
res.json({
  name: escapeHtml(product.name)
})

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
```

**Review Points:**

- ✅ Verify all user inputs are validated
- ✅ Check for proper sanitization (DOMPurify, validator library)
- ✅ Verify output encoding on all responses
- ✅ Check for dangerous HTML/script rejection
- ✅ Verify file upload sanitization

### ✅ SQL Injection Prevention

#### Query Building

```javascript
// ❌ WRONG - String concatenation
export async function getProduct(req, res) {
  const query = `SELECT * FROM products WHERE id = ${req.params.id}`
  const result = await db.query(query)
}

// ✅ CORRECT - Parameterized queries
export async function getProduct(req, res) {
  const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id])
}

// ✅ BEST - ORM with built-in protection
export async function getProduct(req, res) {
  const product = await Product.findById(req.params.id)
}
```

**Review Points:**

- ✅ Verify all database queries use parameterized statements
- ✅ Check for string concatenation in SQL queries
- ✅ Verify ORM usage (preferred over raw queries)
- ✅ Check for dynamic query building safety
- ✅ Verify whitelist validation for ORDER BY columns

### ✅ Command Injection Prevention

#### System Command Execution

```javascript
// ❌ WRONG - Untrusted input in shell command
import { exec } from 'child_process'

export async function processImage(req, res) {
  exec(`convert ${req.body.filename} output.jpg`) // DANGEROUS!
}

// ✅ CORRECT - No shell execution with user input
export async function processImage(req, res) {
  // Use libraries instead of shell commands
  const sharp = require('sharp')
  const image = sharp(req.file.path)
  await image.toFile('output.jpg')
}
```

**Review Points:**

- ✅ Verify no user input is passed to shell commands
- ✅ Check for exec/spawn usage with user input
- ✅ Verify whitelisting for allowed commands
- ✅ Use libraries instead of shell commands when possible

---

## 🔒 Data Protection Review

### ✅ Sensitive Data Handling

#### PII Protection

```javascript
// ❌ WRONG - Exposing sensitive data
export async function getUser(req, res) {
  const user = await userService.getUser(req.params.id)
  res.json(user) // Returns password hash, etc!
}

// ✅ CORRECT - Data filtering
export async function getUser(req, res) {
  const user = await userService.getUser(req.params.id)
  res.json({
    id: user.id,
    email: user.email,
    name: user.name
    // Password hash, etc. excluded
  })
}
```

#### Password Handling

```javascript
// ❌ WRONG - Plain text password storage
const user = {
  username: 'john',
  password: 'plaintext123' // NEVER!
}

// ✅ CORRECT - Strong hashing
import bcrypt from 'bcrypt'

const user = {
  username: 'john',
  password_hash: await bcrypt.hash('plaintext123', 12) // 12 rounds
}
```

**Review Points:**

- ✅ Verify no sensitive data is exposed in API responses
- ✅ Check for proper password hashing (bcrypt with 12+ rounds)
- ✅ Verify PII is not logged
- ✅ Check for proper data filtering on responses
- ✅ Verify encryption at rest for sensitive data

### ✅ Logging Security

#### Log Sanitization

```javascript
// ❌ WRONG - Logging sensitive data
logger.info('User login', {
  email: req.body.email,
  password: req.body.password // NEVER log passwords!
})

// ✅ CORRECT - Sanitized logging
logger.info('User login attempt', {
  email: req.body.email,
  hasPassword: !!req.body.password
})
```

**Review Points:**

- ✅ Verify no passwords/tokens in logs
- ✅ Check for PII sanitization in logs
- ✅ Verify structured logging (see LOGGING_STANDARDS.md)
- ✅ Check for error message sanitization

---

## 🌐 HTTP Security Review

### ✅ Security Headers

```javascript
// ❌ WRONG - Missing security headers
app.use((req, res, next) => {
  res.json({ data: 'response' })
})

// ✅ CORRECT - Security headers via middleware
import helmet from 'helmet'

app.use(helmet())
// Automatically adds:
// - X-Frame-Options: DENY
// - X-Content-Type-Options: nosniff
// - X-XSS-Protection: 1; mode=block
// - Content-Security-Policy
```

**Review Points:**

- ✅ Verify helmet.js or similar security headers middleware
- ✅ Check for CSP header configuration
- ✅ Verify HSTS header in production
- ✅ Check for X-Frame-Options (clickjacking protection)

### ✅ CORS Configuration

```javascript
// ❌ WRONG - Permissive CORS
app.use(
  cors({
    origin: '*' // Allows ANY origin!
  })
)

// ✅ CORRECT - Restricted CORS
app.use(
  cors({
    origin: ['https://floresya.com', 'https://admin.floresya.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  })
)
```

**Review Points:**

- ✅ Verify CORS origin whitelist
- ✅ Check for credentials handling
- ✅ Verify allowed methods are restricted
- ✅ Check for OPTIONS preflight handling

---

## 🚦 Rate Limiting Review

### ✅ Rate Limiting Implementation

```javascript
// ❌ WRONG - No rate limiting
app.post('/api/auth/login', loginHandler)

// ✅ CORRECT - Rate limiting
import rateLimit from 'express-rate-limit'

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window
  message: 'Too many login attempts',
  standardHeaders: true,
  legacyHeaders: false
})

app.post('/api/auth/login', loginLimiter, loginHandler)
```

**Review Points:**

- ✅ Verify rate limiting on sensitive endpoints
- ✅ Check for different limits per endpoint
- ✅ Verify proper rate limit headers
- ✅ Check for IP-based limiting

---

## 📁 File Upload Security Review

### ✅ File Validation

```javascript
// ❌ WRONG - No file validation
app.post('/api/upload', upload.single('file'), (req, res) => {
  // No validation - dangerous!
  res.json({ url: req.file.path })
})

// ✅ CORRECT - Strict validation
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    // Generate safe filename
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, safeName + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error('Invalid file type'))
  }
})
```

**Review Points:**

- ✅ Verify file type validation (extension AND mimetype)
- ✅ Check for file size limits
- ✅ Verify safe filename generation
- ✅ Check for virus scanning integration
- ✅ Verify path traversal prevention

---

## 🔑 Cryptographic Security Review

### ✅ Crypto Implementation

```javascript
// ❌ WRONG - Weak crypto
const crypto = require('crypto')

function generateToken() {
  return Math.random().toString(36) // NOT random enough!
}

// ✅ CORRECT - Strong crypto
import crypto from 'crypto'

function generateToken() {
  return crypto.randomBytes(32).toString('hex')
}
```

**Review Points:**

- ✅ Verify crypto.randomBytes for random values
- ✅ Check for Math.random usage (predictable!)
- ✅ Verify proper key lengths (256+ bits)
- ✅ Check for deprecated algorithms (MD5, SHA1)

---

## 🔄 Session Management Review

### ✅ Session Security

```javascript
// ❌ WRONG - Insecure session config
app.use(
  session({
    secret: '123', // Too short!
    resave: true,
    saveUninitialized: true
  })
)

// ✅ CORRECT - Secure session config
app.use(
  session({
    name: 'floresya.sid',
    secret: process.env.SESSION_SECRET, // Long, random secret
    resave: false,
    saveUninitialized: false,
    rolling: true, // Reset expiration on every request
    cookie: {
      httpOnly: true, // XSS protection
      secure: process.env.NODE_ENV === 'production', // HTTPS only
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
)
```

**Review Points:**

- ✅ Verify HttpOnly flag
- ✅ Check Secure flag in production
- ✅ Verify SameSite attribute
- ✅ Check session regeneration on login
- ✅ Verify session timeout

---

## ⚠️ Common Security Vulnerabilities

### OWASP Top 10 (2021) - Code Review Checklist

#### 1. A01 - Broken Access Control

- [ ] Object-level authorization on every resource access
- [ ] Role-based access control properly implemented
- [ ] No privilege escalation vulnerabilities
- [ ] Default-deny policy for sensitive operations

#### 2. A02 - Cryptographic Failures

- [ ] Strong encryption algorithms (AES-256, RSA-2048+)
- [ ] No deprecated algorithms (MD5, SHA1, DES)
- [ ] Proper key management
- [ ] HTTPS enforced in production

#### 3. A03 - Injection

- [ ] All SQL queries parameterized
- [ ] No string concatenation in queries
- [ ] Input sanitization on all user inputs
- [ ] Output encoding on all outputs

#### 4. A04 - Insecure Design

- [ ] Security by design principles
- [ ] Threat modeling done
- [ ] Secure defaults

#### 5. A05 - Security Misconfiguration

- [ ] No default credentials
- [ ] Security headers configured
- [ ] Unnecessary features disabled
- [ ] Error messages don't leak info

#### 6. A06 - Vulnerable Components

- [ ] Dependencies up to date
- [ ] No known CVEs in dependencies
- [ ] npm audit passes

#### 7. A07 - Identification and Authentication Failures

- [ ] Strong password policies
- [ ] Multi-factor authentication where needed
- [ ] Proper session management
- [ ] Account lockout after failed attempts

#### 8. A08 - Software and Data Integrity Failures

- [ ] File upload validation
- [ ] Code integrity checks
- [ ] Supply chain security

#### 9. A09 - Security Logging and Monitoring Failures

- [ ] Security events logged
- [ ] Failed authentication attempts logged
- [ ] Proper log retention

#### 10. A10 - Server-Side Request Forgery (SSRF)

- [ ] URL validation
- [ ] External requests restricted
- [ ] Whitelist approach for allowed hosts

---

## 📝 Review Process

### Security Review Workflow

1. **Developer submits code**
   - Include security test results
   - Document security considerations
   - Mark security-sensitive changes

2. **Security reviewer assigned**
   - Review against this checklist
   - Test security controls
   - Check for vulnerabilities

3. **Review feedback**
   - Document security issues
   - Request changes if needed
   - Approve or reject

4. **Verification**
   - Run security tests
   - Confirm fixes
   - Final approval

### Review Template

```markdown
## Security Code Review

### Changes Made

- Brief description of changes
- Files modified
- Security impact

### Review Checklist

- [ ] Authentication & Authorization
- [ ] Input Validation & Sanitization
- [ ] Data Protection
- [ ] HTTP Security
- [ ] Rate Limiting
- [ ] File Upload Security
- [ ] Cryptographic Security
- [ ] Session Management

### Issues Found

1. [Issue description] - [Severity: High/Medium/Low]
2. [Issue description] - [Severity: High/Medium/Low]

### Approval Status

- [ ] Approved - No security issues
- [ ] Approved with minor issues
- [ ] Requires changes
- [ ] Rejected - Critical security issues

### Notes

- Additional security considerations
- Recommendations for improvement
```

---

## ✅ Security Review Best Practices

### ✅ DO

- Review all code changes for security implications
- Test security controls thoroughly
- Check for OWASP Top 10 vulnerabilities
- Verify input validation on all endpoints
- Check for proper authentication/authorization
- Test with different user roles and permissions
- Verify security headers on responses
- Check for sensitive data exposure
- Validate file upload security
- Review error handling for information leakage

### ❌ DON'T

- Skip security review to save time
- Assume code is secure without testing
- Ignore security warnings from tools
- Leave security for later
- Trust user input without validation
- Expose internal implementation details
- Use deprecated security algorithms
- Hardcode secrets in code
- Disable security features for "convenience"

---

## 🛠️ Security Review Tools

### Automated Tools

#### ESLint Security Plugins

```bash
npm install --save-dev eslint-plugin-security
```

#### npm Audit

```bash
npm audit
npm audit fix
```

#### Security Headers Check

```bash
npm install --save-dev helmet
```

### Manual Testing

#### Authentication Testing

```bash
# Test invalid tokens
curl -H "Authorization: Bearer invalid-token" https://api.floresya.com/orders

# Test role escalation
curl -H "Authorization: Bearer user-token" https://api.floresya.com/admin/users
```

#### Input Validation Testing

```bash
# Test XSS
curl -X POST https://api.floresya.com/products \
  -H "Authorization: Bearer admin-token" \
  -d '{"name":"<script>alert(1)</script>"}'

# Test SQL Injection
curl -X POST https://api.floresya.com/products \
  -H "Authorization: Bearer admin-token" \
  -d '{"name":"\'; DROP TABLE products; --"}'
```

---

## 📊 Security Review Metrics

### Review Statistics

- **Code reviews conducted**: Track number of reviews
- **Security issues found**: Track by severity
- **Time to fix security issues**: Measure response time
- **Security test coverage**: % of code covered by security tests

### KPIs

- 100% of security-sensitive code reviewed by security team
- Zero critical security issues in production
- <24 hour response time for critical security issues
- 95%+ security test coverage

---

## 📚 Related Documentation

- `docs/SECURITY_TESTING_STANDARDS.md` - Testing standards
- `docs/LOGGING_STANDARDS.md` - Security logging
- `api/middleware/auth/` - Authentication implementation
- `api/middleware/security/` - Security middleware
- OWASP Top 10: https://owasp.org/www-project-top-ten/

---

## 🔧 Troubleshooting

### Common Security Issues

#### Issue: "Authentication bypass"

**Solution**: Verify authentication middleware is applied to all protected routes

```javascript
// Check route configuration
router.get('/orders', authenticate, getOrders)
```

#### Issue: "Input validation missing"

**Solution**: Add validation middleware to all input fields

```javascript
router.post('/products', [validateBody(productSchema), sanitizeInput], createProduct)
```

#### Issue: "Sensitive data exposed"

**Solution**: Filter response data

```javascript
// Use select() with ORM or manually filter
const user = await User.findById(id).select('-password_hash')
```

---

**Status**: ✅ **ACTIVE** - All code changes must pass security review
**Last Updated**: 2025-10-31
**Owner**: Security Team
**Review**: Continuous - every code change
