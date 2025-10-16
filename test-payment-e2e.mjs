import { chromium } from 'playwright';
import { strict as assert } from 'assert';

async function runPaymentE2ETest() {
  console.log('🧪 INICIANDO TEST E2E - PROCESO DE PAGO');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    locale: 'es-VE'
  });
  
  const page = await context.newPage();
  
  // Escuchar todos los requests y responses
  page.on('request', request => {
    console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
  });
  
  page.on('response', response => {
    console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
  });
  
  page.on('console', msg => {
    console.log(`🖥️  CONSOLE: ${msg.type()} - ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
  });
  
  try {
    await runCompletePaymentTest(page);
  } catch (error) {
    console.log(`💥 TEST FAILED: ${error.message}`);
    console.error(error);
  } finally {
    await browser.close();
    console.log('🏁 TEST COMPLETADO');
  }
}

async function runCompletePaymentTest(page) {
  try {
    // Paso 1: Navegar a página principal
    console.log('\n📍 PASO 1: Navegar a página principal');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ Página principal cargada');
    
    // Tomar screenshot
    await page.screenshot({ path: 'screenshots/01-homepage.png' });
    
    // Paso 2: Seleccionar producto y añadir al carrito
    console.log('\n📍 PASO 2: Seleccionar producto y añadir al carrito');
    await page.waitForSelector('.product-card', { timeout: 10000 });
    
    // Seleccionar el primer producto
    const firstProduct = await page.$('.product-card:first-child');
    assert(firstProduct, 'No se encontró ningún producto');
    
    const productName = await firstProduct.$eval('h3', el => el.textContent);
    console.log(`📦 Producto seleccionado: ${productName}`);
    
    // Añadir al carrito
    const addToCartBtn = await firstProduct.$('[data-action="add-to-cart"]');
    assert(addToCartBtn, 'Botón de añadir al carrito no encontrado');
    
    console.log('🛒 Añadiendo producto al carrito...');
    await addToCartBtn.click();
    
    // Esperar confirmación
    await page.waitForTimeout(2000);
    
    // Verificar carrito
    const cartBadge = await page.$('.cart-badge');
    const cartCount = await cartBadge.textContent();
    console.log(`🔢 Productos en carrito: ${cartCount}`);
    assert(parseInt(cartCount) > 0, 'El carrito no se actualizó correctamente');
    console.log('✅ Producto añadido al carrito exitosamente');
    
    await page.screenshot({ path: 'screenshots/02-product-added.png' });
    
    // Paso 3: Navegar al carrito
    console.log('\n📍 PASO 3: Navegar al carrito de compras');
    const cartIcon = await page.$('[href="/pages/cart.html"]');
    assert(cartIcon, 'Ícono del carrito no encontrado');
    
    console.log('➡️  Navegando al carrito...');
    await cartIcon.click();
    
    await page.waitForURL('**/cart.html', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Página del carrito cargada');
    
    await page.screenshot({ path: 'screenshots/03-cart-page.png' });
    
    // Paso 4: Iniciar checkout
    console.log('\n📍 PASO 4: Iniciar proceso de checkout');
    
    // Buscar botón de checkout
    const checkoutBtn = await page.$('button:has-text("Proceder al pago"), button:has-text("Checkout"), button:has-text("Pagar")');
    assert(checkoutBtn, 'Botón de checkout no encontrado');
    
    console.log('💳 Iniciando proceso de checkout...');
    await checkoutBtn.click();
    
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/04-checkout-initiated.png' });
    
    // Paso 5: Completar formulario de pedido
    console.log('\n📍 PASO 5: Completar formulario de pedido');
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Completar datos del cliente
    await page.fill('[name="customer_name"]', 'María Pérez');
    await page.fill('[name="customer_email"]', 'maria@test.com');
    await page.fill('[name="customer_phone"]', '+584121234567');
    await page.fill('[name="delivery_address"]', 'Av. Principal, Urbanización Los Palos Grandes, Caracas');
    
    // Fecha de entrega (mañana)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.fill('[name="delivery_date"]', dateStr);
    
    console.log('✅ Formulario completado');
    await page.screenshot({ path: 'screenshots/05-form-filled.png' });
    
    // Paso 6: Seleccionar método de pago en efectivo
    console.log('\n📍 PASO 6: Seleccionar método de pago en efectivo');
    
    // Buscar opción de efectivo
    const cashOption = await page.$('text=Efectivo, Pago Móvil, Transferencia');
    if (cashOption) {
      await cashOption.click();
      console.log('✅ Método de pago en efectivo seleccionado');
    } else {
      console.log('⚠️  Opción de efectivo no encontrada, continuando...');
    }
    
    await page.screenshot({ path: 'screenshots/06-cash-selected.png' });
    
    // Paso 7: Confirmar y enviar pedido
    console.log('\n📍 PASO 7: Confirmar y enviar pedido');
    
    // Buscar botón de envío
    const submitBtn = await page.$('button:has-text("Confirmar Pedido"), button:has-text("Finalizar Compra")');
    assert(submitBtn, 'Botón de confirmación no encontrado');
    
    console.log('📤 Enviando pedido...');
    await page.screenshot({ path: 'screenshots/07-before-submit.png' });
    await submitBtn.click();
    
    // Esperar respuesta
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'screenshots/08-after-submit.png' });
    
    // Verificar resultado
    const currentUrl = page.url();
    console.log(`📍 URL final: ${currentUrl}`);
    
    // Buscar mensajes de éxito o error
    const errorMessages = await page.$$('.text-error, .error-message, .alert-error');
    const successMessages = await page.$$('.text-success, .success-message');
    
    console.log(`✅ Mensajes de éxito: ${successMessages.length}`);
    console.log(`❌ Mensajes de error: ${errorMessages.length}`);
    
    for (const errorMsg of errorMessages) {
      const errorText = await errorMsg.textContent();
      console.log(`💥 ERROR DETECTADO: ${errorText.trim()}`);
    }
    
    console.log('\n✅ TEST E2E COMPLETADO EXITOSAMENTE');
    
  } catch (error) {
    console.log(`\n💥 TEST E2E FALLIDO:`);
    console.log(`   Mensaje: ${error.message}`);
    
    // Diagnóstico adicional
    await page.screenshot({ path: 'screenshots/99-error-state.png' });
    
    const visibleErrors = await page.$$('.text-error, .alert-error');
    for (const errorEl of visibleErrors) {
      const errorText = await errorEl.textContent();
      console.log(`💥 ERROR VISIBLE: ${errorText.trim()}`);
    }
    
    throw error;
  }
}

// Ejecutar el test
runPaymentE2ETest().catch(console.error);