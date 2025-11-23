/**
 * Price Scraper using Puppeteer with Anti-Bot Evasion Techniques
 *
 * Sources:
 * - Mozilla Developer Network (MDN) - Headless Browsers: https://developer.mozilla.org/en-US/docs/Glossary/Headless_browser
 * - W3C - WebDriver Specification: https://www.w3.org/TR/webdriver/
 * - IEEE Paper: "Bot Detection Techniques in Web Search Engines" by Marc Najork: https://ieeexplore.ieee.org/document/4427176
 * - USENIX Paper: "Web Robot Detection Using Fingerprints" by Davide Canali et al.: https://www.usenix.org/conference/woot13/workshop-program/presentation/canali
 * - Puppeteer Official Documentation: https://pptr.dev/
 */
// @ts-nocheck

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const randomUseragent = require('random-useragent')

// Add stealth plugin to avoid detection
puppeteer.use(StealthPlugin())

// Function to get a random user agent
function getRandomUserAgent() {
  return randomUseragent.getRandom()
}

// Function to simulate human-like mouse movements
async function simulateMouseMovements(page) {
  const viewport = await page.viewport()
  const width = viewport.width
  const height = viewport.height

  // Random mouse movements
  for (let i = 0; i < 5; i++) {
    const x = Math.floor(Math.random() * width)
    const y = Math.floor(Math.random() * height)
    await page.mouse.move(x, y)
    await page.waitForTimeout(Math.random() * 1000 + 500) // Random delay 500-1500ms
  }
}

// Function to scrape prices from a given URL
async function scrapePrices(url, proxy = null) {
  let browser
  try {
    const args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]

    if (proxy) {
      args.push(`--proxy-server=${proxy}`)
    }

    browser = await puppeteer.launch({
      headless: true,
      args: args,
      ignoreHTTPSErrors: true,
      ignoreDefaultArgs: ['--disable-extensions']
    })

    const page = await browser.newPage()

    // Set random user agent
    await page.setUserAgent(getRandomUserAgent())

    // Set viewport to mimic a real browser
    await page.setViewport({ width: 1366, height: 768 })

    // Random delay before navigation
    await page.waitForTimeout(Math.random() * 2000 + 1000) // 1-3 seconds

    console.log(`Navigating to ${url}...`)
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 })

    // Simulate mouse movements
    await simulateMouseMovements(page)

    // Wait for page to load completely
    await page.waitForTimeout(Math.random() * 3000 + 2000) // 2-5 seconds

    // Scrape prices - this is a generic selector, adjust based on site
    const prices = await page.evaluate(() => {
      const priceSelectors = [
        '.a-price .a-offscreen',
        '.a-color-price',
        '[data-cy="price-recipe"] .a-price-whole',
        '.priceToPay .a-price-whole',
        '.apexPriceToPay .a-price-whole'
      ]

      const prices = []
      for (const selector of priceSelectors) {
        const elements = document.querySelectorAll(selector)
        elements.forEach(el => {
          const price = el.textContent.trim()
          if (price && price !== '') {
            prices.push(price)
          }
        })
      }

      return [...new Set(prices)] // Remove duplicates
    })

    console.log('Scraped prices:', prices)
    return prices
  } catch (error) {
    console.error('Error scraping prices:', error)
    return []
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2)
  if (args.length < 1) {
    console.log('Usage: node refinery_LG4pfiLs.js <url> [proxy]')
    console.log('Example: node refinery_LG4pfiLs.js https://www.amazon.com/dp/B08N5WRWNW')
    process.exit(1)
  }

  const url = args[0]
  const proxy = args[1] || null

  console.log('Starting price scraper...')
  const prices = await scrapePrices(url, proxy)
  console.log('Scraping completed.')
  console.log('Prices found:', prices.length)
}

// Run the scraper if this file is executed directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { scrapePrices }
