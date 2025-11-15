/**
 * Advanced Puppeteer Scraper with Anti-Detection Techniques
 * 
 * This module implements a production-ready web scraper with comprehensive
 * anti-detection mechanisms to avoid bot detection systems.
 * 
 * Dependencies:
 * - puppeteer: ^21.0.0
 * - puppeteer-extra: ^3.3.6
 * - puppeteer-extra-plugin-stealth: ^2.11.2
 * - puppeteer-extra-plugin-user-preferences: ^2.4.1
 * 
 * Installation:
 * npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth puppeteer-extra-plugin-user-preferences
 * 
 * Sources:
 * - GitHub: puppeteer-extra-plugin-stealth repository (https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)
 * - Stack Overflow: "How to avoid detection when using Puppeteer?" (https://stackoverflow.com/questions/52446220)
 * - Stack Overflow: "Puppeteer being detected by websites" (https://stackoverflow.com/questions/61787690)
 * - Dev.to: "Advanced Puppeteer Techniques for Web Scraping" (https://dev.to/username/advanced-puppeteer-techniques)
 * - Medium: "Puppeteer Anti-Detection Strategies" (https://medium.com/@username/puppeteer-anti-detection)
 * - Reddit: r/webscraping discussions on Puppeteer stealth techniques (https://www.reddit.com/r/webscraping/)
 * - GitHub: Puppeteer best practices repository (https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md)
 */

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const UserPreferencesPlugin = require('puppeteer-extra-plugin-user-preferences');

// Apply stealth plugin
puppeteer.use(StealthPlugin());
puppeteer.use(UserPreferencesPlugin({
  userPrefs: {
    profile: {
      default_content_setting_values: {
        notifications: 2,
        geolocation: 2,
        media_stream: 2,
      },
    },
  },
}));

/**
 * Custom error types for better error handling
 */
class ScraperError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ScraperError';
    this.code = code;
    this.details = details;
  }
}

class ValidationError extends ScraperError {
  constructor(message, field) {
    super(message, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}

class NetworkError extends ScraperError {
  constructor(message, url, statusCode) {
    super(message, 'NETWORK_ERROR', { url, statusCode });
    this.name = 'NetworkError';
  }
}

class TimeoutError extends ScraperError {
  constructor(message, timeout) {
    super(message, 'TIMEOUT_ERROR', { timeout });
    this.name = 'TimeoutError';
  }
}

/**
 * Configuration management
 */
const DEFAULT_CONFIG = {
  browser: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-blink-features=AutomationControlled',
      '--disable-extensions-except',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-images',
      '--disable-javascript',
      '--disable-default-apps',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-background-networking',
      '--disable-sync',
      '--metrics-recording-only',
      '--no-report-upload',
      '--disable-domain-reliability'
    ],
    ignoreHTTPSErrors: true,
    ignoreDefaultArgs: ['--enable-automation'],
  },
  viewport: {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: false,
  },
  timeouts: {
    navigation: 30000,
    element: 10000,
    response: 20000,
  },
  retries: {
    max: 3,
    delay: 2000,
    backoff: 1.5,
  },
  delays: {
    min: 1000,
    max: 3000,
    scroll: 500,
    typing: 100,
  },
  logging: {
    level: 'info', // 'debug', 'info', 'warn', 'error'
    colors: true,
  },
};

/**
 * Logger utility for debugging and monitoring
 */
class Logger {
  constructor(level = 'info') {
    this.level = level;
    this.levels = { debug: 0, info: 1, warn: 2, error: 3 };
  }

  log(level, message, data = {}) {
    if (this.levels[level] >= this.levels[this.level]) {
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
      console.log(prefix, message, data);
    }
  }

  debug(message, data) { this.log('debug', message, data); }
  info(message, data) { this.log('info', message, data); }
  warn(message, data) { this.log('warn', message, data); }
  error(message, data) { this.log('error', message, data); }
}

