/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Supabase Client Configuration
 * Single source of truth for database connection
 * Only import this in services/* files
 *
 * Uses centralized configLoader for all configuration
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
import { createClient } from '@supabase/supabase-js'
import config from '../config/configLoader.js'
import { ConfigurationError } from '../errors/AppError.js'
import { createMonitoredSupabaseClient } from '../monitoring/databaseMonitor.js'

// Import mock for testing
let createSupabaseClientMock = null
if (
  stryMutAct_9fa48('6202')
    ? process.env.NODE_ENV !== 'test'
    : stryMutAct_9fa48('6201')
      ? false
      : stryMutAct_9fa48('6200')
        ? true
        : (stryCov_9fa48('6200', '6201', '6202'),
          process.env.NODE_ENV ===
            (stryMutAct_9fa48('6203') ? '' : (stryCov_9fa48('6203'), 'test')))
) {
  if (stryMutAct_9fa48('6204')) {
    {
    }
  } else {
    stryCov_9fa48('6204')
    try {
      if (stryMutAct_9fa48('6205')) {
        {
        }
      } else {
        stryCov_9fa48('6205')
        const { createSupabaseClientMock: mockFn } = await import(
          stryMutAct_9fa48('6206')
            ? ''
            : (stryCov_9fa48('6206'), '../../refinery/test/supabase-client/mocks/mocks.js')
        )
        createSupabaseClientMock = mockFn
      }
    } catch (error) {
      if (stryMutAct_9fa48('6207')) {
        {
        }
      } else {
        stryCov_9fa48('6207')
        console.warn(
          stryMutAct_9fa48('6208')
            ? ''
            : (stryCov_9fa48('6208'), 'Mock not available, using real client for tests'),
          error.message
        )
      }
    }
  }
}
const supabaseUrl = config.database.url
const supabaseKey = config.database.key
if (
  stryMutAct_9fa48('6211')
    ? !supabaseUrl && !supabaseKey
    : stryMutAct_9fa48('6210')
      ? false
      : stryMutAct_9fa48('6209')
        ? true
        : (stryCov_9fa48('6209', '6210', '6211'),
          (stryMutAct_9fa48('6212') ? supabaseUrl : (stryCov_9fa48('6212'), !supabaseUrl)) ||
            (stryMutAct_9fa48('6213') ? supabaseKey : (stryCov_9fa48('6213'), !supabaseKey)))
) {
  if (stryMutAct_9fa48('6214')) {
    {
    }
  } else {
    stryCov_9fa48('6214')
    console.error(
      stryMutAct_9fa48('6215') ? '' : (stryCov_9fa48('6215'), 'Configuration error:'),
      stryMutAct_9fa48('6216')
        ? {}
        : (stryCov_9fa48('6216'),
          {
            hasUrl: stryMutAct_9fa48('6217')
              ? !supabaseUrl
              : (stryCov_9fa48('6217'),
                !(stryMutAct_9fa48('6218') ? supabaseUrl : (stryCov_9fa48('6218'), !supabaseUrl))),
            hasKey: stryMutAct_9fa48('6219')
              ? !supabaseKey
              : (stryCov_9fa48('6219'),
                !(stryMutAct_9fa48('6220') ? supabaseKey : (stryCov_9fa48('6220'), !supabaseKey))),
            isVercel: config.VERCEL,
            nodeEnv: config.NODE_ENV
          })
    )
    throw new ConfigurationError(
      stryMutAct_9fa48('6221')
        ? ''
        : (stryCov_9fa48('6221'),
          'Missing database configuration: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY'),
      stryMutAct_9fa48('6222')
        ? {}
        : (stryCov_9fa48('6222'),
          {
            hasUrl: stryMutAct_9fa48('6223')
              ? !supabaseUrl
              : (stryCov_9fa48('6223'),
                !(stryMutAct_9fa48('6224') ? supabaseUrl : (stryCov_9fa48('6224'), !supabaseUrl))),
            hasKey: stryMutAct_9fa48('6225')
              ? !supabaseKey
              : (stryCov_9fa48('6225'),
                !(stryMutAct_9fa48('6226') ? supabaseKey : (stryCov_9fa48('6226'), !supabaseKey))),
            nodeEnv: config.NODE_ENV
          })
    )
  }
}

/**
 * Supabase client instance
 * Uses SERVICE_ROLE_KEY to bypass RLS for API endpoints
 * Configuration from centralized configLoader
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
const rawSupabaseClient = (
  stryMutAct_9fa48('6229')
    ? process.env.NODE_ENV === 'test' || createSupabaseClientMock
    : stryMutAct_9fa48('6228')
      ? false
      : stryMutAct_9fa48('6227')
        ? true
        : (stryCov_9fa48('6227', '6228', '6229'),
          (stryMutAct_9fa48('6231')
            ? process.env.NODE_ENV !== 'test'
            : stryMutAct_9fa48('6230')
              ? true
              : (stryCov_9fa48('6230', '6231'),
                process.env.NODE_ENV ===
                  (stryMutAct_9fa48('6232') ? '' : (stryCov_9fa48('6232'), 'test')))) &&
            createSupabaseClientMock)
)
  ? createSupabaseClientMock(
      stryMutAct_9fa48('6233')
        ? {}
        : (stryCov_9fa48('6233'),
          {
            url: supabaseUrl,
            anonKey: supabaseKey
          })
    )
  : createClient(supabaseUrl, supabaseKey, config.database.options)

/**
 * Monitored Supabase client with performance tracking
 * All database operations are automatically monitored for slow queries and performance
 */
