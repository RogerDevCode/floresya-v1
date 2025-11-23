/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Settings Service - Update Operations
 * Handles settings updates
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
import {
  getSettingsRepository,
  ValidationError,
  BadRequestError
} from './settingsService.helpers.js'

/**
 * Update setting
 * @param {string} key - Setting key to update
 * @param {Object} updates - Updated setting data
 * @returns {Object} Updated setting
 * @throws {BadRequestError} If key is invalid
 * @throws {ValidationError} If update data is invalid
 */
export async function updateSetting(key, updates) {
  if (stryMutAct_9fa48('6140')) {
    {
    }
  } else {
    stryCov_9fa48('6140')
    try {
      if (stryMutAct_9fa48('6141')) {
        {
        }
      } else {
        stryCov_9fa48('6141')
        if (
          stryMutAct_9fa48('6144')
            ? !key && typeof key !== 'string'
            : stryMutAct_9fa48('6143')
              ? false
              : stryMutAct_9fa48('6142')
                ? true
                : (stryCov_9fa48('6142', '6143', '6144'),
                  (stryMutAct_9fa48('6145') ? key : (stryCov_9fa48('6145'), !key)) ||
                    (stryMutAct_9fa48('6147')
                      ? typeof key === 'string'
                      : stryMutAct_9fa48('6146')
                        ? false
                        : (stryCov_9fa48('6146', '6147'),
                          typeof key !==
                            (stryMutAct_9fa48('6148') ? '' : (stryCov_9fa48('6148'), 'string')))))
        ) {
          if (stryMutAct_9fa48('6149')) {
            {
            }
          } else {
            stryCov_9fa48('6149')
            throw new BadRequestError(
              stryMutAct_9fa48('6150')
                ? ''
                : (stryCov_9fa48('6150'), 'Setting key is required and must be a string'),
              stryMutAct_9fa48('6151')
                ? {}
                : (stryCov_9fa48('6151'),
                  {
                    key
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('6154')
            ? !updates && Object.keys(updates).length === 0
            : stryMutAct_9fa48('6153')
              ? false
              : stryMutAct_9fa48('6152')
                ? true
                : (stryCov_9fa48('6152', '6153', '6154'),
                  (stryMutAct_9fa48('6155') ? updates : (stryCov_9fa48('6155'), !updates)) ||
                    (stryMutAct_9fa48('6157')
                      ? Object.keys(updates).length !== 0
                      : stryMutAct_9fa48('6156')
                        ? false
                        : (stryCov_9fa48('6156', '6157'), Object.keys(updates).length === 0)))
        ) {
          if (stryMutAct_9fa48('6158')) {
            {
            }
          } else {
            stryCov_9fa48('6158')
            throw new BadRequestError(
              stryMutAct_9fa48('6159') ? '' : (stryCov_9fa48('6159'), 'No updates provided'),
              stryMutAct_9fa48('6160')
                ? {}
                : (stryCov_9fa48('6160'),
                  {
                    key
                  })
            )
          }
        }
        const settingsRepository = getSettingsRepository()

        // Validate updates if value is being changed
        if (
          stryMutAct_9fa48('6163')
            ? updates.value === undefined
            : stryMutAct_9fa48('6162')
              ? false
              : stryMutAct_9fa48('6161')
                ? true
                : (stryCov_9fa48('6161', '6162', '6163'), updates.value !== undefined)
        ) {
          if (stryMutAct_9fa48('6164')) {
            {
            }
          } else {
            stryCov_9fa48('6164')
            if (
              stryMutAct_9fa48('6167')
                ? typeof updates.value === 'string'
                : stryMutAct_9fa48('6166')
                  ? false
                  : stryMutAct_9fa48('6165')
                    ? true
                    : (stryCov_9fa48('6165', '6166', '6167'),
                      typeof updates.value !==
                        (stryMutAct_9fa48('6168') ? '' : (stryCov_9fa48('6168'), 'string')))
            ) {
              if (stryMutAct_9fa48('6169')) {
                {
                }
              } else {
                stryCov_9fa48('6169')
                throw new ValidationError(
                  stryMutAct_9fa48('6170')
                    ? ''
                    : (stryCov_9fa48('6170'), 'Setting value must be a string'),
                  stryMutAct_9fa48('6171')
                    ? {}
                    : (stryCov_9fa48('6171'),
                      {
                        field: stryMutAct_9fa48('6172') ? '' : (stryCov_9fa48('6172'), 'value'),
                        value: updates.value
                      })
                )
              }
            }
          }
        }

        // Use repository to update setting
        const data = await settingsRepository.updateByKey(key, updates)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('6173')) {
        {
        }
      } else {
        stryCov_9fa48('6173')
        console.error(
          stryMutAct_9fa48('6174') ? `` : (stryCov_9fa48('6174'), `updateSetting(${key}) failed:`),
          error
        )
        throw error
      }
    }
  }
}

/**
 * Set setting value (convenience method)
 * @param {string} key - Setting key
 * @param {string} value - New value
 * @returns {Object} Updated setting
 */
export async function setSettingValue(key, value) {
  if (stryMutAct_9fa48('6175')) {
    {
    }
  } else {
    stryCov_9fa48('6175')
    try {
      if (stryMutAct_9fa48('6176')) {
        {
        }
      } else {
        stryCov_9fa48('6176')
        if (
          stryMutAct_9fa48('6179')
            ? !key && typeof key !== 'string'
            : stryMutAct_9fa48('6178')
              ? false
              : stryMutAct_9fa48('6177')
                ? true
                : (stryCov_9fa48('6177', '6178', '6179'),
                  (stryMutAct_9fa48('6180') ? key : (stryCov_9fa48('6180'), !key)) ||
                    (stryMutAct_9fa48('6182')
                      ? typeof key === 'string'
                      : stryMutAct_9fa48('6181')
                        ? false
                        : (stryCov_9fa48('6181', '6182'),
                          typeof key !==
                            (stryMutAct_9fa48('6183') ? '' : (stryCov_9fa48('6183'), 'string')))))
        ) {
          if (stryMutAct_9fa48('6184')) {
            {
            }
          } else {
            stryCov_9fa48('6184')
            throw new BadRequestError(
              stryMutAct_9fa48('6185')
                ? ''
                : (stryCov_9fa48('6185'), 'Setting key is required and must be a string'),
              stryMutAct_9fa48('6186')
                ? {}
                : (stryCov_9fa48('6186'),
                  {
                    key
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('6189')
            ? value === undefined && value === null
            : stryMutAct_9fa48('6188')
              ? false
              : stryMutAct_9fa48('6187')
                ? true
                : (stryCov_9fa48('6187', '6188', '6189'),
                  (stryMutAct_9fa48('6191')
                    ? value !== undefined
                    : stryMutAct_9fa48('6190')
                      ? false
                      : (stryCov_9fa48('6190', '6191'), value === undefined)) ||
                    (stryMutAct_9fa48('6193')
                      ? value !== null
                      : stryMutAct_9fa48('6192')
                        ? false
                        : (stryCov_9fa48('6192', '6193'), value === null)))
        ) {
          if (stryMutAct_9fa48('6194')) {
            {
            }
          } else {
            stryCov_9fa48('6194')
            throw new BadRequestError(
              stryMutAct_9fa48('6195') ? '' : (stryCov_9fa48('6195'), 'Value is required'),
              stryMutAct_9fa48('6196')
                ? {}
                : (stryCov_9fa48('6196'),
                  {
                    key,
                    value
                  })
            )
          }
        }
        return await updateSetting(
          key,
          stryMutAct_9fa48('6197')
            ? {}
            : (stryCov_9fa48('6197'),
              {
                value: value.toString()
              })
        )
      }
    } catch (error) {
      if (stryMutAct_9fa48('6198')) {
        {
        }
      } else {
        stryCov_9fa48('6198')
        console.error(
          stryMutAct_9fa48('6199')
            ? ``
            : (stryCov_9fa48('6199'), `setSettingValue(${key}) failed:`),
          error
        )
        throw error
      }
    }
  }
}
