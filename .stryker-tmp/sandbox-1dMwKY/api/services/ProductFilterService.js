/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * ProductFilterService
 * Servicio especializado para manejo centralizado de filtros de productos
 * Implementa la lógica de filtrado para múltiples criterios
 *
 * Principios CLAUDE.md aplicados:
 * - Service Layer Exclusive: Solo servicios acceden a repositorios
 * - KISS First: Máxima simplicidad sin abstracciones innecesarias
 * - Fail Fast: Errores específicos con logging inmediato
 * - Performance: Caché optimizado para consultas frecuentes
 * - Clean Architecture: Separación clara de responsabilidades
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
import DIContainer from '../architecture/di-container.js'
import { NotFoundError, DatabaseError } from '../errors/AppError.js'

/**
 * Get ProductRepository instance from DI Container
 * @returns {ProductRepository} Repository instance
 */
function getProductRepository() {
  if (stryMutAct_9fa48('0')) {
    {
    }
  } else {
    stryCov_9fa48('0')
    return DIContainer.resolve(
      stryMutAct_9fa48('1') ? '' : (stryCov_9fa48('1'), 'ProductRepository')
    )
  }
}

/**
 * Get OccasionRepository instance from DI Container
 * @returns {OccasionRepository} Repository instance
 */
function getOccasionRepository() {
  if (stryMutAct_9fa48('2')) {
    {
    }
  } else {
    stryCov_9fa48('2')
    return DIContainer.resolve(
      stryMutAct_9fa48('3') ? '' : (stryCov_9fa48('3'), 'OccasionRepository')
    )
  }
}

/**
 * Service especializado para filtros de productos
 * Centraliza la lógica de filtrado para evitar JOINs complejos
 */
export class ProductFilterService {
  constructor() {
    if (stryMutAct_9fa48('4')) {
      {
      }
    } else {
      stryCov_9fa48('4')
      this.productRepository = getProductRepository()
      this.occasionRepository = getOccasionRepository()
    }
  }

