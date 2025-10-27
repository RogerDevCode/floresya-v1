/**
 * Demo Scripts for MCP Integration
 * Externalized to avoid CSP issues
 */

// Import necessary modules
import { mcpService } from './services/mcpService.js'
import { FloresyaChatbot } from './components/mcp/floresyaChatbot.js'

/**
 * Initialize demo when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Iniciando demo de MCP Integration...')

  // Initialize UI elements
  initializeDemoControls()

  // Auto-start MCP connection
  setTimeout(() => {
    if (window.MCP_CONFIG) {
      initializeMCP()
    } else {
      console.log('⚠️ MCP_CONFIG no encontrado, inicialización manual requerida')
    }
  }, 1000)

  // Initialize chatbot
  initializeChatbot()
})

/**
 * Initialize demo control buttons
 */
function initializeDemoControls() {
  // Connect MCP Button
  const connectBtn = document.getElementById('connect-mcp')
  if (connectBtn) {
    connectBtn.addEventListener('click', initializeMCP)
  }

  // Test tools buttons
  const testButtons = document.querySelectorAll('[data-test-tool]')
  testButtons.forEach(button => {
    button.addEventListener('click', async e => {
      const tool = e.target.dataset.testTool
      await testMCPTool(tool)
    })
  })

  // Update status display
  updateStatus('ready', 'Listo para conectar con MCP')
}

/**
 * Initialize MCP connection
 */
async function initializeMCP() {
  try {
    console.log('🔌 Conectando con MCP...')
    updateStatus('connecting', 'Conectando con servidor MCP...')

    const config = window.MCP_CONFIG || {
      command: 'node',
      args: ['mcp-server-avanzado.js']
    }

    // Initialize MCP service
    await mcpService.initializeConnection('default', config)

    console.log('✅ Conectado exitosamente con MCP')
    updateStatus('connected', 'Conectado con MCP - Herramientas disponibles')

    // Get available tools
    const tools = await mcpService.getAvailableTools()
    displayAvailableTools(tools)

    // Enable test buttons
    enableTestButtons()
  } catch (error) {
    console.error('❌ Error conectando con MCP:', error)
    updateStatus('error', `Error: ${error.message}`)
  }
}

/**
 * Test specific MCP tool
 */
async function testMCPTool(toolName) {
  try {
    console.log(`🧪 Probando herramienta: ${toolName}`)

    const button = document.querySelector(`[data-test-tool="${toolName}"]`)
    if (button) {
      button.disabled = true
      button.textContent = 'Probando...'
      button.className = 'px-4 py-2 bg-yellow-500 text-white rounded-lg'
    }

    let result
    switch (toolName) {
      case 'recommend_flowers':
        result = await mcpService.executeTool('recommend_flowers', {
          occasion: 'aniversario',
          budget: 50,
          recipient: 'esposa',
          style: 'romántico'
        })
        break

      case 'florist_chat':
        result = await mcpService.executeTool('florist_chat', {
          question: '¿Qué flores duran más tiempo?',
          context: 'cuidados_flores'
        })
        break

      case 'analyze_sentiment':
        result = await mcpService.executeTool('analyze_sentiment', {
          text: 'Estoy muy feliz con mi compra, las flores son hermosas'
        })
        break

      case 'generate_content':
        result = await mcpService.executeTool('generate_content', {
          type: 'product_description',
          topic: 'Ramos de rosas rojas',
          tone: 'romántico'
        })
        break

      case 'search_products':
        result = await mcpService.executeTool('search_products', {
          query: 'rosas',
          category: 'flores',
          limit: 5
        })
        break

      default:
        throw new Error(`Herramienta no reconocida: ${toolName}`)
    }

    console.log(`✅ Resultado de ${toolName}:`, result)
    displayTestResult(toolName, result)

    if (button) {
      button.disabled = false
      button.textContent = `✅ ${toolName}`
      button.className = 'px-4 py-2 bg-green-500 text-white rounded-lg'
    }
  } catch (error) {
    console.error(`❌ Error probando ${toolName}:`, error)

    const button = document.querySelector(`[data-test-tool="${toolName}"]`)
    if (button) {
      button.disabled = false
      button.textContent = `❌ ${toolName}`
      button.className = 'px-4 py-2 bg-red-500 text-white rounded-lg'
    }

    displayTestResult(toolName, { error: error.message })
  }
}

