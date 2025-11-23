/**
 * Occasions Management Module
 * Handles CRUD operations for occasions with soft delete functionality
 */
// @ts-nocheck

import { api } from '../../js/shared/api-client.js'
import { generateSlug, getRandomIcon, getRandomColor } from '../../js/shared/occasion-helpers.js'
import { sortByPopularity } from '../../js/shared/occasion-popularity.js'
import { initThemeManager } from '../../js/themes/themeManager.js'

// Global state
let currentFilter = 'all' // 'all', 'active', 'inactive'
let selectedOccasion = null
let occasions = []
let originalFormValues = {} // For change detection

/**
 * Fetch occasions from API
 */
async function fetchOccasions() {
  try {
    const result = await api.getAllOccasions()
    occasions = result.data || []
    return occasions
  } catch (error) {
    console.error('fetchOccasions failed:', error)
    alert('Error al cargar ocasiones: ' + error.message)
    throw error
  }
}

// OLD Mock data (kept for reference, will be replaced by API)

/**
 * Initialize occasions management
 */
function init() {
  // Initialize Lucide icons

  // Setup event listeners
  setupEventListeners()

  // Load initial data
  loadOccasions()
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', e => {
      // Update active state
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove(
          'active',
          'bg-pink-100',
          'text-pink-800',
          'bg-green-100',
          'text-green-800',
          'bg-red-100',
          'text-red-800'
        )
        btn.classList.add('bg-pink-100', 'text-pink-800')
      })

      e.target.classList.remove('bg-pink-100', 'text-pink-800')
      if (e.target.id === 'filter-active') {
        e.target.classList.add('bg-green-100', 'text-green-800')
      } else if (e.target.id === 'filter-inactive') {
        e.target.classList.add('bg-red-100', 'text-red-800')
      } else {
        e.target.classList.add('bg-pink-100', 'text-pink-800')
      }

      currentFilter = e.target.getAttribute('data-filter')
      loadOccasions()
    })
  })

  // New occasion button
  document.getElementById('new-occasion-btn').addEventListener('click', () => {
    resetForm()
    document.getElementById('edition-title').textContent = 'Nueva Ocasión'
    document.getElementById('delete-occasion-btn').classList.add('hidden')
  })

  // Save occasion button
  document.getElementById('save-occasion-btn').addEventListener('click', saveOccasion)

  // Delete occasion button
  document.getElementById('delete-occasion-btn').addEventListener('click', deleteOccasion)

  // Cancel button with change detection
  document.getElementById('cancel-occasion-btn').addEventListener('click', handleCancel)

  // Back arrow with change detection
  const backArrow = document.getElementById('back-arrow')
  if (backArrow) {
    backArrow.addEventListener('click', () => {
      if (hasFormChanges()) {
        const confirmed = confirm(
          '¿Descartar cambios?\n\nHas realizado cambios en el formulario. Si continúas, los cambios se perderán.'
        )
        if (!confirmed) {
          return
        }
      }
      window.location.href = './dashboard.html'
    })
  }

  // Auto-generate slug from name
  document.getElementById('occasion-name').addEventListener('input', function () {
    const name = this.value
    const slug = generateSlug(name)
    document.getElementById('occasion-slug').value = slug
  })
}

/**
 * Load occasions based on current filter
 */
async function loadOccasions() {
  try {
    await fetchOccasions()
    let filteredOccasions = [...occasions]

    switch (currentFilter) {
      case 'active':
        filteredOccasions = filteredOccasions.filter(occasion => occasion.is_active)
        break
      case 'inactive':
        filteredOccasions = filteredOccasions.filter(occasion => !occasion.is_active)
        break
    }

    // Sort by popularity (most popular first)
    filteredOccasions = sortByPopularity(filteredOccasions)

    renderOccasionsTable(filteredOccasions)
  } catch (error) {
    console.error('loadOccasions failed:', error)
  }
}

/**
 * Render occasions in the table
 */
