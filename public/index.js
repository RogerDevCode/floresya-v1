/**
 * FloresYa - Index Page (ES6 Module)
 * Mobile menu toggle and UI interactions for index.html
 */

import { createIcons } from './js/lucide-icons.js'

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn')
  const mobileMenu = document.getElementById('mobile-menu')

  if (!menuBtn || !mobileMenu) {
    return
  }

  menuBtn.addEventListener('click', () => {
    const isHidden = mobileMenu.classList.toggle('hidden')
    menuBtn.setAttribute('aria-expanded', !isHidden)
  })

  // Close mobile menu on link click
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-nav-link')
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden')
      menuBtn.setAttribute('aria-expanded', 'false')
    })
  })
}

/**
 * Initialize smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href')
      if (href === '#' || href.startsWith('#login') || href.startsWith('#carrito')) {
        return
      }

      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    })
  })
}

/**
 * Initialize page
 */
function init() {
  // Initialize Lucide icons
  createIcons()

  // Initialize features
  initMobileMenu()
  initSmoothScroll()

  // Mark page as loaded
  document.documentElement.classList.add('loaded')
}

// Run on DOM ready
document.addEventListener('DOMContentLoaded', init)
