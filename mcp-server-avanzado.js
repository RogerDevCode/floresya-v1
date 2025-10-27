#!/usr/bin/env node

/**
 * MCP Server Avanzado para FloresYa
 * Servidor especializado con tools de IA para eCommerce de flores
 */

import readline from 'readline'

class FloresyaMCPServer {
  constructor() {
    // Base de datos simulada de productos
    this.products = [
      { id: 1, name: 'Ramo Rosas Rojas', price: 59.99, category: 'romance', stock: 150 },
      { id: 2, name: 'Ramo de Orquídeas', price: 89.99, category: 'elegante', stock: 75 },
      { id: 3, name: 'Girasoles Felices', price: 45.99, category: 'alegria', stock: 200 },
      { id: 4, name: 'Lirios Blancos', price: 39.99, category: 'pureza', stock: 120 },
      { id: 5, name: 'Tulipanes Mixtos', price: 54.99, category: 'primavera', stock: 90 }
    ]

    // Analytics simulados
    this.analytics = {
      ventas_diarias: 1250,
      conversion_rate: 3.2,
      ticket_promedio: 78.5,
      productos_vendidos: 45
    }

    this.tools = [
      {
        name: 'recommend_flowers',
        description: 'Recomienda flores basadas en ocasión, presupuesto y preferencias',
        inputSchema: {
          type: 'object',
          properties: {
            occasion: {
              type: 'string',
              description: 'Ocasión (aniversario, cumpleaños, gracias, etc.)'
            },
            budget: { type: 'number', description: 'Presupuesto máximo' },
            recipient: { type: 'string', description: 'Destinatario (mamá, esposa, novia, amigo)' },
            style: {
              type: 'string',
              description: 'Estilo preferido (romántico, elegante, moderno, casual)'
            }
          },
          required: ['occasion', 'budget']
        }
      },
      {
        name: 'florist_chat',
        description: 'Asistente virtual experto en flores y cuidados',
        inputSchema: {
          type: 'object',
          properties: {
            question: { type: 'string', description: 'Pregunta del cliente' },
            context: { type: 'string', description: 'Contexto adicional' },
            product_id: { type: 'number', description: 'ID del producto si aplica' }
          },
          required: ['question']
        }
      },
      {
        name: 'analyze_sentiment',
        description: 'Analiza el sentimiento de reseñas y comentarios',
        inputSchema: {
          type: 'object',
          properties: {
            review: { type: 'string', description: 'Texto de la reseña' },
            customer_id: { type: 'string', description: 'ID del cliente' },
            product: { type: 'string', description: 'Producto reseñado' }
          },
          required: ['review']
        }
      },
      {
        name: 'generate_content',
        description: 'Genera contenido para marketing y descripciones',
        inputSchema: {
          type: 'object',
          properties: {
            product: { type: 'string', description: 'Producto o tipo de flores' },
            type: {
              type: 'string',
              description: 'Tipo de contenido (descripcion, email, social, etc.)'
            },
            tone: {
              type: 'string',
              description: 'Tono del contenido (romántico, profesional, casual)'
            },
            length: { type: 'number', description: 'Longitud aproximada en palabras' }
          },
          required: ['product', 'type']
        }
      },
      {
        name: 'predict_sales',
        description: 'Predice ventas basadas en datos históricos y tendencias',
        inputSchema: {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              description: 'Perodo a predecir (san_valentin, dia_madre, navidad)'
            },
            product: { type: 'string', description: 'Producto específico o categoría' },
            historical_data: { type: 'boolean', description: 'Usar datos históricos' }
          },
          required: ['period']
        }
      },
      {
        name: 'optimize_price',
        description: 'Optimiza precios basados en mercado y demanda',
        inputSchema: {
          type: 'object',
          properties: {
            product: { type: 'string', description: 'Nombre del producto' },
            cost: { type: 'number', description: 'Costo del producto' },
            competitor_prices: {
              type: 'array',
              items: { type: 'number' },
              description: 'Precios de competidores'
            },
            demand: { type: 'string', description: 'Nivel de demanda (baja, media, alta)' }
          },
          required: ['product', 'cost']
        }
      },
      {
        name: 'get_analytics',
        description: 'Obtiene métricas y analytics del negocio',
        inputSchema: {
          type: 'object',
          properties: {
            metric_type: {
              type: 'string',
              description: 'Tipo de métrica (ventas, conversion, productos)'
            },
            period: { type: 'string', description: 'Período (hoy, semana, mes)' }
          }
        }
      },
      {
        name: 'search_products',
        description: 'Busca productos en el catálogo',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Término de búsqueda' },
            category: { type: 'string', description: 'Categoría específica' },
            price_range: {
              type: 'object',
              properties: { min: { type: 'number' }, max: { type: 'number' } }
            }
          },
          required: ['query']
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
            name: 'FloresYa MCP Server',
            version: '2.0.0'
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

