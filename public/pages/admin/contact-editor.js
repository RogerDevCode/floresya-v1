/**
 * Contact Page Editor
 * Manage all contact page settings from admin panel
 */

import '../../js/lucide-icons.js'
import { api } from '../../js/shared/api.js'

// State
let settings = {}
let hasChanges = false

/**
 * Initialize editor
 */
async function init() {
  // Initialize Lucide icons
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Load settings
  await loadSettings()

  // Setup event listeners
  setupEventListeners()
}

/**
 * Load all contact settings from API
 */
async function loadSettings() {
  try {
    const response = await api.getPublicSettings()

    if (!response.success || !response.data) {
      throw new Error('Failed to load settings')
    }

    // Convert array to map
    const allSettings = response.data
    settings = {}
    allSettings.forEach(setting => {
      settings[setting.key] = setting
    })

    // Populate form
    populateForm()
  } catch (error) {
    console.error('loadSettings failed:', error)
    alert(`Error al cargar configuración: ${error.message}`)
    throw error
  }
}

/**
 * Populate form with settings values
 */
function populateForm() {
  const inputs = document.querySelectorAll('.setting-input')

  inputs.forEach(input => {
    const settingKey = input.dataset.setting
    const setting = settings[settingKey]

    if (setting) {
      input.value = setting.value || ''
    }
  })
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Track changes
  const inputs = document.querySelectorAll('.setting-input')
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      hasChanges = true
      updateSaveButtons()
    })
  })

  // Save buttons
  document.getElementById('save-all-btn').addEventListener('click', saveAllSettings)
  document.getElementById('save-all-bottom-btn').addEventListener('click', saveAllSettings)

  // Warn before leaving with unsaved changes
  window.addEventListener('beforeunload', e => {
    if (hasChanges) {
      e.preventDefault()
      e.returnValue = ''
    }
  })
}

/**
 * Update save buttons state
 */
function updateSaveButtons() {
  const buttons = [
    document.getElementById('save-all-btn'),
    document.getElementById('save-all-bottom-btn')
  ]

  buttons.forEach(btn => {
    if (hasChanges) {
      btn.classList.add('ring-4', 'ring-pink-300')
      btn.innerHTML = `
        <i data-lucide="alert-circle" class="h-5 w-5"></i>
        <span>Guardar Cambios Pendientes</span>
      `
    } else {
      btn.classList.remove('ring-4', 'ring-pink-300')
      btn.innerHTML = `
        <i data-lucide="check-circle" class="h-5 w-5"></i>
        <span>Todo Guardado</span>
      `
    }

    // Re-initialize icons
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons()
    }
  })
}

/**
 * Save all settings
 */
async function saveAllSettings() {
  try {
    // Disable buttons
    const buttons = [
      document.getElementById('save-all-btn'),
      document.getElementById('save-all-bottom-btn')
    ]

    buttons.forEach(btn => {
      btn.disabled = true
      btn.innerHTML = `
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Guardando...</span>
      `
    })

    // Collect all input values
    const inputs = document.querySelectorAll('.setting-input')
    const updates = []

    for (const input of inputs) {
      const settingKey = input.dataset.setting
      const newValue = input.value.trim()
      const currentSetting = settings[settingKey]

      // Only update if value changed
      if (currentSetting && currentSetting.value !== newValue) {
        updates.push({
          key: settingKey,
          value: newValue
        })
      }
    }

    if (updates.length === 0) {
      alert('No hay cambios para guardar')
      return
    }

    // Update all settings
    let successCount = 0
    let errorCount = 0

    for (const update of updates) {
      try {
        const response = await api.updateSetting(update.key, { value: update.value })

        if (response.success) {
          successCount++
          // Update local state
          settings[update.key].value = update.value
        } else {
          errorCount++
          console.error(`Failed to update ${update.key}:`, response.message)
        }
      } catch (error) {
        errorCount++
        console.error(`Error updating ${update.key}:`, error)
      }
    }

    // Show result
    if (errorCount === 0) {
      alert(`✅ ${successCount} configuraciones guardadas exitosamente`)
      hasChanges = false
      updateSaveButtons()
    } else {
      alert(
        `⚠️ Guardado parcial:\n✅ ${successCount} exitosas\n❌ ${errorCount} con errores\n\nRevisa la consola para más detalles.`
      )
    }
  } catch (error) {
    console.error('saveAllSettings failed:', error)
    alert(`Error al guardar: ${error.message}`)
    throw error
  } finally {
    // Re-enable buttons
    const buttons = [
      document.getElementById('save-all-btn'),
      document.getElementById('save-all-bottom-btn')
    ]

    buttons.forEach(btn => {
      btn.disabled = false
    })

    updateSaveButtons()
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  init()
})
