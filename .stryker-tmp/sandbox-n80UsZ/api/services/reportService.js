/**
 * Report Service
 * Business logic for accounting reports
 * @module services/reportService
 */
// @ts-nocheck
function stryNS_9fa48() {
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
import { supabase } from './supabaseClient.js'
import expenseRepository from '../repositories/expenseRepository.js'
import { logger } from '../utils/logger.js'
import { AppError } from '../errors/AppError.js'
class ReportService {
  /**
   * Get daily sales from orders
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Daily sales data
   */
  async getDailySales(startDate, endDate) {
    if (stryMutAct_9fa48('5494')) {
      {
      }
    } else {
      stryCov_9fa48('5494')
      try {
        if (stryMutAct_9fa48('5495')) {
          {
          }
        } else {
          stryCov_9fa48('5495')
          const { data, error } = await supabase
            .from(stryMutAct_9fa48('5496') ? '' : (stryCov_9fa48('5496'), 'orders'))
            .select(
              stryMutAct_9fa48('5497') ? '' : (stryCov_9fa48('5497'), 'created_at, total, status')
            )
            .gte(stryMutAct_9fa48('5498') ? '' : (stryCov_9fa48('5498'), 'created_at'), startDate)
            .lte(stryMutAct_9fa48('5499') ? '' : (stryCov_9fa48('5499'), 'created_at'), endDate)
            .in(
              stryMutAct_9fa48('5500') ? '' : (stryCov_9fa48('5500'), 'status'),
              stryMutAct_9fa48('5501')
                ? []
                : (stryCov_9fa48('5501'),
                  [
                    stryMutAct_9fa48('5502') ? '' : (stryCov_9fa48('5502'), 'confirmed'),
                    stryMutAct_9fa48('5503') ? '' : (stryCov_9fa48('5503'), 'processing'),
                    stryMutAct_9fa48('5504') ? '' : (stryCov_9fa48('5504'), 'delivering'),
                    stryMutAct_9fa48('5505') ? '' : (stryCov_9fa48('5505'), 'delivered')
                  ])
            )
          if (
            stryMutAct_9fa48('5507')
              ? false
              : stryMutAct_9fa48('5506')
                ? true
                : (stryCov_9fa48('5506', '5507'), error)
          ) {
            if (stryMutAct_9fa48('5508')) {
              {
              }
            } else {
              stryCov_9fa48('5508')
              throw error
            }
          }

          // Group by date
          const salesByDate = {}
          data.forEach(order => {
            if (stryMutAct_9fa48('5509')) {
              {
              }
            } else {
              stryCov_9fa48('5509')
              const date = new Date(order.created_at)
                .toISOString()
                .split(stryMutAct_9fa48('5510') ? '' : (stryCov_9fa48('5510'), 'T'))[0]
              if (
                stryMutAct_9fa48('5513')
                  ? false
                  : stryMutAct_9fa48('5512')
                    ? true
                    : stryMutAct_9fa48('5511')
                      ? salesByDate[date]
                      : (stryCov_9fa48('5511', '5512', '5513'), !salesByDate[date])
              ) {
                if (stryMutAct_9fa48('5514')) {
                  {
                  }
                } else {
                  stryCov_9fa48('5514')
                  salesByDate[date] = stryMutAct_9fa48('5515')
                    ? {}
                    : (stryCov_9fa48('5515'),
                      {
                        date,
                        total: 0,
                        count: 0
                      })
                }
              }
              stryMutAct_9fa48('5516')
                ? (salesByDate[date].total -= parseFloat(order.total))
                : (stryCov_9fa48('5516'), (salesByDate[date].total += parseFloat(order.total)))
              stryMutAct_9fa48('5517')
                ? (salesByDate[date].count -= 1)
                : (stryCov_9fa48('5517'), (salesByDate[date].count += 1))
            }
          })
          return stryMutAct_9fa48('5518')
            ? Object.values(salesByDate)
            : (stryCov_9fa48('5518'),
              Object.values(salesByDate).sort(
                stryMutAct_9fa48('5519')
                  ? () => undefined
                  : (stryCov_9fa48('5519'),
                    (a, b) =>
                      stryMutAct_9fa48('5520')
                        ? new Date(b.date) + new Date(a.date)
                        : (stryCov_9fa48('5520'), new Date(b.date) - new Date(a.date)))
              ))
        }
      } catch (error) {
        if (stryMutAct_9fa48('5521')) {
          {
          }
        } else {
          stryCov_9fa48('5521')
          logger.error(
            stryMutAct_9fa48('5522') ? '' : (stryCov_9fa48('5522'), 'Error getting daily sales'),
            stryMutAct_9fa48('5523')
              ? {}
              : (stryCov_9fa48('5523'),
                {
                  error
                })
          )
          throw new AppError(
            stryMutAct_9fa48('5524') ? '' : (stryCov_9fa48('5524'), 'Failed to get sales data'),
            500,
            stryMutAct_9fa48('5525')
              ? {}
              : (stryCov_9fa48('5525'),
                {
                  originalError: error.message
                })
          )
        }
      }
    }
  }

  /**
   * Get weekly report
   * @param {Date} weekStart - Week start date (Monday)
   * @returns {Promise<Object>} Weekly report
   */
  async getWeeklyReport(weekStart) {
    if (stryMutAct_9fa48('5526')) {
      {
      }
    } else {
      stryCov_9fa48('5526')
      try {
        if (stryMutAct_9fa48('5527')) {
          {
          }
        } else {
          stryCov_9fa48('5527')
          const weekEnd = new Date(weekStart)
          stryMutAct_9fa48('5528')
            ? weekEnd.setTime(weekEnd.getDate() + 6)
            : (stryCov_9fa48('5528'),
              weekEnd.setDate(
                stryMutAct_9fa48('5529')
                  ? weekEnd.getDate() - 6
                  : (stryCov_9fa48('5529'), weekEnd.getDate() + 6)
              ))
          const [sales, expenses] = await Promise.all(
            stryMutAct_9fa48('5530')
              ? []
              : (stryCov_9fa48('5530'),
                [
                  this.getDailySales(weekStart, weekEnd),
                  expenseRepository.findByDateRange(weekStart, weekEnd)
                ])
          )

          // Calculate totals
          const totalSales = sales.reduce(
            stryMutAct_9fa48('5531')
              ? () => undefined
              : (stryCov_9fa48('5531'),
                (sum, day) =>
                  stryMutAct_9fa48('5532')
                    ? sum - day.total
                    : (stryCov_9fa48('5532'), sum + day.total)),
            0
          )
          const totalOrders = sales.reduce(
            stryMutAct_9fa48('5533')
              ? () => undefined
              : (stryCov_9fa48('5533'),
                (sum, day) =>
                  stryMutAct_9fa48('5534')
                    ? sum - day.count
                    : (stryCov_9fa48('5534'), sum + day.count)),
            0
          )
          const totalExpenses = expenses.reduce(
            stryMutAct_9fa48('5535')
              ? () => undefined
              : (stryCov_9fa48('5535'),
                (sum, exp) =>
                  stryMutAct_9fa48('5536')
                    ? sum - parseFloat(exp.amount)
                    : (stryCov_9fa48('5536'), sum + parseFloat(exp.amount))),
            0
          )
          const netProfit = stryMutAct_9fa48('5537')
            ? totalSales + totalExpenses
            : (stryCov_9fa48('5537'), totalSales - totalExpenses)
          const profitMargin = (
            stryMutAct_9fa48('5541')
              ? totalSales <= 0
              : stryMutAct_9fa48('5540')
                ? totalSales >= 0
                : stryMutAct_9fa48('5539')
                  ? false
                  : stryMutAct_9fa48('5538')
                    ? true
                    : (stryCov_9fa48('5538', '5539', '5540', '5541'), totalSales > 0)
          )
            ? stryMutAct_9fa48('5542')
              ? netProfit / totalSales / 100
              : (stryCov_9fa48('5542'),
                (stryMutAct_9fa48('5543')
                  ? netProfit * totalSales
                  : (stryCov_9fa48('5543'), netProfit / totalSales)) * 100)
            : 0

          // Group expenses by category
          const expensesByCategory = expenses.reduce((acc, exp) => {
            if (stryMutAct_9fa48('5544')) {
              {
              }
            } else {
              stryCov_9fa48('5544')
              if (
                stryMutAct_9fa48('5547')
                  ? false
                  : stryMutAct_9fa48('5546')
                    ? true
                    : stryMutAct_9fa48('5545')
                      ? acc[exp.category]
                      : (stryCov_9fa48('5545', '5546', '5547'), !acc[exp.category])
              ) {
                if (stryMutAct_9fa48('5548')) {
                  {
                  }
                } else {
                  stryCov_9fa48('5548')
                  acc[exp.category] = 0
                }
              }
              stryMutAct_9fa48('5549')
                ? (acc[exp.category] -= parseFloat(exp.amount))
                : (stryCov_9fa48('5549'), (acc[exp.category] += parseFloat(exp.amount)))
              return acc
            }
          }, {})
          return stryMutAct_9fa48('5550')
            ? {}
            : (stryCov_9fa48('5550'),
              {
                period: stryMutAct_9fa48('5551')
                  ? {}
                  : (stryCov_9fa48('5551'),
                    {
                      start: weekStart,
                      end: weekEnd,
                      type: stryMutAct_9fa48('5552') ? '' : (stryCov_9fa48('5552'), 'weekly')
                    }),
                sales: stryMutAct_9fa48('5553')
                  ? {}
                  : (stryCov_9fa48('5553'),
                    {
                      total: parseFloat(totalSales.toFixed(2)),
                      orders: totalOrders,
                      averageTicket: (
                        stryMutAct_9fa48('5557')
                          ? totalOrders <= 0
                          : stryMutAct_9fa48('5556')
                            ? totalOrders >= 0
                            : stryMutAct_9fa48('5555')
                              ? false
                              : stryMutAct_9fa48('5554')
                                ? true
                                : (stryCov_9fa48('5554', '5555', '5556', '5557'), totalOrders > 0)
                      )
                        ? parseFloat(
                            (stryMutAct_9fa48('5558')
                              ? totalSales * totalOrders
                              : (stryCov_9fa48('5558'), totalSales / totalOrders)
                            ).toFixed(2)
                          )
                        : 0,
                      daily: sales
                    }),
                expenses: stryMutAct_9fa48('5559')
                  ? {}
                  : (stryCov_9fa48('5559'),
                    {
                      total: parseFloat(totalExpenses.toFixed(2)),
                      byCategory: expensesByCategory,
                      count: expenses.length
                    }),
                profit: stryMutAct_9fa48('5560')
                  ? {}
                  : (stryCov_9fa48('5560'),
                    {
                      net: parseFloat(netProfit.toFixed(2)),
                      margin: parseFloat(profitMargin.toFixed(2))
                    })
              })
        }
      } catch (error) {
        if (stryMutAct_9fa48('5561')) {
          {
          }
        } else {
          stryCov_9fa48('5561')
          logger.error(
            stryMutAct_9fa48('5562') ? '' : (stryCov_9fa48('5562'), 'Error getting weekly report'),
            stryMutAct_9fa48('5563')
              ? {}
              : (stryCov_9fa48('5563'),
                {
                  error,
                  weekStart
                })
          )
          throw new AppError(
            stryMutAct_9fa48('5564')
              ? ''
              : (stryCov_9fa48('5564'), 'Failed to generate weekly report'),
            500,
            stryMutAct_9fa48('5565')
              ? {}
              : (stryCov_9fa48('5565'),
                {
                  originalError: error.message
                })
          )
        }
      }
    }
  }

  /**
   * Get monthly report
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise<Object>} Monthly report
   */
  async getMonthlyReport(year, month) {
    if (stryMutAct_9fa48('5566')) {
      {
      }
    } else {
      stryCov_9fa48('5566')
      try {
        if (stryMutAct_9fa48('5567')) {
          {
          }
        } else {
          stryCov_9fa48('5567')
          const monthStart = new Date(
            year,
            stryMutAct_9fa48('5568') ? month + 1 : (stryCov_9fa48('5568'), month - 1),
            1
          )
          const monthEnd = new Date(year, month, 0) // Last day of month

          const [sales, expenses] = await Promise.all(
            stryMutAct_9fa48('5569')
              ? []
              : (stryCov_9fa48('5569'),
                [
                  this.getDailySales(monthStart, monthEnd),
                  expenseRepository.findByDateRange(monthStart, monthEnd)
                ])
          )

          // Calculate totals
          const totalSales = sales.reduce(
            stryMutAct_9fa48('5570')
              ? () => undefined
              : (stryCov_9fa48('5570'),
                (sum, day) =>
                  stryMutAct_9fa48('5571')
                    ? sum - day.total
                    : (stryCov_9fa48('5571'), sum + day.total)),
            0
          )
          const totalOrders = sales.reduce(
            stryMutAct_9fa48('5572')
              ? () => undefined
              : (stryCov_9fa48('5572'),
                (sum, day) =>
                  stryMutAct_9fa48('5573')
                    ? sum - day.count
                    : (stryCov_9fa48('5573'), sum + day.count)),
            0
          )
          const totalExpenses = expenses.reduce(
            stryMutAct_9fa48('5574')
              ? () => undefined
              : (stryCov_9fa48('5574'),
                (sum, exp) =>
                  stryMutAct_9fa48('5575')
                    ? sum - parseFloat(exp.amount)
                    : (stryCov_9fa48('5575'), sum + parseFloat(exp.amount))),
            0
          )
          const netProfit = stryMutAct_9fa48('5576')
            ? totalSales + totalExpenses
            : (stryCov_9fa48('5576'), totalSales - totalExpenses)
          const profitMargin = (
            stryMutAct_9fa48('5580')
              ? totalSales <= 0
              : stryMutAct_9fa48('5579')
                ? totalSales >= 0
                : stryMutAct_9fa48('5578')
                  ? false
                  : stryMutAct_9fa48('5577')
                    ? true
                    : (stryCov_9fa48('5577', '5578', '5579', '5580'), totalSales > 0)
          )
            ? stryMutAct_9fa48('5581')
              ? netProfit / totalSales / 100
              : (stryCov_9fa48('5581'),
                (stryMutAct_9fa48('5582')
                  ? netProfit * totalSales
                  : (stryCov_9fa48('5582'), netProfit / totalSales)) * 100)
            : 0

          // Group expenses by category
          const expensesByCategory = expenses.reduce((acc, exp) => {
            if (stryMutAct_9fa48('5583')) {
              {
              }
            } else {
              stryCov_9fa48('5583')
              if (
                stryMutAct_9fa48('5586')
                  ? false
                  : stryMutAct_9fa48('5585')
                    ? true
                    : stryMutAct_9fa48('5584')
                      ? acc[exp.category]
                      : (stryCov_9fa48('5584', '5585', '5586'), !acc[exp.category])
              ) {
                if (stryMutAct_9fa48('5587')) {
                  {
                  }
                } else {
                  stryCov_9fa48('5587')
                  acc[exp.category] = 0
                }
              }
              stryMutAct_9fa48('5588')
                ? (acc[exp.category] -= parseFloat(exp.amount))
                : (stryCov_9fa48('5588'), (acc[exp.category] += parseFloat(exp.amount)))
              return acc
            }
          }, {})

          // Get top products
          const topProducts = await this.getTopProducts(monthStart, monthEnd, 5)
          return stryMutAct_9fa48('5589')
            ? {}
            : (stryCov_9fa48('5589'),
              {
                period: stryMutAct_9fa48('5590')
                  ? {}
                  : (stryCov_9fa48('5590'),
                    {
                      year,
                      month,
                      start: monthStart,
                      end: monthEnd,
                      type: stryMutAct_9fa48('5591') ? '' : (stryCov_9fa48('5591'), 'monthly')
                    }),
                sales: stryMutAct_9fa48('5592')
                  ? {}
                  : (stryCov_9fa48('5592'),
                    {
                      total: parseFloat(totalSales.toFixed(2)),
                      orders: totalOrders,
                      averageTicket: (
                        stryMutAct_9fa48('5596')
                          ? totalOrders <= 0
                          : stryMutAct_9fa48('5595')
                            ? totalOrders >= 0
                            : stryMutAct_9fa48('5594')
                              ? false
                              : stryMutAct_9fa48('5593')
                                ? true
                                : (stryCov_9fa48('5593', '5594', '5595', '5596'), totalOrders > 0)
                      )
                        ? parseFloat(
                            (stryMutAct_9fa48('5597')
                              ? totalSales * totalOrders
                              : (stryCov_9fa48('5597'), totalSales / totalOrders)
                            ).toFixed(2)
                          )
                        : 0,
                      averageDaily: parseFloat(
                        (stryMutAct_9fa48('5598')
                          ? totalSales * sales.length
                          : (stryCov_9fa48('5598'), totalSales / sales.length)
                        ).toFixed(2)
                      ),
                      daily: sales
                    }),
                expenses: stryMutAct_9fa48('5599')
                  ? {}
                  : (stryCov_9fa48('5599'),
                    {
                      total: parseFloat(totalExpenses.toFixed(2)),
                      byCategory: expensesByCategory,
                      count: expenses.length,
                      averageDaily: parseFloat(
                        (stryMutAct_9fa48('5600')
                          ? totalExpenses * sales.length
                          : (stryCov_9fa48('5600'), totalExpenses / sales.length)
                        ).toFixed(2)
                      )
                    }),
                profit: stryMutAct_9fa48('5601')
                  ? {}
                  : (stryCov_9fa48('5601'),
                    {
                      net: parseFloat(netProfit.toFixed(2)),
                      margin: parseFloat(profitMargin.toFixed(2))
                    }),
                topProducts
              })
        }
      } catch (error) {
        if (stryMutAct_9fa48('5602')) {
          {
          }
        } else {
          stryCov_9fa48('5602')
          logger.error(
            stryMutAct_9fa48('5603') ? '' : (stryCov_9fa48('5603'), 'Error getting monthly report'),
            stryMutAct_9fa48('5604')
              ? {}
              : (stryCov_9fa48('5604'),
                {
                  error,
                  year,
                  month
                })
          )
          throw new AppError(
            stryMutAct_9fa48('5605')
              ? ''
              : (stryCov_9fa48('5605'), 'Failed to generate monthly report'),
            500,
            stryMutAct_9fa48('5606')
              ? {}
              : (stryCov_9fa48('5606'),
                {
                  originalError: error.message
                })
          )
        }
      }
    }
  }

  /**
   * Get top selling products
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number} limit - Number of products to return
   * @returns {Promise<Array>} Top products
   */
  async getTopProducts(startDate, endDate, limit = 5) {
    if (stryMutAct_9fa48('5607')) {
      {
      }
    } else {
      stryCov_9fa48('5607')
      try {
        if (stryMutAct_9fa48('5608')) {
          {
          }
        } else {
          stryCov_9fa48('5608')
          // Get orders in date range
          const { data: orders, error: ordersError } = await supabase
            .from(stryMutAct_9fa48('5609') ? '' : (stryCov_9fa48('5609'), 'orders'))
            .select(stryMutAct_9fa48('5610') ? '' : (stryCov_9fa48('5610'), 'id'))
            .gte(stryMutAct_9fa48('5611') ? '' : (stryCov_9fa48('5611'), 'created_at'), startDate)
            .lte(stryMutAct_9fa48('5612') ? '' : (stryCov_9fa48('5612'), 'created_at'), endDate)
            .in(
              stryMutAct_9fa48('5613') ? '' : (stryCov_9fa48('5613'), 'status'),
              stryMutAct_9fa48('5614')
                ? []
                : (stryCov_9fa48('5614'),
                  [
                    stryMutAct_9fa48('5615') ? '' : (stryCov_9fa48('5615'), 'confirmed'),
                    stryMutAct_9fa48('5616') ? '' : (stryCov_9fa48('5616'), 'processing'),
                    stryMutAct_9fa48('5617') ? '' : (stryCov_9fa48('5617'), 'delivering'),
                    stryMutAct_9fa48('5618') ? '' : (stryCov_9fa48('5618'), 'delivered')
                  ])
            )
          if (
            stryMutAct_9fa48('5620')
              ? false
              : stryMutAct_9fa48('5619')
                ? true
                : (stryCov_9fa48('5619', '5620'), ordersError)
          ) {
            if (stryMutAct_9fa48('5621')) {
              {
              }
            } else {
              stryCov_9fa48('5621')
              throw ordersError
            }
          }
          const orderIds = orders.map(
            stryMutAct_9fa48('5622') ? () => undefined : (stryCov_9fa48('5622'), o => o.id)
          )
          if (
            stryMutAct_9fa48('5625')
              ? orderIds.length !== 0
              : stryMutAct_9fa48('5624')
                ? false
                : stryMutAct_9fa48('5623')
                  ? true
                  : (stryCov_9fa48('5623', '5624', '5625'), orderIds.length === 0)
          ) {
            if (stryMutAct_9fa48('5626')) {
              {
              }
            } else {
              stryCov_9fa48('5626')
              return stryMutAct_9fa48('5627') ? ['Stryker was here'] : (stryCov_9fa48('5627'), [])
            }
          }

          // Get order items for these orders
          const { data: items, error: itemsError } = await supabase
            .from(stryMutAct_9fa48('5628') ? '' : (stryCov_9fa48('5628'), 'order_items'))
            .select(
              stryMutAct_9fa48('5629')
                ? ''
                : (stryCov_9fa48('5629'), 'product_name, quantity, subtotal')
            )
            .in(stryMutAct_9fa48('5630') ? '' : (stryCov_9fa48('5630'), 'order_id'), orderIds)
          if (
            stryMutAct_9fa48('5632')
              ? false
              : stryMutAct_9fa48('5631')
                ? true
                : (stryCov_9fa48('5631', '5632'), itemsError)
          ) {
            if (stryMutAct_9fa48('5633')) {
              {
              }
            } else {
              stryCov_9fa48('5633')
              throw itemsError
            }
          }

          // Aggregate by product
          const productStats = items.reduce((acc, item) => {
            if (stryMutAct_9fa48('5634')) {
              {
              }
            } else {
              stryCov_9fa48('5634')
              if (
                stryMutAct_9fa48('5637')
                  ? false
                  : stryMutAct_9fa48('5636')
                    ? true
                    : stryMutAct_9fa48('5635')
                      ? acc[item.product_name]
                      : (stryCov_9fa48('5635', '5636', '5637'), !acc[item.product_name])
              ) {
                if (stryMutAct_9fa48('5638')) {
                  {
                  }
                } else {
                  stryCov_9fa48('5638')
                  acc[item.product_name] = stryMutAct_9fa48('5639')
                    ? {}
                    : (stryCov_9fa48('5639'),
                      {
                        name: item.product_name,
                        quantity: 0,
                        revenue: 0
                      })
                }
              }
              stryMutAct_9fa48('5640')
                ? (acc[item.product_name].quantity -= item.quantity)
                : (stryCov_9fa48('5640'), (acc[item.product_name].quantity += item.quantity))
              stryMutAct_9fa48('5641')
                ? (acc[item.product_name].revenue -= parseFloat(item.subtotal))
                : (stryCov_9fa48('5641'),
                  (acc[item.product_name].revenue += parseFloat(item.subtotal)))
              return acc
            }
          }, {})

          // Sort by revenue and limit
          return stryMutAct_9fa48('5643')
            ? Object.values(productStats)
                .slice(0, limit)
                .map(p => ({
                  ...p,
                  revenue: parseFloat(p.revenue.toFixed(2))
                }))
            : stryMutAct_9fa48('5642')
              ? Object.values(productStats)
                  .sort((a, b) => b.revenue - a.revenue)
                  .map(p => ({
                    ...p,
                    revenue: parseFloat(p.revenue.toFixed(2))
                  }))
              : (stryCov_9fa48('5642', '5643'),
                Object.values(productStats)
                  .sort(
                    stryMutAct_9fa48('5644')
                      ? () => undefined
                      : (stryCov_9fa48('5644'),
                        (a, b) =>
                          stryMutAct_9fa48('5645')
                            ? b.revenue + a.revenue
                            : (stryCov_9fa48('5645'), b.revenue - a.revenue))
                  )
                  .slice(0, limit)
                  .map(
                    stryMutAct_9fa48('5646')
                      ? () => undefined
                      : (stryCov_9fa48('5646'),
                        p =>
                          stryMutAct_9fa48('5647')
                            ? {}
                            : (stryCov_9fa48('5647'),
                              {
                                ...p,
                                revenue: parseFloat(p.revenue.toFixed(2))
                              }))
                  ))
        }
      } catch (error) {
        if (stryMutAct_9fa48('5648')) {
          {
          }
        } else {
          stryCov_9fa48('5648')
          logger.error(
            stryMutAct_9fa48('5649') ? '' : (stryCov_9fa48('5649'), 'Error getting top products'),
            stryMutAct_9fa48('5650')
              ? {}
              : (stryCov_9fa48('5650'),
                {
                  error
                })
          )
          return stryMutAct_9fa48('5651') ? ['Stryker was here'] : (stryCov_9fa48('5651'), [])
        }
      }
    }
  }

  /**
   * Get dashboard summary
   * @returns {Promise<Object>} Dashboard summary (last 7 days)
   */
  async getDashboardSummary() {
    if (stryMutAct_9fa48('5652')) {
      {
      }
    } else {
      stryCov_9fa48('5652')
      try {
        if (stryMutAct_9fa48('5653')) {
          {
          }
        } else {
          stryCov_9fa48('5653')
          const today = new Date()
          const weekAgo = new Date(today)
          stryMutAct_9fa48('5654')
            ? weekAgo.setTime(weekAgo.getDate() - 7)
            : (stryCov_9fa48('5654'),
              weekAgo.setDate(
                stryMutAct_9fa48('5655')
                  ? weekAgo.getDate() + 7
                  : (stryCov_9fa48('5655'), weekAgo.getDate() - 7)
              ))
          const [sales, expenses] = await Promise.all(
            stryMutAct_9fa48('5656')
              ? []
              : (stryCov_9fa48('5656'),
                [
                  this.getDailySales(weekAgo, today),
                  expenseRepository.findByDateRange(weekAgo, today)
                ])
          )
          const totalSales = sales.reduce(
            stryMutAct_9fa48('5657')
              ? () => undefined
              : (stryCov_9fa48('5657'),
                (sum, day) =>
                  stryMutAct_9fa48('5658')
                    ? sum - day.total
                    : (stryCov_9fa48('5658'), sum + day.total)),
            0
          )
          const totalExpenses = expenses.reduce(
            stryMutAct_9fa48('5659')
              ? () => undefined
              : (stryCov_9fa48('5659'),
                (sum, exp) =>
                  stryMutAct_9fa48('5660')
                    ? sum - parseFloat(exp.amount)
                    : (stryCov_9fa48('5660'), sum + parseFloat(exp.amount))),
            0
          )
          const netProfit = stryMutAct_9fa48('5661')
            ? totalSales + totalExpenses
            : (stryCov_9fa48('5661'), totalSales - totalExpenses)

          // Get recent expenses
          const recentExpenses = stryMutAct_9fa48('5662')
            ? expenses
            : (stryCov_9fa48('5662'), expenses.slice(0, 5))
          return stryMutAct_9fa48('5663')
            ? {}
            : (stryCov_9fa48('5663'),
              {
                period: stryMutAct_9fa48('5664') ? '' : (stryCov_9fa48('5664'), 'last_7_days'),
                sales: parseFloat(totalSales.toFixed(2)),
                expenses: parseFloat(totalExpenses.toFixed(2)),
                profit: parseFloat(netProfit.toFixed(2)),
                recentExpenses: recentExpenses.map(
                  stryMutAct_9fa48('5665')
                    ? () => undefined
                    : (stryCov_9fa48('5665'),
                      exp =>
                        stryMutAct_9fa48('5666')
                          ? {}
                          : (stryCov_9fa48('5666'),
                            {
                              id: exp.id,
                              category: exp.category,
                              description: exp.description,
                              amount: parseFloat(exp.amount),
                              date: exp.expense_date
                            }))
                )
              })
        }
      } catch (error) {
        if (stryMutAct_9fa48('5667')) {
          {
          }
        } else {
          stryCov_9fa48('5667')
          logger.error(
            stryMutAct_9fa48('5668')
              ? ''
              : (stryCov_9fa48('5668'), 'Error getting dashboard summary'),
            stryMutAct_9fa48('5669')
              ? {}
              : (stryCov_9fa48('5669'),
                {
                  error
                })
          )
          throw new AppError(
            stryMutAct_9fa48('5670')
              ? ''
              : (stryCov_9fa48('5670'), 'Failed to get dashboard summary'),
            500,
            stryMutAct_9fa48('5671')
              ? {}
              : (stryCov_9fa48('5671'),
                {
                  originalError: error.message
                })
          )
        }
      }
    }
  }
}
export default new ReportService()
