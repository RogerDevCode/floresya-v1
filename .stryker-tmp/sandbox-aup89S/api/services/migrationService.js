/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Migration Service
 * Handles database schema migrations
 * Service Layer Exclusivo: Only service that can access supabaseClient
 *
 * Uses centralized structured logging
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
import { supabase } from './supabaseClient.js'
import { log as logger } from '../utils/logger.js'
import { DatabaseError } from '../errors/AppError.js'

/**
 * Execute migration to add active column to settings table
 * @returns {Object} Migration result
 * @throws {DatabaseError} If migration fails
 */
export async function addIsActiveToSettings() {
  if (stryMutAct_9fa48('2099')) {
    {
    }
  } else {
    stryCov_9fa48('2099')
    logger.info(
      stryMutAct_9fa48('2100')
        ? ''
        : (stryCov_9fa48('2100'), 'Executing migration: Adding active column to settings table')
    )
    try {
      if (stryMutAct_9fa48('2101')) {
        {
        }
      } else {
        stryCov_9fa48('2101')
        // Check if column exists
        const { data: columnExists, error: checkError } = await supabase.rpc(
          stryMutAct_9fa48('2102') ? '' : (stryCov_9fa48('2102'), 'execute_sql'),
          stryMutAct_9fa48('2103')
            ? {}
            : (stryCov_9fa48('2103'),
              {
                sql_query: stryMutAct_9fa48('2104')
                  ? ``
                  : (stryCov_9fa48('2104'),
                    `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'settings' AND column_name = 'active'
      `)
              })
        )
        if (
          stryMutAct_9fa48('2106')
            ? false
            : stryMutAct_9fa48('2105')
              ? true
              : (stryCov_9fa48('2105', '2106'), checkError)
        ) {
          if (stryMutAct_9fa48('2107')) {
            {
            }
          } else {
            stryCov_9fa48('2107')
            logger.error(
              stryMutAct_9fa48('2108')
                ? ''
                : (stryCov_9fa48('2108'), 'Error checking column existence'),
              checkError
            )
            throw new DatabaseError(
              stryMutAct_9fa48('2109') ? '' : (stryCov_9fa48('2109'), 'CHECK_COLUMN'),
              stryMutAct_9fa48('2110') ? '' : (stryCov_9fa48('2110'), 'information_schema'),
              checkError
            )
          }
        }
        if (
          stryMutAct_9fa48('2113')
            ? columnExists || columnExists.length > 0
            : stryMutAct_9fa48('2112')
              ? false
              : stryMutAct_9fa48('2111')
                ? true
                : (stryCov_9fa48('2111', '2112', '2113'),
                  columnExists &&
                    (stryMutAct_9fa48('2116')
                      ? columnExists.length <= 0
                      : stryMutAct_9fa48('2115')
                        ? columnExists.length >= 0
                        : stryMutAct_9fa48('2114')
                          ? true
                          : (stryCov_9fa48('2114', '2115', '2116'), columnExists.length > 0)))
        ) {
          if (stryMutAct_9fa48('2117')) {
            {
            }
          } else {
            stryCov_9fa48('2117')
            logger.info(
              stryMutAct_9fa48('2118')
                ? ''
                : (stryCov_9fa48('2118'), 'Column active already exists in settings table')
            )
            return stryMutAct_9fa48('2119')
              ? {}
              : (stryCov_9fa48('2119'),
                {
                  success: stryMutAct_9fa48('2120') ? false : (stryCov_9fa48('2120'), true),
                  message: stryMutAct_9fa48('2121')
                    ? ''
                    : (stryCov_9fa48('2121'), 'Column active already exists in settings table'),
                  columnExisted: stryMutAct_9fa48('2122') ? false : (stryCov_9fa48('2122'), true)
                })
          }
        }

        // Add active column
        const { error: addColumnError } = await supabase.rpc(
          stryMutAct_9fa48('2123') ? '' : (stryCov_9fa48('2123'), 'execute_sql'),
          stryMutAct_9fa48('2124')
            ? {}
            : (stryCov_9fa48('2124'),
              {
                sql_query: stryMutAct_9fa48('2125')
                  ? ``
                  : (stryCov_9fa48('2125'),
                    `
        ALTER TABLE public.settings
        ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

        COMMENT ON COLUMN public.settings.active
        IS 'Soft-delete flag - false means setting is deactivated';
      `)
              })
        )
        if (
          stryMutAct_9fa48('2127')
            ? false
            : stryMutAct_9fa48('2126')
              ? true
              : (stryCov_9fa48('2126', '2127'), addColumnError)
        ) {
          if (stryMutAct_9fa48('2128')) {
            {
            }
          } else {
            stryCov_9fa48('2128')
            logger.error(
              stryMutAct_9fa48('2129') ? '' : (stryCov_9fa48('2129'), 'Error adding active column'),
              addColumnError
            )
            throw new DatabaseError(
              stryMutAct_9fa48('2130') ? '' : (stryCov_9fa48('2130'), 'ALTER_TABLE'),
              stryMutAct_9fa48('2131') ? '' : (stryCov_9fa48('2131'), 'settings'),
              addColumnError
            )
          }
        }

        // Update existing records
        const { error: updateError } = await supabase.rpc(
          stryMutAct_9fa48('2132') ? '' : (stryCov_9fa48('2132'), 'execute_sql'),
          stryMutAct_9fa48('2133')
            ? {}
            : (stryCov_9fa48('2133'),
              {
                sql_query: stryMutAct_9fa48('2134')
                  ? ``
                  : (stryCov_9fa48('2134'),
                    `
        UPDATE public.settings
        SET active = true
        WHERE active IS NULL;
      `)
              })
        )
        if (
          stryMutAct_9fa48('2136')
            ? false
            : stryMutAct_9fa48('2135')
              ? true
              : (stryCov_9fa48('2135', '2136'), updateError)
        ) {
          if (stryMutAct_9fa48('2137')) {
            {
            }
          } else {
            stryCov_9fa48('2137')
            logger.error(
              stryMutAct_9fa48('2138')
                ? ''
                : (stryCov_9fa48('2138'), 'Error updating existing records'),
              updateError
            )
            throw new DatabaseError(
              stryMutAct_9fa48('2139') ? '' : (stryCov_9fa48('2139'), 'UPDATE'),
              stryMutAct_9fa48('2140') ? '' : (stryCov_9fa48('2140'), 'settings'),
              updateError
            )
          }
        }
        logger.info(
          stryMutAct_9fa48('2141')
            ? ''
            : (stryCov_9fa48('2141'), 'Successfully added active column to settings table')
        )
        return stryMutAct_9fa48('2142')
          ? {}
          : (stryCov_9fa48('2142'),
            {
              success: stryMutAct_9fa48('2143') ? false : (stryCov_9fa48('2143'), true),
              message: stryMutAct_9fa48('2144')
                ? ''
                : (stryCov_9fa48('2144'), 'Successfully added active column to settings table'),
              columnExisted: stryMutAct_9fa48('2145') ? true : (stryCov_9fa48('2145'), false)
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('2146')) {
        {
        }
      } else {
        stryCov_9fa48('2146')
        logger.error(
          stryMutAct_9fa48('2147') ? '' : (stryCov_9fa48('2147'), 'Migration failed'),
          error
        )
        if (
          stryMutAct_9fa48('2149')
            ? false
            : stryMutAct_9fa48('2148')
              ? true
              : (stryCov_9fa48('2148', '2149'), error instanceof DatabaseError)
        ) {
          if (stryMutAct_9fa48('2150')) {
            {
            }
          } else {
            stryCov_9fa48('2150')
            throw error
          }
        }
        throw new DatabaseError(
          stryMutAct_9fa48('2151') ? '' : (stryCov_9fa48('2151'), 'MIGRATION'),
          stryMutAct_9fa48('2152') ? '' : (stryCov_9fa48('2152'), 'settings'),
          error
        )
      }
    }
  }
}