  /**
   * Filtra productos con múltiples criterios (ocasión, búsqueda, precio, ordenamiento)
   * @param {Object} filters - Criterios de filtrado
   * @param {boolean} [_includeDeactivated=false] - Incluir productos inactivos (solo admin)
   * @param {string} [_includeImageSize=null] - Tamaño de imagen a incluir
   * @returns {Promise<Array>} Productos filtrados
   * @throws {NotFoundError} Cuando no se encuentran productos
   */
  async filterProducts(
    filters = {},
    _includeDeactivated = stryMutAct_9fa48('5') ? true : (stryCov_9fa48('5'), false),
    _includeImageSize = null
  ) {
    if (stryMutAct_9fa48('6')) {
      {
      }
    } else {
      stryCov_9fa48('6')
      // Si hay filtro de ocasión, usar la función SQL optimizada
      if (
        stryMutAct_9fa48('9')
          ? filters.occasionId || typeof filters.occasionId === 'number'
          : stryMutAct_9fa48('8')
            ? false
            : stryMutAct_9fa48('7')
              ? true
              : (stryCov_9fa48('7', '8', '9'),
                filters.occasionId &&
                  (stryMutAct_9fa48('11')
                    ? typeof filters.occasionId !== 'number'
                    : stryMutAct_9fa48('10')
                      ? true
                      : (stryCov_9fa48('10', '11'),
                        typeof filters.occasionId ===
                          (stryMutAct_9fa48('12') ? '' : (stryCov_9fa48('12'), 'number')))))
      ) {
        if (stryMutAct_9fa48('13')) {
          {
          }
        } else {
          stryCov_9fa48('13')
          return await this.filterByOccasion(filters, _includeDeactivated, _includeImageSize)
        }
      }

      // Para filtros simples (sin ocasión), usar el método base del repository
      const query = stryMutAct_9fa48('14')
        ? {}
        : (stryCov_9fa48('14'),
          {
            ...filters
          })

      // Aplicar filtros básicos
      if (
        stryMutAct_9fa48('16')
          ? false
          : stryMutAct_9fa48('15')
            ? true
            : (stryCov_9fa48('15', '16'), filters.sku)
      ) {
        if (stryMutAct_9fa48('17')) {
          {
          }
        } else {
          stryCov_9fa48('17')
          query.sku = filters.sku
        }
      }
      if (
        stryMutAct_9fa48('20')
          ? filters.featured === undefined
          : stryMutAct_9fa48('19')
            ? false
            : stryMutAct_9fa48('18')
              ? true
              : (stryCov_9fa48('18', '19', '20'), filters.featured !== undefined)
      ) {
        if (stryMutAct_9fa48('21')) {
          {
          }
        } else {
          stryCov_9fa48('21')
          query.featured = stryMutAct_9fa48('24')
            ? filters.featured !== 'true'
            : stryMutAct_9fa48('23')
              ? false
              : stryMutAct_9fa48('22')
                ? true
                : (stryCov_9fa48('22', '23', '24'),
                  filters.featured ===
                    (stryMutAct_9fa48('25') ? '' : (stryCov_9fa48('25'), 'true')))
        }
      }
      if (
        stryMutAct_9fa48('28')
          ? filters.search || filters.search.trim() !== ''
          : stryMutAct_9fa48('27')
            ? false
            : stryMutAct_9fa48('26')
              ? true
              : (stryCov_9fa48('26', '27', '28'),
                filters.search &&
                  (stryMutAct_9fa48('30')
                    ? filters.search.trim() === ''
                    : stryMutAct_9fa48('29')
                      ? true
                      : (stryCov_9fa48('29', '30'),
                        (stryMutAct_9fa48('31')
                          ? filters.search
                          : (stryCov_9fa48('31'), filters.search.trim())) !==
                          (stryMutAct_9fa48('32')
                            ? 'Stryker was here!'
                            : (stryCov_9fa48('32'), '')))))
      ) {
        if (stryMutAct_9fa48('33')) {
          {
          }
        } else {
          stryCov_9fa48('33')
          query.search = stryMutAct_9fa48('34')
            ? filters.search
            : (stryCov_9fa48('34'), filters.search.trim())
        }
      }
      if (
        stryMutAct_9fa48('37')
          ? filters.price_min !== undefined || typeof filters.price_min === 'number'
          : stryMutAct_9fa48('36')
            ? false
            : stryMutAct_9fa48('35')
              ? true
              : (stryCov_9fa48('35', '36', '37'),
                (stryMutAct_9fa48('39')
                  ? filters.price_min === undefined
                  : stryMutAct_9fa48('38')
                    ? true
                    : (stryCov_9fa48('38', '39'), filters.price_min !== undefined)) &&
                  (stryMutAct_9fa48('41')
                    ? typeof filters.price_min !== 'number'
                    : stryMutAct_9fa48('40')
                      ? true
                      : (stryCov_9fa48('40', '41'),
                        typeof filters.price_min ===
                          (stryMutAct_9fa48('42') ? '' : (stryCov_9fa48('42'), 'number')))))
      ) {
        if (stryMutAct_9fa48('43')) {
          {
          }
        } else {
          stryCov_9fa48('43')
          query.price_min = filters.price_min
        }
      }
      if (
        stryMutAct_9fa48('46')
          ? filters.price_max !== undefined || typeof filters.price_max === 'number'
          : stryMutAct_9fa48('45')
            ? false
            : stryMutAct_9fa48('44')
              ? true
              : (stryCov_9fa48('44', '45', '46'),
                (stryMutAct_9fa48('48')
                  ? filters.price_max === undefined
                  : stryMutAct_9fa48('47')
                    ? true
                    : (stryCov_9fa48('47', '48'), filters.price_max !== undefined)) &&
                  (stryMutAct_9fa48('50')
                    ? typeof filters.price_max !== 'number'
                    : stryMutAct_9fa48('49')
                      ? true
                      : (stryCov_9fa48('49', '50'),
                        typeof filters.price_max ===
                          (stryMutAct_9fa48('51') ? '' : (stryCov_9fa48('51'), 'number')))))
      ) {
        if (stryMutAct_9fa48('52')) {
          {
          }
        } else {
          stryCov_9fa48('52')
          query.price_max = filters.price_max
        }
      }

      // Obtener productos del repository
      const products = await this.productRepository.findAllWithFilters(
        query,
        stryMutAct_9fa48('53')
          ? {}
          : (stryCov_9fa48('53'),
            {
              limit: stryMutAct_9fa48('56')
                ? filters.limit && 50
                : stryMutAct_9fa48('55')
                  ? false
                  : stryMutAct_9fa48('54')
                    ? true
                    : (stryCov_9fa48('54', '55', '56'), filters.limit || 50),
              offset: stryMutAct_9fa48('59')
                ? filters.offset && 0
                : stryMutAct_9fa48('58')
                  ? false
                  : stryMutAct_9fa48('57')
                    ? true
                    : (stryCov_9fa48('57', '58', '59'), filters.offset || 0),
              includeDeactivated
            })
      )

      // Los productos ya vienen filtrados desde el repository (SQL)
      // Solo aplicamos ordenamiento y paginación en JavaScript
      const filteredProducts = stryMutAct_9fa48('62')
        ? products && []
        : stryMutAct_9fa48('61')
          ? false
          : stryMutAct_9fa48('60')
            ? true
            : (stryCov_9fa48('60', '61', '62'),
              products ||
                (stryMutAct_9fa48('63') ? ['Stryker was here'] : (stryCov_9fa48('63'), [])))

      // Aplicar ordenamiento
      if (
        stryMutAct_9fa48('66')
          ? filters.sortBy !== 'price_asc'
          : stryMutAct_9fa48('65')
            ? false
            : stryMutAct_9fa48('64')
              ? true
              : (stryCov_9fa48('64', '65', '66'),
                filters.sortBy ===
                  (stryMutAct_9fa48('67') ? '' : (stryCov_9fa48('67'), 'price_asc')))
      ) {
        if (stryMutAct_9fa48('68')) {
          {
          }
        } else {
          stryCov_9fa48('68')
          stryMutAct_9fa48('69')
            ? filteredProducts
            : (stryCov_9fa48('69'),
              filteredProducts.sort(
                stryMutAct_9fa48('70')
                  ? () => undefined
                  : (stryCov_9fa48('70'),
                    (a, b) =>
                      stryMutAct_9fa48('71')
                        ? a.price_usd + b.price_usd
                        : (stryCov_9fa48('71'), a.price_usd - b.price_usd))
              ))
        }
      } else if (
        stryMutAct_9fa48('74')
          ? filters.sortBy !== 'price_desc'
          : stryMutAct_9fa48('73')
            ? false
            : stryMutAct_9fa48('72')
              ? true
              : (stryCov_9fa48('72', '73', '74'),
                filters.sortBy ===
                  (stryMutAct_9fa48('75') ? '' : (stryCov_9fa48('75'), 'price_desc')))
      ) {
        if (stryMutAct_9fa48('76')) {
          {
          }
        } else {
          stryCov_9fa48('76')
          stryMutAct_9fa48('77')
            ? filteredProducts
            : (stryCov_9fa48('77'),
              filteredProducts.sort(
                stryMutAct_9fa48('78')
                  ? () => undefined
                  : (stryCov_9fa48('78'),
                    (a, b) =>
                      stryMutAct_9fa48('79')
                        ? b.price_usd + a.price_usd
                        : (stryCov_9fa48('79'), b.price_usd - a.price_usd))
              ))
        }
      } else if (
        stryMutAct_9fa48('82')
          ? filters.sortBy !== 'name_asc'
          : stryMutAct_9fa48('81')
            ? false
            : stryMutAct_9fa48('80')
              ? true
              : (stryCov_9fa48('80', '81', '82'),
                filters.sortBy ===
                  (stryMutAct_9fa48('83') ? '' : (stryCov_9fa48('83'), 'name_asc')))
      ) {
        if (stryMutAct_9fa48('84')) {
          {
          }
        } else {
          stryCov_9fa48('84')
          stryMutAct_9fa48('85')
            ? filteredProducts
            : (stryCov_9fa48('85'),
              filteredProducts.sort(
                stryMutAct_9fa48('86')
                  ? () => undefined
                  : (stryCov_9fa48('86'), (a, b) => a.name.localeCompare(b.name))
              ))
        }
      } else if (
        stryMutAct_9fa48('89')
          ? filters.sortBy !== 'created_desc'
          : stryMutAct_9fa48('88')
            ? false
            : stryMutAct_9fa48('87')
              ? true
              : (stryCov_9fa48('87', '88', '89'),
                filters.sortBy ===
                  (stryMutAct_9fa48('90') ? '' : (stryCov_9fa48('90'), 'created_desc')))
      ) {
        if (stryMutAct_9fa48('91')) {
          {
          }
        } else {
          stryCov_9fa48('91')
          stryMutAct_9fa48('92')
            ? filteredProducts
            : (stryCov_9fa48('92'),
              filteredProducts.sort(
                stryMutAct_9fa48('93')
                  ? () => undefined
                  : (stryCov_9fa48('93'),
                    (a, b) =>
                      stryMutAct_9fa48('94')
                        ? new Date(b.created_at) + new Date(a.created_at)
                        : (stryCov_9fa48('94'), new Date(b.created_at) - new Date(a.created_at)))
              ))
        }
      } else {
        if (stryMutAct_9fa48('95')) {
          {
          }
        } else {
          stryCov_9fa48('95')
          // Default: más recientes primero
          stryMutAct_9fa48('96')
            ? filteredProducts
            : (stryCov_9fa48('96'),
              filteredProducts.sort(
                stryMutAct_9fa48('97')
                  ? () => undefined
                  : (stryCov_9fa48('97'),
                    (a, b) =>
                      stryMutAct_9fa48('98')
                        ? new Date(b.created_at) + new Date(a.created_at)
                        : (stryCov_9fa48('98'), new Date(b.created_at) - new Date(a.created_at)))
              ))
        }
      }

      // Paginación
      const limit = stryMutAct_9fa48('101')
        ? filters.limit && 50
        : stryMutAct_9fa48('100')
          ? false
          : stryMutAct_9fa48('99')
            ? true
            : (stryCov_9fa48('99', '100', '101'), filters.limit || 50)
      const offset = stryMutAct_9fa48('104')
        ? filters.offset && 0
        : stryMutAct_9fa48('103')
          ? false
          : stryMutAct_9fa48('102')
            ? true
            : (stryCov_9fa48('102', '103', '104'), filters.offset || 0)
      const startIndex = stryMutAct_9fa48('105')
        ? Math.max(offset, filteredProducts.length)
        : (stryCov_9fa48('105'), Math.min(offset, filteredProducts.length))
      const endIndex = stryMutAct_9fa48('106')
        ? Math.max(startIndex + limit, filteredProducts.length)
        : (stryCov_9fa48('106'),
          Math.min(
            stryMutAct_9fa48('107')
              ? startIndex - limit
              : (stryCov_9fa48('107'), startIndex + limit),
            filteredProducts.length
          ))
      return stryMutAct_9fa48('108')
        ? filteredProducts
        : (stryCov_9fa48('108'), filteredProducts.slice(startIndex, endIndex))
    }
  }

