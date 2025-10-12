/**
 * Mobile Navigation Component Usage Example
 *
 * This file demonstrates how to import and use the mobileNav component
 * in your project. It shows both the class-based approach and the
 * convenience function approach.
 */

// Example 1: Using the convenience function (recommended)
import { initMobileNav, MobileNav } from './mobileNav.js'

// Initialize with default options
const mobileNav = initMobileNav()

// Example 2: Using the class directly with custom options

const customMobileNav = new MobileNav({
  menuBtnSelector: '#custom-menu-btn',
  menuSelector: '#custom-menu',
  drawerId: 'custom-mobile-drawer',
  overlayId: 'custom-mobile-overlay',
  animationDuration: 400
})

// Initialize when DOM is ready
customMobileNav.init()

// Example 3: Advanced usage with event listeners
document.addEventListener('DOMContentLoaded', () => {
  const advancedMobileNav = new MobileNav()

  // Initialize the component
  advancedMobileNav.init()

  // You can programmatically control the drawer
  document.getElementById('open-drawer-btn')?.addEventListener('click', () => {
    advancedMobileNav.open()
  })

  document.getElementById('close-drawer-btn')?.addEventListener('click', () => {
    advancedMobileNav.close()
  })

  // Listen for custom events if needed
  // (You could extend the component to emit custom events)

  // Clean up when page unloads
  window.addEventListener('beforeunload', () => {
    advancedMobileNav.destroy()
  })
})

// Example 4: Integration with existing index.js
//
// To replace the existing mobile menu in index.js:
//
// 1. Remove or comment out the initMobileMenu() function call
// 2. Add the import at the top:
//    import { initMobileNav } from './js/components/mobileNav.js'
// 3. Replace the initMobileMenu() call with:
//    initMobileNav()
// 4. The new drawer will automatically replace the old menu

export { mobileNav, customMobileNav }