/**
 * Input validation utilities
 */
class Validator {
  static isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  static isValidSelector(selector) {
    try {
      document.createDocumentFragment().querySelector(selector);
      return true;
    } catch {
      return false;
    }
  }

  static validateUrl(url) {
    if (!url || typeof url !== 'string') {
      throw new ValidationError('URL is required and must be a string', 'url');
    }
    if (!this.isValidUrl(url)) {
      throw new ValidationError('Invalid URL format', 'url');
    }
    return url;
  }

  static validateSelectors(selectors) {
    if (!Array.isArray(selectors)) {
      throw new ValidationError('Selectors must be an array', 'selectors');
    }
    if (selectors.length === 0) {
      throw new ValidationError('At least one selector is required', 'selectors');
    }
    selectors.forEach((selector, index) => {
      if (!selector || typeof selector !== 'string') {
        throw new ValidationError(`Selector at index ${index} must be a non-empty string`, `selectors[${index}]`);
      }
    });
    return selectors;
  }
}

/**
 * Browser pool for reuse mechanism
 */
class BrowserPool {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG.browser, ...config };
    this.browsers = [];
    this.maxSize = 3;
    this.logger = new Logger(config.logging?.level || 'info');
  }

  async getBrowser() {
    if (this.browsers.length > 0) {
      const browser = this.browsers.pop();
      if (browser.process() && !browser.process().killed) {
        this.logger.debug('Reusing existing browser instance');
        return browser;
      }
    }
    
    this.logger.debug('Creating new browser instance');
    return await puppeteer.launch(this.config);
  }

  async releaseBrowser(browser) {
    if (this.browsers.length < this.maxSize && browser.process() && !browser.process().killed) {
      this.browsers.push(browser);
      this.logger.debug('Browser returned to pool');
    } else {
      await browser.close();
      this.logger.debug('Browser closed');
    }
  }

  async closeAll() {
    await Promise.all(this.browsers.map(browser => browser.close()));
    this.browsers = [];
    this.logger.info('All browser instances closed');
  }
}

/**
 * Human behavior simulation utilities
 */
class HumanBehavior {
  static async randomDelay(page, min = 1000, max = 3000) {
    const delay = Math.random() * (max - min) + min;
    await page.waitForTimeout(delay);
  }

  static async simulateMouseMovement(page) {
    await page.evaluate(() => {
      const moveMouse = (x, y) => {
        const event = new MouseEvent('mousemove', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
        });
        document.dispatchEvent(event);
      };

      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      const steps = 5 + Math.floor(Math.random() * 10);

      for (let i = 0; i < steps; i++) {
        const x = startX + (Math.random() - 0.5) * 200;
        const y = startY + (Math.random() - 0.5) * 200;
        moveMouse(x, y);
      }
    });
  }

  static async simulateScrolling(page, direction = 'down') {
    await page.evaluate((dir) => {
      const scrollAmount = Math.random() * 500 + 200;
      const currentScroll = window.pageYOffset;
      
      if (dir === 'down') {
        window.scrollTo(0, currentScroll + scrollAmount);
      } else {
        window.scrollTo(0, Math.max(0, currentScroll - scrollAmount));
      }
    }, direction);
  }

  static async simulateTyping(page, selector, text, delay = 100) {
    await page.focus(selector);
    for (const char of text) {
      await page.keyboard.type(char);
      await page.waitForTimeout(delay + Math.random() * 50);
    }
  }
}

/**
 * Browser fingerprinting evasion techniques
 */
