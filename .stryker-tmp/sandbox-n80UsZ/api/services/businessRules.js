/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Business Rules Engine
 * Centralized system for complex business logic validation
 * Extensible rule system for orders, products, and payments
 */ function stryNS_9fa48() {
  var g =
    (typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis) ||
    new Function('return this')()
  var ns = g.__stryker__ || (g.__stryker__ = {})
  if (
    ns.activeMutant === undefined &&
    g.process &&
    g.process.env &&
    g.process.env.__STRYKER_ACTIVE_MUTANT__
  ) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__
  }
  function retrieveNS() {
    return ns
  }
  stryNS_9fa48 = retrieveNS
  return retrieveNS()
}
stryNS_9fa48()
function stryCov_9fa48() {
  var ns = stryNS_9fa48()
  var cov =
    ns.mutantCoverage ||
    (ns.mutantCoverage = {
      static: {},
      perTest: {}
    })
  function cover() {
    var c = cov.static
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {}
    }
    var a = arguments
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1
    }
  }
  stryCov_9fa48 = cover
  cover.apply(null, arguments)
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48()
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')')
      }
      return true
    }
    return false
  }
  stryMutAct_9fa48 = isActive
  return isActive(id)
}
import { BadRequestError, ConflictError, ValidationError } from '../errors/AppError.js'
import { logger as defaultLogger } from '../utils/logger.js'

/**
 * Rule types
 */
const RULE_TYPES = stryMutAct_9fa48('906')
  ? {}
  : (stryCov_9fa48('906'),
    {
      VALIDATION: stryMutAct_9fa48('907') ? '' : (stryCov_9fa48('907'), 'validation'),
      // Input validation rules
      BUSINESS: stryMutAct_9fa48('908') ? '' : (stryCov_9fa48('908'), 'business'),
      // Business logic rules
      COMPLIANCE: stryMutAct_9fa48('909') ? '' : (stryCov_9fa48('909'), 'compliance'),
      // Regulatory/compliance rules
      RISK: stryMutAct_9fa48('910') ? '' : (stryCov_9fa48('910'), 'risk') // Risk assessment rules
    })

/**
 * Rule severity levels
 */
const SEVERITY = stryMutAct_9fa48('911')
  ? {}
  : (stryCov_9fa48('911'),
    {
      LOW: stryMutAct_9fa48('912') ? '' : (stryCov_9fa48('912'), 'low'),
      // Warning only
      MEDIUM: stryMutAct_9fa48('913') ? '' : (stryCov_9fa48('913'), 'medium'),
      // Block with user message
      HIGH: stryMutAct_9fa48('914') ? '' : (stryCov_9fa48('914'), 'high'),
      // Block with admin notification
      CRITICAL: stryMutAct_9fa48('915') ? '' : (stryCov_9fa48('915'), 'critical') // Block and log security event
    })

/**
 * Business Rules Engine Class
 */
class BusinessRulesEngine {
  constructor(logger = null) {
    if (stryMutAct_9fa48('916')) {
      {
      }
    } else {
      stryCov_9fa48('916')
      this.logger = stryMutAct_9fa48('919')
        ? logger && defaultLogger
        : stryMutAct_9fa48('918')
          ? false
          : stryMutAct_9fa48('917')
            ? true
            : (stryCov_9fa48('917', '918', '919'), logger || defaultLogger)
      this.rules = new Map()
      this.ruleGroups = new Map()
      this.initializeDefaultRules()
    }
  }

