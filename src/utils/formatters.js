/**
 * Formatting Utilities
 * Format currency, dates, etc.
 */

/**
 * Format number as USD currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  } catch (error) {
    console.error('Failed to format currency:', error)
    return `$${amount.toFixed(2)}`
  }
}

/**
 * Format date to locale string
 * @param {Date|string} date - Date to format
 * @param {string} [locale='es-VE'] - Locale string
 * @returns {string} Formatted date string
 */
export function formatDate(date, locale = 'es-VE') {
  try {
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Failed to format date:', error)
    return String(date)
  }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text with ellipsis
 */
export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}