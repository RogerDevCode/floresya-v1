/**
 * Occasions Management Module
 * Handles CRUD operations for occasions with soft delete functionality
 */

// Global state
let currentFilter = 'all' // 'all', 'active', 'inactive'
let selectedOccasion = null
const occasions = [
  {
    id: 16,
    name: 'Cumpleaños',
    description: 'Celebra un cumpleaños especial',
    slug: 'cumpleanos',
    is_active: true,
    display_order: 0,
    created_at: '2025-09-25T05:04:48.026907+00',
    updated_at: '2025-09-25T05:04:48.026907+00',
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
    created_at: '2025-09-25T05:04:48.026907+00',
    updated_at: '2025-09-25T05:04:48.026907+00',
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
    created_at: '2025-09-25T05:04:48.026907+00',
    updated_at: '2025-09-25T05:04:48.026907+00',
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
    created_at: '2025-09-25T05:04:48.026907+00',
    updated_at: '2025-09-25T05:04:48.026907+00',
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
    created_at: '2025-09-25T05:04:48.026907+00',
    updated_at: '2025-09-25T05:04:48.026907+00',
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

  // Cancel button
  document.getElementById('cancel-occasion-btn').addEventListener('click', resetForm)

  // Auto-generate slug from name
  document.getElementById('occasion-name').addEventListener('input', function () {
    if (!selectedOccasion) {
      // Only auto-generate if creating new
      const name = this.value
      const slug = generateSlug(name)
      document.getElementById('occasion-slug').value = slug
    }
  })
}

/**
 * Generate slug from name
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Load occasions based on current filter
 */
function loadOccasions() {
  let filteredOccasions = [...occasions]

  switch (currentFilter) {
    case 'active':
      filteredOccasions = filteredOccasions.filter(occasion => occasion.is_active)
      break
    case 'inactive':
      filteredOccasions = filteredOccasions.filter(occasion => !occasion.is_active)
      break
  }

  renderOccasionsTable(filteredOccasions)
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
    const updatedAt = new Date(occasion.updated_at).toLocaleDateString('es-ES')

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
}

/**
 * Save occasion (create or update)
 */
function saveOccasion() {
  const id = document.getElementById('occasion-id').value
  const name = document.getElementById('occasion-name').value.trim()
  const slug = document.getElementById('occasion-slug').value.trim()
  const description = document.getElementById('occasion-description').value.trim()
  const icon = document.getElementById('occasion-icon').value.trim()
  const color = document.getElementById('occasion-color').value
  const displayOrder = parseInt(document.getElementById('occasion-display-order').value) || 0
  const isActive = document.getElementById('occasion-is-active').checked

  // Basic validation
  if (!name || !slug) {
    alert('Por favor complete los campos obligatorios (Nombre y Slug)')
    return
  }

  if (id) {
    // Update existing occasion
    const index = occasions.findIndex(o => o.id === id)
    if (index !== -1) {
      occasions[index] = {
        ...occasions[index],
        name,
        slug,
        description,
        icon,
        color,
        display_order: displayOrder,
        is_active: isActive,
        updated_at: new Date().toISOString()
      }
    }
  } else {
    // Create new occasion
    const newId = Math.max(...occasions.map(o => o.id), 0) + 1
    const newOccasion = {
      id: newId,
      name,
      slug,
      description,
      icon,
      color,
      display_order: displayOrder,
      is_active: isActive,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    occasions.push(newOccasion)
  }

  // Reset form and reload table
  resetForm()
  loadOccasions()

  alert(`Ocasión ${id ? 'actualizada' : 'creada'} exitosamente!`)
}

/**
 * Delete occasion (soft delete)
 */
function deleteOccasion() {
  if (!selectedOccasion) {
    return
  }

  if (
    confirm(
      `¿Está seguro de que desea eliminar la ocasión "${selectedOccasion.name}"? Esta acción desactivará la ocasión.`
    )
  ) {
    // For soft delete, we just set is_active to false
    const index = occasions.findIndex(o => o.id === selectedOccasion.id)
    if (index !== -1) {
      occasions[index].is_active = false
      occasions[index].updated_at = new Date().toISOString()
    }

    // Reset form and reload table
    resetForm()
    loadOccasions()

    alert('Ocasión desactivada exitosamente!')
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
  document.getElementById('occasion-color').value = '#000000'
  document.getElementById('occasion-display-order').value = '0'
  document.getElementById('occasion-is-active').checked = true
  selectedOccasion = null

  // Remove selection from table rows
  document.querySelectorAll('.table-row').forEach(row => {
    row.classList.remove('selected')
  })

  // Hide delete button
  document.getElementById('delete-occasion-btn').classList.add('hidden')
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize icons first
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Then initialize occasions management
  init()
})