  /**
   * Initialize default business rules
   */
  initializeDefaultRules() {
    if (stryMutAct_9fa48('920')) {
      {
      }
    } else {
      stryCov_9fa48('920')
      // Order validation rules
      this.addRule(
        stryMutAct_9fa48('921') ? '' : (stryCov_9fa48('921'), 'order'),
        stryMutAct_9fa48('922') ? '' : (stryCov_9fa48('922'), 'minimum_order_amount'),
        stryMutAct_9fa48('923')
          ? {}
          : (stryCov_9fa48('923'),
            {
              type: RULE_TYPES.VALIDATION,
              severity: SEVERITY.LOW,
              // Changed to LOW to allow processing
              description: stryMutAct_9fa48('924')
                ? ''
                : (stryCov_9fa48('924'), 'Order amount must meet minimum threshold'),
              condition: order => {
                if (stryMutAct_9fa48('925')) {
                  {
                  }
                } else {
                  stryCov_9fa48('925')
                  const amount = order.total_amount_usd
                  this.logger.debug(
                    stryMutAct_9fa48('926')
                      ? ``
                      : (stryCov_9fa48('926'),
                        `🔍 MINIMUM_ORDER_AMOUNT: Checking amount=${amount}, type=${typeof amount}, >=1=${stryMutAct_9fa48('930') ? amount < 1 : stryMutAct_9fa48('929') ? amount > 1 : stryMutAct_9fa48('928') ? false : stryMutAct_9fa48('927') ? true : (stryCov_9fa48('927', '928', '929', '930'), amount >= 1)}`)
                  )
                  return stryMutAct_9fa48('934')
                    ? amount < 1
                    : stryMutAct_9fa48('933')
                      ? amount > 1
                      : stryMutAct_9fa48('932')
                        ? false
                        : stryMutAct_9fa48('931')
                          ? true
                          : (stryCov_9fa48('931', '932', '933', '934'), amount >= 1)
                }
              },
              message: stryMutAct_9fa48('935')
                ? ''
                : (stryCov_9fa48('935'),
                  'El monto mínimo del pedido debe ser $1 USD (warning only)'),
              context: stryMutAct_9fa48('936')
                ? {}
                : (stryCov_9fa48('936'),
                  {
                    minimumAmount: 1
                  })
            })
      )
      this.addRule(
        stryMutAct_9fa48('937') ? '' : (stryCov_9fa48('937'), 'order'),
        stryMutAct_9fa48('938') ? '' : (stryCov_9fa48('938'), 'maximum_order_amount'),
        stryMutAct_9fa48('939')
          ? {}
          : (stryCov_9fa48('939'),
            {
              type: RULE_TYPES.BUSINESS,
              severity: SEVERITY.HIGH,
              description: stryMutAct_9fa48('940')
                ? ''
                : (stryCov_9fa48('940'), 'Order amount cannot exceed maximum threshold'),
              condition: order => {
                if (stryMutAct_9fa48('941')) {
                  {
                  }
                } else {
                  stryCov_9fa48('941')
                  // More forgiving comparison to avoid floating point issues
                  const amount = stryMutAct_9fa48('944')
                    ? parseFloat(order.total_amount_usd) && 0
                    : stryMutAct_9fa48('943')
                      ? false
                      : stryMutAct_9fa48('942')
                        ? true
                        : (stryCov_9fa48('942', '943', '944'),
                          parseFloat(order.total_amount_usd) || 0)
                  return stryMutAct_9fa48('948')
                    ? amount > 10000.01
                    : stryMutAct_9fa48('947')
                      ? amount < 10000.01
                      : stryMutAct_9fa48('946')
                        ? false
                        : stryMutAct_9fa48('945')
                          ? true
                          : (stryCov_9fa48('945', '946', '947', '948'), amount <= 10000.01) // Small buffer to account for floating point precision
                }
              },
              message: stryMutAct_9fa48('949')
                ? ''
                : (stryCov_9fa48('949'), 'El monto máximo del pedido no puede exceder $10,000 USD'),
              context: stryMutAct_9fa48('950')
                ? {}
                : (stryCov_9fa48('950'),
                  {
                    maximumAmount: 10000
                  })
            })
      )
      this.addRule(
        stryMutAct_9fa48('951') ? '' : (stryCov_9fa48('951'), 'order'),
        stryMutAct_9fa48('952') ? '' : (stryCov_9fa48('952'), 'maximum_items_per_order'),
        stryMutAct_9fa48('953')
          ? {}
          : (stryCov_9fa48('953'),
            {
              type: RULE_TYPES.VALIDATION,
              severity: SEVERITY.MEDIUM,
              description: stryMutAct_9fa48('954')
                ? ''
                : (stryCov_9fa48('954'), 'Order cannot have too many items'),
              condition: stryMutAct_9fa48('955')
                ? () => undefined
                : (stryCov_9fa48('955'),
                  (order, context) =>
                    stryMutAct_9fa48('959')
                      ? (context?.items?.length || 0) > 50
                      : stryMutAct_9fa48('958')
                        ? (context?.items?.length || 0) < 50
                        : stryMutAct_9fa48('957')
                          ? false
                          : stryMutAct_9fa48('956')
                            ? true
                            : (stryCov_9fa48('956', '957', '958', '959'),
                              (stryMutAct_9fa48('962')
                                ? context?.items?.length && 0
                                : stryMutAct_9fa48('961')
                                  ? false
                                  : stryMutAct_9fa48('960')
                                    ? true
                                    : (stryCov_9fa48('960', '961', '962'),
                                      (stryMutAct_9fa48('964')
                                        ? context.items?.length
                                        : stryMutAct_9fa48('963')
                                          ? context?.items.length
                                          : (stryCov_9fa48('963', '964'),
                                            context?.items?.length)) || 0)) <= 50)),
              message: stryMutAct_9fa48('965')
                ? ''
                : (stryCov_9fa48('965'), 'No se permiten más de 50 productos por pedido'),
              context: stryMutAct_9fa48('966')
                ? {}
                : (stryCov_9fa48('966'),
                  {
                    maximumItems: 50
                  })
            })
      )
      this.addRule(
        stryMutAct_9fa48('967') ? '' : (stryCov_9fa48('967'), 'order'),
        stryMutAct_9fa48('968') ? '' : (stryCov_9fa48('968'), 'business_hours_delivery'),
        stryMutAct_9fa48('969')
          ? {}
          : (stryCov_9fa48('969'),
            {
              type: RULE_TYPES.BUSINESS,
              severity: SEVERITY.LOW,
              description: stryMutAct_9fa48('970')
                ? ''
                : (stryCov_9fa48('970'), 'Delivery during business hours'),
              condition: _order => {
                if (stryMutAct_9fa48('971')) {
                  {
                  }
                } else {
                  stryCov_9fa48('971')
                  const now = new Date()
                  const hour = now.getHours()
                  // Business hours: 8 AM - 8 PM
                  return stryMutAct_9fa48('974')
                    ? hour >= 8 || hour <= 20
                    : stryMutAct_9fa48('973')
                      ? false
                      : stryMutAct_9fa48('972')
                        ? true
                        : (stryCov_9fa48('972', '973', '974'),
                          (stryMutAct_9fa48('977')
                            ? hour < 8
                            : stryMutAct_9fa48('976')
                              ? hour > 8
                              : stryMutAct_9fa48('975')
                                ? true
                                : (stryCov_9fa48('975', '976', '977'), hour >= 8)) &&
                            (stryMutAct_9fa48('980')
                              ? hour > 20
                              : stryMutAct_9fa48('979')
                                ? hour < 20
                                : stryMutAct_9fa48('978')
                                  ? true
                                  : (stryCov_9fa48('978', '979', '980'), hour <= 20)))
                }
              },
              message: stryMutAct_9fa48('981')
                ? ''
                : (stryCov_9fa48('981'),
                  'Los pedidos fuera del horario comercial (8 AM - 8 PM) pueden tener demoras en la entrega'),
              context: stryMutAct_9fa48('982')
                ? {}
                : (stryCov_9fa48('982'),
                  {
                    businessHours: stryMutAct_9fa48('983')
                      ? ''
                      : (stryCov_9fa48('983'), '8:00 AM - 8:00 PM')
                  })
            })
      )

      // Product rules
      this.addRule(
        stryMutAct_9fa48('984') ? '' : (stryCov_9fa48('984'), 'product'),
        stryMutAct_9fa48('985') ? '' : (stryCov_9fa48('985'), 'minimum_price'),
        stryMutAct_9fa48('986')
          ? {}
          : (stryCov_9fa48('986'),
            {
              type: RULE_TYPES.BUSINESS,
              severity: SEVERITY.HIGH,
              description: stryMutAct_9fa48('987')
                ? ''
                : (stryCov_9fa48('987'), 'Product price must meet minimum threshold'),
              condition: stryMutAct_9fa48('988')
                ? () => undefined
                : (stryCov_9fa48('988'),
                  product =>
                    stryMutAct_9fa48('992')
                      ? product.price_usd < 5
                      : stryMutAct_9fa48('991')
                        ? product.price_usd > 5
                        : stryMutAct_9fa48('990')
                          ? false
                          : stryMutAct_9fa48('989')
                            ? true
                            : (stryCov_9fa48('989', '990', '991', '992'), product.price_usd >= 5)),
              message: stryMutAct_9fa48('993')
                ? ''
                : (stryCov_9fa48('993'), 'El precio mínimo del producto debe ser $5 USD'),
              context: stryMutAct_9fa48('994')
                ? {}
                : (stryCov_9fa48('994'),
                  {
                    minimumPrice: 5
                  })
            })
      )
      this.addRule(
        stryMutAct_9fa48('995') ? '' : (stryCov_9fa48('995'), 'product'),
        stryMutAct_9fa48('996') ? '' : (stryCov_9fa48('996'), 'maximum_price'),
        stryMutAct_9fa48('997')
          ? {}
          : (stryCov_9fa48('997'),
            {
              type: RULE_TYPES.BUSINESS,
              severity: SEVERITY.MEDIUM,
              description: stryMutAct_9fa48('998')
                ? ''
                : (stryCov_9fa48('998'), 'Product price cannot be too high'),
              condition: stryMutAct_9fa48('999')
                ? () => undefined
                : (stryCov_9fa48('999'),
                  product =>
                    stryMutAct_9fa48('1003')
                      ? product.price_usd > 1000
                      : stryMutAct_9fa48('1002')
                        ? product.price_usd < 1000
                        : stryMutAct_9fa48('1001')
                          ? false
                          : stryMutAct_9fa48('1000')
                            ? true
                            : (stryCov_9fa48('1000', '1001', '1002', '1003'),
                              product.price_usd <= 1000)),
              message: stryMutAct_9fa48('1004')
                ? ''
                : (stryCov_9fa48('1004'), 'El precio del producto no puede exceder $1000 USD'),
              context: stryMutAct_9fa48('1005')
                ? {}
                : (stryCov_9fa48('1005'),
                  {
                    maximumPrice: 1000
                  })
            })
      )

      // Payment rules
      this.addRule(
        stryMutAct_9fa48('1006') ? '' : (stryCov_9fa48('1006'), 'payment'),
        stryMutAct_9fa48('1007') ? '' : (stryCov_9fa48('1007'), 'minimum_payment_amount'),
        stryMutAct_9fa48('1008')
          ? {}
          : (stryCov_9fa48('1008'),
            {
              type: RULE_TYPES.VALIDATION,
              severity: SEVERITY.MEDIUM,
              description: stryMutAct_9fa48('1009')
                ? ''
                : (stryCov_9fa48('1009'), 'Payment amount must meet minimum'),
              condition: stryMutAct_9fa48('1010')
                ? () => undefined
                : (stryCov_9fa48('1010'),
                  payment =>
                    stryMutAct_9fa48('1014')
                      ? payment.amount_usd < 1
                      : stryMutAct_9fa48('1013')
                        ? payment.amount_usd > 1
                        : stryMutAct_9fa48('1012')
                          ? false
                          : stryMutAct_9fa48('1011')
                            ? true
                            : (stryCov_9fa48('1011', '1012', '1013', '1014'),
                              payment.amount_usd >= 1)),
              message: stryMutAct_9fa48('1015')
                ? ''
                : (stryCov_9fa48('1015'), 'El monto mínimo de pago debe ser $1 USD'),
              context: stryMutAct_9fa48('1016')
                ? {}
                : (stryCov_9fa48('1016'),
                  {
                    minimumAmount: 1
                  })
            })
      )
      this.addRule(
        stryMutAct_9fa48('1017') ? '' : (stryCov_9fa48('1017'), 'payment'),
        stryMutAct_9fa48('1018') ? '' : (stryCov_9fa48('1018'), 'maximum_payment_amount'),
        stryMutAct_9fa48('1019')
          ? {}
          : (stryCov_9fa48('1019'),
            {
              type: RULE_TYPES.RISK,
              severity: SEVERITY.HIGH,
              description: stryMutAct_9fa48('1020')
                ? ''
                : (stryCov_9fa48('1020'), 'Payment amount cannot exceed risk threshold'),
              condition: stryMutAct_9fa48('1021')
                ? () => undefined
                : (stryCov_9fa48('1021'),
                  payment =>
                    stryMutAct_9fa48('1025')
                      ? payment.amount_usd > 5000
                      : stryMutAct_9fa48('1024')
                        ? payment.amount_usd < 5000
                        : stryMutAct_9fa48('1023')
                          ? false
                          : stryMutAct_9fa48('1022')
                            ? true
                            : (stryCov_9fa48('1022', '1023', '1024', '1025'),
                              payment.amount_usd <= 5000)),
              message: stryMutAct_9fa48('1026')
                ? ''
                : (stryCov_9fa48('1026'),
                  'El monto del pago excede el límite permitido. Contacte soporte.'),
              context: stryMutAct_9fa48('1027')
                ? {}
                : (stryCov_9fa48('1027'),
                  {
                    maximumAmount: 5000
                  })
            })
      )

      // Customer rules
      this.addRule(
        stryMutAct_9fa48('1028') ? '' : (stryCov_9fa48('1028'), 'customer'),
        stryMutAct_9fa48('1029') ? '' : (stryCov_9fa48('1029'), 'new_customer_verification'),
        stryMutAct_9fa48('1030')
          ? {}
          : (stryCov_9fa48('1030'),
            {
              type: RULE_TYPES.RISK,
              severity: SEVERITY.HIGH,
              description: stryMutAct_9fa48('1031')
                ? ''
                : (stryCov_9fa48('1031'),
                  'New customers require verification for high-value orders'),
              condition: (customer, context) => {
                if (stryMutAct_9fa48('1032')) {
                  {
                  }
                } else {
                  stryCov_9fa48('1032')
                  const orderAmount = stryMutAct_9fa48('1035')
                    ? context?.orderAmount && 0
                    : stryMutAct_9fa48('1034')
                      ? false
                      : stryMutAct_9fa48('1033')
                        ? true
                        : (stryCov_9fa48('1033', '1034', '1035'),
                          (stryMutAct_9fa48('1036')
                            ? context.orderAmount
                            : (stryCov_9fa48('1036'), context?.orderAmount)) || 0)
                  const isNewCustomer = stryMutAct_9fa48('1039')
                    ? context?.isNewCustomer && false
                    : stryMutAct_9fa48('1038')
                      ? false
                      : stryMutAct_9fa48('1037')
                        ? true
                        : (stryCov_9fa48('1037', '1038', '1039'),
                          (stryMutAct_9fa48('1040')
                            ? context.isNewCustomer
                            : (stryCov_9fa48('1040'), context?.isNewCustomer)) ||
                            (stryMutAct_9fa48('1041') ? true : (stryCov_9fa48('1041'), false)))
                  if (
                    stryMutAct_9fa48('1044')
                      ? isNewCustomer || orderAmount > 100
                      : stryMutAct_9fa48('1043')
                        ? false
                        : stryMutAct_9fa48('1042')
                          ? true
                          : (stryCov_9fa48('1042', '1043', '1044'),
                            isNewCustomer &&
                              (stryMutAct_9fa48('1047')
                                ? orderAmount <= 100
                                : stryMutAct_9fa48('1046')
                                  ? orderAmount >= 100
                                  : stryMutAct_9fa48('1045')
                                    ? true
                                    : (stryCov_9fa48('1045', '1046', '1047'), orderAmount > 100)))
                  ) {
                    if (stryMutAct_9fa48('1048')) {
                      {
                      }
                    } else {
                      stryCov_9fa48('1048')
                      return stryMutAct_9fa48('1049') ? true : (stryCov_9fa48('1049'), false) // Requires verification
                    }
                  }
                  return stryMutAct_9fa48('1050') ? false : (stryCov_9fa48('1050'), true)
                }
              },
              message: stryMutAct_9fa48('1051')
                ? ''
                : (stryCov_9fa48('1051'),
                  'Clientes nuevos con pedidos mayores a $100 requieren verificación adicional'),
              context: stryMutAct_9fa48('1052')
                ? {}
                : (stryCov_9fa48('1052'),
                  {
                    verificationThreshold: 100
                  })
            })
      )
      this.logger.info(
        stryMutAct_9fa48('1053')
          ? ''
          : (stryCov_9fa48('1053'), '⚙️ Motor de reglas de negocio inicializado')
      )
    }
  }

  /**
   * Add a new rule
   */
  addRule(group, name, rule) {
    if (stryMutAct_9fa48('1054')) {
      {
      }
    } else {
      stryCov_9fa48('1054')
      const ruleKey = stryMutAct_9fa48('1055') ? `` : (stryCov_9fa48('1055'), `${group}:${name}`)
      this.rules.set(
        ruleKey,
        stryMutAct_9fa48('1056')
          ? {}
          : (stryCov_9fa48('1056'),
            {
              ...rule,
              group,
              name,
              id: ruleKey
            })
      )
      if (
        stryMutAct_9fa48('1059')
          ? false
          : stryMutAct_9fa48('1058')
            ? true
            : stryMutAct_9fa48('1057')
              ? this.ruleGroups.has(group)
              : (stryCov_9fa48('1057', '1058', '1059'), !this.ruleGroups.has(group))
      ) {
        if (stryMutAct_9fa48('1060')) {
          {
          }
        } else {
          stryCov_9fa48('1060')
          this.ruleGroups.set(group, new Set())
        }
      }
      this.ruleGroups.get(group).add(ruleKey)
    }
  }

  /**
   * Remove a rule
   */
  removeRule(group, name) {
    if (stryMutAct_9fa48('1061')) {
      {
      }
    } else {
      stryCov_9fa48('1061')
      const ruleKey = stryMutAct_9fa48('1062') ? `` : (stryCov_9fa48('1062'), `${group}:${name}`)
      this.rules.delete(ruleKey)
      const groupRules = this.ruleGroups.get(group)
      if (
        stryMutAct_9fa48('1064')
          ? false
          : stryMutAct_9fa48('1063')
            ? true
            : (stryCov_9fa48('1063', '1064'), groupRules)
      ) {
        if (stryMutAct_9fa48('1065')) {
          {
          }
        } else {
          stryCov_9fa48('1065')
          groupRules.delete(ruleKey)
          if (
            stryMutAct_9fa48('1068')
              ? groupRules.size !== 0
              : stryMutAct_9fa48('1067')
                ? false
                : stryMutAct_9fa48('1066')
                  ? true
                  : (stryCov_9fa48('1066', '1067', '1068'), groupRules.size === 0)
          ) {
            if (stryMutAct_9fa48('1069')) {
              {
              }
            } else {
              stryCov_9fa48('1069')
              this.ruleGroups.delete(group)
            }
          }
        }
      }
    }
  }

