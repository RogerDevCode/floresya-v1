/**
 * Minimal Global Setup for E2E Tests
 * KISS Principle: Solo lo esencial
 */

async function globalSetup() {
  console.log('🚀 [Setup] Configurando tests E2E...')

  // Verificar que el servidor esté disponible
  const maxRetries = 10
  const baseURL = 'http://127.0.0.1:3000'

  for (let i = 0; i < maxRetries; i++) {
    try {
      // eslint-disable-next-line no-restricted-globals
      const response = await fetch(baseURL)
      if (response.ok) {
        console.log('✅ [Setup] Servidor disponible en', baseURL)
        return
      }
    } catch {
      if (i === maxRetries - 1) {
        throw new Error(`❌ Servidor no disponible en ${baseURL}. Ejecuta: npm run dev`)
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

export default globalSetup