  /**
   * Filtrado específico por ocasión usando función SQL optimizada
   * @param {Object} filters - Filtros a aplicar
   * @param {boolean} [_includeDeactivated=false] - Incluir productos inactivos
   * @param {string} [_includeImageSize=null] - Tamaño de imagen a incluir
   * @returns {Promise<Array>} Productos filtrados
   * @throws {NotFoundError} Cuando no se encuentran productos para la ocasión
   * @throws {DatabaseError} Error en la llamada RPC
   */
  async filterByOccasion(
    filters,
    _includeDeactivated = stryMutAct_9fa48('109') ? true : (stryCov_9fa48('109'), false),
    _includeImageSize = null
  ) {
    if (stryMutAct_9fa48('110')) {
      {
      }
    } else {
      stryCov_9fa48('110')
      try {
        if (stryMutAct_9fa48('111')) {
          {
          }
        } else {
          stryCov_9fa48('111')
          // Usar la función SQL optimizada que ya existe en la BD
          const { data, error } = await this.productRepository.rpc(
            stryMutAct_9fa48('112') ? '' : (stryCov_9fa48('112'), 'get_products_with_occasions'),
            stryMutAct_9fa48('113')
              ? {}
              : (stryCov_9fa48('113'),
                {
                  p_occasion_id: filters.occasionId,
                  p_limit: stryMutAct_9fa48('116')
                    ? filters.limit && 50
                    : stryMutAct_9fa48('115')
                      ? false
                      : stryMutAct_9fa48('114')
                        ? true
                        : (stryCov_9fa48('114', '115', '116'), filters.limit || 50),
                  p_offset: stryMutAct_9fa48('119')
                    ? filters.offset && 0
                    : stryMutAct_9fa48('118')
                      ? false
                      : stryMutAct_9fa48('117')
                        ? true
                        : (stryCov_9fa48('117', '118', '119'), filters.offset || 0)
                })
          )
          if (
            stryMutAct_9fa48('121')
              ? false
              : stryMutAct_9fa48('120')
                ? true
                : (stryCov_9fa48('120', '121'), error)
          ) {
            if (stryMutAct_9fa48('122')) {
              {
              }
            } else {
              stryCov_9fa48('122')
              throw new DatabaseError(
                (stryMutAct_9fa48('123') ? '' : (stryCov_9fa48('123'), 'Error en consulta SQL: ')) +
                  error.message,
                stryMutAct_9fa48('124') ? '' : (stryCov_9fa48('124'), 'FILTER_BY_OCCASION'),
                stryMutAct_9fa48('125')
                  ? {}
                  : (stryCov_9fa48('125'),
                    {
                      filters,
                      sqlError: error
                    })
              )
            }
          }
          if (
            stryMutAct_9fa48('128')
              ? !data && data.length === 0
              : stryMutAct_9fa48('127')
                ? false
                : stryMutAct_9fa48('126')
                  ? true
                  : (stryCov_9fa48('126', '127', '128'),
                    (stryMutAct_9fa48('129') ? data : (stryCov_9fa48('129'), !data)) ||
                      (stryMutAct_9fa48('131')
                        ? data.length !== 0
                        : stryMutAct_9fa48('130')
                          ? false
                          : (stryCov_9fa48('130', '131'), data.length === 0)))
          ) {
            if (stryMutAct_9fa48('132')) {
              {
              }
            } else {
              stryCov_9fa48('132')
              throw new NotFoundError(
                stryMutAct_9fa48('133')
                  ? ''
                  : (stryCov_9fa48('133'), 'No products found for this occasion'),
                stryMutAct_9fa48('134') ? '' : (stryCov_9fa48('134'), 'OCCASION_NOT_FOUND'),
                stryMutAct_9fa48('135')
                  ? {}
                  : (stryCov_9fa48('135'),
                    {
                      occasionId: filters.occasionId
                    })
              )
            }
          }

          // Los productos ya vienen filtrados desde la función SQL
          // Solo aplicamos ordenamiento y paginación en JavaScript
          const filteredProducts = stryMutAct_9fa48('138')
            ? data && []
            : stryMutAct_9fa48('137')
              ? false
              : stryMutAct_9fa48('136')
                ? true
                : (stryCov_9fa48('136', '137', '138'),
                  data ||
                    (stryMutAct_9fa48('139') ? ['Stryker was here'] : (stryCov_9fa48('139'), [])))

          // Aplicar ordenamiento
          if (
            stryMutAct_9fa48('142')
              ? filters.sortBy !== 'price_asc'
              : stryMutAct_9fa48('141')
                ? false
                : stryMutAct_9fa48('140')
                  ? true
                  : (stryCov_9fa48('140', '141', '142'),
                    filters.sortBy ===
                      (stryMutAct_9fa48('143') ? '' : (stryCov_9fa48('143'), 'price_asc')))
          ) {
            if (stryMutAct_9fa48('144')) {
              {
              }
            } else {
              stryCov_9fa48('144')
              stryMutAct_9fa48('145')
                ? filteredProducts
                : (stryCov_9fa48('145'),
                  filteredProducts.sort(
                    stryMutAct_9fa48('146')
                      ? () => undefined
                      : (stryCov_9fa48('146'),
                        (a, b) =>
                          stryMutAct_9fa48('147')
                            ? a.price_usd + b.price_usd
                            : (stryCov_9fa48('147'), a.price_usd - b.price_usd))
                  ))
            }
          } else if (
            stryMutAct_9fa48('150')
              ? filters.sortBy !== 'price_desc'
              : stryMutAct_9fa48('149')
                ? false
                : stryMutAct_9fa48('148')
                  ? true
                  : (stryCov_9fa48('148', '149', '150'),
                    filters.sortBy ===
                      (stryMutAct_9fa48('151') ? '' : (stryCov_9fa48('151'), 'price_desc')))
          ) {
            if (stryMutAct_9fa48('152')) {
              {
              }
            } else {
              stryCov_9fa48('152')
              stryMutAct_9fa48('153')
                ? filteredProducts
                : (stryCov_9fa48('153'),
                  filteredProducts.sort(
                    stryMutAct_9fa48('154')
                      ? () => undefined
                      : (stryCov_9fa48('154'),
                        (a, b) =>
                          stryMutAct_9fa48('155')
                            ? b.price_usd + a.price_usd
                            : (stryCov_9fa48('155'), b.price_usd - a.price_usd))
                  ))
            }
          } else if (
            stryMutAct_9fa48('158')
              ? filters.sortBy !== 'name_asc'
              : stryMutAct_9fa48('157')
                ? false
                : stryMutAct_9fa48('156')
                  ? true
                  : (stryCov_9fa48('156', '157', '158'),
                    filters.sortBy ===
                      (stryMutAct_9fa48('159') ? '' : (stryCov_9fa48('159'), 'name_asc')))
          ) {
            if (stryMutAct_9fa48('160')) {
              {
              }
            } else {
              stryCov_9fa48('160')
              stryMutAct_9fa48('161')
                ? filteredProducts
                : (stryCov_9fa48('161'),
                  filteredProducts.sort(
                    stryMutAct_9fa48('162')
                      ? () => undefined
                      : (stryCov_9fa48('162'), (a, b) => a.name.localeCompare(b.name))
                  ))
            }
          } else {
            if (stryMutAct_9fa48('163')) {
              {
              }
            } else {
              stryCov_9fa48('163')
              // Default: más recientes primero
              stryMutAct_9fa48('164')
                ? filteredProducts
                : (stryCov_9fa48('164'),
                  filteredProducts.sort(
                    stryMutAct_9fa48('165')
                      ? () => undefined
                      : (stryCov_9fa48('165'),
                        (a, b) =>
                          stryMutAct_9fa48('166')
                            ? new Date(b.created_at) + new Date(a.created_at)
                            : (stryCov_9fa48('166'),
                              new Date(b.created_at) - new Date(a.created_at)))
                  ))
            }
          }

          // Paginación
          const limit = stryMutAct_9fa48('169')
            ? filters.limit && 50
            : stryMutAct_9fa48('168')
              ? false
              : stryMutAct_9fa48('167')
                ? true
                : (stryCov_9fa48('167', '168', '169'), filters.limit || 50)
          const offset = stryMutAct_9fa48('172')
            ? filters.offset && 0
            : stryMutAct_9fa48('171')
              ? false
              : stryMutAct_9fa48('170')
                ? true
                : (stryCov_9fa48('170', '171', '172'), filters.offset || 0)
          const startIndex = stryMutAct_9fa48('173')
            ? Math.max(offset, filteredProducts.length)
            : (stryCov_9fa48('173'), Math.min(offset, filteredProducts.length))
          const endIndex = stryMutAct_9fa48('174')
            ? Math.max(startIndex + limit, filteredProducts.length)
            : (stryCov_9fa48('174'),
              Math.min(
                stryMutAct_9fa48('175')
                  ? startIndex - limit
                  : (stryCov_9fa48('175'), startIndex + limit),
                filteredProducts.length
              ))
          return stryMutAct_9fa48('176')
            ? filteredProducts
            : (stryCov_9fa48('176'), filteredProducts.slice(startIndex, endIndex))
        }
      } catch (error) {
        if (stryMutAct_9fa48('177')) {
          {
          }
        } else {
          stryCov_9fa48('177')
          console.error(
            stryMutAct_9fa48('178')
              ? ''
              : (stryCov_9fa48('178'), '❌ ProductFilterService.filterByOccasion failed:'),
            error
          )
          throw error
        }
      }
    }
  }

