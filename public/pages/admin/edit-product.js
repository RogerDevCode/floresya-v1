/**
 * Edit Product Page
 * Single Responsibility: EDIT existing products only
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
let productImages = []
let productId = null
let carouselManager = null

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  console.log('✓ Edit Product page loaded')

  // Initialize icons
  createIcons()

  // Get product ID from URL
  const params = new URLSearchParams(window.location.search)
  productId = parseInt(params.get('id'))

  if (!productId || isNaN(productId)) {
    toast.error('ID de producto inválido')
    setTimeout(() => {
      window.location.href = './dashboard.html'
    }, 2000)
    return
  }

  // Load product data
  await loadProduct()

  // Form submit handler
  const form = document.getElementById('edit-product-form')
  form.addEventListener('submit', handleUpdateProduct)
})

/**
 * Load product data
 */
async function loadProduct() {
  try {
    const response = await fetch(`/api/products/${productId}`, {
      headers: { Authorization: 'Bearer admin:1:admin' }
    })

    if (!response.ok) {
      throw new Error('Producto no encontrado')
    }

    const result = await response.json()
    const product = result.data

    console.log('✓ Product loaded:', product)

    // Populate form fields
    document.getElementById('product-name').value = product.name || ''
    document.getElementById('product-description').value = product.description || ''
    document.getElementById('product-sku').value = product.sku || ''
    document.getElementById('product-price-usd').value = product.price_usd || ''
    document.getElementById('product-price-ves').value = product.price_ves || ''
    document.getElementById('product-stock').value = product.stock || 0

    // Initialize Carousel Manager with product data
    carouselManager = new CarouselManager('carousel-manager-container', {
      currentProductId: productId,
      initialFeatured: product.featured || false,
      initialCarouselOrder: product.carousel_order || null,
      onCarouselChange: data => {
        console.log('Carousel changed:', data)
      }
    })

    // Load existing images
    await loadExistingImages()

    // Show form, hide loading
    document.getElementById('loading-state').classList.add('hidden')
    document.getElementById('edit-product-form').classList.remove('hidden')

    createIcons()
  } catch (error) {
    console.error('Error loading product:', error)
    toast.error('Error al cargar producto: ' + error.message)

    setTimeout(() => {
      window.location.href = './dashboard.html'
    }, 2000)
  }
}

/**
 * Load existing product images
 */
async function loadExistingImages() {
  try {
    const response = await fetch(`/api/products/${productId}/images`, {
      headers: { Authorization: 'Bearer admin:1:admin' }
    })

    if (!response.ok) {
      console.warn('No images found for product')
      renderImageGrid()
      return
    }

    const result = await response.json()
    const images = result.data

    // Handle empty images array
    if (!images || !Array.isArray(images) || images.length === 0) {
      console.log('No images found for product')
      productImages = []
      renderImageGrid()
      return
    }

    // Group images by index
    const imagesByIndex = {}
    images.forEach(img => {
      if (!imagesByIndex[img.image_index]) {
        imagesByIndex[img.image_index] = []
      }
      imagesByIndex[img.image_index].push(img)
    })

    // Build productImages array
    productImages = []
    Object.keys(imagesByIndex).forEach(index => {
      const imageGroup = imagesByIndex[index]
      const mediumImage = imageGroup.find(img => img.size === 'medium')

      if (mediumImage) {
        productImages.push({
          index: parseInt(index),
          preview: mediumImage.url,
          isPrimary: mediumImage.is_primary,
          existingImageIndex: parseInt(index), // Track existing index for deletion
          file: null // No file for existing images
        })
      }
    })

    console.log(`✓ Loaded ${productImages.length} existing images`)
    renderImageGrid()
  } catch (error) {
    console.error('Error loading images:', error)
    toast.error('Error al cargar imágenes')
    renderImageGrid()
  }
}

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

  const isExisting = image.file === null

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

  // Add existing badge if needed
  if (isExisting) {
    const existingBadge = document.createElement('div')
    existingBadge.className =
      'absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full'
    existingBadge.textContent = 'Existente'
    slot.appendChild(existingBadge)
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
        isPrimary: productImages.length === 0, // First image is primary
        existingImageIndex: null // New image
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
async function removeImage(index) {
  if (!confirm('¿Eliminar esta imagen?')) {
    return
  }

  const image = productImages[index]

  // If existing image, delete from server
  if (image.existingImageIndex !== null && image.existingImageIndex !== undefined) {
    try {
      const response = await fetch(
        `/api/products/${productId}/images/${image.existingImageIndex}`,
        {
          method: 'DELETE',
          headers: { Authorization: 'Bearer admin:1:admin' }
        }
      )

      if (!response.ok) {
        throw new Error('Error al eliminar imagen del servidor')
      }

      toast.success('Imagen eliminada del servidor')
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('Error al eliminar imagen: ' + error.message)
      return
    }
  }

  // Remove from local state
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
 * Handle update product form submission
 */
async function handleUpdateProduct(event) {
  event.preventDefault()

  // Validate: max 5 images (allowing 0 images for products without images)
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
      carousel_order: carouselData.carousel_order
    }

    console.log('Updating product:', productData)

    // Show loading state
    const submitBtn = document.getElementById('save-product-btn')
    submitBtn.disabled = true
    submitBtn.innerHTML =
      '<i data-lucide="loader" class="h-5 w-5 animate-spin"></i> <span>Guardando...</span>'
    createIcons()

    // 1. Update product
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin:1:admin'
      },
      body: JSON.stringify(productData)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Error al actualizar producto')
    }

    const result = await response.json()
    console.log('✓ Product updated:', result)

    // 2. Upload NEW images only (images with file !== null)
    const newImages = productImages.filter(img => img.file !== null)
    if (newImages.length > 0) {
      await uploadProductImages(productId, newImages)
    }

    // Success - restore button
    submitBtn.disabled = false
    submitBtn.innerHTML = '<i data-lucide="save" class="h-5 w-5"></i> <span>Guardar Cambios</span>'
    createIcons()

    toast.success('Producto actualizado exitosamente')

    // Redirect to dashboard after 1 second
    setTimeout(() => {
      window.location.href = './dashboard.html'
    }, 1000)
  } catch (error) {
    console.error('Error updating product:', error)
    toast.error('Error al actualizar producto: ' + error.message)

    // Restore button
    const submitBtn = document.getElementById('save-product-btn')
    submitBtn.disabled = false
    submitBtn.innerHTML = '<i data-lucide="save" class="h-5 w-5"></i> <span>Guardar Cambios</span>'
    createIcons()
  }
}

/**
 * Upload new product images (only images with file !== null)
 */
async function uploadProductImages(productId, newImages) {
  try {
    const uploadPromises = newImages.map(async (image, index) => {
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
    console.log(`✓ All ${newImages.length} new images uploaded`)
  } catch (error) {
    console.error('Error uploading images:', error)
    throw error
  }
}