  async handleToolCall(id, params) {
    const { name, arguments: args } = params

    try {
      switch (name) {
        case 'recommend_flowers':
          await this.recommendFlowers(id, args)
          break

        case 'florist_chat':
          await this.floristChat(id, args)
          break

        case 'analyze_sentiment':
          await this.analyzeSentiment(id, args)
          break

        case 'generate_content':
          await this.generateContent(id, args)
          break

        case 'predict_sales':
          await this.predictSales(id, args)
          break

        case 'optimize_price':
          await this.optimizePrice(id, args)
          break

        case 'get_analytics':
          await this.getAnalytics(id, args)
          break

        case 'search_products':
          await this.searchProducts(id, args)
          break

        default:
          this.sendError(id, `Unknown tool: ${name}`)
      }
    } catch (error) {
      this.sendError(id, `Error executing ${name}: ${error.message}`)
    }
  }

  recommendFlowers(id, args) {
    const { occasion, budget, recipient, style } = args

    // Simulación de recomendación con IA
    const recommendations = {
      aniversario: {
        products: this.products.filter(p => p.price <= budget && p.category === 'romance'),
        message: 'Para tu aniversario, te recomiendo flores que expresen amor eterno y pasión.'
      },
      cumpleaños: {
        products: this.products.filter(
          p => p.price <= budget && ['alegria', 'primavera'].includes(p.category)
        ),
        message: 'Los cumpleaños merecen flores llenas de color y alegría.'
      },
      gracias: {
        products: this.products.filter(p => p.price <= budget && p.category === 'elegante'),
        message: 'Expresa tu gratitud con flores elegantes y sofisticadas.'
      },
      default: {
        products: this.products.filter(p => p.price <= budget),
        message: 'He seleccionado las mejores opciones para ti.'
      }
    }

    const recommendation = recommendations[occasion] || recommendations.default
    const topProduct = recommendation.products[0]

    const response = {
      content: [
        {
          type: 'text',
          text: `🌹 ${recommendation.message}

Recomendación principal: ${topProduct?.name || 'Ramo de Rosas Premium'}
💰 Precio: $${topProduct?.price || '59.99'}
📦 Stock disponible: ${topProduct?.stock || '50'} unidades
⭐ Rating: 4.8/5.0

Alternativas:
${recommendation.products
  .slice(1, 3)
  .map(p => `• ${p.name} - $${p.price}`)
  .join('\n')}

💡 Consejo adicional: ${this.getPersonalizedAdvice(recipient, style)}`
        }
      ]
    }

    this.sendResponse(id, response)
  }

  floristChat(id, args) {
    const { question } = args

    // Simulación de respuestas expertas
    const responses = {
      duración:
        'Las orquídeas pueden durar hasta 3 meses con cuidados adecuados. Riega una vez por semana y mantenlas en lugar luminoso pero sin sol directo.',
      cuidados:
        'Para mantener tus flores frescas más tiempo: corta los tallos en diagonal, cambia el agua cada 2 días, y añade una cucharadita de azúcar.',
      significado:
        'Las rosas rojas simbolizan amor apasionado, las blancas pureza, las amarillas amistad. Elige según tu mensaje.',
      default:
        'Como florista experta, te recomiendo considerar la ocasión, la personalidad del destinatario y el mensaje que quieres comunicar.'
    }

    let response = responses.default
    for (const [key, value] of Object.entries(responses)) {
      if (question.toLowerCase().includes(key)) {
        response = value
        break
      }
    }

    this.sendResponse(id, {
      content: [
        {
          type: 'text',
          text: `🌻 Respuesta de Florista IA:

${response}

¿Necesitas más información sobre algún tema específico? Estoy aquí para ayudarte a encontrar las flores perfectas.`
        }
      ]
    })
  }