  /**
   * Manejo centralizado de errores
   * @param {Error} error - Error a transformar
   * @param {string} operation - Operación donde ocurrió el error
   * @param {Object} context - Contexto adicional
   * @returns {DatabaseError} Error formateado
   */
  handleError(error, operation, context = {}) {
    if (stryMutAct_9fa48('179')) {
      {
      }
    } else {
      stryCov_9fa48('179')
      console.error(
        stryMutAct_9fa48('180')
          ? ``
          : (stryCov_9fa48('180'), `❌ ProductFilterService.${operation} failed:`),
        error
      )

      // Transformar errores específicos
      if (
        stryMutAct_9fa48('182')
          ? false
          : stryMutAct_9fa48('181')
            ? true
            : (stryCov_9fa48('181', '182'),
              error.message.includes(
                stryMutAct_9fa48('183') ? '' : (stryCov_9fa48('183'), 'relationship')
              ))
      ) {
        if (stryMutAct_9fa48('184')) {
          {
          }
        } else {
          stryCov_9fa48('184')
          return new DatabaseError(
            stryMutAct_9fa48('185')
              ? ``
              : (stryCov_9fa48('185'), `Error de relación en la base de datos en ${operation}`),
            operation,
            stryMutAct_9fa48('186')
              ? {}
              : (stryCov_9fa48('186'),
                {
                  context,
                  sqlError: error.message
                })
          )
        }
      }
      if (
        stryMutAct_9fa48('188')
          ? false
          : stryMutAct_9fa48('187')
            ? true
            : (stryCov_9fa48('187', '188'),
              error.message.includes(
                stryMutAct_9fa48('189') ? '' : (stryCov_9fa48('189'), 'function')
              ))
      ) {
        if (stryMutAct_9fa48('190')) {
          {
          }
        } else {
          stryCov_9fa48('190')
          return new DatabaseError(
            stryMutAct_9fa48('191')
              ? ``
              : (stryCov_9fa48('191'), `Error en función SQL en ${operation}`),
            operation,
            stryMutAct_9fa48('192')
              ? {}
              : (stryCov_9fa48('192'),
                {
                  context,
                  sqlError: error.message
                })
          )
        }
      }

      // Error genérico de base de datos
      return new DatabaseError(
        stryMutAct_9fa48('193')
          ? ``
          : (stryCov_9fa48('193'), `Error de base de datos en ${operation}`),
        operation,
        stryMutAct_9fa48('194')
          ? {}
          : (stryCov_9fa48('194'),
            {
              context,
              originalError: error.message
            })
      )
    }
  }
}
export default ProductFilterService
