/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Authentication Service - DUAL-MODE
 * - Development: Bypassed (auto-inject mock user in middleware)
 * - Production: Real Supabase Auth with JWT verification
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
import { supabase } from './supabaseClient.js'
import {
  UnauthorizedError,
  BadRequestError,
  ConflictError,
  DatabaseError,
  InternalServerError
} from '../errors/AppError.js'

/**
 * Sign up new user (PRODUCTION ONLY)
 * @param {string} email
 * @param {string} password
 * @param {Object} metadata - { full_name, phone }
 * @returns {Object} { user, session, message }
 * @throws {BadRequestError} If invalid input
 * @throws {ConflictError} If email already exists
 * @throws {DatabaseError} If signup fails
 */
export async function signUp(email, password, metadata = {}) {
  if (stryMutAct_9fa48('506')) {
    {
    }
  } else {
    stryCov_9fa48('506')
    try {
      if (stryMutAct_9fa48('507')) {
        {
        }
      } else {
        stryCov_9fa48('507')
        // Validation - FAIL FAST
        if (
          stryMutAct_9fa48('510')
            ? !email && typeof email !== 'string'
            : stryMutAct_9fa48('509')
              ? false
              : stryMutAct_9fa48('508')
                ? true
                : (stryCov_9fa48('508', '509', '510'),
                  (stryMutAct_9fa48('511') ? email : (stryCov_9fa48('511'), !email)) ||
                    (stryMutAct_9fa48('513')
                      ? typeof email === 'string'
                      : stryMutAct_9fa48('512')
                        ? false
                        : (stryCov_9fa48('512', '513'),
                          typeof email !==
                            (stryMutAct_9fa48('514') ? '' : (stryCov_9fa48('514'), 'string')))))
        ) {
          if (stryMutAct_9fa48('515')) {
            {
            }
          } else {
            stryCov_9fa48('515')
            throw new BadRequestError(
              stryMutAct_9fa48('516')
                ? ''
                : (stryCov_9fa48('516'), 'Email is required and must be a string'),
              stryMutAct_9fa48('517')
                ? {}
                : (stryCov_9fa48('517'),
                  {
                    email
                  })
            )
          }
        }

        // Email format validation
        const emailRegex = stryMutAct_9fa48('528')
          ? /^[^\s@]+@[^\s@]+\.[^\S@]+$/
          : stryMutAct_9fa48('527')
            ? /^[^\s@]+@[^\s@]+\.[\s@]+$/
            : stryMutAct_9fa48('526')
              ? /^[^\s@]+@[^\s@]+\.[^\s@]$/
              : stryMutAct_9fa48('525')
                ? /^[^\s@]+@[^\S@]+\.[^\s@]+$/
                : stryMutAct_9fa48('524')
                  ? /^[^\s@]+@[\s@]+\.[^\s@]+$/
                  : stryMutAct_9fa48('523')
                    ? /^[^\s@]+@[^\s@]\.[^\s@]+$/
                    : stryMutAct_9fa48('522')
                      ? /^[^\S@]+@[^\s@]+\.[^\s@]+$/
                      : stryMutAct_9fa48('521')
                        ? /^[\s@]+@[^\s@]+\.[^\s@]+$/
                        : stryMutAct_9fa48('520')
                          ? /^[^\s@]@[^\s@]+\.[^\s@]+$/
                          : stryMutAct_9fa48('519')
                            ? /^[^\s@]+@[^\s@]+\.[^\s@]+/
                            : stryMutAct_9fa48('518')
                              ? /[^\s@]+@[^\s@]+\.[^\s@]+$/
                              : (stryCov_9fa48(
                                  '518',
                                  '519',
                                  '520',
                                  '521',
                                  '522',
                                  '523',
                                  '524',
                                  '525',
                                  '526',
                                  '527',
                                  '528'
                                ),
                                /^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        if (
          stryMutAct_9fa48('531')
            ? false
            : stryMutAct_9fa48('530')
              ? true
              : stryMutAct_9fa48('529')
                ? emailRegex.test(email)
                : (stryCov_9fa48('529', '530', '531'), !emailRegex.test(email))
        ) {
          if (stryMutAct_9fa48('532')) {
            {
            }
          } else {
            stryCov_9fa48('532')
            throw new BadRequestError(
              stryMutAct_9fa48('533') ? '' : (stryCov_9fa48('533'), 'Invalid email format'),
              stryMutAct_9fa48('534')
                ? {}
                : (stryCov_9fa48('534'),
                  {
                    email
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('537')
            ? !password && typeof password !== 'string'
            : stryMutAct_9fa48('536')
              ? false
              : stryMutAct_9fa48('535')
                ? true
                : (stryCov_9fa48('535', '536', '537'),
                  (stryMutAct_9fa48('538') ? password : (stryCov_9fa48('538'), !password)) ||
                    (stryMutAct_9fa48('540')
                      ? typeof password === 'string'
                      : stryMutAct_9fa48('539')
                        ? false
                        : (stryCov_9fa48('539', '540'),
                          typeof password !==
                            (stryMutAct_9fa48('541') ? '' : (stryCov_9fa48('541'), 'string')))))
        ) {
          if (stryMutAct_9fa48('542')) {
            {
            }
          } else {
            stryCov_9fa48('542')
            throw new BadRequestError(
              stryMutAct_9fa48('543')
                ? ''
                : (stryCov_9fa48('543'), 'Password is required and must be a string'),
              {}
            )
          }
        }

        // STRONG PASSWORD POLICY
        if (
          stryMutAct_9fa48('547')
            ? password.length >= 8
            : stryMutAct_9fa48('546')
              ? password.length <= 8
              : stryMutAct_9fa48('545')
                ? false
                : stryMutAct_9fa48('544')
                  ? true
                  : (stryCov_9fa48('544', '545', '546', '547'), password.length < 8)
        ) {
          if (stryMutAct_9fa48('548')) {
            {
            }
          } else {
            stryCov_9fa48('548')
            throw new BadRequestError(
              stryMutAct_9fa48('549')
                ? ''
                : (stryCov_9fa48('549'), 'Password must be at least 8 characters'),
              stryMutAct_9fa48('550')
                ? {}
                : (stryCov_9fa48('550'),
                  {
                    passwordLength: password.length,
                    policy: stryMutAct_9fa48('551') ? '' : (stryCov_9fa48('551'), 'min_length_8')
                  })
            )
          }
        }

        // Check for at least one uppercase letter
        if (
          stryMutAct_9fa48('554')
            ? false
            : stryMutAct_9fa48('553')
              ? true
              : stryMutAct_9fa48('552')
                ? /[A-Z]/.test(password)
                : (stryCov_9fa48('552', '553', '554'),
                  !(stryMutAct_9fa48('555') ? /[^A-Z]/ : (stryCov_9fa48('555'), /[A-Z]/)).test(
                    password
                  ))
        ) {
          if (stryMutAct_9fa48('556')) {
            {
            }
          } else {
            stryCov_9fa48('556')
            throw new BadRequestError(
              stryMutAct_9fa48('557')
                ? ''
                : (stryCov_9fa48('557'), 'Password must contain at least one uppercase letter'),
              stryMutAct_9fa48('558')
                ? {}
                : (stryCov_9fa48('558'),
                  {
                    policy: stryMutAct_9fa48('559')
                      ? ''
                      : (stryCov_9fa48('559'), 'require_uppercase')
                  })
            )
          }
        }

        // Check for at least one lowercase letter
        if (
          stryMutAct_9fa48('562')
            ? false
            : stryMutAct_9fa48('561')
              ? true
              : stryMutAct_9fa48('560')
                ? /[a-z]/.test(password)
                : (stryCov_9fa48('560', '561', '562'),
                  !(stryMutAct_9fa48('563') ? /[^a-z]/ : (stryCov_9fa48('563'), /[a-z]/)).test(
                    password
                  ))
        ) {
          if (stryMutAct_9fa48('564')) {
            {
            }
          } else {
            stryCov_9fa48('564')
            throw new BadRequestError(
              stryMutAct_9fa48('565')
                ? ''
                : (stryCov_9fa48('565'), 'Password must contain at least one lowercase letter'),
              stryMutAct_9fa48('566')
                ? {}
                : (stryCov_9fa48('566'),
                  {
                    policy: stryMutAct_9fa48('567')
                      ? ''
                      : (stryCov_9fa48('567'), 'require_lowercase')
                  })
            )
          }
        }

        // Check for at least one number
        if (
          stryMutAct_9fa48('570')
            ? false
            : stryMutAct_9fa48('569')
              ? true
              : stryMutAct_9fa48('568')
                ? /[0-9]/.test(password)
                : (stryCov_9fa48('568', '569', '570'),
                  !(stryMutAct_9fa48('571') ? /[^0-9]/ : (stryCov_9fa48('571'), /[0-9]/)).test(
                    password
                  ))
        ) {
          if (stryMutAct_9fa48('572')) {
            {
            }
          } else {
            stryCov_9fa48('572')
            throw new BadRequestError(
              stryMutAct_9fa48('573')
                ? ''
                : (stryCov_9fa48('573'), 'Password must contain at least one number'),
              stryMutAct_9fa48('574')
                ? {}
                : (stryCov_9fa48('574'),
                  {
                    policy: stryMutAct_9fa48('575') ? '' : (stryCov_9fa48('575'), 'require_number')
                  })
            )
          }
        }

        // Check for at least one special character
        if (
          stryMutAct_9fa48('578')
            ? false
            : stryMutAct_9fa48('577')
              ? true
              : stryMutAct_9fa48('576')
                ? /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(password)
                : (stryCov_9fa48('576', '577', '578'),
                  !(
                    stryMutAct_9fa48('579')
                      ? /[^!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/
                      : (stryCov_9fa48('579'), /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/)
                  ).test(password))
        ) {
          if (stryMutAct_9fa48('580')) {
            {
            }
          } else {
            stryCov_9fa48('580')
            throw new BadRequestError(
              stryMutAct_9fa48('581')
                ? ''
                : (stryCov_9fa48('581'), 'Password must contain at least one special character'),
              stryMutAct_9fa48('582')
                ? {}
                : (stryCov_9fa48('582'),
                  {
                    policy: stryMutAct_9fa48('583')
                      ? ''
                      : (stryCov_9fa48('583'), 'require_special_char')
                  })
            )
          }
        }

        // Supabase Auth signup
        const { data, error } = await supabase.auth.signUp(
          stryMutAct_9fa48('584')
            ? {}
            : (stryCov_9fa48('584'),
              {
                email,
                password,
                options: stryMutAct_9fa48('585')
                  ? {}
                  : (stryCov_9fa48('585'),
                    {
                      data: stryMutAct_9fa48('586')
                        ? {}
                        : (stryCov_9fa48('586'),
                          {
                            full_name: stryMutAct_9fa48('589')
                              ? metadata.full_name && null
                              : stryMutAct_9fa48('588')
                                ? false
                                : stryMutAct_9fa48('587')
                                  ? true
                                  : (stryCov_9fa48('587', '588', '589'),
                                    metadata.full_name || null),
                            phone: stryMutAct_9fa48('592')
                              ? metadata.phone && null
                              : stryMutAct_9fa48('591')
                                ? false
                                : stryMutAct_9fa48('590')
                                  ? true
                                  : (stryCov_9fa48('590', '591', '592'), metadata.phone || null),
                            role: stryMutAct_9fa48('593') ? '' : (stryCov_9fa48('593'), 'user') // Default role
                          })
                    })
              })
        )
        if (
          stryMutAct_9fa48('595')
            ? false
            : stryMutAct_9fa48('594')
              ? true
              : (stryCov_9fa48('594', '595'), error)
        ) {
          if (stryMutAct_9fa48('596')) {
            {
            }
          } else {
            stryCov_9fa48('596')
            if (
              stryMutAct_9fa48('599')
                ? error.message.includes('already registered') &&
                  error.message.includes('already exists')
                : stryMutAct_9fa48('598')
                  ? false
                  : stryMutAct_9fa48('597')
                    ? true
                    : (stryCov_9fa48('597', '598', '599'),
                      error.message.includes(
                        stryMutAct_9fa48('600') ? '' : (stryCov_9fa48('600'), 'already registered')
                      ) ||
                        error.message.includes(
                          stryMutAct_9fa48('601') ? '' : (stryCov_9fa48('601'), 'already exists')
                        ))
            ) {
              if (stryMutAct_9fa48('602')) {
                {
                }
              } else {
                stryCov_9fa48('602')
                throw new ConflictError(
                  stryMutAct_9fa48('603') ? '' : (stryCov_9fa48('603'), 'Email already registered'),
                  stryMutAct_9fa48('604')
                    ? {}
                    : (stryCov_9fa48('604'),
                      {
                        email
                      })
                )
              }
            }
            throw new DatabaseError(
              stryMutAct_9fa48('605') ? '' : (stryCov_9fa48('605'), 'SIGNUP'),
              stryMutAct_9fa48('606') ? '' : (stryCov_9fa48('606'), 'auth.users'),
              error,
              stryMutAct_9fa48('607')
                ? {}
                : (stryCov_9fa48('607'),
                  {
                    email
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('610')
            ? false
            : stryMutAct_9fa48('609')
              ? true
              : stryMutAct_9fa48('608')
                ? data.user
                : (stryCov_9fa48('608', '609', '610'), !data.user)
        ) {
          if (stryMutAct_9fa48('611')) {
            {
            }
          } else {
            stryCov_9fa48('611')
            throw new DatabaseError(
              stryMutAct_9fa48('612') ? '' : (stryCov_9fa48('612'), 'SIGNUP'),
              stryMutAct_9fa48('613') ? '' : (stryCov_9fa48('613'), 'auth.users'),
              new InternalServerError(
                stryMutAct_9fa48('614') ? '' : (stryCov_9fa48('614'), 'No user returned')
              ),
              stryMutAct_9fa48('615')
                ? {}
                : (stryCov_9fa48('615'),
                  {
                    email
                  })
            )
          }
        }
        return stryMutAct_9fa48('616')
          ? {}
          : (stryCov_9fa48('616'),
            {
              user: data.user,
              session: data.session,
              message: stryMutAct_9fa48('617')
                ? ''
                : (stryCov_9fa48('617'), 'Check your email to verify your account')
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('618')) {
        {
        }
      } else {
        stryCov_9fa48('618')
        console.error(
          stryMutAct_9fa48('619') ? `` : (stryCov_9fa48('619'), `signUp(${email}) failed:`),
          error
        )
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('622')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('621')
              ? false
              : stryMutAct_9fa48('620')
                ? true
                : (stryCov_9fa48('620', '621', '622'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('623') ? '' : (stryCov_9fa48('623'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('624')) {
            {
            }
          } else {
            stryCov_9fa48('624')
            throw error
          }
        }
        throw new DatabaseError(
          stryMutAct_9fa48('625') ? '' : (stryCov_9fa48('625'), 'SIGNUP'),
          stryMutAct_9fa48('626') ? '' : (stryCov_9fa48('626'), 'auth.users'),
          error,
          stryMutAct_9fa48('627')
            ? {}
            : (stryCov_9fa48('627'),
              {
                email
              })
        )
      }
    }
  }
}

/**
 * Sign in user (PRODUCTION ONLY)
 * @param {string} email
 * @param {string} password
 * @returns {Object} { user, session, accessToken, refreshToken }
 * @throws {BadRequestError} If invalid input
 * @throws {UnauthorizedError} If credentials invalid
 */
export async function signIn(email, password) {
  if (stryMutAct_9fa48('628')) {
    {
    }
  } else {
    stryCov_9fa48('628')
    try {
      if (stryMutAct_9fa48('629')) {
        {
        }
      } else {
        stryCov_9fa48('629')
        // Validation
        if (
          stryMutAct_9fa48('632')
            ? !email && typeof email !== 'string'
            : stryMutAct_9fa48('631')
              ? false
              : stryMutAct_9fa48('630')
                ? true
                : (stryCov_9fa48('630', '631', '632'),
                  (stryMutAct_9fa48('633') ? email : (stryCov_9fa48('633'), !email)) ||
                    (stryMutAct_9fa48('635')
                      ? typeof email === 'string'
                      : stryMutAct_9fa48('634')
                        ? false
                        : (stryCov_9fa48('634', '635'),
                          typeof email !==
                            (stryMutAct_9fa48('636') ? '' : (stryCov_9fa48('636'), 'string')))))
        ) {
          if (stryMutAct_9fa48('637')) {
            {
            }
          } else {
            stryCov_9fa48('637')
            throw new BadRequestError(
              stryMutAct_9fa48('638') ? '' : (stryCov_9fa48('638'), 'Email is required'),
              stryMutAct_9fa48('639')
                ? {}
                : (stryCov_9fa48('639'),
                  {
                    email
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('642')
            ? !password && typeof password !== 'string'
            : stryMutAct_9fa48('641')
              ? false
              : stryMutAct_9fa48('640')
                ? true
                : (stryCov_9fa48('640', '641', '642'),
                  (stryMutAct_9fa48('643') ? password : (stryCov_9fa48('643'), !password)) ||
                    (stryMutAct_9fa48('645')
                      ? typeof password === 'string'
                      : stryMutAct_9fa48('644')
                        ? false
                        : (stryCov_9fa48('644', '645'),
                          typeof password !==
                            (stryMutAct_9fa48('646') ? '' : (stryCov_9fa48('646'), 'string')))))
        ) {
          if (stryMutAct_9fa48('647')) {
            {
            }
          } else {
            stryCov_9fa48('647')
            throw new BadRequestError(
              stryMutAct_9fa48('648') ? '' : (stryCov_9fa48('648'), 'Password is required'),
              {}
            )
          }
        }

        // Supabase Auth signin
        const { data, error } = await supabase.auth.signInWithPassword(
          stryMutAct_9fa48('649')
            ? {}
            : (stryCov_9fa48('649'),
              {
                email,
                password
              })
        )
        if (
          stryMutAct_9fa48('651')
            ? false
            : stryMutAct_9fa48('650')
              ? true
              : (stryCov_9fa48('650', '651'), error)
        ) {
          if (stryMutAct_9fa48('652')) {
            {
            }
          } else {
            stryCov_9fa48('652')
            throw new UnauthorizedError(
              stryMutAct_9fa48('653') ? '' : (stryCov_9fa48('653'), 'Invalid email or password'),
              stryMutAct_9fa48('654')
                ? {}
                : (stryCov_9fa48('654'),
                  {
                    email
                  })
            )
          }
        }
        if (
          stryMutAct_9fa48('657')
            ? false
            : stryMutAct_9fa48('656')
              ? true
              : stryMutAct_9fa48('655')
                ? data.session
                : (stryCov_9fa48('655', '656', '657'), !data.session)
        ) {
          if (stryMutAct_9fa48('658')) {
            {
            }
          } else {
            stryCov_9fa48('658')
            throw new UnauthorizedError(
              stryMutAct_9fa48('659') ? '' : (stryCov_9fa48('659'), 'Authentication failed'),
              stryMutAct_9fa48('660')
                ? {}
                : (stryCov_9fa48('660'),
                  {
                    email
                  })
            )
          }
        }
        return stryMutAct_9fa48('661')
          ? {}
          : (stryCov_9fa48('661'),
            {
              user: data.user,
              session: data.session,
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('662')) {
        {
        }
      } else {
        stryCov_9fa48('662')
        console.error(
          stryMutAct_9fa48('663') ? `` : (stryCov_9fa48('663'), `signIn(${email}) failed:`),
          error
        )
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('666')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('665')
              ? false
              : stryMutAct_9fa48('664')
                ? true
                : (stryCov_9fa48('664', '665', '666'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('667') ? '' : (stryCov_9fa48('667'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('668')) {
            {
            }
          } else {
            stryCov_9fa48('668')
            throw error
          }
        }
        throw new DatabaseError(
          stryMutAct_9fa48('669') ? '' : (stryCov_9fa48('669'), 'SIGNIN'),
          stryMutAct_9fa48('670') ? '' : (stryCov_9fa48('670'), 'auth.users'),
          error,
          stryMutAct_9fa48('671')
            ? {}
            : (stryCov_9fa48('671'),
              {
                email
              })
        )
      }
    }
  }
}

/**
 * Sign out user (PRODUCTION ONLY)
 * @param {string} accessToken
 * @returns {Object} { message }
 * @throws {DatabaseError} If signout fails
 */
export async function signOut(accessToken) {
  if (stryMutAct_9fa48('672')) {
    {
    }
  } else {
    stryCov_9fa48('672')
    try {
      if (stryMutAct_9fa48('673')) {
        {
        }
      } else {
        stryCov_9fa48('673')
        const { error } = await supabase.auth.signOut(accessToken)
        if (
          stryMutAct_9fa48('675')
            ? false
            : stryMutAct_9fa48('674')
              ? true
              : (stryCov_9fa48('674', '675'), error)
        ) {
          if (stryMutAct_9fa48('676')) {
            {
            }
          } else {
            stryCov_9fa48('676')
            throw new DatabaseError(
              stryMutAct_9fa48('677') ? '' : (stryCov_9fa48('677'), 'SIGNOUT'),
              stryMutAct_9fa48('678') ? '' : (stryCov_9fa48('678'), 'auth.users'),
              error,
              {}
            )
          }
        }
        return stryMutAct_9fa48('679')
          ? {}
          : (stryCov_9fa48('679'),
            {
              message: stryMutAct_9fa48('680')
                ? ''
                : (stryCov_9fa48('680'), 'Signed out successfully')
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('681')) {
        {
        }
      } else {
        stryCov_9fa48('681')
        console.error(
          stryMutAct_9fa48('682') ? '' : (stryCov_9fa48('682'), 'signOut failed:'),
          error
        )
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('685')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('684')
              ? false
              : stryMutAct_9fa48('683')
                ? true
                : (stryCov_9fa48('683', '684', '685'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('686') ? '' : (stryCov_9fa48('686'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('687')) {
            {
            }
          } else {
            stryCov_9fa48('687')
            throw error
          }
        }
        throw new DatabaseError(
          stryMutAct_9fa48('688') ? '' : (stryCov_9fa48('688'), 'SIGNOUT'),
          stryMutAct_9fa48('689') ? '' : (stryCov_9fa48('689'), 'auth.users'),
          error,
          {}
        )
      }
    }
  }
}

/**
 * Refresh access token (PRODUCTION ONLY)
 * @param {string} refreshToken
 * @returns {Object} { session, accessToken }
 * @throws {UnauthorizedError} If refresh token invalid
 */
export async function refreshToken(refreshToken) {
  if (stryMutAct_9fa48('690')) {
    {
    }
  } else {
    stryCov_9fa48('690')
    try {
      if (stryMutAct_9fa48('691')) {
        {
        }
      } else {
        stryCov_9fa48('691')
        const { data, error } = await supabase.auth.refreshSession(
          stryMutAct_9fa48('692')
            ? {}
            : (stryCov_9fa48('692'),
              {
                refreshToken
              })
        )
        if (
          stryMutAct_9fa48('694')
            ? false
            : stryMutAct_9fa48('693')
              ? true
              : (stryCov_9fa48('693', '694'), error)
        ) {
          if (stryMutAct_9fa48('695')) {
            {
            }
          } else {
            stryCov_9fa48('695')
            throw new UnauthorizedError(
              stryMutAct_9fa48('696') ? '' : (stryCov_9fa48('696'), 'Invalid refresh token'),
              {}
            )
          }
        }
        if (
          stryMutAct_9fa48('699')
            ? false
            : stryMutAct_9fa48('698')
              ? true
              : stryMutAct_9fa48('697')
                ? data.session
                : (stryCov_9fa48('697', '698', '699'), !data.session)
        ) {
          if (stryMutAct_9fa48('700')) {
            {
            }
          } else {
            stryCov_9fa48('700')
            throw new UnauthorizedError(
              stryMutAct_9fa48('701') ? '' : (stryCov_9fa48('701'), 'Failed to refresh token'),
              {}
            )
          }
        }
        return stryMutAct_9fa48('702')
          ? {}
          : (stryCov_9fa48('702'),
            {
              session: data.session,
              accessToken: data.session.access_token
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('703')) {
        {
        }
      } else {
        stryCov_9fa48('703')
        console.error(
          stryMutAct_9fa48('704') ? '' : (stryCov_9fa48('704'), 'refreshToken failed:'),
          error
        )
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('707')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('706')
              ? false
              : stryMutAct_9fa48('705')
                ? true
                : (stryCov_9fa48('705', '706', '707'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('708') ? '' : (stryCov_9fa48('708'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('709')) {
            {
            }
          } else {
            stryCov_9fa48('709')
            throw error
          }
        }
        throw new DatabaseError(
          stryMutAct_9fa48('710') ? '' : (stryCov_9fa48('710'), 'REFRESH_TOKEN'),
          stryMutAct_9fa48('711') ? '' : (stryCov_9fa48('711'), 'auth.users'),
          error,
          {}
        )
      }
    }
  }
}

/**
 * Get user from access token (PRODUCTION ONLY)
 * Used by authenticate middleware in production mode
 * @param {string} accessToken
 * @returns {Object} user
 * @throws {UnauthorizedError} If token invalid or expired
 */
export async function getUser(accessToken) {
  if (stryMutAct_9fa48('712')) {
    {
    }
  } else {
    stryCov_9fa48('712')
    try {
      if (stryMutAct_9fa48('713')) {
        {
        }
      } else {
        stryCov_9fa48('713')
        const { data, error } = await supabase.auth.getUser(accessToken)
        if (
          stryMutAct_9fa48('715')
            ? false
            : stryMutAct_9fa48('714')
              ? true
              : (stryCov_9fa48('714', '715'), error)
        ) {
          if (stryMutAct_9fa48('716')) {
            {
            }
          } else {
            stryCov_9fa48('716')
            throw new UnauthorizedError(
              stryMutAct_9fa48('717') ? '' : (stryCov_9fa48('717'), 'Invalid or expired token'),
              {}
            )
          }
        }
        if (
          stryMutAct_9fa48('720')
            ? false
            : stryMutAct_9fa48('719')
              ? true
              : stryMutAct_9fa48('718')
                ? data.user
                : (stryCov_9fa48('718', '719', '720'), !data.user)
        ) {
          if (stryMutAct_9fa48('721')) {
            {
            }
          } else {
            stryCov_9fa48('721')
            throw new UnauthorizedError(
              stryMutAct_9fa48('722') ? '' : (stryCov_9fa48('722'), 'User not found'),
              {}
            )
          }
        }
        return data.user
      }
    } catch (error) {
      if (stryMutAct_9fa48('723')) {
        {
        }
      } else {
        stryCov_9fa48('723')
        console.error(
          stryMutAct_9fa48('724') ? '' : (stryCov_9fa48('724'), 'getUser failed:'),
          error
        )
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('727')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('726')
              ? false
              : stryMutAct_9fa48('725')
                ? true
                : (stryCov_9fa48('725', '726', '727'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('728') ? '' : (stryCov_9fa48('728'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('729')) {
            {
            }
          } else {
            stryCov_9fa48('729')
            throw error
          }
        }
        throw new DatabaseError(
          stryMutAct_9fa48('730') ? '' : (stryCov_9fa48('730'), 'GET_USER'),
          stryMutAct_9fa48('731') ? '' : (stryCov_9fa48('731'), 'auth.users'),
          error,
          {}
        )
      }
    }
  }
}

/**
 * Reset password request (PRODUCTION ONLY)
 * @param {string} email
 * @returns {Object} { message }
 * @throws {BadRequestError} If invalid input
 * @throws {DatabaseError} If operation fails
 */
export async function resetPassword(email) {
  if (stryMutAct_9fa48('732')) {
    {
    }
  } else {
    stryCov_9fa48('732')
    try {
      if (stryMutAct_9fa48('733')) {
        {
        }
      } else {
        stryCov_9fa48('733')
        if (
          stryMutAct_9fa48('736')
            ? !email && typeof email !== 'string'
            : stryMutAct_9fa48('735')
              ? false
              : stryMutAct_9fa48('734')
                ? true
                : (stryCov_9fa48('734', '735', '736'),
                  (stryMutAct_9fa48('737') ? email : (stryCov_9fa48('737'), !email)) ||
                    (stryMutAct_9fa48('739')
                      ? typeof email === 'string'
                      : stryMutAct_9fa48('738')
                        ? false
                        : (stryCov_9fa48('738', '739'),
                          typeof email !==
                            (stryMutAct_9fa48('740') ? '' : (stryCov_9fa48('740'), 'string')))))
        ) {
          if (stryMutAct_9fa48('741')) {
            {
            }
          } else {
            stryCov_9fa48('741')
            throw new BadRequestError(
              stryMutAct_9fa48('742') ? '' : (stryCov_9fa48('742'), 'Email is required'),
              stryMutAct_9fa48('743')
                ? {}
                : (stryCov_9fa48('743'),
                  {
                    email
                  })
            )
          }
        }
        const { error } = await supabase.auth.resetPasswordForEmail(
          email,
          stryMutAct_9fa48('744')
            ? {}
            : (stryCov_9fa48('744'),
              {
                redirectTo: stryMutAct_9fa48('745')
                  ? ``
                  : (stryCov_9fa48('745'),
                    `${stryMutAct_9fa48('748') ? process.env.FRONTEND_URL && 'http://localhost:3000' : stryMutAct_9fa48('747') ? false : stryMutAct_9fa48('746') ? true : (stryCov_9fa48('746', '747', '748'), process.env.FRONTEND_URL || (stryMutAct_9fa48('749') ? '' : (stryCov_9fa48('749'), 'http://localhost:3000')))}/reset-password`)
              })
        )
        if (
          stryMutAct_9fa48('751')
            ? false
            : stryMutAct_9fa48('750')
              ? true
              : (stryCov_9fa48('750', '751'), error)
        ) {
          if (stryMutAct_9fa48('752')) {
            {
            }
          } else {
            stryCov_9fa48('752')
            throw new DatabaseError(
              stryMutAct_9fa48('753') ? '' : (stryCov_9fa48('753'), 'RESET_PASSWORD'),
              stryMutAct_9fa48('754') ? '' : (stryCov_9fa48('754'), 'auth.users'),
              error,
              stryMutAct_9fa48('755')
                ? {}
                : (stryCov_9fa48('755'),
                  {
                    email
                  })
            )
          }
        }
        return stryMutAct_9fa48('756')
          ? {}
          : (stryCov_9fa48('756'),
            {
              message: stryMutAct_9fa48('757')
                ? ''
                : (stryCov_9fa48('757'), 'Password reset email sent. Check your inbox.')
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('758')) {
        {
        }
      } else {
        stryCov_9fa48('758')
        console.error(
          stryMutAct_9fa48('759') ? `` : (stryCov_9fa48('759'), `resetPassword(${email}) failed:`),
          error
        )
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('762')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('761')
              ? false
              : stryMutAct_9fa48('760')
                ? true
                : (stryCov_9fa48('760', '761', '762'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('763') ? '' : (stryCov_9fa48('763'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('764')) {
            {
            }
          } else {
            stryCov_9fa48('764')
            throw error
          }
        }
        throw new DatabaseError(
          stryMutAct_9fa48('765') ? '' : (stryCov_9fa48('765'), 'RESET_PASSWORD'),
          stryMutAct_9fa48('766') ? '' : (stryCov_9fa48('766'), 'auth.users'),
          error,
          stryMutAct_9fa48('767')
            ? {}
            : (stryCov_9fa48('767'),
              {
                email
              })
        )
      }
    }
  }
}

/**
 * Update password (PRODUCTION ONLY)
 * @param {string} accessToken
 * @param {string} newPassword
 * @returns {Object} { message }
 * @throws {BadRequestError} If invalid input
 * @throws {UnauthorizedError} If token invalid
 * @throws {DatabaseError} If operation fails
 */
export async function updatePassword(accessToken, newPassword) {
  if (stryMutAct_9fa48('768')) {
    {
    }
  } else {
    stryCov_9fa48('768')
    try {
      if (stryMutAct_9fa48('769')) {
        {
        }
      } else {
        stryCov_9fa48('769')
        if (
          stryMutAct_9fa48('772')
            ? !newPassword && typeof newPassword !== 'string'
            : stryMutAct_9fa48('771')
              ? false
              : stryMutAct_9fa48('770')
                ? true
                : (stryCov_9fa48('770', '771', '772'),
                  (stryMutAct_9fa48('773') ? newPassword : (stryCov_9fa48('773'), !newPassword)) ||
                    (stryMutAct_9fa48('775')
                      ? typeof newPassword === 'string'
                      : stryMutAct_9fa48('774')
                        ? false
                        : (stryCov_9fa48('774', '775'),
                          typeof newPassword !==
                            (stryMutAct_9fa48('776') ? '' : (stryCov_9fa48('776'), 'string')))))
        ) {
          if (stryMutAct_9fa48('777')) {
            {
            }
          } else {
            stryCov_9fa48('777')
            throw new BadRequestError(
              stryMutAct_9fa48('778') ? '' : (stryCov_9fa48('778'), 'New password is required'),
              {}
            )
          }
        }
        if (
          stryMutAct_9fa48('782')
            ? newPassword.length >= 8
            : stryMutAct_9fa48('781')
              ? newPassword.length <= 8
              : stryMutAct_9fa48('780')
                ? false
                : stryMutAct_9fa48('779')
                  ? true
                  : (stryCov_9fa48('779', '780', '781', '782'), newPassword.length < 8)
        ) {
          if (stryMutAct_9fa48('783')) {
            {
            }
          } else {
            stryCov_9fa48('783')
            throw new BadRequestError(
              stryMutAct_9fa48('784')
                ? ''
                : (stryCov_9fa48('784'), 'Password must be at least 8 characters'),
              stryMutAct_9fa48('785')
                ? {}
                : (stryCov_9fa48('785'),
                  {
                    passwordLength: newPassword.length
                  })
            )
          }
        }

        // Get user first to validate token
        await getUser(accessToken)

        // Update password
        const { error } = await supabase.auth.updateUser(
          stryMutAct_9fa48('786')
            ? {}
            : (stryCov_9fa48('786'),
              {
                password: newPassword
              })
        )
        if (
          stryMutAct_9fa48('788')
            ? false
            : stryMutAct_9fa48('787')
              ? true
              : (stryCov_9fa48('787', '788'), error)
        ) {
          if (stryMutAct_9fa48('789')) {
            {
            }
          } else {
            stryCov_9fa48('789')
            throw new DatabaseError(
              stryMutAct_9fa48('790') ? '' : (stryCov_9fa48('790'), 'UPDATE_PASSWORD'),
              stryMutAct_9fa48('791') ? '' : (stryCov_9fa48('791'), 'auth.users'),
              error,
              {}
            )
          }
        }
        return stryMutAct_9fa48('792')
          ? {}
          : (stryCov_9fa48('792'),
            {
              message: stryMutAct_9fa48('793')
                ? ''
                : (stryCov_9fa48('793'), 'Password updated successfully')
            })
      }
    } catch (error) {
      if (stryMutAct_9fa48('794')) {
        {
        }
      } else {
        stryCov_9fa48('794')
        console.error(
          stryMutAct_9fa48('795') ? '' : (stryCov_9fa48('795'), 'updatePassword failed:'),
          error
        )
        // Re-throw AppError instances as-is (fail-fast)
        if (
          stryMutAct_9fa48('798')
            ? error.name || error.name.includes('Error')
            : stryMutAct_9fa48('797')
              ? false
              : stryMutAct_9fa48('796')
                ? true
                : (stryCov_9fa48('796', '797', '798'),
                  error.name &&
                    error.name.includes(
                      stryMutAct_9fa48('799') ? '' : (stryCov_9fa48('799'), 'Error')
                    ))
        ) {
          if (stryMutAct_9fa48('800')) {
            {
            }
          } else {
            stryCov_9fa48('800')
            throw error
          }
        }
        throw new DatabaseError(
          stryMutAct_9fa48('801') ? '' : (stryCov_9fa48('801'), 'UPDATE_PASSWORD'),
          stryMutAct_9fa48('802') ? '' : (stryCov_9fa48('802'), 'auth.users'),
          error,
          {}
        )
      }
    }
  }
}
