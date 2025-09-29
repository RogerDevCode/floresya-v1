/**
 * ProductCard Component
 * @typedef {import('../types/index.js').Product} Product
 */

export class ProductCard {
  /**
   * Render a single product card
   * @param {Product} product
   * @returns {string}
   */
  static render(product) {
    const occasionBadges = {
      amor: '❤️ Amor',
      cumpleanos: '🎂 Cumpleaños',
      madre: '👩 Madre',
      aniversario: '💍 Aniversario',
      graduacion: '🎓 Graduación',
      condolencias: '🕊️ Condolencias'
    }

    const badge = occasionBadges[product.occasion] || product.occasion

    return `
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
        <div class="relative overflow-hidden group">
          <img src="${product.image}"
               alt="${product.name}"
               class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500">
          ${product.featured ? '<span class="absolute top-4 right-4 bg-coral-500 text-white px-3 py-1 rounded-full text-sm font-bold">⭐ Destacado</span>' : ''}
          <span class="absolute top-4 left-4 bg-white bg-opacity-90 text-forest-700 px-3 py-1 rounded-full text-sm font-medium">${badge}</span>
        </div>

        <div class="p-6">
          <h3 class="text-xl font-bold text-forest-900 mb-2">${product.name}</h3>
          <p class="text-forest-600 text-sm mb-4 line-clamp-2">${product.description}</p>

          <div class="flex justify-between items-center">
            <div class="text-3xl font-bold text-coral-500">$${product.price.toFixed(2)}</div>
            <button
              onclick="window.app.addToCart(${product.id})"
              class="btn-coral group">
              <i data-lucide="shopping-cart" class="h-4 w-4 mr-2"></i>
              <span>Agregar</span>
            </button>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Render multiple product cards
   * @param {Product[]} products
   * @returns {string}
   */
  static renderGrid(products) {
    if (!products || products.length === 0) {
      return '<div class="col-span-full text-center py-12 text-forest-600">No hay productos disponibles</div>'
    }

    return products.map(product => this.render(product)).join('')
  }
}