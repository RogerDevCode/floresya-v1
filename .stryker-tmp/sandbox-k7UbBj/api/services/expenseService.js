/**
 * Expense Service
 * Business logic for expense management
 * @module services/expenseService
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
import expenseRepository from '../repositories/expenseRepository.js'
import { NotFoundError, ValidationError } from '../errors/AppError.js'
import { logger } from '../utils/logger.js'

/**
 * Expense categories
 */
export const EXPENSE_CATEGORIES = stryMutAct_9fa48('1960')
  ? []
  : (stryCov_9fa48('1960'),
    [
      stryMutAct_9fa48('1961') ? '' : (stryCov_9fa48('1961'), 'flores'),
      stryMutAct_9fa48('1962') ? '' : (stryCov_9fa48('1962'), 'transporte'),
      stryMutAct_9fa48('1963') ? '' : (stryCov_9fa48('1963'), 'empaque'),
      stryMutAct_9fa48('1964') ? '' : (stryCov_9fa48('1964'), 'personal'),
      stryMutAct_9fa48('1965') ? '' : (stryCov_9fa48('1965'), 'servicios'),
      stryMutAct_9fa48('1966') ? '' : (stryCov_9fa48('1966'), 'marketing'),
      stryMutAct_9fa48('1967') ? '' : (stryCov_9fa48('1967'), 'otros')
    ])

/**
 * Payment methods
 */
export const PAYMENT_METHODS = stryMutAct_9fa48('1968')
  ? []
  : (stryCov_9fa48('1968'),
    [
      stryMutAct_9fa48('1969') ? '' : (stryCov_9fa48('1969'), 'efectivo'),
      stryMutAct_9fa48('1970') ? '' : (stryCov_9fa48('1970'), 'transferencia'),
      stryMutAct_9fa48('1971') ? '' : (stryCov_9fa48('1971'), 'tarjeta_debito'),
      stryMutAct_9fa48('1972') ? '' : (stryCov_9fa48('1972'), 'tarjeta_credito'),
      stryMutAct_9fa48('1973') ? '' : (stryCov_9fa48('1973'), 'pago_movil'),
      stryMutAct_9fa48('1974') ? '' : (stryCov_9fa48('1974'), 'otro')
    ])
