/**
 * CarouselManager Component
 * Visual drag-and-drop carousel position selector
 * Single Responsibility: Manage carousel slot selection and ordering
 */

import { createIcons } from '../lucide-icons.js'

const MAX_CAROUSEL_SIZE = 7
const API_BASE = '/api'

/**
 * CarouselManager class
 * Reusable component for create/edit product pages
 */
export class CarouselManager {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId)
    if (!this.container) {
      throw new Error(`Container #${containerId} not found`)
    }

    this.options = {
      currentProductId: options.currentProductId || null, // null when creating
      onCarouselChange: options.onCarouselChange || (() => {}), // Callback when carousel state changes
      initialFeatured: options.initialFeatured || false,
      initialCarouselOrder: options.initialCarouselOrder || null
    }

    this.state = {
      carouselSlots: Array(MAX_CAROUSEL_SIZE).fill(null), // Array of { productId, name, imageUrl, order } or null
      isFeatured: this.options.initialFeatured,
      selectedPosition: this.options.initialCarouselOrder || null,
      isDragging: false,
      dragFromIndex: null
    }

    this.init()
  }

  /**
   * Initialize component
   */
  async init() {
    await this.loadCarouselData()
    this.render()
    this.attachEventListeners()
  }

  /**
   * Load current carousel products from API
   */
  async loadCarouselData() {
    try {
      const response = await fetch(`${API_BASE}/products/carousel`, {
        headers: { Authorization: 'Bearer admin:1:admin' }
      })

      if (!response.ok) {
        throw new Error('Failed to load carousel products')
      }

      const result = await response.json()
      const products = result.data

      // Fill slots array
      this.state.carouselSlots = Array(MAX_CAROUSEL_SIZE).fill(null)

      products.forEach(product => {
        const index = product.carousel_order - 1
        if (index >= 0 && index < MAX_CAROUSEL_SIZE) {
          this.state.carouselSlots[index] = {
            productId: product.id,
            name: product.name,
            imageUrl: product.image_url_small,
            order: product.carousel_order
          }
        }
      })

      console.log(
        '✓ Loaded carousel data:',
        this.state.carouselSlots.filter(s => s !== null).length,
        'products'
      )
    } catch (error) {
      console.error('Error loading carousel data:', error)
      this.showError('Error al cargar carousel')
    }
  }

  /**
   * Render component HTML
   */
  render() {
    const isCarouselFull =
      this.state.carouselSlots.filter(s => s !== null).length >= MAX_CAROUSEL_SIZE

    this.container.innerHTML = `
      <div class="carousel-manager border border-gray-300 rounded-lg p-6 bg-white">
        <h3 class="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-4">
          <i data-lucide="image-play" class="h-5 w-5 text-pink-600"></i>
          <span>Gestión de Carousel (Máx ${MAX_CAROUSEL_SIZE} productos)</span>
        </h3>

        <!-- Carousel Slots Grid -->
        <div class="mb-6">
          <div id="carousel-slots-grid" class="grid grid-cols-7 gap-3 mb-4">
            ${this.renderSlots()}
          </div>
          <p class="text-xs text-gray-500">
            💡 Arrastra las imágenes para reordenar. Click en slot vacío para seleccionar posición.
          </p>
        </div>

        <!-- Featured Checkbox -->
        <div class="space-y-4">
          <label class="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              id="carousel-featured-checkbox"
              class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              ${this.state.isFeatured ? 'checked' : ''}
            />
            <span class="font-medium text-gray-700">Incluir en carousel destacado</span>
          </label>

          <!-- Position Selector (visible only when featured) -->
          <div id="carousel-position-controls" class="${this.state.isFeatured ? '' : 'hidden'} space-y-3 pl-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Posición en carousel:</label>
              <select
                id="carousel-position-select"
                class="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">-- Seleccionar posición --</option>
                ${this.renderPositionOptions()}
              </select>
            </div>

            ${isCarouselFull ? this.renderFullCarouselWarning() : ''}
          </div>
        </div>

        <!-- Toast container for this component -->
        <div id="carousel-toast-container" class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"></div>
      </div>
    `

    // Call createIcons after render (icons will be initialized by parent page)
    setTimeout(() => createIcons(), 0)
  }

  /**
   * Render carousel slots
   */
  renderSlots() {
    return this.state.carouselSlots.map((slot, index) => this.renderSlot(slot, index)).join('')
  }

  /**
   * Render individual slot
   */
  renderSlot(slot, index) {
    const position = index + 1
    const isCurrentProduct = slot && slot.productId === this.options.currentProductId
    const isSelected = this.state.selectedPosition === position
    const isEmpty = slot === null

    if (isEmpty) {
      return `
        <div
          class="carousel-slot-empty border-2 border-dashed border-gray-300 rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all ${isSelected ? 'ring-2 ring-pink-500 bg-pink-50' : ''}"
          data-position="${position}"
        >
          <i data-lucide="plus" class="h-6 w-6 text-gray-400"></i>
          <span class="text-xs text-gray-500 mt-1">${position}</span>
          ${isSelected ? '<span class="text-xs text-pink-600 font-bold mt-1">Seleccionado</span>' : ''}
        </div>
      `
    }

    return `
      <div
        class="carousel-slot-filled relative group border-2 border-gray-200 rounded-lg overflow-hidden aspect-square cursor-move ${isCurrentProduct ? 'ring-2 ring-blue-500' : ''} ${isSelected ? 'ring-2 ring-pink-500' : ''} bg-gray-100"
        data-position="${position}"
        data-product-id="${slot.productId}"
        draggable="true"
      >
        <img 
          src="${slot.imageUrl}" 
          alt="${slot.name}" 
          class="w-full h-full object-cover bg-gray-100" 
          onerror="this.src='/images/placeholder-flower.svg'; this.classList.add('bg-gray-100'); console.warn('Failed to load carousel image:', '${slot.imageUrl}')" />

        <!-- Overlay -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <div class="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center px-2">
            <p class="text-xs font-semibold truncate">${this.truncate(slot.name, 20)}</p>
          </div>
        </div>

        <!-- Position Badge -->
        <div class="absolute top-1 left-1 bg-gray-900 bg-opacity-75 text-white text-xs px-2 py-0.5 rounded-full">
          ${position}
        </div>

        ${isCurrentProduct ? '<div class="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">Actual</div>' : ''}
        ${isSelected ? '<div class="absolute bottom-1 right-1 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">Seleccionado</div>' : ''}
      </div>
    `
  }

  /**
   * Render position options for select dropdown
   */
  renderPositionOptions() {
    const options = []

    for (let i = 1; i <= MAX_CAROUSEL_SIZE; i++) {
      const slot = this.state.carouselSlots[i - 1]
      const isOccupied = slot !== null
      const isCurrentProduct = slot && slot.productId === this.options.currentProductId
      const isAvailable = !isOccupied || isCurrentProduct

      if (isAvailable) {
        options.push(
          `<option value="${i}" ${this.state.selectedPosition === i ? 'selected' : ''}>
            Posición ${i}${isCurrentProduct ? ' (posición actual)' : ''}
          </option>`
        )
      } else {
        options.push(
          `<option value="${i}" ${this.state.selectedPosition === i ? 'selected' : ''}>
            Posición ${i} - Ocupado por "${this.truncate(slot.name, 25)}"
          </option>`
        )
      }
    }

    return options.join('')
  }

  /**
   * Render warning when carousel is full
   */
  renderFullCarouselWarning() {
    const currentProductSlot = this.state.carouselSlots.find(
      s => s && s.productId === this.options.currentProductId
    )

    if (currentProductSlot) {
      return '' // Current product already in carousel, no warning needed
    }

    return `
      <div class="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <div class="flex items-start space-x-2">
          <i data-lucide="alert-triangle" class="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5"></i>
          <div>
            <p class="text-sm font-medium text-yellow-800">Carousel lleno (${MAX_CAROUSEL_SIZE}/${MAX_CAROUSEL_SIZE})</p>
            <p class="text-xs text-yellow-700 mt-1">
              Al guardar con una posición ocupada, el producto existente será reemplazado y dejará de estar destacado.
            </p>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Featured checkbox
    const checkbox = document.getElementById('carousel-featured-checkbox')
    if (checkbox) {
      checkbox.addEventListener('change', e => {
        this.state.isFeatured = e.target.checked
        this.togglePositionControls(e.target.checked)
        this.notifyChange()
      })
    }

    // Position select
    const select = document.getElementById('carousel-position-select')
    if (select) {
      select.addEventListener('change', e => {
        this.state.selectedPosition = parseInt(e.target.value) || null
        this.render() // Re-render to show selection
        this.notifyChange()
      })
    }

    // Empty slot clicks (select position)
    this.container.querySelectorAll('.carousel-slot-empty').forEach(slot => {
      slot.addEventListener('click', () => {
        if (!this.state.isFeatured) {
          this.showToast('Activa "Incluir en carousel" primero', 'info')
          return
        }

        const position = parseInt(slot.dataset.position)
        this.state.selectedPosition = position
        document.getElementById('carousel-position-select').value = position
        this.render()
        this.notifyChange()
      })
    })

    // Drag and drop on filled slots
    this.setupDragAndDrop()
  }

  /**
   * Setup drag-and-drop for reordering
   */
  setupDragAndDrop() {
    const slots = this.container.querySelectorAll('.carousel-slot-filled')

    slots.forEach(slot => {
      slot.addEventListener('dragstart', e => {
        this.state.isDragging = true
        this.state.dragFromIndex = parseInt(slot.dataset.position) - 1
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', this.state.dragFromIndex)
        slot.classList.add('opacity-50')
      })

      slot.addEventListener('dragend', e => {
        this.state.isDragging = false
        slot.classList.remove('opacity-50')
      })

      slot.addEventListener('dragover', e => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      })

      slot.addEventListener('drop', e => {
        e.preventDefault()
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
        const toIndex = parseInt(slot.dataset.position) - 1

        if (fromIndex !== toIndex) {
          this.reorderSlots(fromIndex, toIndex)
        }
      })
    })
  }

  /**
   * Reorder carousel slots (drag-and-drop)
   */
  reorderSlots(fromIndex, toIndex) {
    const slots = [...this.state.carouselSlots]
    const [movedSlot] = slots.splice(fromIndex, 1)
    slots.splice(toIndex, 0, movedSlot)

    // Update order property
    slots.forEach((slot, idx) => {
      if (slot) {
        slot.order = idx + 1
      }
    })

    this.state.carouselSlots = slots
    this.render()
    this.showToast(`Posición actualizada: ${fromIndex + 1} → ${toIndex + 1}`, 'success')
    this.notifyChange()
  }

  /**
   * Toggle position controls visibility
   */
  togglePositionControls(show) {
    const controls = document.getElementById('carousel-position-controls')
    if (controls) {
      if (show) {
        controls.classList.remove('hidden')
      } else {
        controls.classList.add('hidden')
        this.state.selectedPosition = null
      }
    }
  }

  /**
   * Get current carousel state (for form submission)
   * @returns {{ featured: boolean, carousel_order: number|null }}
   */
  getCarouselData() {
    return {
      featured: this.state.isFeatured,
      carousel_order: this.state.isFeatured ? this.state.selectedPosition : null
    }
  }

  /**
   * Validate carousel selection
   * @returns {{ valid: boolean, error: string|null }}
   */
  validate() {
    if (!this.state.isFeatured) {
      return { valid: true, error: null }
    }

    if (!this.state.selectedPosition) {
      return { valid: false, error: 'Debes seleccionar una posición en el carousel' }
    }

    if (this.state.selectedPosition < 1 || this.state.selectedPosition > MAX_CAROUSEL_SIZE) {
      return { valid: false, error: `Posición inválida. Debe estar entre 1-${MAX_CAROUSEL_SIZE}` }
    }

    return { valid: true, error: null }
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('carousel-toast-container')
    if (!container) {
      return
    }

    const toast = document.createElement('div')
    const bgColor =
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'

    toast.className = `pointer-events-auto px-4 py-2 rounded-lg shadow-lg text-white text-sm ${bgColor}`
    toast.textContent = message
    container.appendChild(toast)

    setTimeout(() => toast.remove(), 3000)
  }

  /**
   * Show error message
   */
  showError(message) {
    this.showToast(message, 'error')
  }

  /**
   * Notify parent of state change
   */
  notifyChange() {
    const data = this.getCarouselData()
    this.options.onCarouselChange(data)
  }

  /**
   * Truncate text
   */
  truncate(text, maxLength) {
    if (!text) {
      return ''
    }
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  /**
   * Destroy component
   */
  destroy() {
    this.container.innerHTML = ''
  }
}
