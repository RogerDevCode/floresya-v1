/**
 * Test script for validating the improved Puppeteer scraper implementation
 * 
 * This script performs comprehensive validation checks without actually running
 * the scraper against a website.
 */

const fs = require('fs');
const path = require('path');

// Test results tracking
const testResults = {
  syntax: { passed: 0, failed: 0, errors: [] },
  dependencies: { passed: 0, failed: 0, errors: [] },
  structure: { passed: 0, failed: 0, errors: [] },
  configuration: { passed: 0, failed: 0, errors: [] },
  errorHandling: { passed: 0, failed: 0, errors: [] },
  antiDetection: { passed: 0, failed: 0, errors: [] },
  exports: { passed: 0, failed: 0, errors: [] }
};

// Helper function to log test results
function logTest(category, testName, passed, error = null) {
  const status = passed ? '✓' : '✗';
  console.log(`${status} [${category}] ${testName}`);
  
  if (passed) {
    testResults[category].passed++;
  } else {
    testResults[category].failed++;
    if (error) {
      testResults[category].errors.push({ test: testName, error: error.message || error });
      console.log(`    Error: ${error.message || error}`);
    }
  }
}

// Helper function to check if a file has valid JavaScript syntax
function validateSyntax(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Try to parse the file to check for syntax errors
    const script = new Function(content);
    return true;
  } catch (error) {
    return error;
  }
}