class ExpenseService {
  /**
   * Create a new expense
   * @param {Object} expenseData - Expense data
   * @param {string} userId - User ID creating the expense
   * @returns {Promise<Object>} Created expense
   */
  async createExpense(expenseData, userId) {
    if (stryMutAct_9fa48('1975')) {
      {
      }
    } else {
      stryCov_9fa48('1975')
      try {
        if (stryMutAct_9fa48('1976')) {
          {
          }
        } else {
          stryCov_9fa48('1976')
          // Validate category
          if (
            stryMutAct_9fa48('1979')
              ? false
              : stryMutAct_9fa48('1978')
                ? true
                : stryMutAct_9fa48('1977')
                  ? EXPENSE_CATEGORIES.includes(expenseData.category)
                  : (stryCov_9fa48('1977', '1978', '1979'),
                    !EXPENSE_CATEGORIES.includes(expenseData.category))
          ) {
            if (stryMutAct_9fa48('1980')) {
              {
              }
            } else {
              stryCov_9fa48('1980')
              throw new ValidationError(
                stryMutAct_9fa48('1981')
                  ? ``
                  : (stryCov_9fa48('1981'),
                    `Invalid category. Must be one of: ${EXPENSE_CATEGORIES.join(stryMutAct_9fa48('1982') ? '' : (stryCov_9fa48('1982'), ', '))}`)
              )
            }
          }

          // Validate amount
          if (
            stryMutAct_9fa48('1985')
              ? !expenseData.amount && expenseData.amount <= 0
              : stryMutAct_9fa48('1984')
                ? false
                : stryMutAct_9fa48('1983')
                  ? true
                  : (stryCov_9fa48('1983', '1984', '1985'),
                    (stryMutAct_9fa48('1986')
                      ? expenseData.amount
                      : (stryCov_9fa48('1986'), !expenseData.amount)) ||
                      (stryMutAct_9fa48('1989')
                        ? expenseData.amount > 0
                        : stryMutAct_9fa48('1988')
                          ? expenseData.amount < 0
                          : stryMutAct_9fa48('1987')
                            ? false
                            : (stryCov_9fa48('1987', '1988', '1989'), expenseData.amount <= 0)))
          ) {
            if (stryMutAct_9fa48('1990')) {
              {
              }
            } else {
              stryCov_9fa48('1990')
              throw new ValidationError(
                stryMutAct_9fa48('1991')
                  ? ''
                  : (stryCov_9fa48('1991'), 'Amount must be greater than 0')
              )
            }
          }

          // Validate payment method if provided
          if (
            stryMutAct_9fa48('1994')
              ? expenseData.payment_method || !PAYMENT_METHODS.includes(expenseData.payment_method)
              : stryMutAct_9fa48('1993')
                ? false
                : stryMutAct_9fa48('1992')
                  ? true
                  : (stryCov_9fa48('1992', '1993', '1994'),
                    expenseData.payment_method &&
                      (stryMutAct_9fa48('1995')
                        ? PAYMENT_METHODS.includes(expenseData.payment_method)
                        : (stryCov_9fa48('1995'),
                          !PAYMENT_METHODS.includes(expenseData.payment_method))))
          ) {
            if (stryMutAct_9fa48('1996')) {
              {
              }
            } else {
              stryCov_9fa48('1996')
              throw new ValidationError(
                stryMutAct_9fa48('1997')
                  ? ``
                  : (stryCov_9fa48('1997'),
                    `Invalid payment method. Must be one of: ${PAYMENT_METHODS.join(stryMutAct_9fa48('1998') ? '' : (stryCov_9fa48('1998'), ', '))}`)
              )
            }
          }
          const expense = stryMutAct_9fa48('1999')
            ? {}
            : (stryCov_9fa48('1999'),
              {
                ...expenseData,
                created_by: userId,
                expense_date: stryMutAct_9fa48('2002')
                  ? expenseData.expense_date && new Date().toISOString().split('T')[0]
                  : stryMutAct_9fa48('2001')
                    ? false
                    : stryMutAct_9fa48('2000')
                      ? true
                      : (stryCov_9fa48('2000', '2001', '2002'),
                        expenseData.expense_date ||
                          new Date()
                            .toISOString()
                            .split(stryMutAct_9fa48('2003') ? '' : (stryCov_9fa48('2003'), 'T'))[0])
              })
          const created = await expenseRepository.create(expense)
          logger.info(
            stryMutAct_9fa48('2004') ? '' : (stryCov_9fa48('2004'), 'Expense created'),
            stryMutAct_9fa48('2005')
              ? {}
              : (stryCov_9fa48('2005'),
                {
                  expenseId: created.id,
                  userId
                })
          )
          return created
        }
      } catch (error) {
        if (stryMutAct_9fa48('2006')) {
          {
          }
        } else {
          stryCov_9fa48('2006')
          logger.error(
            stryMutAct_9fa48('2007') ? '' : (stryCov_9fa48('2007'), 'Error creating expense'),
            stryMutAct_9fa48('2008')
              ? {}
              : (stryCov_9fa48('2008'),
                {
                  error,
                  expenseData
                })
          )
          throw error
        }
      }
    }
  }

  /**
   * Get expense by ID
   * @param {string} id - Expense ID
   * @returns {Promise<Object>} Expense
   */
  async getExpenseById(id) {
    if (stryMutAct_9fa48('2009')) {
      {
      }
    } else {
      stryCov_9fa48('2009')
      try {
        if (stryMutAct_9fa48('2010')) {
          {
          }
        } else {
          stryCov_9fa48('2010')
          const expense = await expenseRepository.findById(id)
          if (
            stryMutAct_9fa48('2013')
              ? false
              : stryMutAct_9fa48('2012')
                ? true
                : stryMutAct_9fa48('2011')
                  ? expense
                  : (stryCov_9fa48('2011', '2012', '2013'), !expense)
          ) {
            if (stryMutAct_9fa48('2014')) {
              {
              }
            } else {
              stryCov_9fa48('2014')
              throw new NotFoundError(
                stryMutAct_9fa48('2015') ? '' : (stryCov_9fa48('2015'), 'Expense not found')
              )
            }
          }
          return expense
        }
      } catch (error) {
        if (stryMutAct_9fa48('2016')) {
          {
          }
        } else {
          stryCov_9fa48('2016')
          logger.error(
            stryMutAct_9fa48('2017') ? '' : (stryCov_9fa48('2017'), 'Error getting expense by ID'),
            stryMutAct_9fa48('2018')
              ? {}
              : (stryCov_9fa48('2018'),
                {
                  error,
                  id
                })
          )
          throw error
        }
      }
    }
  }