  /**
   * Evaluate rules for a specific group
   */
  async evaluateRules(group, entity, context = {}) {
    if (stryMutAct_9fa48('1070')) {
      {
      }
    } else {
      stryCov_9fa48('1070')
      const results = stryMutAct_9fa48('1071')
        ? {}
        : (stryCov_9fa48('1071'),
          {
            passed: stryMutAct_9fa48('1072') ? ['Stryker was here'] : (stryCov_9fa48('1072'), []),
            failed: stryMutAct_9fa48('1073') ? ['Stryker was here'] : (stryCov_9fa48('1073'), []),
            warnings: stryMutAct_9fa48('1074') ? ['Stryker was here'] : (stryCov_9fa48('1074'), [])
          })
      const groupRules = this.ruleGroups.get(group)
      if (
        stryMutAct_9fa48('1077')
          ? false
          : stryMutAct_9fa48('1076')
            ? true
            : stryMutAct_9fa48('1075')
              ? groupRules
              : (stryCov_9fa48('1075', '1076', '1077'), !groupRules)
      ) {
        if (stryMutAct_9fa48('1078')) {
          {
          }
        } else {
          stryCov_9fa48('1078')
          return results
        }
      }
      for (const ruleKey of groupRules) {
        if (stryMutAct_9fa48('1079')) {
          {
          }
        } else {
          stryCov_9fa48('1079')
          const rule = this.rules.get(ruleKey)
          if (
            stryMutAct_9fa48('1082')
              ? false
              : stryMutAct_9fa48('1081')
                ? true
                : stryMutAct_9fa48('1080')
                  ? rule
                  : (stryCov_9fa48('1080', '1081', '1082'), !rule)
          ) {
            if (stryMutAct_9fa48('1083')) {
              {
              }
            } else {
              stryCov_9fa48('1083')
              continue
            }
          }
          try {
            if (stryMutAct_9fa48('1084')) {
              {
              }
            } else {
              stryCov_9fa48('1084')
              const rulePassed = await this.evaluateRule(rule, entity, context)
              if (
                stryMutAct_9fa48('1086')
                  ? false
                  : stryMutAct_9fa48('1085')
                    ? true
                    : (stryCov_9fa48('1085', '1086'), rulePassed)
              ) {
                if (stryMutAct_9fa48('1087')) {
                  {
                  }
                } else {
                  stryCov_9fa48('1087')
                  results.passed.push(
                    stryMutAct_9fa48('1088')
                      ? {}
                      : (stryCov_9fa48('1088'),
                        {
                          rule: rule.id,
                          description: rule.description,
                          severity: rule.severity
                        })
                  )
                }
              } else {
                if (stryMutAct_9fa48('1089')) {
                  {
                  }
                } else {
                  stryCov_9fa48('1089')
                  const result = stryMutAct_9fa48('1090')
                    ? {}
                    : (stryCov_9fa48('1090'),
                      {
                        rule: rule.id,
                        description: rule.description,
                        severity: rule.severity,
                        message: (
                          stryMutAct_9fa48('1093')
                            ? typeof rule.message !== 'function'
                            : stryMutAct_9fa48('1092')
                              ? false
                              : stryMutAct_9fa48('1091')
                                ? true
                                : (stryCov_9fa48('1091', '1092', '1093'),
                                  typeof rule.message ===
                                    (stryMutAct_9fa48('1094')
                                      ? ''
                                      : (stryCov_9fa48('1094'), 'function')))
                        )
                          ? rule.message(entity, context)
                          : rule.message,
                        context: rule.context
                      })
                  if (
                    stryMutAct_9fa48('1097')
                      ? rule.severity !== SEVERITY.LOW
                      : stryMutAct_9fa48('1096')
                        ? false
                        : stryMutAct_9fa48('1095')
                          ? true
                          : (stryCov_9fa48('1095', '1096', '1097'), rule.severity === SEVERITY.LOW)
                  ) {
                    if (stryMutAct_9fa48('1098')) {
                      {
                      }
                    } else {
                      stryCov_9fa48('1098')
                      results.warnings.push(result)
                    }
                  } else {
                    if (stryMutAct_9fa48('1099')) {
                      {
                      }
                    } else {
                      stryCov_9fa48('1099')
                      results.failed.push(result)
                    }
                  }

                  // Log high/critical severity failures
                  if (
                    stryMutAct_9fa48('1102')
                      ? rule.severity === SEVERITY.HIGH && rule.severity === SEVERITY.CRITICAL
                      : stryMutAct_9fa48('1101')
                        ? false
                        : stryMutAct_9fa48('1100')
                          ? true
                          : (stryCov_9fa48('1100', '1101', '1102'),
                            (stryMutAct_9fa48('1104')
                              ? rule.severity !== SEVERITY.HIGH
                              : stryMutAct_9fa48('1103')
                                ? false
                                : (stryCov_9fa48('1103', '1104'),
                                  rule.severity === SEVERITY.HIGH)) ||
                              (stryMutAct_9fa48('1106')
                                ? rule.severity !== SEVERITY.CRITICAL
                                : stryMutAct_9fa48('1105')
                                  ? false
                                  : (stryCov_9fa48('1105', '1106'),
                                    rule.severity === SEVERITY.CRITICAL)))
                  ) {
                    if (stryMutAct_9fa48('1107')) {
                      {
                      }
                    } else {
                      stryCov_9fa48('1107')
                      this.logger.warn(
                        stryMutAct_9fa48('1108')
                          ? ``
                          : (stryCov_9fa48('1108'), `Business rule violation: ${rule.id}`),
                        stryMutAct_9fa48('1109')
                          ? {}
                          : (stryCov_9fa48('1109'),
                            {
                              rule: rule.id,
                              severity: rule.severity,
                              entity: this.sanitizeEntity(entity),
                              context
                            })
                      )
                    }
                  }

                  // Log critical security events
                  if (
                    stryMutAct_9fa48('1112')
                      ? rule.severity !== SEVERITY.CRITICAL
                      : stryMutAct_9fa48('1111')
                        ? false
                        : stryMutAct_9fa48('1110')
                          ? true
                          : (stryCov_9fa48('1110', '1111', '1112'),
                            rule.severity === SEVERITY.CRITICAL)
                  ) {
                    if (stryMutAct_9fa48('1113')) {
                      {
                      }
                    } else {
                      stryCov_9fa48('1113')
                      this.logger.logSecurity(
                        stryMutAct_9fa48('1114')
                          ? ``
                          : (stryCov_9fa48('1114'), `Critical business rule violation: ${rule.id}`),
                        rule.severity,
                        stryMutAct_9fa48('1115')
                          ? {}
                          : (stryCov_9fa48('1115'),
                            {
                              rule: rule.id,
                              entity: this.sanitizeEntity(entity),
                              context
                            })
                      )
                    }
                  }
                }
              }
            }
          } catch (error) {
            if (stryMutAct_9fa48('1116')) {
              {
              }
            } else {
              stryCov_9fa48('1116')
              this.logger.error(
                stryMutAct_9fa48('1117')
                  ? ``
                  : (stryCov_9fa48('1117'), `Error evaluating rule ${rule.id}`),
                error,
                stryMutAct_9fa48('1118')
                  ? {}
                  : (stryCov_9fa48('1118'),
                    {
                      rule: rule.id,
                      entity,
                      context
                    })
              )

              // Rule evaluation errors are treated as failures
              results.failed.push(
                stryMutAct_9fa48('1119')
                  ? {}
                  : (stryCov_9fa48('1119'),
                    {
                      rule: rule.id,
                      description: rule.description,
                      severity: SEVERITY.HIGH,
                      message: stryMutAct_9fa48('1120')
                        ? ''
                        : (stryCov_9fa48('1120'), 'Error interno evaluando regla de negocio'),
                      error: error.message
                    })
              )
            }
          }
        }
      }
      return results
    }
  }

  /**
   * Evaluate a single rule
   */
  evaluateRule(rule, entity, context = {}) {
    if (stryMutAct_9fa48('1121')) {
      {
      }
    } else {
      stryCov_9fa48('1121')
      try {
        if (stryMutAct_9fa48('1122')) {
          {
          }
        } else {
          stryCov_9fa48('1122')
          if (
            stryMutAct_9fa48('1125')
              ? rule.requiresContext || !context
              : stryMutAct_9fa48('1124')
                ? false
                : stryMutAct_9fa48('1123')
                  ? true
                  : (stryCov_9fa48('1123', '1124', '1125'),
                    rule.requiresContext &&
                      (stryMutAct_9fa48('1126') ? context : (stryCov_9fa48('1126'), !context)))
          ) {
            if (stryMutAct_9fa48('1127')) {
              {
              }
            } else {
              stryCov_9fa48('1127')
              throw new ValidationError(
                stryMutAct_9fa48('1128')
                  ? ''
                  : (stryCov_9fa48('1128'), 'Rule requires context but none provided'),
                stryMutAct_9fa48('1129')
                  ? {}
                  : (stryCov_9fa48('1129'),
                    {
                      ruleId: rule.id,
                      requiresContext: stryMutAct_9fa48('1130')
                        ? false
                        : (stryCov_9fa48('1130'), true)
                    })
              )
            }
          }
          return rule.condition(entity, context)
        }
      } catch (error) {
        if (stryMutAct_9fa48('1131')) {
          {
          }
        } else {
          stryCov_9fa48('1131')
          this.logger.error(
            stryMutAct_9fa48('1132')
              ? ``
              : (stryCov_9fa48('1132'), `Rule evaluation error for ${rule.id}`),
            error
          )
          return stryMutAct_9fa48('1133') ? true : (stryCov_9fa48('1133'), false)
        }
      }
    }
  }

  /**
   * Sanitize entity for logging (remove sensitive data)
   */
  sanitizeEntity(entity) {
    if (stryMutAct_9fa48('1134')) {
      {
      }
    } else {
      stryCov_9fa48('1134')
      if (
        stryMutAct_9fa48('1137')
          ? !entity && typeof entity !== 'object'
          : stryMutAct_9fa48('1136')
            ? false
            : stryMutAct_9fa48('1135')
              ? true
              : (stryCov_9fa48('1135', '1136', '1137'),
                (stryMutAct_9fa48('1138') ? entity : (stryCov_9fa48('1138'), !entity)) ||
                  (stryMutAct_9fa48('1140')
                    ? typeof entity === 'object'
                    : stryMutAct_9fa48('1139')
                      ? false
                      : (stryCov_9fa48('1139', '1140'),
                        typeof entity !==
                          (stryMutAct_9fa48('1141') ? '' : (stryCov_9fa48('1141'), 'object')))))
      ) {
        if (stryMutAct_9fa48('1142')) {
          {
          }
        } else {
          stryCov_9fa48('1142')
          return entity
        }
      }
      const sanitized = stryMutAct_9fa48('1143')
        ? {}
        : (stryCov_9fa48('1143'),
          {
            ...entity
          })
      const sensitiveFields = stryMutAct_9fa48('1144')
        ? []
        : (stryCov_9fa48('1144'),
          [
            stryMutAct_9fa48('1145') ? '' : (stryCov_9fa48('1145'), 'password'),
            stryMutAct_9fa48('1146') ? '' : (stryCov_9fa48('1146'), 'token'),
            stryMutAct_9fa48('1147') ? '' : (stryCov_9fa48('1147'), 'cardNumber'),
            stryMutAct_9fa48('1148') ? '' : (stryCov_9fa48('1148'), 'cvv'),
            stryMutAct_9fa48('1149') ? '' : (stryCov_9fa48('1149'), 'ssn')
          ])
      sensitiveFields.forEach(field => {
        if (stryMutAct_9fa48('1150')) {
          {
          }
        } else {
          stryCov_9fa48('1150')
          if (
            stryMutAct_9fa48('1152')
              ? false
              : stryMutAct_9fa48('1151')
                ? true
                : (stryCov_9fa48('1151', '1152'), sanitized[field])
          ) {
            if (stryMutAct_9fa48('1153')) {
              {
              }
            } else {
              stryCov_9fa48('1153')
              sanitized[field] = stryMutAct_9fa48('1154')
                ? ''
                : (stryCov_9fa48('1154'), '***REDACTED***')
            }
          }
        }
      })
      return sanitized
    }
  }