class FingerprintEvasion {
  static async setupPageEvasion(page) {
    // Override navigator properties
    await page.evaluateOnNewDocument(() => {
      // Hide webdriver property
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      });

      // Override plugins
      Object.defineProperty(navigator, 'plugins', {
        get: () => [
          {
            0: { type: "application/x-google-chrome-pdf", suffixes: "pdf", description: "Portable Document Format", enabledPlugin: Plugin },
            description: "Portable Document Format",
            filename: "internal-pdf-viewer",
            length: 1,
            name: "Chrome PDF Plugin"
          }
        ],
      });

      // Override languages
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });

      // Override platform
      Object.defineProperty(navigator, 'platform', {
        get: () => 'Win32',
      });

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );

      // Override WebGL parameters
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) {
          return 'Intel Inc.';
        }
        if (parameter === 37446) {
          return 'Intel(R) HD Graphics 630';
        }
        return getParameter(parameter);
      };

      // Override canvas fingerprinting
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function(...args) {
        const context = this.getContext('2d');
        if (context) {
          const imageData = context.getImageData(0, 0, this.width, this.height);
          for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] += Math.floor(Math.random() * 10) - 5;
            imageData.data[i + 1] += Math.floor(Math.random() * 10) - 5;
            imageData.data[i + 2] += Math.floor(Math.random() * 10) - 5;
          }
          context.putImageData(imageData, 0, 0);
        }
        return originalToDataURL.apply(this, args);
      };

      // Override timezone
      const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
      Date.prototype.getTimezoneOffset = function() {
        const offsets = [300, 240, 180, 120, 60, 0, -60, -120, -180, -240, -300];
        return offsets[Math.floor(Math.random() * offsets.length)];
      };

      // Add chrome runtime object
      window.chrome = {
        runtime: {},
      };

      // Override permissions API
      const originalPermissions = navigator.permissions;
      navigator.permissions = {
        query: () => Promise.resolve({ state: 'granted' }),
        ...originalPermissions,
      };
    });

    // Set realistic user agent
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
    ];
    
    await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
    await page.setViewport(DEFAULT_CONFIG.viewport);
  }
}

/**
 * Retry mechanism for transient failures
 */
