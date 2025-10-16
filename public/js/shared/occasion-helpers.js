/**
 * Occasion Helper Functions
 * Generate slug, icon, etc.
 */

/**
 * Generate slug from name
 * @param {string} name - Occasion name
 * @returns {string} - URL-safe slug
 */
export function generateSlug(name) {
  if (!name) {
    return ''
  }

  return name
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Lucide icons suitable for occasions
 */
const OCCASION_ICONS = [
  'heart',
  'gift',
  'cake',
  'flower',
  'flower-2',
  'sparkles',
  'star',
  'party-popper',
  'trophy',
  'graduation-cap',
  'baby',
  'home',
  'church',
  'crown',
  'candy',
  'smile',
  'sun',
  'moon',
  'music',
  'camera',
  'book',
  'feather'
]

/**
 * Get random icon from available icons (avoiding collisions)
 * @param {Array} existingOccasions - Array of existing occasions to check for collisions
 * @returns {string} - Icon name
 */
export function getRandomIcon(existingOccasions = []) {
  // Get icons already in use
  const usedIcons = new Set(existingOccasions.map(occ => occ.icon).filter(Boolean))

  // Get available icons
  const available = OCCASION_ICONS.filter(icon => !usedIcons.has(icon))

  // If no available icons, use all icons (allow collisions)
  if (available.length === 0) {
    return OCCASION_ICONS[Math.floor(Math.random() * OCCASION_ICONS.length)]
  }

  // Return random available icon
  return available[Math.floor(Math.random() * available.length)]
}

/**
 * Get random color for occasion
 * @returns {string} - Hex color
 */
export function getRandomColor() {
  const colors = [
    '#db2777', // pink
    '#ef4444', // red
    '#f59e0b', // amber
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f97316', // orange
    '#14b8a6', // teal
    '#6366f1' // indigo
  ]

  return colors[Math.floor(Math.random() * colors.length)]
}
