// Auth helpers for Playwright

export const login = async (page, email, password) => {
  await page.goto('/login')
  await page.fill('[data-cy=email-input]', email)
  await page.fill('[data-cy=password-input]', password)
  await page.click('[data-cy=login-button]')
  await page.waitForURL((url) => !url.toString().includes('/login'))
}

export const apiLogin = async (request, email, password) => {
  const response = await request.post('/api/auth/login', {
    data: { email, password }
  })
  const body = await response.json()
  return body
}

export const setupTestUser = async (page) => {
  await page.evaluate(() => {
    const testUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User'
    }
    localStorage.setItem('testUser', JSON.stringify(testUser))
  })
}

export const cleanupTestData = async (page) => {
  await page.evaluate(() => {
    localStorage.removeItem('testUser')
    localStorage.removeItem('cart')
    localStorage.removeItem('checkoutData')
  })
}
