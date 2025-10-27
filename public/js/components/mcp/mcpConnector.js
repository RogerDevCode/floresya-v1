import { mcpService } from '../../services/mcpService.js'
import { createButton } from '../ui/button.js'
import { createCard, createCardHeader, createCardTitle, createCardContent } from '../ui/card.js'

/**
 * MCP Connector Component - UI for managing MCP connections
 */
export class MCPConnector {
  constructor(containerId) {
    this.container = document.getElementById(containerId)
    this.isConnected = false
    this.currentConnection = null
    this.render()
  }

  render() {
    const card = createCard({
      className: 'w-full max-w-md mx-auto'
    })

    const header = createCardHeader()
    const title = createCardTitle('MCP Connection')
    header.appendChild(title)

    const content = createCardContent()
    content.innerHTML = `
      <div class="space-y-4">
        <div class="text-sm text-muted-foreground">
          Connect to Model Context Protocol server for AI-powered features
        </div>
        <div class="space-y-2">
          <label for="mcp-command" class="text-sm font-medium">Command</label>
          <input
            type="text"
            id="mcp-command"
            class="w-full p-2 border rounded-md"
            value="node"
            placeholder="Server command"
          />
        </div>
        <div class="space-y-2">
          <label for="mcp-args" class="text-sm font-medium">Arguments</label>
          <input
            type="text"
            id="mcp-args"
            class="w-full p-2 border rounded-md"
            placeholder="Command arguments (space separated)"
          />
        </div>
        <div class="flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-gray-300" id="status-indicator"></div>
          <span class="text-sm" id="status-text">Disconnected</span>
        </div>
        <div id="tools-list" class="hidden">
          <div class="text-sm font-medium mb-2">Available Tools:</div>
          <div id="tools-container" class="space-y-1 max-h-32 overflow-y-auto"></div>
        </div>
      </div>
    `

    const footer = document.createElement('div')
    footer.className = 'flex space-x-2'

    const connectBtn = createButton({
      variant: 'default',
      children: this.isConnected ? 'Disconnect' : 'Connect',
      onClick: () => this.toggleConnection()
    })

    const testBtn = createButton({
      variant: 'outline',
      children: 'Test Connection',
      onClick: () => this.testConnection(),
      disabled: !this.isConnected
    })

    footer.appendChild(connectBtn)
    footer.appendChild(testBtn)

    card.appendChild(header)
    card.appendChild(content)
    card.appendChild(footer)

    this.container.innerHTML = ''
    this.container.appendChild(card)

    // Store references
    this.elements = {
      commandInput: content.querySelector('#mcp-command'),
      argsInput: content.querySelector('#mcp-args'),
      statusIndicator: content.querySelector('#status-indicator'),
      statusText: content.querySelector('#status-text'),
      toolsList: content.querySelector('#tools-list'),
      toolsContainer: content.querySelector('#tools-container'),
      connectBtn: connectBtn
    }
  }

  async toggleConnection() {
    if (this.isConnected) {
      await this.disconnect()
    } else {
      await this.connect()
    }
  }

  async connect() {
    try {
      const command = this.elements.commandInput.value.trim()
      const args = this.elements.argsInput.value
        .trim()
        .split(' ')
        .filter(arg => arg.length > 0)

      if (!command) {
        this.showError('Please enter a command')
        return
      }

      this.updateStatus('Connecting...', 'yellow')
      this.elements.connectBtn.disabled = true

      const success = await mcpService.initializeConnection('default', {
        command,
        args
      })

      if (success) {
        this.isConnected = true
        this.updateStatus('Connected', 'green')
        this.elements.connectBtn.textContent = 'Disconnect'
        this.elements.connectBtn.disabled = false
        await this.loadAvailableTools()
      } else {
        this.showError('Failed to connect to MCP server')
      }
    } catch (error) {
      this.showError(`Connection failed: ${error.message}`)
    } finally {
      this.elements.connectBtn.disabled = false
    }
  }

  async disconnect() {
    try {
      await mcpService.closeConnection('default')
      this.isConnected = false
      this.updateStatus('Disconnected', 'gray')
      this.elements.connectBtn.textContent = 'Connect'
      this.elements.toolsList.classList.add('hidden')
    } catch (error) {
      this.showError(`Disconnect failed: ${error.message}`)
    }
  }

  async loadAvailableTools() {
    try {
      const tools = await mcpService.getAvailableTools()

      if (tools.length > 0) {
        this.elements.toolsContainer.innerHTML = tools
          .map(tool => `<div class="text-xs p-1 bg-muted rounded">${tool.name}</div>`)
          .join('')
        this.elements.toolsList.classList.remove('hidden')
      }
    } catch (error) {
      console.error('Failed to load tools:', error)
    }
  }

  async testConnection() {
    try {
      const tools = await mcpService.getAvailableTools()
      if (tools.length > 0) {
        this.showSuccess(`Connection working! Found ${tools.length} available tools`)
      } else {
        this.showError('Connected but no tools available')
      }
    } catch (error) {
      this.showError(`Test failed: ${error.message}`)
    }
  }

  updateStatus(text, color) {
    this.elements.statusText.textContent = text
    const colorMap = {
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      gray: 'bg-gray-300'
    }

    this.elements.statusIndicator.className = `w-3 h-3 rounded-full ${colorMap[color] || 'bg-gray-300'}`
  }

  showError(message) {
    this.updateStatus(message, 'red')
    setTimeout(() => {
      if (this.isConnected) {
        this.updateStatus('Connected', 'green')
      } else {
        this.updateStatus('Disconnected', 'gray')
      }
    }, 3000)
  }

  showSuccess(message) {
    this.updateStatus(message, 'green')
    setTimeout(() => {
      this.updateStatus('Connected', 'green')
    }, 3000)
  }
}
