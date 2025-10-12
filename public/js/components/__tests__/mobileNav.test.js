/**
 * Mobile Navigation Component Tests
 *
 * Basic tests to verify the mobileNav component is self-contained
 * and can be imported without errors.
 */

import { MobileNav, initMobileNav } from '../mobileNav.js'

describe('MobileNav Component', () => {
  let mobileNav
  let mockDOM

  beforeEach(() => {
    // Set up a minimal DOM structure for testing
    mockDOM = document.createElement('div')
    mockDOM.innerHTML = `
      <button id="mobile-menu-btn" aria-expanded="false">Menu</button>
      <div id="mobile-menu" class="hidden">
        <ul class="mobile-nav-links">
          <li><a href="#home" class="mobile-nav-link">Home</a></li>
          <li><a href="#products" class="mobile-nav-link">Products</a></li>
        </ul>
      </div>
    `
    document.body.appendChild(mockDOM)
  })

  afterEach(() => {
    // Clean up
    if (mobileNav) {
      mobileNav.destroy()
    }
    document.body.removeChild(mockDOM)
  })

  test('should import MobileNav class successfully', () => {
    expect(MobileNav).toBeDefined()
    expect(typeof MobileNav).toBe('function')
  })

  test('should import initMobileNav function successfully', () => {
    expect(initMobileNav).toBeDefined()
    expect(typeof initMobileNav).toBe('function')
  })

  test('should create MobileNav instance with default options', () => {
    mobileNav = new MobileNav()
    expect(mobileNav).toBeInstanceOf(MobileNav)
    expect(mobileNav.options.menuBtnSelector).toBe('#mobile-menu-btn')
    expect(mobileNav.options.menuSelector).toBe('#mobile-menu')
    expect(mobileNav.options.animationDuration).toBe(300)
  })

  test('should create MobileNav instance with custom options', () => {
    const customOptions = {
      animationDuration: 400,
      drawerId: 'custom-drawer'
    }
    mobileNav = new MobileNav(customOptions)
    expect(mobileNav.options.animationDuration).toBe(400)
    expect(mobileNav.options.drawerId).toBe('custom-drawer')
  })

  test('should initialize without errors', () => {
    mobileNav = new MobileNav()
    expect(() => mobileNav.init()).not.toThrow()
  })

  test('should have all required methods', () => {
    mobileNav = new MobileNav()

    // Check that all required methods exist
    expect(typeof mobileNav.init).toBe('function')
    expect(typeof mobileNav.open).toBe('function')
    expect(typeof mobileNav.close).toBe('function')
    expect(typeof mobileNav.toggle).toBe('function')
    expect(typeof mobileNav.isOpenDrawer).toBe('function')
    expect(typeof mobileNav.destroy).toBe('function')
  })

  test('should start with closed state', () => {
    mobileNav = new MobileNav()
    mobileNav.init()
    expect(mobileNav.isOpenDrawer()).toBe(false)
  })

  test('should toggle open/close states', () => {
    mobileNav = new MobileNav()
    mobileNav.init()

    // Should start closed
    expect(mobileNav.isOpenDrawer()).toBe(false)

    // Toggle to open
    mobileNav.toggle()
    expect(mobileNav.isOpenDrawer()).toBe(true)

    // Toggle to close
    mobileNav.toggle()
    expect(mobileNav.isOpenDrawer()).toBe(false)
  })

  test('should clean up properly on destroy', () => {
    mobileNav = new MobileNav()
    mobileNav.init()

    // Open drawer first
    mobileNav.open()
    expect(mobileNav.isOpenDrawer()).toBe(true)

    // Destroy should close and clean up
    expect(() => mobileNav.destroy()).not.toThrow()

    // Drawer should be removed from DOM
    const drawer = document.getElementById('mobile-nav-drawer')
    expect(drawer).toBeNull()

    // Overlay should be removed from DOM
    const overlay = document.getElementById('mobile-nav-overlay')
    expect(overlay).toBeNull()
  })

  test('should return instance from initMobileNav', () => {
    const instance = initMobileNav()
    expect(instance).toBeInstanceOf(MobileNav)
  })
})