  /**
   * Get all expenses with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Expenses
   */
  async getExpenses(filters = {}) {
    if (stryMutAct_9fa48('2019')) {
      {
      }
    } else {
      stryCov_9fa48('2019')
      try {
        if (stryMutAct_9fa48('2020')) {
          {
          }
        } else {
          stryCov_9fa48('2020')
          const { startDate, endDate, category, limit, offset } = filters
          if (
            stryMutAct_9fa48('2023')
              ? startDate || endDate
              : stryMutAct_9fa48('2022')
                ? false
                : stryMutAct_9fa48('2021')
                  ? true
                  : (stryCov_9fa48('2021', '2022', '2023'), startDate && endDate)
          ) {
            if (stryMutAct_9fa48('2024')) {
              {
              }
            } else {
              stryCov_9fa48('2024')
              return await expenseRepository.findByDateRange(
                startDate,
                endDate,
                stryMutAct_9fa48('2025')
                  ? {}
                  : (stryCov_9fa48('2025'),
                    {
                      category,
                      limit,
                      offset
                    })
              )
            }
          }
          return await expenseRepository.findMany(
            stryMutAct_9fa48('2026')
              ? {}
              : (stryCov_9fa48('2026'),
                {
                  category,
                  active: stryMutAct_9fa48('2027') ? false : (stryCov_9fa48('2027'), true),
                  limit: stryMutAct_9fa48('2030')
                    ? limit && 50
                    : stryMutAct_9fa48('2029')
                      ? false
                      : stryMutAct_9fa48('2028')
                        ? true
                        : (stryCov_9fa48('2028', '2029', '2030'), limit || 50),
                  offset: stryMutAct_9fa48('2033')
                    ? offset && 0
                    : stryMutAct_9fa48('2032')
                      ? false
                      : stryMutAct_9fa48('2031')
                        ? true
                        : (stryCov_9fa48('2031', '2032', '2033'), offset || 0),
                  orderBy: stryMutAct_9fa48('2034')
                    ? []
                    : (stryCov_9fa48('2034'),
                      [
                        stryMutAct_9fa48('2035')
                          ? {}
                          : (stryCov_9fa48('2035'),
                            {
                              column: stryMutAct_9fa48('2036')
                                ? ''
                                : (stryCov_9fa48('2036'), 'expense_date'),
                              ascending: stryMutAct_9fa48('2037')
                                ? true
                                : (stryCov_9fa48('2037'), false)
                            })
                      ])
                })
          )
        }
      } catch (error) {
        if (stryMutAct_9fa48('2038')) {
          {
          }
        } else {
          stryCov_9fa48('2038')
          logger.error(
            stryMutAct_9fa48('2039') ? '' : (stryCov_9fa48('2039'), 'Error getting expenses'),
            stryMutAct_9fa48('2040')
              ? {}
              : (stryCov_9fa48('2040'),
                {
                  error,
                  filters
                })
          )
          throw error
        }
      }
    }
  }

