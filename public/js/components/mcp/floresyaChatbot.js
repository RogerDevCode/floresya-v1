import { mcpService } from '../../services/mcpService.js'
import { createButton } from '../ui/button.js'

/**
 * Chatbot especializado para FloresYa con integración MCP
 */
export class FloresyaChatbot {
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    this.isOpen = false
    this.messages = []
    this.isTyping = false

    this.render()
    this.initializeEventListeners()
  }

  render() {
    // Crear el contenedor principal del chatbot
    this.chatWidget = document.createElement('div')
    this.chatWidget.className = 'fixed bottom-4 right-4 z-50'

    // Botón flotante para abrir/cerrar el chat
    this.chatButton = createButton({
      variant: 'default',
      className:
        'rounded-full w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg',
      children: `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
      `,
      onClick: () => this.toggleChat()
    })

    // Ventana del chat (inicialmente oculta)
    this.chatWindow = document.createElement('div')
    this.chatWindow.className =
      'hidden absolute bottom-16 right-0 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col'

    this.chatWindow.innerHTML = `
      <!-- Header del chat -->
      <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span class="text-sm">🌹</span>
          </div>
          <div>
            <div class="font-semibold">Asistente FloresYa</div>
            <div class="text-xs opacity-90">Experto en flores y regalos</div>
          </div>
        </div>
        <button id="close-chat" class="text-white/80 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Mensajes del chat -->
      <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <!-- Mensaje de bienvenida -->
        <div class="flex items-start space-x-2">
          <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-sm">🌹</span>
          </div>
          <div class="bg-white p-3 rounded-lg shadow-sm max-w-[80%]">
            <p class="text-sm">¡Hola! Soy tu asistente experto en FloresYa. 😊</p>
            <p class="text-sm mt-1">Puedo ayudarte a:</p>
            <ul class="text-sm mt-2 space-y-1">
              <li>🎯 Recomendar flores perfectas para tu ocasión</li>
              <li>💬 Responder preguntas sobre cuidados de flores</li>
              <li>📊 Mostrar información de productos</li>
              <li>🎁 Sugerir regalos personalizados</li>
            </ul>
            <p class="text-sm mt-2 font-semibold">¿En qué puedo ayudarte hoy?</p>
          </div>
        </div>
      </div>

      <!-- Área de escritura -->
      <div class="border-t p-4 bg-white rounded-b-lg">
        <div class="flex space-x-2">
          <input
            type="text"
            id="chat-input"
            placeholder="Escribe tu mensaje..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          />
          <button id="send-message" class="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
            </svg>
          </button>
        </div>

        <!-- Acciones rápidas -->
        <div class="mt-3 flex flex-wrap gap-2">
          <button class="quick-action text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors" data-action="recommend">
            🌹 Recomendaciones
          </button>
          <button class="quick-action text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors" data-action="cuidados">
            💧 Cuidados
          </button>
          <button class="quick-action text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors" data-action="precios">
            💰 Precios
          </button>
          <button class="quick-action text-xs bg-gray-100 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors" data-action="entrega">
            📦 Entrega
          </button>
        </div>
      </div>
    `

    this.chatWidget.appendChild(this.chatButton)
    this.chatWidget.appendChild(this.chatWindow)
    this.container.appendChild(this.chatWidget)
  }

  initializeEventListeners() {
    // Toggle chat
    this.chatButton.addEventListener('click', () => this.toggleChat())

    // Close chat
    const closeBtn = this.chatWindow.querySelector('#close-chat')
    closeBtn.addEventListener('click', () => this.toggleChat())

    // Send message
    const sendBtn = this.chatWindow.querySelector('#send-message')
    const input = this.chatWindow.querySelector('#chat-input')

    sendBtn.addEventListener('click', () => this.sendMessage())
    input.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        this.sendMessage()
      }
    })

    // Quick actions
    const quickActions = this.chatWindow.querySelectorAll('.quick-action')
    quickActions.forEach(btn => {
      btn.addEventListener('click', e => {
        const action = e.target.dataset.action
        this.handleQuickAction(action)
      })
    })
  }

  toggleChat() {
    this.isOpen = !this.isOpen
    const chatWindow = this.chatWindow

    if (this.isOpen) {
      chatWindow.classList.remove('hidden')
      this.chatButton.classList.add('scale-0')
      // Focus en el input
      setTimeout(() => {
        const input = chatWindow.querySelector('#chat-input')
        input.focus()
      }, 300)
    } else {
      chatWindow.classList.add('hidden')
      this.chatButton.classList.remove('scale-0')
    }
  }

  async sendMessage() {
    const input = this.chatWindow.querySelector('#chat-input')
    const message = input.value.trim()

    if (!message || this.isTyping) {
      return
    }

    // Agregar mensaje del usuario
    this.addMessage(message, 'user')
    input.value = ''

    // Mostrar indicador de escritura
    this.showTypingIndicator()

    try {
      // Procesar mensaje con MCP
      const response = await this.processMessageWithMCP(message)
      this.addMessage(response, 'assistant')
    } catch (error) {
      console.error('Error processing message:', error)
      this.addMessage(
        'Lo siento, estoy teniendo dificultades para responder. Por favor, intenta de nuevo.',
        'assistant'
      )
    } finally {
      this.hideTypingIndicator()
    }
  }

  async processMessageWithMCP(message) {
    const lowerMessage = message.toLowerCase()

    // Detectar intención y usar herramienta MCP apropiada
    if (
      lowerMessage.includes('recomienda') ||
      lowerMessage.includes('sugiere') ||
      lowerMessage.includes('qué flores')
    ) {
      return await this.getRecommendation(message)
    } else if (
      lowerMessage.includes('cuidado') ||
      lowerMessage.includes('durar') ||
      lowerMessage.includes('mantener')
    ) {
      return await this.getCareAdvice(message)
    } else if (
      lowerMessage.includes('precio') ||
      lowerMessage.includes('cuánto cuesta') ||
      lowerMessage.includes('costo')
    ) {
      return await this.getProductInfo(message)
    } else if (
      lowerMessage.includes('entrega') ||
      lowerMessage.includes('envío') ||
      lowerMessage.includes('cuándo llega')
    ) {
      return this.getDeliveryInfo()
    } else if (
      lowerMessage.includes('buscar') ||
      lowerMessage.includes('quiero') ||
      lowerMessage.includes('hay')
    ) {
      return await this.searchProducts(message)
    } else {
      // Chat general
      return await this.getFloristAdvice(message)
    }
  }

  async getRecommendation(message) {
    try {
      const result = await mcpService.executeTool('recommend_flowers', {
        occasion: this.extractOccasion(message),
        budget: this.extractBudget(message),
        recipient: this.extractRecipient(message),
        style: this.extractStyle(message)
      })

      return result.content[0].text
    } catch (error) {
      console.error('[Chatbot] getProductRecommendations failed:', {
        message: message.substring(0, 100),
        error: error.message,
        stack: error.stack
      })
      return 'Para darte la mejor recomendación, cuéntame: ¿Para qué ocasión son las flores? ¿Cuál es tu presupuesto aproximado? ¿Quién las recibirá?'
    }
  }

  async getCareAdvice(message) {
    try {
      const result = await mcpService.executeTool('florist_chat', {
        question: message,
        context: 'cuidados_flores'
      })

      return result.content[0].text
    } catch (error) {
      console.error('[Chatbot] getCareAdvice failed:', {
        message: message.substring(0, 100),
        error: error.message,
        stack: error.stack
      })
      return 'Para mantener tus flores frescas más tiempo: corta los tallos en diagonal, cambia el agua cada 2 días, y mantenlas alejadas del sol directo y frutas. ¿Necesitas consejos para algún tipo de flor específica?'
    }
  }

  async getProductInfo(message) {
    try {
      const result = await mcpService.executeTool('search_products', {
        query: message
      })

      return result.content[0].text
    } catch (error) {
      console.error('[Chatbot] getProductInfo failed:', {
        message: message.substring(0, 100),
        error: error.message,
        stack: error.stack
      })
      return 'Puedo ayudarte a encontrar productos y sus precios. ¿Qué tipo de flores estás buscando? Tienes en mente algún presupuesto específico?'
    }
  }

  async searchProducts(message) {
    try {
      const result = await mcpService.executeTool('search_products', {
        query: message
      })

      return result.content[0].text
    } catch (error) {
      console.error('[Chatbot] searchProducts failed:', {
        message: message.substring(0, 100),
        error: error.message,
        stack: error.stack
      })
      return 'Déjame buscar en nuestro catálogo. ¿Qué tipo de flores o arreglos te interesan?'
    }
  }

  async getFloristAdvice(message) {
    try {
      const result = await mcpService.executeTool('florist_chat', {
        question: message,
        context: 'consulta_general'
      })

      return result.content[0].text
    } catch (error) {
      console.error('[Chatbot] getFloristAdvice failed:', {
        message: message.substring(0, 100),
        error: error.message,
        stack: error.stack
      })
      return 'Como experta en flores, puedo ayudarte a encontrar el regalo perfecto. ¿Tienes alguna ocasión especial en mente o te gustaría ver nuestras opciones más populares?'
    }
  }

  getDeliveryInfo() {
    return '📦 **Información de Entrega:**\n\n• **Entrega misma día:** Ordenes antes de 2 PM\n• **Horario:** 9 AM - 8 PM\n• **Costo:** Gratis en compras mayores a $50\n• **Zonas:** Cubrimos toda la ciudad\n• **Seguimiento:** Recibirás enlace de seguimiento por email\n\n¿Necesitas entrega para una fecha específica?'
  }

  handleQuickAction(action) {
    const actions = {
      recommend: '¿Qué flores me recomiendas para un aniversario?',
      cuidados: '¿Cómo puedo hacer que mis flores duren más?',
      precios: '¿Cuáles son los productos más populares y sus precios?',
      entrega: '¿Cómo funciona la entrega a domicilio?'
    }

    const input = this.chatWindow.querySelector('#chat-input')
    input.value = actions[action]
    this.sendMessage()
  }

  addMessage(text, sender) {
    const messagesContainer = this.chatWindow.querySelector('#chat-messages')
    const messageDiv = document.createElement('div')

    if (sender === 'user') {
      messageDiv.className = 'flex items-start space-x-2 justify-end'
      messageDiv.innerHTML = `
        <div class="bg-purple-600 text-white p-3 rounded-lg max-w-[80%]">
          <p class="text-sm">${text}</p>
        </div>
        <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
      `
    } else {
      messageDiv.className = 'flex items-start space-x-2'
      messageDiv.innerHTML = `
        <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-sm">🌹</span>
        </div>
        <div class="bg-white p-3 rounded-lg shadow-sm max-w-[80%]">
          <div class="text-sm">${this.formatMessage(text)}</div>
        </div>
      `
    }

    messagesContainer.appendChild(messageDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight

    this.messages.push({ text, sender, timestamp: new Date() })
  }

  showTypingIndicator() {
    this.isTyping = true
    const messagesContainer = this.chatWindow.querySelector('#chat-messages')

    const typingDiv = document.createElement('div')
    typingDiv.id = 'typing-indicator'
    typingDiv.className = 'flex items-start space-x-2'
    typingDiv.innerHTML = `
      <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span class="text-sm">🌹</span>
      </div>
      <div class="bg-white p-3 rounded-lg shadow-sm">
        <div class="flex space-x-1">
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
          <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
        </div>
      </div>
    `

    messagesContainer.appendChild(typingDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  hideTypingIndicator() {
    this.isTyping = false
    const typingIndicator = this.chatWindow.querySelector('#typing-indicator')
    if (typingIndicator) {
      typingIndicator.remove()
    }
  }

  formatMessage(text) {
    // Convertir formato markdown a HTML simple
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .replace(/• (.*?)(<br>|$)/g, '<li>$1</li>')
      .replace(/<li>/g, '<ul class="list-disc list-inside"><li>')
      .replace(/<\/li><br>/g, '</li></ul><br>')
      .replace(/<\/li>$/, '</li></ul>')
  }

  // Métodos de extracción de información del mensaje
  extractOccasion(message) {
    const occasions = [
      'aniversario',
      'cumpleaños',
      'matrimonio',
      'maternidad',
      'agradecimiento',
      'disculpas',
      'san valentín'
    ]
    for (const occasion of occasions) {
      if (message.toLowerCase().includes(occasion)) {
        return occasion
      }
    }
    return 'general'
  }

  extractBudget(message) {
    const match = message.match(/\$(\d+)/)
    return match ? parseInt(match[1]) : 100
  }

  extractRecipient(message) {
    const recipients = ['mamá', 'esposa', 'novia', 'amiga', 'hermana', 'madre', 'pareja']
    for (const recipient of recipients) {
      if (message.toLowerCase().includes(recipient)) {
        return recipient
      }
    }
    return 'especial'
  }

  extractStyle(message) {
    const styles = ['romántico', 'elegante', 'moderno', 'casual', 'clásico', 'exótico']
    for (const style of styles) {
      if (message.toLowerCase().includes(style)) {
        return style
      }
    }
    return 'romántico'
  }
}
