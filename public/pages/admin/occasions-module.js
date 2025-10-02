/**
 * Ocasiones Management Module for Admin Dashboard
 * Handles CRUD operations for occasions with soft delete functionality
 * Integrated with the main admin dashboard
 */

// Global state for occasions management
let currentOccasionsFilter = 'all' // 'all', 'active', 'inactive'
let selectedOccasion = null
let occasionsData = [
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
 * Initialize occasions management within the dashboard
 */
function initOccasionsManagement() {
  // Setup event listeners for occasions view
  setupOccasionsEventListeners()

  // Load initial occasions data
  loadOccasionsData()
}

/**
 * Setup event listeners for occasions management
 */
function setupOccasionsEventListeners() {
  // Filter buttons
  const filterAllBtn = document.getElementById('filter-all-occasions')
  const filterActiveBtn = document.getElementById('filter-active-occasions')
  const filterInactiveBtn = document.getElementById('filter-inactive-occasions')

  if (filterAllBtn) {
    filterAllBtn.addEventListener('click', () => {
      updateFilterButtons('all')
      currentOccasionsFilter = 'all'
      loadOccasionsData()
    })
  }

  if (filterActiveBtn) {
    filterActiveBtn.addEventListener('click', () => {
      updateFilterButtons('active')
      currentOccasionsFilter = 'active'
      loadOccasionsData()
    })
  }

  if (filterInactiveBtn) {
    filterInactiveBtn.addEventListener('click', () => {
      updateFilterButtons('inactive')
      currentOccasionsFilter = 'inactive'
      loadOccasionsData()
    })
  }

  // New occasion button
  const newOccasionBtn = document.getElementById('new-occasion-btn')
  if (newOccasionBtn) {
    newOccasionBtn.addEventListener('click', () => {
      resetOccasionForm()
      const titleElement = document.getElementById('edition-title-occasion')
      if (titleElement) titleElement.textContent = 'Nueva Ocasión'
      const deleteBtn = document.getElementById('delete-occasion-btn')
      if (deleteBtn) deleteBtn.classList.add('hidden')
    })
  }

  // Save occasion button
  const saveOccasionBtn = document.getElementById('save-occasion-btn')
  if (saveOccasionBtn) {
    saveOccasionBtn.addEventListener('click', saveOccasion)
  }

  // Delete occasion button
  const deleteOccasionBtn = document.getElementById('delete-occasion-btn')
  if (deleteOccasionBtn) {
    deleteOccasionBtn.addEventListener('click', deleteOccasion)
  }

  // Cancel button
  const cancelOccasionBtn = document.getElementById('cancel-occasion-btn')
  if (cancelOccasionBtn) {
    cancelOccasionBtn.addEventListener('click', resetOccasionForm)
  }

  // Auto-generate slug from name
  const occasionNameInput = document.getElementById('occasion-name')
  if (occasionNameInput) {
    occasionNameInput.addEventListener('input', function () {
      if (!selectedOccasion) {
        // Only auto-generate if creating new
        const name = this.value
        const slug = generateSlug(name)
        const slugInput = document.getElementById('occasion-slug')
        if (slugInput) {
          slugInput.value = slug
        }
      }
    })
  }
}

/**
 * Update filter buttons visual state
 */
function updateFilterButtons(activeFilter) {
  // Remove active classes from all buttons
  document.querySelectorAll('.filter-btn-occasion').forEach(btn => {
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

  // Add active class to selected button
  const activeBtn = document.getElementById(`filter-${activeFilter}-occasions`)
  if (activeBtn) {
    activeBtn.classList.remove('bg-pink-100', 'text-pink-800')
    if (activeFilter === 'active') {
      activeBtn.classList.add('bg-green-100', 'text-green-800')
    } else if (activeFilter === 'inactive') {
      activeBtn.classList.add('bg-red-100', 'text-red-800')
    } else {
      activeBtn.classList.add('bg-pink-100', 'text-pink-800')
    }
  }
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
 * Load occasions data based on current filter
 */
function loadOccasionsData() {
  let filteredOccasions = [...occasionsData]

  switch (currentOccasionsFilter) {
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
  if (!tableBody) return

  tableBody.innerHTML = ''

  occasionsToRender.forEach(occasion => {
    const row = document.createElement('tr')
    row.className = 'table-row-occasion'
    row.dataset.id = occasion.id

    // Format date for display
    const updatedAt = new Date(occasion.updated_at).toLocaleDateString('es-ES')

    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${occasion.id}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${occasion.name}</td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${occasion.slug}</td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="status-badge-occasion ${occasion.is_active ? 'status-active-occasion' : 'status-inactive-occasion'}">
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
  document.querySelectorAll('.table-row-occasion').forEach(row => {
    row.classList.remove('selected-occasion')
  })

  // Add selection to clicked row
  const row = document.querySelector(`.table-row-occasion[data-id="${occasion.id}"]`)
  if (row) {
    row.classList.add('selected-occasion')
  }

  // Set the selected occasion
  selectedOccasion = occasion

  // Populate the form with occasion data
  const idInput = document.getElementById('occasion-id')
  const titleElement = document.getElementById('edition-title-occasion')
  const nameInput = document.getElementById('occasion-name')
  const slugInput = document.getElementById('occasion-slug')
  const descriptionInput = document.getElementById('occasion-description')
  const iconInput = document.getElementById('occasion-icon')
  const colorInput = document.getElementById('occasion-color')
  const displayOrderInput = document.getElementById('occasion-display-order')
  const isActiveCheckbox = document.getElementById('occasion-is-active')
  const deleteBtn = document.getElementById('delete-occasion-btn')

  if (idInput) idInput.value = occasion.id
  if (titleElement) titleElement.textContent = `Editar: ${occasion.name}`
  if (nameInput) nameInput.value = occasion.name
  if (slugInput) slugInput.value = occasion.slug
  if (descriptionInput) descriptionInput.value = occasion.description || ''
  if (iconInput) iconInput.value = occasion.icon || ''
  if (colorInput) colorInput.value = occasion.color || '#000000'
  if (displayOrderInput) displayOrderInput.value = occasion.display_order || 0
  if (isActiveCheckbox) isActiveCheckbox.checked = occasion.is_active
  if (deleteBtn) deleteBtn.classList.remove('hidden')
}

/**
 * Save occasion (create or update)
 */
function saveOccasion() {
  const idInput = document.getElementById('occasion-id')
  const nameInput = document.getElementById('occasion-name')
  const slugInput = document.getElementById('occasion-slug')
  const descriptionInput = document.getElementById('occasion-description')
  const iconInput = document.getElementById('occasion-icon')
  const colorInput = document.getElementById('occasion-color')
  const displayOrderInput = document.getElementById('occasion-display-order')
  const isActiveCheckbox = document.getElementById('occasion-is-active')

  if (!nameInput || !slugInput) return

  const id = idInput ? idInput.value : ''
  const name = nameInput.value.trim()
  const slug = slugInput.value.trim()
  const description = descriptionInput ? descriptionInput.value.trim() : ''
  const icon = iconInput ? iconInput.value.trim() : ''
  const color = colorInput ? colorInput.value : '#000000'
  const displayOrder = displayOrderInput ? parseInt(displayOrderInput.value) || 0 : 0
  const isActive = isActiveCheckbox ? isActiveCheckbox.checked : true

  // Basic validation
  if (!name || !slug) {
    alert('Por favor complete los campos obligatorios (Nombre y Slug)')
    return
  }

  if (id) {
    // Update existing occasion
    const index = occasionsData.findIndex(o => o.id === id)
    if (index !== -1) {
      occasionsData[index] = {
        ...occasionsData[index],
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
    const newId = Math.max(...occasionsData.map(o => o.id), 0) + 1
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
    occasionsData.push(newOccasion)
  }

  // Reset form and reload table
  resetOccasionForm()
  loadOccasionsData()

  alert(`Ocasión ${id ? 'actualizada' : 'creada'} exitosamente!`)
}

/**
 * Delete occasion (soft delete)
 */
function deleteOccasion() {
  if (!selectedOccasion) return

  if (
    confirm(
      `¿Está seguro de que desea eliminar la ocasión "${selectedOccasion.name}"? Esta acción desactivará la ocasión.`
    )
  ) {
    // For soft delete, we just set is_active to false
    const index = occasionsData.findIndex(o => o.id === selectedOccasion.id)
    if (index !== -1) {
      occasionsData[index].is_active = false
      occasionsData[index].updated_at = new Date().toISOString()
    }

    // Reset form and reload table
    resetOccasionForm()
    loadOccasionsData()

    alert('Ocasión desactivada exitosamente!')
  }
}

/**
 * Reset form to initial state
 */
function resetOccasionForm() {
  const idInput = document.getElementById('occasion-id')
  const titleElement = document.getElementById('edition-title-occasion')
  const nameInput = document.getElementById('occasion-name')
  const slugInput = document.getElementById('occasion-slug')
  const descriptionInput = document.getElementById('occasion-description')
  const iconInput = document.getElementById('occasion-icon')
  const colorInput = document.getElementById('occasion-color')
  const displayOrderInput = document.getElementById('occasion-display-order')
  const isActiveCheckbox = document.getElementById('occasion-is-active')
  const deleteBtn = document.getElementById('delete-occasion-btn')

  if (idInput) idInput.value = ''
  if (titleElement) titleElement.textContent = 'Nueva Ocasión'
  if (nameInput) nameInput.value = ''
  if (slugInput) slugInput.value = ''
  if (descriptionInput) descriptionInput.value = ''
  if (iconInput) iconInput.value = ''
  if (colorInput) colorInput.value = '#000000'
  if (displayOrderInput) displayOrderInput.value = '0'
  if (isActiveCheckbox) isActiveCheckbox.checked = true
  selectedOccasion = null

  // Remove selection from table rows
  document.querySelectorAll('.table-row-occasion').forEach(row => {
    row.classList.remove('selected-occasion')
  })

  // Hide delete button
  if (deleteBtn) deleteBtn.classList.add('hidden')
}

// Export functions for use in the main dashboard
window.occasionsModule = {
  initOccasionsManagement,
  loadOccasionsData
}