export const supabase = (
  stryMutAct_9fa48('6236')
    ? process.env.NODE_ENV !== 'test'
    : stryMutAct_9fa48('6235')
      ? false
      : stryMutAct_9fa48('6234')
        ? true
        : (stryCov_9fa48('6234', '6235', '6236'),
          process.env.NODE_ENV ===
            (stryMutAct_9fa48('6237') ? '' : (stryCov_9fa48('6237'), 'test')))
)
  ? rawSupabaseClient
  : createMonitoredSupabaseClient(rawSupabaseClient)

/**
 * Database schema metadata for query optimization
 * Maps table names to indexed columns for efficient filtering
 */
export const DB_SCHEMA = stryMutAct_9fa48('6238')
  ? {}
  : (stryCov_9fa48('6238'),
    {
      users: stryMutAct_9fa48('6239')
        ? {}
        : (stryCov_9fa48('6239'),
          {
            table: stryMutAct_9fa48('6240') ? '' : (stryCov_9fa48('6240'), 'users'),
            pk: stryMutAct_9fa48('6241') ? '' : (stryCov_9fa48('6241'), 'id'),
            indexes: stryMutAct_9fa48('6242')
              ? []
              : (stryCov_9fa48('6242'),
                [
                  stryMutAct_9fa48('6243') ? '' : (stryCov_9fa48('6243'), 'email'),
                  stryMutAct_9fa48('6244') ? '' : (stryCov_9fa48('6244'), 'full_name_normalized'),
                  stryMutAct_9fa48('6245') ? '' : (stryCov_9fa48('6245'), 'email_normalized')
                ]),
            search: stryMutAct_9fa48('6246')
              ? []
              : (stryCov_9fa48('6246'),
                [
                  stryMutAct_9fa48('6247') ? '' : (stryCov_9fa48('6247'), 'full_name_normalized'),
                  stryMutAct_9fa48('6248') ? '' : (stryCov_9fa48('6248'), 'email_normalized')
                ]),
            enums: stryMutAct_9fa48('6249')
              ? {}
              : (stryCov_9fa48('6249'),
                {
                  role: stryMutAct_9fa48('6250')
                    ? []
                    : (stryCov_9fa48('6250'),
                      [
                        stryMutAct_9fa48('6251') ? '' : (stryCov_9fa48('6251'), 'user'),
                        stryMutAct_9fa48('6252') ? '' : (stryCov_9fa48('6252'), 'admin')
                      ])
                }),
            columns: stryMutAct_9fa48('6253')
              ? []
              : (stryCov_9fa48('6253'),
                [
                  stryMutAct_9fa48('6254') ? '' : (stryCov_9fa48('6254'), 'id'),
                  stryMutAct_9fa48('6255') ? '' : (stryCov_9fa48('6255'), 'email'),
                  stryMutAct_9fa48('6256') ? '' : (stryCov_9fa48('6256'), 'password_hash'),
                  stryMutAct_9fa48('6257') ? '' : (stryCov_9fa48('6257'), 'full_name'),
                  stryMutAct_9fa48('6258') ? '' : (stryCov_9fa48('6258'), 'phone'),
                  stryMutAct_9fa48('6259') ? '' : (stryCov_9fa48('6259'), 'role'),
                  stryMutAct_9fa48('6260') ? '' : (stryCov_9fa48('6260'), 'active'),
                  stryMutAct_9fa48('6261') ? '' : (stryCov_9fa48('6261'), 'email_verified'),
                  stryMutAct_9fa48('6262') ? '' : (stryCov_9fa48('6262'), 'created_at'),
                  stryMutAct_9fa48('6263') ? '' : (stryCov_9fa48('6263'), 'updated_at'),
                  stryMutAct_9fa48('6264') ? '' : (stryCov_9fa48('6264'), 'full_name_normalized'),
                  stryMutAct_9fa48('6265') ? '' : (stryCov_9fa48('6265'), 'email_normalized')
                ])
          }),
      occasions: stryMutAct_9fa48('6266')
        ? {}
        : (stryCov_9fa48('6266'),
          {
            table: stryMutAct_9fa48('6267') ? '' : (stryCov_9fa48('6267'), 'occasions'),
            pk: stryMutAct_9fa48('6268') ? '' : (stryCov_9fa48('6268'), 'id'),
            indexes: stryMutAct_9fa48('6269')
              ? []
              : (stryCov_9fa48('6269'),
                [stryMutAct_9fa48('6270') ? '' : (stryCov_9fa48('6270'), 'slug')]),
            filters: stryMutAct_9fa48('6271')
              ? []
              : (stryCov_9fa48('6271'),
                [
                  stryMutAct_9fa48('6272') ? '' : (stryCov_9fa48('6272'), 'active'),
                  stryMutAct_9fa48('6273') ? '' : (stryCov_9fa48('6273'), 'display_order')
                ]),
            columns: stryMutAct_9fa48('6274')
              ? []
              : (stryCov_9fa48('6274'),
                [
                  stryMutAct_9fa48('6275') ? '' : (stryCov_9fa48('6275'), 'id'),
                  stryMutAct_9fa48('6276') ? '' : (stryCov_9fa48('6276'), 'name'),
                  stryMutAct_9fa48('6277') ? '' : (stryCov_9fa48('6277'), 'description'),
                  stryMutAct_9fa48('6278') ? '' : (stryCov_9fa48('6278'), 'active'),
                  stryMutAct_9fa48('6279') ? '' : (stryCov_9fa48('6279'), 'display_order'),
                  stryMutAct_9fa48('6280') ? '' : (stryCov_9fa48('6280'), 'created_at'),
                  stryMutAct_9fa48('6281') ? '' : (stryCov_9fa48('6281'), 'updated_at'),
                  stryMutAct_9fa48('6282') ? '' : (stryCov_9fa48('6282'), 'slug')
                ])
          }),
      products: stryMutAct_9fa48('6283')
        ? {}
        : (stryCov_9fa48('6283'),
          {
            table: stryMutAct_9fa48('6284') ? '' : (stryCov_9fa48('6284'), 'products'),
            pk: stryMutAct_9fa48('6285') ? '' : (stryCov_9fa48('6285'), 'id'),
            indexes: stryMutAct_9fa48('6286')
              ? []
              : (stryCov_9fa48('6286'),
                [
                  stryMutAct_9fa48('6287') ? '' : (stryCov_9fa48('6287'), 'sku'),
                  stryMutAct_9fa48('6288') ? '' : (stryCov_9fa48('6288'), 'active'),
                  stryMutAct_9fa48('6289') ? '' : (stryCov_9fa48('6289'), 'featured'),
                  stryMutAct_9fa48('6290') ? '' : (stryCov_9fa48('6290'), 'carousel_order'),
                  stryMutAct_9fa48('6291') ? '' : (stryCov_9fa48('6291'), 'name_normalized'),
                  stryMutAct_9fa48('6292') ? '' : (stryCov_9fa48('6292'), 'description_normalized')
                ]),
            filters: stryMutAct_9fa48('6293')
              ? []
              : (stryCov_9fa48('6293'),
                [
                  stryMutAct_9fa48('6294') ? '' : (stryCov_9fa48('6294'), 'active'),
                  stryMutAct_9fa48('6295') ? '' : (stryCov_9fa48('6295'), 'featured')
                ]),
            sorts: stryMutAct_9fa48('6296')
              ? []
              : (stryCov_9fa48('6296'),
                [
                  stryMutAct_9fa48('6297') ? '' : (stryCov_9fa48('6297'), 'created_at'),
                  stryMutAct_9fa48('6298') ? '' : (stryCov_9fa48('6298'), 'carousel_order')
                ]),
            search: stryMutAct_9fa48('6299')
              ? []
              : (stryCov_9fa48('6299'),
                [
                  stryMutAct_9fa48('6300') ? '' : (stryCov_9fa48('6300'), 'name_normalized'),
                  stryMutAct_9fa48('6301') ? '' : (stryCov_9fa48('6301'), 'description_normalized')
                ]),
            columns: stryMutAct_9fa48('6302')
              ? []
              : (stryCov_9fa48('6302'),
                [
                  stryMutAct_9fa48('6303') ? '' : (stryCov_9fa48('6303'), 'id'),
                  stryMutAct_9fa48('6304') ? '' : (stryCov_9fa48('6304'), 'name'),
                  stryMutAct_9fa48('6305') ? '' : (stryCov_9fa48('6305'), 'summary'),
                  stryMutAct_9fa48('6306') ? '' : (stryCov_9fa48('6306'), 'description'),
                  stryMutAct_9fa48('6307') ? '' : (stryCov_9fa48('6307'), 'price_usd'),
                  stryMutAct_9fa48('6308') ? '' : (stryCov_9fa48('6308'), 'price_ves'),
                  stryMutAct_9fa48('6309') ? '' : (stryCov_9fa48('6309'), 'stock'),
                  stryMutAct_9fa48('6310') ? '' : (stryCov_9fa48('6310'), 'sku'),
                  stryMutAct_9fa48('6311') ? '' : (stryCov_9fa48('6311'), 'active'),
                  stryMutAct_9fa48('6312') ? '' : (stryCov_9fa48('6312'), 'featured'),
                  stryMutAct_9fa48('6313') ? '' : (stryCov_9fa48('6313'), 'carousel_order'),
                  stryMutAct_9fa48('6314') ? '' : (stryCov_9fa48('6314'), 'created_at'),
                  stryMutAct_9fa48('6315') ? '' : (stryCov_9fa48('6315'), 'updated_at'),
                  stryMutAct_9fa48('6316') ? '' : (stryCov_9fa48('6316'), 'name_normalized'),
                  stryMutAct_9fa48('6317') ? '' : (stryCov_9fa48('6317'), 'description_normalized')
                ])
          }),
      product_occasions: stryMutAct_9fa48('6318')
        ? {}
        : (stryCov_9fa48('6318'),
          {
            table: stryMutAct_9fa48('6319') ? '' : (stryCov_9fa48('6319'), 'product_occasions'),
            pk: stryMutAct_9fa48('6320') ? '' : (stryCov_9fa48('6320'), 'id'),
            indexes: stryMutAct_9fa48('6321')
              ? []
              : (stryCov_9fa48('6321'),
                [
                  stryMutAct_9fa48('6322') ? '' : (stryCov_9fa48('6322'), 'product_id'),
                  stryMutAct_9fa48('6323') ? '' : (stryCov_9fa48('6323'), 'occasion_id')
                ]),
            unique: stryMutAct_9fa48('6324')
              ? []
              : (stryCov_9fa48('6324'),
                [
                  stryMutAct_9fa48('6325') ? '' : (stryCov_9fa48('6325'), 'product_id'),
                  stryMutAct_9fa48('6326') ? '' : (stryCov_9fa48('6326'), 'occasion_id')
                ]),
            columns: stryMutAct_9fa48('6327')
              ? []
              : (stryCov_9fa48('6327'),
                [
                  stryMutAct_9fa48('6328') ? '' : (stryCov_9fa48('6328'), 'id'),
                  stryMutAct_9fa48('6329') ? '' : (stryCov_9fa48('6329'), 'product_id'),
                  stryMutAct_9fa48('6330') ? '' : (stryCov_9fa48('6330'), 'occasion_id'),
                  stryMutAct_9fa48('6331') ? '' : (stryCov_9fa48('6331'), 'created_at')
                ])
          }),
      product_images: stryMutAct_9fa48('6332')
        ? {}
        : (stryCov_9fa48('6332'),
          {
            table: stryMutAct_9fa48('6333') ? '' : (stryCov_9fa48('6333'), 'product_images'),
            pk: stryMutAct_9fa48('6334') ? '' : (stryCov_9fa48('6334'), 'id'),
            indexes: stryMutAct_9fa48('6335')
              ? []
              : (stryCov_9fa48('6335'),
                [
                  stryMutAct_9fa48('6336') ? '' : (stryCov_9fa48('6336'), 'product_id'),
                  stryMutAct_9fa48('6337') ? '' : (stryCov_9fa48('6337'), 'size'),
                  stryMutAct_9fa48('6338') ? '' : (stryCov_9fa48('6338'), 'is_primary')
                ]),
            unique: stryMutAct_9fa48('6339')
              ? []
              : (stryCov_9fa48('6339'),
                [
                  stryMutAct_9fa48('6340') ? '' : (stryCov_9fa48('6340'), 'product_id'),
                  stryMutAct_9fa48('6341') ? '' : (stryCov_9fa48('6341'), 'image_index'),
                  stryMutAct_9fa48('6342') ? '' : (stryCov_9fa48('6342'), 'size')
                ]),
            enums: stryMutAct_9fa48('6343')
              ? {}
              : (stryCov_9fa48('6343'),
                {
                  size: stryMutAct_9fa48('6344')
                    ? []
                    : (stryCov_9fa48('6344'),
                      [
                        stryMutAct_9fa48('6345') ? '' : (stryCov_9fa48('6345'), 'thumb'),
                        stryMutAct_9fa48('6346') ? '' : (stryCov_9fa48('6346'), 'small'),
                        stryMutAct_9fa48('6347') ? '' : (stryCov_9fa48('6347'), 'medium'),
                        stryMutAct_9fa48('6348') ? '' : (stryCov_9fa48('6348'), 'large')
                      ])
                }),
            columns: stryMutAct_9fa48('6349')
              ? []
              : (stryCov_9fa48('6349'),
                [
                  stryMutAct_9fa48('6350') ? '' : (stryCov_9fa48('6350'), 'id'),
                  stryMutAct_9fa48('6351') ? '' : (stryCov_9fa48('6351'), 'product_id'),
                  stryMutAct_9fa48('6352') ? '' : (stryCov_9fa48('6352'), 'url'),
                  stryMutAct_9fa48('6353') ? '' : (stryCov_9fa48('6353'), 'image_index'),
                  stryMutAct_9fa48('6354') ? '' : (stryCov_9fa48('6354'), 'size'),
                  stryMutAct_9fa48('6355') ? '' : (stryCov_9fa48('6355'), 'is_primary'),
                  stryMutAct_9fa48('6356') ? '' : (stryCov_9fa48('6356'), 'file_hash'),
                  stryMutAct_9fa48('6357') ? '' : (stryCov_9fa48('6357'), 'mime_type'),
                  stryMutAct_9fa48('6358') ? '' : (stryCov_9fa48('6358'), 'created_at'),
                  stryMutAct_9fa48('6359') ? '' : (stryCov_9fa48('6359'), 'updated_at')
                ])
          }),
      orders: stryMutAct_9fa48('6360')
        ? {}
        : (stryCov_9fa48('6360'),
          {
            table: stryMutAct_9fa48('6361') ? '' : (stryCov_9fa48('6361'), 'orders'),
            pk: stryMutAct_9fa48('6362') ? '' : (stryCov_9fa48('6362'), 'id'),
            indexes: stryMutAct_9fa48('6363')
              ? []
              : (stryCov_9fa48('6363'),
                [
                  stryMutAct_9fa48('6364') ? '' : (stryCov_9fa48('6364'), 'user_id'),
                  stryMutAct_9fa48('6365') ? '' : (stryCov_9fa48('6365'), 'status'),
                  stryMutAct_9fa48('6366') ? '' : (stryCov_9fa48('6366'), 'created_at'),
                  stryMutAct_9fa48('6367') ? '' : (stryCov_9fa48('6367'), 'customer_email'),
                  stryMutAct_9fa48('6368')
                    ? ''
                    : (stryCov_9fa48('6368'), 'customer_name_normalized'),
                  stryMutAct_9fa48('6369')
                    ? ''
                    : (stryCov_9fa48('6369'), 'customer_email_normalized')
                ]),
            filters: stryMutAct_9fa48('6370')
              ? []
              : (stryCov_9fa48('6370'),
                [
                  stryMutAct_9fa48('6371') ? '' : (stryCov_9fa48('6371'), 'status'),
                  stryMutAct_9fa48('6372') ? '' : (stryCov_9fa48('6372'), 'user_id'),
                  stryMutAct_9fa48('6373') ? '' : (stryCov_9fa48('6373'), 'customer_email')
                ]),
            sorts: stryMutAct_9fa48('6374')
              ? []
              : (stryCov_9fa48('6374'),
                [stryMutAct_9fa48('6375') ? '' : (stryCov_9fa48('6375'), 'created_at')]),
            search: stryMutAct_9fa48('6376')
              ? []
              : (stryCov_9fa48('6376'),
                [
                  stryMutAct_9fa48('6377')
                    ? ''
                    : (stryCov_9fa48('6377'), 'customer_name_normalized'),
                  stryMutAct_9fa48('6378')
                    ? ''
                    : (stryCov_9fa48('6378'), 'customer_email_normalized')
                ]),
            enums: stryMutAct_9fa48('6379')
              ? {}
              : (stryCov_9fa48('6379'),
                {
                  status: stryMutAct_9fa48('6380')
                    ? []
                    : (stryCov_9fa48('6380'),
                      [
                        stryMutAct_9fa48('6381') ? '' : (stryCov_9fa48('6381'), 'pending'),
                        stryMutAct_9fa48('6382') ? '' : (stryCov_9fa48('6382'), 'verified'),
                        stryMutAct_9fa48('6383') ? '' : (stryCov_9fa48('6383'), 'preparing'),
                        stryMutAct_9fa48('6384') ? '' : (stryCov_9fa48('6384'), 'shipped'),
                        stryMutAct_9fa48('6385') ? '' : (stryCov_9fa48('6385'), 'delivered'),
                        stryMutAct_9fa48('6386') ? '' : (stryCov_9fa48('6386'), 'cancelled')
                      ])
                }),
            columns: stryMutAct_9fa48('6387')
              ? []
              : (stryCov_9fa48('6387'),
                [
                  stryMutAct_9fa48('6388') ? '' : (stryCov_9fa48('6388'), 'id'),
                  stryMutAct_9fa48('6389') ? '' : (stryCov_9fa48('6389'), 'user_id'),
                  stryMutAct_9fa48('6390') ? '' : (stryCov_9fa48('6390'), 'customer_email'),
                  stryMutAct_9fa48('6391') ? '' : (stryCov_9fa48('6391'), 'customer_name'),
                  stryMutAct_9fa48('6392') ? '' : (stryCov_9fa48('6392'), 'customer_phone'),
                  stryMutAct_9fa48('6393') ? '' : (stryCov_9fa48('6393'), 'delivery_address'),
                  stryMutAct_9fa48('6394') ? '' : (stryCov_9fa48('6394'), 'delivery_date'),
                  stryMutAct_9fa48('6395') ? '' : (stryCov_9fa48('6395'), 'delivery_time_slot'),
                  stryMutAct_9fa48('6396') ? '' : (stryCov_9fa48('6396'), 'delivery_notes'),
                  stryMutAct_9fa48('6397') ? '' : (stryCov_9fa48('6397'), 'status'),
                  stryMutAct_9fa48('6398') ? '' : (stryCov_9fa48('6398'), 'total_amount_usd'),
                  stryMutAct_9fa48('6399') ? '' : (stryCov_9fa48('6399'), 'total_amount_ves'),
                  stryMutAct_9fa48('6400') ? '' : (stryCov_9fa48('6400'), 'currency_rate'),
                  stryMutAct_9fa48('6401') ? '' : (stryCov_9fa48('6401'), 'notes'),
                  stryMutAct_9fa48('6402') ? '' : (stryCov_9fa48('6402'), 'admin_notes'),
                  stryMutAct_9fa48('6403') ? '' : (stryCov_9fa48('6403'), 'created_at'),
                  stryMutAct_9fa48('6404') ? '' : (stryCov_9fa48('6404'), 'updated_at'),
                  stryMutAct_9fa48('6405')
                    ? ''
                    : (stryCov_9fa48('6405'), 'customer_name_normalized'),
                  stryMutAct_9fa48('6406')
                    ? ''
                    : (stryCov_9fa48('6406'), 'customer_email_normalized')
                ])
          }),
      order_items: stryMutAct_9fa48('6407')
        ? {}
        : (stryCov_9fa48('6407'),
          {
            table: stryMutAct_9fa48('6408') ? '' : (stryCov_9fa48('6408'), 'order_items'),
            pk: stryMutAct_9fa48('6409') ? '' : (stryCov_9fa48('6409'), 'id'),
            indexes: stryMutAct_9fa48('6410')
              ? []
              : (stryCov_9fa48('6410'),
                [
                  stryMutAct_9fa48('6411') ? '' : (stryCov_9fa48('6411'), 'order_id'),
                  stryMutAct_9fa48('6412') ? '' : (stryCov_9fa48('6412'), 'product_id')
                ]),
            filters: stryMutAct_9fa48('6413')
              ? []
              : (stryCov_9fa48('6413'),
                [
                  stryMutAct_9fa48('6414') ? '' : (stryCov_9fa48('6414'), 'order_id'),
                  stryMutAct_9fa48('6415') ? '' : (stryCov_9fa48('6415'), 'product_id')
                ]),
            columns: stryMutAct_9fa48('6416')
              ? []
              : (stryCov_9fa48('6416'),
                [
                  stryMutAct_9fa48('6417') ? '' : (stryCov_9fa48('6417'), 'id'),
                  stryMutAct_9fa48('6418') ? '' : (stryCov_9fa48('6418'), 'order_id'),
                  stryMutAct_9fa48('6419') ? '' : (stryCov_9fa48('6419'), 'product_id'),
                  stryMutAct_9fa48('6420') ? '' : (stryCov_9fa48('6420'), 'product_name'),
                  stryMutAct_9fa48('6421') ? '' : (stryCov_9fa48('6421'), 'product_summary'),
                  stryMutAct_9fa48('6422') ? '' : (stryCov_9fa48('6422'), 'unit_price_usd'),
                  stryMutAct_9fa48('6423') ? '' : (stryCov_9fa48('6423'), 'unit_price_ves'),
                  stryMutAct_9fa48('6424') ? '' : (stryCov_9fa48('6424'), 'quantity'),
                  stryMutAct_9fa48('6425') ? '' : (stryCov_9fa48('6425'), 'subtotal_usd'),
                  stryMutAct_9fa48('6426') ? '' : (stryCov_9fa48('6426'), 'subtotal_ves'),
                  stryMutAct_9fa48('6427') ? '' : (stryCov_9fa48('6427'), 'created_at'),
                  stryMutAct_9fa48('6428') ? '' : (stryCov_9fa48('6428'), 'updated_at')
                ])
          }),
      order_status_history: stryMutAct_9fa48('6429')
        ? {}
        : (stryCov_9fa48('6429'),
          {
            table: stryMutAct_9fa48('6430') ? '' : (stryCov_9fa48('6430'), 'order_status_history'),
            pk: stryMutAct_9fa48('6431') ? '' : (stryCov_9fa48('6431'), 'id'),
            indexes: stryMutAct_9fa48('6432')
              ? []
              : (stryCov_9fa48('6432'),
                [
                  stryMutAct_9fa48('6433') ? '' : (stryCov_9fa48('6433'), 'order_id'),
                  stryMutAct_9fa48('6434') ? '' : (stryCov_9fa48('6434'), 'created_at')
                ]),
            filters: stryMutAct_9fa48('6435')
              ? []
              : (stryCov_9fa48('6435'),
                [stryMutAct_9fa48('6436') ? '' : (stryCov_9fa48('6436'), 'order_id')]),
            sorts: stryMutAct_9fa48('6437')
              ? []
              : (stryCov_9fa48('6437'),
                [stryMutAct_9fa48('6438') ? '' : (stryCov_9fa48('6438'), 'created_at')]),
            columns: stryMutAct_9fa48('6439')
              ? []
              : (stryCov_9fa48('6439'),
                [
                  stryMutAct_9fa48('6440') ? '' : (stryCov_9fa48('6440'), 'id'),
                  stryMutAct_9fa48('6441') ? '' : (stryCov_9fa48('6441'), 'order_id'),
                  stryMutAct_9fa48('6442') ? '' : (stryCov_9fa48('6442'), 'old_status'),
                  stryMutAct_9fa48('6443') ? '' : (stryCov_9fa48('6443'), 'new_status'),
                  stryMutAct_9fa48('6444') ? '' : (stryCov_9fa48('6444'), 'notes'),
                  stryMutAct_9fa48('6445') ? '' : (stryCov_9fa48('6445'), 'changed_by'),
                  stryMutAct_9fa48('6446') ? '' : (stryCov_9fa48('6446'), 'created_at')
                ])
          }),
      payment_methods: stryMutAct_9fa48('6447')
        ? {}
        : (stryCov_9fa48('6447'),
          {
            table: stryMutAct_9fa48('6448') ? '' : (stryCov_9fa48('6448'), 'payment_methods'),
            pk: stryMutAct_9fa48('6449') ? '' : (stryCov_9fa48('6449'), 'id'),
            filters: stryMutAct_9fa48('6450')
              ? []
              : (stryCov_9fa48('6450'),
                [
                  stryMutAct_9fa48('6451') ? '' : (stryCov_9fa48('6451'), 'active'),
                  stryMutAct_9fa48('6452') ? '' : (stryCov_9fa48('6452'), 'type')
                ]),
            sorts: stryMutAct_9fa48('6453')
              ? []
              : (stryCov_9fa48('6453'),
                [stryMutAct_9fa48('6454') ? '' : (stryCov_9fa48('6454'), 'display_order')]),
            enums: stryMutAct_9fa48('6455')
              ? {}
              : (stryCov_9fa48('6455'),
                {
                  type: stryMutAct_9fa48('6456')
                    ? []
                    : (stryCov_9fa48('6456'),
                      [
                        stryMutAct_9fa48('6457') ? '' : (stryCov_9fa48('6457'), 'bank_transfer'),
                        stryMutAct_9fa48('6458') ? '' : (stryCov_9fa48('6458'), 'mobile_payment'),
                        stryMutAct_9fa48('6459') ? '' : (stryCov_9fa48('6459'), 'cash'),
                        stryMutAct_9fa48('6460') ? '' : (stryCov_9fa48('6460'), 'crypto'),
                        stryMutAct_9fa48('6461') ? '' : (stryCov_9fa48('6461'), 'international')
                      ])
                }),
            columns: stryMutAct_9fa48('6462')
              ? []
              : (stryCov_9fa48('6462'),
                [
                  stryMutAct_9fa48('6463') ? '' : (stryCov_9fa48('6463'), 'id'),
                  stryMutAct_9fa48('6464') ? '' : (stryCov_9fa48('6464'), 'name'),
                  stryMutAct_9fa48('6465') ? '' : (stryCov_9fa48('6465'), 'type'),
                  stryMutAct_9fa48('6466') ? '' : (stryCov_9fa48('6466'), 'description'),
                  stryMutAct_9fa48('6467') ? '' : (stryCov_9fa48('6467'), 'account_info'),
                  stryMutAct_9fa48('6468') ? '' : (stryCov_9fa48('6468'), 'active'),
                  stryMutAct_9fa48('6469') ? '' : (stryCov_9fa48('6469'), 'display_order'),
                  stryMutAct_9fa48('6470') ? '' : (stryCov_9fa48('6470'), 'created_at'),
                  stryMutAct_9fa48('6471') ? '' : (stryCov_9fa48('6471'), 'updated_at')
                ])
          }),
      payments: stryMutAct_9fa48('6472')
        ? {}
        : (stryCov_9fa48('6472'),
          {
            table: stryMutAct_9fa48('6473') ? '' : (stryCov_9fa48('6473'), 'payments'),
            pk: stryMutAct_9fa48('6474') ? '' : (stryCov_9fa48('6474'), 'id'),
            indexes: stryMutAct_9fa48('6475')
              ? []
              : (stryCov_9fa48('6475'),
                [
                  stryMutAct_9fa48('6476') ? '' : (stryCov_9fa48('6476'), 'order_id'),
                  stryMutAct_9fa48('6477') ? '' : (stryCov_9fa48('6477'), 'status'),
                  stryMutAct_9fa48('6478') ? '' : (stryCov_9fa48('6478'), 'payment_method_id'),
                  stryMutAct_9fa48('6479') ? '' : (stryCov_9fa48('6479'), 'user_id')
                ]),
            filters: stryMutAct_9fa48('6480')
              ? []
              : (stryCov_9fa48('6480'),
                [
                  stryMutAct_9fa48('6481') ? '' : (stryCov_9fa48('6481'), 'status'),
                  stryMutAct_9fa48('6482') ? '' : (stryCov_9fa48('6482'), 'order_id'),
                  stryMutAct_9fa48('6483') ? '' : (stryCov_9fa48('6483'), 'payment_method_id'),
                  stryMutAct_9fa48('6484') ? '' : (stryCov_9fa48('6484'), 'user_id')
                ]),
            sorts: stryMutAct_9fa48('6485')
              ? []
              : (stryCov_9fa48('6485'),
                [
                  stryMutAct_9fa48('6486') ? '' : (stryCov_9fa48('6486'), 'created_at'),
                  stryMutAct_9fa48('6487') ? '' : (stryCov_9fa48('6487'), 'payment_date')
                ]),
            enums: stryMutAct_9fa48('6488')
              ? {}
              : (stryCov_9fa48('6488'),
                {
                  status: stryMutAct_9fa48('6489')
                    ? []
                    : (stryCov_9fa48('6489'),
                      [
                        stryMutAct_9fa48('6490') ? '' : (stryCov_9fa48('6490'), 'pending'),
                        stryMutAct_9fa48('6491') ? '' : (stryCov_9fa48('6491'), 'completed'),
                        stryMutAct_9fa48('6492') ? '' : (stryCov_9fa48('6492'), 'failed'),
                        stryMutAct_9fa48('6493') ? '' : (stryCov_9fa48('6493'), 'refunded'),
                        stryMutAct_9fa48('6494')
                          ? ''
                          : (stryCov_9fa48('6494'), 'partially_refunded')
                      ])
                }),
            columns: stryMutAct_9fa48('6495')
              ? []
              : (stryCov_9fa48('6495'),
                [
                  stryMutAct_9fa48('6496') ? '' : (stryCov_9fa48('6496'), 'id'),
                  stryMutAct_9fa48('6497') ? '' : (stryCov_9fa48('6497'), 'order_id'),
                  stryMutAct_9fa48('6498') ? '' : (stryCov_9fa48('6498'), 'payment_method_id'),
                  stryMutAct_9fa48('6499') ? '' : (stryCov_9fa48('6499'), 'user_id'),
                  stryMutAct_9fa48('6500') ? '' : (stryCov_9fa48('6500'), 'amount_usd'),
                  stryMutAct_9fa48('6501') ? '' : (stryCov_9fa48('6501'), 'amount_ves'),
                  stryMutAct_9fa48('6502') ? '' : (stryCov_9fa48('6502'), 'currency_rate'),
                  stryMutAct_9fa48('6503') ? '' : (stryCov_9fa48('6503'), 'status'),
                  stryMutAct_9fa48('6504') ? '' : (stryCov_9fa48('6504'), 'payment_method_name'),
                  stryMutAct_9fa48('6505') ? '' : (stryCov_9fa48('6505'), 'transaction_id'),
                  stryMutAct_9fa48('6506') ? '' : (stryCov_9fa48('6506'), 'reference_number'),
                  stryMutAct_9fa48('6507') ? '' : (stryCov_9fa48('6507'), 'payment_details'),
                  stryMutAct_9fa48('6508') ? '' : (stryCov_9fa48('6508'), 'receipt_image_url'),
                  stryMutAct_9fa48('6509') ? '' : (stryCov_9fa48('6509'), 'admin_notes'),
                  stryMutAct_9fa48('6510') ? '' : (stryCov_9fa48('6510'), 'payment_date'),
                  stryMutAct_9fa48('6511') ? '' : (stryCov_9fa48('6511'), 'confirmed_date'),
                  stryMutAct_9fa48('6512') ? '' : (stryCov_9fa48('6512'), 'created_at'),
                  stryMutAct_9fa48('6513') ? '' : (stryCov_9fa48('6513'), 'updated_at')
                ])
          }),
      settings: stryMutAct_9fa48('6514')
        ? {}
        : (stryCov_9fa48('6514'),
          {
            table: stryMutAct_9fa48('6515') ? '' : (stryCov_9fa48('6515'), 'settings'),
            pk: stryMutAct_9fa48('6516') ? '' : (stryCov_9fa48('6516'), 'id'),
            indexes: stryMutAct_9fa48('6517')
              ? []
              : (stryCov_9fa48('6517'),
                [stryMutAct_9fa48('6518') ? '' : (stryCov_9fa48('6518'), 'key')]),
            filters: stryMutAct_9fa48('6519')
              ? []
              : (stryCov_9fa48('6519'),
                [stryMutAct_9fa48('6520') ? '' : (stryCov_9fa48('6520'), 'is_public')]),
            columns: stryMutAct_9fa48('6521')
              ? []
              : (stryCov_9fa48('6521'),
                [
                  stryMutAct_9fa48('6522') ? '' : (stryCov_9fa48('6522'), 'id'),
                  stryMutAct_9fa48('6523') ? '' : (stryCov_9fa48('6523'), 'key'),
                  stryMutAct_9fa48('6524') ? '' : (stryCov_9fa48('6524'), 'value'),
                  stryMutAct_9fa48('6525') ? '' : (stryCov_9fa48('6525'), 'description'),
                  stryMutAct_9fa48('6526') ? '' : (stryCov_9fa48('6526'), 'type'),
                  stryMutAct_9fa48('6527') ? '' : (stryCov_9fa48('6527'), 'is_public'),
                  stryMutAct_9fa48('6528') ? '' : (stryCov_9fa48('6528'), 'created_at'),
                  stryMutAct_9fa48('6529') ? '' : (stryCov_9fa48('6529'), 'updated_at')
                ])
          })
    })

