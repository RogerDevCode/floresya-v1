/**
 * Create Product Page
 * Single Responsibility: CREATE new products only
 * KISS: No dual-mode logic, no conditional flows
 */

import { createIcons } from '../../js/'
import { CarouselManager } from '../../js/components/CarouselManager.js'
import { api } from '../../js/shared/api-client.js'
import { trackOccasionSelection, sortByPopularity } from '../../js/shared/occasion-popularity.js'

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

// BCV rate (loaded from settings)
let bcvRate = 0

/**
 * Ensure only one image is marked as primary
 */
function ensureSinglePrimaryImage() {
  // Count how many images are marked as primary
  const primaryImages = productImages.filter(img => img.isPrimary)

  // If no primary images, set the first one as primary
  if (primaryImages.length === 0 && productImages.length > 0) {
    productImages[0].isPrimary = true
  }
  // If more than one primary image, keep only the first one
  else if (primaryImages.length > 1) {
    // Mark all as non-primary except the first
    let firstPrimarySet = false
    for (let i = 0; i < productImages.length; i++) {
      if (productImages[i].isPrimary) {
        if (!firstPrimarySet) {
          firstPrimarySet = true // Keep first primary image
        } else {
          productImages[i].isPrimary = false // Remove primary flag from others
        }
      }
    }
  }
}

import { onDOMReady } from '../../js/shared/dom-ready.js'

// Initialize page
onDOMReady(async () => {
  console.log('✓ Create Product page loaded')

  // Initialize icons
  createIcons()

  // Load BCV rate from settings
  await loadBcvRate()

  // Initialize Carousel Manager
  carouselManager = new CarouselManager('carousel-manager-container', {
    currentProductId: null, // Creating new product
    onCarouselChange: data => {
      console.log('Carousel changed:', data)
    }
  })

  // Render initial empty image grid
  renderImageGrid()

  // Load occasions
  loadOccasions()

  // Setup auto-calculation of price_ves when price_usd changes
  const priceUsdInput = document.getElementById('product-price-usd')
  priceUsdInput.addEventListener('input', calculatePriceVes)

  // Form submit handler
  const form = document.getElementById('create-product-form')
  form.addEventListener('submit', handleCreateProduct)

  // Cancel button handler
  const cancelBtn = document.getElementById('cancel-btn')
  if (cancelBtn) {
    cancelBtn.addEventListener('click', handleCancel)
  }

  // Back button (arrow) handler
  const backBtn = document.getElementById('back-btn')
  if (backBtn) {
    backBtn.addEventListener('click', handleCancel) // Same behavior as cancel
  }
})

/**
 * Load occasions and render checkboxes
 */
async function loadOccasions() {
  try {
    const result = await api.getAllOccasions()
    let occasions = result.data || []

    // Filter only active occasions
    occasions = occasions.filter(occ => occ.is_active)

    // Sort by popularity (most popular first)
    occasions = sortByPopularity(occasions)

    const container = document.getElementById('occasions-container')
    if (!container) {
      return
    }

    // Render checkboxes
    container.innerHTML = occasions
      .map(
        occasion => `
      <label class="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-pink-50 cursor-pointer transition-colors">
        <input 
          type="checkbox" 
          name="occasions" 
          value="${occasion.id}"
          data-occasion-name="${occasion.name}"
          class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded occasion-checkbox"
        />
        <i data-lucide="${occasion.icon || 'heart'}" class="h-4 w-4 text-pink-600"></i>
        <span class="text-sm text-gray-700">${occasion.name}</span>
      </label>
    `
      )
      .join('')

    // Add event listeners for tracking
    container.querySelectorAll('.occasion-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', e => {
        if (e.target.checked) {
          const occasionId = parseInt(e.target.value)
          trackOccasionSelection(occasionId)
          console.log(
            `✓ Tracked occasion selection: ${e.target.dataset.occasionName} (ID: ${occasionId})`
          )
        }
      })
    })

    // Re-create icons
    createIcons()

    console.log(`✓ Loaded ${occasions.length} occasions (sorted by popularity)`)
  } catch (error) {
    console.error('Error loading occasions:', error)
    toast.error('Error al cargar ocasiones')
  }
}

/**
 * Get selected occasion IDs
 */