  /**
   * Validate order with all applicable rules
   */
  async validateOrder(orderData, context = {}) {
    if (stryMutAct_9fa48('1155')) {
      {
      }
    } else {
      stryCov_9fa48('1155')
      const allResults = stryMutAct_9fa48('1156')
        ? {}
        : (stryCov_9fa48('1156'),
          {
            passed: stryMutAct_9fa48('1157') ? ['Stryker was here'] : (stryCov_9fa48('1157'), []),
            failed: stryMutAct_9fa48('1158') ? ['Stryker was here'] : (stryCov_9fa48('1158'), []),
            warnings: stryMutAct_9fa48('1159') ? ['Stryker was here'] : (stryCov_9fa48('1159'), [])
          })

      // Evaluate order rules (pass the order object, not the full entity)
      const orderObj = stryMutAct_9fa48('1162')
        ? orderData.order && orderData
        : stryMutAct_9fa48('1161')
          ? false
          : stryMutAct_9fa48('1160')
            ? true
            : (stryCov_9fa48('1160', '1161', '1162'), orderData.order || orderData)
      const orderContext = stryMutAct_9fa48('1163')
        ? {}
        : (stryCov_9fa48('1163'),
          {
            ...context,
            items: stryMutAct_9fa48('1166')
              ? orderData.items && []
              : stryMutAct_9fa48('1165')
                ? false
                : stryMutAct_9fa48('1164')
                  ? true
                  : (stryCov_9fa48('1164', '1165', '1166'),
                    orderData.items ||
                      (stryMutAct_9fa48('1167')
                        ? ['Stryker was here']
                        : (stryCov_9fa48('1167'), [])))
          })
      const orderResults = await this.evaluateRules(
        stryMutAct_9fa48('1168') ? '' : (stryCov_9fa48('1168'), 'order'),
        orderObj,
        orderContext
      )
      allResults.passed.push(...orderResults.passed)
      allResults.failed.push(...orderResults.failed)
      allResults.warnings.push(...orderResults.warnings)

      // Note: Product-specific rules are handled in the service layer
      // No product rules are currently defined in the business rules engine

      // Evaluate payment rules if payment data provided
      if (
        stryMutAct_9fa48('1170')
          ? false
          : stryMutAct_9fa48('1169')
            ? true
            : (stryCov_9fa48('1169', '1170'), context.paymentData)
      ) {
        if (stryMutAct_9fa48('1171')) {
          {
          }
        } else {
          stryCov_9fa48('1171')
          const paymentResults = await this.evaluateRules(
            stryMutAct_9fa48('1172') ? '' : (stryCov_9fa48('1172'), 'payment'),
            context.paymentData,
            context
          )
          allResults.passed.push(...paymentResults.passed)
          allResults.failed.push(...paymentResults.failed)
          allResults.warnings.push(...paymentResults.warnings)
        }
      }

      // Evaluate customer rules if customer data provided
      if (
        stryMutAct_9fa48('1174')
          ? false
          : stryMutAct_9fa48('1173')
            ? true
            : (stryCov_9fa48('1173', '1174'), context.customerData)
      ) {
        if (stryMutAct_9fa48('1175')) {
          {
          }
        } else {
          stryCov_9fa48('1175')
          const customerResults = await this.evaluateRules(
            stryMutAct_9fa48('1176') ? '' : (stryCov_9fa48('1176'), 'customer'),
            context.customerData,
            stryMutAct_9fa48('1177')
              ? {}
              : (stryCov_9fa48('1177'),
                {
                  ...context,
                  orderAmount: orderObj.total_amount_usd
                })
          )
          allResults.passed.push(...customerResults.passed)
          allResults.failed.push(...customerResults.failed)
          allResults.warnings.push(...customerResults.warnings)
        }
      }
      return allResults
    }
  }

  /**
   * Get all rules for a group
   */
  getRulesByGroup(group) {
    if (stryMutAct_9fa48('1178')) {
      {
      }
    } else {
      stryCov_9fa48('1178')
      const rules = stryMutAct_9fa48('1179') ? ['Stryker was here'] : (stryCov_9fa48('1179'), [])
      const groupRules = this.ruleGroups.get(group)
      if (
        stryMutAct_9fa48('1181')
          ? false
          : stryMutAct_9fa48('1180')
            ? true
            : (stryCov_9fa48('1180', '1181'), groupRules)
      ) {
        if (stryMutAct_9fa48('1182')) {
          {
          }
        } else {
          stryCov_9fa48('1182')
          for (const ruleKey of groupRules) {
            if (stryMutAct_9fa48('1183')) {
              {
              }
            } else {
              stryCov_9fa48('1183')
              rules.push(this.rules.get(ruleKey))
            }
          }
        }
      }
      return rules
    }
  }

  /**
   * Get all available rule groups
   */
  getRuleGroups() {
    if (stryMutAct_9fa48('1184')) {
      {
      }
    } else {
      stryCov_9fa48('1184')
      return Array.from(this.ruleGroups.keys())
    }
  }

  /**
   * Get engine statistics
   */
  getStats() {
    if (stryMutAct_9fa48('1185')) {
      {
      }
    } else {
      stryCov_9fa48('1185')
      return stryMutAct_9fa48('1186')
        ? {}
        : (stryCov_9fa48('1186'),
          {
            totalRules: this.rules.size,
            ruleGroups: Array.from(this.ruleGroups.keys()),
            rulesByGroup: Object.fromEntries(
              Array.from(this.ruleGroups.entries()).map(
                stryMutAct_9fa48('1187')
                  ? () => undefined
                  : (stryCov_9fa48('1187'),
                    ([group, rules]) =>
                      stryMutAct_9fa48('1188') ? [] : (stryCov_9fa48('1188'), [group, rules.size]))
              )
            )
          })
    }
  }
}

// Global business rules engine instance
const businessRulesEngine = new BusinessRulesEngine()

/**
 * Middleware to apply business rules validation
 * LEGACY ELIMINADO: entityType ahora se usa dinámicamente, sanitizeEntity corregido
 */
export function validateBusinessRules(
  entityType = stryMutAct_9fa48('1189') ? '' : (stryCov_9fa48('1189'), 'order'),
  context = {}
) {
  if (stryMutAct_9fa48('1190')) {
    {
    }
  } else {
    stryCov_9fa48('1190')
    return async (req, res, next) => {
      if (stryMutAct_9fa48('1191')) {
        {
        }
      } else {
        stryCov_9fa48('1191')
        try {
          if (stryMutAct_9fa48('1192')) {
            {
            }
          } else {
            stryCov_9fa48('1192')
            const entity = req.body

            // LEGACY FIX: entityType se usa para seleccionar método dinámicamente
            const methodName = stryMutAct_9fa48('1193')
              ? ``
              : (stryCov_9fa48('1193'),
                `validate${stryMutAct_9fa48('1194') ? entityType.charAt(0).toUpperCase() - entityType.slice(1) : (stryCov_9fa48('1194'), (stryMutAct_9fa48('1196') ? entityType.toUpperCase() : stryMutAct_9fa48('1195') ? entityType.charAt(0).toLowerCase() : (stryCov_9fa48('1195', '1196'), entityType.charAt(0).toUpperCase())) + (stryMutAct_9fa48('1197') ? entityType : (stryCov_9fa48('1197'), entityType.slice(1))))}`)
            const validator = stryMutAct_9fa48('1200')
              ? businessRulesEngine[methodName] && businessRulesEngine.validateOrder
              : stryMutAct_9fa48('1199')
                ? false
                : stryMutAct_9fa48('1198')
                  ? true
                  : (stryCov_9fa48('1198', '1199', '1200'),
                    businessRulesEngine[methodName] || businessRulesEngine.validateOrder)
            const results = await validator.call(
              businessRulesEngine,
              entity,
              stryMutAct_9fa48('1201')
                ? {}
                : (stryCov_9fa48('1201'),
                  {
                    ...context,
                    user: req.user,
                    requestId: req.requestId
                  })
            )

            // LEGACY FIX: Variables intermedias consolidadas en un objeto
            const failuresBySeverity = stryMutAct_9fa48('1202')
              ? {}
              : (stryCov_9fa48('1202'),
                {
                  critical: stryMutAct_9fa48('1203')
                    ? results.failed
                    : (stryCov_9fa48('1203'),
                      results.failed.filter(
                        stryMutAct_9fa48('1204')
                          ? () => undefined
                          : (stryCov_9fa48('1204'),
                            r =>
                              stryMutAct_9fa48('1207')
                                ? r.severity !== SEVERITY.CRITICAL
                                : stryMutAct_9fa48('1206')
                                  ? false
                                  : stryMutAct_9fa48('1205')
                                    ? true
                                    : (stryCov_9fa48('1205', '1206', '1207'),
                                      r.severity === SEVERITY.CRITICAL))
                      )),
                  high: stryMutAct_9fa48('1208')
                    ? results.failed
                    : (stryCov_9fa48('1208'),
                      results.failed.filter(
                        stryMutAct_9fa48('1209')
                          ? () => undefined
                          : (stryCov_9fa48('1209'),
                            r =>
                              stryMutAct_9fa48('1212')
                                ? r.severity !== SEVERITY.HIGH
                                : stryMutAct_9fa48('1211')
                                  ? false
                                  : stryMutAct_9fa48('1210')
                                    ? true
                                    : (stryCov_9fa48('1210', '1211', '1212'),
                                      r.severity === SEVERITY.HIGH))
                      )),
                  medium: stryMutAct_9fa48('1213')
                    ? results.failed
                    : (stryCov_9fa48('1213'),
                      results.failed.filter(
                        stryMutAct_9fa48('1214')
                          ? () => undefined
                          : (stryCov_9fa48('1214'),
                            r =>
                              stryMutAct_9fa48('1217')
                                ? r.severity !== SEVERITY.MEDIUM
                                : stryMutAct_9fa48('1216')
                                  ? false
                                  : stryMutAct_9fa48('1215')
                                    ? true
                                    : (stryCov_9fa48('1215', '1216', '1217'),
                                      r.severity === SEVERITY.MEDIUM))
                      ))
                })
            if (
              stryMutAct_9fa48('1221')
                ? failuresBySeverity.critical.length <= 0
                : stryMutAct_9fa48('1220')
                  ? failuresBySeverity.critical.length >= 0
                  : stryMutAct_9fa48('1219')
                    ? false
                    : stryMutAct_9fa48('1218')
                      ? true
                      : (stryCov_9fa48('1218', '1219', '1220', '1221'),
                        failuresBySeverity.critical.length > 0)
            ) {
              if (stryMutAct_9fa48('1222')) {
                {
                }
              } else {
                stryCov_9fa48('1222')
                throw new ConflictError(
                  stryMutAct_9fa48('1223')
                    ? ''
                    : (stryCov_9fa48('1223'), 'Violación crítica de reglas de negocio'),
                  stryMutAct_9fa48('1224')
                    ? {}
                    : (stryCov_9fa48('1224'),
                      {
                        violations: failuresBySeverity.critical
                      })
                )
              }
            }
            if (
              stryMutAct_9fa48('1228')
                ? failuresBySeverity.high.length <= 0
                : stryMutAct_9fa48('1227')
                  ? failuresBySeverity.high.length >= 0
                  : stryMutAct_9fa48('1226')
                    ? false
                    : stryMutAct_9fa48('1225')
                      ? true
                      : (stryCov_9fa48('1225', '1226', '1227', '1228'),
                        failuresBySeverity.high.length > 0)
            ) {
              if (stryMutAct_9fa48('1229')) {
                {
                }
              } else {
                stryCov_9fa48('1229')
                throw new ValidationError(
                  stryMutAct_9fa48('1230')
                    ? ''
                    : (stryCov_9fa48('1230'), 'Violación de reglas de negocio'),
                  failuresBySeverity.high
                )
              }
            }
            if (
              stryMutAct_9fa48('1234')
                ? failuresBySeverity.medium.length <= 0
                : stryMutAct_9fa48('1233')
                  ? failuresBySeverity.medium.length >= 0
                  : stryMutAct_9fa48('1232')
                    ? false
                    : stryMutAct_9fa48('1231')
                      ? true
                      : (stryCov_9fa48('1231', '1232', '1233', '1234'),
                        failuresBySeverity.medium.length > 0)
            ) {
              if (stryMutAct_9fa48('1235')) {
                {
                }
              } else {
                stryCov_9fa48('1235')
                businessRulesEngine.logger.warn(
                  stryMutAct_9fa48('1236')
                    ? ''
                    : (stryCov_9fa48('1236'), 'Business rules violations (MEDIUM)'),
                  stryMutAct_9fa48('1237')
                    ? {}
                    : (stryCov_9fa48('1237'),
                      {
                        violations: failuresBySeverity.medium,
                        // LEGACY FIX: businessRulesEngine.sanitizeEntity en lugar de 'this'
                        entity: stryMutAct_9fa48('1240')
                          ? businessRulesEngine.sanitizeEntity?.(entity) && entity
                          : stryMutAct_9fa48('1239')
                            ? false
                            : stryMutAct_9fa48('1238')
                              ? true
                              : (stryCov_9fa48('1238', '1239', '1240'),
                                (stryMutAct_9fa48('1241')
                                  ? businessRulesEngine.sanitizeEntity(entity)
                                  : (stryCov_9fa48('1241'),
                                    businessRulesEngine.sanitizeEntity?.(entity))) || entity)
                      })
                )
                throw new BadRequestError(
                  stryMutAct_9fa48('1242')
                    ? ''
                    : (stryCov_9fa48('1242'), 'Datos del pedido inválidos'),
                  stryMutAct_9fa48('1243')
                    ? {}
                    : (stryCov_9fa48('1243'),
                      {
                        violations: failuresBySeverity.medium
                      })
                )
              }
            }

            // Add warnings to response headers if any
            if (
              stryMutAct_9fa48('1247')
                ? results.warnings.length <= 0
                : stryMutAct_9fa48('1246')
                  ? results.warnings.length >= 0
                  : stryMutAct_9fa48('1245')
                    ? false
                    : stryMutAct_9fa48('1244')
                      ? true
                      : (stryCov_9fa48('1244', '1245', '1246', '1247'), results.warnings.length > 0)
            ) {
              if (stryMutAct_9fa48('1248')) {
                {
                }
              } else {
                stryCov_9fa48('1248')
                res.set(
                  stryMutAct_9fa48('1249') ? '' : (stryCov_9fa48('1249'), 'X-Business-Warnings'),
                  JSON.stringify(results.warnings)
                )
              }
            }

            // Store results for potential use in controllers
            req.businessRulesResults = results
            next()
          }
        } catch (error) {
          if (stryMutAct_9fa48('1250')) {
            {
            }
          } else {
            stryCov_9fa48('1250')
            next(error)
          }
        }
      }
    }
  }
}

