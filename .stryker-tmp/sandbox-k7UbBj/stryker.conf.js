/**
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
// @ts-nocheck

export default {
  // Package manager
  packageManager: 'npm',

  // Test runner
  testRunner: 'command',
  commandRunner: {
    command: 'npm test -- --run --reporter=verbose'
  },

  // Coverage analysis
  coverageAnalysis: 'perTest',

  // Mutator configuration
  mutate: [
    'api/services/**/*.js',
    'api/repositories/**/*.js',
    'api/middleware/**/*.js',
    'api/utils/**/*.js',
    '!api/**/*.test.js',
    '!api/**/*.spec.js',
    '!api/**/test/**',
    '!api/**/tests/**'
  ],

  // Files to include in the sandbox
  files: [
    'api/**/*.js',
    '!api/**/*.test.js',
    '!api/**/*.spec.js',
    'test/**/*.test.js',
    'tests/**/*.test.js',
    'package.json',
    'vitest.config.js'
  ],

  // Ignore patterns
  ignorePatterns: [
    'node_modules',
    'coverage',
    'dist',
    'build',
    '.stryker-tmp',
    'public',
    'scripts',
    'docs',
    '.trunk/**',
    '.git/**',
    '.husky/**',
    '.github/**',
    '**/*.md',
    '**/*.json',
    '**/*.yaml',
    '**/*.yml'
  ],

  // Reporters
  reporters: ['html', 'clear-text', 'progress', 'dashboard'],

  // HTML reporter options
  htmlReporter: {
    fileName: 'mutation-report.html'
  },

  // Dashboard reporter (optional, requires Stryker Dashboard account)
  dashboard: {
    reportType: 'full'
  },

  // Thresholds
  thresholds: {
    high: 80,
    low: 60,
    break: 50
  },

  // Timeout configuration
  timeoutMS: 60000,
  timeoutFactor: 2,

  // Concurrency
  concurrency: 4,
  maxConcurrentTestRunners: 2,

  // Temp directory
  tempDirName: '.stryker-tmp',

  // Clean temp directory
  cleanTempDir: true,

  // Incremental mode (only mutate changed files)
  incremental: false,

  // Incremental file
  incrementalFile: '.stryker-incremental.json',

  // Plugins
  plugins: ['@stryker-mutator/core'],

  // Mutation levels
  mutator: {
    plugins: ['javascript'],
    excludedMutations: [
      // Exclude mutations that are too noisy or low-value
      'StringLiteral', // Don't mutate string literals (too many false positives)
      'ObjectLiteral' // Don't mutate object literals
    ]
  },

  // Logging
  logLevel: 'info',
  fileLogLevel: 'debug',

  // Disable type checking (we're using JavaScript, not TypeScript)
  disableTypeChecks: '{api,test,tests}/**/*.{js,jsx}',

  // Build command (if needed)
  buildCommand: 'npm run build:css'
}
