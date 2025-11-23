/**
 * Occasion Popularity Tracker (KISS)
 * Tracks occasion selection in dropdowns and manages display order
 */
// @ts-nocheck

const STORAGE_KEY = 'floresya_occasion_popularity'

/**
 * Get popularity data from localStorage
 * @returns {Object} - {occasionId: count}
 */
export function getPopularityData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('Error reading popularity data:', error)
    return {}
  }
}

/**
 * Track occasion selection (increment counter)
 * @param {number} occasionId - ID of the occasion selected
 */
export function trackOccasionSelection(occasionId) {
  if (!occasionId) {
    return
  }

  const data = getPopularityData()
  data[occasionId] = (data[occasionId] || 0) + 1

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving popularity data:', error)
  }
}

/**
 * Sort occasions by popularity (most popular first), then alphabetically
 * @param {Array} occasions - Array of occasion objects
 * @returns {Array} - Sorted occasions
 */
export function sortByPopularity(occasions) {
  if (!occasions || !Array.isArray(occasions)) {
    return []
  }

  const popularityData = getPopularityData()

  return [...occasions].sort((a, b) => {
    const countA = popularityData[a.id] || 0
    const countB = popularityData[b.id] || 0

    // Sort by popularity first (descending)
    if (countB !== countA) {
      return countB - countA
    }

    // If same popularity, sort alphabetically
    return a.name.localeCompare(b.name, 'es')
  })
}

/**
 * Get display order for an occasion based on popularity
 * @param {number} occasionId - ID of the occasion
 * @param {Array} allOccasions - All occasions array
 * @returns {number} - Display order (0 = first)
 */
export function getDisplayOrder(occasionId, allOccasions) {
  const sorted = sortByPopularity(allOccasions)
  const index = sorted.findIndex(occ => occ.id === occasionId)
  return index >= 0 ? index : 999
}

/**
 * Reset popularity data (for admin use)
 */
export function resetPopularityData() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error resetting popularity data:', error)
  }
}