/**
 * Display available tools
 */
function displayAvailableTools(tools) {
  const toolsContainer = document.getElementById('mcp-tools')
  if (!toolsContainer) {
    return
  }

  const toolsList = tools
    .map(
      tool => `
    <div class="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
      <h4 class="font-semibold text-white">${tool.name}</h4>
      <p class="text-sm text-white/80">${tool.description}</p>
    </div>
  `
    )
    .join('')

  toolsContainer.innerHTML = `
    <h3 class="text-xl font-bold text-white mb-4">🛠️ Herramientas MCP Disponibles</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${toolsList}
    </div>
  `
}

/**
 * Display test results
 */
function displayTestResult(toolName, result) {
  const resultsContainer = document.getElementById('test-results')
  if (!resultsContainer) {
    return
  }

  const resultDiv = document.createElement('div')
  resultDiv.className = 'bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-4'

  const content = result.error
    ? `<p class="text-red-300">❌ Error: ${result.error}</p>`
    : `<pre class="text-sm text-white/90 whitespace-pre-wrap">${JSON.stringify(result, null, 2)}</pre>`

  resultDiv.innerHTML = `
    <div class="flex items-center justify-between mb-2">
      <h4 class="font-semibold text-white">${toolName}</h4>
      <span class="text-xs text-white/60">${new Date().toLocaleTimeString()}</span>
    </div>
    ${content}
  `

  resultsContainer.insertBefore(resultDiv, resultsContainer.firstChild)

  // Keep only last 5 results
  while (resultsContainer.children.length > 5) {
    resultsContainer.removeChild(resultsContainer.lastChild)
  }
}

/**
 * Update status display
 */
function updateStatus(status, message) {
  const statusElement = document.getElementById('status-display')
  const statusText = document.getElementById('status-text')

  if (!statusElement || !statusText) {
    return
  }

  const statusConfig = {
    ready: { bg: 'bg-gray-500', icon: '⚪' },
    connecting: { bg: 'bg-yellow-500', icon: '🔄' },
    connected: { bg: 'bg-green-500', icon: '✅' },
    error: { bg: 'bg-red-500', icon: '❌' }
  }

  const config = statusConfig[status] || statusConfig.ready

  statusElement.className = `px-4 py-2 rounded-lg text-white font-semibold ${config.bg} flex items-center space-x-2`
  statusText.textContent = `${config.icon} ${message}`
}

/**
 * Enable test buttons
 */
function enableTestButtons() {
  const testButtons = document.querySelectorAll('[data-test-tool]')
  testButtons.forEach(button => {
    button.disabled = false
    button.className =
      'px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
  })
}

/**
 * Initialize chatbot
 */
function initializeChatbot() {
  try {
    // Create chatbot container if exists
    const chatbotContainer = document.getElementById('chatbot-container')
    if (chatbotContainer) {
      new FloresyaChatbot('chatbot-container')
      console.log('🤖 Chatbot inicializado')
    }
  } catch (error) {
    console.error('❌ Error inicializando chatbot:', error)
  }
}

/**
 * Demo data and helpers
 */
window.MCP_DEMO = {
  testMCPTool,
  initializeMCP,
  updateStatus,

  // Sample queries for testing
  sampleQueries: [
    '¿Qué flores me recomiendas para un aniversario?',
    '¿Cómo cuido mis rosas para que duren más?',
    '¿Tienen ramos de flores por menos de $30?',
    '¿Cuánto tiempo tarda la entrega a domicilio?',
    'Busca flores amarillas para el cumpleaños de mi mamá'
  ]
}

console.log('✅ Demo scripts cargados exitosamente')
