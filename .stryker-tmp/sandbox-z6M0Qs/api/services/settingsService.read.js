/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Settings Service - Read Operations
 * Handles all settings retrieval operations
 * LEGACY: Modularizado desde settingsService.js (PHASE 5)
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
import { getSettingsRepository, NotFoundError, BadRequestError } from './settingsService.helpers.js'

/**
 * Get all settings (public or admin)
 * @param {boolean} publicOnly - Only return public settings (default: false)
 * @param {boolean} includeDeactivated - Include deactivated settings (default: false)
 * @returns {Array} Array of settings
 */
export async function getAllSettings(
  publicOnly = stryMutAct_9fa48('6075') ? true : (stryCov_9fa48('6075'), false),
  includeDeactivated = stryMutAct_9fa48('6076') ? true : (stryCov_9fa48('6076'), false)
) {
  if (stryMutAct_9fa48('6077')) {
    {
    }
  } else {
    stryCov_9fa48('6077')
    try {
      if (stryMutAct_9fa48('6078')) {
        {
        }
      } else {
        stryCov_9fa48('6078')
        const settingsRepository = getSettingsRepository()
        const data = await settingsRepository.findAll(
          stryMutAct_9fa48('6079')
            ? {}
            : (stryCov_9fa48('6079'),
              {
                publicOnly,
                includeDeactivated
              })
        )
        return stryMutAct_9fa48('6082')
          ? data && []
          : stryMutAct_9fa48('6081')
            ? false
            : stryMutAct_9fa48('6080')
              ? true
              : (stryCov_9fa48('6080', '6081', '6082'),
                data ||
                  (stryMutAct_9fa48('6083') ? ['Stryker was here'] : (stryCov_9fa48('6083'), [])))
      }
    } catch (error) {
      if (stryMutAct_9fa48('6084')) {
        {
        }
      } else {
        stryCov_9fa48('6084')
        console.error(
          stryMutAct_9fa48('6085') ? '' : (stryCov_9fa48('6085'), 'getAllSettings failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get public settings only (for frontend)
 * @returns {Array} Array of public settings
 */
export async function getPublicSettings() {
  if (stryMutAct_9fa48('6086')) {
    {
    }
  } else {
    stryCov_9fa48('6086')
    try {
      if (stryMutAct_9fa48('6087')) {
        {
        }
      } else {
        stryCov_9fa48('6087')
        const settingsRepository = getSettingsRepository()
        const data = await settingsRepository.findPublic()
        return stryMutAct_9fa48('6090')
          ? data && []
          : stryMutAct_9fa48('6089')
            ? false
            : stryMutAct_9fa48('6088')
              ? true
              : (stryCov_9fa48('6088', '6089', '6090'),
                data ||
                  (stryMutAct_9fa48('6091') ? ['Stryker was here'] : (stryCov_9fa48('6091'), [])))
      }
    } catch (error) {
      if (stryMutAct_9fa48('6092')) {
        {
        }
      } else {
        stryCov_9fa48('6092')
        console.error(
          stryMutAct_9fa48('6093') ? '' : (stryCov_9fa48('6093'), 'getPublicSettings failed:'),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get setting by key
 * @param {string} key - Setting key
 * @param {boolean} includeDeactivated - Include deactivated settings (default: false)
 * @returns {Object|null} Setting object or null
 * @throws {BadRequestError} If key is invalid
 */
export async function getSettingById(
  key,
  includeDeactivated = stryMutAct_9fa48('6094') ? true : (stryCov_9fa48('6094'), false)
) {
  if (stryMutAct_9fa48('6095')) {
    {
    }
  } else {
    stryCov_9fa48('6095')
    try {
      if (stryMutAct_9fa48('6096')) {
        {
        }
      } else {
        stryCov_9fa48('6096')
        if (
          stryMutAct_9fa48('6099')
            ? !key && typeof key !== 'string'
            : stryMutAct_9fa48('6098')
              ? false
              : stryMutAct_9fa48('6097')
                ? true
                : (stryCov_9fa48('6097', '6098', '6099'),
                  (stryMutAct_9fa48('6100') ? key : (stryCov_9fa48('6100'), !key)) ||
                    (stryMutAct_9fa48('6102')
                      ? typeof key === 'string'
                      : stryMutAct_9fa48('6101')
                        ? false
                        : (stryCov_9fa48('6101', '6102'),
                          typeof key !==
                            (stryMutAct_9fa48('6103') ? '' : (stryCov_9fa48('6103'), 'string')))))
        ) {
          if (stryMutAct_9fa48('6104')) {
            {
            }
          } else {
            stryCov_9fa48('6104')
            throw new BadRequestError(
              stryMutAct_9fa48('6105')
                ? ''
                : (stryCov_9fa48('6105'), 'Setting key is required and must be a string'),
              stryMutAct_9fa48('6106')
                ? {}
                : (stryCov_9fa48('6106'),
                  {
                    key
                  })
            )
          }
        }
        const settingsRepository = getSettingsRepository()
        const data = await settingsRepository.findByKey(key, includeDeactivated)
        if (
          stryMutAct_9fa48('6109')
            ? false
            : stryMutAct_9fa48('6108')
              ? true
              : stryMutAct_9fa48('6107')
                ? data
                : (stryCov_9fa48('6107', '6108', '6109'), !data)
        ) {
          if (stryMutAct_9fa48('6110')) {
            {
            }
          } else {
            stryCov_9fa48('6110')
            throw new NotFoundError(
              stryMutAct_9fa48('6111') ? '' : (stryCov_9fa48('6111'), 'Setting'),
              key
            )
          }
        }
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('6112')) {
        {
        }
      } else {
        stryCov_9fa48('6112')
        if (
          stryMutAct_9fa48('6115')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('6114')
              ? false
              : stryMutAct_9fa48('6113')
                ? true
                : (stryCov_9fa48('6113', '6114', '6115'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('6116') ? '' : (stryCov_9fa48('6116'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('6117')) {
            {
            }
          } else {
            stryCov_9fa48('6117')
            throw error
          }
        }
        console.error(
          stryMutAct_9fa48('6118') ? `` : (stryCov_9fa48('6118'), `getSettingById(${key}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get setting value by key (convenience method)
 * @param {string} key - Setting key
 * @returns {string|null} Setting value or null
 * @throws {NotFoundError} If setting is not found
 */
export async function getSettingValue(key) {
  if (stryMutAct_9fa48('6119')) {
    {
    }
  } else {
    stryCov_9fa48('6119')
    try {
      if (stryMutAct_9fa48('6120')) {
        {
        }
      } else {
        stryCov_9fa48('6120')
        const setting = await getSettingById(key)
        return setting ? setting.value : null
      }
    } catch (error) {
      if (stryMutAct_9fa48('6121')) {
        {
        }
      } else {
        stryCov_9fa48('6121')
        console.error(
          stryMutAct_9fa48('6122')
            ? ``
            : (stryCov_9fa48('6122'), `getSettingValue(${key}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Get multiple settings by keys
 * @param {Array} keys - Array of setting keys
 * @returns {Object} Object with key-value pairs
 */
export async function getSettingsByKeys(keys) {
  if (stryMutAct_9fa48('6123')) {
    {
    }
  } else {
    stryCov_9fa48('6123')
    try {
      if (stryMutAct_9fa48('6124')) {
        {
        }
      } else {
        stryCov_9fa48('6124')
        if (
          stryMutAct_9fa48('6127')
            ? !Array.isArray(keys) && keys.length === 0
            : stryMutAct_9fa48('6126')
              ? false
              : stryMutAct_9fa48('6125')
                ? true
                : (stryCov_9fa48('6125', '6126', '6127'),
                  (stryMutAct_9fa48('6128')
                    ? Array.isArray(keys)
                    : (stryCov_9fa48('6128'), !Array.isArray(keys))) ||
                    (stryMutAct_9fa48('6130')
                      ? keys.length !== 0
                      : stryMutAct_9fa48('6129')
                        ? false
                        : (stryCov_9fa48('6129', '6130'), keys.length === 0)))
        ) {
          if (stryMutAct_9fa48('6131')) {
            {
            }
          } else {
            stryCov_9fa48('6131')
            throw new BadRequestError(
              stryMutAct_9fa48('6132')
                ? ''
                : (stryCov_9fa48('6132'), 'Keys must be a non-empty array'),
              stryMutAct_9fa48('6133')
                ? {}
                : (stryCov_9fa48('6133'),
                  {
                    keys
                  })
            )
          }
        }
        const settingsRepository = getSettingsRepository()
        const data = await settingsRepository.findByKeys(keys)
        return stryMutAct_9fa48('6136')
          ? data && []
          : stryMutAct_9fa48('6135')
            ? false
            : stryMutAct_9fa48('6134')
              ? true
              : (stryCov_9fa48('6134', '6135', '6136'),
                data ||
                  (stryMutAct_9fa48('6137') ? ['Stryker was here'] : (stryCov_9fa48('6137'), [])))
      }
    } catch (error) {
      if (stryMutAct_9fa48('6138')) {
        {
        }
      } else {
        stryCov_9fa48('6138')
        console.error(
          stryMutAct_9fa48('6139')
            ? ``
            : (stryCov_9fa48('6139'), `getSettingsByKeys(${keys.length} keys) failed:`),
          error
        )
        throw error
      }
    }
  }
}