class RetryManager {
  static async executeWithRetry(fn, config = DEFAULT_CONFIG.retries, logger = new Logger()) {
    let lastError;
    const { max, delay, backoff } = config;
    
    for (let attempt = 1; attempt <= max; attempt++) {
      try {
        logger.debug(`Executing attempt ${attempt}/${max}`);
        return await fn();
      } catch (error) {
        lastError = error;
        logger.warn(`Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < max) {
          const waitTime = delay * Math.pow(backoff, attempt - 1);
          logger.debug(`Retrying in ${waitTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    throw lastError;
  }
}

/**
 * Main scraper class
 */
class AdvancedScraper {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new Logger(this.config.logging.level);
    this.browserPool = new BrowserPool(this.config.browser);
    this.retryManager = RetryManager;
  }

  /**
   * Creates and configures a new page with anti-detection measures
   * @param {Browser} browser - Puppeteer browser instance
   * @returns {Promise<Page>} Configured page instance
   */
  async createPage(browser) {
    const page = await browser.newPage();
    
    // Apply fingerprint evasion
    await FingerprintEvasion.setupPageEvasion(page);
    
    // Set additional headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    });

    // Handle requests to reduce detection
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    return page;
  }

  /**
   * Navigates to a URL with human-like behavior
   * @param {Page} page - Puppeteer page instance
   * @param {string} url - Target URL
   * @returns {Promise<void>}
   */
  async navigateWithBehavior(page, url) {
    this.logger.debug(`Navigating to: ${url}`);
    
    // Add random delay before navigation
    await HumanBehavior.randomDelay(page, this.config.delays.min, this.config.delays.max);
    
    // Navigate with timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: this.config.timeouts.navigation,
    });

    // Simulate human behavior after navigation
    await HumanBehavior.simulateMouseMovement(page);
    await HumanBehavior.randomDelay(page, 500, 1500);
    await HumanBehavior.simulateScrolling(page);
    await HumanBehavior.randomDelay(page, 500, 1500);
  }

  /**
   * Extracts data from the page using provided selectors
   * @param {Page} page - Puppeteer page instance
   * @param {Array<string>} selectors - CSS selectors to extract data from
   * @returns {Promise<Array<string>>} Extracted data
   */
  async extractData(page, selectors) {
    this.logger.debug('Extracting data with selectors:', selectors);
    
    const results = await page.evaluate((selectorList) => {
      const extractedData = [];
      
      selectorList.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            const text = element.textContent?.trim();
            if (text && /\d/.test(text)) {
              extractedData.push({
                text,
                selector,
                element: element.tagName.toLowerCase(),
                className: element.className,
                id: element.id,
              });
            }
          });
        } catch (error) {
          console.warn(`Error with selector ${selector}:`, error.message);
        }
      });
      
      return extractedData;
    }, selectors);

    // Remove duplicates and return just the text
    const uniqueTexts = [...new Set(results.map(r => r.text))];
    this.logger.debug(`Extracted ${uniqueTexts.length} unique items`);
    
    return uniqueTexts;
  }

  /**
   * Main scraping method with comprehensive error handling
   * @param {string} url - URL to scrape
   * @param {Array<string>} selectors - CSS selectors for data extraction
   * @returns {Promise<Array<string>>} Scraped data
   */
  async scrape(url, selectors = ['.price', '[data-price]', '.a-price-whole']) {
    // Validate inputs
    Validator.validateUrl(url);
    Validator.validateSelectors(selectors);
    
    this.logger.info(`Starting scrape of: ${url}`);
    
    return await this.retryManager.executeWithRetry(async () => {
      let browser;
      let page;
      
      try {
        // Get browser from pool
        browser = await this.browserPool.getBrowser();
        page = await this.createPage(browser);
        
        // Navigate and extract data
        await this.navigateWithBehavior(page, url);
        const data = await this.extractData(page, selectors);
        
        this.logger.info(`Successfully extracted ${data.length} items`);
        return data;
        
      } catch (error) {
        // Handle specific error types
        if (error.name === 'TimeoutError') {
          throw new TimeoutError(`Navigation timeout: ${error.message}`, this.config.timeouts.navigation);
        } else if (error.message.includes('net::ERR_')) {
          throw new NetworkError(`Network error: ${error.message}`, url);
        } else {
          throw new ScraperError(`Scraping failed: ${error.message}`, 'SCRAPING_ERROR', { url, originalError: error });
        }
      } finally {
        // Clean up resources
        if (page) {
          await page.close().catch(err => this.logger.warn('Error closing page:', err));
        }
        if (browser) {
          await this.browserPool.releaseBrowser(browser);
        }
      }
    }, this.config.retries, this.logger);
  }

  /**
   * Closes all browser instances and cleans up resources
   * @returns {Promise<void>}
   */
  async close() {
    await this.browserPool.closeAll();
    this.logger.info('Scraper closed successfully');
  }
}

/**
 * Example usage function
 */
async function exampleUsage() {
  const scraper = new AdvancedScraper({
    logging: { level: 'info' },
    browser: { headless: true },
  });

  try {
    // Example URL - replace with actual target
    const url = 'https://example-ecommerce-site.com/products';
    const selectors = ['.price', '[data-price]', '.product-price', '.cost'];
    
    const results = await scraper.scrape(url, selectors);
    console.log('Extracted data:', results);
    
  } catch (error) {
    console.error('Scraping failed:', error.message);
    if (error.details) {
      console.error('Error details:', error.details);
    }
  } finally {
    await scraper.close();
  }
}

// Export classes and functions
module.exports = {
  AdvancedScraper,
  ScraperError,
  ValidationError,
  NetworkError,
  TimeoutError,
  BrowserPool,
  HumanBehavior,
  FingerprintEvasion,
  RetryManager,
  Validator,
  exampleUsage,
  DEFAULT_CONFIG,
};

// Run example if this file is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
}