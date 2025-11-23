/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Settings Service - Delete Operations
 * Handles settings deletion and reactivation
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
import { getSettingsRepository, BadRequestError } from './settingsService.helpers.js'

/**
 * Delete setting (soft delete)
 * @param {string} key - Setting key to delete
 * @returns {Object} Deleted setting
 * @throws {BadRequestError} If key is invalid
 */
export async function deleteSetting(key) {
  if (stryMutAct_9fa48('5717')) {
    {
    }
  } else {
    stryCov_9fa48('5717')
    try {
      if (stryMutAct_9fa48('5718')) {
        {
        }
      } else {
        stryCov_9fa48('5718')
        if (
          stryMutAct_9fa48('5721')
            ? !key && typeof key !== 'string'
            : stryMutAct_9fa48('5720')
              ? false
              : stryMutAct_9fa48('5719')
                ? true
                : (stryCov_9fa48('5719', '5720', '5721'),
                  (stryMutAct_9fa48('5722') ? key : (stryCov_9fa48('5722'), !key)) ||
                    (stryMutAct_9fa48('5724')
                      ? typeof key === 'string'
                      : stryMutAct_9fa48('5723')
                        ? false
                        : (stryCov_9fa48('5723', '5724'),
                          typeof key !==
                            (stryMutAct_9fa48('5725') ? '' : (stryCov_9fa48('5725'), 'string')))))
        ) {
          if (stryMutAct_9fa48('5726')) {
            {
            }
          } else {
            stryCov_9fa48('5726')
            throw new BadRequestError(
              stryMutAct_9fa48('5727')
                ? ''
                : (stryCov_9fa48('5727'), 'Setting key is required and must be a string'),
              stryMutAct_9fa48('5728')
                ? {}
                : (stryCov_9fa48('5728'),
                  {
                    key
                  })
            )
          }
        }
        const settingsRepository = getSettingsRepository()
        const data = await settingsRepository.deleteByKey(key)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5729')) {
        {
        }
      } else {
        stryCov_9fa48('5729')
        console.error(
          stryMutAct_9fa48('5730') ? `` : (stryCov_9fa48('5730'), `deleteSetting(${key}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Reactivate deleted setting
 * @param {string} key - Setting key to reactivate
 * @returns {Object} Reactivated setting
 * @throws {BadRequestError} If key is invalid
 */
export async function reactivateSetting(key) {
  if (stryMutAct_9fa48('5731')) {
    {
    }
  } else {
    stryCov_9fa48('5731')
    try {
      if (stryMutAct_9fa48('5732')) {
        {
        }
      } else {
        stryCov_9fa48('5732')
        if (
          stryMutAct_9fa48('5735')
            ? !key && typeof key !== 'string'
            : stryMutAct_9fa48('5734')
              ? false
              : stryMutAct_9fa48('5733')
                ? true
                : (stryCov_9fa48('5733', '5734', '5735'),
                  (stryMutAct_9fa48('5736') ? key : (stryCov_9fa48('5736'), !key)) ||
                    (stryMutAct_9fa48('5738')
                      ? typeof key === 'string'
                      : stryMutAct_9fa48('5737')
                        ? false
                        : (stryCov_9fa48('5737', '5738'),
                          typeof key !==
                            (stryMutAct_9fa48('5739') ? '' : (stryCov_9fa48('5739'), 'string')))))
        ) {
          if (stryMutAct_9fa48('5740')) {
            {
            }
          } else {
            stryCov_9fa48('5740')
            throw new BadRequestError(
              stryMutAct_9fa48('5741')
                ? ''
                : (stryCov_9fa48('5741'), 'Setting key is required and must be a string'),
              stryMutAct_9fa48('5742')
                ? {}
                : (stryCov_9fa48('5742'),
                  {
                    key
                  })
            )
          }
        }
        const settingsRepository = getSettingsRepository()
        const data = await settingsRepository.reactivateByKey(key)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5743')) {
        {
        }
      } else {
        stryCov_9fa48('5743')
        console.error(
          stryMutAct_9fa48('5744')
            ? ``
            : (stryCov_9fa48('5744'), `reactivateSetting(${key}) failed:`),
          error
        )
        throw error
      }
    }
  }
}
