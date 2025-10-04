/**
 * Debug script to test if routes are properly registered
 */
import productRoutes from './api/routes/productRoutes.js'

console.log('Router stack:')
console.log('Total routes:', productRoutes.stack.length)

productRoutes.stack.forEach((layer, index) => {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).join(', ').toUpperCase()
    console.log(`${index}: ${methods} ${layer.route.path}`)
  }
})

// Search for image routes specifically
console.log('\nImage-related routes:')
productRoutes.stack
  .filter(layer => layer.route && layer.route.path.includes('image'))
  .forEach(layer => {
    const methods = Object.keys(layer.route.methods).join(', ').toUpperCase()
    console.log(`  ${methods} ${layer.route.path}`)
  })
