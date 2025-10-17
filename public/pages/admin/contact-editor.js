/**
 * Contact Page Editor
 * Manage all contact page settings from admin panel
 */

import '../../js/'
import { api } from '../../js/shared/api-client.js'

// State
let settings = {}
let hasChanges = false

/**
 * Initialize editor
 */
async function init() {
  // Initialize Lucide icons

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
    const response = await api.getAllPublic()

    if (!response || !response.success || !response.data) {
      throw new Error('Failed to load settings')
    }

    const allSettings = response.data
    if (!Array.isArray(allSettings)) {
      throw new Error('Invalid settings format')
    }

    settings = {}
    allSettings.forEach(setting => {
      if (setting && setting.key) {
        settings[setting.key] = setting
      }
    })

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
  })
}

/**
 * Save all settings
 */
async function saveAllSettings() {
  const saveBtn = document.getElementById('save-all-btn')
  const saveBottomBtn = document.getElementById('save-all-bottom-btn')

  if (!saveBtn || !saveBottomBtn) {
    console.error('Save buttons not found')
    return
  }

  try {
    const buttons = [saveBtn, saveBottomBtn]

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

    const inputs = document.querySelectorAll('.setting-input')
    const updates = []

    for (const input of inputs) {
      const settingKey = input.dataset.setting
      if (!settingKey) {
        console.warn('Input without setting key:', input)
        continue
      }

      const newValue = input.value.trim()
      const currentSetting = settings[settingKey]

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

    let successCount = 0
    let errorCount = 0

    for (const update of updates) {
      try {
        const response = await api.updateSettings(update.key, { value: update.value })

        if (response && response.success) {
          successCount++
          if (settings[update.key]) {
            settings[update.key].value = update.value
          }
        } else {
          errorCount++
          console.error(`Failed to update ${update.key}:`, response?.message)
        }
      } catch (error) {
        errorCount++
        console.error(`Error updating ${update.key}:`, error)
      }
    }

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
    const buttons = [saveBtn, saveBottomBtn]
    buttons.forEach(btn => {
      btn.disabled = false
    })
    updateSaveButtons()
  }
}

import { onDOMReady } from '../../js/shared/dom-ready.js'

// Initialize when DOM is ready
onDOMReady(() => {
  init()
})
