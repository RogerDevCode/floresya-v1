/**
 * Contact Page Dynamic Content Loader
 * Loads all contact information from settings API
 */

import { api } from '../js/shared/api-client.js'
import { initCartBadge, initCartEventListeners } from '../js/shared/cart.js'

// Settings cache
let contactSettings = {}

/**
 * Load contact settings from API
 */
async function loadContactSettings() {
  const response = await api.getAllPublic()

  if (!response.success || !response.data) {
    throw new Error('Failed to load contact settings')
  }

  // Convert to map for easy access
  const settings = response.data
  contactSettings = {}
  settings.forEach(setting => {
    contactSettings[setting.key] = setting.value
  })

  return contactSettings
}

/**
 * Get setting value with fallback
 */
function getSetting(key, fallback = '') {
  return contactSettings[key] || fallback
}

/**
 * Update DOM with settings
 */
function updateContactPage() {
  // Owner Information
  updateTextContent('[data-contact="owner_name"]', getSetting('contact_owner_name'))
  updateTextContent('[data-contact="owner_experience"]', getSetting('contact_owner_experience'))
  updateTextContent('[data-contact="owner_specialty"]', getSetting('contact_owner_specialty'))
  updateTextContent('[data-contact="shop_name"]', getSetting('contact_shop_name'))
  updateTextContent('[data-contact="shop_location_text"]', getSetting('contact_shop_location_text'))

  // Contact Phones
  const phonePrimary = getSetting('contact_phone_primary')
  const phoneSecondary = getSetting('contact_phone_secondary')
  updateTextContent('[data-contact="phone_primary"]', phonePrimary)
  updateHref('[data-contact-href="phone_primary"]', `tel:${phonePrimary}`)
  updateTextContent('[data-contact="phone_secondary"]', phoneSecondary)
  updateHref('[data-contact-href="phone_secondary"]', `tel:${phoneSecondary}`)

  // WhatsApp
  const whatsappMain = getSetting('contact_whatsapp_main')
  const whatsappSpecial = getSetting('contact_whatsapp_special')
  updateTextContent('[data-contact="whatsapp_main"]', whatsappMain)
  updateHref(
    '[data-contact-href="whatsapp_main"]',
    `https://wa.me/${whatsappMain.replace(/[^0-9]/g, '')}`
  )
  updateTextContent('[data-contact="whatsapp_special"]', whatsappSpecial)
  updateHref(
    '[data-contact-href="whatsapp_special"]',
    `https://wa.me/${whatsappSpecial.replace(/[^0-9]/g, '')}`
  )

  // Email
  const emailMain = getSetting('contact_email_main')
  updateTextContent('[data-contact="email_main"]', emailMain)
  updateHref('[data-contact-href="email_main"]', `mailto:${emailMain}`)
  updateTextContent(
    '[data-contact="email_response_time"]',
    getSetting('contact_email_response_time')
  )

  // Location
  updateTextContent('[data-contact="location_main"]', getSetting('contact_location_main'))
  updateTextContent(
    '[data-contact="location_delivery_area"]',
    getSetting('contact_location_delivery_area')
  )
  updateTextContent('[data-contact="location_coverage"]', getSetting('contact_location_coverage'))
  updateTextContent('[data-contact="location_address"]', getSetting('contact_location_address'))

  // Hours
  updateTextContent('[data-contact="hours_weekday"]', getSetting('contact_hours_weekday'))
  updateTextContent('[data-contact="hours_saturday"]', getSetting('contact_hours_saturday'))
  updateTextContent('[data-contact="hours_sunday"]', getSetting('contact_hours_sunday'))
  updateTextContent('[data-contact="delivery_same_day"]', getSetting('contact_delivery_same_day'))

  // Payment Methods - Pago Móvil
  updateTextContent(
    '[data-contact="payment_movil_venezuela_phone"]',
    getSetting('payment_movil_venezuela_phone')
  )
  updateTextContent(
    '[data-contact="payment_movil_venezuela_cedula"]',
    getSetting('payment_movil_venezuela_cedula')
  )
  updateTextContent(
    '[data-contact="payment_movil_banesco_phone"]',
    getSetting('payment_movil_banesco_phone')
  )
  updateTextContent(
    '[data-contact="payment_movil_banesco_cedula"]',
    getSetting('payment_movil_banesco_cedula')
  )
  updateTextContent(
    '[data-contact="payment_movil_mercantil_phone"]',
    getSetting('payment_movil_mercantil_phone')
  )
  updateTextContent(
    '[data-contact="payment_movil_mercantil_cedula"]',
    getSetting('payment_movil_mercantil_cedula')
  )

  // Payment Methods - Transfers
  updateTextContent(
    '[data-contact="payment_transfer_venezuela_account"]',
    getSetting('payment_transfer_venezuela_account')
  )
  updateTextContent(
    '[data-contact="payment_transfer_venezuela_holder"]',
    getSetting('payment_transfer_venezuela_holder')
  )
  updateTextContent(
    '[data-contact="payment_transfer_venezuela_rif"]',
    getSetting('payment_transfer_venezuela_rif')
  )
  updateTextContent(
    '[data-contact="payment_transfer_banesco_account"]',
    getSetting('payment_transfer_banesco_account')
  )
  updateTextContent(
    '[data-contact="payment_transfer_banesco_holder"]',
    getSetting('payment_transfer_banesco_holder')
  )
  updateTextContent(
    '[data-contact="payment_transfer_banesco_cedula"]',
    getSetting('payment_transfer_banesco_cedula')
  )

  // International Payments
  updateTextContent('[data-contact="payment_zelle_email"]', getSetting('payment_zelle_email'))
  updateTextContent('[data-contact="payment_zelle_name"]', getSetting('payment_zelle_name'))
  updateTextContent('[data-contact="payment_paypal_email"]', getSetting('payment_paypal_email'))

  // Social Media
  updateHref('[data-contact-href="social_facebook"]', getSetting('social_facebook_url'))
  updateTextContent('[data-contact="social_facebook_handle"]', getSetting('social_facebook_handle'))
  updateHref('[data-contact-href="social_instagram"]', getSetting('social_instagram_url'))
  updateTextContent(
    '[data-contact="social_instagram_handle"]',
    getSetting('social_instagram_handle')
  )
  updateHref('[data-contact-href="social_tiktok"]', getSetting('social_tiktok_url'))
  updateTextContent('[data-contact="social_tiktok_handle"]', getSetting('social_tiktok_handle'))
}

/**
 * Update text content helper
 */
function updateTextContent(selector, value) {
  const elements = document.querySelectorAll(selector)
  elements.forEach(el => {
    el.textContent = value
  })
}

/**
 * Update href attribute helper
 */
function updateHref(selector, value) {
  const elements = document.querySelectorAll(selector)
  elements.forEach(el => {
    el.href = value
  })
}

/**
 * Initialize
 */
async function init() {
  try {
    // Initialize cart badge and event listeners
    initCartBadge()
    initCartEventListeners()

    await loadContactSettings()
    updateContactPage()
  } catch (error) {
    console.error('Failed to load contact settings:', error)
    // Page will show default/hardcoded values
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init)
