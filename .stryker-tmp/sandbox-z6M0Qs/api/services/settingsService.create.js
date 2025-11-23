/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Settings Service - Create Operations
 * Handles settings creation
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
import { getSettingsRepository, ValidationError } from './settingsService.helpers.js'

/**
 * Create new setting
 * @param {Object} settingData - Setting data
 * @returns {Object} Created setting
 * @throws {ValidationError} If setting data is invalid
 */
export async function createSetting(settingData) {
  if (stryMutAct_9fa48('5672')) {
    {
    }
  } else {
    stryCov_9fa48('5672')
    try {
      if (stryMutAct_9fa48('5673')) {
        {
        }
      } else {
        stryCov_9fa48('5673')
        const settingsRepository = getSettingsRepository()

        // Validate required fields
        if (
          stryMutAct_9fa48('5676')
            ? !settingData.key && typeof settingData.key !== 'string'
            : stryMutAct_9fa48('5675')
              ? false
              : stryMutAct_9fa48('5674')
                ? true
                : (stryCov_9fa48('5674', '5675', '5676'),
                  (stryMutAct_9fa48('5677')
                    ? settingData.key
                    : (stryCov_9fa48('5677'), !settingData.key)) ||
                    (stryMutAct_9fa48('5679')
                      ? typeof settingData.key === 'string'
                      : stryMutAct_9fa48('5678')
                        ? false
                        : (stryCov_9fa48('5678', '5679'),
                          typeof settingData.key !==
                            (stryMutAct_9fa48('5680') ? '' : (stryCov_9fa48('5680'), 'string')))))
        ) {
          if (stryMutAct_9fa48('5681')) {
            {
            }
          } else {
            stryCov_9fa48('5681')
            throw new ValidationError(
              stryMutAct_9fa48('5682')
                ? ''
                : (stryCov_9fa48('5682'), 'Setting key is required and must be a string'),
              stryMutAct_9fa48('5683')
                ? {}
                : (stryCov_9fa48('5683'),
                  {
                    field: stryMutAct_9fa48('5684') ? '' : (stryCov_9fa48('5684'), 'key'),
                    value: settingData.key
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('5687')
            ? !settingData.value && typeof settingData.value !== 'string'
            : stryMutAct_9fa48('5686')
              ? false
              : stryMutAct_9fa48('5685')
                ? true
                : (stryCov_9fa48('5685', '5686', '5687'),
                  (stryMutAct_9fa48('5688')
                    ? settingData.value
                    : (stryCov_9fa48('5688'), !settingData.value)) ||
                    (stryMutAct_9fa48('5690')
                      ? typeof settingData.value === 'string'
                      : stryMutAct_9fa48('5689')
                        ? false
                        : (stryCov_9fa48('5689', '5690'),
                          typeof settingData.value !==
                            (stryMutAct_9fa48('5691') ? '' : (stryCov_9fa48('5691'), 'string')))))
        ) {
          if (stryMutAct_9fa48('5692')) {
            {
            }
          } else {
            stryCov_9fa48('5692')
            throw new ValidationError(
              stryMutAct_9fa48('5693')
                ? ''
                : (stryCov_9fa48('5693'), 'Setting value is required and must be a string'),
              stryMutAct_9fa48('5694')
                ? {}
                : (stryCov_9fa48('5694'),
                  {
                    field: stryMutAct_9fa48('5695') ? '' : (stryCov_9fa48('5695'), 'value'),
                    value: settingData.value
                  })
            )
          }
        }

        // Prepare setting data
        const newSetting = stryMutAct_9fa48('5696')
          ? {}
          : (stryCov_9fa48('5696'),
            {
              key: settingData.key,
              value: settingData.value,
              description: stryMutAct_9fa48('5699')
                ? settingData.description && null
                : stryMutAct_9fa48('5698')
                  ? false
                  : stryMutAct_9fa48('5697')
                    ? true
                    : (stryCov_9fa48('5697', '5698', '5699'), settingData.description || null),
              category: stryMutAct_9fa48('5702')
                ? settingData.category && 'general'
                : stryMutAct_9fa48('5701')
                  ? false
                  : stryMutAct_9fa48('5700')
                    ? true
                    : (stryCov_9fa48('5700', '5701', '5702'),
                      settingData.category ||
                        (stryMutAct_9fa48('5703') ? '' : (stryCov_9fa48('5703'), 'general'))),
              is_public: stryMutAct_9fa48('5706')
                ? settingData.is_public && false
                : stryMutAct_9fa48('5705')
                  ? false
                  : stryMutAct_9fa48('5704')
                    ? true
                    : (stryCov_9fa48('5704', '5705', '5706'),
                      settingData.is_public ||
                        (stryMutAct_9fa48('5707') ? true : (stryCov_9fa48('5707'), false))),
              data_type: stryMutAct_9fa48('5710')
                ? settingData.data_type && 'string'
                : stryMutAct_9fa48('5709')
                  ? false
                  : stryMutAct_9fa48('5708')
                    ? true
                    : (stryCov_9fa48('5708', '5709', '5710'),
                      settingData.data_type ||
                        (stryMutAct_9fa48('5711') ? '' : (stryCov_9fa48('5711'), 'string'))),
              validation_rules: stryMutAct_9fa48('5714')
                ? settingData.validation_rules && null
                : stryMutAct_9fa48('5713')
                  ? false
                  : stryMutAct_9fa48('5712')
                    ? true
                    : (stryCov_9fa48('5712', '5713', '5714'), settingData.validation_rules || null)
            })

        // Use repository to create setting
        const data = await settingsRepository.create(newSetting)
        return data
      }
    } catch (error) {
      if (stryMutAct_9fa48('5715')) {
        {
        }
      } else {
        stryCov_9fa48('5715')
        console.error(
          stryMutAct_9fa48('5716') ? '' : (stryCov_9fa48('5716'), 'createSetting failed:'),
          error
        )
        throw error
      }
    }
  }
}