function getSelectedOccasions() {
  const checkboxes = document.querySelectorAll('input[name="occasions"]:checked')
  return Array.from(checkboxes).map(cb => parseInt(cb.value))
}

/**
 * Get default form values
 */
function getDefaultFormValues() {
  return {
    name: '',
    description: '',
    sku: '',
    price_usd: '',
    stock: '3', // Default value in HTML
    images: [],
    occasions: []
  }
}

/**
 * Get current form values
 */
function getCurrentFormValues() {
  return {
    name: document.getElementById('product-name')?.value.trim() || '',
    description: document.getElementById('product-description')?.value.trim() || '',
    sku: document.getElementById('product-sku')?.value.trim() || '',
    price_usd: document.getElementById('product-price-usd')?.value || '',
    stock: document.getElementById('product-stock')?.value || '',
    images: [...productImages], // Copy of images array
    occasions: getSelectedOccasions()
  }
}

/**
 * Check if form has changes from default values
 */
function hasFormChanges() {
  const defaultValues = getDefaultFormValues()
  const currentValues = getCurrentFormValues()

  // Compare each field
  if (currentValues.name !== defaultValues.name) {
    return true
  }
  if (currentValues.description !== defaultValues.description) {
    return true
  }
  if (currentValues.sku !== defaultValues.sku) {
    return true
  }
  if (currentValues.price_usd !== defaultValues.price_usd) {
    return true
  }
  if (currentValues.stock !== defaultValues.stock) {
    return true
  }
  if (currentValues.images.length > 0) {
    return true
  } // Any images uploaded
  if (currentValues.occasions.length > 0) {
    return true
  } // Any occasions selected

  return false
}

/**
 * Handle cancel button click
 */
function handleCancel(event) {
  event.preventDefault()

  // Check if form has changes
  if (hasFormChanges()) {
    // Show confirmation dialog
    const confirmed = confirm(
      '¿Descartar cambios?\n\nHas realizado cambios en el formulario. Si sales ahora, los cambios se perderán.'
    )

    if (!confirmed) {
      // User chose to stay
      return
    }
  }

  // Navigate back to products (respects pagination and previous location)
  navigateBackToProducts()
}

/**
 * Navigate back to products panel (respects pagination and previous location)
 */
function navigateBackToProducts() {
  // Check if we have a stored return URL (set by dashboard when navigating to create)
  const returnUrl = sessionStorage.getItem('editProductReturnUrl')

  if (returnUrl) {
    // Clear the stored URL
    sessionStorage.removeItem('editProductReturnUrl')
    // Navigate to the stored URL
    window.location.href = returnUrl
    return
  }

  // Fallback: Use document.referrer if it's from dashboard
  if (document.referrer && document.referrer.includes('dashboard.html')) {
    window.location.href = document.referrer
    return
  }

  // Final fallback: Go to products panel
  window.location.href = './dashboard.html#products'
}

/**
 * Load BCV rate from settings
 */
async function loadBcvRate() {
  try {
    const result = await api.getValue('bcv_usd_rate')
    bcvRate = parseFloat(result.data) || 36.5
    console.log(`✓ BCV rate loaded: ${bcvRate}`)
  } catch (error) {
    console.error('Error loading BCV rate:', error)
    console.warn('BCV rate not found, using default 36.5')
    bcvRate = 36.5
  }
}

/**
 * Calculate price_ves based on price_usd and BCV rate
 */
