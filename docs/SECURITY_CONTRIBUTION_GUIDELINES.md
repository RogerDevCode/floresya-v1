# Security Contribution Guidelines

## 📋 Table of Contents

1. [Introduction](#1-introduction)
2. [Security-First Development](#2-security-first-development)
3. [Contributing Security Tests](#3-contributing-security-tests)
4. [Security Code Review Process](#4-security-code-review-process)
5. [Reporting Vulnerabilities](#5-reporting-vulnerabilities)
6. [Security Best Practices](#6-security-best-practices)
7. [Security Documentation Standards](#7-security-documentation-standards)
8. [Security Testing Standards](#8-security-testing-standards)
9. [Incident Response](#9-incident-response)
10. [Additional Resources](#10-additional-resources)

---

## 1. Introduction

### 🎯 Purpose

This document provides comprehensive guidelines for contributing to security-related aspects of the FloresYa project. Our security-first approach ensures that all code, tests, and documentation meet the highest security standards.

### 🛡️ Security Philosophy

> "Security is not a feature, it's a foundation."

We follow these core principles:

- **Defense in Depth**: Multiple layers of security controls
- **Fail Fast**: Catch security issues early in development
- **Least Privilege**: Minimal necessary access rights
- **Zero Trust**: Verify everything, trust nothing
- **Security by Design**: Built-in security from the ground up

### 📊 Our Security Metrics

```
Current Security Status:
├── Security Tests: 166+ tests
├── OWASP Top 10 Coverage: 100%
├── Pass Rate: 100%
└── Security Score: 98/100
```

---

## 2. Security-First Development

### ✅ Mandatory Security Checklist

Before any code contribution, ensure:

- [ ] **Input Validation**: All user inputs are validated
- [ ] **Output Encoding**: All outputs are properly encoded
- [ ] **Authentication**: All protected endpoints require auth
- [ ] **Authorization**: RBAC is properly implemented
- [ ] **Sanitization**: User data is sanitized before processing
- [ ] **Error Handling**: No sensitive data in error messages
- [ ] **Logging**: Security events are properly logged
- [ ] **Tests**: Security tests are included
- [ ] **Documentation**: Security considerations are documented

### 🚫 Security Anti-Patterns

**NEVER do the following:**

```javascript
// ❌ NEVER: User input without validation
app.post('/api/products', (req, res) => {
  const { name } = req.body // UNSAFE!
  db.query(`SELECT * FROM products WHERE name = '${name}'`)
})

// ❌ NEVER: Bypass authentication in production
if (config.NODE_ENV === 'development') {
  // Don't skip security checks
  req.user = { id: 1, role: 'admin' }
}

// ❌ NEVER: Log sensitive information
console.log('Password:', password) // NEVER!

// ❌ NEVER: Use insecure random
const token = Math.random().toString(36) // NOT SECURE!

// ❌ NEVER: Disable security headers
app.disable('x-powered-by') // INSUFFICIENT!
```

### ✅ Secure Alternatives

```javascript
// ✅ ALWAYS: Validate and sanitize input
app.post('/api/products', validateProduct, async (req, res) => {
  const { name } = req.body
  const sanitizedName = sanitizeString(name)
  // Use parameterized queries
  const result = await db.query('SELECT * FROM products WHERE name = $1', [sanitizedName])
  res.json(result)
})

// ✅ ALWAYS: Use proper authentication
app.post(
  '/api/products',
  authenticate,
  authorize(['admin']),
  asyncHandler(async (req, res) => {
    // Protected logic here
  })
)

// ✅ ALWAYS: Use secure random
import crypto from 'crypto'
const token = crypto.randomBytes(32).toString('hex')

// ✅ ALWAYS: Set security headers
app.use(helmet())
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"]
    }
  })
)
```

---

## 3. Contributing Security Tests

### 📝 Test Categories

We maintain the following security test categories:

1. **Advanced Scenarios** (`tests/security/advanced-scenarios.test.js`)
   - Multi-vector attacks
   - Time-based attacks
   - Encoding bypasses
   - Race conditions
   - Cryptographic attacks

2. **Core Security** (`tests/security/security.test.js`)
   - Authentication & authorization
   - RBAC testing
   - Session management
   - Rate limiting

3. **Input Validation** (`tests/security/validation-security.test.js`)
   - XSS prevention
   - SQL injection prevention
   - Input sanitization
   - Schema validation

4. **Attack Vectors** (`tests/security/advanced-attack-vectors.test.js`)
   - SSRF prevention
   - Path traversal
   - Command injection
   - Prototype pollution

### 🔨 Writing Security Tests

#### Template for New Security Tests

```javascript
/**
 * Security Test Template
 *
 * Test Naming Convention:
 * - should prevent {attack_vector} in {component}
 * - should handle {security_scenario}
 */

import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../api/app.js'

describe('Security - {Component}', () => {
  const adminToken = 'Bearer valid-admin-token'

  describe('{Attack Vector}', () => {
    it('should prevent {attack_description}', async () => {
      // 1. Setup: Define malicious payload
      const maliciousPayload = {
        name: '<script>alert("XSS")</script>',
        price_usd: 10.99
      }

      // 2. Execute: Send request
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', adminToken)
        .send(maliciousPayload)

      // 3. Assert: Verify rejection or sanitization
      expect([400, 404, 500]).toContain(response.status)

      // Additional checks
      if (response.status === 200) {
        // If allowed, verify sanitization
        expect(response.body.data.name).not.toContain('<script>')
      }
    })

    it('should validate {security_control} strictly', async () => {
      // Test security control
    })
  })
})
```

#### Test Coverage Checklist

When adding new tests, ensure coverage for:

- [ ] **Positive Tests**: Normal valid inputs
- [ ] **Negative Tests**: Invalid/malicious inputs
- [ ] **Edge Cases**: Boundary conditions
- [ ] **Sanitization**: Verify output is clean
- [ ] **Authorization**: Role-based access
- [ ] **Rate Limiting**: Throttling behavior
- [ ] **Error Handling**: Proper error messages
- [ ] **Logging**: Security event logging

### 🚀 Running Security Tests

```bash
# Run all security tests
npm test tests/security/

# Run specific test file
npm test tests/security/advanced-attack-vectors.test.js

# Run with coverage
npm run test:coverage -- tests/security/

# Run in watch mode (development)
npm test tests/security/ --watch

# Run tests matching pattern
npm test -- --grep "should prevent SQL injection"
```

### 📊 Test Metrics

We track these security test metrics:

```
Security Test Metrics:
├── Total Tests: 166+
├── Pass Rate: 100%
├── Duration: <5 seconds
├── Coverage: OWASP Top 10 (100%)
└── Categories: 7 main categories

Per Category:
├── Advanced Scenarios: 25 tests
├── Security Core: 43 tests
├── Input Validation: 40 tests
├── API Security: 15 tests
├── Session Security: 20 tests
├── Rate Limiting: 15 tests
└── Validation: 9 tests
```

---

## 4. Security Code Review Process

### 🔍 Review Checklist

#### Pre-Review Preparation

**Author Must:**

- [ ] Run all security tests locally
- [ ] Review OWASP Top 10 implications
- [ ] Verify input validation is complete
- [ ] Check authentication/authorization
- [ ] Validate error handling
- [ ] Review logging for sensitive data
- [ ] Test edge cases manually
- [ ] Update documentation

#### Reviewer Must Check

**Authentication & Authorization**

- [ ] All protected endpoints require authentication
- [ ] RBAC is properly implemented
- [ ] No privilege escalation possible
- [ ] Session management is secure
- [ ] Token validation is strict

**Input Validation**

- [ ] All inputs are validated
- [ ] Type checking is enforced
- [ ] Range validation exists
- [ ] Format validation is strict
- [ ] Length limits are enforced
- [ ] Sanitization is applied

**Data Security**

- [ ] SQL injection prevented (parameterized queries)
- [ ] NoSQL injection prevented
- [ ] XSS prevented (output encoding)
- [ ] CSRF tokens where needed
- [ ] Sensitive data not logged
- [ ] Encryption for sensitive data

**Error Handling**

- [ ] No sensitive data in errors
- [ ] Errors are properly handled
- [ ] Generic error messages to users
- [ ] Detailed errors logged server-side
- [ ] Stack traces not exposed

**Security Headers**

- [ ] CSP configured appropriately
- [ ] HSTS enabled (production)
- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options set
- [ ] X-XSS-Protection enabled

#### Security Review Process

```
Step 1: Initial Review
├── Author submits PR
├── Security label added
├── Security reviewer assigned
└── Initial security checklist completed

Step 2: Security Analysis
├── Deep security review
├── Threat modeling check
├── OWASP Top 10 review
└── Security test verification

Step 3: Testing
├── Security tests pass
├── Manual testing completed
├── Penetration testing (if needed)
└── Final approval

Step 4: Merge
├── Security gate passed
├── Documentation updated
├── Merge approved by security team
└── Changes deployed
```

### 🏷️ Security Labels

We use labels to categorize security-related PRs:

- `🔒 security`: General security improvements
- `🔴 critical`: Critical security fixes
- `⚠️ vulnerability`: Vulnerability patches
- `🧪 security-test`: New security tests
- `📚 security-docs`: Security documentation
- `✅ security-reviewed`: Reviewed and approved
- `🚨 security-incident`: Incident response

### 👥 Security Reviewers

**Required Reviewers:**

- 1 Security team member (mandatory)
- 1 Senior developer (code quality)
- 1 QA engineer (testing)

**Rotation Schedule:**

- Security reviews rotate weekly
- Primary reviewer: Security team lead
- Backup reviewer: Senior engineers
- Emergency reviewer: On-call rotation

---

## 5. Reporting Vulnerabilities

### 🚨 Reporting Process

**If you discover a security vulnerability:**

#### 1. DO NOT disclose publicly

❌ **DO NOT:**

- Create a public issue
- Post on forums
- Share on social media
- Email non-security personnel

✅ **DO:**

- Email: security@floresya.com
- Include detailed description
- Provide reproduction steps
- Suggest potential impact
- Allow time for remediation

#### 2. Vulnerability Report Template

```markdown
Subject: [SECURITY] Vulnerability Report - {Brief Description}

Vulnerability Type: {e.g., SQL Injection, XSS, etc.}
Severity: {Critical/High/Medium/Low}
Affected Components: {e.g., /api/products, authentication, etc.}

Description:
{Detailed description of the vulnerability}

Reproduction Steps:

1. Step one
2. Step two
3. See screenshot...

Expected Behavior:
{What should happen}

Actual Behavior:
{What actually happens}

Impact:
{Assessment of potential damage}

Suggested Fix:
{Your recommendation (optional)}

Proof of Concept:
{Code/Steps to reproduce}

Environment:

- Version: {e.g., 1.0.0}
- Browser: {if applicable}
- OS: {e.g., Linux, Windows}

Reporter:

- Name: {Your name}
- Email: {Your email}
- GitHub: {Your username}
```

#### 3. Response Timeline

```
Immediate Response (within 24 hours):
├── Acknowledgment received
├── Initial assessment
├── Triage assigned
└── Timeline provided

Investigation (within 7 days):
├── Root cause analysis
├── Impact assessment
├── Fix development begins
└── Status update sent

Remediation (varies by severity):
├── Critical: 24-48 hours
├── High: 7 days
├── Medium: 30 days
└── Low: 90 days

Post-Fix:
├── Verification testing
├── Deployment
├── Public disclosure (if applicable)
└── Retrospective conducted
```

### 🏆 Vulnerability Rewards

We appreciate responsible disclosure:

- **Critical**: $500 - $2000
- **High**: $200 - $500
- **Medium**: $50 - $200
- **Low**: Recognition in hall of fame

_Reward amounts may vary based on impact and quality of report._

### 📜 Responsible Disclosure Policy

- We will acknowledge receipt within 24 hours
- We will provide regular updates
- We will not take legal action against researchers
- We appreciate coordinated disclosure
- We may request additional information
- We will credit researchers (unless requested otherwise)

---

## 6. Security Best Practices

### 🔐 Authentication Best Practices

```javascript
// ✅ Use strong authentication
import bcrypt from 'bcrypt'

const hashedPassword = await bcrypt.hash(password, 12) // 12+ rounds

// ✅ Verify tokens strictly
const token = req.headers.authorization?.replace('Bearer ', '')
if (!token || !isValidJWT(token)) {
  throw new UnauthorizedError('Invalid token')
}

// ✅ Implement proper session management
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie: {
      httpOnly: true,
      secure: true, // HTTPS only
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
)
```

### 🛡️ Input Validation

```javascript
// ✅ Validate all inputs
function validateProduct(data) {
  // Type validation
  if (typeof data.name !== 'string') {
    throw new ValidationError('Name must be a string')
  }

  // Length validation
  if (data.name.length < 2 || data.name.length > 100) {
    throw new ValidationError('Name must be 2-100 characters')
  }

  // Format validation
  if (!/^[a-zA-Z0-9\s\-]+$/.test(data.name)) {
    throw new ValidationError('Name contains invalid characters')
  }

  // Range validation
  if (data.price_usd < 0 || data.price_usd > 10000) {
    throw new ValidationError('Price must be between 0 and 10000')
  }

  return data
}

// ✅ Sanitize inputs
function sanitizeString(str) {
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .substring(0, 255) // Limit length
}
```

### 🔒 Authorization

```javascript
// ✅ Implement RBAC
function authorize(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new ForbiddenError('Insufficient permissions')
    }

    next()
  }
}

// ✅ Check ownership
function checkOwnership(getOwnerId) {
  return async (req, res, next) => {
    const resourceOwnerId = await getOwnerId(req)
    const userId = req.user.id

    if (userId !== resourceOwnerId && req.user.role !== 'admin') {
      throw new ForbiddenError('Not resource owner')
    }

    next()
  }
}
```

### 💾 Secure Data Handling

```javascript
// ✅ Use parameterized queries
const query = `
  SELECT * FROM products
  WHERE name = $1 AND price < $2
`
const result = await db.query(query, [name, maxPrice])

// ✅ Encrypt sensitive data
import crypto from 'crypto'

function encrypt(text) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv + ':' + encrypted
}

// ✅ Hash sensitive data
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}
```

### 📝 Secure Logging

```javascript
// ✅ Log security events
logger.warn('Authentication failed', {
  eventType: 'AUTH_FAILURE',
  userId: req.user?.id,
  ip: req.ip,
  userAgent: req.get('user-agent'),
  timestamp: new Date().toISOString()
})

// ✅ Sanitize logs
function sanitizeForLog(data) {
  const sensitiveFields = ['password', 'token', 'secret', 'key']
  const sanitized = { ...data }

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  })

  return sanitized
}
```

---

## 7. Security Documentation Standards

### 📚 Documentation Requirements

Every security-related change must include:

1. **Security Impact Statement**
   - What was changed
   - Security implications
   - Risk assessment
   - Mitigation measures

2. **Test Documentation**
   - What was tested
   - Test coverage
   - Test results
   - OWASP mapping

3. **Deployment Notes**
   - Configuration changes
   - Environment variables
   - Security checklist

### 📄 Documentation Template

```markdown
## Security Change: {Brief Description}

### Summary

{Brief overview of the security change}

### Impact Assessment

- **Severity**: {Critical/High/Medium/Low}
- **Affected Components**: {List components}
- **Attack Vectors**: {How could this be exploited}
- **Potential Impact**: {What could happen if exploited}

### Changes Made

1. {Change 1}
2. {Change 2}
3. {Change 3}

### Security Controls

- ✅ Authentication required
- ✅ Authorization enforced
- ✅ Input validation applied
- ✅ Output encoding used
- ✅ Error handling secure
- ✅ Logging implemented

### Testing

- **Unit Tests**: {Number} tests added/updated
- **Integration Tests**: {Number} tests added/updated
- **Security Tests**: {Number} tests added/updated
- **Manual Testing**: Completed
- **Penetration Testing**: {If applicable}

### OWASP Top 10 Mapping

- **A01**: {Status - How addressed}
- **A02**: {Status - How addressed}
- ...

### Documentation Updated

- [ ] API documentation
- [ ] Security documentation
- [ ] Configuration guide
- [ ] Runbook updated

### Rollback Plan

{How to rollback if needed}

### References

- OWASP: {Relevant OWASP resources}
- CVE: {If applicable}
- Industry best practices
```

---

## 8. Security Testing Standards

### 🎯 Test Quality Standards

All security tests must:

1. **Be Descriptive**
   - Clear test names
   - Descriptive comments
   - Expected behavior documented

2. **Be Comprehensive**
   - Test normal cases
   - Test edge cases
   - Test malicious cases
   - Test error conditions

3. **Be Reliable**
   - Consistent results
   - No flaky tests
   - Proper setup/teardown
   - Appropriate timeouts

4. **Be Fast**
   - Execute in <100ms when possible
   - Use mocks appropriately
   - Avoid unnecessary I/O
   - Parallel execution

### 📊 Coverage Requirements

Minimum test coverage:

```
Security Test Coverage:
├── Lines: 95%
├── Branches: 90%
├── Functions: 95%
├── Statements: 95%
└── OWASP Top 10: 100%

Per Category:
├── Authentication: 100%
├── Authorization: 100%
├── Input Validation: 100%
├── Output Encoding: 100%
├── Error Handling: 95%
└── Business Logic: 90%
```

### 🧪 Test Types

We implement multiple test types:

1. **Unit Tests**
   - Test individual functions
   - Fast execution
   - Mocked dependencies

2. **Integration Tests**
   - Test component interactions
   - Test API endpoints
   - Test database operations

3. **Security Tests**
   - Test security controls
   - Test attack vectors
   - Test vulnerabilities

4. **E2E Tests**
   - Test complete user flows
   - Test security in real scenarios
   - Cross-browser testing

---

## 9. Incident Response

### 🚨 Incident Classification

**Severity Levels:**

| Level         | Description                 | Response Time | Example                  |
| ------------- | --------------------------- | ------------- | ------------------------ |
| P0 (Critical) | Active breach, data exposed | 15 minutes    | SQL injection exploited  |
| P1 (High)     | Vulnerability exploitable   | 2 hours       | XSS in user profile      |
| P2 (Medium)   | Security weakness           | 24 hours      | Missing input validation |
| P3 (Low)      | Security improvement        | 72 hours      | Add security header      |

### 📋 Incident Response Process

```
Detection
  ↓
Triage (15 min)
  ↓
Assessment (1 hour)
  ↓
Containment (varies)
  ↓
Investigation (varies)
  ↓
Remediation (varies)
  ↓
Recovery (varies)
  ↓
Post-Incident Review (1 week)
```

### 📞 Emergency Contacts

**Security Team:**

- Security Lead: security-lead@floresya.com
- Security Engineer: security-eng@floresya.com
- Emergency Hotline: +1-XXX-XXX-XXXX

**On-Call Rotation:**

- Week 1: User A
- Week 2: User B
- Week 3: User C
- Week 4: User A

### 🛠️ Incident Response Checklist

**Immediate Response (0-1 hour):**

- [ ] Acknowledge incident
- [ ] Classify severity
- [ ] Assign incident commander
- [ ] Assemble response team
- [ ] Document initial findings

**Investigation (1-24 hours):**

- [ ] Gather evidence
- [ ] Determine scope
- [ ] Identify root cause
- [ ] Assess impact
- [ ] Develop remediation plan

**Remediation (varies):**

- [ ] Implement fixes
- [ ] Test fixes
- [ ] Deploy to production
- [ ] Verify fix effectiveness
- [ ] Monitor for recurrence

**Post-Incident (1 week):**

- [ ] Conduct retrospective
- [ ] Update documentation
- [ ] Improve processes
- [ ] Share lessons learned
- [ ] Update incident response plan

---

## 10. Additional Resources

### 📚 Learning Resources

**OWASP Resources:**

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- OWASP Cheat Sheets: https://cheatsheetseries.owasp.org/
- OWASP Testing Guide: https://owasp.org/www-project-web-security-testing-guide/

**Security Testing Tools:**

- Burp Suite: Web application security testing
- OWASP ZAP: Penetration testing
- npm audit: Dependency vulnerability scanning
- ESLint security: Static security analysis

**Books:**

- "The Web Application Hacker's Handbook"
- "Hacking: The Art of Exploitation"
- "Secure Coding Principles and Practices"

### 🔗 Useful Links

**Project Documentation:**

- Security Testing Standards: `SECURITY_TESTING_STANDARDS.md`
- Security Architecture: `SECURITY_ARCHITECTURE_DIAGRAMS.md`
- Code Review Guidelines: `SECURITY_CODE_REVIEW_GUIDELINES.md`

**Internal Resources:**

- Security Team Wiki: InternalConfluence
- Security Slack Channel: #security
- Security Meetings: Thursdays 2 PM

**External Resources:**

- SANS: https://www.sans.org/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
- CVE Database: https://cve.mitre.org/

---

## 🎓 Certification & Training

We encourage team members to pursue security certifications:

- **Certified Secure Coding Lifecycle Professional (CSCLP)**
- **Certified Ethical Hacker (CEH)**
- **Certified Information Systems Security Professional (CISSP)**
- **SANS GIAC Certifications**

**Training Budget:**

- $2,000 per developer per year
- Conference attendance supported
- Online course subscriptions available
- Internal security workshops monthly

---

## 🏆 Recognition Program

**Security Champions:**

- Monthly recognition for security contributions
- Security champion program for each team
- Special badge for security PR reviewers
- Annual security awards

**Contributing to Security:**

- Report vulnerabilities responsibly
- Contribute security tests
- Review security PRs
- Write security documentation
- Participate in security reviews

---

## 📊 Metrics & KPIs

We track these security metrics:

```
Security KPIs:
├── Vulnerability Count
│   ├── Critical: 0
│   ├── High: <5
│   ├── Medium: <20
│   └── Low: <50
│
├── Test Coverage
│   ├── Security Tests: 166+
│   ├── Pass Rate: 100%
│   ├── OWASP Coverage: 100%
│   └── Code Coverage: 95%+
│
├── Incident Metrics
│   ├── Mean Time to Detect: <1 hour
│   ├── Mean Time to Respond: <2 hours
│   ├── Mean Time to Resolve: <24 hours
│   └── Recurrence Rate: <5%
│
└── Compliance
    ├── OWASP Top 10: 100%
    ├── NIST Framework: 90%
    └── ISO 27001: 85%
```

---

## ✅ Contribution Checklist

Before submitting a security-related contribution:

**Code Quality:**

- [ ] Code follows security guidelines
- [ ] ESLint security rules pass
- [ ] No security anti-patterns
- [ ] Proper error handling
- [ ] Security headers configured

**Testing:**

- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Security tests written
- [ ] All tests pass
- [ ] Coverage >95%

**Documentation:**

- [ ] Code comments added
- [ ] Security considerations documented
- [ ] API documentation updated
- [ ] Change log updated
- [ ] Security impact assessed

**Review:**

- [ ] Self-review completed
- [ ] Security checklist passed
- [ ] Peer review requested
- [ ] Security team review requested
- [ ] QA approval obtained

---

## 🎯 Conclusion

Security is everyone's responsibility. By following these guidelines, we maintain the highest security standards and protect our users' data.

**Remember:**

- Security is not optional
- Think like an attacker
- Test thoroughly
- Review carefully
- Document everything
- Stay updated

**Contact the Security Team:**

- Email: security@floresya.com
- Slack: #security
- Emergency: +1-XXX-XXX-XXXX

---

**Document Version**: 1.0
**Last Updated**: 2025-10-31
**Maintained By**: Security Architecture Team
**Review Cycle**: Quarterly

---

_Thank you for contributing to the security of the FloresYa project! 🛡️_
