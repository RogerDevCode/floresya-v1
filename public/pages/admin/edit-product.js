/**
 * Edit Product Page
 * Single Responsibility: EDIT existing products only
 * KISS: No dual-mode logic, no conditional flows
 */

// Static SVG icons used - no runtime initialization needed
import { CarouselManager } from '../../js/components/CarouselManager.js'
import { api } from '../../js/shared/api-client.js'
import { trackOccasionSelection, sortByPopularity } from '../../js/shared/occasion-popularity.js'
import { initThemeManager } from '../../js/themes/themeManager.js'
import { loadingMessages } from '../../js/components/loadingMessages.js'

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

// BCV rate (loaded from settings)
let bcvRate = 0

// Original product values (for change detection)
let originalValues = null

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
  console.log('✓ Edit Product page loaded')

  // Initialize theme manager
  initThemeManager()

  // Static SVG icons used - no runtime initialization needed

  // 🌸 Easter Egg: Inicializar mensajes florales de carga
  loadingMessages.applyToId('loading-state')

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

  // Load BCV rate from settings
  await loadBcvRate()

  // Load product data
  await loadProduct()

  // Load occasions
  await loadOccasions()

  // Setup auto-calculation of price_ves when price_usd changes
  const priceUsdInput = document.getElementById('product-price-usd')
  priceUsdInput.addEventListener('input', calculatePriceVes)

  // Form submit handler
  const form = document.getElementById('edit-product-form')
  form.addEventListener('submit', handleUpdateProduct)

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
 * Capture original form values after loading product
 */
function captureOriginalValues() {
  originalValues = {
    name: document.getElementById('product-name')?.value.trim() || '',
    description: document.getElementById('product-description')?.value.trim() || '',
    sku: document.getElementById('product-sku')?.value.trim() || '',
    price_usd: document.getElementById('product-price-usd')?.value || '',
    stock: document.getElementById('product-stock')?.value || '',
    images: productImages.map(img => ({
      url: img.url,
      isPrimary: img.isPrimary
    }))
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
    images: productImages.map(img => ({
      url: img.url,
      isPrimary: img.isPrimary
    }))
  }
}

/**
 * Check if form has changes from original values
 */