  analyzeSentiment(id, args) {
    const { review, customer_id, product } = args

    // Simulación de análisis de sentimiento
    const positiveWords = [
      'hermoso',
      'excelente',
      'perfecto',
      'bueno',
      'feliz',
      'contento',
      'recomiendo'
    ]
    const negativeWords = ['malo', 'terrible', 'feo', 'desapunto', 'malo', 'caro', 'no']

    const reviewLower = review.toLowerCase()
    const positiveCount = positiveWords.filter(word => reviewLower.includes(word)).length
    const negativeCount = negativeWords.filter(word => reviewLower.includes(word)).length

    let sentiment, score, recommendation
    if (positiveCount > negativeCount) {
      sentiment = 'positivo'
      score = Math.min(95, 60 + positiveCount * 10)
      recommendation = 'Cliente satisfecho - Ideal para testimonios'
    } else if (negativeCount > positiveCount) {
      sentiment = 'negativo'
      score = Math.max(5, 40 - negativeCount * 10)
      recommendation = 'Requiere atención inmediata - Contactar cliente'
    } else {
      sentiment = 'neutral'
      score = 50
      recommendation = 'Requiere seguimiento - Enviar encuesta detallada'
    }

    this.sendResponse(id, {
      content: [
        {
          type: 'text',
          text: `📊 Análisis de Sentimiento:

Reseña: "${review}"
💯 Score: ${score}/100
😊 Sentimiento: ${sentiment}
📋 Recomendación: ${recommendation}
👤 Cliente: ${customer_id || 'Anónimo'}
🌺 Producto: ${product || 'No especificado'}

📈 Métricas adicionales:
• Probabilidad de recompra: ${sentiment === 'positivo' ? '85%' : '25%'}
• Impacto en reputación: ${sentiment === 'positivo' ? '+1.2' : '-0.8'} estrellas
• Acción sugerida: ${recommendation}`
        }
      ]
    })
  }

  generateContent(id, args) {
    const { product, type, tone } = args

    const templates = {
      descripcion: {
        romantico: `Descubre la magia de ${product}, donde cada pétalo cuenta una historia de amor y pasión. Perfecto para expresar tus sentimientos más profundos con la elegancia que solo las flores pueden ofrecer.`,
        profesional: `${product} de alta calidad, seleccionado cuidadosamente para garantizar máxima frescura y duración. Ideal para regalos corporativos y eventos especiales.`,
        casual: `¡Precioso ${product} que alegrará cualquier día! Fresco, vibrante y lleno de energía positiva. Perfecto para sorprender a alguien especial.`
      },
      email: {
        romantico: `Querido cliente,

Haz que este momento sea inolvidable con nuestro exclusivo ${product}. Cada flor ha sido seleccionada con amor para crear el regalo perfecto.

Con cariño,
FloresYa`,
        profesional: `Estimado cliente,

Le presentamos nuestra colección premium de ${product}. Calidad garantizada y entrega puntual para sus necesidades empresariales.

Atentamente,
FloresYa`,
        casual: `¡Hola! 😊

¿Buscas el regalo perfecto? Te encantará nuestro ${product}. Fresco, hermoso y listo para hacer sonreír a alguien especial.

¡Compra ahora!
FloresYa`
      }
    }

    const content = templates[type]?.[tone] || templates.descripcion.romantico

    this.sendResponse(id, {
      content: [
        {
          type: 'text',
          text: `✨ Contenido generado por IA (${type} - ${tone}):

${content}

📊 Estadísticas del contenido:
• Longitud: ${content.length} caracteres
• Tono: ${tone}
• Tipo: ${type}
• Palabras clave: flores, regalo, especial, hermoso
• Engagement previsto: ${tone === 'romantico' ? 'Alto' : 'Medio'}

⚡ Generado en: 0.3 segundos
🔄 Versiones disponibles: 3 alternativas`
        }
      ]
    })
  }

  predictSales(id, args) {
    const { period, product, historical_data } = args

    // Simulación de predicciones basadas en períodos
    const predictions = {
      san_valentin: {
        increase: '+300%',
        products: {
          rosas: { demand: 2000, stock_needed: 2500 },
          tulipanes: { demand: 800, stock_needed: 1000 },
          orquideas: { demand: 500, stock_needed: 600 }
        },
        advice: 'Incrementar stock 25% y contratar personal adicional'
      },
      dia_madre: {
        increase: '+250%',
        products: {
          orquideas: { demand: 1500, stock_needed: 1800 },
          lirios: { demand: 900, stock_needed: 1100 },
          girasoles: { demand: 600, stock_needed: 750 }
        },
        advice: 'Preparar packaging especial y tarjetas personalizadas'
      },
      navidad: {
        increase: '+180%',
        products: {
          tulipanes: { demand: 700, stock_needed: 850 },
          girasoles: { demand: 400, stock_needed: 500 },
          lirios: { demand: 800, stock_needed: 950 }
        },
        advice: 'Decoración navideña y promociones especiales'
      }
    }

    const prediction = predictions[period] || {
      increase: '+50%',
      advice: 'Monitorear tendencias del mercado'
    }

    this.sendResponse(id, {
      content: [
        {
          type: 'text',
          text: `📈 Predicción de Ventas - ${period.toUpperCase()}:

📊 Aumento esperado: ${prediction.increase}
💡 Recomendación: ${prediction.advice}

${
  product
    ? `
🌺 Producto específico - ${product}:
• Demanda estimada: ${prediction.products[product]?.demand || 'N/A'}
• Stock recomendado: ${prediction.products[product]?.stock_needed || 'N/A'}
`
    : ''
}

📋 Métricas detalladas:
• Precisión del modelo: 92%
• Confianza: Alta
• Basado en: ${historical_data ? 'Datos históricos + ' : ''}Tendencias actuales
• Última actualización: ${new Date().toLocaleDateString()}

⚠️ Acciones sugeridas:
1. Ajustar inventario según predicción
2. Preparar logística de entrega
3. Planificar campañas de marketing
4. Capacitar personal para alta demanda`
        }
      ]
    })
  }

  optimizePrice(id, args) {
    const { product, cost, competitor_prices, demand } = args

    // Simulación de optimización de precios
    const avg_competitor = competitor_prices
      ? competitor_prices.reduce((a, b) => a + b, 0) / competitor_prices.length
      : 0

    let suggested_price
    if (demand === 'alta') {
      suggested_price = Math.max(cost * 1.5, avg_competitor * 1.1)
    } else if (demand === 'media') {
      suggested_price = Math.max(cost * 1.3, avg_competitor * 0.95)
    } else {
      suggested_price = Math.max(cost * 1.2, avg_competitor * 0.9)
    }

    const margin = (((suggested_price - cost) / suggested_price) * 100).toFixed(1)
    const competitiveness = avg_competitor
      ? ((suggested_price / avg_competitor) * 100 - 100).toFixed(1)
      : 0

    this.sendResponse(id, {
      content: [
        {
          type: 'text',
          text: `💰 Optimización de Precio - ${product}:

💎 Precio sugerido: $${suggested_price.toFixed(2)}
💵 Costo base: $${cost}
📈 Margen: ${margin}%
🏪 Competitividad: ${competitiveness > 0 ? '+' : ''}${competitiveness}% vs competencia

📊 Análisis:
• Demanda: ${demand}
• Precio promedio competencia: $${avg_competitor.toFixed(2)}
• Posicionamiento: ${competitiveness > 5 ? 'Premium' : competitiveness < -5 ? 'Económico' : 'Competitivo'}

🎯 Estrategia recomendada:
${margin > 50 ? '• Excelente margen - mantener precio' : ''}
${margin > 30 && margin <= 50 ? '• Buen margen - considerar pequeñas variaciones' : ''}
${margin <= 30 ? '• Margen ajustado - buscar eficiencias' : ''}
${competitiveness > 0 ? '• Por encima del mercado - enfocar en calidad' : ''}
${competitiveness < 0 ? '• Por debajo del mercado - destacar valor' : ''}

⚠️ Monitorear:
• Reacción del mercado (2 semanas)
• Volúmenes de venta
• Feedback de clientes`
        }
      ]
    })
  }

  getAnalytics(id, args) {
    const { metric_type, period } = args

    const analytics_data = {
      ventas: {
        hoy: { ventas: 45, total: 3542.5, ordenes: 23 },
        semana: { ventas: 312, total: 24580.0, ordenes: 156 },
        mes: { ventas: 1248, total: 98320.5, ordenes: 624 }
      },
      conversion: {
        hoy: { rate: 3.2, visitantes: 1400, conversiones: 45 },
        semana: { rate: 3.5, visitantes: 8900, conversiones: 312 },
        mes: { rate: 3.3, visitantes: 37800, conversiones: 1248 }
      },
      productos: {
        mas_vendidos: [
          { name: 'Ramo Rosas Rojas', units: 156, revenue: 9358.44 },
          { name: 'Ramo de Orquídeas', units: 89, revenue: 8009.11 },
          { name: 'Girasoles Felices', units: 134, revenue: 6162.66 }
        ],
        tendencias: {
          romanza: '+25%',
          elegancia: '+15%',
          alegria: '+8%'
        }
      }
    }

    const data = analytics_data[metric_type] || analytics_data.ventas
    const period_data = data[period] || data.hoy

    this.sendResponse(id, {
      content: [
        {
          type: 'text',
          text: `📊 Analytics - ${metric_type.toUpperCase()} - ${period?.toUpperCase() || 'HOY'}:

📈 Métricas principales:
${Object.entries(period_data)
  .map(([key, value]) => `• ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
  .join('\n')}

${
  metric_type === 'productos'
    ? `
🏆 Productos destacados:
${data.mas_vendidos
  .map((p, i) => `${i + 1}. ${p.name}: ${p.units} unidades ($${p.revenue.toFixed(2)})`)
  .join('\n')}

📈 Tendencias:
${Object.entries(data.tendencias)
  .map(([cat, trend]) => `• ${cat}: ${trend}`)
  .join('\n')}
`
    : ''
}

💡 Insights generados por IA:
• El ticket promedio ha aumentado 12% esta semana
• Las compras mobile representan 68% del total
• El pico de ventas es entre 6-9 PM
• Los clientes que compran rosas tienen 35% más probabilidad de regresar

🎯 Recomendaciones automáticas:
1. Incrementar stock de productos top sellers
2. Optimizar campaña para horario pico
3. Crear bundles con productos complementarios
4. Fomentar compras recurrentes

🔄 Actualizado: ${new Date().toLocaleString()}`
        }
      ]
    })
  }

  searchProducts(id, args) {
    const { query, category, price_range } = args

    let results = this.products

    // Filtrar por búsqueda
    if (query) {
      results = results.filter(
        p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase())
      )
    }

    // Filtrar por categoría
    if (category) {
      results = results.filter(p => p.category === category)
    }

    // Filtrar por rango de precio
    if (price_range) {
      results = results.filter(
        p =>
          (!price_range.min || p.price >= price_range.min) &&
          (!price_range.max || p.price <= price_range.max)
      )
    }

    this.sendResponse(id, {
      content: [
        {
          type: 'text',
          text: `🔍 Resultados de búsqueda: "${query}" (${results.length} encontrados)

${results
  .map(
    p => `
🌺 ${p.name}
💰 Precio: $${p.price}
📦 Stock: ${p.stock} unidades
🏷️ Categoría: ${p.category}
⭐ Rating: ${(4.2 + Math.random() * 0.8).toFixed(1)}/5.0
`
  )
  .join('\n')}

💡 Sugerencias basadas en tu búsqueda:
• Considera agregar un detalle personalizado
• Los clientes que compraron estos productos también miraron: Ramo Mixto Primavera
• Envío disponible: Hoy mismo para órdenes antes de 2 PM

🎯 ¿Necesitas ayuda para elegir? Usa la herramienta recommend_flowers para sugerencias personalizadas.`
        }
      ]
    })
  }

  getPersonalizedAdvice(recipient, _style) {
    const advice = {
      mamá: 'Las madres aprecian las flores elegantes y duraderas. Las orquídeas o lirios son excelentes opciones.',
      esposa:
        'Para tu esposa, las rosas rojas siempre son una apuesta ganadora. Agrega una nota personal para mayor impacto.',
      novia:
        'Las flores frescas y vibrantes como los tulipanes o girasoles reflejan energía y alegría.',
      amiga: 'Las gerberas o girasoles son perfectas para alegrar el día de una amiga.'
    }

    return (
      advice[recipient] ||
      'Elige flores que reflejen la personalidad del destinatario y el mensaje que quieres comunicar.'
    )
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

// Iniciar el servidor
console.error('🌺 FloresYa MCP Server Avanzado iniciado')
console.error('🚀 Tools disponibles: 8 herramientas especializadas')
new FloresyaMCPServer()
