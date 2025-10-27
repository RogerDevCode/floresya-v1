import { createMCPClient, executeMCPTool, validateMCPConfig } from '../shared/utils.js'

/**
 * MCP Service for managing Model Context Protocol connections and operations
 */
class MCPService {
  constructor() {
    this.clients = new Map()
    this.defaultConfig = {
      command: 'node',
      args: ['mcp-server'],
      timeout: 30000
    }
  }

  /**
   * Initialize MCP connection with configuration
   * @param {string} name - Connection name
   * @param {Object} config - MCP configuration
   * @returns {Promise<boolean>} Success status
   */
  async initializeConnection(name = 'default', config = {}) {
    try {
      const finalConfig = { ...this.defaultConfig, ...config }

      if (!validateMCPConfig(finalConfig)) {
        throw new Error('Invalid MCP configuration')
      }

      const client = await createMCPClient(finalConfig)
      this.clients.set(name, client)

      console.log(`MCP connection '${name}' initialized successfully`)
      return true
    } catch (error) {
      console.error(`Failed to initialize MCP connection '${name}':`, error)
      return false
    }
  }

  /**
   * Execute a tool on connected MCP server
   * @param {string} toolName - Name of the tool to execute
   * @param {Object} args - Tool arguments
   * @param {string} connectionName - Connection name (default: 'default')
   * @returns {Promise<Object>} Tool execution result
   */
  async executeTool(toolName, args = {}, connectionName = 'default') {
    try {
      const client = this.clients.get(connectionName)

      if (!client) {
        throw new Error(`MCP connection '${connectionName}' not found`)
      }

      const result = await executeMCPTool(client, toolName, args)
      return result
    } catch (error) {
      console.error(`Failed to execute tool '${toolName}':`, error)
      throw error
    }
  }

  /**
   * Get available tools from MCP server
   * @param {string} connectionName - Connection name (default: 'default')
   * @returns {Promise<Array>} List of available tools
   */
  async getAvailableTools(connectionName = 'default') {
    try {
      const client = this.clients.get(connectionName)

      if (!client) {
        throw new Error(`MCP connection '${connectionName}' not found`)
      }

      const result = await client.listTools()
      return result.tools || []
    } catch (error) {
      console.error(`Failed to get available tools:`, error)
      return []
    }
  }

  /**
   * Close MCP connection
   * @param {string} connectionName - Connection name (default: 'default')
   * @returns {Promise<boolean>} Success status
   */
  async closeConnection(connectionName = 'default') {
    try {
      const client = this.clients.get(connectionName)

      if (client) {
        await client.close()
        this.clients.delete(connectionName)
        console.log(`MCP connection '${connectionName}' closed successfully`)
      }

      return true
    } catch (error) {
      console.error(`Failed to close MCP connection '${connectionName}':`, error)
      return false
    }
  }

  /**
   * Close all MCP connections
   * @returns {Promise<boolean>} Success status
   */
  async closeAllConnections() {
    try {
      const promises = Array.from(this.clients.keys()).map(name => this.closeConnection(name))

      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Failed to close all MCP connections:', error)
      return false
    }
  }

  /**
   * Check if connection is active
   * @param {string} connectionName - Connection name (default: 'default')
   * @returns {boolean} Connection status
   */
  isConnected(connectionName = 'default') {
    return this.clients.has(connectionName)
  }

  /**
   * Get connection status for all connections
   * @returns {Object} Connection status map
   */
  getConnectionStatus() {
    const status = {}
    for (const [name] of this.clients) {
      status[name] = true
    }
    return status
  }
}

// Create singleton instance
export const mcpService = new MCPService()

// Auto-initialize default connection if environment provides config
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    const mcpConfig = window.MCP_CONFIG
    if (mcpConfig) {
      await mcpService.initializeConnection('default', mcpConfig)
    }
  })
}
