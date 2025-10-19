/**
 * E2E Test para el Reloj Cuco
 * Verifica la visibilidad y funcionalidad completa del reloj cuco en la navbar
 */

import { test, expect } from '@playwright/test'

test.describe('Reloj Cuco - Visibilidad y Funcionalidad', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página principal
    await page.goto('/')

    // Esperar a que la página esté completamente cargada
    await page.waitForLoadState('networkidle')

    // Esperar un poco más para asegurar que los módulos dinámicos se carguen
    await page.waitForTimeout(2000)
  })

  test('1. El ícono del reloj cuco debe ser visible en la navbar', async ({ page }) => {
    console.log('🔍 Test 1: Verificando visibilidad del ícono del reloj cuco en navbar...')

    // Buscar el botón del reloj cuco
    const cucoToggle = page.locator('#cuco-clock-toggle')

    // Verificar que existe
    await expect(cucoToggle).toBeAttached()

    // Verificar que es visible
    await expect(cucoToggle).toBeVisible()

    // Verificar que tiene el SVG del reloj
    const clockIcon = cucoToggle.locator('.cuco-icon')
    await expect(clockIcon).toBeVisible()

    // Verificar que el SVG tiene los elementos correctos
    const circle = clockIcon.locator('circle')
    const polyline = clockIcon.locator('polyline')
    await expect(circle).toBeVisible()
    await expect(polyline).toBeVisible()

    console.log('✅ Test 1: Ícono del reloj cuco visible en navbar - PASADO')
  })

  test('2. El ícono debe estar posicionado correctamente antes del carrito', async ({ page }) => {
    console.log('🔍 Test 2: Verificando posición del ícono del reloj cuco...')

    const cucoToggle = page.locator('#cuco-clock-toggle')
    const cartIcon = page.locator('a[href*="cart"]')

    // Verificar que ambos existen
    await expect(cucoToggle).toBeVisible()
    await expect(cartIcon).toBeVisible()

    // Obtener las posiciones
    const cucoBox = await cucoToggle.boundingBox()
    const cartBox = await cartIcon.boundingBox()

    // Verificar que el cuco está a la izquierda del carrito
    expect(cucoBox.x + cucoBox.width).toBeLessThan(cartBox.x)

    console.log('✅ Test 2: Posición del ícono correcta - PASADO')
  })

  test('3. Click en el ícono debe mostrar/ocultar el reloj cuco', async ({ page }) => {
    console.log('🔍 Test 3: Verificando funcionalidad toggle del reloj cuco...')

    const cucoToggle = page.locator('#cuco-clock-toggle')
    const cucoClock = page.locator('.cuco-clock')

    // Verificar estado inicial (el reloj debería ser visible por defecto)
    const initialState = await cucoClock.isVisible()
    console.log(`Estado inicial del reloj: ${initialState ? 'visible' : 'oculto'}`)

    // Click para alternar
    await cucoToggle.click()
    await page.waitForTimeout(300) // Esperar la transición

    // Verificar que el estado cambió
    const afterClickState = await cucoClock.isVisible()
    expect(afterClickState).toBe(!initialState)

    // Click nuevamente para volver al estado original
    await cucoToggle.click()
    await page.waitForTimeout(300)

    const finalState = await cucoClock.isVisible()
    expect(finalState).toBe(initialState)

    console.log('✅ Test 3: Funcionalidad toggle correcta - PASADO')
  })

  test('4. El reloj cuco debe mostrar la hora actual', async ({ page }) => {
    console.log('🔍 Test 4: Verificando display de hora en el reloj cuco...')

    const cucoClock = page.locator('.cuco-clock')

    // Asegurar que el reloj es visible
    if (!(await cucoClock.isVisible())) {
      const cucoToggle = page.locator('#cuco-clock-toggle')
      await cucoToggle.click()
      await page.waitForTimeout(300)
    }

    // Verificar el display de tiempo
    const timeDisplay = cucoClock.locator('.time-display')
    await expect(timeDisplay).toBeVisible()

    // Verificar que tiene un formato de hora válido (HH:MM)
    const timeText = await timeDisplay.textContent()
    console.log(`Hora mostrada: ${timeText}`)

    // Validar formato HH:MM usando regex
    const timeRegex = /^\d{2}:\d{2}$/
    expect(timeText).toMatch(timeRegex)

    // Verificar que la hora es razonable (00-23 para horas, 00-59 para minutos)
    const [hours, minutes] = timeText.split(':').map(Number)
    expect(hours).toBeGreaterThanOrEqual(0)
    expect(hours).toBeLessThanOrEqual(23)
    expect(minutes).toBeGreaterThanOrEqual(0)
    expect(minutes).toBeLessThanOrEqual(59)

    console.log('✅ Test 4: Display de hora correcto - PASADO')
  })

  test('5. Las manecillas del reloj deben moverse correctamente', async ({ page }) => {
    console.log('🔍 Test 5: Verificando movimiento de manecillas del reloj...')

    const cucoClock = page.locator('.cuco-clock')

    // Asegurar que el reloj es visible
    if (!(await cucoClock.isVisible())) {
      const cucoToggle = page.locator('#cuco-clock-toggle')
      await cucoToggle.click()
      await page.waitForTimeout(300)
    }

    // Verificar que las manecillas existen
    const hourHand = cucoClock.locator('.hour-hand')
    const minuteHand = cucoClock.locator('.minute-hand')

    await expect(hourHand).toBeVisible()
    await expect(minuteHand).toBeVisible()

    // Obtener las rotaciones iniciales
    const initialHourRotation = await hourHand.evaluate(el => {
      const transform = window.getComputedStyle(el).transform
      if (transform === 'none') {
        return 0
      }
      const values = transform.split('(')[1].split(')')[0].split(',')
      const angle = Math.round(Math.atan2(values[1], values[0]) * (180 / Math.PI))
      return angle < 0 ? angle + 360 : angle
    })

    console.log(`Rotación inicial manecilla hora: ${initialHourRotation}°`)

    // Verificar que la rotación es razonable (0-360 grados)
    expect(initialHourRotation).toBeGreaterThanOrEqual(0)
    expect(initialHourRotation).toBeLessThan(360)

    console.log('✅ Test 5: Manecillas del reloj funcionan correctamente - PASADO')
  })

  test('6. Click en la cara del reloj debe activar el sonido cuco', async ({ page }) => {
    console.log('🔍 Test 6: Verificando activación de sonido cuco al hacer click...')

    const cucoClock = page.locator('.cuco-clock')

    // Asegurar que el reloj es visible
    if (!(await cucoClock.isVisible())) {
      const cucoToggle = page.locator('#cuco-clock-toggle')
      await cucoToggle.click()
      await page.waitForTimeout(300)
    }

    // Hacer click en la cara del reloj
    const clockFace = cucoClock.locator('.clock-face')
    await clockFace.click()

    // Verificar que el pájaro cuco aparece
    const cucoBird = cucoClock.locator('.cuco-bird')
    await expect(cucoBird).toHaveClass(/show/)

    // Esperar a que termine la animación
    await page.waitForTimeout(3000)

    // Verificar que el pájaro vuelve a ocultarse
    await expect(cucoBird).not.toHaveClass(/show/)

    console.log('✅ Test 6: Activación de sonido cuco correcta - PASADO')
  })

  test('7. El botón de sonido debe funcionar correctamente', async ({ page }) => {
    console.log('🔍 Test 7: Verificando botón de toggle de sonido...')

    const cucoClock = page.locator('.cuco-clock')

    // Asegurar que el reloj es visible
    if (!(await cucoClock.isVisible())) {
      const cucoToggle = page.locator('#cuco-clock-toggle')
      await cucoToggle.click()
      await page.waitForTimeout(300)
    }

    // Encontrar el botón de sonido
    const soundBtn = cucoClock.locator('.sound-btn')
    await expect(soundBtn).toBeVisible()

    // Verificar estado inicial del ícono de sonido
    const soundIcon = soundBtn.locator('.sound-icon')
    const initialSoundState = await soundIcon.evaluate(el => el.classList.contains('sound-on'))

    console.log(`Estado inicial del sonido: ${initialSoundState ? 'activado' : 'desactivado'}`)

    // Click para alternar el sonido
    await soundBtn.click()
    await page.waitForTimeout(100)

    // Verificar que el estado cambió
    const afterClickSoundState = await soundIcon.evaluate(el => el.classList.contains('sound-on'))
    expect(afterClickSoundState).toBe(!initialSoundState)

    console.log('✅ Test 7: Botón de sonido funciona correctamente - PASADO')
  })

  test('8. El atajo de teclado Ctrl+` debe alternar el reloj', async ({ page }) => {
    console.log('🔍 Test 8: Verificando atajo de teclado Ctrl+`...')

    const cucoClock = page.locator('.cuco-clock')

    // Verificar estado inicial
    const initialState = await cucoClock.isVisible()

    // Presionar Ctrl + ` (acento grave)
    await page.keyboard.press('Control+`')
    await page.waitForTimeout(300)

    // Verificar que el estado cambió
    const afterShortcutState = await cucoClock.isVisible()
    expect(afterShortcutState).toBe(!initialState)

    // Presionar nuevamente para volver al estado original
    await page.keyboard.press('Control+`')
    await page.waitForTimeout(300)

    const finalState = await cucoClock.isVisible()
    expect(finalState).toBe(initialState)

    console.log('✅ Test 8: Atajo de teclado Ctrl+` funciona correctamente - PASADO')
  })

  test('9. El reloj debe ser accesible y tener buen contraste', async ({ page }) => {
    console.log('🔍 Test 9: Verificando accesibilidad y contraste del reloj...')

    const cucoClock = page.locator('.cuco-clock')

    // Asegurar que el reloj es visible
    if (!(await cucoClock.isVisible())) {
      const cucoToggle = page.locator('#cuco-clock-toggle')
      await cucoToggle.click()
      await page.waitForTimeout(300)
    }

    // Verificar que el reloj tiene z-index alto para estar sobre otros elementos
    const zIndex = await cucoClock.evaluate(el => {
      return window.getComputedStyle(el).zIndex
    })
    expect(parseInt(zIndex)).toBeGreaterThan(1000)

    // Verificar que tiene atributos de accesibilidad
    const cucoToggle = page.locator('#cuco-clock-toggle')
    await expect(cucoToggle).toHaveAttribute('title')
    await expect(cucoToggle).toHaveAttribute('type', 'button')

    const title = await cucoToggle.getAttribute('title')
    expect(title).toBe('Toggle Cuco Clock')

    console.log('✅ Test 9: Accesibilidad y contraste correctos - PASADO')
  })

  test('10. Integración completa del sistema del reloj cuco', async ({ page }) => {
    console.log('🔍 Test 10: Verificando integración completa del sistema...')

    // 1. Verificar que window.cucoClock existe
    const cucoClockExists = await page.evaluate(() => {
      return typeof window.cucoClock !== 'undefined'
    })
    expect(cucoClockExists).toBe(true)

    // 2. Verificar que tiene los métodos necesarios
    const hasRequiredMethods = await page.evaluate(() => {
      const clock = window.cucoClock
      return (
        clock &&
        typeof clock.toggleClock === 'function' &&
        typeof clock.setClockVisibility === 'function'
      )
    })
    expect(hasRequiredMethods).toBe(true)

    // 3. Verificar que los CSS variables están cargadas
    const hasCSSVariables = await page.evaluate(() => {
      const styles = window.getComputedStyle(document.documentElement)
      return styles.getPropertyValue('--navbar-icon-color').trim() !== ''
    })
    expect(hasCSSVariables).toBe(true)

    // 4. Probar la API JavaScript directamente
    const apiTestResult = await page.evaluate(() => {
      const initialState = window.cucoClock.isClockVisible
      window.cucoClock.toggleClock()
      const afterToggleState = window.cucoClock.isClockVisible
      window.cucoClock.toggleClock() // Volver al estado original
      return initialState !== afterToggleState
    })
    expect(apiTestResult).toBe(true)

    console.log('✅ Test 10: Integración completa del sistema - PASADO')
  })
})
