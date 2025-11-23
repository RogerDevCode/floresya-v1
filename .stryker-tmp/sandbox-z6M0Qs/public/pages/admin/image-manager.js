/**
 * Advanced Image Management for Product Editing
 * Handles drag-and-drop, image preview, and upload simulation
 */
// @ts-nocheck

class ProductImageManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    this.images = []
    this.setupEventListeners()
  }

  /**
   * Setup event listeners for image management
   */
  setupEventListeners() {
    if (!this.container) {
      throw new Error('Image manager container not found')
    }

    // Drag and drop functionality
    const uploadArea = this.container.querySelector('.upload-area')
    if (uploadArea) {
      ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, this.preventDefaults, false)
      })
      ;['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(
          eventName,
          () => {
            uploadArea.classList.add('dragover')
          },
          false
        )
      })
      ;['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(
          eventName,
          () => {
            uploadArea.classList.remove('dragover')
          },
          false
        )
      })

      uploadArea.addEventListener('drop', this.handleDrop.bind(this), false)
    }

    // File input change
    const fileInput = document.getElementById('image-upload')
    if (fileInput) {
      fileInput.addEventListener('change', this.handleFileSelect.bind(this))
    }
  }

  /**
   * Prevent default drag behaviors
   */
  preventDefaults(e) {
    e.preventDefault()
    e.stopPropagation()
  }

  /**
   * Handle file drop
   */
  handleDrop(e) {
    const dt = e.dataTransfer
    const files = dt.files
    this.handleFiles(files)
  }

  /**
   * Handle file selection
   */
  handleFileSelect(e) {
    const files = e.target.files
    this.handleFiles(files)
  }

  /**
   * Process selected files
   */
  handleFiles(files) {
    ;[...files].forEach(file => {
      if (this.isValidImageFile(file)) {
        this.addImage(file)
      } else {
        alert('Por favor selecciona solo archivos de imagen (JPG, PNG, WEBP)')
      }
    })
  }

  /**
   * Validate if file is an image
   */
  isValidImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml']
    return validTypes.includes(file.type)
  }

  /**
   * Add image to the list
   */
  addImage(file) {
    const reader = new FileReader()

    reader.onload = e => {
      const imageId = Date.now() + Math.floor(Math.random() * 1000) // Unique ID

      const imageObj = {
        id: imageId,
        file: file,
        previewUrl: e.target.result,
        size: file.size,
        type: file.type,
        name: file.name,
        isPrimary: this.images.length === 0 // First image is primary by default
      }

      this.images.push(imageObj)
      this.renderImage(imageObj)
    }

    reader.readAsDataURL(file)
  }

  /**
   * Render image in the UI
   */
  renderImage(image) {
    if (!this.container) {
      throw new Error('Image manager container not found')
    }

    const imgContainer = document.createElement('div')
    imgContainer.className = 'relative group image-container'
    imgContainer.dataset.imageId = image.id

    imgContainer.innerHTML = `
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 group-hover:border-pink-400 transition-colors">
        <img 
          src="${image.previewUrl}" 
          alt="Preview" 
          class="w-full h-32 object-contain rounded"
        />
        <div class="mt-2 text-xs text-gray-500 truncate">${image.name}</div>
        <div class="absolute top-2 right-2 flex space-x-1">
          <button 
            class="bg-white rounded-full p-1 shadow-md set-primary-btn ${image.isPrimary ? 'text-yellow-500' : 'text-gray-400'}"
            title="Establecer como imagen principal"
            data-image-id="${image.id}"
          >
            <i data-lucide="star" class="h-4 w-4"></i>
          </button>
          <button 
            class="bg-white rounded-full p-1 shadow-md delete-image-btn"
            title="Eliminar imagen"
            data-image-id="${image.id}"
          >
            <i data-lucide="x" class="h-4 w-4"></i>
          </button>
        </div>
        ${
          image.isPrimary
            ? '<div class="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">Principal</div>'
            : ''
        }
      </div>
    `

    // Add to the beginning of the images preview container
    const imagesPreview = document.getElementById('images-preview')
    if (imagesPreview) {
      // Insert as first child to maintain order
      if (imagesPreview.firstChild) {
        imagesPreview.insertBefore(imgContainer, imagesPreview.firstChild)
      } else {
        imagesPreview.appendChild(imgContainer)
      }
    }

    // Add event listeners
    imgContainer.querySelector('.delete-image-btn').addEventListener('click', e => {
      const imageId = parseInt(e.target.closest('.delete-image-btn').dataset.imageId)
      this.deleteImage(imageId)
    })

    imgContainer.querySelector('.set-primary-btn').addEventListener('click', e => {
      const imageId = parseInt(e.target.closest('.set-primary-btn').dataset.imageId)
      this.setAsPrimary(imageId)
    })

    // Reinitialize icons
  }

  /**
   * Delete image from the list
   */
  deleteImage(imageId) {
    this.images = this.images.filter(img => img.id !== imageId)
    const imgElement = document.querySelector(`.image-container[data-image-id="${imageId}"]`)
    if (imgElement) {
      imgElement.remove()
    }

    // If we deleted the primary image, set another as primary
    if (this.images.length > 0 && !this.hasPrimaryImage()) {
      this.images[0].isPrimary = true
      this.refreshImagesDisplay()
    }
  }

  /**
   * Set image as primary
   */
  setAsPrimary(imageId) {
    // Remove primary status from all images
    this.images.forEach(img => (img.isPrimary = false))

    // Set the selected image as primary
    const image = this.images.find(img => img.id === imageId)
    if (image) {
      image.isPrimary = true
    }

    this.refreshImagesDisplay()
  }

  /**
   * Check if there's a primary image
   */
  hasPrimaryImage() {
    return this.images.some(img => img.isPrimary)
  }

  /**
   * Refresh the display of all images
   */
  refreshImagesDisplay() {
    // Clear the container
    const imagesPreview = document.getElementById('images-preview')
    if (imagesPreview) {
      imagesPreview.innerHTML = ''
    }

    // Re-render all images
    this.images.forEach(image => {
      this.renderImage(image)
    })
  }

  /**
   * Get all images data
   */
  getImages() {
    return this.images
  }

  /**
   * Get primary image
   */
  getPrimaryImage() {
    return this.images.find(img => img.isPrimary)
  }
}

import { onDOMReady } from '../../js/shared/dom-ready.js'

// Initialize image manager when DOM is ready
onDOMReady(() => {
  // Initialize only if we're on the product edit page
  if (document.getElementById('images-preview')) {
    window.productImageManager = new ProductImageManager('images-preview')
  }
})
