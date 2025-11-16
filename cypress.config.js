import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // Base URL para testing - API server port
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,

    // Configuración para Test-Driven Development
    video: true, // Habilitar para debug
    screenshotOnRunFailure: true,
    trashAssetsBeforeRuns: true,

    // Timeouts estrictos para detectar problemas temprano
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,
    execTimeout: 60000,
    taskTimeout: 60000,

    // Configuración de retries (TDD approach)
    retries: {
      runMode: 1, // Un retry en CI para evitar flakiness
      openMode: 0 // Sin retries en desarrollo para feedback inmediato
    },

    env: {
      // URLs y endpoints
      localDevUrl: 'http://localhost:5173',
      productionUrl: 'https://floresya.com',
      apiUrl: 'http://localhost:3000/api',
      supabaseUrl: 'https://test-project.supabase.co',
      supabaseKey: 'test-anon-key',

      // Performance thresholds (estrictos para 100% éxito)
      performanceThresholds: {
        pageLoadTime: 3000, // 3s max
        domContentLoaded: 1800, // 1.8s max
        firstContentfulPaint: 1000, // 1s max
        largestContentfulPaint: 2500, // 2.5s max
        cumulativeLayoutShift: 0.1, // 0.1 max
        firstInputDelay: 100 // 100ms max
      },

      // Flags de testing
      skipSlowTests: false,
      enablePerformanceTesting: true,
      enableAccessibilityTesting: true,
      debugMode: false,
      verboseLogging: false
    },

    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message)
          return null
        },

        'db:seed'() {
          // Database seeding for tests
          console.log('Seeding test database...')
          return null
        },

        'db:reset'() {
          // Reset database for tests
          console.log('Resetting test database...')
          return null
        }
      })

      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          // Configure Chrome for testing
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--no-sandbox')
          launchOptions.args.push('--disable-setuid-sandbox')
        }
        return launchOptions
      })

      return config
    }
  },

  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack'
    },
    specPattern: 'src/**/*.cy.jsx',
    supportFile: 'cypress/support/component.js'
  }
})
