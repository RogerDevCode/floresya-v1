/**
 * Occasions Management Module
 * Handles CRUD operations for occasions with soft delete functionality
 */

import '../../js/lucide-icons.js'
import { api } from '../../js/shared/api-client.js'
import { generateSlug, getRandomIcon, getRandomColor } from '../../js/shared/occasion-helpers.js'
import { sortByPopularity } from '../../js/shared/occasion-popularity.js'

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
const _oldMockData = [
  {
    id: 16,
    name: 'Cumpleaños',
    description: 'Celebra un cumpleaños especial',
    slug: 'cumpleanos',
    is_active: true,
    display_order: 0,
    created_at: '2025-09-25T05:04:48.026907+00:00',
    updated_at: '2025-09-25T05:04:48.026907+00:00',
    icon: 'gift',
    color: '#db2777'
  },
  {
    id: 17,
    name: 'Aniversario',
    description: 'Conmemora un aniversario importante',
    slug: 'aniversario',
    is_active: true,
    display_order: 0,
    created_at: '2025-09-25T05:04:48.026907+00:00',
    updated_at: '2025-09-25T05:04:48.026907+00:00',
    icon: 'heart',
    color: '#10b981'
  },
  {
    id: 18,
    name: 'San Valentín',
    description: 'Expresa tu amor en el día de los enamorados',
    slug: 'san-valentin',
    is_active: true,
    display_order: 0,
    created_at: '2025-09-25T05:04:48.026907+00:00',
    updated_at: '2025-09-25T05:04:48.026907+00:00',
    icon: 'heart',
    color: '#ef4444'
  },
  {
    id: 19,
    name: 'Día de la Madre',
    description: 'Honra a mamá en su día especial',
    slug: 'dia-de-la-madre',
    is_active: true,
    display_order: 0,
    created_at: '2025-09-25T05:04:48.026907+00:00',
    updated_at: '2025-09-25T05:04:48.026907+00:00',
    icon: 'flower',
    color: '#8b5cf6'
  },
  {
    id: 20,
    name: 'Graduación',
    description: 'Felicita por un logro académico',
    slug: 'graduacion',
    is_active: false, // Inactive for demonstration
    display_order: 0,
    created_at: '2025-09-25T05:04:48.026907+00:00',
    updated_at: '2025-09-25T05:04:48.026907+00:00',
    icon: 'graduation-cap',
    color: '#f59e0b'
  }
]

/**
 * Initialize occasions management
 */
function init() {
  // Initialize Lucide icons
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

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
  document.getElementById('edition-title').textContent = `Editar: ${occasion.name}`
  document.getElementById('occasion-name').value = occasion.name
  document.getElementById('occasion-slug').value = occasion.slug
  document.getElementById('occasion-description').value = occasion.description || ''
  document.getElementById('occasion-icon').value = occasion.icon || ''
  document.getElementById('occasion-color').value = occasion.color || '#000000'
  document.getElementById('occasion-display-order').value = occasion.display_order || 0
  document.getElementById('occasion-is-active').checked = occasion.is_active

  // Show delete button
  document.getElementById('delete-occasion-btn').classList.remove('hidden')

  // Capture original values for change detection
  captureOriginalValues()
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
  document.getElementById('edition-title').textContent = 'Nueva Ocasión'
  document.getElementById('occasion-name').value = ''
  document.getElementById('occasion-slug').value = ''
  document.getElementById('occasion-description').value = ''
  document.getElementById('occasion-icon').value = ''
  document.getElementById('occasion-color').value = getRandomColor()
  document.getElementById('occasion-display-order').value = '0'
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

// Initialize when DOM is ready
onDOMReady(() => {
  // Initialize icons first
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Then initialize occasions management
  init()
})
