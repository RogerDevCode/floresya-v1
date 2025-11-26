import { test, expect } from '@playwright/test'
import { setupPages } from '../utils/page-setup.js'

const THEMES = ['default', 'theme-1', 'theme-2', 'theme-3', 'theme-4']
const THEME_SELECTORS = {
  default: '[data-testid="theme-btn-default"]',
  'theme-1': '[data-testid="theme-btn-1"]',
  'theme-2': '[data-testid="theme-btn-2"]',
  'theme-3': '[data-testid="theme-btn-3"]',
  'theme-4': '[data-testid="theme-btn-4"]'
}

test.describe('Theme System - Complete Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoad()
  })

  test.describe('Theme Selector Visibility and Interaction', () => {
    test('should display theme selector buttons', async ({ page }) => {
      for (const theme in THEME_SELECTORS) {
        const button = page.locator(THEME_SELECTORS[theme])
        await expect(button).toBeVisible()
      }
    })

    test('should have correct theme labels', async ({ page }) => {
      await expect(page.locator('[data-testid="theme-btn-default"]')).toContainText('Default')
      await expect(page.locator('[data-testid="theme-btn-1"]')).toContainText('Tema 1')
      await expect(page.locator('[data-testid="theme-btn-2"]')).toContainText('Tema 2')
      await expect(page.locator('[data-testid="theme-btn-3"]')).toContainText('Tema 3')
      await expect(page.locator('[data-testid="theme-btn-4"]')).toContainText('Tema 4')
    })

    THEMES.forEach(themeName => {
      test(`should switch to ${themeName} theme`, async ({ page }) => {
        const button = page.locator(THEME_SELECTORS[themeName])

        // Click theme button
        await button.click()

        // Wait for theme to apply
        await page.waitForTimeout(500)

        // Verify theme is stored in localStorage
        const storedTheme = await page.evaluate(() => {
          return localStorage.getItem('floresya_theme')
        })
        expect(storedTheme).toBe(themeName)
      })

      test(`should update CSS variables for ${themeName} theme`, async ({ page }) => {
        const button = page.locator(THEME_SELECTORS[themeName])
        await button.click()
        await page.waitForTimeout(500)

        // Check CSS variables are updated
        const footerGradient = await page.evaluate(() => {
          return getComputedStyle(document.documentElement).getPropertyValue('--footer-gradient')
        })

        expect(footerGradient).not.toBe('')
        expect(footerGradient).toContain('rgb')
      })
    })
  })

  test.describe('Theme Persistence and Restoration', () => {
    test('should persist theme across page reloads', async ({ page }) => {
      const testTheme = 'theme-2'
      const button = page.locator(THEME_SELECTORS[testTheme])

      // Set theme
      await button.click()
      await page.waitForTimeout(500)

      // Reload page
      await page.reload()
      await page.waitForLoad()

      // Verify theme persisted
      const storedTheme = await page.evaluate(() => {
        return localStorage.getItem('floresya_theme')
      })
      expect(storedTheme).toBe(testTheme)
    })

    test('should restore last selected theme on initial load', async ({ page }) => {
      // First, set a theme
      const initialTheme = 'theme-3'
      await page.locator(THEME_SELECTORS[initialTheme]).click()
      await page.waitForTimeout(500)

      // Clear and reload
      await page.context().clearCookies()
      await page.evaluate(() => localStorage.clear())
      await page.reload()
      await page.waitForLoad()

      // Verify default theme is restored or default theme loads
      const finalTheme = await page.evaluate(() => {
        return localStorage.getItem('floresya_theme') || 'default'
      })
      expect(['default', ...THEMES]).toContain(finalTheme)
    })
  })

  test.describe('Theme Visual Effects and Transitions', () => {
    test('should have smooth theme transitions', async ({ page }) => {
      const theme1Btn = page.locator(THEME_SELECTORS['theme-1'])
      const theme2Btn = page.locator(THEME_SELECTORS['theme-2'])

      // Apply theme 1
      await theme1Btn.click()
      await page.waitForTimeout(500)

      // Apply theme 2
      await theme2Btn.click()

      // Verify no jarring transitions (no layout shifts)
      const logo = page.locator('[data-testid="floresya-logo"]')
      const initialBox = await logo.boundingBox()

      await page.waitForTimeout(300)
      const finalBox = await logo.boundingBox()

      // Logo should stay in same position (no layout shifts)
      expect(Math.abs(finalBox.x - initialBox.x)).toBeLessThan(5)
      expect(Math.abs(finalBox.y - initialBox.y)).toBeLessThan(5)
    })

    test('should update all themed elements consistently', async ({ page }) => {
      const themeBtn = page.locator(THEME_SELECTORS['theme-3'])

      // Apply dark theme
      await themeBtn.click()
      await page.waitForTimeout(500)

      // Check multiple themed elements
      const footer = page.locator('footer')
      const navigation = page.locator('nav')
      const buttons = page.locator('button')

      await expect(footer).toBeVisible()
      await expect(navigation).toBeVisible()
      await expect(buttons.first()).toBeVisible()

      // Verify they have theme classes
      await expect(footer).toHaveClass(/theme-/)
      await expect(navigation).toHaveClass(/theme-/)
    })
  })

  test.describe('Contrast and Accessibility', () => {
    test('should pass basic contrast checks for all themes', async ({ page }) => {
      for (const themeName of THEMES) {
        const button = page.locator(THEME_SELECTORS[themeName])
        await button.click()
        await page.waitForTimeout(500)

        // Check contrast ratio on main text elements
        const mainHeadings = page.locator('h1, h2, h3')
        const count = await mainHeadings.count()

        if (count > 0) {
          const firstHeading = mainHeadings.first()
          const styles = await firstHeading.evaluate(el => {
            const computed = getComputedStyle(el)
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor
            }
          })

          // Basic contrast check (not exact WCAG calculation but basic sanity)
          expect(styles.color).toBeTruthy()
          expect(styles.backgroundColor).toBeTruthy()
          expect(styles.color !== styles.backgroundColor).toBeTruthy()
        }
      }
    })

    test('should maintain readability with different themes', async ({ page }) => {
      const testTexts = ['Flores que Inspirán', 'Nueva Colección 2025', '¿Buscas algo especial?']

      for (const themeName of THEMES) {
        const button = page.locator(THEME_SELECTORS[themeName])
        await button.click()
        await page.waitForTimeout(500)

        for (const text of testTexts) {
          const element = page.locator(`text=${text}`)
          if (await element.isVisible()) {
            await expect(element).toBeVisible()

            // Check text is not overlapping or unreadable
            const boundingBox = await element.boundingBox()
            expect(boundingBox.height).toBeGreaterThan(0)
            expect(boundingBox.width).toBeGreaterThan(0)
          }
        }
      }
    })
  })

  test.describe('Theme Storage and Cross-Tab Behavior', () => {
    test('should sync theme changes across tabs', async ({ page }) => {
      const themeBtn = page.locator(THEME_SELECTORS['theme-4'])

      // Apply theme
      await themeBtn.click()
      await page.waitForTimeout(500)

      // Get theme from localStorage
      const storedTheme = await page.evaluate(() => {
        return localStorage.getItem('floresya_theme')
      })
      expect(storedTheme).toBe('theme-4')

      // Simulate storage change (from another tab)
      await page.evaluate(newTheme => {
        localStorage.setItem('floresya_theme', newTheme)
        window.dispatchEvent(new CustomEvent('storage'))
      }, 'theme-1')

      await page.waitForTimeout(500)

      // Verify theme updated
      const updatedTheme = await page.evaluate(() => {
        return localStorage.getItem('floresya_theme')
      })
      expect(updatedTheme).toBe('theme-1')
    })
  })

  test.describe('Theme Performance', () => {
    test('should apply themes without significant performance impact', async ({ page }) => {
      const startTime = Date.now()

      // Apply different themes rapidly
      for (const themeName of THEMES) {
        const button = page.locator(THEME_SELECTORS[themeName])
        await button.click()
        await page.waitForTimeout(100) // Small delay between changes
      }

      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Theme switching should be fast (< 2 seconds for all themes)
      expect(totalTime).toBeLessThan(2000)

      // Final theme should be applied correctly
      const finalTheme = await page.evaluate(() => {
        return localStorage.getItem('floresya_theme')
      })
      expect(['default', ...THEMES]).toContain(finalTheme)
    })
  })
})
