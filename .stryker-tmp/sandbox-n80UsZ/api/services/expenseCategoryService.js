/**
 * Expense Category Service
 * Business logic for expense category management
 * @module services/expenseCategoryService
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
import expenseCategoryRepository from '../repositories/expenseCategoryRepository.js'
import { NotFoundError, ValidationError, ConflictError } from '../errors/AppError.js'
import { logger } from '../utils/logger.js'
class ExpenseCategoryService {
  /**
   * Get all categories
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of categories
   */
  async getAllCategories({
    includeInactive = stryMutAct_9fa48('1812') ? true : (stryCov_9fa48('1812'), false)
  } = {}) {
    if (stryMutAct_9fa48('1813')) {
      {
      }
    } else {
      stryCov_9fa48('1813')
      try {
        if (stryMutAct_9fa48('1814')) {
          {
          }
        } else {
          stryCov_9fa48('1814')
          return await expenseCategoryRepository.findAll(
            stryMutAct_9fa48('1815')
              ? {}
              : (stryCov_9fa48('1815'),
                {
                  includeInactive
                })
          )
        }
      } catch (error) {
        if (stryMutAct_9fa48('1816')) {
          {
          }
        } else {
          stryCov_9fa48('1816')
          logger.error(
            stryMutAct_9fa48('1817')
              ? ''
              : (stryCov_9fa48('1817'), 'ExpenseCategoryService.getAllCategories error:'),
            error
          )
          throw error
        }
      }
    }
  }

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise<Object>} Category
   */
  async getCategoryById(id) {
    if (stryMutAct_9fa48('1818')) {
      {
      }
    } else {
      stryCov_9fa48('1818')
      try {
        if (stryMutAct_9fa48('1819')) {
          {
          }
        } else {
          stryCov_9fa48('1819')
          const category = await expenseCategoryRepository.findById(id)
          if (
            stryMutAct_9fa48('1822')
              ? false
              : stryMutAct_9fa48('1821')
                ? true
                : stryMutAct_9fa48('1820')
                  ? category
                  : (stryCov_9fa48('1820', '1821', '1822'), !category)
          ) {
            if (stryMutAct_9fa48('1823')) {
              {
              }
            } else {
              stryCov_9fa48('1823')
              throw new NotFoundError(
                stryMutAct_9fa48('1824')
                  ? ``
                  : (stryCov_9fa48('1824'), `Category with ID ${id} not found`)
              )
            }
          }
          return category
        }
      } catch (error) {
        if (stryMutAct_9fa48('1825')) {
          {
          }
        } else {
          stryCov_9fa48('1825')
          logger.error(
            stryMutAct_9fa48('1826')
              ? ``
              : (stryCov_9fa48('1826'), `ExpenseCategoryService.getCategoryById(${id}) error:`),
            error
          )
          throw error
        }
      }
    }
  }

  /**
   * Create new category
   * @param {Object} categoryData - Category data
   * @param {number} userId - User creating the category
   * @returns {Promise<Object>} Created category
   */
  async createCategory(categoryData, userId) {
    if (stryMutAct_9fa48('1827')) {
      {
      }
    } else {
      stryCov_9fa48('1827')
      try {
        if (stryMutAct_9fa48('1828')) {
          {
          }
        } else {
          stryCov_9fa48('1828')
          // Validate required fields
          if (
            stryMutAct_9fa48('1831')
              ? false
              : stryMutAct_9fa48('1830')
                ? true
                : stryMutAct_9fa48('1829')
                  ? categoryData.name?.trim()
                  : (stryCov_9fa48('1829', '1830', '1831'),
                    !(stryMutAct_9fa48('1833')
                      ? categoryData.name.trim()
                      : stryMutAct_9fa48('1832')
                        ? categoryData.name
                        : (stryCov_9fa48('1832', '1833'), categoryData.name?.trim())))
          ) {
            if (stryMutAct_9fa48('1834')) {
              {
              }
            } else {
              stryCov_9fa48('1834')
              throw new ValidationError(
                stryMutAct_9fa48('1835') ? '' : (stryCov_9fa48('1835'), 'Category name is required')
              )
            }
          }

          // Validate name format (lowercase, no spaces)
          const name = stryMutAct_9fa48('1837')
            ? categoryData.name.toUpperCase().trim().replace(/\s+/g, '_')
            : stryMutAct_9fa48('1836')
              ? categoryData.name.toLowerCase().replace(/\s+/g, '_')
              : (stryCov_9fa48('1836', '1837'),
                categoryData.name
                  .toLowerCase()
                  .trim()
                  .replace(
                    stryMutAct_9fa48('1839')
                      ? /\S+/g
                      : stryMutAct_9fa48('1838')
                        ? /\s/g
                        : (stryCov_9fa48('1838', '1839'), /\s+/g),
                    stryMutAct_9fa48('1840') ? '' : (stryCov_9fa48('1840'), '_')
                  ))
          if (
            stryMutAct_9fa48('1843')
              ? false
              : stryMutAct_9fa48('1842')
                ? true
                : stryMutAct_9fa48('1841')
                  ? /^[a-z0-9_]+$/.test(name)
                  : (stryCov_9fa48('1841', '1842', '1843'),
                    !(
                      stryMutAct_9fa48('1847')
                        ? /^[^a-z0-9_]+$/
                        : stryMutAct_9fa48('1846')
                          ? /^[a-z0-9_]$/
                          : stryMutAct_9fa48('1845')
                            ? /^[a-z0-9_]+/
                            : stryMutAct_9fa48('1844')
                              ? /[a-z0-9_]+$/
                              : (stryCov_9fa48('1844', '1845', '1846', '1847'), /^[a-z0-9_]+$/)
                    ).test(name))
          ) {
            if (stryMutAct_9fa48('1848')) {
              {
              }
            } else {
              stryCov_9fa48('1848')
              throw new ValidationError(
                stryMutAct_9fa48('1849')
                  ? ''
                  : (stryCov_9fa48('1849'),
                    'Category name must contain only lowercase letters, numbers, and underscores')
              )
            }
          }

          // Check if category already exists
          const existing = await expenseCategoryRepository.findByName(name)
          if (
            stryMutAct_9fa48('1851')
              ? false
              : stryMutAct_9fa48('1850')
                ? true
                : (stryCov_9fa48('1850', '1851'), existing)
          ) {
            if (stryMutAct_9fa48('1852')) {
              {
              }
            } else {
              stryCov_9fa48('1852')
              throw new ConflictError(
                stryMutAct_9fa48('1853')
                  ? ``
                  : (stryCov_9fa48('1853'), `Category "${name}" already exists`)
              )
            }
          }

          // Validate color (hex format)
          if (
            stryMutAct_9fa48('1856')
              ? categoryData.color || !/^#[0-9A-Fa-f]{6}$/.test(categoryData.color)
              : stryMutAct_9fa48('1855')
                ? false
                : stryMutAct_9fa48('1854')
                  ? true
                  : (stryCov_9fa48('1854', '1855', '1856'),
                    categoryData.color &&
                      (stryMutAct_9fa48('1857')
                        ? /^#[0-9A-Fa-f]{6}$/.test(categoryData.color)
                        : (stryCov_9fa48('1857'),
                          !(
                            stryMutAct_9fa48('1861')
                              ? /^#[^0-9A-Fa-f]{6}$/
                              : stryMutAct_9fa48('1860')
                                ? /^#[0-9A-Fa-f]$/
                                : stryMutAct_9fa48('1859')
                                  ? /^#[0-9A-Fa-f]{6}/
                                  : stryMutAct_9fa48('1858')
                                    ? /#[0-9A-Fa-f]{6}$/
                                    : (stryCov_9fa48('1858', '1859', '1860', '1861'),
                                      /^#[0-9A-Fa-f]{6}$/)
                          ).test(categoryData.color))))
          ) {
            if (stryMutAct_9fa48('1862')) {
              {
              }
            } else {
              stryCov_9fa48('1862')
              throw new ValidationError(
                stryMutAct_9fa48('1863')
                  ? ''
                  : (stryCov_9fa48('1863'), 'Invalid color format. Use hex format (e.g., #ec4899)')
              )
            }
          }
          const newCategory = stryMutAct_9fa48('1864')
            ? {}
            : (stryCov_9fa48('1864'),
              {
                name,
                description: stryMutAct_9fa48('1867')
                  ? categoryData.description?.trim() && null
                  : stryMutAct_9fa48('1866')
                    ? false
                    : stryMutAct_9fa48('1865')
                      ? true
                      : (stryCov_9fa48('1865', '1866', '1867'),
                        (stryMutAct_9fa48('1869')
                          ? categoryData.description.trim()
                          : stryMutAct_9fa48('1868')
                            ? categoryData.description
                            : (stryCov_9fa48('1868', '1869'), categoryData.description?.trim())) ||
                          null),
                icon: stryMutAct_9fa48('1872')
                  ? categoryData.icon?.trim() && '📁'
                  : stryMutAct_9fa48('1871')
                    ? false
                    : stryMutAct_9fa48('1870')
                      ? true
                      : (stryCov_9fa48('1870', '1871', '1872'),
                        (stryMutAct_9fa48('1874')
                          ? categoryData.icon.trim()
                          : stryMutAct_9fa48('1873')
                            ? categoryData.icon
                            : (stryCov_9fa48('1873', '1874'), categoryData.icon?.trim())) ||
                          (stryMutAct_9fa48('1875') ? '' : (stryCov_9fa48('1875'), '📁'))),
                color: stryMutAct_9fa48('1878')
                  ? categoryData.color && '#6b7280'
                  : stryMutAct_9fa48('1877')
                    ? false
                    : stryMutAct_9fa48('1876')
                      ? true
                      : (stryCov_9fa48('1876', '1877', '1878'),
                        categoryData.color ||
                          (stryMutAct_9fa48('1879') ? '' : (stryCov_9fa48('1879'), '#6b7280'))),
                is_default: stryMutAct_9fa48('1880') ? true : (stryCov_9fa48('1880'), false),
                active: stryMutAct_9fa48('1881') ? false : (stryCov_9fa48('1881'), true),
                created_by: userId
              })
          return await expenseCategoryRepository.create(newCategory)
        }
      } catch (error) {
        if (stryMutAct_9fa48('1882')) {
          {
          }
        } else {
          stryCov_9fa48('1882')
          logger.error(
            stryMutAct_9fa48('1883')
              ? ''
              : (stryCov_9fa48('1883'), 'ExpenseCategoryService.createCategory error:'),
            error
          )
          throw error
        }
      }
    }
  }

  /**
   * Update category
   * @param {number} id - Category ID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated category
   */
  async updateCategory(id, updates) {
    if (stryMutAct_9fa48('1884')) {
      {
      }
    } else {
      stryCov_9fa48('1884')
      try {
        if (stryMutAct_9fa48('1885')) {
          {
          }
        } else {
          stryCov_9fa48('1885')
          // Verify category exists
          const category = await expenseCategoryRepository.findById(id)
          if (
            stryMutAct_9fa48('1888')
              ? false
              : stryMutAct_9fa48('1887')
                ? true
                : stryMutAct_9fa48('1886')
                  ? category
                  : (stryCov_9fa48('1886', '1887', '1888'), !category)
          ) {
            if (stryMutAct_9fa48('1889')) {
              {
              }
            } else {
              stryCov_9fa48('1889')
              throw new NotFoundError(
                stryMutAct_9fa48('1890')
                  ? ``
                  : (stryCov_9fa48('1890'), `Category with ID ${id} not found`)
              )
            }
          }

          // Cannot modify default categories' core attributes
          if (
            stryMutAct_9fa48('1893')
              ? category.is_default || updates.name || updates.is_default === false
              : stryMutAct_9fa48('1892')
                ? false
                : stryMutAct_9fa48('1891')
                  ? true
                  : (stryCov_9fa48('1891', '1892', '1893'),
                    category.is_default &&
                      (stryMutAct_9fa48('1895')
                        ? updates.name && updates.is_default === false
                        : stryMutAct_9fa48('1894')
                          ? true
                          : (stryCov_9fa48('1894', '1895'),
                            updates.name ||
                              (stryMutAct_9fa48('1897')
                                ? updates.is_default !== false
                                : stryMutAct_9fa48('1896')
                                  ? false
                                  : (stryCov_9fa48('1896', '1897'),
                                    updates.is_default ===
                                      (stryMutAct_9fa48('1898')
                                        ? true
                                        : (stryCov_9fa48('1898'), false)))))))
          ) {
            if (stryMutAct_9fa48('1899')) {
              {
              }
            } else {
              stryCov_9fa48('1899')
              throw new ValidationError(
                stryMutAct_9fa48('1900')
                  ? ''
                  : (stryCov_9fa48('1900'),
                    'Cannot modify name or default status of system categories')
              )
            }
          }

          // Validate name if provided
          if (
            stryMutAct_9fa48('1902')
              ? false
              : stryMutAct_9fa48('1901')
                ? true
                : (stryCov_9fa48('1901', '1902'), updates.name)
          ) {
            if (stryMutAct_9fa48('1903')) {
              {
              }
            } else {
              stryCov_9fa48('1903')
              const name = stryMutAct_9fa48('1905')
                ? updates.name.toUpperCase().trim().replace(/\s+/g, '_')
                : stryMutAct_9fa48('1904')
                  ? updates.name.toLowerCase().replace(/\s+/g, '_')
                  : (stryCov_9fa48('1904', '1905'),
                    updates.name
                      .toLowerCase()
                      .trim()
                      .replace(
                        stryMutAct_9fa48('1907')
                          ? /\S+/g
                          : stryMutAct_9fa48('1906')
                            ? /\s/g
                            : (stryCov_9fa48('1906', '1907'), /\s+/g),
                        stryMutAct_9fa48('1908') ? '' : (stryCov_9fa48('1908'), '_')
                      ))
              if (
                stryMutAct_9fa48('1911')
                  ? false
                  : stryMutAct_9fa48('1910')
                    ? true
                    : stryMutAct_9fa48('1909')
                      ? /^[a-z0-9_]+$/.test(name)
                      : (stryCov_9fa48('1909', '1910', '1911'),
                        !(
                          stryMutAct_9fa48('1915')
                            ? /^[^a-z0-9_]+$/
                            : stryMutAct_9fa48('1914')
                              ? /^[a-z0-9_]$/
                              : stryMutAct_9fa48('1913')
                                ? /^[a-z0-9_]+/
                                : stryMutAct_9fa48('1912')
                                  ? /[a-z0-9_]+$/
                                  : (stryCov_9fa48('1912', '1913', '1914', '1915'), /^[a-z0-9_]+$/)
                        ).test(name))
              ) {
                if (stryMutAct_9fa48('1916')) {
                  {
                  }
                } else {
                  stryCov_9fa48('1916')
                  throw new ValidationError(
                    stryMutAct_9fa48('1917')
                      ? ''
                      : (stryCov_9fa48('1917'),
                        'Category name must contain only lowercase letters, numbers, and underscores')
                  )
                }
              }

              // Check for duplicates
              const existing = await expenseCategoryRepository.findByName(name)
              if (
                stryMutAct_9fa48('1920')
                  ? existing || existing.id !== id
                  : stryMutAct_9fa48('1919')
                    ? false
                    : stryMutAct_9fa48('1918')
                      ? true
                      : (stryCov_9fa48('1918', '1919', '1920'),
                        existing &&
                          (stryMutAct_9fa48('1922')
                            ? existing.id === id
                            : stryMutAct_9fa48('1921')
                              ? true
                              : (stryCov_9fa48('1921', '1922'), existing.id !== id)))
              ) {
                if (stryMutAct_9fa48('1923')) {
                  {
                  }
                } else {
                  stryCov_9fa48('1923')
                  throw new ConflictError(
                    stryMutAct_9fa48('1924')
                      ? ``
                      : (stryCov_9fa48('1924'), `Category "${name}" already exists`)
                  )
                }
              }
              updates.name = name
            }
          }

          // Validate color if provided
          if (
            stryMutAct_9fa48('1927')
              ? updates.color || !/^#[0-9A-Fa-f]{6}$/.test(updates.color)
              : stryMutAct_9fa48('1926')
                ? false
                : stryMutAct_9fa48('1925')
                  ? true
                  : (stryCov_9fa48('1925', '1926', '1927'),
                    updates.color &&
                      (stryMutAct_9fa48('1928')
                        ? /^#[0-9A-Fa-f]{6}$/.test(updates.color)
                        : (stryCov_9fa48('1928'),
                          !(
                            stryMutAct_9fa48('1932')
                              ? /^#[^0-9A-Fa-f]{6}$/
                              : stryMutAct_9fa48('1931')
                                ? /^#[0-9A-Fa-f]$/
                                : stryMutAct_9fa48('1930')
                                  ? /^#[0-9A-Fa-f]{6}/
                                  : stryMutAct_9fa48('1929')
                                    ? /#[0-9A-Fa-f]{6}$/
                                    : (stryCov_9fa48('1929', '1930', '1931', '1932'),
                                      /^#[0-9A-Fa-f]{6}$/)
                          ).test(updates.color))))
          ) {
            if (stryMutAct_9fa48('1933')) {
              {
              }
            } else {
              stryCov_9fa48('1933')
              throw new ValidationError(
                stryMutAct_9fa48('1934')
                  ? ''
                  : (stryCov_9fa48('1934'), 'Invalid color format. Use hex format (e.g., #ec4899)')
              )
            }
          }
          const allowedUpdates = stryMutAct_9fa48('1935')
            ? {}
            : (stryCov_9fa48('1935'),
              {
                description: stryMutAct_9fa48('1937')
                  ? updates.description.trim()
                  : stryMutAct_9fa48('1936')
                    ? updates.description
                    : (stryCov_9fa48('1936', '1937'), updates.description?.trim()),
                icon: stryMutAct_9fa48('1939')
                  ? updates.icon.trim()
                  : stryMutAct_9fa48('1938')
                    ? updates.icon
                    : (stryCov_9fa48('1938', '1939'), updates.icon?.trim()),
                color: updates.color,
                active: updates.active
              })
          if (
            stryMutAct_9fa48('1942')
              ? updates.name || !category.is_default
              : stryMutAct_9fa48('1941')
                ? false
                : stryMutAct_9fa48('1940')
                  ? true
                  : (stryCov_9fa48('1940', '1941', '1942'),
                    updates.name &&
                      (stryMutAct_9fa48('1943')
                        ? category.is_default
                        : (stryCov_9fa48('1943'), !category.is_default)))
          ) {
            if (stryMutAct_9fa48('1944')) {
              {
              }
            } else {
              stryCov_9fa48('1944')
              allowedUpdates.name = updates.name
            }
          }
          return await expenseCategoryRepository.update(id, allowedUpdates)
        }
      } catch (error) {
        if (stryMutAct_9fa48('1945')) {
          {
          }
        } else {
          stryCov_9fa48('1945')
          logger.error(
            stryMutAct_9fa48('1946')
              ? ``
              : (stryCov_9fa48('1946'), `ExpenseCategoryService.updateCategory(${id}) error:`),
            error
          )
          throw error
        }
      }
    }
  }

  /**
   * Delete category (soft delete)
   * @param {number} id - Category ID
   * @returns {Promise<Object>} Deleted category
   */
  async deleteCategory(id) {
    if (stryMutAct_9fa48('1947')) {
      {
      }
    } else {
      stryCov_9fa48('1947')
      try {
        if (stryMutAct_9fa48('1948')) {
          {
          }
        } else {
          stryCov_9fa48('1948')
          const category = await expenseCategoryRepository.findById(id)
          if (
            stryMutAct_9fa48('1951')
              ? false
              : stryMutAct_9fa48('1950')
                ? true
                : stryMutAct_9fa48('1949')
                  ? category
                  : (stryCov_9fa48('1949', '1950', '1951'), !category)
          ) {
            if (stryMutAct_9fa48('1952')) {
              {
              }
            } else {
              stryCov_9fa48('1952')
              throw new NotFoundError(
                stryMutAct_9fa48('1953')
                  ? ``
                  : (stryCov_9fa48('1953'), `Category with ID ${id} not found`)
              )
            }
          }
          if (
            stryMutAct_9fa48('1955')
              ? false
              : stryMutAct_9fa48('1954')
                ? true
                : (stryCov_9fa48('1954', '1955'), category.is_default)
          ) {
            if (stryMutAct_9fa48('1956')) {
              {
              }
            } else {
              stryCov_9fa48('1956')
              throw new ValidationError(
                stryMutAct_9fa48('1957')
                  ? ''
                  : (stryCov_9fa48('1957'), 'Cannot delete system default categories')
              )
            }
          }
          return await expenseCategoryRepository.delete(id)
        }
      } catch (error) {
        if (stryMutAct_9fa48('1958')) {
          {
          }
        } else {
          stryCov_9fa48('1958')
          logger.error(
            stryMutAct_9fa48('1959')
              ? ``
              : (stryCov_9fa48('1959'), `ExpenseCategoryService.deleteCategory(${id}) error:`),
            error
          )
          throw error
        }
      }
    }
  }
}
export default new ExpenseCategoryService()
