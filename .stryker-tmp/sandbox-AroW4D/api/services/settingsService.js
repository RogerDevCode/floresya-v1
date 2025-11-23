/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Settings Service
 * Key-value store operations
 * Uses indexed key column (unique)
 * Soft-delete implementation using active flag (inactive settings excluded by default)
 * ENTERPRISE FAIL-FAST: Uses custom error classes with metadata
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
import { supabase, DB_SCHEMA } from './supabaseClient.js'
import { withErrorMapping } from '../middleware/error/index.js'
import {
  NotFoundError,
  DatabaseError,
  DatabaseConstraintError,
  BadRequestError,
  InternalServerError
} from '../errors/AppError.js'
import { validateSetting } from '../utils/validation.js'
const TABLE = DB_SCHEMA.settings.table

/**
 * Get all settings - optionally filter for public settings only
 * @param {boolean} [publicOnly=false] - Whether to return only public settings
 * @param {boolean} includeDeactivated - Include inactive settings (default: false, admin only)
 * @returns {Object[]} - Array of settings ordered by key
 * @throws {NotFoundError} When no settings are found
 * @throws {DatabaseError} When database query fails
 */
export async function getAllSettings(
  publicOnly = stryMutAct_9fa48('5747') ? true : (stryCov_9fa48('5747'), false),
  includeDeactivated = stryMutAct_9fa48('5748') ? true : (stryCov_9fa48('5748'), false)
) {
  if (stryMutAct_9fa48('5749')) {
    {
    }
  } else {
    stryCov_9fa48('5749')
    try {
      if (stryMutAct_9fa48('5750')) {
        {
        }
      } else {
        stryCov_9fa48('5750')
        let query = supabase
          .from(TABLE)
          .select(stryMutAct_9fa48('5751') ? '' : (stryCov_9fa48('5751'), '*'))

        // Apply activity filter explicitly for test compliance
        if (
          stryMutAct_9fa48('5754')
            ? false
            : stryMutAct_9fa48('5753')
              ? true
              : stryMutAct_9fa48('5752')
                ? includeDeactivated
                : (stryCov_9fa48('5752', '5753', '5754'), !includeDeactivated)
        ) {
          if (stryMutAct_9fa48('5755')) {
            {
            }
          } else {
            stryCov_9fa48('5755')
            query = query.eq(
              stryMutAct_9fa48('5756') ? '' : (stryCov_9fa48('5756'), 'active'),
              stryMutAct_9fa48('5757') ? false : (stryCov_9fa48('5757'), true)
            )
          }
        }

        // Filter for public settings if requested
        if (
          stryMutAct_9fa48('5759')
            ? false
            : stryMutAct_9fa48('5758')
              ? true
              : (stryCov_9fa48('5758', '5759'), publicOnly)
        ) {
          if (stryMutAct_9fa48('5760')) {
            {
            }
          } else {
            stryCov_9fa48('5760')
            query = query.eq(
              stryMutAct_9fa48('5761') ? '' : (stryCov_9fa48('5761'), 'is_public'),
              stryMutAct_9fa48('5762') ? false : (stryCov_9fa48('5762'), true)
            )
          }
        }

        // Order by key
        query = query.order(
          stryMutAct_9fa48('5763') ? '' : (stryCov_9fa48('5763'), 'key'),
          stryMutAct_9fa48('5764')
            ? {}
            : (stryCov_9fa48('5764'),
              {
                ascending: stryMutAct_9fa48('5765') ? false : (stryCov_9fa48('5765'), true)
              })
        )
        const { data, error } = await query
        if (
          stryMutAct_9fa48('5767')
            ? false
            : stryMutAct_9fa48('5766')
              ? true
              : (stryCov_9fa48('5766', '5767'), error)
        ) {
          if (stryMutAct_9fa48('5768')) {
            {
            }
          } else {
            stryCov_9fa48('5768')
            throw new DatabaseError(
              stryMutAct_9fa48('5769') ? '' : (stryCov_9fa48('5769'), 'SELECT'),
              TABLE,
              error
            )
          }
        }
        if (
          stryMutAct_9fa48('5772')
            ? false
            : stryMutAct_9fa48('5771')
              ? true
              : stryMutAct_9fa48('5770')
                ? data
                : (stryCov_9fa48('5770', '5771', '5772'), !data)
        ) {
          if (stryMutAct_9fa48('5773')) {
            {
            }
          } else {
            stryCov_9fa48('5773')
            throw new NotFoundError(
              stryMutAct_9fa48('5774') ? '' : (stryCov_9fa48('5774'), 'Settings')
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5775')) {
        {
        }
      } else {
        stryCov_9fa48('5775')
        console.error(
          stryMutAct_9fa48('5776') ? '' : (stryCov_9fa48('5776'), 'getAllSettings failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get public settings only - wrapper for getAllSettings with publicOnly=true
 * @returns {Object[]} - Array of public settings ordered by key
 * @throws {NotFoundError} When no public settings are found
 * @throws {DatabaseError} When database query fails
 */
export async function getPublicSettings() {
  if (stryMutAct_9fa48('5777')) {
    {
    }
  } else {
    stryCov_9fa48('5777')
    try {
      if (stryMutAct_9fa48('5778')) {
        {
        }
      } else {
        stryCov_9fa48('5778')
        return await getAllSettings(
          stryMutAct_9fa48('5779') ? false : (stryCov_9fa48('5779'), true)
        )
      }
    } catch (error) {
      if (stryMutAct_9fa48('5780')) {
        {
        }
      } else {
        stryCov_9fa48('5780')
        console.error(
          stryMutAct_9fa48('5781') ? '' : (stryCov_9fa48('5781'), 'getPublicSettings failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get setting by key (indexed column)
 * @param {string} key - Setting key to search for
 * @param {boolean} includeDeactivated - Include inactive settings (default: false, admin only)
 * @returns {Object} - Setting object
 * @throws {BadRequestError} When key is invalid
 * @throws {NotFoundError} When setting with key is not found
 * @throws {DatabaseError} When database query fails
 */
export async function getSettingById(
  key,
  includeDeactivated = stryMutAct_9fa48('5782') ? true : (stryCov_9fa48('5782'), false)
) {
  if (stryMutAct_9fa48('5783')) {
    {
    }
  } else {
    stryCov_9fa48('5783')
    try {
      if (stryMutAct_9fa48('5784')) {
        {
        }
      } else {
        stryCov_9fa48('5784')
        if (
          stryMutAct_9fa48('5787')
            ? !key && typeof key !== 'string'
            : stryMutAct_9fa48('5786')
              ? false
              : stryMutAct_9fa48('5785')
                ? true
                : (stryCov_9fa48('5785', '5786', '5787'),
                  (stryMutAct_9fa48('5788') ? key : (stryCov_9fa48('5788'), !key)) ||
                    (stryMutAct_9fa48('5790')
                      ? typeof key === 'string'
                      : stryMutAct_9fa48('5789')
                        ? false
                        : (stryCov_9fa48('5789', '5790'),
                          typeof key !==
                            (stryMutAct_9fa48('5791') ? '' : (stryCov_9fa48('5791'), 'string')))))
        ) {
          if (stryMutAct_9fa48('5792')) {
            {
            }
          } else {
            stryCov_9fa48('5792')
            throw new BadRequestError(
              stryMutAct_9fa48('5793')
                ? ''
                : (stryCov_9fa48('5793'), 'Invalid key: must be a string'),
              stryMutAct_9fa48('5794')
                ? {}
                : (stryCov_9fa48('5794'),
                  {
                    key
                  })
            )
          }
        }
        let query = supabase
          .from(TABLE)
          .select(stryMutAct_9fa48('5795') ? '' : (stryCov_9fa48('5795'), '*'))
          .eq(stryMutAct_9fa48('5796') ? '' : (stryCov_9fa48('5796'), 'key'), key)

        // Apply activity filter explicitly for test compliance
        if (
          stryMutAct_9fa48('5799')
            ? false
            : stryMutAct_9fa48('5798')
              ? true
              : stryMutAct_9fa48('5797')
                ? includeDeactivated
                : (stryCov_9fa48('5797', '5798', '5799'), !includeDeactivated)
        ) {
          if (stryMutAct_9fa48('5800')) {
            {
            }
          } else {
            stryCov_9fa48('5800')
            query = query.eq(
              stryMutAct_9fa48('5801') ? '' : (stryCov_9fa48('5801'), 'active'),
              stryMutAct_9fa48('5802') ? false : (stryCov_9fa48('5802'), true)
            )
          }
        }
        const { data, error } = await query.single()
        if (
          stryMutAct_9fa48('5804')
            ? false
            : stryMutAct_9fa48('5803')
              ? true
              : (stryCov_9fa48('5803', '5804'), error)
        ) {
          if (stryMutAct_9fa48('5805')) {
            {
            }
          } else {
            stryCov_9fa48('5805')
            if (
              stryMutAct_9fa48('5808')
                ? error.code !== 'PGRST116'
                : stryMutAct_9fa48('5807')
                  ? false
                  : stryMutAct_9fa48('5806')
                    ? true
                    : (stryCov_9fa48('5806', '5807', '5808'),
                      error.code ===
                        (stryMutAct_9fa48('5809') ? '' : (stryCov_9fa48('5809'), 'PGRST116')))
            ) {
              if (stryMutAct_9fa48('5810')) {
                {
                }
              } else {
                stryCov_9fa48('5810')
                throw new NotFoundError(
                  stryMutAct_9fa48('5811') ? '' : (stryCov_9fa48('5811'), 'Setting'),
                  key,
                  stryMutAct_9fa48('5812')
                    ? {}
                    : (stryCov_9fa48('5812'),
                      {
                        key,
                        includeDeactivated
                      })
                )
              }
            }
            throw new DatabaseError(
              stryMutAct_9fa48('5813') ? '' : (stryCov_9fa48('5813'), 'SELECT'),
              TABLE,
              error,
              stryMutAct_9fa48('5814')
                ? {}
                : (stryCov_9fa48('5814'),
                  {
                    key
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('5817')
            ? false
            : stryMutAct_9fa48('5816')
              ? true
              : stryMutAct_9fa48('5815')
                ? data
                : (stryCov_9fa48('5815', '5816', '5817'), !data)
        ) {
          if (stryMutAct_9fa48('5818')) {
            {
            }
          } else {
            stryCov_9fa48('5818')
            throw new NotFoundError(
              stryMutAct_9fa48('5819') ? '' : (stryCov_9fa48('5819'), 'Setting'),
              key,
              stryMutAct_9fa48('5820')
                ? {}
                : (stryCov_9fa48('5820'),
                  {
                    key,
                    includeDeactivated
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5821')) {
        {
        }
      } else {
        stryCov_9fa48('5821')
        console.error(
          stryMutAct_9fa48('5822') ? `` : (stryCov_9fa48('5822'), `getSettingById(${key}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get setting by key (indexed column)
 * @param {string} key - Setting key to search for
 * @returns {Object} - Setting object
 * @throws {BadRequestError} When key is invalid
 * @throws {NotFoundError} When setting with key is not found
 * @throws {DatabaseError} When database query fails
 */
export const getSettingByKey = withErrorMapping(
  async key => {
    if (stryMutAct_9fa48('5823')) {
      {
      }
    } else {
      stryCov_9fa48('5823')
      if (
        stryMutAct_9fa48('5826')
          ? !key && typeof key !== 'string'
          : stryMutAct_9fa48('5825')
            ? false
            : stryMutAct_9fa48('5824')
              ? true
              : (stryCov_9fa48('5824', '5825', '5826'),
                (stryMutAct_9fa48('5827') ? key : (stryCov_9fa48('5827'), !key)) ||
                  (stryMutAct_9fa48('5829')
                    ? typeof key === 'string'
                    : stryMutAct_9fa48('5828')
                      ? false
                      : (stryCov_9fa48('5828', '5829'),
                        typeof key !==
                          (stryMutAct_9fa48('5830') ? '' : (stryCov_9fa48('5830'), 'string')))))
      ) {
        if (stryMutAct_9fa48('5831')) {
          {
          }
        } else {
          stryCov_9fa48('5831')
          throw new BadRequestError(
            stryMutAct_9fa48('5832')
              ? ''
              : (stryCov_9fa48('5832'), 'Invalid key: must be a string'),
            stryMutAct_9fa48('5833')
              ? {}
              : (stryCov_9fa48('5833'),
                {
                  key
                })
          )
        }
      }
      const { data, error } = await supabase
        .from(TABLE)
        .select(stryMutAct_9fa48('5834') ? '' : (stryCov_9fa48('5834'), '*'))
        .eq(stryMutAct_9fa48('5835') ? '' : (stryCov_9fa48('5835'), 'key'), key)
        .single()
      if (
        stryMutAct_9fa48('5837')
          ? false
          : stryMutAct_9fa48('5836')
            ? true
            : (stryCov_9fa48('5836', '5837'), error)
      ) {
        if (stryMutAct_9fa48('5838')) {
          {
          }
        } else {
          stryCov_9fa48('5838')
          // Map Supabase error automatically
          throw error
        }
      }
      if (
        stryMutAct_9fa48('5841')
          ? false
          : stryMutAct_9fa48('5840')
            ? true
            : stryMutAct_9fa48('5839')
              ? data
              : (stryCov_9fa48('5839', '5840', '5841'), !data)
      ) {
        if (stryMutAct_9fa48('5842')) {
          {
          }
        } else {
          stryCov_9fa48('5842')
          throw new NotFoundError(
            stryMutAct_9fa48('5843') ? '' : (stryCov_9fa48('5843'), 'Setting'),
            key,
            stryMutAct_9fa48('5844')
              ? {}
              : (stryCov_9fa48('5844'),
                {
                  key
                })
          )
        }
      }
      return data
    }
  },
  stryMutAct_9fa48('5845') ? '' : (stryCov_9fa48('5845'), 'SELECT'),
  TABLE
)

/**
 * Get setting value (typed) - automatically parses value based on setting type
 * @param {string} key - Setting key to retrieve value for
 * @returns {*} - Parsed setting value (number, boolean, object, or string)
 * @throws {BadRequestError} When key is invalid
 * @throws {NotFoundError} When setting with key is not found
 * @throws {DatabaseError} When database query fails
 * @example
 * const deliveryCost = await getSettingValue('DELIVERY_COST_USD') // Returns: 7.0 (number)
 * const isMaintenance = await getSettingValue('MAINTENANCE_MODE') // Returns: false (boolean)
 */
export async function getSettingValue(key) {
  if (stryMutAct_9fa48('5846')) {
    {
    }
  } else {
    stryCov_9fa48('5846')
    try {
      if (stryMutAct_9fa48('5847')) {
        {
        }
      } else {
        stryCov_9fa48('5847')
        const setting = await getSettingByKey(key)

        // Parse value based on type
        switch (setting.type) {
          case stryMutAct_9fa48('5849') ? '' : (stryCov_9fa48('5849'), 'number'):
            if (stryMutAct_9fa48('5848')) {
            } else {
              stryCov_9fa48('5848')
              return parseFloat(setting.value)
            }
          case stryMutAct_9fa48('5851') ? '' : (stryCov_9fa48('5851'), 'boolean'):
            if (stryMutAct_9fa48('5850')) {
            } else {
              stryCov_9fa48('5850')
              return stryMutAct_9fa48('5854')
                ? setting.value === 'true' && setting.value === '1'
                : stryMutAct_9fa48('5853')
                  ? false
                  : stryMutAct_9fa48('5852')
                    ? true
                    : (stryCov_9fa48('5852', '5853', '5854'),
                      (stryMutAct_9fa48('5856')
                        ? setting.value !== 'true'
                        : stryMutAct_9fa48('5855')
                          ? false
                          : (stryCov_9fa48('5855', '5856'),
                            setting.value ===
                              (stryMutAct_9fa48('5857') ? '' : (stryCov_9fa48('5857'), 'true')))) ||
                        (stryMutAct_9fa48('5859')
                          ? setting.value !== '1'
                          : stryMutAct_9fa48('5858')
                            ? false
                            : (stryCov_9fa48('5858', '5859'),
                              setting.value ===
                                (stryMutAct_9fa48('5860') ? '' : (stryCov_9fa48('5860'), '1')))))
            }
          case stryMutAct_9fa48('5862') ? '' : (stryCov_9fa48('5862'), 'json'):
            if (stryMutAct_9fa48('5861')) {
            } else {
              stryCov_9fa48('5861')
              return JSON.parse(setting.value)
            }
          default:
            if (stryMutAct_9fa48('5863')) {
            } else {
              stryCov_9fa48('5863')
              return setting.value
            }
        }
      }
    } catch (error) {
      if (stryMutAct_9fa48('5864')) {
        {
        }
      } else {
        stryCov_9fa48('5864')
        console.error(
          stryMutAct_9fa48('5865')
            ? ``
            : (stryCov_9fa48('5865'), `getSettingValue(${key}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Create setting - key-value configuration entry
 * @param {Object} settingData - Setting data to create
 * @param {string} settingData.key - Setting key (required, must be unique)
 * @param {string} settingData.value - Setting value
 * @param {string} [settingData.description] - Setting description
 * @param {string} [settingData.type='string'] - Setting type (string, number, boolean, json)
 * @param {boolean} [settingData.is_public=false] - Whether setting is publicly accessible
 * @returns {Object} - Created setting
 * @throws {ValidationError} When setting data is invalid
 * @throws {DatabaseConstraintError} When setting violates database constraints (e.g., duplicate key)
 * @throws {DatabaseError} When database insert fails
 */
export async function createSetting(settingData) {
  if (stryMutAct_9fa48('5866')) {
    {
    }
  } else {
    stryCov_9fa48('5866')
    try {
      if (stryMutAct_9fa48('5867')) {
        {
        }
      } else {
        stryCov_9fa48('5867')
        validateSetting(
          settingData,
          stryMutAct_9fa48('5868') ? true : (stryCov_9fa48('5868'), false)
        )
        const newSetting = stryMutAct_9fa48('5869')
          ? {}
          : (stryCov_9fa48('5869'),
            {
              key: settingData.key,
              value: settingData.value,
              description: stryMutAct_9fa48('5872')
                ? settingData.description && null
                : stryMutAct_9fa48('5871')
                  ? false
                  : stryMutAct_9fa48('5870')
                    ? true
                    : (stryCov_9fa48('5870', '5871', '5872'), settingData.description || null),
              type: stryMutAct_9fa48('5875')
                ? settingData.type && 'string'
                : stryMutAct_9fa48('5874')
                  ? false
                  : stryMutAct_9fa48('5873')
                    ? true
                    : (stryCov_9fa48('5873', '5874', '5875'),
                      settingData.type ||
                        (stryMutAct_9fa48('5876') ? '' : (stryCov_9fa48('5876'), 'string'))),
              is_public: stryMutAct_9fa48('5879')
                ? settingData.is_public && false
                : stryMutAct_9fa48('5878')
                  ? false
                  : stryMutAct_9fa48('5877')
                    ? true
                    : (stryCov_9fa48('5877', '5878', '5879'),
                      settingData.is_public ||
                        (stryMutAct_9fa48('5880') ? true : (stryCov_9fa48('5880'), false)))
            })
        const { data, error } = await supabase.from(TABLE).insert(newSetting).select().single()
        if (
          stryMutAct_9fa48('5882')
            ? false
            : stryMutAct_9fa48('5881')
              ? true
              : (stryCov_9fa48('5881', '5882'), error)
        ) {
          if (stryMutAct_9fa48('5883')) {
            {
            }
          } else {
            stryCov_9fa48('5883')
            if (
              stryMutAct_9fa48('5886')
                ? error.code !== '23505'
                : stryMutAct_9fa48('5885')
                  ? false
                  : stryMutAct_9fa48('5884')
                    ? true
                    : (stryCov_9fa48('5884', '5885', '5886'),
                      error.code ===
                        (stryMutAct_9fa48('5887') ? '' : (stryCov_9fa48('5887'), '23505')))
            ) {
              if (stryMutAct_9fa48('5888')) {
                {
                }
              } else {
                stryCov_9fa48('5888')
                throw new DatabaseConstraintError(
                  stryMutAct_9fa48('5889') ? '' : (stryCov_9fa48('5889'), 'unique_key'),
                  TABLE,
                  stryMutAct_9fa48('5890')
                    ? {}
                    : (stryCov_9fa48('5890'),
                      {
                        key: settingData.key,
                        message: stryMutAct_9fa48('5891')
                          ? ``
                          : (stryCov_9fa48('5891'),
                            `Setting with key "${settingData.key}" already exists`)
                      })
                )
              }
            }
            throw new DatabaseError(
              stryMutAct_9fa48('5892') ? '' : (stryCov_9fa48('5892'), 'INSERT'),
              TABLE,
              error,
              stryMutAct_9fa48('5893')
                ? {}
                : (stryCov_9fa48('5893'),
                  {
                    settingData: newSetting
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('5896')
            ? false
            : stryMutAct_9fa48('5895')
              ? true
              : stryMutAct_9fa48('5894')
                ? data
                : (stryCov_9fa48('5894', '5895', '5896'), !data)
        ) {
          if (stryMutAct_9fa48('5897')) {
            {
            }
          } else {
            stryCov_9fa48('5897')
            throw new DatabaseError(
              stryMutAct_9fa48('5898') ? '' : (stryCov_9fa48('5898'), 'INSERT'),
              TABLE,
              new InternalServerError(
                stryMutAct_9fa48('5899')
                  ? ''
                  : (stryCov_9fa48('5899'), 'No data returned after insert')
              ),
              stryMutAct_9fa48('5900')
                ? {}
                : (stryCov_9fa48('5900'),
                  {
                    settingData: newSetting
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5901')) {
        {
        }
      } else {
        stryCov_9fa48('5901')
        if (
          stryMutAct_9fa48('5904')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('5903')
              ? false
              : stryMutAct_9fa48('5902')
                ? true
                : (stryCov_9fa48('5902', '5903', '5904'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('5905') ? '' : (stryCov_9fa48('5905'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('5906')) {
            {
            }
          } else {
            stryCov_9fa48('5906')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('5907') ? '' : (stryCov_9fa48('5907'), 'createSetting failed:'),
          error
        )
        throw new DatabaseError(
          stryMutAct_9fa48('5908') ? '' : (stryCov_9fa48('5908'), 'INSERT'),
          TABLE,
          error,
          stryMutAct_9fa48('5909')
            ? {}
            : (stryCov_9fa48('5909'),
              {
                settingData
              })
        )
      }
    }
  }
}

/**
 * Update setting (limited fields) - only allows updating specific setting fields
 * @param {string} key - Setting key to update
 * @param {Object} updates - Updated setting data
 * @param {string} [updates.value] - Setting value
 * @param {string} [updates.description] - Setting description
 * @param {string} [updates.type] - Setting type
 * @param {boolean} [updates.is_public] - Whether setting is publicly accessible
 * @returns {Object} - Updated setting
 * @throws {BadRequestError} When key is invalid or no valid updates are provided
 * @throws {ValidationError} When setting data is invalid
 * @throws {NotFoundError} When setting is not found
 * @throws {DatabaseError} When database update fails
 */
export async function updateSetting(key, updates) {
  if (stryMutAct_9fa48('5910')) {
    {
    }
  } else {
    stryCov_9fa48('5910')
    try {
      if (stryMutAct_9fa48('5911')) {
        {
        }
      } else {
        stryCov_9fa48('5911')
        if (
          stryMutAct_9fa48('5914')
            ? !key && typeof key !== 'string'
            : stryMutAct_9fa48('5913')
              ? false
              : stryMutAct_9fa48('5912')
                ? true
                : (stryCov_9fa48('5912', '5913', '5914'),
                  (stryMutAct_9fa48('5915') ? key : (stryCov_9fa48('5915'), !key)) ||
                    (stryMutAct_9fa48('5917')
                      ? typeof key === 'string'
                      : stryMutAct_9fa48('5916')
                        ? false
                        : (stryCov_9fa48('5916', '5917'),
                          typeof key !==
                            (stryMutAct_9fa48('5918') ? '' : (stryCov_9fa48('5918'), 'string')))))
        ) {
          if (stryMutAct_9fa48('5919')) {
            {
            }
          } else {
            stryCov_9fa48('5919')
            throw new BadRequestError(
              stryMutAct_9fa48('5920')
                ? ''
                : (stryCov_9fa48('5920'), 'Invalid key: must be a string'),
              stryMutAct_9fa48('5921')
                ? {}
                : (stryCov_9fa48('5921'),
                  {
                    key
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('5924')
            ? !updates && Object.keys(updates).length === 0
            : stryMutAct_9fa48('5923')
              ? false
              : stryMutAct_9fa48('5922')
                ? true
                : (stryCov_9fa48('5922', '5923', '5924'),
                  (stryMutAct_9fa48('5925') ? updates : (stryCov_9fa48('5925'), !updates)) ||
                    (stryMutAct_9fa48('5927')
                      ? Object.keys(updates).length !== 0
                      : stryMutAct_9fa48('5926')
                        ? false
                        : (stryCov_9fa48('5926', '5927'), Object.keys(updates).length === 0)))
        ) {
          if (stryMutAct_9fa48('5928')) {
            {
            }
          } else {
            stryCov_9fa48('5928')
            throw new BadRequestError(
              stryMutAct_9fa48('5929') ? '' : (stryCov_9fa48('5929'), 'No updates provided'),
              stryMutAct_9fa48('5930')
                ? {}
                : (stryCov_9fa48('5930'),
                  {
                    key
                  })
            )
          }
        }
        validateSetting(updates, stryMutAct_9fa48('5931') ? false : (stryCov_9fa48('5931'), true))
        const allowedFields = stryMutAct_9fa48('5932')
          ? []
          : (stryCov_9fa48('5932'),
            [
              stryMutAct_9fa48('5933') ? '' : (stryCov_9fa48('5933'), 'value'),
              stryMutAct_9fa48('5934') ? '' : (stryCov_9fa48('5934'), 'description'),
              stryMutAct_9fa48('5935') ? '' : (stryCov_9fa48('5935'), 'type'),
              stryMutAct_9fa48('5936') ? '' : (stryCov_9fa48('5936'), 'is_public')
            ])
        const sanitized = {}
        for (const field of allowedFields) {
          if (stryMutAct_9fa48('5937')) {
            {
            }
          } else {
            stryCov_9fa48('5937')
            if (
              stryMutAct_9fa48('5940')
                ? updates[field] === undefined
                : stryMutAct_9fa48('5939')
                  ? false
                  : stryMutAct_9fa48('5938')
                    ? true
                    : (stryCov_9fa48('5938', '5939', '5940'), updates[field] !== undefined)
            ) {
              if (stryMutAct_9fa48('5941')) {
                {
                }
              } else {
                stryCov_9fa48('5941')
                sanitized[field] = updates[field]
              }
            }
          }
        }
        if (
          stryMutAct_9fa48('5944')
            ? Object.keys(sanitized).length !== 0
            : stryMutAct_9fa48('5943')
              ? false
              : stryMutAct_9fa48('5942')
                ? true
                : (stryCov_9fa48('5942', '5943', '5944'), Object.keys(sanitized).length === 0)
        ) {
          if (stryMutAct_9fa48('5945')) {
            {
            }
          } else {
            stryCov_9fa48('5945')
            throw new BadRequestError(
              stryMutAct_9fa48('5946') ? '' : (stryCov_9fa48('5946'), 'No valid fields to update'),
              stryMutAct_9fa48('5947')
                ? {}
                : (stryCov_9fa48('5947'),
                  {
                    key
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(TABLE)
          .update(sanitized)
          .eq(stryMutAct_9fa48('5948') ? '' : (stryCov_9fa48('5948'), 'key'), key)
          .select()
          .single()
        if (
          stryMutAct_9fa48('5950')
            ? false
            : stryMutAct_9fa48('5949')
              ? true
              : (stryCov_9fa48('5949', '5950'), error)
        ) {
          if (stryMutAct_9fa48('5951')) {
            {
            }
          } else {
            stryCov_9fa48('5951')
            throw new DatabaseError(
              stryMutAct_9fa48('5952') ? '' : (stryCov_9fa48('5952'), 'UPDATE'),
              TABLE,
              error,
              stryMutAct_9fa48('5953')
                ? {}
                : (stryCov_9fa48('5953'),
                  {
                    key
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('5956')
            ? false
            : stryMutAct_9fa48('5955')
              ? true
              : stryMutAct_9fa48('5954')
                ? data
                : (stryCov_9fa48('5954', '5955', '5956'), !data)
        ) {
          if (stryMutAct_9fa48('5957')) {
            {
            }
          } else {
            stryCov_9fa48('5957')
            throw new NotFoundError(
              stryMutAct_9fa48('5958') ? '' : (stryCov_9fa48('5958'), 'Setting'),
              key,
              stryMutAct_9fa48('5959')
                ? {}
                : (stryCov_9fa48('5959'),
                  {
                    key
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5960')) {
        {
        }
      } else {
        stryCov_9fa48('5960')
        console.error(
          stryMutAct_9fa48('5961') ? `` : (stryCov_9fa48('5961'), `updateSetting(${key}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Update setting value (convenience method) - automatically converts value to string
 * @param {string} key - Setting key to update
 * @param {*} value - New value (will be converted to string)
 * @returns {Object} - Updated setting
 * @throws {BadRequestError} When key is invalid
 * @throws {NotFoundError} When setting is not found
 * @throws {DatabaseError} When database update fails
 * @example
 * const setting = await setSettingValue('DELIVERY_COST_USD', 8.50)
 */
export async function setSettingValue(key, value) {
  if (stryMutAct_9fa48('5962')) {
    {
    }
  } else {
    stryCov_9fa48('5962')
    try {
      if (stryMutAct_9fa48('5963')) {
        {
        }
      } else {
        stryCov_9fa48('5963')
        return await updateSetting(
          key,
          stryMutAct_9fa48('5964')
            ? {}
            : (stryCov_9fa48('5964'),
              {
                value: String(value)
              })
        )
      }
    } catch (error) {
      if (stryMutAct_9fa48('5965')) {
        {
        }
      } else {
        stryCov_9fa48('5965')
        console.error(
          stryMutAct_9fa48('5966')
            ? ``
            : (stryCov_9fa48('5966'), `setSettingValue(${key}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Soft-delete setting (sets active to false)
 * @param {string} key - Setting key to delete
 * @returns {Object} - Deactivated setting
 * @throws {BadRequestError} When key is invalid
 * @throws {NotFoundError} When setting is not found or already inactive
 * @throws {DatabaseError} When database update fails
 */
export async function deleteSetting(key) {
  if (stryMutAct_9fa48('5967')) {
    {
    }
  } else {
    stryCov_9fa48('5967')
    try {
      if (stryMutAct_9fa48('5968')) {
        {
        }
      } else {
        stryCov_9fa48('5968')
        if (
          stryMutAct_9fa48('5971')
            ? !key && typeof key !== 'string'
            : stryMutAct_9fa48('5970')
              ? false
              : stryMutAct_9fa48('5969')
                ? true
                : (stryCov_9fa48('5969', '5970', '5971'),
                  (stryMutAct_9fa48('5972') ? key : (stryCov_9fa48('5972'), !key)) ||
                    (stryMutAct_9fa48('5974')
                      ? typeof key === 'string'
                      : stryMutAct_9fa48('5973')
                        ? false
                        : (stryCov_9fa48('5973', '5974'),
                          typeof key !==
                            (stryMutAct_9fa48('5975') ? '' : (stryCov_9fa48('5975'), 'string')))))
        ) {
          if (stryMutAct_9fa48('5976')) {
            {
            }
          } else {
            stryCov_9fa48('5976')
            throw new BadRequestError(
              stryMutAct_9fa48('5977')
                ? ''
                : (stryCov_9fa48('5977'), 'Invalid key: must be a string'),
              stryMutAct_9fa48('5978')
                ? {}
                : (stryCov_9fa48('5978'),
                  {
                    key
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(TABLE)
          .update(
            stryMutAct_9fa48('5979')
              ? {}
              : (stryCov_9fa48('5979'),
                {
                  active: stryMutAct_9fa48('5980') ? true : (stryCov_9fa48('5980'), false)
                })
          )
          .eq(stryMutAct_9fa48('5981') ? '' : (stryCov_9fa48('5981'), 'key'), key)
          .eq(
            stryMutAct_9fa48('5982') ? '' : (stryCov_9fa48('5982'), 'active'),
            stryMutAct_9fa48('5983') ? false : (stryCov_9fa48('5983'), true)
          )
          .select()
          .single()
        if (
          stryMutAct_9fa48('5985')
            ? false
            : stryMutAct_9fa48('5984')
              ? true
              : (stryCov_9fa48('5984', '5985'), error)
        ) {
          if (stryMutAct_9fa48('5986')) {
            {
            }
          } else {
            stryCov_9fa48('5986')
            throw new DatabaseError(
              stryMutAct_9fa48('5987') ? '' : (stryCov_9fa48('5987'), 'UPDATE'),
              TABLE,
              error,
              stryMutAct_9fa48('5988')
                ? {}
                : (stryCov_9fa48('5988'),
                  {
                    key
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('5991')
            ? false
            : stryMutAct_9fa48('5990')
              ? true
              : stryMutAct_9fa48('5989')
                ? data
                : (stryCov_9fa48('5989', '5990', '5991'), !data)
        ) {
          if (stryMutAct_9fa48('5992')) {
            {
            }
          } else {
            stryCov_9fa48('5992')
            throw new NotFoundError(
              stryMutAct_9fa48('5993') ? '' : (stryCov_9fa48('5993'), 'Setting'),
              key,
              stryMutAct_9fa48('5994')
                ? {}
                : (stryCov_9fa48('5994'),
                  {
                    active: stryMutAct_9fa48('5995') ? false : (stryCov_9fa48('5995'), true)
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5996')) {
        {
        }
      } else {
        stryCov_9fa48('5996')
        console.error(
          stryMutAct_9fa48('5997') ? `` : (stryCov_9fa48('5997'), `deleteSetting(${key}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Reactivate setting (reverse soft-delete)
 * @param {string} key - Setting key to reactivate
 * @returns {Object} - Reactivated setting
 * @throws {BadRequestError} When key is invalid
 * @throws {NotFoundError} When setting is not found or already active
 * @throws {DatabaseError} When database update fails
 */
export async function reactivateSetting(key) {
  if (stryMutAct_9fa48('5998')) {
    {
    }
  } else {
    stryCov_9fa48('5998')
    try {
      if (stryMutAct_9fa48('5999')) {
        {
        }
      } else {
        stryCov_9fa48('5999')
        if (
          stryMutAct_9fa48('6002')
            ? !key && typeof key !== 'string'
            : stryMutAct_9fa48('6001')
              ? false
              : stryMutAct_9fa48('6000')
                ? true
                : (stryCov_9fa48('6000', '6001', '6002'),
                  (stryMutAct_9fa48('6003') ? key : (stryCov_9fa48('6003'), !key)) ||
                    (stryMutAct_9fa48('6005')
                      ? typeof key === 'string'
                      : stryMutAct_9fa48('6004')
                        ? false
                        : (stryCov_9fa48('6004', '6005'),
                          typeof key !==
                            (stryMutAct_9fa48('6006') ? '' : (stryCov_9fa48('6006'), 'string')))))
        ) {
          if (stryMutAct_9fa48('6007')) {
            {
            }
          } else {
            stryCov_9fa48('6007')
            throw new BadRequestError(
              stryMutAct_9fa48('6008')
                ? ''
                : (stryCov_9fa48('6008'), 'Invalid key: must be a string'),
              stryMutAct_9fa48('6009')
                ? {}
                : (stryCov_9fa48('6009'),
                  {
                    key
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(TABLE)
          .update(
            stryMutAct_9fa48('6010')
              ? {}
              : (stryCov_9fa48('6010'),
                {
                  active: stryMutAct_9fa48('6011') ? false : (stryCov_9fa48('6011'), true)
                })
          )
          .eq(stryMutAct_9fa48('6012') ? '' : (stryCov_9fa48('6012'), 'key'), key)
          .eq(
            stryMutAct_9fa48('6013') ? '' : (stryCov_9fa48('6013'), 'active'),
            stryMutAct_9fa48('6014') ? true : (stryCov_9fa48('6014'), false)
          )
          .select()
          .single()
        if (
          stryMutAct_9fa48('6016')
            ? false
            : stryMutAct_9fa48('6015')
              ? true
              : (stryCov_9fa48('6015', '6016'), error)
        ) {
          if (stryMutAct_9fa48('6017')) {
            {
            }
          } else {
            stryCov_9fa48('6017')
            throw new DatabaseError(
              stryMutAct_9fa48('6018') ? '' : (stryCov_9fa48('6018'), 'UPDATE'),
              TABLE,
              error,
              stryMutAct_9fa48('6019')
                ? {}
                : (stryCov_9fa48('6019'),
                  {
                    key
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('6022')
            ? false
            : stryMutAct_9fa48('6021')
              ? true
              : stryMutAct_9fa48('6020')
                ? data
                : (stryCov_9fa48('6020', '6021', '6022'), !data)
        ) {
          if (stryMutAct_9fa48('6023')) {
            {
            }
          } else {
            stryCov_9fa48('6023')
            throw new NotFoundError(
              stryMutAct_9fa48('6024') ? '' : (stryCov_9fa48('6024'), 'Setting'),
              key,
              stryMutAct_9fa48('6025')
                ? {}
                : (stryCov_9fa48('6025'),
                  {
                    active: stryMutAct_9fa48('6026') ? true : (stryCov_9fa48('6026'), false)
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('6027')) {
        {
        }
      } else {
        stryCov_9fa48('6027')
        console.error(
          stryMutAct_9fa48('6028')
            ? ``
            : (stryCov_9fa48('6028'), `reactivateSetting(${key}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Bulk get settings by keys - retrieves multiple settings in a single query
 * @param {string[]} keys - Array of setting keys to retrieve
 * @returns {Object[]} - Array of setting objects for the requested keys
 * @throws {BadRequestError} When keys array is invalid
 * @throws {NotFoundError} When no settings are found for the requested keys
 * @throws {DatabaseError} When database query fails
 * @example
 * const settings = await getSettingsByKeys(['DELIVERY_COST_USD', 'bcv_usd_rate'])
 */
export async function getSettingsByKeys(keys) {
  if (stryMutAct_9fa48('6029')) {
    {
    }
  } else {
    stryCov_9fa48('6029')
    try {
      if (stryMutAct_9fa48('6030')) {
        {
        }
      } else {
        stryCov_9fa48('6030')
        if (
          stryMutAct_9fa48('6033')
            ? !Array.isArray(keys) && keys.length === 0
            : stryMutAct_9fa48('6032')
              ? false
              : stryMutAct_9fa48('6031')
                ? true
                : (stryCov_9fa48('6031', '6032', '6033'),
                  (stryMutAct_9fa48('6034')
                    ? Array.isArray(keys)
                    : (stryCov_9fa48('6034'), !Array.isArray(keys))) ||
                    (stryMutAct_9fa48('6036')
                      ? keys.length !== 0
                      : stryMutAct_9fa48('6035')
                        ? false
                        : (stryCov_9fa48('6035', '6036'), keys.length === 0)))
        ) {
          if (stryMutAct_9fa48('6037')) {
            {
            }
          } else {
            stryCov_9fa48('6037')
            throw new BadRequestError(
              stryMutAct_9fa48('6038')
                ? ''
                : (stryCov_9fa48('6038'), 'Invalid keys: must be a non-empty array'),
              stryMutAct_9fa48('6039')
                ? {}
                : (stryCov_9fa48('6039'),
                  {
                    keys
                  })
            )
          }
        }
        const { data, error } = await supabase
          .from(TABLE)
          .select(stryMutAct_9fa48('6040') ? '' : (stryCov_9fa48('6040'), '*'))
          .in(stryMutAct_9fa48('6041') ? '' : (stryCov_9fa48('6041'), 'key'), keys)
        if (
          stryMutAct_9fa48('6043')
            ? false
            : stryMutAct_9fa48('6042')
              ? true
              : (stryCov_9fa48('6042', '6043'), error)
        ) {
          if (stryMutAct_9fa48('6044')) {
            {
            }
          } else {
            stryCov_9fa48('6044')
            throw new DatabaseError(
              stryMutAct_9fa48('6045') ? '' : (stryCov_9fa48('6045'), 'SELECT'),
              TABLE,
              error,
              stryMutAct_9fa48('6046')
                ? {}
                : (stryCov_9fa48('6046'),
                  {
                    keys
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('6049')
            ? false
            : stryMutAct_9fa48('6048')
              ? true
              : stryMutAct_9fa48('6047')
                ? data
                : (stryCov_9fa48('6047', '6048', '6049'), !data)
        ) {
          if (stryMutAct_9fa48('6050')) {
            {
            }
          } else {
            stryCov_9fa48('6050')
            throw new NotFoundError(
              stryMutAct_9fa48('6051') ? '' : (stryCov_9fa48('6051'), 'Settings'),
              keys,
              stryMutAct_9fa48('6052')
                ? {}
                : (stryCov_9fa48('6052'),
                  {
                    keys
                  })
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('6053')) {
        {
        }
      } else {
        stryCov_9fa48('6053')
        console.error(
          stryMutAct_9fa48('6054') ? '' : (stryCov_9fa48('6054'), 'getSettingsByKeys failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get settings as key-value map - returns typed values based on setting type
 * @param {boolean} [publicOnly=false] - Whether to return only public settings
 * @returns {Object} - Map of setting keys to parsed values
 * @throws {NotFoundError} When no settings are found
 * @throws {DatabaseError} When database query fails
 * @example
 * const settings = await getSettingsMap()
 * // Returns: { DELIVERY_COST_USD: 7.0, bcv_usd_rate: 40.0, MAINTENANCE_MODE: false }
 */
export const getSettingsMap = withErrorMapping(
  async (publicOnly = stryMutAct_9fa48('6055') ? true : (stryCov_9fa48('6055'), false)) => {
    if (stryMutAct_9fa48('6056')) {
      {
      }
    } else {
      stryCov_9fa48('6056')
      const settings = await getAllSettings(publicOnly)
      const map = {}
      for (const setting of settings) {
        if (stryMutAct_9fa48('6057')) {
          {
          }
        } else {
          stryCov_9fa48('6057')
          // Parse value based on type
          switch (setting.type) {
            case stryMutAct_9fa48('6059') ? '' : (stryCov_9fa48('6059'), 'number'):
              if (stryMutAct_9fa48('6058')) {
              } else {
                stryCov_9fa48('6058')
                map[setting.key] = parseFloat(setting.value)
                break
              }
            case stryMutAct_9fa48('6061') ? '' : (stryCov_9fa48('6061'), 'boolean'):
              if (stryMutAct_9fa48('6060')) {
              } else {
                stryCov_9fa48('6060')
                map[setting.key] = stryMutAct_9fa48('6064')
                  ? setting.value === 'true' && setting.value === '1'
                  : stryMutAct_9fa48('6063')
                    ? false
                    : stryMutAct_9fa48('6062')
                      ? true
                      : (stryCov_9fa48('6062', '6063', '6064'),
                        (stryMutAct_9fa48('6066')
                          ? setting.value !== 'true'
                          : stryMutAct_9fa48('6065')
                            ? false
                            : (stryCov_9fa48('6065', '6066'),
                              setting.value ===
                                (stryMutAct_9fa48('6067')
                                  ? ''
                                  : (stryCov_9fa48('6067'), 'true')))) ||
                          (stryMutAct_9fa48('6069')
                            ? setting.value !== '1'
                            : stryMutAct_9fa48('6068')
                              ? false
                              : (stryCov_9fa48('6068', '6069'),
                                setting.value ===
                                  (stryMutAct_9fa48('6070') ? '' : (stryCov_9fa48('6070'), '1')))))
                break
              }
            case stryMutAct_9fa48('6072') ? '' : (stryCov_9fa48('6072'), 'json'):
              if (stryMutAct_9fa48('6071')) {
              } else {
                stryCov_9fa48('6071')
                map[setting.key] = JSON.parse(setting.value)
                break
              }
            default:
              if (stryMutAct_9fa48('6073')) {
              } else {
                stryCov_9fa48('6073')
                map[setting.key] = setting.value
              }
          }
        }
      }
      return map
    }
  },
  stryMutAct_9fa48('6074') ? '' : (stryCov_9fa48('6074'), 'SELECT'),
  TABLE
)
