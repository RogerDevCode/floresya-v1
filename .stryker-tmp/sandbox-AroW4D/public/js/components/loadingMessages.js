/**
 * FloresYa - Loading Messages System
 * Easter eggs con mensajes florales para estados de carga
 */
// @ts-nocheck

export class LoadingMessages {
  constructor() {
    this.messages = [
      '🌱 Plantando semillas digitales...',
      '💐 Preparando hermosas flores...',
      '🌻 Regando con amor...',
      '🌺 Haciendo florecer la magia...',
      '🌷 Cuidando nuestro jardín virtual...',
      '🌹 Cultivando belleza para ti...',
      '🌸 Floreciendo con cada pétalo...',
      '🌼 Dejando que crezca la felicidad...',
      '🌾 Recogiendo los mejores colores...',
      '🏵️ Preparando ramos de alegría...'
    ]

    this.lastMessageIndex = -1
  }

  /**
   * Obtiene un mensaje aleatorio que no sea el mismo que el anterior
   */
  getRandomMessage() {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.messages.length)
    } while (newIndex === this.lastMessageIndex && this.messages.length > 1)

    this.lastMessageIndex = newIndex
    return this.messages[newIndex]
  }

  /**
   * Aplica un mensaje floral a un elemento de carga
   */
  applyToElement(element) {
    if (!element) {
      return
    }

    const textElement = element.querySelector('p')
    if (textElement) {
      textElement.textContent = this.getRandomMessage()

      // Agregar una pequeña animación de entrada
      textElement.style.animation = 'fadeIn 0.5s ease-in'
      setTimeout(() => {
        textElement.style.animation = ''
      }, 500)
    }
  }

  /**
   * Inicializa todos los spinners de carga con mensajes florales
   */
  initAll() {
    const spinners = document.querySelectorAll('[id*="loading-spinner"], [class*="loading"]')
    spinners.forEach(spinner => this.applyToElement(spinner))
  }

  /**
   * Aplica mensaje a un contenedor específico por ID
   */
  applyToId(id) {
    const element = document.getElementById(id)
    if (element) {
      this.applyToElement(element)
    }
  }
}

// Instancia global para uso fácil
export const loadingMessages = new LoadingMessages()

/**
 * Auto-inicialización global para todos los estados de carga
 */
export function initGlobalLoadingMessages() {
  // Inicializar todos los spinners de carga existentes
  loadingMessages.initAll()

  // Observar cambios en el DOM para nuevos elementos de carga
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Buscar elementos de carga en el nuevo nodo
          const loadingElements =
            node.querySelectorAll?.('[id*="loading"], [class*="loading"]') || []
          loadingElements.forEach(element => {
            if (!element.dataset.floralInitialized) {
              loadingMessages.applyToElement(element)
              element.dataset.floralInitialized = 'true'
            }
          })

          // Si el nodo mismo es un elemento de carga
          if (
            (node.id?.includes('loading') || node.className?.includes('loading')) &&
            !node.dataset.floralInitialized
          ) {
            loadingMessages.applyToElement(node)
            node.dataset.floralInitialized = 'true'
          }
        }
      })
    })
  })

  // Observar todo el documento
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  console.log('🌸 Easter egg: Mensajes florales de carga inicializados globalmente')
}

// Auto-inicializar si el DOM ya está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGlobalLoadingMessages)
} else {
  initGlobalLoadingMessages()
}

// Exportación por defecto
export default loadingMessages
