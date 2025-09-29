/**
 * Cart Component
 * @typedef {import('../types/index.js').CartItem} CartItem
 */

export class Cart {
  /**
   * Render cart items
   * @param {CartItem[]} items
   * @param {number} total
   * @returns {string}
   */
  static renderContent(items, total) {
    if (!items || items.length === 0) {
      return `
        <div class="text-center py-12">
          <i data-lucide="shopping-bag" class="h-16 w-16 text-blush-300 mx-auto mb-4"></i>
          <h3 class="text-xl font-bold text-forest-900 mb-2">Tu carrito está vacío</h3>
          <p class="text-forest-600 mb-6">¡Agrega algunos productos hermosos!</p>
          <button onclick="window.cartModal.close()" class="btn-coral">
            Explorar Productos
          </button>
        </div>
      `
    }

    const itemsHtml = items.map(item => `
      <div class="flex items-center gap-4 p-4 bg-blush-50 rounded-xl">
        <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg">
        <div class="flex-1">
          <h4 class="font-bold text-forest-900">${item.name}</h4>
          <p class="text-forest-600">$${item.price.toFixed(2)} × ${item.quantity}</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="window.app.updateCartQuantity(${item.productId}, ${item.quantity - 1})"
                  class="btn-sm bg-blush-200 hover:bg-blush-300 text-forest-900">
            <i data-lucide="minus" class="h-4 w-4"></i>
          </button>
          <span class="font-bold text-lg px-2">${item.quantity}</span>
          <button onclick="window.app.updateCartQuantity(${item.productId}, ${item.quantity + 1})"
                  class="btn-sm bg-blush-200 hover:bg-blush-300 text-forest-900">
            <i data-lucide="plus" class="h-4 w-4"></i>
          </button>
          <button onclick="window.app.removeFromCart(${item.productId})"
                  class="btn-sm bg-coral-500 hover:bg-coral-600 text-white ml-2">
            <i data-lucide="trash-2" class="h-4 w-4"></i>
          </button>
        </div>
      </div>
    `).join('')

    return `
      <div class="space-y-4">
        ${itemsHtml}

        <div class="border-t border-blush-200 pt-4 mt-6">
          <div class="flex justify-between items-center text-xl font-bold">
            <span class="text-forest-900">Total:</span>
            <span class="text-coral-500">$${total.toFixed(2)}</span>
          </div>
        </div>

        <div class="flex gap-4 mt-6">
          <button onclick="window.cartModal.close()" class="btn-outline flex-1">
            Continuar Comprando
          </button>
          <button onclick="window.app.checkout()" class="btn-coral flex-1">
            <i data-lucide="credit-card" class="h-5 w-5 mr-2"></i>
            Pagar
          </button>
        </div>
      </div>
    `
  }
}