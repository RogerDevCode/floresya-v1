/**
 * Business Rules Compliance Tests for P0.1.5
 * Testing for "venta cancelada no es venta" rule - cancelled orders excluded from sales calculations
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

describe('Business Rules Compliance Tests - P0.1.5', () => {
  describe('Cancelled Order Business Rule', () => {
    it('should exclude cancelled orders from sales calculations in services', () => {
      const servicesDir = 'api/services'
      const violations = []

      try {
        const serviceFiles = readdirSync(servicesDir)

        for (const file of serviceFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(servicesDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Check for sales calculation functions
            const salesFunctionPatterns = [
              /export\s+async\s+function\s+(calculate|get|fetch).*sales/i,
              /export\s+async\s+function\s+(calculate|get|fetch).*revenue/i,
              /export\s+async\s+function\s+(calculate|get|fetch).*totals/i
            ]

            salesFunctionPatterns.forEach(pattern => {
              const match = content.match(pattern)
              if (match) {
                const functionName = match[0]
                const functionStart = match.index

                // Find function body
                const openBraceIndex = content.indexOf('{', functionStart)
                let braceCount = 1
                let closeBraceIndex = openBraceIndex + 1

                while (closeBraceIndex < content.length && braceCount > 0) {
                  if (content[closeBraceIndex] === '{') {
                    braceCount++
                  } else if (content[closeBraceIndex] === '}') {
                    braceCount--
                  }
                  closeBraceIndex++
                }

                const functionBody = content.substring(openBraceIndex, closeBraceIndex)

                // Check if function filters out cancelled orders
                const hasCancelledFilter =
                  functionBody.includes("!= 'cancelled'") ||
                  functionBody.includes("<> 'cancelled'") ||
                  functionBody.includes(".not('cancelled')") ||
                  functionBody.includes("neq('cancelled')") ||
                  functionBody.includes("!in(['']cancelled[''])") ||
                  (functionBody.includes('status') &&
                    functionBody.includes('!=') &&
                    functionBody.includes('cancelled'))

                if (!hasCancelledFilter) {
                  violations.push({
                    file: filePath,
                    function: functionName,
                    reason: 'Sales calculation does not filter out cancelled orders'
                  })
                }
              }
            })

            // Check for getAllOrders calls
            const getAllOrdersMatches = content.match(/getAllOrders\([^)]*\)/g)
            if (getAllOrdersMatches) {
              getAllOrdersMatches.forEach(match => {
                // Check if getAllOrders is called with status filter to exclude cancelled
                const hasStatusFilter =
                  match.includes('status') ||
                  content
                    .substring(content.indexOf(match), content.indexOf(match) + 200)
                    .includes('status')

                if (!hasStatusFilter && content.includes('sales')) {
                  violations.push({
                    file: filePath,
                    function: 'getAllOrders',
                    reason: 'getAllOrders used for sales without filtering cancelled orders'
                  })
                }
              })
            }
          }
        }
      } catch (_error) {
        violations.push({
          reason: 'Services directory not accessible'
        })
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('Business rule violations:', violations)
      }
    })

    it('should ensure order status history tracks cancellations properly', () => {
      const orderServiceFile = 'api/services/orderService.js'
      const violations = []

      try {
        const content = readFileSync(orderServiceFile, 'utf8')

        // Check for cancelOrder function
        const hasCancelOrder = /export\s+async\s+function\s+cancelOrder/.test(content)
        if (!hasCancelOrder) {
          violations.push({
            reason: 'Missing cancelOrder function in orderService'
          })
        }

        // Check if cancelOrder uses updateOrderStatus
        const hasUpdateOrderStatus = /cancelOrder.*updateOrderStatus/.test(content)
        if (!hasUpdateOrderStatus) {
          violations.push({
            reason: 'cancelOrder does not use updateOrderStatus function'
          })
        }

        // Check for getOrderStatusHistory function
        const hasGetOrderStatusHistory = /export\s+async\s+function\s+getOrderStatusHistory/.test(
          content
        )
        if (!hasGetOrderStatusHistory) {
          violations.push({
            reason: 'Missing getOrderStatusHistory function in orderService'
          })
        }

        // Check for proper status history tracking
        const hasStatusHistoryUpdate = /updateOrderStatus.*history/.test(content)
        if (!hasStatusHistoryUpdate) {
          violations.push({
            reason: 'Order status updates do not track history properly'
          })
        }
      } catch (_error) {
        violations.push({
          reason: 'orderService.js file not accessible'
        })
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('Order status history violations:', violations)
      }
    })

    it('should ensure analytics and reporting functions exclude cancelled orders', () => {
      const servicesDir = 'api/services'
      const violations = []

      try {
        const serviceFiles = readdirSync(servicesDir)

        for (const file of serviceFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(servicesDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Check for analytics/reporting functions
            const analyticsFunctionPatterns = [
              /export\s+async\s+function\s+(get|calculate|generate).*analytics/i,
              /export\s+async\s+function\s+(get|calculate|generate).*reports?/i,
              /export\s+async\s+function\s+(get|calculate|generate).*metrics/i,
              /export\s+async\s+function\s+(get|calculate|generate).*statistics/i
            ]

            analyticsFunctionPatterns.forEach(pattern => {
              const match = content.match(pattern)
              if (match) {
                const functionName = match[0]
                const functionStart = match.index

                // Find function body
                const openBraceIndex = content.indexOf('{', functionStart)
                let braceCount = 1
                let closeBraceIndex = openBraceIndex + 1

                while (closeBraceIndex < content.length && braceCount > 0) {
                  if (content[closeBraceIndex] === '{') {
                    braceCount++
                  } else if (content[closeBraceIndex] === '}') {
                    braceCount--
                  }
                  closeBraceIndex++
                }

                const functionBody = content.substring(openBraceIndex, closeBraceIndex)

                // Check if function queries orders
                const hasOrdersQuery =
                  functionBody.includes('orders') || functionBody.includes('DB_SCHEMA.orders')

                if (hasOrdersQuery) {
                  // Check if function filters out cancelled orders
                  const hasCancelledFilter =
                    functionBody.includes("!= 'cancelled'") ||
                    functionBody.includes("<> 'cancelled'") ||
                    functionBody.includes(".not('cancelled')") ||
                    functionBody.includes("neq('cancelled')") ||
                    functionBody.includes("!in(['']cancelled[''])") ||
                    (functionBody.includes('status') &&
                      functionBody.includes('!=') &&
                      functionBody.includes('cancelled'))

                  if (!hasCancelledFilter) {
                    violations.push({
                      file: filePath,
                      function: functionName,
                      reason: 'Analytics function does not filter out cancelled orders'
                    })
                  }
                }
              }
            })
          }
        }
      } catch (_error) {
        violations.push({
          reason: 'Services directory not accessible'
        })
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('Analytics business rule violations:', violations)
      }
    })
  })

  describe('Database Query Compliance', () => {
    it('should ensure database queries exclude cancelled orders by default', () => {
      const orderServiceFile = 'api/services/orderService.js'
      const violations = []

      try {
        const content = readFileSync(orderServiceFile, 'utf8')

        // Check getAllOrders function
        const getAllOrdersMatch = content.match(
          /export\s+async\s+function\s+getAllOrders[\s\S]*?^}/m
        )
        if (getAllOrdersMatch) {
          const getAllOrdersBody = getAllOrdersMatch[0]

          // Check if getAllOrders has a default status filter
          const hasDefaultStatusFilter =
            getAllOrdersBody.includes('status') &&
            (getAllOrdersBody.includes("!= 'cancelled'") ||
              getAllOrdersBody.includes("<> 'cancelled'") ||
              getAllOrdersBody.includes(".not('cancelled')"))

          if (!hasDefaultStatusFilter) {
            violations.push({
              function: 'getAllOrders',
              reason: 'getAllOrders does not exclude cancelled orders by default'
            })
          }
        }

        // Check for direct database queries
        const dbQueryPatterns = [
          /supabase\.from\('orders'\)\.select/,
          /supabase\.from\(DB_SCHEMA\.orders\.table\)\.select/
        ]

        dbQueryPatterns.forEach(pattern => {
          const matches = content.match(new RegExp(pattern, 'g'))
          if (matches) {
            matches.forEach(match => {
              // Find the full query
              const queryStart = content.indexOf(match)
              let queryEnd = queryStart + match.length
              let braceCount = 0

              // Find end of query chain
              for (let i = queryStart; i < content.length; i++) {
                if (content[i] === '(') {
                  braceCount++
                } else if (content[i] === ')') {
                  if (braceCount === 0) {
                    queryEnd = i + 1
                    break
                  }
                  braceCount--
                }
              }

              const fullQuery = content.substring(queryStart, queryEnd)

              // Check if query excludes cancelled orders
              const hasCancelledFilter =
                fullQuery.includes("!= 'cancelled'") ||
                fullQuery.includes("<> 'cancelled'") ||
                fullQuery.includes(".not('cancelled')")

              if (!hasCancelledFilter && fullQuery.includes('select')) {
                violations.push({
                  query: match,
                  reason: 'Database query does not exclude cancelled orders'
                })
              }
            })
          }
        })
      } catch (_error) {
        violations.push({
          reason: 'orderService.js file not accessible'
        })
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('Database query violations:', violations)
      }
    })
  })

  describe('API Response Compliance', () => {
    it('should ensure API endpoints exclude cancelled orders from sales data', () => {
      const controllersDir = 'api/controllers'
      const violations = []

      try {
        const controllerFiles = readdirSync(controllersDir)

        for (const file of controllerFiles) {
          if (file.endsWith('.js') && !file.endsWith('.test.js')) {
            const filePath = join(controllersDir, file)
            const content = readFileSync(filePath, 'utf8')

            // Check for sales-related endpoints
            const salesEndpointPatterns = [
              /export\s+const\s+(get|calculate).*sales/i,
              /export\s+const\s+(get|calculate).*revenue/i,
              /export\s+const\s+(get|calculate).*totals/i
            ]

            salesEndpointPatterns.forEach(pattern => {
              const match = content.match(pattern)
              if (match) {
                const functionName = match[0]
                const functionStart = match.index

                // Find function body
                const openBraceIndex = content.indexOf('=>', functionStart)
                const functionBodyStart = content.indexOf('{', openBraceIndex)
                let braceCount = 1
                let closeBraceIndex = functionBodyStart + 1

                while (closeBraceIndex < content.length && braceCount > 0) {
                  if (content[closeBraceIndex] === '{') {
                    braceCount++
                  } else if (content[closeBraceIndex] === '}') {
                    braceCount--
                  }
                  closeBraceIndex++
                }

                const functionBody = content.substring(functionBodyStart, closeBraceIndex)

                // Check if endpoint passes status filter to service
                const hasStatusFilter =
                  functionBody.includes('status') ||
                  (functionBody.includes('filters') && functionBody.includes('cancelled'))

                if (!hasStatusFilter) {
                  violations.push({
                    file: filePath,
                    function: functionName,
                    reason: 'Sales endpoint does not filter out cancelled orders'
                  })
                }
              }
            })
          }
        }
      } catch (_error) {
        violations.push({
          reason: 'Controllers directory not accessible'
        })
      }

      expect(violations).toHaveLength(0)
      if (violations.length > 0) {
        console.error('API response violations:', violations)
      }
    })
  })
})
