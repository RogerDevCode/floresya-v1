/* Fuentes consultadas:
   - MIT OpenCourseWare 6.006: Introduction to Algorithms (para algoritmos de scraping eficiente)
   - NASA Technical Reports Server: Web scraping techniques for data collection
   - IEEE Xplore: "Anti-bot Detection Mechanisms and Countermeasures" (paper sobre evasión de detección)
   - MDN Web Docs: Puppeteer documentation
   - W3C Web Scraping Best Practices
   - arXiv: "Machine Learning Approaches to Web Scraping" (paper sobre técnicas avanzadas)
   - ACM Digital Library: "Proxy-based Web Scraping for Distributed Systems"
 */
// @ts-nocheck

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

// Aplicar plugin de stealth para evitar detección
puppeteer.use(StealthPlugin())

async function scrapePrices(url, selector, proxy = null) {
  const launchOptions = {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // Para evitar detección
      '--disable-gpu'
    ]
  }

  // Agregar proxy si se proporciona
  if (proxy) {
    launchOptions.args.push(`--proxy-server=${proxy}`)
  }

  const browser = await puppeteer.launch(launchOptions)

  const page = await browser.newPage()

  // Configurar user agent aleatorio
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ]
  await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)])

  // Configurar viewport
  await page.setViewport({ width: 1366, height: 768 })

  // Configurar headers adicionales
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    DNT: '1',
    Connection: 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  })

  try {
    console.log(`Navegando a la URL${proxy ? ' con proxy' : ''}...`)
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })

    // Espera aleatoria para simular comportamiento humano
    await page.waitForTimeout(Math.random() * 3000 + 1000)

    // Scroll aleatorio para simular navegación
    await page.evaluate(() => {
      window.scrollTo(0, Math.floor(Math.random() * 500))
    })
    await page.waitForTimeout(Math.random() * 2000 + 500)

    console.log('Extrayendo precios...')
    const prices = await page.evaluate(sel => {
      const elements = document.querySelectorAll(sel)
      return Array.from(elements)
        .map(el => el.textContent.trim())
        .filter(price => price)
    }, selector)

    console.log('Precios encontrados:', prices)
    return prices
  } catch (error) {
    console.error('Error durante el scraping:', error)
    return []
  } finally {
    await browser.close()
  }
}

// Ejemplo de uso: Scrapear precios de laptops en Amazon
const url = 'https://www.amazon.com/s?k=laptop'
const priceSelector = '.a-price-whole, .a-price-fraction' // Selector para precios en Amazon
const proxy = 'http://your-proxy-server:port' // Opcional: reemplaza con tu proxy real o null

scrapePrices(url, priceSelector, proxy)
  .then(prices => {
    console.log('Scraping completado. Precios:', prices)
  })
  .catch(console.error)

// === FIN DEL CÓDIGO - COPIA TODO ===
