/**
 * Payment Method Manager Component
 * Manages payment methods in the admin panel with CRUD operations
 * Uses the api-client for all API interactions
 */

import { api } from '../shared/api-client.js'
import { createIcons } from '../lucide-icons.js'
import { showToast } from './toast.js'

// Toast notification utility
const toast = {
  success: message => showToast(message, 'success'),
  error: message => showToast(message, 'error'),
  info: message => showToast(message, 'info')
}

/**
 * Payment Method Manager Class
 * Handles all UI interactions for payment method management
 */
export class PaymentMethodManager {
  /**
   * Create a new PaymentMethodManager instance
   * @param {string} containerId - ID of the container element
   * @param {Object} options - Configuration options
   */
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId)
    this.options = {
      onPaymentMethodChange: options.onPaymentMethodChange || (() => {}),
      ...options
    }

    this.paymentMethods = []
    this.isLoading = false

    if (!this.container) {
      throw new Error(`PaymentMethodManager: Container with ID "${containerId}" not found`)
    }

    this.init()
  }

  /**
   * Initialize the payment method manager
   */
  async init() {
    try {
      console.log('✅ PaymentMethodManager: Initializing...')

      // Render the UI
      this.render()

      // Load payment methods
      await this.loadPaymentMethods()

      // Bind events
      this.bindEvents()

      console.log('✅ PaymentMethodManager: Initialized successfully')
    } catch (error) {
      console.error('❌ PaymentMethodManager: Initialization failed:', error)
      toast.error('Error al inicializar el gestor de métodos de pago')
    }
  }

  /**
   * Render the payment method manager UI
   */
  render() {
    this.container.innerHTML = `
      <div class="payment-method-manager">
        <div class="payment-method-header mb-6">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-900">Métodos de Pago</h3>
            <button 
              id="add-payment-method-btn"
              class="btn btn-primary flex items-center space-x-2"
              type="button"
            >
              <i data-lucide="plus" class="h-5 w-5"></i>
              <span>Agregar Método de Pago</span>
            </button>
          </div>
          
          <div class="mt-4 flex items-center justify-between">
            <div class="relative w-64">
              <input
                type="text"
                id="payment-method-search"
                placeholder="Buscar métodos de pago..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i data-lucide="search" class="h-5 w-5 text-gray-400"></i>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <button 
                id="refresh-payment-methods-btn"
                class="btn btn-secondary flex items-center space-x-2"
                type="button"
              >
                <i data-lucide="refresh-cw" class="h-5 w-5"></i>
                <span>Actualizar</span>
              </button>
              
              <select 
                id="payment-method-type-filter"
                class="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="">Todos los tipos</option>
                <option value="bank_transfer">Transferencia Bancaria</option>
                <option value="mobile_payment">Pago Móvil</option>
                <option value="cash">Efectivo</option>
                <option value="crypto">Criptomonedas</option>
                <option value="international">Internacional</option>
              </select>
            </div>
          </div>
        </div>
        
        <div id="payment-methods-loading" class="hidden py-12 text-center">
          <div class="inline-flex items-center space-x-2">
            <i data-lucide="loader" class="h-6 w-6 animate-spin text-pink-600"></i>
            <span class="text-gray-600">Cargando métodos de pago...</span>
          </div>
        </div>
        
        <div id="payment-methods-error" class="hidden py-6 text-center">
          <div class="inline-flex flex-col items-center space-y-2">
            <i data-lucide="alert-circle" class="h-12 w-12 text-red-500"></i>
            <p class="text-red-600 font-medium">Error al cargar los métodos de pago</p>
            <button 
              id="retry-payment-methods-btn"
              class="mt-2 btn btn-secondary"
              type="button"
            >
              Reintentar
            </button>
          </div>
        </div>
        
        <div id="payment-methods-empty" class="hidden py-12 text-center">
          <div class="inline-flex flex-col items-center space-y-2">
            <i data-lucide="credit-card" class="h-12 w-12 text-gray-400"></i>
            <p class="text-gray-500">No hay métodos de pago disponibles</p>
            <button 
              id="create-first-payment-method-btn"
              class="mt-4 btn btn-primary"
              type="button"
            >
              Crear primer método de pago
            </button>
          </div>
        </div>
        
        <div id="payment-methods-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Payment methods will be rendered here -->
        </div>
      </div>
    `

    createIcons()
  }

  /**
   * Load payment methods from the API
   */
  async loadPaymentMethods() {
    try {
      if (this.isLoading) {
        return
      }

      this.isLoading = true
      this.showLoading()

      const result = await api.getAllPaymentmethods({
        includeInactive: true
      })

      this.paymentMethods = result.data || []

      this.renderPaymentMethods()
      this.hideLoading()

      console.log(`✅ PaymentMethodManager: Loaded ${this.paymentMethods.length} payment methods`)
    } catch (error) {
      console.error('❌ PaymentMethodManager: Failed to load payment methods:', error)
      this.showError()
      toast.error('Error al cargar los métodos de pago')
    } finally {
      this.isLoading = false
    }
  }

  /**
   * Render payment methods list
   */
  renderPaymentMethods() {
    const listContainer = document.getElementById('payment-methods-list')
    const emptyContainer = document.getElementById('payment-methods-empty')

    if (!listContainer || !emptyContainer) {
      return
    }

    if (!this.paymentMethods || this.paymentMethods.length === 0) {
      listContainer.classList.add('hidden')
      emptyContainer.classList.remove('hidden')
      return
    }

    emptyContainer.classList.add('hidden')
    listContainer.classList.remove('hidden')

    listContainer.innerHTML = this.paymentMethods
      .map(paymentMethod => this.createPaymentMethodCard(paymentMethod))
      .join('')

    createIcons()
  }

  /**
   * Create a payment method card
   * @param {Object} paymentMethod - Payment method data
   * @returns {string} HTML string for the payment method card
   */
  createPaymentMethodCard(paymentMethod) {
    const typeLabels = {
      bank_transfer: 'Transferencia Bancaria',
      mobile_payment: 'Pago Móvil',
      cash: 'Efectivo',
      crypto: 'Criptomonedas',
      international: 'Internacional'
    }

    const typeColors = {
      bank_transfer: 'bg-blue-100 text-blue-800',
      mobile_payment: 'bg-green-100 text-green-800',
      cash: 'bg-yellow-100 text-yellow-800',
      crypto: 'bg-purple-100 text-purple-800',
      international: 'bg-indigo-100 text-indigo-800'
    }

    return `
      <div 
        class="payment-method-card bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
        data-id="${paymentMethod.id}"
      >
        <div class="p-6">
          <div class="flex justify-between items-start">
            <div>
              <h4 class="text-lg font-bold text-gray-900">${paymentMethod.name}</h4>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${typeColors[paymentMethod.type] || 'bg-gray-100 text-gray-800'}">
                  ${typeLabels[paymentMethod.type] || paymentMethod.type}
                </span>
                ${
                  !paymentMethod.is_active
                    ? `
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Inactivo
                  </span>
                `
                    : ''
                }
                ${
                  paymentMethod.display_order !== null && paymentMethod.display_order !== undefined
                    ? `
                  <span class="px-2 py-1 text-xs font-medium rounded-full bg-pink-100 text-pink-800">
                    Orden: ${paymentMethod.display_order}
                  </span>
                `
                    : ''
                }
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <button 
                class="edit-payment-method-btn p-2 rounded-lg hover:bg-gray-100 transition-colors"
                data-id="${paymentMethod.id}"
                type="button"
                title="Editar método de pago"
              >
                <i data-lucide="edit" class="h-5 w-5 text-gray-600"></i>
              </button>
              
              ${
                paymentMethod.is_active
                  ? `
                <button 
                  class="deactivate-payment-method-btn p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  data-id="${paymentMethod.id}"
                  type="button"
                  title="Desactivar método de pago"
                >
                  <i data-lucide="eye-off" class="h-5 w-5 text-gray-600"></i>
                </button>
              `
                  : `
                <button 
                  class="reactivate-payment-method-btn p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  data-id="${paymentMethod.id}"
                  type="button"
                  title="Reactivar método de pago"
                >
                  <i data-lucide="eye" class="h-5 w-5 text-gray-600"></i>
                </button>
              `
              }
            </div>
          </div>
          
          ${
            paymentMethod.description
              ? `
            <p class="mt-4 text-gray-600 text-sm">
              ${paymentMethod.description}
            </p>
          `
              : ''
          }
          
          ${
            paymentMethod.account_info
              ? `
            <div class="mt-4 p-3 bg-gray-50 rounded-lg">
              <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Información de cuenta</p>
              <p class="text-sm font-mono break-all">${paymentMethod.account_info}</p>
            </div>
          `
              : ''
          }
          
          <div class="mt-4 flex items-center justify-between text-xs text-gray-500">
            <span>Creado: ${new Date(paymentMethod.created_at).toLocaleDateString()}</span>
            <span>Actualizado: ${new Date(paymentMethod.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Show loading state
   */
  showLoading() {
    const loading = document.getElementById('payment-methods-loading')
    const list = document.getElementById('payment-methods-list')
    const error = document.getElementById('payment-methods-error')
    const empty = document.getElementById('payment-methods-empty')

    if (loading) {
      loading.classList.remove('hidden')
    }
    if (list) {
      list.classList.add('hidden')
    }
    if (error) {
      error.classList.add('hidden')
    }
    if (empty) {
      empty.classList.add('hidden')
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const loading = document.getElementById('payment-methods-loading')
    if (loading) {
      loading.classList.add('hidden')
    }
  }

  /**
   * Show error state
   */
  showError() {
    const error = document.getElementById('payment-methods-error')
    const list = document.getElementById('payment-methods-list')
    const loading = document.getElementById('payment-methods-loading')
    const empty = document.getElementById('payment-methods-empty')

    if (error) {
      error.classList.remove('hidden')
    }
    if (list) {
      list.classList.add('hidden')
    }
    if (loading) {
      loading.classList.add('hidden')
    }
    if (empty) {
      empty.classList.add('hidden')
    }
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Add payment method button
    const addBtn = document.getElementById('add-payment-method-btn')
    if (addBtn) {
      addBtn.addEventListener('click', () => this.showCreateModal())
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-payment-methods-btn')
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadPaymentMethods())
    }

    // Retry button
    const retryBtn = document.getElementById('retry-payment-methods-btn')
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.loadPaymentMethods())
    }

    // Create first payment method button
    const createFirstBtn = document.getElementById('create-first-payment-method-btn')
    if (createFirstBtn) {
      createFirstBtn.addEventListener('click', () => this.showCreateModal())
    }

    // Edit payment method buttons
    this.container.addEventListener('click', e => {
      if (e.target.closest('.edit-payment-method-btn')) {
        const btn = e.target.closest('.edit-payment-method-btn')
        const id = parseInt(btn.dataset.id, 10)
        this.showEditModal(id)
      }

      if (e.target.closest('.deactivate-payment-method-btn')) {
        const btn = e.target.closest('.deactivate-payment-method-btn')
        const id = parseInt(btn.dataset.id, 10)
        this.deactivatePaymentMethod(id)
      }

      if (e.target.closest('.reactivate-payment-method-btn')) {
        const btn = e.target.closest('.reactivate-payment-method-btn')
        const id = parseInt(btn.dataset.id, 10)
        this.reactivatePaymentMethod(id)
      }
    })
  }

  /**
   * Show create payment method modal
   */
  showCreateModal() {
    // Create modal container
    const modalId = 'create-payment-method-modal'
    let modal = document.getElementById(modalId)

    if (!modal) {
      modal = document.createElement('div')
      modal.id = modalId
      modal.className = 'fixed inset-0 z-50 overflow-y-auto hidden'
      modal.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        <div class="flex items-center justify-center min-h-screen p-4">
          <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
            <div class="p-6">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-900">Agregar Método de Pago</h3>
                <button 
                  id="close-create-modal-btn"
                  class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  type="button"
                >
                  <i data-lucide="x" class="h-5 w-5 text-gray-500"></i>
                </button>
              </div>
              
              <form id="create-payment-method-form" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    name="name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Banco Mercantil"
                    required
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select
                    name="type"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="bank_transfer">Transferencia Bancaria</option>
                    <option value="mobile_payment">Pago Móvil</option>
                    <option value="cash">Efectivo</option>
                    <option value="crypto">Criptomonedas</option>
                    <option value="international">Internacional</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    name="description"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Transferencias desde Banco Mercantil"
                  ></textarea>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Información de cuenta</label>
                  <input
                    type="text"
                    name="account_info"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="0105-1234-5678-9012"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Orden de visualización</label>
                  <input
                    type="number"
                    name="display_order"
                    min="0"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="0"
                  />
                </div>
                
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="create-active-checkbox"
                    class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    checked
                  />
                  <label for="create-active-checkbox" class="ml-2 block text-sm text-gray-700">
                    Activo
                  </label>
                </div>
                
                <div class="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    id="cancel-create-btn"
                    class="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="submit-create-btn"
                    class="btn btn-primary flex items-center space-x-2"
                  >
                    <span>Crear Método de Pago</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      `

      document.body.appendChild(modal)
      createIcons()
    }

    // Show modal
    modal.classList.remove('hidden')

    // Bind form events
    const form = document.getElementById('create-payment-method-form')
    const closeBtn = document.getElementById('close-create-modal-btn')
    const cancelBtn = document.getElementById('cancel-create-btn')
    const submitBtn = document.getElementById('submit-create-btn')

    const closeModal = () => {
      modal.classList.add('hidden')
    }

    if (form) {
      form.onsubmit = async e => {
        e.preventDefault()

        try {
          // Disable submit button
          if (submitBtn) {
            submitBtn.disabled = true
            submitBtn.innerHTML = `
              <i data-lucide="loader" class="h-5 w-5 animate-spin"></i>
              <span>Creando...</span>
            `
            createIcons()
          }

          // Get form data
          const formData = new FormData(form)
          const paymentMethodData = {
            name: formData.get('name'),
            type: formData.get('type'),
            description: formData.get('description') || null,
            account_info: formData.get('account_info') || null,
            display_order: formData.get('display_order')
              ? parseInt(formData.get('display_order'), 10)
              : 0,
            is_active: formData.get('is_active') === 'on'
          }

          // Create payment method
          await api.createPaymentmethods(paymentMethodData)

          toast.success('Método de pago creado exitosamente')
          closeModal()
          await this.loadPaymentMethods()
        } catch (error) {
          console.error('Error creating payment method:', error)
          toast.error('Error al crear el método de pago: ' + error.message)
        } finally {
          // Re-enable submit button
          if (submitBtn) {
            submitBtn.disabled = false
            submitBtn.innerHTML = `
              <span>Crear Método de Pago</span>
            `
            createIcons()
          }
        }
      }
    }

    if (closeBtn) {
      closeBtn.onclick = closeModal
    }
    if (cancelBtn) {
      cancelBtn.onclick = closeModal
    }
  }

  /**
   * Show edit payment method modal
   * @param {number} id - Payment method ID
   */
  async showEditModal(id) {
    try {
      // Get payment method data
      const result = await api.getPaymentmethodsById(id)
      const paymentMethod = result.data

      // Create modal container
      const modalId = 'edit-payment-method-modal'
      let modal = document.getElementById(modalId)

      if (!modal) {
        modal = document.createElement('div')
        modal.id = modalId
        modal.className = 'fixed inset-0 z-50 overflow-y-auto hidden'
        modal.innerHTML = `
          <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          <div class="flex items-center justify-center min-h-screen p-4">
            <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
              <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-bold text-gray-900">Editar Método de Pago</h3>
                  <button 
                    id="close-edit-modal-btn"
                    class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    type="button"
                  >
                    <i data-lucide="x" class="h-5 w-5 text-gray-500"></i>
                  </button>
                </div>
                
                <form id="edit-payment-method-form" class="space-y-4">
                  <input type="hidden" name="id" value="${id}" />
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                    <input
                      type="text"
                      name="name"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Banco Mercantil"
                      required
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                    <select
                      name="type"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      required
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="bank_transfer">Transferencia Bancaria</option>
                      <option value="mobile_payment">Pago Móvil</option>
                      <option value="cash">Efectivo</option>
                      <option value="crypto">Criptomonedas</option>
                      <option value="international">Internacional</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      name="description"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="Transferencias desde Banco Mercantil"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Información de cuenta</label>
                    <input
                      type="text"
                      name="account_info"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="0105-1234-5678-9012"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Orden de visualización</label>
                    <input
                      type="number"
                      name="display_order"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      placeholder="0"
                    />
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="edit-active-checkbox"
                      class="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    />
                    <label for="edit-active-checkbox" class="ml-2 block text-sm text-gray-700">
                      Activo
                    </label>
                  </div>
                  
                  <div class="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      id="cancel-edit-btn"
                      class="btn btn-secondary"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      id="submit-edit-btn"
                      class="btn btn-primary flex items-center space-x-2"
                    >
                      <span>Guardar Cambios</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        `

        document.body.appendChild(modal)
        createIcons()
      }

      // Populate form with existing data
      const form = document.getElementById('edit-payment-method-form')
      if (form) {
        form.querySelector('[name="name"]').value = paymentMethod.name || ''
        form.querySelector('[name="type"]').value = paymentMethod.type || ''
        form.querySelector('[name="description"]').value = paymentMethod.description || ''
        form.querySelector('[name="account_info"]').value = paymentMethod.account_info || ''
        form.querySelector('[name="display_order"]').value = paymentMethod.display_order || 0
        form.querySelector('[name="is_active"]').checked = paymentMethod.is_active || false
      }

      // Show modal
      modal.classList.remove('hidden')

      // Bind form events
      const closeBtn = document.getElementById('close-edit-modal-btn')
      const cancelBtn = document.getElementById('cancel-edit-btn')
      const submitBtn = document.getElementById('submit-edit-btn')

      const closeModal = () => {
        modal.classList.add('hidden')
      }

      if (form) {
        form.onsubmit = async e => {
          e.preventDefault()

          try {
            // Disable submit button
            if (submitBtn) {
              submitBtn.disabled = true
              submitBtn.innerHTML = `
                <i data-lucide="loader" class="h-5 w-5 animate-spin"></i>
                <span>Guardando...</span>
              `
              createIcons()
            }

            // Get form data
            const formData = new FormData(form)
            const paymentMethodData = {
              name: formData.get('name'),
              type: formData.get('type'),
              description: formData.get('description') || null,
              account_info: formData.get('account_info') || null,
              display_order: formData.get('display_order')
                ? parseInt(formData.get('display_order'), 10)
                : 0,
              is_active: formData.get('is_active') === 'on'
            }

            // Update payment method
            await api.updatePaymentmethods(id, paymentMethodData)

            toast.success('Método de pago actualizado exitosamente')
            closeModal()
            await this.loadPaymentMethods()
          } catch (error) {
            console.error('Error updating payment method:', error)
            toast.error('Error al actualizar el método de pago: ' + error.message)
          } finally {
            // Re-enable submit button
            if (submitBtn) {
              submitBtn.disabled = false
              submitBtn.innerHTML = `
                <span>Guardar Cambios</span>
              `
              createIcons()
            }
          }
        }
      }

      if (closeBtn) {
        closeBtn.onclick = closeModal
      }
      if (cancelBtn) {
        cancelBtn.onclick = closeModal
      }
    } catch (error) {
      console.error('Error loading payment method for edit:', error)
      toast.error('Error al cargar el método de pago para edición')
    }
  }

  /**
   * Deactivate payment method
   * @param {number} id - Payment method ID
   */
  async deactivatePaymentMethod(id) {
    if (!confirm('¿Está seguro que desea desactivar este método de pago?')) {
      return
    }

    try {
      await api.deletePaymentmethods(id)
      toast.success('Método de pago desactivado exitosamente')
      await this.loadPaymentMethods()
    } catch (error) {
      console.error('Error deactivating payment method:', error)
      toast.error('Error al desactivar el método de pago: ' + error.message)
    }
  }

  /**
   * Reactivate payment method
   * @param {number} id - Payment method ID
   */
  async reactivatePaymentMethod(id) {
    try {
      await api.reactivatePaymentMethods(id)
      toast.success('Método de pago reactivado exitosamente')
      await this.loadPaymentMethods()
    } catch (error) {
      console.error('Error reactivating payment method:', error)
      toast.error('Error al reactivar el método de pago: ' + error.message)
    }
  }

  /**
   * Destroy the payment method manager and clean up
   */
  destroy() {
    // Remove event listeners
    // Clean up DOM elements
    if (this.container) {
      this.container.innerHTML = ''
    }

    console.log('✅ PaymentMethodManager: Destroyed')
  }
}

/**
 * Initialize payment method manager
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Configuration options
 * @returns {PaymentMethodManager} The initialized PaymentMethodManager instance
 */
export function initPaymentMethodManager(containerId, options = {}) {
  try {
    const manager = new PaymentMethodManager(containerId, options)
    return manager
  } catch (error) {
    console.error('❌ Failed to initialize PaymentMethodManager:', error)
    throw error
  }
}

export default PaymentMethodManager
