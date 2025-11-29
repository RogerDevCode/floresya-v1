import { test } from '@playwright/test'

test('debug page content', async ({ page }) => {
  await page.goto('/')
  // Wait a bit for JS to run
  await page.waitForTimeout(2000)

  const content = await page.content()
  console.log('--- PAGE CONTENT START ---')
  console.log(content)
  console.log('--- PAGE CONTENT END ---')

  const h1 = page.locator('h1').first()
  const count = await h1.count()
  console.log('H1 count:', count)
  if (count > 0) {
    const visible = await h1.isVisible()
    console.log('H1 visible:', visible)
    const text = await h1.textContent()
    console.log('H1 text:', text)
  }
})
