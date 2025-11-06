/**
 * Auto-generated helper functions
 * Created by broken link fixer
 */

export function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getRandomIcon() {
  const icons = ['🌸', '🌺', '🌹', '🌷', '🌻']
  return icons[Math.floor(Math.random() * icons.length)]
}

export function getRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
  return colors[Math.floor(Math.random() * colors.length)]
}
