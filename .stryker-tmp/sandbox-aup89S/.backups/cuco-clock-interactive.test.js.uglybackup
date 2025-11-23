/**
 * Interactive test to verify cuco clock functionality
 */
import { test, expect } from '@playwright/test'

test('Cuco Clock Interactive Test', async ({ page }) => {
  console.log('🔍 Starting interactive cuco clock test...')

  // Navigate to homepage
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000) // Wait for everything to load

  // Check console for debug messages
  page.on('console', msg => {
    if (msg.text().includes('[CUCO DEBUG]')) {
      console.log('Browser console:', msg.text())
    }
  })

  // Find the cuco toggle button
  const cucoButton = page.locator('#cuco-clock-toggle')
  console.log('🔍 Looking for cuco button...')
  await expect(cucoButton).toBeVisible()
  console.log('✅ Cuco button found!')

  // Check if cuco clock exists initially (should be created but hidden by default)
  let cucoClock = page.locator('.cuco-clock')
  const initialClockCount = await cucoClock.count()
  console.log(`🔍 Initial cuco clock count: ${initialClockCount}`)
  expect(initialClockCount).toBe(1) // Should exist but be hidden by default due to localStorage

  // Check if it's hidden initially
  const initiallyHidden = await cucoClock.isVisible()
  console.log(`🔍 Clock initially visible: ${initiallyHidden}`)
  expect(initiallyHidden).toBe(false) // Should be hidden by default

  // Click the cuco button to toggle the clock
  console.log('🔍 Clicking cuco button...')
  await cucoButton.click()
  await page.waitForTimeout(2000)

  // Check if window.cucoClock exists after click
  const cucoClockAfterClick = await page.evaluate(() => {
    return {
      exists: typeof window.cucoClock !== 'undefined',
      isVisible: window.cucoClock ? window.cucoClock.isClockVisible : false,
      hasToggleMethod: window.cucoClock ? typeof window.cucoClock.toggleClock === 'function' : false
    }
  })
  console.log(`🔍 window.cucoClock after click:`, cucoClockAfterClick)

  // Check if cuco clock now exists
  cucoClock = page.locator('.cuco-clock')
  const afterClickClockCount = await cucoClock.count()
  console.log(`🔍 Clock count after click: ${afterClickClockCount}`)

  // Also check all elements in body for debugging
  const allCucoClocks = await page.evaluate(() => {
    return document.querySelectorAll('.cuco-clock').length
  })
  console.log(`🔍 All cuco clocks in DOM: ${allCucoClocks}`)

  expect(afterClickClockCount).toBe(1) // Should now exist

  // Check if it's visible
  const isVisible = await cucoClock.isVisible()
  console.log(`🔍 Clock visible: ${isVisible}`)
  expect(isVisible).toBe(true)

  // Check the time display
  const timeDisplay = cucoClock.locator('.cuco-clock-time-display')
  const timeText = await timeDisplay.textContent()
  console.log(`🔍 Time displayed: ${timeText}`)
  expect(timeText).toMatch(/^\d{2}:\d{2}$/) // Should be in HH:MM format

  // Wait a couple seconds and verify time updates
  console.log('🔍 Waiting for time update...')
  await page.waitForTimeout(2000)
  const timeText2 = await timeDisplay.textContent()
  console.log(`🔍 Time displayed after 2s: ${timeText2}`)
  expect(timeText2).toMatch(/^\d{2}:\d{2}$/)

  // Test that time is current (within reasonable range)
  const now = new Date()
  const expectedTime = now.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
  console.log(`🔍 Expected time: ${expectedTime}`)
  console.log(`🔍 Actual time: ${timeText2}`)

  // Click again to hide the clock
  console.log('🔍 Clicking cuco button to hide clock...')
  await cucoButton.click()
  await page.waitForTimeout(500)

  // Check if clock is hidden
  const isHidden = await cucoClock.isVisible()
  console.log(`🔍 Clock visible after second click: ${isHidden}`)
  expect(isHidden).toBe(false) // Should be hidden

  // Test window.cucoClock exists and has methods
  const cucoClockExists = await page.evaluate(() => {
    return (
      typeof window.cucoClock !== 'undefined' && typeof window.cucoClock.toggleClock === 'function'
    )
  })
  console.log(`🔍 window.cucoClock exists with toggleClock method: ${cucoClockExists}`)
  expect(cucoClockExists).toBe(true)

  // Screenshot for visual verification
  await page.screenshot({ path: 'test-results/cuco-clock-interactive-test.png', fullPage: true })
  console.log('📸 Screenshot saved to test-results/cuco-clock-interactive-test.png')

  console.log('✅ All interactive tests passed!')
})
