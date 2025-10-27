import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * MCP (Model Context Protocol) utility functions
 */

/**
 * Creates an MCP client connection
 * @param {Object} config - MCP configuration
 * @returns {Promise<Object>} MCP client instance
 */
export async function createMCPClient(config) {
  try {
    const { MCPClient } = await import('@modelcontextprotocol/sdk/client/index.js')
    const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js')

    const transport = new StdioClientTransport({
      command: config.command,
      args: config.args || []
    })

    const client = new MCPClient()
    await client.connect(transport)

    return client
  } catch (error) {
    console.error('Failed to create MCP client:', error)
    throw new Error(`MCP client creation failed: ${error.message}`)
  }
}

/**
 * Executes an MCP tool call
 * @param {Object} client - MCP client instance
 * @param {string} toolName - Name of the tool to call
 * @param {Object} arguments - Tool arguments
 * @returns {Promise<Object>} Tool execution result
 */
export async function executeMCPTool(client, toolName, args = {}) {
  try {
    const result = await client.callTool({
      name: toolName,
      arguments: args
    })

    return result
  } catch (error) {
    console.error(`Failed to execute MCP tool ${toolName}:`, error)
    throw new Error(`MCP tool execution failed: ${error.message}`)
  }
}

/**
 * Validates MCP configuration
 * @param {Object} config - MCP configuration object
 * @returns {boolean} True if configuration is valid
 */
export function validateMCPConfig(config) {
  if (!config || typeof config !== 'object') {
    return false
  }

  if (!config.command || typeof config.command !== 'string') {
    return false
  }

  return true
}
