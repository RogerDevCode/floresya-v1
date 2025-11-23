/**
 * Code Quality Gates Configuration
 * Centralized configuration for all quality gate thresholds and settings
 */
// @ts-nocheck

export const qualityGatesConfig = {
  // Overall scoring weights (must sum to 1.0)
  weights: {
    codeQuality: 0.25,
    security: 0.25,
    performance: 0.15,
    testing: 0.2,
    documentation: 0.1,
    architecture: 0.05
  },

  // Quality thresholds
  thresholds: {
    excellent: { min: 90, max: 100 },
    good: { min: 80, max: 89 },
    fair: { min: 60, max: 79 },
    poor: { min: 0, max: 59 }
  },

  // Category-specific thresholds
  categories: {
    codeQuality: {
      eslint: { maxErrors: 0, maxWarnings: 5 },
      prettier: { mustPass: true },
      fileSize: { maxKb: 50 }
    },

    security: {
      vulnerabilities: {
        critical: { max: 0 },
        high: { max: 0 },
        moderate: { max: 5 },
        low: { max: 10 }
      },
      secrets: { maxPatterns: 0 }
    },

    performance: {
      consoleLogs: { maxInProduction: 0 },
      bundleSize: { maxKb: 100 },
      responseTime: { maxMs: 2000 }
    },

    testing: {
      coverage: {
        lines: { minPct: 80 },
        functions: { minPct: 80 },
        branches: { minPct: 75 },
        statements: { minPct: 80 }
      },
      testFiles: { minCount: 10 }
    },

    documentation: {
      readme: { required: true },
      apiDocs: { required: true },
      jsdoc: { minCoveragePct: 70 }
    },

    architecture: {
      controllers: { required: true },
      services: { required: true },
      repositories: { required: true },
      errorHandler: { required: true },
      validation: { required: true }
    }
  },

  // Pre-commit hook settings
  preCommit: {
    enabled: true,
    failOnError: true,
    checks: {
      lintStaged: true,
      unitTests: true,
      securityAudit: true,
      functionVerification: false // Disabled due to false positives
    }
  },

  // Commit message validation
  commitMessage: {
    enabled: true,
    rules: {
      'type-enum': [
        2,
        'always',
        [
          'build',
          'chore',
          'ci',
          'docs',
          'feat',
          'fix',
          'perf',
          'refactor',
          'revert',
          'style',
          'test',
          'security'
        ]
      ],
      'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
      'subject-empty': [2, 'never'],
      'subject-full-stop': [2, 'never', '.'],
      'header-max-length': [2, 'always', 100],
      'scope-empty': [0, 'never']
    }
  },

  // CI/CD integration
  ci: {
    enabled: true,
    failPipeline: {
      onLowScore: false, // Don't fail on low scores, just warn
      onSecurityIssues: true,
      onTestFailures: true
    },
    artifacts: {
      codeReviewReport: true,
      coverageReports: true,
      securityScans: true,
      performanceReports: true
    }
  },

  // Dashboard settings
  dashboard: {
    enabled: true,
    refreshInterval: 30000, // 30 seconds
    history: {
      maxEntries: 100,
      retentionDays: 30
    }
  },

  // File patterns to include/exclude
  files: {
    include: ['**/*.js', '**/*.json', '**/*.md', '**/*.html', '**/*.css'],
    exclude: [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.min.js',
      '**/*.min.css'
    ],
    test: {
      include: [
        '**/*.test.js',
        '**/*.spec.js',
        '**/tests/**/*.js',
        '**/test/**/*.js',
        '**/__tests__/**/*.js'
      ]
    }
  },

  // Performance monitoring
  performance: {
    enabled: true,
    benchmarks: {
      enabled: true,
      iterations: 50,
      concurrency: 5,
      regressionThreshold: 10 // 10% degradation threshold
    },
    profiling: {
      enabled: true,
      tools: ['clinic', 'autocannon']
    }
  },

  // Security scanning
  security: {
    enabled: true,
    tools: {
      npmAudit: {
        enabled: true,
        level: 'moderate'
      },
      snyk: {
        enabled: true,
        severity: 'medium'
      }
    },
    secrets: {
      patterns: [
        /password\s*[:=]\s*['"][^'"]*['"]/i,
        /secret\s*[:=]\s*['"][^'"]*['"]/i,
        /api[_-]?key\s*[:=]\s*['"][^'"]*['"]/i,
        /token\s*[:=]\s*['"][^'"]*['"]/i,
        /private[_-]?key/i
      ]
    }
  },

  // Reporting
  reporting: {
    enabled: true,
    formats: ['json', 'html', 'console'],
    output: {
      directory: 'reports',
      filename: 'code-review-report'
    }
  }
}

// Helper functions
export const getThresholdColor = score => {
  const { thresholds } = qualityGatesConfig
  if (score >= thresholds.excellent.min) return 'green'
  if (score >= thresholds.good.min) return 'blue'
  if (score >= thresholds.fair.min) return 'yellow'
  return 'red'
}

export const getThresholdLabel = score => {
  const { thresholds } = qualityGatesConfig
  if (score >= thresholds.excellent.min) return 'Excellent'
  if (score >= thresholds.good.min) return 'Good'
  if (score >= thresholds.fair.min) return 'Fair'
  return 'Poor'
}

export const shouldFailPipeline = results => {
  const { ci } = qualityGatesConfig

  if (ci.failPipeline.onSecurityIssues && results.security.some(item => item.status === '❌')) {
    return true
  }

  if (ci.failPipeline.onTestFailures && results.testing.some(item => item.status === '❌')) {
    return true
  }

  if (
    ci.failPipeline.onLowScore &&
    results.metrics.score < qualityGatesConfig.thresholds.fair.min
  ) {
    return true
  }

  return false
}

export default qualityGatesConfig
