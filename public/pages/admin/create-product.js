/**
 * Create Product Page
 * Single Responsibility: CREATE new products only
 * KISS: No dual-mode logic, no conditional flows
 */

import { createIcons } from '../../js/lucide-icons.js'
import { CarouselManager } from '../../js/components/CarouselManager.js'

// Toast notification utility
const toast = {
  success: message => showToast(message, 'success'),
  error: message => showToast(message, 'error'),
  info: message => showToast(message, 'info')
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container')
  const toast = document.createElement('div')
  toast.className = `pointer-events-auto px-6 py-3 rounded-lg shadow-lg text-white ${
    type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  }`
  toast.textContent = message
  container.appendChild(toast)
  setTimeout(() => toast.remove(), 3000)
}

// Product images state (max 5 images)
const productImages = []

// Carousel Manager instance
let carouselManager = null

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  console.log('✓ Create Product page loaded')

  // Initialize icons
  createIcons()

  // Initialize Carousel Manager
  carouselManager = new CarouselManager('carousel-manager-container', {
    currentProductId: null, // Creating new product
    onCarouselChange: data => {
      console.log('Carousel changed:', data)
    }
  })

  // Render initial empty image grid
  renderImageGrid()

  // Form submit handler
  const form = document.getElementById('create-product-form')
  form.addEventListener('submit', handleCreateProduct)
})

/**
 * Render image grid (5 slots)
 */
function renderImageGrid() {
  const grid = document.getElementById('product-images-grid')
  grid.innerHTML = ''

  // Render existing images
  productImages.forEach((image, idx) => {
    const slot = createImageSlot(image, idx)
    grid.appendChild(slot)
  })

  // Render empty slots (up to 5 total)
  const emptySlots = 5 - productImages.length
  for (let i = 0; i < emptySlots; i++) {
    const slot = createEmptySlot(productImages.length)
    grid.appendChild(slot)
  }

  createIcons()
}

/**
 * Create image slot with preview
 */
function createImageSlot(image, index) {
  const slot = document.createElement('div')
  slot.className =
    'relative group border-2 border-gray-200 rounded-lg overflow-hidden aspect-square bg-gray-100'
  slot.draggable = true
  slot.dataset.index = index

  // Create image element with error handling
  const imgElement = document.createElement('img')
  imgElement.src = image.preview
  imgElement.alt = `Product image ${index + 1}`
  imgElement.className = 'w-full h-full object-cover'

  // Handle image loading errors
  imgElement.onerror = () => {
    // Replace with placeholder if image fails to load
    imgElement.src = '../../images/placeholder-flower.svg'
    imgElement.classList.add('bg-gray-100')
    console.warn(`Failed to load image: ${image.preview}`)
  }

  slot.appendChild(imgElement)

  // Add overlay and controls
  const overlay = document.createElement('div')
  overlay.className =
    'absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center space-x-2'

  const removeBtn = document.createElement('button')
  removeBtn.type = 'button'
  removeBtn.className =
    'remove-image-btn opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white p-2 rounded-full'
  removeBtn.dataset.index = index
  removeBtn.innerHTML = '<i data-lucide="trash-2" class="h-4 w-4"></i>'

  const primaryBtn = document.createElement('button')
  primaryBtn.type = 'button'
  primaryBtn.className = `set-primary-btn opacity-0 group-hover:opacity-100 transition-opacity bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full ${image.isPrimary ? 'ring-2 ring-white' : ''}`
  primaryBtn.dataset.index = index
  primaryBtn.innerHTML = `<i data-lucide="star" class="h-4 w-4 ${image.isPrimary ? 'fill-current' : ''}"></i>`

  overlay.appendChild(removeBtn)
  overlay.appendChild(primaryBtn)
  slot.appendChild(overlay)

  // Add primary badge if needed
  if (image.isPrimary) {
    const primaryBadge = document.createElement('div')
    primaryBadge.className =
      'absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full'
    primaryBadge.textContent = 'Principal'
    slot.appendChild(primaryBadge)
  }

  // Event listeners
  removeBtn.addEventListener('click', () => removeImage(index))
  primaryBtn.addEventListener('click', () => setPrimaryImage(index))

  // Drag-and-drop reordering
  slot.addEventListener('dragstart', e => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index)
  })

  slot.addEventListener('dragover', e => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  })

  slot.addEventListener('drop', e => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'))
    const toIndex = index
    reorderImages(fromIndex, toIndex)
  })

  return slot
}

/**
 * Create empty slot (upload trigger)
 */
function createEmptySlot(currentCount) {
  const slot = document.createElement('div')
  slot.className =
    'border-2 border-dashed border-gray-300 rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all'

  slot.innerHTML = `
    <div class="text-center text-gray-400">
      <i data-lucide="plus" class="h-8 w-8 mx-auto mb-2"></i>
      <p class="text-xs">Agregar imagen</p>
    </div>
  `

  slot.addEventListener('click', () => {
    if (productImages.length >= 5) {
      toast.error('Máximo 5 imágenes permitidas')
      return
    }
    document.getElementById('image-upload-input').click()
  })

  return slot
}

