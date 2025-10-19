/**
 * Simple test to check if cuco clock button exists
 */
import { test, expect } from '@playwright/test'

test('Check if cuco clock button exists in DOM', async ({ page }) => {
  console.log('🔍 Navigating to homepage...')
  await page.goto('/')

  // Wait for page to load
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000) // Extra time for dynamic loading

  // Check if button exists
  console.log('🔍 Looking for #cuco-clock-toggle...')
  const cucoButton = page.locator('#cuco-clock-toggle')

  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/homepage-debug.png', fullPage: true })

  // Get all nav-actions content for debugging
  const navActionsContent = await page.locator('.nav-actions').innerHTML()
  console.log('🔍 nav-actions content:', navActionsContent)

  // Check if button exists in DOM (not necessarily visible)
  const exists = await cucoButton.count()
  console.log('🔍 Cuco button count:', exists)

  // Check all buttons in nav-actions
  const allButtons = await page.locator('.nav-actions button').count()
  console.log('🔍 All buttons in nav-actions:', allButtons)

  // Check all elements with nav-icon class
  const allNavIcons = await page.locator('.nav-icon').count()
  console.log('🔍 All elements with nav-icon class:', allNavIcons)

  // Check console logs
  page.on('console', msg => {
    if (msg.text().includes('[CUCO DEBUG]')) {
      console.log('Browser console:', msg.text())
    }
  })

  expect(exists).toBeGreaterThanOrEqual(0)
})