function renderOccasionsTable(occasionsToRender) {
  const tableBody = document.getElementById('occasions-table-body')
  tableBody.innerHTML = ''

  occasionsToRender.forEach(occasion => {
    const row = document.createElement('tr')
    row.className = 'table-row'
    row.dataset.id = occasion.id

    // Format date for display
    let updatedAt = 'N/A'
    try {
      const date = new Date(occasion.updated_at)
      if (!isNaN(date.getTime())) {
        updatedAt = date.toLocaleDateString('es-ES')
      }
    } catch (error) {
      console.error('Error parsing date:', occasion.updated_at, error)
    }

    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${occasion.id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${occasion.name}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${occasion.slug}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="status-badge ${occasion.is_active ? 'status-active' : 'status-inactive'}">
          ${occasion.is_active ? 'Activa' : 'Inactiva'}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${occasion.display_order}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${updatedAt}</td>
      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div class="flex justify-end space-x-2">
          <button
            onclick="event.stopPropagation(); editOccasion(${occasion.id})"
            class="text-pink-600 hover:text-pink-900 p-1 rounded"
            title="Editar ocasión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button
            onclick="event.stopPropagation(); toggleOccasionStatus(${occasion.id}, ${occasion.is_active})"
            class="${
              occasion.is_active
                ? 'text-yellow-600 hover:text-yellow-900'
                : 'text-green-600 hover:text-green-900'
            } p-1 rounded"
            title="${occasion.is_active ? 'Desactivar ocasión' : 'Activar ocasión'}"
          >
            ${
              occasion.is_active
                ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                    <path d="M9 9a3 3 0 1 1 6 0"/>
                    <path d="M12 12v3"/>
                    <path d="M3 12a9 9 0 1 0 18 0"/>
                  </svg>`
                : `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
                    <path d="M20 6L9 17l-5-5"/>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  </svg>`
            }
          </button>
          <button
            onclick="event.stopPropagation(); deleteOccasionById(${occasion.id}, '${occasion.name.replace(/'/g, "\\'")}')"
            class="text-red-600 hover:text-red-900 p-1 rounded"
            title="Eliminar ocasión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              <line x1="10" x2="10" y1="11" y2="17"/>
              <line x1="14" x2="14" y1="11" y2="17"/>
            </svg>
          </button>
        </div>
      </td>
    `

    // Add click event to select the occasion
    row.addEventListener('click', () => selectOccasion(occasion))

    tableBody.appendChild(row)
  })
}

/**
 * Select an occasion and populate the edit form
 */
function selectOccasion(occasion) {
  // Remove selection from other rows
  document.querySelectorAll('.table-row').forEach(row => {
    row.classList.remove('selected')
  })

  // Add selection to clicked row
  const row = document.querySelector(`.table-row[data-id="${occasion.id}"]`)
  if (row) {
    row.classList.add('selected')
  }

  // Set the selected occasion
  selectedOccasion = occasion

  // Populate the form with occasion data
  document.getElementById('occasion-id').value = occasion.id

  // Try different possible title IDs for different pages
  const titleElement =
    document.getElementById('edition-title-occasion') || document.getElementById('edition-title')
  if (titleElement) {
    titleElement.textContent = `Editar: ${occasion.name}`
  }

  // Populate form fields with black text to ensure visibility
  const nameField = document.getElementById('occasion-name')
  const slugField = document.getElementById('occasion-slug')
  const descriptionField = document.getElementById('occasion-description')
  const iconField = document.getElementById('occasion-icon')
  const colorField = document.getElementById('occasion-color')
  const displayOrderField = document.getElementById('occasion-display-order')

  nameField.value = occasion.name
  nameField.style.color = 'black'

  slugField.value = occasion.slug
  slugField.style.color = 'black'

  descriptionField.value = occasion.description || ''
  descriptionField.style.color = 'black'

  iconField.value = occasion.icon || ''
  iconField.style.color = 'black'

  colorField.value = occasion.color || '#000000'
  colorField.style.color = 'black'

  displayOrderField.value = occasion.display_order || 0
  displayOrderField.style.color = 'black'

  // Ensure text remains black when user types
  const ensureBlackText = field => {
    field.addEventListener('input', () => {
      field.style.color = 'black'
    })
    field.addEventListener('focus', () => {
      field.style.color = 'black'
    })
  }

  ensureBlackText(nameField)
  ensureBlackText(slugField)
  ensureBlackText(descriptionField)
  ensureBlackText(iconField)
  ensureBlackText(colorField)
  ensureBlackText(displayOrderField)

  document.getElementById('occasion-is-active').checked = occasion.is_active

  // Show delete button
  document.getElementById('delete-occasion-btn').classList.remove('hidden')

  // Capture original values for change detection
  captureOriginalValues()

  // Set focus to the name field for better UX
  nameField.focus()
}

/**
 * Capture original form values for change detection
 */
function captureOriginalValues() {
  originalFormValues = {
    name: document.getElementById('occasion-name').value,
    description: document.getElementById('occasion-description').value,
    color: document.getElementById('occasion-color').value,
    isActive: document.getElementById('occasion-is-active').checked
  }
}

/**
 * Save occasion (create or update)
 */
async function saveOccasion() {
  const id = document.getElementById('occasion-id').value
  const name = document.getElementById('occasion-name').value.trim()
  let slug = document.getElementById('occasion-slug').value.trim()
  const description = document.getElementById('occasion-description').value.trim()
  let icon = document.getElementById('occasion-icon').value.trim()
  const color = document.getElementById('occasion-color').value
  const displayOrder = parseInt(document.getElementById('occasion-display-order').value) || 0
  const isActive = document.getElementById('occasion-is-active').checked

  // Basic validation
  if (!name) {
    alert('Por favor ingrese un nombre para la ocasión')
    return
  }

  // Auto-generate slug if empty
  if (!slug) {
    slug = generateSlug(name)
    document.getElementById('occasion-slug').value = slug
  }

  // Auto-generate icon if empty (new occasion)
  if (!icon && !id) {
    icon = getRandomIcon(occasions)
    document.getElementById('occasion-icon').value = icon
  }

  try {
    const occasionData = {
      name,
      slug,
      description,
      icon: icon || 'gift', // Default icon
      color,
      display_order: displayOrder,
      is_active: isActive
    }

    let result
    if (id) {
      // Update existing occasion
      result = await api.updateOccasions(id, occasionData)
    } else {
      // Create new occasion
      result = await api.createOccasions(occasionData)
    }

    if (!result.success) {
      throw new Error(result.message || 'Error al guardar ocasión')
    }

    // Reset form and reload table
    resetForm()
    await loadOccasions()

    alert(`Ocasión ${id ? 'actualizada' : 'creada'} exitosamente!`)
  } catch (error) {
    console.error('saveOccasion failed:', error)
    alert('Error al guardar ocasión: ' + error.message)
  }
}

/**
 * Delete occasion (soft delete)
 */
async function deleteOccasion() {
  if (!selectedOccasion) {
    return
  }

  if (
    !confirm(
      `¿Está seguro de que desea eliminar la ocasión "${selectedOccasion.name}"? Esta acción desactivará la ocasión.`
    )
  ) {
    return
  }

  try {
    const result = await api.deleteOccasions(selectedOccasion.id)

    if (!result.success) {
      throw new Error(result.message || 'Error al eliminar ocasión')
    }

    // Reset form and reload table
    resetForm()
    await loadOccasions()

    alert('Ocasión desactivada exitosamente!')
  } catch (error) {
    console.error('deleteOccasion failed:', error)
    alert('Error al eliminar ocasión: ' + error.message)
  }
}

/**
 * Reset form to initial state
 */
function resetForm() {
  document.getElementById('occasion-id').value = ''

  // Try different possible title IDs for different pages
  const titleElement =
    document.getElementById('edition-title-occasion') || document.getElementById('edition-title')
  if (titleElement) {
    titleElement.textContent = 'Nueva Ocasión'
  }

  // Reset form fields with black text to ensure visibility
  const nameField = document.getElementById('occasion-name')
  const slugField = document.getElementById('occasion-slug')
  const descriptionField = document.getElementById('occasion-description')
  const iconField = document.getElementById('occasion-icon')
  const colorField = document.getElementById('occasion-color')
  const displayOrderField = document.getElementById('occasion-display-order')

  nameField.value = ''
  nameField.style.color = 'black'

  slugField.value = ''
  slugField.style.color = 'black'

  descriptionField.value = ''
  descriptionField.style.color = 'black'

  iconField.value = ''
  iconField.style.color = 'black'

  colorField.value = getRandomColor()
  colorField.style.color = 'black'

  displayOrderField.value = '0'
  displayOrderField.style.color = 'black'

  // Ensure text remains black when user types
  const ensureBlackText = field => {
    field.addEventListener('input', () => {
      field.style.color = 'black'
    })
    field.addEventListener('focus', () => {
      field.style.color = 'black'
    })
  }

  ensureBlackText(nameField)
  ensureBlackText(slugField)
  ensureBlackText(descriptionField)
  ensureBlackText(iconField)
  ensureBlackText(colorField)
  ensureBlackText(displayOrderField)

  document.getElementById('occasion-is-active').checked = true
  selectedOccasion = null

  // Reset original values
  originalFormValues = {}

  // Remove selection from table rows
  document.querySelectorAll('.table-row').forEach(row => {
    row.classList.remove('selected')
  })

  // Hide delete button
  document.getElementById('delete-occasion-btn').classList.add('hidden')
}

/**
 * Check if form has unsaved changes
 */
function hasFormChanges() {
  if (!originalFormValues || Object.keys(originalFormValues).length === 0) {
    // New occasion - check if any field has value
    const name = document.getElementById('occasion-name').value.trim()
    const description = document.getElementById('occasion-description').value.trim()

    return name.length > 0 || description.length > 0
  }

  // Editing - compare with original
  const currentName = document.getElementById('occasion-name').value
  const currentDescription = document.getElementById('occasion-description').value
  const currentColor = document.getElementById('occasion-color').value
  const currentIsActive = document.getElementById('occasion-is-active').checked

  return (
    currentName !== originalFormValues.name ||
    currentDescription !== originalFormValues.description ||
    currentColor !== originalFormValues.color ||
    currentIsActive !== originalFormValues.isActive
  )
}

/**
 * Handle cancel with change detection
 */
function handleCancel() {
  if (hasFormChanges()) {
    const confirmed = confirm(
      '¿Descartar cambios?\n\nHas realizado cambios en el formulario. Si continúas, los cambios se perderán.'
    )
    if (!confirmed) {
      return
    }
  }

  resetForm()
}

import { onDOMReady } from '../../js/shared/dom-ready.js'

// ==================== GLOBAL FUNCTIONS FOR HTML ONCLICK ====================

// Expose occasion management functions globally for HTML onclick handlers
window.editOccasion = function (occasionId) {
  const occasion = occasions.find(o => o.id === occasionId)
  if (occasion) {
    selectOccasion(occasion)
  }
}

window.toggleOccasionStatus = async function (occasionId, currentStatus) {
  try {
    const occasion = occasions.find(o => o.id === occasionId)
    if (!occasion) {
      console.error('Occasion not found:', occasionId)
      return
    }

    const action = currentStatus ? 'desactivar' : 'activar'
    const actionText = currentStatus ? 'desactivada' : 'activada'

    const confirmChange = window.confirm(
      `¿Estás seguro de ${action} la ocasión "${occasion.name}"?`
    )

    if (!confirmChange) {
      return
    }

    console.log(`Changing occasion ${occasionId} status from ${currentStatus} to ${!currentStatus}`)

    const result = await api.updateOccasions(occasionId, { is_active: !currentStatus })

    if (!result.success) {
      throw new Error(result.message || `Error al ${action} ocasión`)
    }

    alert(`Ocasión ${actionText} correctamente`)
    await loadOccasions()
  } catch (error) {
    console.error('Error toggling occasion status:', error)
    alert('Error al cambiar estado: ' + (error.message || 'Error desconocido'))
  }
}

window.deleteOccasionById = async function (occasionId, occasionName) {
  try {
    const occasion = occasions.find(o => o.id === occasionId)
    if (!occasion) {
      console.error('Occasion not found:', occasionId)
      return
    }

    if (
      !confirm(
        `¿Está seguro de que desea eliminar la ocasión "${occasionName}"? Esta acción desactivará la ocasión.`
      )
    ) {
      return
    }

    const result = await api.deleteOccasions(occasionId)

    if (!result.success) {
      throw new Error(result.message || 'Error al eliminar ocasión')
    }

    alert('Ocasión desactivada exitosamente!')

    // Reset form if the deleted occasion was selected
    if (selectedOccasion && selectedOccasion.id === occasionId) {
      resetForm()
    }

    await loadOccasions()
  } catch (error) {
    console.error('Error deleting occasion:', error)
    alert('Error al eliminar ocasión: ' + (error.message || 'Error desconocido'))
  }
}

// Initialize when DOM is ready
onDOMReady(() => {
  // Initialize icons first

  // Then initialize occasions management
  init()

  // Initialize theme manager with fallback
  try {
    if (typeof initThemeManager === 'function') {
      initThemeManager()
    } else if (window.themeManager && typeof window.themeManager.init === 'function') {
      window.themeManager.init()
    } else {
      console.warn('Theme manager not available')
    }
  } catch (error) {
    console.warn('Failed to initialize theme manager:', error)
  }
})