  /**
   * Update expense
   * @param {string} id - Expense ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated expense
   */
  async updateExpense(id, updates) {
    if (stryMutAct_9fa48('2041')) {
      {
      }
    } else {
      stryCov_9fa48('2041')
      try {
        if (stryMutAct_9fa48('2042')) {
          {
          }
        } else {
          stryCov_9fa48('2042')
          // Validate category if provided
          if (
            stryMutAct_9fa48('2045')
              ? updates.category || !EXPENSE_CATEGORIES.includes(updates.category)
              : stryMutAct_9fa48('2044')
                ? false
                : stryMutAct_9fa48('2043')
                  ? true
                  : (stryCov_9fa48('2043', '2044', '2045'),
                    updates.category &&
                      (stryMutAct_9fa48('2046')
                        ? EXPENSE_CATEGORIES.includes(updates.category)
                        : (stryCov_9fa48('2046'), !EXPENSE_CATEGORIES.includes(updates.category))))
          ) {
            if (stryMutAct_9fa48('2047')) {
              {
              }
            } else {
              stryCov_9fa48('2047')
              throw new ValidationError(
                stryMutAct_9fa48('2048')
                  ? ``
                  : (stryCov_9fa48('2048'),
                    `Invalid category. Must be one of: ${EXPENSE_CATEGORIES.join(stryMutAct_9fa48('2049') ? '' : (stryCov_9fa48('2049'), ', '))}`)
              )
            }
          }

          // Validate amount if provided
          if (
            stryMutAct_9fa48('2052')
              ? updates.amount !== undefined || updates.amount <= 0
              : stryMutAct_9fa48('2051')
                ? false
                : stryMutAct_9fa48('2050')
                  ? true
                  : (stryCov_9fa48('2050', '2051', '2052'),
                    (stryMutAct_9fa48('2054')
                      ? updates.amount === undefined
                      : stryMutAct_9fa48('2053')
                        ? true
                        : (stryCov_9fa48('2053', '2054'), updates.amount !== undefined)) &&
                      (stryMutAct_9fa48('2057')
                        ? updates.amount > 0
                        : stryMutAct_9fa48('2056')
                          ? updates.amount < 0
                          : stryMutAct_9fa48('2055')
                            ? true
                            : (stryCov_9fa48('2055', '2056', '2057'), updates.amount <= 0)))
          ) {
            if (stryMutAct_9fa48('2058')) {
              {
              }
            } else {
              stryCov_9fa48('2058')
              throw new ValidationError(
                stryMutAct_9fa48('2059')
                  ? ''
                  : (stryCov_9fa48('2059'), 'Amount must be greater than 0')
              )
            }
          }

          // Validate payment method if provided
          if (
            stryMutAct_9fa48('2062')
              ? updates.payment_method || !PAYMENT_METHODS.includes(updates.payment_method)
              : stryMutAct_9fa48('2061')
                ? false
                : stryMutAct_9fa48('2060')
                  ? true
                  : (stryCov_9fa48('2060', '2061', '2062'),
                    updates.payment_method &&
                      (stryMutAct_9fa48('2063')
                        ? PAYMENT_METHODS.includes(updates.payment_method)
                        : (stryCov_9fa48('2063'),
                          !PAYMENT_METHODS.includes(updates.payment_method))))
          ) {
            if (stryMutAct_9fa48('2064')) {
              {
              }
            } else {
              stryCov_9fa48('2064')
              throw new ValidationError(
                stryMutAct_9fa48('2065')
                  ? ``
                  : (stryCov_9fa48('2065'),
                    `Invalid payment method. Must be one of: ${PAYMENT_METHODS.join(stryMutAct_9fa48('2066') ? '' : (stryCov_9fa48('2066'), ', '))}`)
              )
            }
          }
          const updated = await expenseRepository.update(id, updates)
          if (
            stryMutAct_9fa48('2069')
              ? false
              : stryMutAct_9fa48('2068')
                ? true
                : stryMutAct_9fa48('2067')
                  ? updated
                  : (stryCov_9fa48('2067', '2068', '2069'), !updated)
          ) {
            if (stryMutAct_9fa48('2070')) {
              {
              }
            } else {
              stryCov_9fa48('2070')
              throw new NotFoundError(
                stryMutAct_9fa48('2071') ? '' : (stryCov_9fa48('2071'), 'Expense not found')
              )
            }
          }
          logger.info(
            stryMutAct_9fa48('2072') ? '' : (stryCov_9fa48('2072'), 'Expense updated'),
            stryMutAct_9fa48('2073')
              ? {}
              : (stryCov_9fa48('2073'),
                {
                  expenseId: id
                })
          )
          return updated
        }
      } catch (error) {
        if (stryMutAct_9fa48('2074')) {
          {
          }
        } else {
          stryCov_9fa48('2074')
          logger.error(
            stryMutAct_9fa48('2075') ? '' : (stryCov_9fa48('2075'), 'Error updating expense'),
            stryMutAct_9fa48('2076')
              ? {}
              : (stryCov_9fa48('2076'),
                {
                  error,
                  id,
                  updates
                })
          )
          throw error
        }
      }
    }
  }