/**
 * Handle image upload
 */
document.addEventListener('change', e => {
  if (e.target.id === 'image-upload-input') {
    const file = e.target.files[0]
    if (!file) {
      return
    }

    // Validate file size (4MB max for Vercel)
    const maxSize = 4 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('La imagen no debe superar 4MB')
      e.target.value = ''
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten archivos de imagen')
      e.target.value = ''
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = event => {
      const imageIndex = productImages.length + 1
      productImages.push({
        index: imageIndex,
        file: file,
        preview: event.target.result,
        isPrimary: productImages.length === 0 // First image is primary
      })
      renderImageGrid()
      toast.success('Imagen agregada')
    }
    reader.readAsDataURL(file)

    // Reset input
    e.target.value = ''
  }
})

/**
 * Remove image
 */
function removeImage(index) {
  if (!confirm('¿Eliminar esta imagen?')) {
    return
  }

  productImages.splice(index, 1)

  // Reassign indexes
  productImages.forEach((img, idx) => {
    img.index = idx + 1
  })

  // If removed primary, set first image as primary
  if (productImages.length > 0 && !productImages.some(img => img.isPrimary)) {
    productImages[0].isPrimary = true
  }

  renderImageGrid()
  toast.success('Imagen eliminada')
}

/**
 * Set primary image
 */
function setPrimaryImage(index) {
  productImages.forEach((img, idx) => {
    img.isPrimary = idx === index
  })
  renderImageGrid()
  toast.success('Imagen principal actualizada')
}

/**
 * Reorder images (drag-and-drop)
 */
function reorderImages(fromIndex, toIndex) {
  if (fromIndex === toIndex) {
    return
  }

  const [movedImage] = productImages.splice(fromIndex, 1)
  productImages.splice(toIndex, 0, movedImage)

  // Reassign indexes
  productImages.forEach((img, idx) => {
    img.index = idx + 1
  })

  renderImageGrid()
}

/**
 * Handle create product form submission
 */
async function handleCreateProduct(event) {
  event.preventDefault()

  // Validate: must have at least 1 image
  if (productImages.length === 0) {
    toast.error('Debes agregar al menos 1 imagen al producto')
    return
  }

  // Validate: max 5 images
  if (productImages.length > 5) {
    toast.error('Un producto no puede tener más de 5 imágenes')
    return
  }

  // Validate carousel selection
  const carouselValidation = carouselManager.validate()
  if (!carouselValidation.valid) {
    toast.error(carouselValidation.error)
    return
  }

  try {
    const form = event.target
    const formData = new FormData(form)

    // Get carousel data from CarouselManager
    const carouselData = carouselManager.getCarouselData()

    // Build product data
    const productData = {
      name: formData.get('name'),
      description: formData.get('description') || null,
      sku: formData.get('sku') || null,
      price_usd: parseFloat(formData.get('price_usd')),
      price_ves: formData.get('price_ves') ? parseFloat(formData.get('price_ves')) : null,
      stock: parseInt(formData.get('stock')) || 0,
      featured: carouselData.featured,
      carousel_order: carouselData.carousel_order,
      active: true
    }

    console.log('Creating product:', productData)

    // Show loading state
    const submitBtn = document.getElementById('create-product-btn')
    submitBtn.disabled = true
    submitBtn.innerHTML =
      '<i data-lucide="loader" class="h-5 w-5 animate-spin"></i> <span>Creando...</span>'
    createIcons()

    // 1. Create product
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin:1:admin'
      },
      body: JSON.stringify(productData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al crear producto')
    }

    const result = await response.json()
    console.log('✓ Product created:', result)

    const productId = result.data.id

    // 2. Upload images
    await uploadProductImages(productId)

    // Success
    toast.success('Producto creado exitosamente')

    // Redirect to dashboard after 1 second
    setTimeout(() => {
      window.location.href = './dashboard.html'
    }, 1000)
  } catch (error) {
    console.error('Error creating product:', error)
    toast.error('Error al crear el producto: ' + error.message)

    // Restore button
    const submitBtn = document.getElementById('create-product-btn')
    submitBtn.disabled = false
    submitBtn.innerHTML = '<i data-lucide="save" class="h-5 w-5"></i> <span>Crear Producto</span>'
    createIcons()
  }
}

/**
 * Upload product images (all images are new)
 */
async function uploadProductImages(productId) {
  try {
    const uploadPromises = productImages.map(async (image, index) => {
      const formData = new FormData()
      formData.append('image', image.file)
      formData.append('image_index', image.index)
      formData.append('is_primary', image.isPrimary)

      const response = await fetch(`/api/products/${productId}/images`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin:1:admin'
        },
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Error uploading image ${index + 1}: ${error.message}`)
      }

      console.log(`✓ Image ${index + 1} uploaded`)
    })

    await Promise.all(uploadPromises)
    console.log(`✓ All ${productImages.length} images uploaded`)
  } catch (error) {
    console.error('Error uploading images:', error)
    throw error
  }
}
