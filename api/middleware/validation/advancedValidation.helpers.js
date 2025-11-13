/**
 * Advanced Validation - Helper Constants & Patterns
 * LEGACY: Modularized from advancedValidation.js (Phase 6)
 */

// Venezuelan phone number regex patterns
export const VENEZUELA_PHONE_PATTERNS = {
  mobile: /^(?:\+58|0)(?:412|414|416|424|426)\d{7}$/,
  landline: /^(?:\+58|0)212\d{7}$/,
  all: /^(?:\+58|0)(?:2\d{2}|4\d{2})\d{7}$/
}

// Email validation with common Venezuelan domains
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
export const VENEZUELA_EMAIL_DOMAINS = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'live.com'
]

// Business rules constants
export const BUSINESS_LIMITS = {
  maxOrderAmount: 10000, // Maximum USD per order
  minOrderAmount: 1, // Minimum USD per order
  maxItemsPerOrder: 50, // Maximum items in one order
  maxQuantityPerItem: 100, // Maximum quantity per item
  maxNameLength: 255, // Maximum length for names
  maxAddressLength: 500, // Maximum length for addresses
  maxNotesLength: 1000 // Maximum length for notes
}
