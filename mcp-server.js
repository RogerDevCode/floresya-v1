#!/usr/bin/env node

/**
 * Simple MCP Server for testing shadcn + MCP integration
 * This is a basic implementation that demonstrates the MCP protocol
 */

const readline = require('readline')

class SimpleMCPServer {
  constructor() {
    this.tools = [
      {
        name: 'echo',
        description: 'Echo back the input text',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Text to echo back'
            }
          },
          required: ['text']
        }
      },
      {
        name: 'add_numbers',
        description: 'Add two numbers together',
        inputSchema: {
          type: 'object',
          properties: {
            a: {
              type: 'number',
              description: 'First number'
            },
            b: {
              type: 'number',
              description: 'Second number'
            }
          },
          required: ['a', 'b']
        }
      },
      {
        name: 'get_time',
        description: 'Get current server time',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'generate_uuid',
        description: 'Generate a random UUID',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      }
    ]

    this.setupStdio()
  }

  setupStdio() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    })

    this.rl.on('line', line => {
      try {
        const message = JSON.parse(line)
        this.handleMessage(message)
      } catch (error) {
        this.sendError('Invalid JSON', error)
      }
    })

    process.on('SIGINT', () => {
      this.rl.close()
      process.exit(0)
    })
  }

  handleMessage(message) {
    const { id, method, params } = message

    switch (method) {
      case 'initialize':
        this.sendResponse(id, {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'Simple Test Server',
            version: '1.0.0'
          }
        })
        break

      case 'tools/list':
        this.sendResponse(id, { tools: this.tools })
        break

      case 'tools/call':
        this.handleToolCall(id, params)
        break

      default:
        this.sendError(id, `Unknown method: ${method}`)
    }
  }

  handleToolCall(id, params) {
    const { name, arguments: args } = params

    switch (name) {
      case 'echo':
        this.sendResponse(id, {
          content: [
            {
              type: 'text',
              text: `Echo: ${args.text}`
            }
          ]
        })
        break

      case 'add_numbers': {
        const result = args.a + args.b
        this.sendResponse(id, {
          content: [
            {
              type: 'text',
              text: `${args.a} + ${args.b} = ${result}`
            }
          ]
        })
        break
      }

      case 'get_time': {
        const now = new Date()
        this.sendResponse(id, {
          content: [
            {
              type: 'text',
              text: `Current time: ${now.toISOString()}`
            }
          ]
        })
        break
      }

      case 'generate_uuid': {
        const uuid = this.generateUUID()
        this.sendResponse(id, {
          content: [
            {
              type: 'text',
              text: `Generated UUID: ${uuid}`
            }
          ]
        })
        break
      }

      default:
        this.sendError(id, `Unknown tool: ${name}`)
    }
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  sendResponse(id, result) {
    const response = {
      jsonrpc: '2.0',
      id,
      result
    }
    console.log(JSON.stringify(response))
  }

  sendError(id, message, data = null) {
    const error = {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32603,
        message,
        ...(data && { data })
      }
    }
    console.log(JSON.stringify(error))
  }
}

// Start the server
new SimpleMCPServer()
console.error('Simple MCP Server started')
