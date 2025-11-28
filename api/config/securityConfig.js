/**
 * Centralized Security Configuration
 * Enterprise-grade security settings and policies
 *
 * Features:
 * - Security service configurations
 * - Threat detection thresholds
 * - Compliance requirements
 * - Rate limiting settings
 * - Encryption parameters
 * - Audit logging policies
 * - Data retention policies
 */

import config from './configLoader.js'

/**
 * Security Configuration Object
 */
export const SECURITY_CONFIG = {
  // Input Sanitization Configuration
  INPUT_SANITIZATION: {
    // Character sets and validation
    ALLOWED_CHARSETS: {
      ASCII: /^[\x20-\x7E]*$/,
      EXTENDED_ASCII: /^[\x20-\x7E\xA0-\xFF]*$/,
      UNICODE: /^[\p{L}\p{N}\s\-_.,@:;!?()[\]{}"'/\\]*$/u,
      EMAIL: /^[a-zA-Z0-9._%+-@]*$/,
      PHONE: /^[0-9+\-\s()]*$/,
      ALPHANUMERIC: /^[a-zA-Z0-9]*$/,
      URL_SAFE: /^[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]*$/
    },

    // Length limits
    LENGTH_LIMITS: {
      DEFAULT: 1000,
      EMAIL: 254,
      PHONE: 20,
      NAME: 100,
      ADDRESS: 500,
      DESCRIPTION: 2000,
      URL: 2048,
      SEARCH_QUERY: 200,
      FILENAME: 255,
      PASSWORD: 128,
      TOKEN: 8192
    },

    // Security patterns
    SECURITY_PATTERNS: {
      // SQL Injection patterns
      SQL_INJECTION: [
        /(%27)|(')|(--)|(%23)|#/gi,
        /(%3B)|;/gi,
        /(%3D)|=/gi,
        /(%2B)|\+/gi,
        /(%2D)|-/gi,
        /(%40)|@/gi,
        /(%7C)|\|/gi,
        /(%26)|&/gi,
        /(%3C)|</gi,
        /(%3E)|>/gi,
        /union[\s]+select/gi,
        /drop[\s]+table/gi,
        /delete[\s]+from/gi,
        /insert[\s]+into/gi,
        /update[\s]+set/gi
      ],

      // XSS patterns
      XSS_PATTERNS: [
        /<script[\s\S]*?<\/script>/gi,
        /<iframe[\s\S]*?<\/iframe>/gi,
        /<object[\s\S]*?<\/object>/gi,
        /<embed[\s\S]*?<\/embed>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /on\w+\s*=/gi,
        /<img[^>]*src[^>]*javascript:/gi
      ],

      // Command injection patterns
      COMMAND_INJECTION: [
        /(\||&|;|`|\$\(|\$\{|\$\()/i,
        /\b(curl|wget|nc|netcat|telnet|ssh|ftp|sftp)\b/i,
        /\b(rm|mv|cp|cat|ls|ps|kill|chmod|chown)\b/i,
        /\b(python|perl|ruby|node|php|bash|sh|cmd|powershell)\b/i
      ],

      // Path traversal patterns
      PATH_TRAVERSAL: [/\.\.\//g, /\.\.\\/g, /\.\.%2f/gi, /\.\.%5c/gi, /%2e%2e%2f/gi, /%2e%2e%5c/gi]
    },

    // HTML entity encoding
    HTML_ENTITIES: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
      '(': '&#40;',
      ')': '&#41;',
      '[': '[',
      ']': ']',
      '{': '&#123;',
      '}': '&#125;'
    }
  },

  // Malware Scanning Configuration
  MALWARE_SCANNING: {
    // Allowed file types
    ALLOWED_FILE_TYPES: {
      'image/jpeg': {
        extensions: ['.jpg', '.jpeg'],
        magicNumbers: [/^\xFF\xD8\xFF/],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        description: 'JPEG Image'
      },
      'image/png': {
        extensions: ['.png'],
        // eslint-disable-next-line no-control-regex
        magicNumbers: [/^\x89\x50\x4E\x47\x0D\x0A\x1A\x0A/],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        description: 'PNG Image'
      },
      'image/webp': {
        extensions: ['.webp'],
        magicNumbers: [/^RIFF....WEBP/],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        description: 'WebP Image'
      }
    },

    // Dangerous extensions
    DANGEROUS_EXTENSIONS: [
      '.exe',
      '.bat',
      '.cmd',
      '.com',
      '.pif',
      '.scr',
      '.vbs',
      '.js',
      '.jar',
      '.app',
      '.deb',
      '.pkg',
      '.dmg',
      '.rpm',
      '.msi',
      '.msp',
      '.php',
      '.php3',
      '.php4',
      '.php5',
      '.phtml',
      '.pl',
      '.py',
      '.rb',
      '.cgi',
      '.sh',
      '.bash',
      '.zsh',
      '.fish',
      '.ps1',
      '.asp',
      '.aspx'
    ],

    // Suspicious patterns
    SUSPICIOUS_PATTERNS: [
      /<script[\s\S]*?<\/script>/gi,
      /<%[\s\S]*?%>/g,
      /<\?php[\s\S]*?\?>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /eval\s*\(/gi,
      /exec\s*\(/gi,
      /system\s*\(/gi,
      /shell_exec\s*\(/gi,
      /base64_decode\s*\(/gi
    ],

    // Heuristic analysis
    HEURISTIC_ANALYSIS: {
      HIGH_ENTROPY_THRESHOLD: 7.5,
      EXECUTABLE_PATTERNS: [
        /^\x4D\x5A/, // Windows PE
        /^\x7FELF/, // Linux ELF
        /^\xCA\xFE\xBA\xBE/, // Java class
        /^\xFC\xCF\xAB/ // Compressed executable
      ]
    },

    // Quarantine settings
    QUARANTINE: {
      DIRECTORY: process.env.QUARANTINE_DIR || './quarantine',
      AUTO_DELETE_DAYS: 30,
      MAX_QUARANTINE_SIZE: 100 * 1024 * 1024 * 1024 // 100GB
    }
  },

  // Account Security Configuration
  ACCOUNT_SECURITY: {
    // Lockout settings
    LOCKOUT: {
      MAX_ATTEMPTS: 5,
      LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
      INCREMENTAL_LOCKOUT: true,
      LOCKOUT_MULTIPLIER: 2
    },

    // Password requirements
    PASSWORD_REQUIREMENTS: {
      MIN_LENGTH: 8,
      MAX_LENGTH: 128,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBERS: true,
      REQUIRE_SPECIAL_CHARS: true,
      FORBIDDEN_PATTERNS: [/password/i, /123456/, /qwerty/i, /admin/i, /letmein/i, /welcome/i]
    },

    // Session security
    SESSION_SECURITY: {
      MAX_CONCURRENT_SESSIONS: 5,
      SESSION_TIMEOUT: 60 * 60 * 1000, // 1 hour
      IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
      SECURE_COOKIES: true,
      HTTP_ONLY: true,
      SAME_SITE: 'strict'
    },

    // Rate limiting
    RATE_LIMITING: {
      LOGIN_ATTEMPTS: {
        WINDOW: 15 * 60 * 1000, // 15 minutes
        MAX_ATTEMPTS: 10
      },
      PASSWORD_RESET: {
        WINDOW: 60 * 60 * 1000, // 1 hour
        MAX_ATTEMPTS: 3
      },
      ACCOUNT_CREATION: {
        WINDOW: 60 * 60 * 1000, // 1 hour
        MAX_ATTEMPTS: 5
      }
    },

    // Anomaly detection
    ANOMALY_DETECTION: {
      UNUSUAL_LOCATION_THRESHOLD: 500, // km
      UNUSUAL_TIME_THRESHOLD: 8, // hours
      RAPID_SUCCESSIVE_LOGINS: 5, // logins in 5 minutes
      FAILED_LOGIN_THRESHOLD: 10 // failed attempts
    }
  },

  // Data Protection Configuration
  DATA_PROTECTION: {
    // Encryption settings
    ENCRYPTION: {
      ALGORITHM: 'aes-256-gcm',
      KEY_LENGTH: 32, // 256 bits
      IV_LENGTH: 16, // 128 bits
      TAG_LENGTH: 16, // 128 bits
      SALT_LENGTH: 32, // 256 bits
      SCRYPT_PARAMS: {
        N: 32768, // CPU/memory cost
        r: 8, // Block size
        p: 1 // Parallelization
      }
    },

    // Data retention policies
    RETENTION_POLICIES: {
      USER_DATA: 2555, // 7 years
      ORDER_DATA: 1825, // 5 years
      PAYMENT_DATA: 1095, // 3 years
      AUDIT_LOGS: 2555, // 7 years
      SESSION_DATA: 30, // 30 days
      TEMPORARY_DATA: 7, // 7 days
      ERROR_LOGS: 90 // 90 days
    },

    // PII detection patterns
    PII_PATTERNS: {
      EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      PHONE: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
      SSN: /\b\d{3}-\d{2}-\d{4}\b/g,
      CREDIT_CARD: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
      IP_ADDRESS: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
      URL: /https?:\/\/[^\s]+/g,
      PASSPORT: /\b[A-Z]{2}\d{7,8}\b/g,
      DRIVING_LICENSE: /\b[A-Z]{1,2}\d{6,8}\b/g
    },

    // Data masking patterns
    MASKING_PATTERNS: {
      EMAIL: {
        pattern: /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
        mask: (match, username, domain) => {
          const visibleChars = Math.min(2, username.length)
          const masked =
            username.substring(0, visibleChars) + '*'.repeat(username.length - visibleChars)
          return `${masked}@${domain}`
        }
      },
      PHONE: {
        pattern: /(\d{3})(\d{3})(\d{4})/g,
        mask: (match, area, prefix, line) => `${area}-***-${line}`
      },
      CREDIT_CARD: {
        pattern: /(\d{4})(\d{4,8})(\d{4})/g,
        mask: (match, first, middle, last) => `${first}-****-****-${last}`
      },
      SSN: {
        pattern: /(\d{3})(\d{2})(\d{4})/g,
        mask: (match, area, group, serial) => `${area}-**-${serial}`
      }
    }
  },

  // Audit Logging Configuration
  AUDIT_LOGGING: {
    // Event categories
    CATEGORIES: {
      AUTHENTICATION: 'AUTHENTICATION',
      AUTHORIZATION: 'AUTHORIZATION',
      DATA_ACCESS: 'DATA_ACCESS',
      DATA_MODIFICATION: 'DATA_MODIFICATION',
      SYSTEM_CONFIG: 'SYSTEM_CONFIG',
      SECURITY_INCIDENT: 'SECURITY_INCIDENT',
      USER_MANAGEMENT: 'USER_MANAGEMENT',
      FILE_OPERATIONS: 'FILE_OPERATIONS',
      API_ACCESS: 'API_ACCESS',
      ADMIN_ACTIONS: 'ADMIN_ACTIONS',
      COMPLIANCE: 'COMPLIANCE',
      NETWORK: 'NETWORK',
      SESSION: 'SESSION',
      ENCRYPTION: 'ENCRYPTION'
    },

    // Security event types
    EVENT_TYPES: {
      // Authentication events
      LOGIN_SUCCESS: 'LOGIN_SUCCESS',
      LOGIN_FAILED: 'LOGIN_FAILED',
      LOGOUT: 'LOGOUT',
      PASSWORD_CHANGE: 'PASSWORD_CHANGE',
      PASSWORD_RESET: 'PASSWORD_RESET',
      ACCOUNT_LOCKOUT: 'ACCOUNT_LOCKOUT',
      ACCOUNT_UNLOCK: 'ACCOUNT_UNLOCK',
      MFA_ENABLED: 'MFA_ENABLED',
      MFA_DISABLED: 'MFA_DISABLED',

      // Authorization events
      ACCESS_GRANTED: 'ACCESS_GRANTED',
      ACCESS_DENIED: 'ACCESS_DENIED',
      PRIVILEGE_ESCALATION: 'PRIVILEGE_ESCALATION',
      ROLE_CHANGE: 'ROLE_CHANGE',
      PERMISSION_CHANGE: 'PERMISSION_CHANGE',

      // Data access events
      DATA_READ: 'DATA_READ',
      DATA_WRITE: 'DATA_WRITE',
      DATA_DELETE: 'DATA_DELETE',
      DATA_EXPORT: 'DATA_EXPORT',
      DATA_IMPORT: 'DATA_IMPORT',
      PII_ACCESS: 'PII_ACCESS',
      SENSITIVE_DATA_ACCESS: 'SENSITIVE_DATA_ACCESS',

      // Security incidents
      MALWARE_DETECTED: 'MALWARE_DETECTED',
      INTRUSION_ATTEMPT: 'INTRUSION_ATTEMPT',
      BRUTE_FORCE_ATTACK: 'BRUTE_FORCE_ATTACK',
      XSS_ATTEMPT: 'XSS_ATTEMPT',
      SQL_INJECTION_ATTEMPT: 'SQL_INJECTION_ATTEMPT',
      DOS_ATTACK: 'DOS_ATTACK',
      SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',

      // User management
      USER_CREATED: 'USER_CREATED',
      USER_UPDATED: 'USER_UPDATED',
      USER_DELETED: 'USER_DELETED',
      USER_SUSPENDED: 'USER_SUSPENDED',
      USER_REACTIVATED: 'USER_REACTIVATED',

      // File operations
      FILE_UPLOADED: 'FILE_UPLOADED',
      FILE_DOWNLOADED: 'FILE_DOWNLOADED',
      FILE_DELETED: 'FILE_DELETED',
      FILE_QUARANTINED: 'FILE_QUARANTINED',
      FILE_RESTORED: 'FILE_RESTORED',

      // API access
      API_REQUEST: 'API_REQUEST',
      API_RESPONSE: 'API_RESPONSE',
      API_ERROR: 'API_ERROR',
      RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

      // Admin actions
      ADMIN_LOGIN: 'ADMIN_LOGIN',
      ADMIN_ACTION: 'ADMIN_ACTION',
      SYSTEM_SETTING_CHANGE: 'SYSTEM_SETTING_CHANGE',
      AUDIT_LOG_VIEWED: 'AUDIT_LOG_VIEWED',

      // Compliance
      GDPR_REQUEST: 'GDPR_REQUEST',
      DATA_RETENTION_CLEANUP: 'DATA_RETENTION_CLEANUP',
      CONSENT_GRANTED: 'CONSENT_GRANTED',
      CONSENT_REVOKED: 'CONSENT_REVOKED',

      // Network
      IP_BLOCKED: 'IP_BLOCKED',
      IP_UNBLOCKED: 'IP_UNBLOCKED',
      FIREWALL_RULE_CHANGE: 'FIREWALL_RULE_CHANGE',

      // Session
      SESSION_CREATED: 'SESSION_CREATED',
      SESSION_DESTROYED: 'SESSION_DESTROYED',
      SESSION_EXPIRED: 'SESSION_EXPIRED',
      SESSION_HIJACKING: 'SESSION_HIJACKING',

      // Encryption
      ENCRYPT_OPERATION: 'ENCRYPT_OPERATION',
      DECRYPT_OPERATION: 'DECRYPT_OPERATION',
      KEY_GENERATED: 'KEY_GENERATED',
      KEY_ROTATED: 'KEY_ROTATED'
    },

    // Severity levels
    SEVERITY_LEVELS: {
      CRITICAL: 'CRITICAL',
      HIGH: 'HIGH',
      MEDIUM: 'MEDIUM',
      LOW: 'LOW',
      INFO: 'INFO'
    },

    // Compliance frameworks
    COMPLIANCE_FRAMEWORKS: {
      GDPR: 'GDPR',
      SOX: 'SOX',
      PCI_DSS: 'PCI_DSS',
      HIPAA: 'HIPAA',
      ISO27001: 'ISO27001'
    },

    // Alert thresholds
    ALERT_THRESHOLDS: {
      FAILED_LOGIN_ATTEMPTS: {
        threshold: 5,
        window: 15 * 60 * 1000, // 15 minutes
        severity: 'HIGH'
      },
      PRIVILEGE_ESCALATION: {
        threshold: 1,
        window: 60 * 60 * 1000, // 1 hour
        severity: 'CRITICAL'
      },
      PII_ACCESS: {
        threshold: 10,
        window: 60 * 60 * 1000, // 1 hour
        severity: 'MEDIUM'
      },
      MALWARE_DETECTED: {
        threshold: 1,
        window: 24 * 60 * 60 * 1000, // 24 hours
        severity: 'CRITICAL'
      }
    },

    // Log management
    LOG_MANAGEMENT: {
      MAX_EVENTS_PER_CATEGORY: 10000,
      RETENTION_DAYS: 90,
      ROTATION_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
      COMPRESSION_ENABLED: true,
      INTEGRITY_CHECK: true
    }
  },

  // Rate Limiting Configuration
  RATE_LIMITING: {
    // General rate limiting
    GENERAL: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 1000, // Increased for development/testing
      skipSuccessfulRequests: false
    },

    // API endpoints
    API_ENDPOINTS: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5000 // Increased for development/testing
    },

    // Authentication endpoints
    AUTH_ENDPOINTS: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10
    },

    // File upload endpoints
    FILE_UPLOAD: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100 // Increased for development/testing
    },

    // Admin endpoints
    ADMIN_ENDPOINTS: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 200 // Increased for development/testing
    },

    // Critical operations
    CRITICAL_OPERATIONS: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100 // Increased for development/testing
    }
  },

  // Security Headers Configuration
  SECURITY_HEADERS: {
    // Content Security Policy
    CSP: {
      enabled: true,
      reportOnly: false,
      reportUri: process.env.CSP_REPORT_URI || null,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-eval'"], // Development allows eval
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://*.supabase.co'],
        fontSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        childSrc: ["'none'"],
        workerSrc: ["'none'"]
      }
    },

    // HSTS
    HSTS: {
      enabled: config.IS_PRODUCTION,
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },

    // Feature Policy
    FEATURE_POLICY: {
      enabled: true,
      directives: {
        geolocation: ["'self'"],
        microphone: ["'none'"],
        camera: ["'none'"],
        payment: ["'none'"],
        usb: ["'none'"],
        magnetometer: ["'none'"],
        gyroscope: ["'none'"],
        accelerometer: ["'none'"],
        'ambient-light-sensor': ["'none'"],
        autoplay: ["'self'"],
        'encrypted-media': ["'self'"],
        fullscreen: ["'self'"],
        'picture-in-picture': ["'self'"]
      }
    },

    // Additional headers
    ADDITIONAL_HEADERS: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'X-Security-Middleware': 'enhanced',
      'X-Protection-Level': 'enterprise'
    }
  },

  // CORS Configuration
  CORS: {
    allowedOrigins: config.server.cors.allowedOrigins,
    credentials: config.server.cors.credentials,
    methods: config.server.cors.methods,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400 // 24 hours
  },

  // Monitoring and Alerting
  MONITORING: {
    // Security metrics
    METRICS: {
      TRACK_FAILED_LOGINS: true,
      TRACK_MALWARE_DETECTIONS: true,
      TRACK_RATE_LIMIT_VIOLATIONS: true,
      TRACK_ANOMALOUS_ACTIVITIES: true,
      TRACK_DATA_BREACHES: true
    },

    // Alert channels
    ALERT_CHANNELS: {
      EMAIL: {
        enabled: process.env.SECURITY_ALERTS_EMAIL === 'true',
        recipients: process.env.SECURITY_ALERTS_RECIPIENTS?.split(',') || [],
        template: 'security-alert'
      },
      SLACK: {
        enabled: process.env.SECURITY_ALERTS_SLACK === 'true',
        webhook: process.env.SECURITY_ALERTS_SLACK_WEBHOOK,
        channel: '#security-alerts'
      },
      WEBHOOK: {
        enabled: process.env.SECURITY_ALERTS_WEBHOOK === 'true',
        url: process.env.SECURITY_ALERTS_WEBHOOK_URL,
        secret: process.env.SECURITY_ALERTS_WEBHOOK_SECRET
      }
    },

    // Dashboard settings
    DASHBOARD: {
      enabled: true,
      refreshInterval: 30 * 1000, // 30 seconds
      maxEvents: 100,
      realTimeUpdates: true
    }
  },

  // Environment-specific settings
  ENVIRONMENT: {
    isDevelopment: config.IS_DEVELOPMENT,
    isProduction: config.IS_PRODUCTION,
    isTest: config.IS_TEST,

    // Development overrides
    development: {
      strictMode: false,
      verboseLogging: true,
      mockMalwareScanning: true,
      relaxedRateLimits: true,
      allowInsecureHeaders: true
    },

    // Production overrides
    production: {
      strictMode: true,
      verboseLogging: false,
      mockMalwareScanning: false,
      relaxedRateLimits: false,
      allowInsecureHeaders: false
    }
  }
}

/**
 * Get security configuration for specific module
 * @param {string} module - Module name
 * @returns {Object} Module configuration
 */
export function getSecurityConfig(module) {
  const moduleConfig = SECURITY_CONFIG[module.toUpperCase()]

  if (!moduleConfig) {
    throw new Error(`Security configuration module '${module}' not found`)
  }

  // Apply environment-specific overrides
  if (SECURITY_CONFIG.ENVIRONMENT.isDevelopment) {
    return { ...moduleConfig, ...SECURITY_CONFIG.ENVIRONMENT.development }
  }

  if (SECURITY_CONFIG.ENVIRONMENT.isProduction) {
    return { ...moduleConfig, ...SECURITY_CONFIG.ENVIRONMENT.production }
  }

  return moduleConfig
}

/**
 * Check if security feature is enabled
 * @param {string} feature - Feature name
 * @returns {boolean} Is enabled
 */
export function isSecurityFeatureEnabled(feature) {
  const featurePath = feature.split('.')
  let config = SECURITY_CONFIG

  for (const path of featurePath) {
    config = config[path]
    if (config === undefined) {
      return false
    }
  }

  return Boolean(config)
}

/**
 * Get current security level
 * @returns {string} Security level
 */
export function getSecurityLevel() {
  if (SECURITY_CONFIG.ENVIRONMENT.isDevelopment) {
    return 'development'
  }

  if (SECURITY_CONFIG.ENVIRONMENT.isProduction) {
    return 'production'
  }

  return 'standard'
}

export default SECURITY_CONFIG