/**
 * Get business rules engine status
 */
export function getBusinessRulesStatus(req, res) {
  if (stryMutAct_9fa48('1251')) {
    {
    }
  } else {
    stryCov_9fa48('1251')
    const stats = businessRulesEngine.getStats()
    const groups = businessRulesEngine.getRuleGroups()
    const status = stryMutAct_9fa48('1252')
      ? {}
      : (stryCov_9fa48('1252'),
        {
          ...stats,
          groups: groups.map(
            stryMutAct_9fa48('1253')
              ? () => undefined
              : (stryCov_9fa48('1253'),
                group =>
                  stryMutAct_9fa48('1254')
                    ? {}
                    : (stryCov_9fa48('1254'),
                      {
                        name: group,
                        rules: businessRulesEngine.getRulesByGroup(group)
                      }))
          ),
          timestamp: new Date().toISOString()
        })
    res.json(
      stryMutAct_9fa48('1255')
        ? {}
        : (stryCov_9fa48('1255'),
          {
            success: stryMutAct_9fa48('1256') ? false : (stryCov_9fa48('1256'), true),
            data: status
          })
    )
  }
}

/**
 * Export the engine instance for direct use
 */
export { businessRulesEngine, BusinessRulesEngine }
export default businessRulesEngine

// ============================================================================
// COMPATIBILITY FUNCTIONS FOR TESTS
// ============================================================================
// These functions provide a simple interface for tests while using the engine internally

/**
 * Validate order amount is within business limits
 * @param {number} amount - Order amount in USD
 * @throws {ValidationError} If amount is outside allowed limits
 */
export function validateOrderAmount(amount) {
  if (stryMutAct_9fa48('1257')) {
    {
    }
  } else {
    stryCov_9fa48('1257')
    if (
      stryMutAct_9fa48('1260')
        ? typeof amount !== 'number' && amount < 0
        : stryMutAct_9fa48('1259')
          ? false
          : stryMutAct_9fa48('1258')
            ? true
            : (stryCov_9fa48('1258', '1259', '1260'),
              (stryMutAct_9fa48('1262')
                ? typeof amount === 'number'
                : stryMutAct_9fa48('1261')
                  ? false
                  : (stryCov_9fa48('1261', '1262'),
                    typeof amount !==
                      (stryMutAct_9fa48('1263') ? '' : (stryCov_9fa48('1263'), 'number')))) ||
                (stryMutAct_9fa48('1266')
                  ? amount >= 0
                  : stryMutAct_9fa48('1265')
                    ? amount <= 0
                    : stryMutAct_9fa48('1264')
                      ? false
                      : (stryCov_9fa48('1264', '1265', '1266'), amount < 0)))
    ) {
      if (stryMutAct_9fa48('1267')) {
        {
        }
      } else {
        stryCov_9fa48('1267')
        throw new ValidationError(
          stryMutAct_9fa48('1268')
            ? ''
            : (stryCov_9fa48('1268'),
              'ValidationError: Order amount must be a non-negative number'),
          stryMutAct_9fa48('1269')
            ? {}
            : (stryCov_9fa48('1269'),
              {
                amount
              })
        )
      }
    }
    if (
      stryMutAct_9fa48('1273')
        ? amount >= 1
        : stryMutAct_9fa48('1272')
          ? amount <= 1
          : stryMutAct_9fa48('1271')
            ? false
            : stryMutAct_9fa48('1270')
              ? true
              : (stryCov_9fa48('1270', '1271', '1272', '1273'), amount < 1)
    ) {
      if (stryMutAct_9fa48('1274')) {
        {
        }
      } else {
        stryCov_9fa48('1274')
        throw new ValidationError(
          stryMutAct_9fa48('1275')
            ? ''
            : (stryCov_9fa48('1275'), 'ValidationError: Order amount must be at least $1 USD'),
          stryMutAct_9fa48('1276')
            ? {}
            : (stryCov_9fa48('1276'),
              {
                amount
              })
        )
      }
    }
    if (
      stryMutAct_9fa48('1280')
        ? amount <= 10000
        : stryMutAct_9fa48('1279')
          ? amount >= 10000
          : stryMutAct_9fa48('1278')
            ? false
            : stryMutAct_9fa48('1277')
              ? true
              : (stryCov_9fa48('1277', '1278', '1279', '1280'), amount > 10000)
    ) {
      if (stryMutAct_9fa48('1281')) {
        {
        }
      } else {
        stryCov_9fa48('1281')
        throw new ValidationError(
          stryMutAct_9fa48('1282')
            ? ''
            : (stryCov_9fa48('1282'), 'ValidationError: Order amount cannot exceed $10,000 USD'),
          stryMutAct_9fa48('1283')
            ? {}
            : (stryCov_9fa48('1283'),
              {
                amount
              })
        )
      }
    }
    return stryMutAct_9fa48('1284') ? false : (stryCov_9fa48('1284'), true)
  }
}

/**
 * Validate product stock
 * @param {number} stock - Stock quantity
 * @throws {ValidationError} If stock is invalid
 */
export function validateProductStock(stock) {
  if (stryMutAct_9fa48('1285')) {
    {
    }
  } else {
    stryCov_9fa48('1285')
    if (
      stryMutAct_9fa48('1288')
        ? typeof stock === 'number'
        : stryMutAct_9fa48('1287')
          ? false
          : stryMutAct_9fa48('1286')
            ? true
            : (stryCov_9fa48('1286', '1287', '1288'),
              typeof stock !== (stryMutAct_9fa48('1289') ? '' : (stryCov_9fa48('1289'), 'number')))
    ) {
      if (stryMutAct_9fa48('1290')) {
        {
        }
      } else {
        stryCov_9fa48('1290')
        throw new ValidationError(
          stryMutAct_9fa48('1291')
            ? ''
            : (stryCov_9fa48('1291'), 'ValidationError: Stock must be a number'),
          stryMutAct_9fa48('1292')
            ? {}
            : (stryCov_9fa48('1292'),
              {
                stock
              })
        )
      }
    }
    if (
      stryMutAct_9fa48('1296')
        ? stock >= 0
        : stryMutAct_9fa48('1295')
          ? stock <= 0
          : stryMutAct_9fa48('1294')
            ? false
            : stryMutAct_9fa48('1293')
              ? true
              : (stryCov_9fa48('1293', '1294', '1295', '1296'), stock < 0)
    ) {
      if (stryMutAct_9fa48('1297')) {
        {
        }
      } else {
        stryCov_9fa48('1297')
        throw new ValidationError(
          stryMutAct_9fa48('1298')
            ? ''
            : (stryCov_9fa48('1298'), 'ValidationError: Stock cannot be negative'),
          stryMutAct_9fa48('1299')
            ? {}
            : (stryCov_9fa48('1299'),
              {
                stock
              })
        )
      }
    }
    if (
      stryMutAct_9fa48('1302')
        ? stock !== 0
        : stryMutAct_9fa48('1301')
          ? false
          : stryMutAct_9fa48('1300')
            ? true
            : (stryCov_9fa48('1300', '1301', '1302'), stock === 0)
    ) {
      if (stryMutAct_9fa48('1303')) {
        {
        }
      } else {
        stryCov_9fa48('1303')
        throw new ValidationError(
          stryMutAct_9fa48('1304')
            ? ''
            : (stryCov_9fa48('1304'), 'ValidationError: Stock cannot be zero'),
          stryMutAct_9fa48('1305')
            ? {}
            : (stryCov_9fa48('1305'),
              {
                stock
              })
        )
      }
    }
    if (
      stryMutAct_9fa48('1309')
        ? stock <= 10000
        : stryMutAct_9fa48('1308')
          ? stock >= 10000
          : stryMutAct_9fa48('1307')
            ? false
            : stryMutAct_9fa48('1306')
              ? true
              : (stryCov_9fa48('1306', '1307', '1308', '1309'), stock > 10000)
    ) {
      if (stryMutAct_9fa48('1310')) {
        {
        }
      } else {
        stryCov_9fa48('1310')
        throw new ValidationError(
          stryMutAct_9fa48('1311')
            ? ''
            : (stryCov_9fa48('1311'), 'ValidationError: Stock cannot exceed 10,000 units'),
          stryMutAct_9fa48('1312')
            ? {}
            : (stryCov_9fa48('1312'),
              {
                stock
              })
        )
      }
    }
    return stryMutAct_9fa48('1313') ? false : (stryCov_9fa48('1313'), true)
  }
}

