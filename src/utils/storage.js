/**
 * LocalStorage Utilities
 * Helpers for working with browser storage
 */

/**
 * Get item from localStorage with JSON parsing
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or default
 */
export function getStorageItem(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Failed to get storage item "${key}":`, error)
    return defaultValue
  }
}

/**
 * Set item in localStorage with JSON stringification
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} Success status
 */
export function setStorageItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Failed to set storage item "${key}":`, error)
    return false
  }
}

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export function removeStorageItem(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Failed to remove storage item "${key}":`, error)
    return false
  }
}

/**
 * Clear all localStorage items
 * @returns {boolean} Success status
 */
export function clearStorage() {
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Failed to clear storage:', error)
    return false
  }
}