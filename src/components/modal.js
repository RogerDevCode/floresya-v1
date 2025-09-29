/**
 * Modal Component
 * Reusable modal component for dialogs
 */

export class Modal {
  constructor(id) {
    this.id = id
    this.isOpen = false
  }

  render(title, content, showCloseButton = true) {
    return `
      <div id="${this.id}" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <!-- Header -->
          <div class="flex justify-between items-center p-6 border-b border-blush-200">
            <h2 class="text-2xl font-bold text-forest-900">${title}</h2>
            ${showCloseButton ? `
              <button id="${this.id}CloseBtn" class="p-2 hover:bg-blush-100 rounded-full transition-colors">
                <i data-lucide="x" class="h-6 w-6 text-forest-700"></i>
              </button>
            ` : ''}
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            ${content}
          </div>
        </div>
      </div>
    `
  }

  open() {
    const modalEl = document.getElementById(this.id)
    if (modalEl) {
      modalEl.classList.remove('hidden')
      modalEl.classList.add('flex')
      this.isOpen = true
      document.body.style.overflow = 'hidden'
    }
  }

  close() {
    const modalEl = document.getElementById(this.id)
    if (modalEl) {
      modalEl.classList.add('hidden')
      modalEl.classList.remove('flex')
      this.isOpen = false
      document.body.style.overflow = ''
    }
  }

  bindEvents() {
    const modalEl = document.getElementById(this.id)
    const closeBtn = document.getElementById(`${this.id}CloseBtn`)

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close())
    }

    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target.id === this.id) {
          this.close()
        }
      })
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close()
      }
    })
  }
}