  /**
   * Delete expense (soft delete)
   * @param {string} id - Expense ID
   * @returns {Promise<Object>} Deleted expense
   */
  async deleteExpense(id) {
    if (stryMutAct_9fa48('2077')) {
      {
      }
    } else {
      stryCov_9fa48('2077')
      try {
        if (stryMutAct_9fa48('2078')) {
          {
          }
        } else {
          stryCov_9fa48('2078')
          const deleted = await expenseRepository.delete(id)
          if (
            stryMutAct_9fa48('2081')
              ? false
              : stryMutAct_9fa48('2080')
                ? true
                : stryMutAct_9fa48('2079')
                  ? deleted
                  : (stryCov_9fa48('2079', '2080', '2081'), !deleted)
          ) {
            if (stryMutAct_9fa48('2082')) {
              {
              }
            } else {
              stryCov_9fa48('2082')
              throw new NotFoundError(
                stryMutAct_9fa48('2083') ? '' : (stryCov_9fa48('2083'), 'Expense not found')
              )
            }
          }
          logger.info(
            stryMutAct_9fa48('2084') ? '' : (stryCov_9fa48('2084'), 'Expense deleted'),
            stryMutAct_9fa48('2085')
              ? {}
              : (stryCov_9fa48('2085'),
                {
                  expenseId: id
                })
          )
          return deleted
        }
      } catch (error) {
        if (stryMutAct_9fa48('2086')) {
          {
          }
        } else {
          stryCov_9fa48('2086')
          logger.error(
            stryMutAct_9fa48('2087') ? '' : (stryCov_9fa48('2087'), 'Error deleting expense'),
            stryMutAct_9fa48('2088')
              ? {}
              : (stryCov_9fa48('2088'),
                {
                  error,
                  id
                })
          )
          throw error
        }
      }
    }
  }

  /**
   * Get expenses by category for date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Expenses grouped by category
   */
  async getExpensesByCategory(startDate, endDate) {
    if (stryMutAct_9fa48('2089')) {
      {
      }
    } else {
      stryCov_9fa48('2089')
      try {
        if (stryMutAct_9fa48('2090')) {
          {
          }
        } else {
          stryCov_9fa48('2090')
          return await expenseRepository.getExpensesByCategory(startDate, endDate)
        }
      } catch (error) {
        if (stryMutAct_9fa48('2091')) {
          {
          }
        } else {
          stryCov_9fa48('2091')
          logger.error(
            stryMutAct_9fa48('2092')
              ? ''
              : (stryCov_9fa48('2092'), 'Error getting expenses by category'),
            stryMutAct_9fa48('2093')
              ? {}
              : (stryCov_9fa48('2093'),
                {
                  error
                })
          )
          throw error
        }
      }
    }
  }

  /**
   * Get total expenses for date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<number>} Total expenses
   */
  async getTotalExpenses(startDate, endDate) {
    if (stryMutAct_9fa48('2094')) {
      {
      }
    } else {
      stryCov_9fa48('2094')
      try {
        if (stryMutAct_9fa48('2095')) {
          {
          }
        } else {
          stryCov_9fa48('2095')
          return await expenseRepository.getTotalExpenses(startDate, endDate)
        }
      } catch (error) {
        if (stryMutAct_9fa48('2096')) {
          {
          }
        } else {
          stryCov_9fa48('2096')
          logger.error(
            stryMutAct_9fa48('2097') ? '' : (stryCov_9fa48('2097'), 'Error getting total expenses'),
            stryMutAct_9fa48('2098')
              ? {}
              : (stryCov_9fa48('2098'),
                {
                  error
                })
          )
          throw error
        }
      }
    }
  }
}
export default new ExpenseService()
