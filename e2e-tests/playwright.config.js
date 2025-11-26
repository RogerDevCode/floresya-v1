import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration for FloresYa E2E Testing
 * Optimizado para Chrome con settings específicos según especificaciones
 */
export default defineConfig({
  // Solo usar Chrome según especificación
  projects: [
    {
      name: 'floresya-e2e',
      use: {
        // Browser específico
        browserName: 'chromium',
        channel: 'chrome',
        headless: process.env.CI === 'true' ? 'new' : false,

        // Viewport específico para testing
        viewport: { width: 1280, height: 720 },

        // Configuración de timeouts para tests estables
        timeout: 30000, // 30 segundos por test
        expect: {
          timeout: 5000 // 5 segundos por expect
        },

        // Manejo de errores
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',

        // Configuración de red para no saturar CPU
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Reducir uso de CPU
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-ipc-flooding-protection'
          ]
        },

        // Context options para performance
        contextOptions: {
          permissions: ['clipboard-read', 'clipboard-write'],
          javaScriptEnabled: true,
          ignoreHTTPSErrors: true,
          bypassCSP: true
        },

        // Retries para tests flakey
        retries: process.env.CI === 'true' ? 1 : 2
      },

      // Viewports para responsive testing según especificación
      projects: [
        {
          name: 'mobile',
          use: {
            ...devices['iPhone SE'],
            viewport: { width: 375, height: 667 },
            deviceScaleFactor: 2,
            hasTouch: true,
            isMobile: true
          }
        },
        {
          name: 'tablet',
          use: {
            ...devices['iPad'],
            viewport: { width: 768, height: 1024 },
            deviceScaleFactor: 2,
            hasTouch: true,
            isMobile: false,
            isTablet: true
          }
        },
        {
          name: 'desktop',
          use: {
            viewport: { width: 1280, height: 720 },
            deviceScaleFactor: 1,
            hasTouch: false,
            isMobile: false,
            isDesktop: true
          }
        },
        {
          name: 'widescreen',
          use: {
            viewport: { width: 1920, height: 1080 },
            deviceScaleFactor: 1,
            hasTouch: false,
            isMobile: false,
            isDesktop: true
          }
        }
      ],

      // Global setup para todos los tests
      globalSetup: new URL('./global-setup.js', import.meta.url).pathname,

      // Global teardown
      globalTeardown: new URL('./global-teardown.js', import.meta.url).pathname,

      // Test directory
      testDir: 'e2e-tests',

      // Timeout global
      timeout: 60000, // 60 segundos total

      // Output configuration
      outputDir: 'e2e-test-results/',
      reporter: [
        ['html', { open: process.env.CI !== 'true' }],
        ['json', { outputFile: 'e2e-test-results/results.json' }],
        ['junit', { outputFile: 'e2e-test-results/results.xml' }],
        ['list'] // Para CI/CD
      ],

      // Configuración de workers para optimizar CPU
      workers: process.env.CI === 'true' ? 1 : 2, // Máximo 2 workers para no sobrecargar

      // Web server (si es necesario)
      webServer: {
        command: 'npm run dev',
        port: 3000,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000
      },

      // Global configuration
      fullyParallel: false, // Evitar saturación
      forbidOnly: !!process.env.CI,
      grep: process.env.GREP ? new RegExp(process.env.GREP) : undefined,
      grepInvert: process.env.GREP_INVERT ? new RegExp(process.env.GREP_INVERT) : undefined,

      // Update snapshots si es necesario
      updateSnapshots: process.env.CI === 'true' ? 'missing' : 'all'
    }
  ],

  // Metadata del proyecto
  metadata: {
    'Test Environment': 'FloresYa E2E Testing',
    Browser: 'Chrome (Chromium)',
    Headless: process.env.CI === 'true' ? 'Yes' : 'No',
    'Max Workers': 2,
    'Memory Limit': '512MB'
  }
})