// Main test function
async function runTests() {
  console.log('='.repeat(60));
  console.log('Puppeteer Scraper Validation Tests');
  console.log('='.repeat(60));
  
  // 1. Syntax validation
  console.log('\n1. SYNTAX VALIDATION');
  console.log('-'.repeat(30));
  
  const syntaxError = validateSyntax('./improved-scraper.js');
  logTest('syntax', 'JavaScript syntax validation', !syntaxError, syntaxError);
  
  // 2. Check if we can load the module
  let scraperModule;
  try {
    // Mock the puppeteer modules to avoid dependency issues during testing
    const originalRequire = require;
    require = function(id) {
      if (id.includes('puppeteer')) {
        return {
          use: () => {},
          launch: () => Promise.resolve({
            newPage: () => Promise.resolve({
              evaluate: () => Promise.resolve({}),
              evaluateOnNewDocument: () => {},
              setUserAgent: () => Promise.resolve(),
              setViewport: () => Promise.resolve(),
              setExtraHTTPHeaders: () => Promise.resolve(),
              setRequestInterception: () => Promise.resolve(),
              on: () => {},
              goto: () => Promise.resolve(),
              waitForTimeout: () => Promise.resolve(),
              focus: () => Promise.resolve(),
              keyboard: { type: () => Promise.resolve() },
              close: () => Promise.resolve()
            }),
            close: () => Promise.resolve(),
            process: () => ({ killed: false })
          })
        };
      }
      return originalRequire.apply(this, arguments);
    };
    
    scraperModule = require('./improved-scraper.js');
    logTest('syntax', 'Module loading', true);
  } catch (error) {
    logTest('syntax', 'Module loading', false, error);
  }
  
  // 3. Dependency verification
  console.log('\n2. DEPENDENCY VERIFICATION');
  console.log('-'.repeat(30));
  
  // Check if package.json has the required dependencies
  try {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    const requiredDeps = [
      'puppeteer',
      'puppeteer-extra',
      'puppeteer-extra-plugin-stealth',
      'puppeteer-extra-plugin-user-preferences'
    ];
    
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    requiredDeps.forEach(dep => {
      const hasDep = allDeps[dep];
      logTest('dependencies', `Dependency ${dep} exists`, hasDep, 
        hasDep ? null : new Error(`Missing dependency: ${dep}`));
    });
  } catch (error) {
    logTest('dependencies', 'Package.json parsing', false, error);
  }
  
  // 4. Code structure analysis
  console.log('\n3. CODE STRUCTURE ANALYSIS');
  console.log('-'.repeat(30));
  
  if (scraperModule) {
    // Check if all required classes are exported
    const requiredExports = [
      'AdvancedScraper',
      'ScraperError',
      'ValidationError',
      'NetworkError',
      'TimeoutError',
      'BrowserPool',
      'HumanBehavior',
      'FingerprintEvasion',
      'RetryManager',
      'Validator',
      'DEFAULT_CONFIG'
    ];
    
    requiredExports.forEach(exportName => {
      const hasExport = scraperModule[exportName] !== undefined;
      logTest('structure', `Export ${exportName} exists`, hasExport,
        hasExport ? null : new Error(`Missing export: ${exportName}`));
    });
    
    // Check class inheritance
    try {
      const validationError = new scraperModule.ValidationError('test', 'test');
      const isScraperError = validationError instanceof scraperModule.ScraperError;
      const isError = validationError instanceof Error;
      
      logTest('structure', 'ValidationError extends ScraperError', isScraperError);
      logTest('structure', 'ScraperError extends Error', isError);
    } catch (error) {
      logTest('structure', 'Error class inheritance', false, error);
    }
  }
  
  // 5. Configuration validation
  console.log('\n4. CONFIGURATION VALIDATION');
  console.log('-'.repeat(30));
  
  if (scraperModule && scraperModule.DEFAULT_CONFIG) {
    const config = scraperModule.DEFAULT_CONFIG;
    
    // Check required config sections
    const requiredSections = ['browser', 'viewport', 'timeouts', 'retries', 'delays', 'logging'];
    requiredSections.forEach(section => {
      const hasSection = config[section] !== undefined;
      logTest('configuration', `Config section ${section} exists`, hasSection,
        hasSection ? null : new Error(`Missing config section: ${section}`));
    });
    
    // Check browser config
    if (config.browser) {
      const hasArgs = Array.isArray(config.browser.args);
      logTest('configuration', 'Browser args is array', hasArgs);
      
      const hasRequiredArgs = config.browser.args.includes('--no-sandbox');
      logTest('configuration', 'Browser includes --no-sandbox', hasRequiredArgs);
    }
    
    // Check viewport config
    if (config.viewport) {
      const hasValidViewport = config.viewport.width > 0 && config.viewport.height > 0;
      logTest('configuration', 'Viewport has valid dimensions', hasValidViewport);
    }
    
    // Test configuration merging
    try {
      const testConfig = { browser: { headless: false }, logging: { level: 'debug' } };
      const scraper = new scraperModule.AdvancedScraper(testConfig);
      const mergedCorrectly = 
        scraper.config.browser.headless === false && 
        scraper.config.logging.level === 'debug' &&
        scraper.config.viewport !== undefined; // Should have default viewport
      
      logTest('configuration', 'Configuration merging works', mergedCorrectly);
    } catch (error) {
      logTest('configuration', 'Configuration merging', false, error);
    }
  }
  
  // 6. Error handling verification
  console.log('\n5. ERROR HANDLING VERIFICATION');
  console.log('-'.repeat(30));
  
  if (scraperModule) {
    // Test Validator class
    try {
      // Test valid URL
      const validUrl = scraperModule.Validator.validateUrl('https://example.com');
      logTest('errorHandling', 'Validator accepts valid URL', validUrl === 'https://example.com');
      
      // Test invalid URL
      try {
        scraperModule.Validator.validateUrl('invalid-url');
        logTest('errorHandling', 'Validator rejects invalid URL', false);
      } catch (error) {
        const isValidationError = error instanceof scraperModule.ValidationError;
        logTest('errorHandling', 'Validator rejects invalid URL', isValidationError);
      }
      
      // Test valid selectors
      const validSelectors = scraperModule.Validator.validateSelectors(['.test', '#id']);
      logTest('errorHandling', 'Validator accepts valid selectors', 
        Array.isArray(validSelectors) && validSelectors.length === 2);
      
      // Test invalid selectors
      try {
        scraperModule.Validator.validateSelectors([]);
        logTest('errorHandling', 'Validator rejects empty selectors', false);
      } catch (error) {
        const isValidationError = error instanceof scraperModule.ValidationError;
        logTest('errorHandling', 'Validator rejects empty selectors', isValidationError);
      }
    } catch (error) {
      logTest('errorHandling', 'Validator class tests', false, error);
    }
    
    // Test error classes
    try {
      const scraperError = new scraperModule.ScraperError('test', 'TEST_CODE', { test: true });
      const hasCorrectProps = 
        scraperError.message === 'test' &&
        scraperError.code === 'TEST_CODE' &&
        scraperError.details.test === true;
      
      logTest('errorHandling', 'ScraperError properties', hasCorrectProps);
    } catch (error) {
      logTest('errorHandling', 'ScraperError creation', false, error);
    }
  }
  
  // 7. Anti-detection techniques review
  console.log('\n6. ANTI-DETECTION TECHNIQUES REVIEW');
  console.log('-'.repeat(30));
  
  if (scraperModule) {
    // Check if FingerprintEvasion has required methods
    const hasSetupMethod = typeof scraperModule.FingerprintEvasion.setupPageEvasion === 'function';
    logTest('antiDetection', 'FingerprintEvasion.setupPageEvasion exists', hasSetupMethod);
    
    // Check if HumanBehavior has required methods
    const behaviorMethods = [
      'randomDelay',
      'simulateMouseMovement',
      'simulateScrolling',
      'simulateTyping'
    ];
    
    behaviorMethods.forEach(method => {
      const hasMethod = typeof scraperModule.HumanBehavior[method] === 'function';
      logTest('antiDetection', `HumanBehavior.${method} exists`, hasMethod);
    });
    
    // Check if BrowserPool has required methods
    const poolMethods = ['getBrowser', 'releaseBrowser', 'closeAll'];
    poolMethods.forEach(method => {
      const hasMethod = typeof scraperModule.BrowserPool.prototype[method] === 'function';
      logTest('antiDetection', `BrowserPool.${method} exists`, hasMethod);
    });
  }
  
  // 8. Export validation
  console.log('\n7. EXPORT VALIDATION');
  console.log('-'.repeat(30));
  
  if (scraperModule) {
    // Check if exampleUsage is exported
    const hasExampleUsage = typeof scraperModule.exampleUsage === 'function';
    logTest('exports', 'exampleUsage function exported', hasExampleUsage);
    
    // Check if AdvancedScraper can be instantiated
    try {
      const scraper = new scraperModule.AdvancedScraper();
      const hasRequiredMethods = [
        'createPage',
        'navigateWithBehavior',
        'extractData',
        'scrape',
        'close'
      ].every(method => typeof scraper[method] === 'function');
      
      logTest('exports', 'AdvancedScraper can be instantiated', true);
      logTest('exports', 'AdvancedScraper has required methods', hasRequiredMethods);
    } catch (error) {
      logTest('exports', 'AdvancedScraper instantiation', false, error);
    }
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('VALIDATION SUMMARY');
  console.log('='.repeat(60));
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  Object.keys(testResults).forEach(category => {
    const result = testResults[category];
    totalPassed += result.passed;
    totalFailed += result.failed;
    
    console.log(`\n${category.toUpperCase()}:`);
    console.log(`  Passed: ${result.passed}`);
    console.log(`  Failed: ${result.failed}`);
    
    if (result.errors.length > 0) {
      console.log('  Errors:');
      result.errors.forEach(err => {
        console.log(`    - ${err.test}: ${err.error}`);
      });
    }
  });
  
  console.log('\nOVERALL:');
  console.log(`  Total Passed: ${totalPassed}`);
  console.log(`  Total Failed: ${totalFailed}`);
  console.log(`  Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(2)}%`);
  
  // Critical issues that need to be addressed
  console.log('\nCRITICAL ISSUES:');
  const criticalIssues = [];
  
  // Check for missing dependencies
  if (testResults.dependencies.failed > 0) {
    criticalIssues.push('Missing required Puppeteer dependencies in package.json');
  }
  
  // Check for syntax errors
  if (testResults.syntax.failed > 0) {
    criticalIssues.push('Syntax errors in the scraper code');
  }
  
  // Check for missing exports
  if (testResults.exports.failed > 0) {
    criticalIssues.push('Missing or incorrect exports');
  }
  
  if (criticalIssues.length > 0) {
    criticalIssues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('  No critical issues found');
  }
  
  console.log('\n' + '='.repeat(60));
  
  return {
    totalPassed,
    totalFailed,
    successRate: (totalPassed / (totalPassed + totalFailed)) * 100,
    criticalIssues,
    testResults
  };
}

// Run the tests
runTests()
  .then(results => {
    console.log('\nTest validation completed.');
    
    // Exit with appropriate code
    process.exit(results.criticalIssues.length > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });