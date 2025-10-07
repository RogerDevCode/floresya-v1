/**
 * Business Rules Engine
 * Centralized system for complex business logic validation
 * Extensible rule system for orders, products, and payments
 */

import { BadRequestError, ConflictError, ValidationError } from '../errors/AppError.js'
import { logger } from '../utils/logger.js'

/**
 * Rule types
 */
const RULE_TYPES = {
  VALIDATION: 'validation', // Input validation rules
  BUSINESS: 'business', // Business logic rules
  COMPLIANCE: 'compliance', // Regulatory/compliance rules
  RISK: 'risk' // Risk assessment rules
}

/**
 * Rule severity levels
 */
const SEVERITY = {
  LOW: 'low', // Warning only
  MEDIUM: 'medium', // Block with user message
  HIGH: 'high', // Block with admin notification
  CRITICAL: 'critical' // Block and log security event
}

/**
 * Business Rules Engine Class
 */
class BusinessRulesEngine {
  constructor() {
    this.rules = new Map()
    this.ruleGroups = new Map()
    this.initializeDefaultRules()
  }

  /**
   * Initialize default business rules
   */
  initializeDefaultRules() {
    // Order validation rules
    this.addRule('order', 'minimum_order_amount', {
      type: RULE_TYPES.VALIDATION,
      severity: SEVERITY.MEDIUM,
      description: 'Order amount must meet minimum threshold',
      condition: order => order.total_amount_usd >= 1,
      message: 'El monto mínimo del pedido debe ser $1 USD',
      context: { minimumAmount: 1 }
    })

    this.addRule('order', 'maximum_order_amount', {
      type: RULE_TYPES.BUSINESS,
      severity: SEVERITY.HIGH,
      description: 'Order amount cannot exceed maximum threshold',
      condition: order => order.total_amount_usd <= 10000,
      message: 'El monto máximo del pedido no puede exceder $10,000 USD',
      context: { maximumAmount: 10000 }
    })

    this.addRule('order', 'maximum_items_per_order', {
      type: RULE_TYPES.VALIDATION,
      severity: SEVERITY.MEDIUM,
      description: 'Order cannot have too many items',
      condition: order => order.items.length <= 50,
      message: 'No se permiten más de 50 productos por pedido',
      context: { maximumItems: 50 }
    })

    this.addRule('order', 'valid_delivery_address', {
      type: RULE_TYPES.VALIDATION,
      severity: SEVERITY.HIGH,
      description: 'Delivery address must be in Caracas area',
      condition: order => {
        const caracasKeywords = /\b(caracas|catia|chacao|sucre|baruta|hatillo|petare)\b/i
        return caracasKeywords.test(order.delivery_address)
      },
      message: 'Actualmente solo entregamos en el área metropolitana de Caracas',
      context: {
        allowedAreas: ['caracas', 'catia', 'chacao', 'sucre', 'baruta', 'hatillo', 'petare']
      }
    })

    this.addRule('order', 'business_hours_delivery', {
      type: RULE_TYPES.BUSINESS,
      severity: SEVERITY.LOW,
      description: 'Delivery during business hours',
      condition: order => {
        const now = new Date()
        const hour = now.getHours()
        // Business hours: 8 AM - 8 PM
        return hour >= 8 && hour <= 20
      },
      message:
        'Los pedidos fuera del horario comercial (8 AM - 8 PM) pueden tener demoras en la entrega',
      context: { businessHours: '8:00 AM - 8:00 PM' }
    })

    // Product rules
    this.addRule('product', 'minimum_price', {
      type: RULE_TYPES.BUSINESS,
      severity: SEVERITY.HIGH,
      description: 'Product price must meet minimum threshold',
      condition: product => product.price_usd >= 5,
      message: 'El precio mínimo del producto debe ser $5 USD',
      context: { minimumPrice: 5 }
    })

    this.addRule('product', 'maximum_price', {
      type: RULE_TYPES.BUSINESS,
      severity: SEVERITY.MEDIUM,
      description: 'Product price cannot be too high',
      condition: product => product.price_usd <= 1000,
      message: 'El precio del producto no puede exceder $1000 USD',
      context: { maximumPrice: 1000 }
    })

    this.addRule('product', 'stock_availability', {
      type: RULE_TYPES.BUSINESS,
      severity: SEVERITY.CRITICAL,
      description: 'Product must have sufficient stock',
      condition: (product, context) => {
        const requestedQuantity = context?.quantity || 1
        return product.stock >= requestedQuantity
      },
      message: (product, context) => {
        const requestedQuantity = context?.quantity || 1
        return `Solo hay ${product.stock} unidades disponibles. Solicitaste ${requestedQuantity}.`
      },
      context: { requiresContext: true }
    })

    // Payment rules
    this.addRule('payment', 'minimum_payment_amount', {
      type: RULE_TYPES.VALIDATION,
      severity: SEVERITY.MEDIUM,
      description: 'Payment amount must meet minimum',
      condition: payment => payment.amount_usd >= 1,
      message: 'El monto mínimo de pago debe ser $1 USD',
      context: { minimumAmount: 1 }
    })

    this.addRule('payment', 'maximum_payment_amount', {
      type: RULE_TYPES.RISK,
      severity: SEVERITY.HIGH,
      description: 'Payment amount cannot exceed risk threshold',
      condition: payment => payment.amount_usd <= 5000,
      message: 'El monto del pago excede el límite permitido. Contacte soporte.',
      context: { maximumAmount: 5000 }
    })

    // Customer rules
    this.addRule('customer', 'new_customer_verification', {
      type: RULE_TYPES.RISK,
      severity: SEVERITY.HIGH,
      description: 'New customers require verification for high-value orders',
      condition: (customer, context) => {
        const orderAmount = context?.orderAmount || 0
        const isNewCustomer = context?.isNewCustomer || false

        if (isNewCustomer && orderAmount > 100) {
          return false // Requires verification
        }
        return true
      },
      message: 'Clientes nuevos con pedidos mayores a $100 requieren verificación adicional',
      context: { verificationThreshold: 100 }
    })

    logger.info('Business rules engine initialized with default rules')
  }

  /**
   * Add a new rule
   */
  addRule(group, name, rule) {
    const ruleKey = `${group}:${name}`

    this.rules.set(ruleKey, {
      ...rule,
      group,
      name,
      id: ruleKey
    })

    if (!this.ruleGroups.has(group)) {
      this.ruleGroups.set(group, new Set())
    }
    this.ruleGroups.get(group).add(ruleKey)
  }

  /**
   * Remove a rule
   */
  removeRule(group, name) {
    const ruleKey = `${group}:${name}`
    this.rules.delete(ruleKey)

    const groupRules = this.ruleGroups.get(group)
    if (groupRules) {
      groupRules.delete(ruleKey)
      if (groupRules.size === 0) {
        this.ruleGroups.delete(group)
      }
    }
  }

  /**
   * Evaluate rules for a specific group
   */
  async evaluateRules(group, entity, context = {}) {
    const results = {
      passed: [],
      failed: [],
      warnings: []
    }

    const groupRules = this.ruleGroups.get(group)
    if (!groupRules) {
      return results
    }

    for (const ruleKey of groupRules) {
      const rule = this.rules.get(ruleKey)
      if (!rule) {
        continue
      }

      try {
        const rulePassed = await this.evaluateRule(rule, entity, context)

        if (rulePassed) {
          results.passed.push({
            rule: rule.id,
            description: rule.description,
            severity: rule.severity
          })
        } else {
          const result = {
            rule: rule.id,
            description: rule.description,
            severity: rule.severity,
            message:
              typeof rule.message === 'function' ? rule.message(entity, context) : rule.message,
            context: rule.context
          }

          if (rule.severity === SEVERITY.LOW) {
            results.warnings.push(result)
          } else {
            results.failed.push(result)
          }

          // Log high/critical severity failures
          if (rule.severity === SEVERITY.HIGH || rule.severity === SEVERITY.CRITICAL) {
            logger.warn(`Business rule violation: ${rule.id}`, {
              rule: rule.id,
              severity: rule.severity,
              entity: this.sanitizeEntity(entity),
              context
            })
          }

          // Log critical security events
          if (rule.severity === SEVERITY.CRITICAL) {
            logger.security(`Critical business rule violation: ${rule.id}`, rule.severity, {
              rule: rule.id,
              entity: this.sanitizeEntity(entity),
              context
            })
          }
        }
      } catch (error) {
        logger.error(`Error evaluating rule ${rule.id}`, error, { rule: rule.id, entity, context })

        // Rule evaluation errors are treated as failures
        results.failed.push({
          rule: rule.id,
          description: rule.description,
          severity: SEVERITY.HIGH,
          message: 'Error interno evaluando regla de negocio',
          error: error.message
        })
      }
    }

    return results
  }

  /**
   * Evaluate a single rule
   */
  async evaluateRule(rule, entity, context = {}) {
    try {
      if (rule.requiresContext && !context) {
        throw new Error('Rule requires context but none provided')
      }

      return rule.condition(entity, context)
    } catch (error) {
      logger.error(`Rule evaluation error for ${rule.id}`, error)
      return false
    }
  }

  /**
   * Sanitize entity for logging (remove sensitive data)
   */
  sanitizeEntity(entity) {
    if (!entity || typeof entity !== 'object') {
      return entity
    }

    const sanitized = { ...entity }
    const sensitiveFields = ['password', 'token', 'cardNumber', 'cvv', 'ssn']

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***'
      }
    })

    return sanitized
  }

  /**
   * Validate order with all applicable rules
   */
  async validateOrder(orderData, context = {}) {
    const allResults = {
      passed: [],
      failed: [],
      warnings: []
    }

    // Evaluate order rules
    const orderResults = await this.evaluateRules('order', orderData, context)
    allResults.passed.push(...orderResults.passed)
    allResults.failed.push(...orderResults.failed)
    allResults.warnings.push(...orderResults.warnings)

    // Evaluate each item in the order
    if (orderData.items && Array.isArray(orderData.items)) {
      for (let i = 0; i < orderData.items.length; i++) {
        const item = orderData.items[i]

        // Add item context
        const itemContext = {
          ...context,
          itemIndex: i,
          quantity: item.quantity,
          unitPrice: item.unit_price_usd
        }

        const itemResults = await this.evaluateRules('product', item, itemContext)
        allResults.passed.push(...itemResults.passed)
        allResults.failed.push(...itemResults.failed)
        allResults.warnings.push(...itemResults.warnings)
      }
    }

    // Evaluate payment rules if payment data provided
    if (context.paymentData) {
      const paymentResults = await this.evaluateRules('payment', context.paymentData, context)
      allResults.passed.push(...paymentResults.passed)
      allResults.failed.push(...paymentResults.failed)
      allResults.warnings.push(...paymentResults.warnings)
    }

    // Evaluate customer rules if customer data provided
    if (context.customerData) {
      const customerResults = await this.evaluateRules('customer', context.customerData, {
        ...context,
        orderAmount: orderData.total_amount_usd
      })
      allResults.passed.push(...customerResults.passed)
      allResults.failed.push(...customerResults.failed)
      allResults.warnings.push(...customerResults.warnings)
    }

    return allResults
  }

  /**
   * Get all rules for a group
   */
  getRulesByGroup(group) {
    const rules = []
    const groupRules = this.ruleGroups.get(group)

    if (groupRules) {
      for (const ruleKey of groupRules) {
        rules.push(this.rules.get(ruleKey))
      }
    }

    return rules
  }

  /**
   * Get all available rule groups
   */
  getRuleGroups() {
    return Array.from(this.ruleGroups.keys())
  }

  /**
   * Get engine statistics
   */
  getStats() {
    return {
      totalRules: this.rules.size,
      ruleGroups: Array.from(this.ruleGroups.keys()),
      rulesByGroup: Object.fromEntries(
        Array.from(this.ruleGroups.entries()).map(([group, rules]) => [group, rules.size])
      )
    }
  }
}

// Global business rules engine instance
const businessRulesEngine = new BusinessRulesEngine()

/**
 * Middleware to apply business rules validation
 */
export function validateBusinessRules(entityType, context = {}) {
  return async (req, res, next) => {
    try {
      const entity = req.body
      const results = await businessRulesEngine.validateOrder(entity, {
        ...context,
        user: req.user,
        requestId: req.requestId
      })

      // Handle failures based on severity
      if (results.failed.length > 0) {
        const criticalFailures = results.failed.filter(r => r.severity === SEVERITY.CRITICAL)
        const highFailures = results.failed.filter(r => r.severity === SEVERITY.HIGH)
        const mediumFailures = results.failed.filter(r => r.severity === SEVERITY.MEDIUM)

        if (criticalFailures.length > 0) {
          throw new ConflictError('Violación crítica de reglas de negocio', {
            violations: criticalFailures
          })
        }

        if (highFailures.length > 0) {
          throw new ValidationError('Violación de reglas de negocio', highFailures)
        }

        if (mediumFailures.length > 0) {
          throw new BadRequestError('Datos del pedido inválidos', {
            violations: mediumFailures
          })
        }
      }

      // Add warnings to response headers if any
      if (results.warnings.length > 0) {
        res.set('X-Business-Warnings', JSON.stringify(results.warnings))
      }

      // Store results for potential use in controllers
      req.businessRulesResults = results

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Get business rules engine status
 */
export function getBusinessRulesStatus(req, res) {
  const stats = businessRulesEngine.getStats()
  const groups = businessRulesEngine.getRuleGroups()

  const status = {
    ...stats,
    groups: groups.map(group => ({
      name: group,
      rules: businessRulesEngine.getRulesByGroup(group)
    })),
    timestamp: new Date().toISOString()
  }

  res.json({
    success: true,
    data: status
  })
}

/**
 * Export the engine instance for direct use
 */
export { businessRulesEngine }
export default businessRulesEngine