function hasFormChanges() {
  if (!originalValues) {
    return false
  }

  const currentValues = getCurrentFormValues()

  // Compare each field
  if (currentValues.name !== originalValues.name) {
    return true
  }
  if (currentValues.description !== originalValues.description) {
    return true
  }
  if (currentValues.sku !== originalValues.sku) {
    return true
  }
  if (currentValues.price_usd !== originalValues.price_usd) {
    return true
  }
  if (currentValues.stock !== originalValues.stock) {
    return true
  }

  // Compare images count
  if (currentValues.images.length !== originalValues.images.length) {
    return true
  }

  // Compare images content (URLs and primary status)
  for (let i = 0; i < currentValues.images.length; i++) {
    if (currentValues.images[i].url !== originalValues.images[i].url) {
      return true
    }
    if (currentValues.images[i].isPrimary !== originalValues.images[i].isPrimary) {
      return true
    }
  }

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
  // Check if we have a stored return URL (set by dashboard when navigating to edit)
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
 * Load product data
 */
async function loadProduct() {
  try {
    // Set auth token for admin access

    const result = await api.getProductsById(productId)
    const product = result.data

    console.log('✓ Product loaded:', product)

    // Populate form fields
    document.getElementById('product-name').value = product.name || ''
    document.getElementById('product-description').value = product.description || ''
    document.getElementById('product-sku').value = product.sku || ''
    document.getElementById('product-price-usd').value = product.price_usd || ''
    document.getElementById('product-stock').value = product.stock || 0

    // Calculate price_ves from price_usd
    calculatePriceVes()

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

    // Capture original values for change detection
    captureOriginalValues()

    // Show form, hide loading
    document.getElementById('loading-state').classList.add('hidden')
    document.getElementById('edit-product-form').classList.remove('hidden')

    // Static SVG icons used - no runtime initialization needed
  } catch (error) {
    console.error('Error loading product:', error)
    toast.error('Error al cargar producto: ' + error.message)

    setTimeout(() => {
      window.location.href = './dashboard.html'
    }, 2000)
  }
}

/**
 * Load occasions and pre-select the ones linked to this product
 */
async function loadOccasions() {
  try {
    // 1. Get all active occasions
    const occasionsResult = await api.getAllOccasions()
    let occasions = occasionsResult.data || []
    occasions = occasions.filter(occ => occ.is_active)

    // 2. Get product with occasions to find linked ones
    const productResult = await api.getProductsWithOccasions({ productId: productId })
    const linkedOccasionIds =
      productResult.data && productResult.data.occasions
        ? productResult.data.occasions.map(occ => occ.id)
        : []

    // 3. Sort by popularity (most popular first)
    occasions = sortByPopularity(occasions)

    const container = document.getElementById('occasions-container')
    if (!container) {
      return
    }

    // 4. Render checkboxes with pre-selected ones
    container.innerHTML = occasions
      .map(
        occasion => `
      <label class="flex items-center space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-pink-50 cursor-pointer transition-colors">
        <input
          type="checkbox"
          name="occasions"
          value="${occasion.id}"
          data-occasion-name="${occasion.name}"
          ${linkedOccasionIds.includes(occasion.id) ? 'checked' : ''}
          class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded occasion-checkbox"
        />
        <i data-lucide="${occasion.icon || 'heart'}" class="h-4 w-4 text-pink-600"></i>
        <span class="text-sm text-gray-700">${occasion.name}</span>
      </label>
    `
      )
      .join('')

    // 5. Add event listeners for tracking (only when checking NEW occasions)
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

    // Static SVG icons used - no runtime initialization needed

    console.log(`✓ Loaded ${occasions.length} occasions (${linkedOccasionIds.length} pre-selected)`)
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
 * Load existing product images
 */
async function loadExistingImages() {
  try {
    const result = await api.getProductImages(productId)
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

      // Try to find small first (better detail for preview), then medium, then thumb
      let displayImage = imageGroup.find(img => img.size === 'small')
      if (!displayImage) {
        displayImage = imageGroup.find(img => img.size === 'medium')
      }
      if (!displayImage) {
        displayImage = imageGroup.find(img => img.size === 'thumb')
      }

      if (displayImage) {
        productImages.push({
          index: parseInt(index),
          preview: displayImage.url,
          isPrimary: displayImage.is_primary,
          existingImageIndex: parseInt(index), // Track existing index for deletion
          file: null // No file for existing images
        })
      } else {
        console.warn(`⚠️ No small, medium, or thumb image found for index ${index}`)
      }
    })

    // Ensure there's a primary image if there are any images
    if (productImages.length > 0) {
      ensureSinglePrimaryImage()
    }

    console.log(`✓ Loaded ${productImages.length} existing images`)

    // Ensure only one image is primary after loading existing images
    ensureSinglePrimaryImage()

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
    console.error(`Failed to load product image at index ${index}:`, image.preview)
    imgElement.src = '../../images/placeholder-flower.svg'
    imgElement.classList.add('bg-gray-100', 'p-4')
  }

  slot.appendChild(imgElement)

  // Add overlay and controls
  const overlay = document.createElement('div')
  overlay.className =
    'absolute inset-0 bg-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2'
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)' // Set semi-transparent black only on hover

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
  overlay.style.opacity = '0'
  overlay.addEventListener('mouseenter', () => {
    overlay.style.opacity = '1'
  })
  overlay.addEventListener('mouseleave', () => {
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
        isPrimary: false, // Initially not primary, will be set by ensureSinglePrimaryImage
        existingImageIndex: null // New image
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
async function removeImage(index) {
  if (!confirm('¿Eliminar esta imagen?')) {
    return
  }

  const image = productImages[index]

  // If existing image, delete from server
  if (image.existingImageIndex !== null && image.existingImageIndex !== undefined) {
    try {
      const result = await api.deleteProductImage(productId, image.existingImageIndex)

      if (!result.success) {
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

  // Ensure only one image is primary after removal
  ensureSinglePrimaryImage()

  renderImageGrid()
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
      carousel_order: carouselData.carousel_order
    }

    console.log('Updating product:', productData)

    // Show loading state
    const submitBtn = document.getElementById('save-product-btn')
    submitBtn.disabled = true
    submitBtn.innerHTML =
      '<i data-lucide="loader" class="h-5 w-5 animate-spin"></i> <span>Guardando...</span>'
    // Static SVG icons used - no runtime initialization needed

    // 1. Update product
    const result = await api.updateProducts(productId, productData)
    console.log('✓ Product updated:', result)

    // 2. Upload NEW images only (images with file !== null)
    const newImages = productImages.filter(img => img.file !== null)
    if (newImages.length > 0) {
      await uploadProductImages(productId, newImages)
    }

    // 3. Update occasions (replace all - transactional approach)
    const selectedOccasions = getSelectedOccasions()
    await replaceProductOccasions(productId, selectedOccasions)

    // Success - restore button and stay on page
    submitBtn.disabled = false
    submitBtn.innerHTML = '<i data-lucide="save" class="h-5 w-5"></i> <span>Guardar Cambios</span>'
    // Static SVG icons used - no runtime initialization needed

    toast.success(
      'Producto actualizado exitosamente. Puedes hacer más cambios o cancelar para salir.'
    )

    // Reload product data to get fresh state (including new images and occasions)
    await loadProduct()
    await loadOccasions()
  } catch (error) {
    console.error('Error updating product:', error)
    toast.error('Error al actualizar producto: ' + error.message)

    // Restore button
    const submitBtn = document.getElementById('save-product-btn')
    submitBtn.disabled = false
    submitBtn.innerHTML = '<i data-lucide="save" class="h-5 w-5"></i> <span>Guardar Cambios</span>'
    // Static SVG icons used - no runtime initialization needed
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

      const result = await api.uploadProductImages(productId, formData)

      if (!result.success) {
        throw new Error(`Error uploading image ${index + 1}: ${result.message}`)
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

/**
 * Replace all product occasions (TRANSACTIONAL)
 * Uses available endpoint for updating product occasions
 */
async function replaceProductOccasions(productId, selectedOccasionIds) {
  try {
    console.log(`Replacing occasions for product ${productId}:`, selectedOccasionIds)

    // Use the createProductsWithOccasions endpoint to update occasions
    // This is a workaround since there's no direct replace endpoint
    const result = await api.createProductsWithOccasions({
      product: { id: productId },
      occasionIds: selectedOccasionIds
    })

    console.log(`✓ Occasions replaced successfully:`, result.data)
    return result
  } catch (error) {
    console.error('replaceProductOccasions failed:', error)
    throw new Error(`Error al actualizar ocasiones: ${error.message}`)
  }
}