/**
 * Validate price range
 * @param {number} price - Price in USD
 * @throws {ValidationError} If price is outside allowed range
 */
export function validatePriceRange(price) {
  if (stryMutAct_9fa48('1314')) {
    {
    }
  } else {
    stryCov_9fa48('1314')
    if (
      stryMutAct_9fa48('1317')
        ? typeof price !== 'number' && price < 0
        : stryMutAct_9fa48('1316')
          ? false
          : stryMutAct_9fa48('1315')
            ? true
            : (stryCov_9fa48('1315', '1316', '1317'),
              (stryMutAct_9fa48('1319')
                ? typeof price === 'number'
                : stryMutAct_9fa48('1318')
                  ? false
                  : (stryCov_9fa48('1318', '1319'),
                    typeof price !==
                      (stryMutAct_9fa48('1320') ? '' : (stryCov_9fa48('1320'), 'number')))) ||
                (stryMutAct_9fa48('1323')
                  ? price >= 0
                  : stryMutAct_9fa48('1322')
                    ? price <= 0
                    : stryMutAct_9fa48('1321')
                      ? false
                      : (stryCov_9fa48('1321', '1322', '1323'), price < 0)))
    ) {
      if (stryMutAct_9fa48('1324')) {
        {
        }
      } else {
        stryCov_9fa48('1324')
        throw new ValidationError(
          stryMutAct_9fa48('1325')
            ? ''
            : (stryCov_9fa48('1325'), 'ValidationError: Price must be a non-negative number'),
          stryMutAct_9fa48('1326')
            ? {}
            : (stryCov_9fa48('1326'),
              {
                price
              })
        )
      }
    }
    if (
      stryMutAct_9fa48('1330')
        ? price >= 5
        : stryMutAct_9fa48('1329')
          ? price <= 5
          : stryMutAct_9fa48('1328')
            ? false
            : stryMutAct_9fa48('1327')
              ? true
              : (stryCov_9fa48('1327', '1328', '1329', '1330'), price < 5)
    ) {
      if (stryMutAct_9fa48('1331')) {
        {
        }
      } else {
        stryCov_9fa48('1331')
        throw new ValidationError(
          stryMutAct_9fa48('1332')
            ? ''
            : (stryCov_9fa48('1332'), 'ValidationError: Price must be at least $5 USD'),
          stryMutAct_9fa48('1333')
            ? {}
            : (stryCov_9fa48('1333'),
              {
                price
              })
        )
      }
    }
    if (
      stryMutAct_9fa48('1337')
        ? price <= 1000
        : stryMutAct_9fa48('1336')
          ? price >= 1000
          : stryMutAct_9fa48('1335')
            ? false
            : stryMutAct_9fa48('1334')
              ? true
              : (stryCov_9fa48('1334', '1335', '1336', '1337'), price > 1000)
    ) {
      if (stryMutAct_9fa48('1338')) {
        {
        }
      } else {
        stryCov_9fa48('1338')
        throw new ValidationError(
          stryMutAct_9fa48('1339')
            ? ''
            : (stryCov_9fa48('1339'), 'ValidationError: Price cannot exceed $1000 USD'),
          stryMutAct_9fa48('1340')
            ? {}
            : (stryCov_9fa48('1340'),
              {
                price
              })
        )
      }
    }
    return stryMutAct_9fa48('1341') ? false : (stryCov_9fa48('1341'), true)
  }
}

/**
 * Validate customer information
 * @param {Object} customer - Customer data
 * @throws {ValidationError} If customer data is invalid
 */
