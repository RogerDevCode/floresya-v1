/**
 * Benchmark Configuration
 * Defines benchmark parameters, thresholds, and alerting rules
 */
// @ts-nocheck

export const benchmarkConfig = {
  // General benchmark settings
  general: {
    iterations: 100,
    concurrency: 10,
    warmupIterations: 10,
    timeout: 30000,
    outputDir: './benchmark-results',
    baselineFile: './benchmark-baseline.json'
  },

  // CI/CD optimized settings (faster for regular runs)
  ci: {
    iterations: 50,
    concurrency: 5,
    warmupIterations: 5,
    timeout: 15000,
    outputDir: './benchmark-results',
    baselineFile: './benchmark-baseline.json'
  },

  // Performance regression thresholds
  thresholds: {
    regressionThreshold: 0.1, // 10% degradation threshold
    criticalRegressionThreshold: 0.25, // 25% degradation (critical)
    errorRateThreshold: 0.05, // 5% error rate threshold
    responseTimeThreshold: 1000, // 1 second response time threshold
    throughputDropThreshold: 0.15 // 15% throughput drop threshold
  },

  // API benchmark configuration
  api: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    endpoints: [
      {
        path: '/health',
        method: 'GET',
        name: 'Health Check',
        expectedMaxTime: 2000,
        critical: true
      },
      {
        path: '/api/products',
        method: 'GET',
        name: 'Get Products',
        expectedMaxTime: 500,
        critical: true
      },
      {
        path: '/api/products?limit=10&offset=0',
        method: 'GET',
        name: 'Get Products Paginated',
        expectedMaxTime: 300,
        critical: true
      },
      {
        path: '/api/users/profile',
        method: 'GET',
        name: 'Get User Profile',
        auth: true,
        expectedMaxTime: 800,
        critical: false
      },
      {
        path: '/api/orders',
        method: 'GET',
        name: 'Get Orders',
        auth: true,
        expectedMaxTime: 600,
        critical: false
      },
      {
        path: '/api/occasions',
        method: 'GET',
        name: 'Get Occasions',
        expectedMaxTime: 400,
        critical: true
      }
    ]
  },

  // Database benchmark configuration
  database: {
    queries: [
      {
        name: 'Simple Product Select',
        query: client => client.from('products').select('id, name, price').limit(10),
        description: 'Basic product listing query',
        expectedMaxTime: 50,
        critical: true
      },
      {
        name: 'Product with Category Join',
        query: client => client.from('products').select('*, categories(name)').limit(10),
        description: 'Product query with category join',
        expectedMaxTime: 100,
        critical: true
      },
      {
        name: 'Complex Product Filter',
        query: client =>
          client
            .from('products')
            .select('*, categories(name)')
            .gte('price', 10)
            .lte('price', 100)
            .eq('active', true)
            .order('price', { ascending: false })
            .limit(20),
        description: 'Complex filtering and sorting',
        expectedMaxTime: 150,
        critical: true
      },
      {
        name: 'User Orders Query',
        query: client =>
          client.from('orders').select('*, order_items(*, products(name, price))').limit(5),
        description: 'Orders with items and product details',
        expectedMaxTime: 200,
        critical: false
      },
      {
        name: 'Search Query',
        query: client => client.from('products').select('*').ilike('name', '%flower%').limit(10),
        description: 'Text search query',
        expectedMaxTime: 80,
        critical: true
      },
      {
        name: 'Analytics Query',
        query: client =>
          client
            .from('orders')
            .select('total, created_at')
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false }),
        description: 'Monthly analytics query',
        expectedMaxTime: 120,
        critical: false
      }
    ]
  },

  // Cache benchmark configuration
  cache: {
    operations: [
      {
        name: 'L1 Cache Get',
        operation: 'get',
        description: 'L1 cache read operations',
        expectedMaxTime: 5,
        critical: true
      },
      {
        name: 'L1 Cache Set',
        operation: 'set',
        description: 'L1 cache write operations',
        expectedMaxTime: 10,
        critical: true
      },
      {
        name: 'L2 Cache Get (Miss)',
        operation: 'get_miss',
        description: 'L2 cache read operations (cache misses)',
        expectedMaxTime: 50,
        critical: true
      },
      {
        name: 'Cache Invalidation',
        operation: 'delete',
        description: 'Cache invalidation operations',
        expectedMaxTime: 15,
        critical: true
      },
      {
        name: 'Bulk Cache Operations',
        operation: 'bulk',
        description: 'Bulk cache operations',
        expectedMaxTime: 100,
        critical: false
      }
    ]
  },

  // Alerting configuration
  alerting: {
    slack: {
      enabled: process.env.SLACK_WEBHOOK_URL ? true : false,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: '#performance-alerts',
      username: 'Performance Monitor'
    },
    email: {
      enabled: process.env.SMTP_HOST ? true : false,
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT || 587,
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
      from: process.env.ALERT_FROM_EMAIL || 'performance@floresya.com',
      to: process.env.ALERT_TO_EMAILS ? process.env.ALERT_TO_EMAILS.split(',') : []
    },
    github: {
      enabled: true,
      createIssue: true,
      labels: ['performance', 'regression', 'urgent']
    }
  },

  // Reporting configuration
  reporting: {
    formats: ['json', 'html', 'markdown'],
    retention: {
      days: 30,
      maxFiles: 100
    },
    historical: {
      enabled: true,
      maxDataPoints: 1000,
      trendAnalysis: {
        enabled: true,
        windowSize: 7 // days
      }
    }
  },

  // Environment-specific overrides
  environments: {
    development: {
      iterations: 20,
      concurrency: 2,
      thresholds: {
        regressionThreshold: 0.2 // More lenient in development
      }
    },
    staging: {
      iterations: 50,
      concurrency: 5,
      thresholds: {
        regressionThreshold: 0.15
      }
    },
    production: {
      iterations: 100,
      concurrency: 10,
      thresholds: {
        regressionThreshold: 0.1 // Strictest in production
      }
    }
  }
}

/**
 * Get configuration for current environment
 */
export function getConfigForEnvironment(env = process.env.NODE_ENV || 'development') {
  const baseConfig = { ...benchmarkConfig }
  const envOverrides = benchmarkConfig.environments[env] || {}

  // Deep merge environment overrides
  return deepMerge(baseConfig, envOverrides)
}

/**
 * Deep merge utility
 */
function deepMerge(target, source) {
  const result = { ...target }

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key])
    } else {
      result[key] = source[key]
    }
  }

  return result
}

/**
 * Validate configuration
 */
export function validateConfig(config) {
  const errors = []

  // Check required fields
  if (!config.api?.baseUrl) {
    errors.push('API base URL is required')
  }

  if (!config.database?.queries?.length) {
    errors.push('Database queries configuration is required')
  }

  if (!config.cache?.operations?.length) {
    errors.push('Cache operations configuration is required')
  }

  // Validate thresholds
  if (config.thresholds.regressionThreshold <= 0 || config.thresholds.regressionThreshold > 1) {
    errors.push('Regression threshold must be between 0 and 1')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