function calculatePriceVes() {
  const priceUsd = parseFloat(document.getElementById('product-price-usd').value) || 0
  const priceVes = priceUsd * bcvRate

  document.getElementById('product-price-ves').value = priceVes > 0 ? priceVes.toFixed(2) : ''
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

  // Create image element with error handling
  const imgElement = document.createElement('img')
  imgElement.src = image.preview
  imgElement.alt = `Product image ${index + 1}`
  imgElement.className = 'w-full h-full object-cover'

  // Handle image loading errors
  imgElement.onerror = () => {
    console.error(`Failed to load product image at index ${index}:`, image.preview)
    imgElement.src = '../../images/placeholder-flower.svg'
    imgElement.classList.add('bg-gray-100', 'p-4')
  }

  slot.appendChild(imgElement)

  // Add overlay and controls
  const overlay = document.createElement('div')
  overlay.className =
    'absolute inset-0 flex items-center justify-center space-x-2 transition-opacity'
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)' // Set semi-transparent black only on hover
  overlay.style.opacity = '0'

  const removeBtn = document.createElement('button')
  removeBtn.type = 'button'
  removeBtn.className =
    'remove-image-btn transition-all bg-red-500 hover:bg-red-600 text-white p-2 rounded-full z-10'
  removeBtn.dataset.index = index
  removeBtn.innerHTML = '<i data-lucide="trash-2" class="h-4 w-4"></i>'

  const primaryBtn = document.createElement('button')
  primaryBtn.type = 'button'
  primaryBtn.className = `set-primary-btn transition-all bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full z-10 ${image.isPrimary ? 'ring-2 ring-white' : ''}`
  primaryBtn.dataset.index = index
  primaryBtn.innerHTML = `<i data-lucide="star" class="h-4 w-4 ${image.isPrimary ? 'fill-current' : ''}"></i>`

  overlay.appendChild(removeBtn)
  overlay.appendChild(primaryBtn)

  // Make overlay transparent by default, visible on hover
  slot.addEventListener('mouseenter', () => {
    overlay.style.opacity = '1'
  })
  slot.addEventListener('mouseleave', () => {
    overlay.style.opacity = '0'
  })

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
function createEmptySlot(_currentCount) {
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
        isPrimary: false // Initially not primary, will be set by ensureSinglePrimaryImage
      })

      // Ensure only one image is primary
      ensureSinglePrimaryImage()

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
  // Set the selected image as primary and all others as non-primary
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

  // After reordering, make sure we still have only one primary image
  ensureSinglePrimaryImage()

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

  // Validate: if there are images, ensure one is marked as primary
  if (productImages.length > 0) {
    const hasPrimary = productImages.some(img => img.isPrimary)
    if (!hasPrimary) {
      toast.error('Debes seleccionar una imagen como principal')
      return
    }
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
    const result = await api.createProducts(productData)
    console.log('✓ Product created:', result)

    const productId = result.data.id

    // 2. Upload images
    await uploadProductImages(productId)

    // 3. Link occasions
    const occasions = getSelectedOccasions()
    if (occasions.length > 0) {
      await linkProductOccasions(productId, occasions)
    }

    // Success - restore button
    submitBtn.disabled = false
    submitBtn.innerHTML = '<i data-lucide="save" class="h-5 w-5"></i> <span>Crear Producto</span>'
    createIcons()

    toast.success('Producto creado exitosamente')

    // Reset form and stay on page
    resetForm()
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

      const result = await api.uploadProductImages(productId, formData)

      if (!result.success) {
        throw new Error(`Error uploading image ${index + 1}: ${result.message}`)
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

/**
 * Link product with occasions using the bulk endpoint
 */
async function linkProductOccasions(productId, occasionIds) {
  try {
    // Use the createProductsWithOccasions endpoint to link occasions
    // This is a workaround since there's no direct link endpoint
    const result = await api.createProductsWithOccasions({
      product: { id: productId },
      occasionIds: occasionIds
    })

    if (!result.success) {
      throw new Error(`Error linking occasions: ${result.message}`)
    }

    console.log(`✓ All ${occasionIds.length} occasions linked`)
  } catch (error) {
    console.error('linkProductOccasions failed:', error)
    throw error
  }
}

/**
 * Reset form after successful product creation
 */
function resetForm() {
  // Clear form fields
  document.getElementById('product-name').value = ''
  document.getElementById('product-description').value = ''
  document.getElementById('product-sku').value = ''
  document.getElementById('product-price-usd').value = ''
  document.getElementById('product-price-ves').value = ''
  document.getElementById('product-stock').value = '3'

  // Clear occasions checkboxes
  document.querySelectorAll('input[name="occasions"]:checked').forEach(cb => {
    cb.checked = false
  })

  // Clear images
  productImages.length = 0
  renderImageGrid()

  // Reset carousel manager
  carouselManager.destroy()
  carouselManager = new CarouselManager('carousel-manager-container', {
    currentProductId: null,
    onCarouselChange: data => {
      console.log('Carousel changed:', data)
    }
  })

  createIcons()
  console.log('✓ Form reset, ready for new product')
}