export function validateCustomerInfo(customer) {
  if (stryMutAct_9fa48('1342')) {
    {
    }
  } else {
    stryCov_9fa48('1342')
    if (
      stryMutAct_9fa48('1345')
        ? !customer && typeof customer !== 'object'
        : stryMutAct_9fa48('1344')
          ? false
          : stryMutAct_9fa48('1343')
            ? true
            : (stryCov_9fa48('1343', '1344', '1345'),
              (stryMutAct_9fa48('1346') ? customer : (stryCov_9fa48('1346'), !customer)) ||
                (stryMutAct_9fa48('1348')
                  ? typeof customer === 'object'
                  : stryMutAct_9fa48('1347')
                    ? false
                    : (stryCov_9fa48('1347', '1348'),
                      typeof customer !==
                        (stryMutAct_9fa48('1349') ? '' : (stryCov_9fa48('1349'), 'object')))))
    ) {
      if (stryMutAct_9fa48('1350')) {
        {
        }
      } else {
        stryCov_9fa48('1350')
        throw new ValidationError(
          stryMutAct_9fa48('1351')
            ? ''
            : (stryCov_9fa48('1351'), 'ValidationError: Customer information is required')
        )
      }
    }
    if (
      stryMutAct_9fa48('1354')
        ? false
        : stryMutAct_9fa48('1353')
          ? true
          : stryMutAct_9fa48('1352')
            ? customer.email
            : (stryCov_9fa48('1352', '1353', '1354'), !customer.email)
    ) {
      if (stryMutAct_9fa48('1355')) {
        {
        }
      } else {
        stryCov_9fa48('1355')
        throw new ValidationError(
          stryMutAct_9fa48('1356')
            ? ''
            : (stryCov_9fa48('1356'), 'ValidationError: Customer email is required')
        )
      }
    }

    // Basic email validation
    const emailRegex = stryMutAct_9fa48('1367')
      ? /^[^\s@]+@[^\s@]+\.[^\S@]+$/
      : stryMutAct_9fa48('1366')
        ? /^[^\s@]+@[^\s@]+\.[\s@]+$/
        : stryMutAct_9fa48('1365')
          ? /^[^\s@]+@[^\s@]+\.[^\s@]$/
          : stryMutAct_9fa48('1364')
            ? /^[^\s@]+@[^\S@]+\.[^\s@]+$/
            : stryMutAct_9fa48('1363')
              ? /^[^\s@]+@[\s@]+\.[^\s@]+$/
              : stryMutAct_9fa48('1362')
                ? /^[^\s@]+@[^\s@]\.[^\s@]+$/
                : stryMutAct_9fa48('1361')
                  ? /^[^\S@]+@[^\s@]+\.[^\s@]+$/
                  : stryMutAct_9fa48('1360')
                    ? /^[\s@]+@[^\s@]+\.[^\s@]+$/
                    : stryMutAct_9fa48('1359')
                      ? /^[^\s@]@[^\s@]+\.[^\s@]+$/
                      : stryMutAct_9fa48('1358')
                        ? /^[^\s@]+@[^\s@]+\.[^\s@]+/
                        : stryMutAct_9fa48('1357')
                          ? /[^\s@]+@[^\s@]+\.[^\s@]+$/
                          : (stryCov_9fa48(
                              '1357',
                              '1358',
                              '1359',
                              '1360',
                              '1361',
                              '1362',
                              '1363',
                              '1364',
                              '1365',
                              '1366',
                              '1367'
                            ),
                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    if (
      stryMutAct_9fa48('1370')
        ? false
        : stryMutAct_9fa48('1369')
          ? true
          : stryMutAct_9fa48('1368')
            ? emailRegex.test(customer.email)
            : (stryCov_9fa48('1368', '1369', '1370'), !emailRegex.test(customer.email))
    ) {
      if (stryMutAct_9fa48('1371')) {
        {
        }
      } else {
        stryCov_9fa48('1371')
        throw new ValidationError(
          stryMutAct_9fa48('1372')
            ? ''
            : (stryCov_9fa48('1372'), 'ValidationError: Invalid email format'),
          stryMutAct_9fa48('1373')
            ? {}
            : (stryCov_9fa48('1373'),
              {
                email: customer.email
              })
        )
      }
    }

    // Support both name and full_name
    const name = stryMutAct_9fa48('1376')
      ? customer.full_name && customer.name
      : stryMutAct_9fa48('1375')
        ? false
        : stryMutAct_9fa48('1374')
          ? true
          : (stryCov_9fa48('1374', '1375', '1376'), customer.full_name || customer.name)
    if (
      stryMutAct_9fa48('1379')
        ? !name && name.trim().length < 2
        : stryMutAct_9fa48('1378')
          ? false
          : stryMutAct_9fa48('1377')
            ? true
            : (stryCov_9fa48('1377', '1378', '1379'),
              (stryMutAct_9fa48('1380') ? name : (stryCov_9fa48('1380'), !name)) ||
                (stryMutAct_9fa48('1383')
                  ? name.trim().length >= 2
                  : stryMutAct_9fa48('1382')
                    ? name.trim().length <= 2
                    : stryMutAct_9fa48('1381')
                      ? false
                      : (stryCov_9fa48('1381', '1382', '1383'),
                        (stryMutAct_9fa48('1384')
                          ? name.length
                          : (stryCov_9fa48('1384'), name.trim().length)) < 2)))
    ) {
      if (stryMutAct_9fa48('1385')) {
        {
        }
      } else {
        stryCov_9fa48('1385')
        throw new ValidationError(
          stryMutAct_9fa48('1386')
            ? ''
            : (stryCov_9fa48('1386'),
              'ValidationError: Customer name must be at least 2 characters')
        )
      }
    }
    if (
      stryMutAct_9fa48('1389')
        ? false
        : stryMutAct_9fa48('1388')
          ? true
          : stryMutAct_9fa48('1387')
            ? customer.phone
            : (stryCov_9fa48('1387', '1388', '1389'), !customer.phone)
    ) {
      if (stryMutAct_9fa48('1390')) {
        {
        }
      } else {
        stryCov_9fa48('1390')
        throw new ValidationError(
          stryMutAct_9fa48('1391')
            ? ''
            : (stryCov_9fa48('1391'), 'ValidationError: Customer phone is required')
        )
      }
    }

    // Validate phone format (simple check for Venezuelan format)
    const phoneRegex = stryMutAct_9fa48('1399')
      ? /^\+?58?\s?[^0-9]{10,11}$/
      : stryMutAct_9fa48('1398')
        ? /^\+?58?\s?[0-9]$/
        : stryMutAct_9fa48('1397')
          ? /^\+?58?\S?[0-9]{10,11}$/
          : stryMutAct_9fa48('1396')
            ? /^\+?58?\s[0-9]{10,11}$/
            : stryMutAct_9fa48('1395')
              ? /^\+?58\s?[0-9]{10,11}$/
              : stryMutAct_9fa48('1394')
                ? /^\+58?\s?[0-9]{10,11}$/
                : stryMutAct_9fa48('1393')
                  ? /^\+?58?\s?[0-9]{10,11}/
                  : stryMutAct_9fa48('1392')
                    ? /\+?58?\s?[0-9]{10,11}$/
                    : (stryCov_9fa48(
                        '1392',
                        '1393',
                        '1394',
                        '1395',
                        '1396',
                        '1397',
                        '1398',
                        '1399'
                      ),
                      /^\+?58?\s?[0-9]{10,11}$/)
    if (
      stryMutAct_9fa48('1402')
        ? false
        : stryMutAct_9fa48('1401')
          ? true
          : stryMutAct_9fa48('1400')
            ? phoneRegex.test(customer.phone)
            : (stryCov_9fa48('1400', '1401', '1402'), !phoneRegex.test(customer.phone))
    ) {
      if (stryMutAct_9fa48('1403')) {
        {
        }
      } else {
        stryCov_9fa48('1403')
        throw new ValidationError(
          stryMutAct_9fa48('1404')
            ? ''
            : (stryCov_9fa48('1404'), 'ValidationError: Invalid phone format')
        )
      }
    }
    return stryMutAct_9fa48('1405') ? false : (stryCov_9fa48('1405'), true)
  }
}

/**
 * Validate delivery address
 * @param {string} address - Delivery address
 * @throws {ValidationError} If address is invalid
 */
export function validateDeliveryAddress(address) {
  if (stryMutAct_9fa48('1406')) {
    {
    }
  } else {
    stryCov_9fa48('1406')
    if (
      stryMutAct_9fa48('1409')
        ? !address && typeof address !== 'string'
        : stryMutAct_9fa48('1408')
          ? false
          : stryMutAct_9fa48('1407')
            ? true
            : (stryCov_9fa48('1407', '1408', '1409'),
              (stryMutAct_9fa48('1410') ? address : (stryCov_9fa48('1410'), !address)) ||
                (stryMutAct_9fa48('1412')
                  ? typeof address === 'string'
                  : stryMutAct_9fa48('1411')
                    ? false
                    : (stryCov_9fa48('1411', '1412'),
                      typeof address !==
                        (stryMutAct_9fa48('1413') ? '' : (stryCov_9fa48('1413'), 'string')))))
    ) {
      if (stryMutAct_9fa48('1414')) {
        {
        }
      } else {
        stryCov_9fa48('1414')
        throw new ValidationError(
          stryMutAct_9fa48('1415')
            ? ''
            : (stryCov_9fa48('1415'), 'ValidationError: Delivery address is required')
        )
      }
    }
    const trimmed = stryMutAct_9fa48('1416') ? address : (stryCov_9fa48('1416'), address.trim())
    if (
      stryMutAct_9fa48('1419')
        ? trimmed.length !== 0
        : stryMutAct_9fa48('1418')
          ? false
          : stryMutAct_9fa48('1417')
            ? true
            : (stryCov_9fa48('1417', '1418', '1419'), trimmed.length === 0)
    ) {
      if (stryMutAct_9fa48('1420')) {
        {
        }
      } else {
        stryCov_9fa48('1420')
        throw new ValidationError(
          stryMutAct_9fa48('1421')
            ? ''
            : (stryCov_9fa48('1421'), 'ValidationError: Delivery address cannot be empty')
        )
      }
    }
    if (
      stryMutAct_9fa48('1425')
        ? trimmed.length >= 10
        : stryMutAct_9fa48('1424')
          ? trimmed.length <= 10
          : stryMutAct_9fa48('1423')
            ? false
            : stryMutAct_9fa48('1422')
              ? true
              : (stryCov_9fa48('1422', '1423', '1424', '1425'), trimmed.length < 10)
    ) {
      if (stryMutAct_9fa48('1426')) {
        {
        }
      } else {
        stryCov_9fa48('1426')
        throw new ValidationError(
          stryMutAct_9fa48('1427')
            ? ''
            : (stryCov_9fa48('1427'),
              'ValidationError: Delivery address must be at least 10 characters')
        )
      }
    }
    if (
      stryMutAct_9fa48('1431')
        ? trimmed.length <= 200
        : stryMutAct_9fa48('1430')
          ? trimmed.length >= 200
          : stryMutAct_9fa48('1429')
            ? false
            : stryMutAct_9fa48('1428')
              ? true
              : (stryCov_9fa48('1428', '1429', '1430', '1431'), trimmed.length > 200)
    ) {
      if (stryMutAct_9fa48('1432')) {
        {
        }
      } else {
        stryCov_9fa48('1432')
        throw new ValidationError(
          stryMutAct_9fa48('1433')
            ? ''
            : (stryCov_9fa48('1433'),
              'ValidationError: Delivery address cannot exceed 200 characters')
        )
      }
    }
    return stryMutAct_9fa48('1434') ? false : (stryCov_9fa48('1434'), true)
  }
}

/**
 * Validate payment amount
 * Test expects: validatePaymentAmount(orderAmount, paymentAmount)
 * @param {number} orderAmount - Order amount
 * @param {number} paymentAmount - Payment amount
 * @throws {ValidationError} If payment is invalid
 */
export function validatePaymentAmount(orderAmount, paymentAmount) {
  if (stryMutAct_9fa48('1435')) {
    {
    }
  } else {
    stryCov_9fa48('1435')
    // Support both calling patterns
    const amount = (
      stryMutAct_9fa48('1438')
        ? typeof orderAmount === 'number' || typeof paymentAmount === 'number'
        : stryMutAct_9fa48('1437')
          ? false
          : stryMutAct_9fa48('1436')
            ? true
            : (stryCov_9fa48('1436', '1437', '1438'),
              (stryMutAct_9fa48('1440')
                ? typeof orderAmount !== 'number'
                : stryMutAct_9fa48('1439')
                  ? true
                  : (stryCov_9fa48('1439', '1440'),
                    typeof orderAmount ===
                      (stryMutAct_9fa48('1441') ? '' : (stryCov_9fa48('1441'), 'number')))) &&
                (stryMutAct_9fa48('1443')
                  ? typeof paymentAmount !== 'number'
                  : stryMutAct_9fa48('1442')
                    ? true
                    : (stryCov_9fa48('1442', '1443'),
                      typeof paymentAmount ===
                        (stryMutAct_9fa48('1444') ? '' : (stryCov_9fa48('1444'), 'number')))))
    )
      ? paymentAmount
      : orderAmount
    const orderAmt = (
      stryMutAct_9fa48('1447')
        ? typeof orderAmount === 'number' || typeof paymentAmount === 'number'
        : stryMutAct_9fa48('1446')
          ? false
          : stryMutAct_9fa48('1445')
            ? true
            : (stryCov_9fa48('1445', '1446', '1447'),
              (stryMutAct_9fa48('1449')
                ? typeof orderAmount !== 'number'
                : stryMutAct_9fa48('1448')
                  ? true
                  : (stryCov_9fa48('1448', '1449'),
                    typeof orderAmount ===
                      (stryMutAct_9fa48('1450') ? '' : (stryCov_9fa48('1450'), 'number')))) &&
                (stryMutAct_9fa48('1452')
                  ? typeof paymentAmount !== 'number'
                  : stryMutAct_9fa48('1451')
                    ? true
                    : (stryCov_9fa48('1451', '1452'),
                      typeof paymentAmount ===
                        (stryMutAct_9fa48('1453') ? '' : (stryCov_9fa48('1453'), 'number')))))
    )
      ? orderAmount
      : undefined
    if (
      stryMutAct_9fa48('1456')
        ? typeof amount === 'number'
        : stryMutAct_9fa48('1455')
          ? false
          : stryMutAct_9fa48('1454')
            ? true
            : (stryCov_9fa48('1454', '1455', '1456'),
              typeof amount !== (stryMutAct_9fa48('1457') ? '' : (stryCov_9fa48('1457'), 'number')))
    ) {
      if (stryMutAct_9fa48('1458')) {
        {
        }
      } else {
        stryCov_9fa48('1458')
        throw new ValidationError(
          stryMutAct_9fa48('1459')
            ? ''
            : (stryCov_9fa48('1459'), 'ValidationError: Payment amount must be a number'),
          stryMutAct_9fa48('1460')
            ? {}
            : (stryCov_9fa48('1460'),
              {
                paymentAmount
              })
        )
      }
    }
    if (
      stryMutAct_9fa48('1464')
        ? amount > 0
        : stryMutAct_9fa48('1463')
          ? amount < 0
          : stryMutAct_9fa48('1462')
            ? false
            : stryMutAct_9fa48('1461')
              ? true
              : (stryCov_9fa48('1461', '1462', '1463', '1464'), amount <= 0)
    ) {
      if (stryMutAct_9fa48('1465')) {
        {
        }
      } else {
        stryCov_9fa48('1465')
        throw new ValidationError(
          stryMutAct_9fa48('1466')
            ? ''
            : (stryCov_9fa48('1466'), 'ValidationError: Payment amount must be greater than zero')
        )
      }
    }

    // Allow partial payments (amount <= orderAmount)
    // Only reject if amount exceeds order amount
    if (
      stryMutAct_9fa48('1469')
        ? typeof orderAmt === 'number' || amount > orderAmt
        : stryMutAct_9fa48('1468')
          ? false
          : stryMutAct_9fa48('1467')
            ? true
            : (stryCov_9fa48('1467', '1468', '1469'),
              (stryMutAct_9fa48('1471')
                ? typeof orderAmt !== 'number'
                : stryMutAct_9fa48('1470')
                  ? true
                  : (stryCov_9fa48('1470', '1471'),
                    typeof orderAmt ===
                      (stryMutAct_9fa48('1472') ? '' : (stryCov_9fa48('1472'), 'number')))) &&
                (stryMutAct_9fa48('1475')
                  ? amount <= orderAmt
                  : stryMutAct_9fa48('1474')
                    ? amount >= orderAmt
                    : stryMutAct_9fa48('1473')
                      ? true
                      : (stryCov_9fa48('1473', '1474', '1475'), amount > orderAmt)))
    ) {
      if (stryMutAct_9fa48('1476')) {
        {
        }
      } else {
        stryCov_9fa48('1476')
        throw new ValidationError(
          stryMutAct_9fa48('1477')
            ? ''
            : (stryCov_9fa48('1477'), 'ValidationError: Payment amount cannot exceed order amount'),
          stryMutAct_9fa48('1478')
            ? {}
            : (stryCov_9fa48('1478'),
              {
                paymentAmount: amount,
                orderAmount: orderAmt
              })
        )
      }
    }
    if (
      stryMutAct_9fa48('1482')
        ? amount <= 5000
        : stryMutAct_9fa48('1481')
          ? amount >= 5000
          : stryMutAct_9fa48('1480')
            ? false
            : stryMutAct_9fa48('1479')
              ? true
              : (stryCov_9fa48('1479', '1480', '1481', '1482'), amount > 5000)
    ) {
      if (stryMutAct_9fa48('1483')) {
        {
        }
      } else {
        stryCov_9fa48('1483')
        throw new ValidationError(
          stryMutAct_9fa48('1484')
            ? ''
            : (stryCov_9fa48('1484'), 'ValidationError: Payment amount cannot exceed $5000 USD'),
          stryMutAct_9fa48('1485')
            ? {}
            : (stryCov_9fa48('1485'),
              {
                paymentAmount: amount
              })
        )
      }
    }
    return stryMutAct_9fa48('1486') ? false : (stryCov_9fa48('1486'), true)
  }
}

/**
 * Enforce business hours for orders
 * @param {Date} date - Order date (defaults to now)
 * @throws {ValidationError} If outside business hours
 */
export function enforceBusinessHours(date = new Date()) {
  if (stryMutAct_9fa48('1487')) {
    {
    }
  } else {
    stryCov_9fa48('1487')
    const orderDate = date instanceof Date ? date : new Date(date)
    const hour = orderDate.getHours()
    const day = orderDate.getDay() // 0 = Sunday, 6 = Saturday

    // Weekend check
    if (
      stryMutAct_9fa48('1490')
        ? day === 0 && day === 6
        : stryMutAct_9fa48('1489')
          ? false
          : stryMutAct_9fa48('1488')
            ? true
            : (stryCov_9fa48('1488', '1489', '1490'),
              (stryMutAct_9fa48('1492')
                ? day !== 0
                : stryMutAct_9fa48('1491')
                  ? false
                  : (stryCov_9fa48('1491', '1492'), day === 0)) ||
                (stryMutAct_9fa48('1494')
                  ? day !== 6
                  : stryMutAct_9fa48('1493')
                    ? false
                    : (stryCov_9fa48('1493', '1494'), day === 6)))
    ) {
      if (stryMutAct_9fa48('1495')) {
        {
        }
      } else {
        stryCov_9fa48('1495')
        throw new ValidationError(
          stryMutAct_9fa48('1496')
            ? ''
            : (stryCov_9fa48('1496'), 'ValidationError: Orders cannot be placed on weekends')
        )
      }
    }

    // Business hours: 8 AM - 8 PM
    if (
      stryMutAct_9fa48('1499')
        ? hour < 8 && hour > 20
        : stryMutAct_9fa48('1498')
          ? false
          : stryMutAct_9fa48('1497')
            ? true
            : (stryCov_9fa48('1497', '1498', '1499'),
              (stryMutAct_9fa48('1502')
                ? hour >= 8
                : stryMutAct_9fa48('1501')
                  ? hour <= 8
                  : stryMutAct_9fa48('1500')
                    ? false
                    : (stryCov_9fa48('1500', '1501', '1502'), hour < 8)) ||
                (stryMutAct_9fa48('1505')
                  ? hour <= 20
                  : stryMutAct_9fa48('1504')
                    ? hour >= 20
                    : stryMutAct_9fa48('1503')
                      ? false
                      : (stryCov_9fa48('1503', '1504', '1505'), hour > 20)))
    ) {
      if (stryMutAct_9fa48('1506')) {
        {
        }
      } else {
        stryCov_9fa48('1506')
        throw new ValidationError(
          stryMutAct_9fa48('1507')
            ? ''
            : (stryCov_9fa48('1507'),
              'ValidationError: Orders can only be placed between 8 AM and 8 PM')
        )
      }
    }
    return stryMutAct_9fa48('1508') ? false : (stryCov_9fa48('1508'), true)
  }
}

/**
 * Validate carousel limit
 * @param {number} limit - Carousel limit
 * @throws {ValidationError} If limit is invalid
 */
export function validateCarouselLimit(limit) {
  if (stryMutAct_9fa48('1509')) {
    {
    }
  } else {
    stryCov_9fa48('1509')
    if (
      stryMutAct_9fa48('1512')
        ? typeof limit === 'number'
        : stryMutAct_9fa48('1511')
          ? false
          : stryMutAct_9fa48('1510')
            ? true
            : (stryCov_9fa48('1510', '1511', '1512'),
              typeof limit !== (stryMutAct_9fa48('1513') ? '' : (stryCov_9fa48('1513'), 'number')))
    ) {
      if (stryMutAct_9fa48('1514')) {
        {
        }
      } else {
        stryCov_9fa48('1514')
        throw new ValidationError(
          stryMutAct_9fa48('1515')
            ? ''
            : (stryCov_9fa48('1515'), 'ValidationError: Carousel limit must be a number'),
          stryMutAct_9fa48('1516')
            ? {}
            : (stryCov_9fa48('1516'),
              {
                limit
              })
        )
      }
    }
    if (
      stryMutAct_9fa48('1520')
        ? limit >= 0
        : stryMutAct_9fa48('1519')
          ? limit <= 0
          : stryMutAct_9fa48('1518')
            ? false
            : stryMutAct_9fa48('1517')
              ? true
              : (stryCov_9fa48('1517', '1518', '1519', '1520'), limit < 0)
    ) {
      if (stryMutAct_9fa48('1521')) {
        {
        }
      } else {
        stryCov_9fa48('1521')
        throw new ValidationError(
          stryMutAct_9fa48('1522')
            ? ''
            : (stryCov_9fa48('1522'), 'ValidationError: Carousel limit cannot be negative'),
          stryMutAct_9fa48('1523')
            ? {}
            : (stryCov_9fa48('1523'),
              {
                limit
              })
        )
      }
    }
    if (
      stryMutAct_9fa48('1526')
        ? limit !== 0
        : stryMutAct_9fa48('1525')
          ? false
          : stryMutAct_9fa48('1524')
            ? true
            : (stryCov_9fa48('1524', '1525', '1526'), limit === 0)
    ) {
      if (stryMutAct_9fa48('1527')) {
        {
        }
      } else {
        stryCov_9fa48('1527')
        throw new ValidationError(
          stryMutAct_9fa48('1528')
            ? ''
            : (stryCov_9fa48('1528'), 'ValidationError: Carousel limit must be greater than zero')
        )
      }
    }

    // Reject at or beyond max limit (5 based on test)
    if (
      stryMutAct_9fa48('1532')
        ? limit < 5
        : stryMutAct_9fa48('1531')
          ? limit > 5
          : stryMutAct_9fa48('1530')
            ? false
            : stryMutAct_9fa48('1529')
              ? true
              : (stryCov_9fa48('1529', '1530', '1531', '1532'), limit >= 5)
    ) {
      if (stryMutAct_9fa48('1533')) {
        {
        }
      } else {
        stryCov_9fa48('1533')
        throw new ValidationError(
          stryMutAct_9fa48('1534')
            ? ''
            : (stryCov_9fa48('1534'), 'ValidationError: Carousel limit cannot be 5 or more'),
          stryMutAct_9fa48('1535')
            ? {}
            : (stryCov_9fa48('1535'),
              {
                limit
              })
        )
      }
    }
    return stryMutAct_9fa48('1536') ? false : (stryCov_9fa48('1536'), true)
  }
}

/**
 * Validate product images
 * @param {Array} images - Product images
 * @throws {ValidationError} If images are invalid
 */
export function validateProductImages(images) {
  if (stryMutAct_9fa48('1537')) {
    {
    }
  } else {
    stryCov_9fa48('1537')
    if (
      stryMutAct_9fa48('1540')
        ? false
        : stryMutAct_9fa48('1539')
          ? true
          : stryMutAct_9fa48('1538')
            ? Array.isArray(images)
            : (stryCov_9fa48('1538', '1539', '1540'), !Array.isArray(images))
    ) {
      if (stryMutAct_9fa48('1541')) {
        {
        }
      } else {
        stryCov_9fa48('1541')
        throw new ValidationError(
          stryMutAct_9fa48('1542')
            ? ''
            : (stryCov_9fa48('1542'), 'ValidationError: Product images must be an array')
        )
      }
    }
    if (
      stryMutAct_9fa48('1545')
        ? images.length !== 0
        : stryMutAct_9fa48('1544')
          ? false
          : stryMutAct_9fa48('1543')
            ? true
            : (stryCov_9fa48('1543', '1544', '1545'), images.length === 0)
    ) {
      if (stryMutAct_9fa48('1546')) {
        {
        }
      } else {
        stryCov_9fa48('1546')
        throw new ValidationError(
          stryMutAct_9fa48('1547')
            ? ''
            : (stryCov_9fa48('1547'), 'ValidationError: Product must have at least one image')
        )
      }
    }
    if (
      stryMutAct_9fa48('1551')
        ? images.length <= 5
        : stryMutAct_9fa48('1550')
          ? images.length >= 5
          : stryMutAct_9fa48('1549')
            ? false
            : stryMutAct_9fa48('1548')
              ? true
              : (stryCov_9fa48('1548', '1549', '1550', '1551'), images.length > 5)
    ) {
      if (stryMutAct_9fa48('1552')) {
        {
        }
      } else {
        stryCov_9fa48('1552')
        throw new ValidationError(
          stryMutAct_9fa48('1553')
            ? ''
            : (stryCov_9fa48('1553'), 'ValidationError: Product cannot have more than 5 images'),
          stryMutAct_9fa48('1554')
            ? {}
            : (stryCov_9fa48('1554'),
              {
                count: images.length
              })
        )
      }
    }

    // Validate each image
    images.forEach((image, index) => {
      if (stryMutAct_9fa48('1555')) {
        {
        }
      } else {
        stryCov_9fa48('1555')
        if (
          stryMutAct_9fa48('1558')
            ? !image && typeof image !== 'object'
            : stryMutAct_9fa48('1557')
              ? false
              : stryMutAct_9fa48('1556')
                ? true
                : (stryCov_9fa48('1556', '1557', '1558'),
                  (stryMutAct_9fa48('1559') ? image : (stryCov_9fa48('1559'), !image)) ||
                    (stryMutAct_9fa48('1561')
                      ? typeof image === 'object'
                      : stryMutAct_9fa48('1560')
                        ? false
                        : (stryCov_9fa48('1560', '1561'),
                          typeof image !==
                            (stryMutAct_9fa48('1562') ? '' : (stryCov_9fa48('1562'), 'object')))))
        ) {
          if (stryMutAct_9fa48('1563')) {
            {
            }
          } else {
            stryCov_9fa48('1563')
            throw new ValidationError(
              stryMutAct_9fa48('1564')
                ? ``
                : (stryCov_9fa48('1564'), `ValidationError: Image at index ${index} is invalid`)
            )
          }
        }
        if (
          stryMutAct_9fa48('1567')
            ? false
            : stryMutAct_9fa48('1566')
              ? true
              : stryMutAct_9fa48('1565')
                ? image.url
                : (stryCov_9fa48('1565', '1566', '1567'), !image.url)
        ) {
          if (stryMutAct_9fa48('1568')) {
            {
            }
          } else {
            stryCov_9fa48('1568')
            throw new ValidationError(
              stryMutAct_9fa48('1569')
                ? ``
                : (stryCov_9fa48('1569'), `ValidationError: Image at index ${index} is missing URL`)
            )
          }
        }
        if (
          stryMutAct_9fa48('1572')
            ? false
            : stryMutAct_9fa48('1571')
              ? true
              : stryMutAct_9fa48('1570')
                ? image.size
                : (stryCov_9fa48('1570', '1571', '1572'), !image.size)
        ) {
          if (stryMutAct_9fa48('1573')) {
            {
            }
          } else {
            stryCov_9fa48('1573')
            throw new ValidationError(
              stryMutAct_9fa48('1574')
                ? ``
                : (stryCov_9fa48('1574'),
                  `ValidationError: Image at index ${index} is missing size`)
            )
          }
        }
      }
    })
    return stryMutAct_9fa48('1575') ? false : (stryCov_9fa48('1575'), true)
  }
}