/**
 * Database stored functions (SSOT)
 * All functions verified to exist in floresya.sql
 * Services SHOULD use these via supabase.rpc() for atomic operations
 */
export const DB_FUNCTIONS = stryMutAct_9fa48('6530')
  ? {}
  : (stryCov_9fa48('6530'),
    {
      // Order operations (lines 122-268 in floresya.sql)
      createOrderWithItems: stryMutAct_9fa48('6531')
        ? ''
        : (stryCov_9fa48('6531'), 'create_order_with_items'),
      updateOrderStatusWithHistory: stryMutAct_9fa48('6532')
        ? ''
        : (stryCov_9fa48('6532'), 'update_order_status_with_history'),
      // Product operations (lines 352-677 in floresya.sql)
      createProductWithOccasions: stryMutAct_9fa48('6533')
        ? ''
        : (stryCov_9fa48('6533'), 'create_product_with_occasions'),
      createProductImagesAtomic: stryMutAct_9fa48('6534')
        ? ''
        : (stryCov_9fa48('6534'), 'create_product_images_atomic'),
      updateCarouselOrderAtomic: stryMutAct_9fa48('6535')
        ? ''
        : (stryCov_9fa48('6535'), 'update_carousel_order_atomic'),
      deleteProductImagesSafe: stryMutAct_9fa48('6536')
        ? ''
        : (stryCov_9fa48('6536'), 'delete_product_images_safe'),
      // Query functions (lines 468-568 in floresya.sql)
      getProductOccasions: stryMutAct_9fa48('6537')
        ? ''
        : (stryCov_9fa48('6537'), 'get_product_occasions'),
      getProductsByOccasion: stryMutAct_9fa48('6538')
        ? ''
        : (stryCov_9fa48('6538'), 'get_products_by_occasion'),
      getProductsWithOccasions: stryMutAct_9fa48('6539')
        ? ''
        : (stryCov_9fa48('6539'), 'get_products_with_occasions'),
      getExistingImageByHash: stryMutAct_9fa48('6540')
        ? ''
        : (stryCov_9fa48('6540'), 'get_existing_image_by_hash'),
      // Utility (lines 575-584 in floresya.sql)
      resetSequence: stryMutAct_9fa48('6541') ? '' : (stryCov_9fa48('6541'), 'reset_sequence')
    })
