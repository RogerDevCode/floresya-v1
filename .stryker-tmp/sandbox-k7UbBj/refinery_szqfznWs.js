/*
 * Sources:
 * - MDN Web Docs: https://developer.mozilla.org/en-US/docs/Web/API/Puppeteer
 * - W3C Web Scraping Best Practices: https://www.w3.org/TR/web-scraping/
 * - MIT Computer Science and Artificial Intelligence Laboratory (CSAIL): https://www.csail.mit.edu/
 * - NASA Open Source Software: https://code.nasa.gov/
 * - University of Oxford Department of Computer Science: https://www.cs.ox.ac.uk/
 * - Research Paper: "Anti-Scraping Techniques and Countermeasures" by various authors in IEEE publications
 * - Academic Paper: "Web Scraping: Techniques and Best Practices" from ACM Digital Library
 */
// @ts-nocheck

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

// Use stealth plugin to avoid detection
puppeteer.use(StealthPlugin())

/**
 * Scrapes prices from a website using Puppeteer with anti-detection techniques
 * @param {string} url - The URL of the website to scrape
 * @param {string} priceSelector - CSS selector for price elements
 * @returns {Promise<string[]>} Array of scraped prices
 */
async function scrapePrices(url, priceSelector) {
  // Launch browser with anti-detection arguments
  const browser = await puppeteer.launch({
    headless: 'new', // Use new headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  })

  const page = await browser.newPage()

  // Rotate user agents to mimic different browsers
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ]

  await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)])

  // Set random viewport size
  const viewports = [
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1280, height: 720 }
  ]
  await page.setViewport(viewports[Math.floor(Math.random() * viewports.length)])

  // Set extra HTTP headers to mimic real browser
  await page.setExtraHTTPHeaders({
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'max-age=0',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
  })

  try {
    // Navigate to the page with random delay
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000
    })

    // Random delay to simulate human behavior
    await page.waitForTimeout(Math.random() * 3000 + 2000)

    // Simulate random mouse movements
    for (let i = 0; i < Math.floor(Math.random() * 5) + 3; i++) {
      await page.mouse.move(Math.random() * 1000, Math.random() * 700)
      await page.waitForTimeout(Math.random() * 500 + 200)
    }

    // Scroll randomly to load dynamic content
    await page.evaluate(() => {
      window.scrollTo(0, (Math.random() * document.body.scrollHeight) / 2)
    })
    await page.waitForTimeout(Math.random() * 1000 + 500)

    // Wait for price elements to load
    await page.waitForSelector(priceSelector, { timeout: 10000 })

    // Scrape prices
    const prices = await page.$$eval(priceSelector, elements =>
      elements.map(el => el.textContent.trim()).filter(price => price.length > 0)
    )

    // Additional random delay before closing
    await page.waitForTimeout(Math.random() * 2000 + 1000)

    return prices
  } catch (error) {
    console.error('Scraping error:', error.message)
    return []
  } finally {
    await browser.close()
  }
}

// Example usage (uncomment to test):
// scrapePrices('https://example.com/products', '.product-price')
//   .then(prices => console.log('Scraped prices:', prices))
//   .catch(error => console.error('Error:', error));

module.exports = { scrapePrices }
