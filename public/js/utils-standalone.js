/**
 * Standalone utilities for shadcn/ui components
 * Browser-compatible version without external dependencies
 */

/**
 * Utility function to construct className strings conditionally
 * Alternative to clsx library for browser compatibility
 */
export function cn(...inputs) {
  const classes = []

  for (const input of inputs) {
    if (!input) {
      continue
    }

    if (typeof input === 'string') {
      classes.push(input.trim())
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key)
        }
      }
    }
  }

  // Remove duplicates and join
  return [...new Set(classes)].join(' ')
}

/**
 * Simple variant mapping for buttons
 */
export const buttonVariants = {
  default:
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90',
  destructive:
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline:
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary:
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost:
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground',
  link: 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary underline-offset-4 hover:underline'
}

export const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10'
}

/**
 * Simple MCP client simulation for demo purposes
 * This simulates MCP responses without actual server connection
 */
class MockMCPService {
  constructor() {
    this.connected = false
    this.tools = [
      {
        name: 'recommend_flowers',
        description: 'Recomienda flores basadas en ocasión, presupuesto y estilo'
      },
      {
        name: 'florist_chat',
        description: 'Chat con experto florista para dudas y consejos'
      },
      {
        name: 'analyze_sentiment',
        description: 'Analiza el sentimiento del texto de clientes'
      },
      {
        name: 'generate_content',
        description: 'Genera contenido para productos con IA'
      },
      {
        name: 'search_products',
        description: 'Busca productos en el catálogo'
      },
      {
        name: 'predict_sales',
        description: 'Predice ventas basadas en datos históricos'
      },
      {
        name: 'optimize_price',
        description: 'Optimiza precios dinámicamente'
      },
      {
        name: 'get_analytics',
        description: 'Obtiene métricas y análisis avanzados'
      }
    ]
  }

  async initializeConnection(name, config) {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`Mock MCP service connected with config:`, config)
    this.connected = true
    this.connectionName = name
    return true
  }

  closeConnection(name = 'default') {
    if (this.connectionName === name) {
      this.connected = false
      this.connectionName = null
    }
    return true
  }

  getAvailableTools() {
    if (!this.connected) {
      throw new Error('Not connected to MCP server')
    }
    return this.tools
  }

  async executeTool(toolName, args) {
    if (!this.connected) {
      throw new Error('Not connected to MCP server')
    }

    // Simulate tool execution delay
    await new Promise(resolve => setTimeout(resolve, 800))

    switch (toolName) {
      case 'recommend_flowers':
        return {
          content: [
            {
              type: 'text',
              text: `Para tu ${args.occasion || 'ocasión especial'} con presupuesto de $${args.budget || 50}, te recomiendo:

🌹 **Ramo Clásico de Rosas Rojas**
- 12 rosas frescas importadas
- Hojas verdes decorativas
- Papel de seda premium
- Precio: $45

💐 **Alternativa Elegante**
- Lirios y alstroemerias
- Colores vibrantes y duraderos
- Ideal para regalar sorpresa
- Precio: $35

💡 **Consejo del experto**: Las rosas rojas simbolizan el amor y pasión, perfectas para aniversarios.`
            }
          ]
        }

      case 'florist_chat':
        return {
          content: [
            {
              type: 'text',
              text: `🌸 **Respuesta de Experto Florista**:

${args.question || '¿Cómo puedo ayudarte con flores?'}

💧 **Cuidados Esenciales**:
- Corta los tallos en diagonal al recibir
- Cambia el agua cada 2 días
- Mantén alejadas del sol directo
- Añade nutriente floral cada cambio de agua

🌺 **Duración Aproximada**:
- Rosas: 7-10 días
- Tulipanes: 5-7 días
- Lirios: 10-14 días
- Orquídeas: 2-3 semanas

¿Necesitas consejos para algún tipo de flor específica?`
            }
          ]
        }

      case 'analyze_sentiment':
        return {
          content: [
            {
              type: 'text',
              text: `🧠 **Análisis de Sentimiento**:

**Texto**: "${args.text || 'Texto de ejemplo'}"

**Resultados**:
- 😊 **Sentimiento Positivo**: 85%
- 😐 **Neutral**: 10%
- 😔 **Negativo**: 5%

**Emociones Detectadas**:
- Felicidad: 60%
- Satisfacción: 25%
- Emoción: 15%

**Palabras Clave**: feliz, hermosas, excelente, compra

**Recomendación**: Cliente satisfecho, ideal para programa de fidelización.`
            }
          ]
        }

      case 'generate_content':
        return {
          content: [
            {
              type: 'text',
              text: `✍️ **Contenido Generado**:

**Título**: ${args.topic || 'Ramos de Rosas Elegantes'}

**Descripción Corta**:
Descubre la belleza atemporal de nuestros exquisitos ramos de rosas. Cada flor es seleccionada a mano para garantizar la máxima frescura y duración.

**Descripción Larga**:
Sumérgete en un mundo de elegancia y romanticismo con nuestros impresionantes ramos de rosas. Perfectamente combinadas por nuestros expertos floristas, cada creación cuenta una historia única de amor y aprecio.

**Características**:
- ✅ Rosas premium de la más alta calidad
- ✅ Diseño profesional y elegante
- ✅ Duración extendida con cuidados especiales
- ✅ Entrega el mismo día disponible

**Llamada a la Acción**:
Ordena ahora y sorprende a esa persona especial con un regalo que perdurará en su memoria.`
            }
          ]
        }

      case 'search_products':
        return {
          content: [
            {
              type: 'text',
              text: `🔍 **Resultados de Búsqueda**:

**Query**: "${args.query || 'rosas'}"
**Categoría**: ${args.category || 'flores'}

**Productos Encontrados** (${args.limit || 5} resultados):

1. 🌹 **Ramo de Rosas Rojas Clásico** - $45
   12 rosas rojas frescas con follaje verde

2. 🌸 **Ramo de Rosas Multicolor** - $55
   Mezcla vibrante de rosas de diferentes colores

3. 💐 **Ramo de Rosas Blancas Elegantes** - $50
   Rosas blancas premium con baby's breath

4. 🌺 **Mini Ramo de Rosas** - $25
   6 rosas perfectas para regalo pequeño

5. 💝 **Ramo de Rosas con Chocolates** - $65
   Combinación perfecta de flores y dulces

**Total encontrado**: 24 productos
¿Necesitas filtrar por precio u ocasión?`
            }
          ]
        }

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Herramienta "${toolName}" ejecutada con éxito.

**Parámetros recibidos**:
${JSON.stringify(args, null, 2)}

Esta es una respuesta simulada para demostración.`
            }
          ]
        }
    }
  }

  isConnected() {
    return this.connected
  }
}

// Export mock service for demo
export const mcpService = new MockMCPService()

console.log('✅ Standalone utilities loaded successfully')
