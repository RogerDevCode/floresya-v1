/**
 * Procesado por B
 */
// @ts-nocheck

/**
 * Validator Service - Centralized Validation
 * Eliminates code duplication and ensures consistency
 * Follows KISS and DRY principles from CLAUDE.md
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
import { ValidationError } from '../../errors/AppError.js'

/**
import { BadRequestError } from "../errors/AppError.js"
 * Centralized validation service
 * All validations in one place for maintainability
 */
export class ValidatorService {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If email is invalid
   */
  static validateEmail(
    email,
    fieldName = stryMutAct_9fa48('7083') ? '' : (stryCov_9fa48('7083'), 'email')
  ) {
    if (stryMutAct_9fa48('7084')) {
      {
      }
    } else {
      stryCov_9fa48('7084')
      const emailRegex = stryMutAct_9fa48('7095')
        ? /^[^\s@]+@[^\s@]+\.[^\S@]+$/
        : stryMutAct_9fa48('7094')
          ? /^[^\s@]+@[^\s@]+\.[\s@]+$/
          : stryMutAct_9fa48('7093')
            ? /^[^\s@]+@[^\s@]+\.[^\s@]$/
            : stryMutAct_9fa48('7092')
              ? /^[^\s@]+@[^\S@]+\.[^\s@]+$/
              : stryMutAct_9fa48('7091')
                ? /^[^\s@]+@[\s@]+\.[^\s@]+$/
                : stryMutAct_9fa48('7090')
                  ? /^[^\s@]+@[^\s@]\.[^\s@]+$/
                  : stryMutAct_9fa48('7089')
                    ? /^[^\S@]+@[^\s@]+\.[^\s@]+$/
                    : stryMutAct_9fa48('7088')
                      ? /^[\s@]+@[^\s@]+\.[^\s@]+$/
                      : stryMutAct_9fa48('7087')
                        ? /^[^\s@]@[^\s@]+\.[^\s@]+$/
                        : stryMutAct_9fa48('7086')
                          ? /^[^\s@]+@[^\s@]+\.[^\s@]+/
                          : stryMutAct_9fa48('7085')
                            ? /[^\s@]+@[^\s@]+\.[^\s@]+$/
                            : (stryCov_9fa48(
                                '7085',
                                '7086',
                                '7087',
                                '7088',
                                '7089',
                                '7090',
                                '7091',
                                '7092',
                                '7093',
                                '7094',
                                '7095'
                              ),
                              /^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      if (
        stryMutAct_9fa48('7098')
          ? false
          : stryMutAct_9fa48('7097')
            ? true
            : stryMutAct_9fa48('7096')
              ? email
              : (stryCov_9fa48('7096', '7097', '7098'), !email)
      ) {
        if (stryMutAct_9fa48('7099')) {
          {
          }
        } else {
          stryCov_9fa48('7099')
          throw new ValidationError(
            stryMutAct_9fa48('7100') ? `` : (stryCov_9fa48('7100'), `${fieldName} is required`),
            stryMutAct_9fa48('7101')
              ? {}
              : (stryCov_9fa48('7101'),
                {
                  field: fieldName,
                  received: email,
                  rule: stryMutAct_9fa48('7102') ? '' : (stryCov_9fa48('7102'), 'required')
                })
          )
        }
      }
      if (
        stryMutAct_9fa48('7105')
          ? typeof email === 'string'
          : stryMutAct_9fa48('7104')
            ? false
            : stryMutAct_9fa48('7103')
              ? true
              : (stryCov_9fa48('7103', '7104', '7105'),
                typeof email !==
                  (stryMutAct_9fa48('7106') ? '' : (stryCov_9fa48('7106'), 'string')))
      ) {
        if (stryMutAct_9fa48('7107')) {
          {
          }
        } else {
          stryCov_9fa48('7107')
          throw new ValidationError(
            stryMutAct_9fa48('7108')
              ? ``
              : (stryCov_9fa48('7108'), `${fieldName} must be a string`),
            stryMutAct_9fa48('7109')
              ? {}
              : (stryCov_9fa48('7109'),
                {
                  field: fieldName,
                  received: typeof email,
                  rule: stryMutAct_9fa48('7110') ? '' : (stryCov_9fa48('7110'), 'string required')
                })
          )
        }
      }
      if (
        stryMutAct_9fa48('7113')
          ? false
          : stryMutAct_9fa48('7112')
            ? true
            : stryMutAct_9fa48('7111')
              ? emailRegex.test(email)
              : (stryCov_9fa48('7111', '7112', '7113'), !emailRegex.test(email))
      ) {
        if (stryMutAct_9fa48('7114')) {
          {
          }
        } else {
          stryCov_9fa48('7114')
          throw new ValidationError(
            stryMutAct_9fa48('7115')
              ? ``
              : (stryCov_9fa48('7115'), `${fieldName} format is invalid`),
            stryMutAct_9fa48('7116')
              ? {}
              : (stryCov_9fa48('7116'),
                {
                  field: fieldName,
                  received: email,
                  rule: stryMutAct_9fa48('7117')
                    ? ''
                    : (stryCov_9fa48('7117'), 'valid email format required'),
                  example: stryMutAct_9fa48('7118')
                    ? ''
                    : (stryCov_9fa48('7118'), 'user@example.com')
                })
          )
        }
      }
      return stryMutAct_9fa48('7119') ? false : (stryCov_9fa48('7119'), true)
    }
  }

  /**
   * Validate required field
   * @param {*} value - Value to check
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If value is empty
   */
  static validateRequired(
    value,
    fieldName = stryMutAct_9fa48('7120') ? '' : (stryCov_9fa48('7120'), 'field')
  ) {
    if (stryMutAct_9fa48('7121')) {
      {
      }
    } else {
      stryCov_9fa48('7121')
      if (
        stryMutAct_9fa48('7124')
          ? value === null && value === undefined
          : stryMutAct_9fa48('7123')
            ? false
            : stryMutAct_9fa48('7122')
              ? true
              : (stryCov_9fa48('7122', '7123', '7124'),
                (stryMutAct_9fa48('7126')
                  ? value !== null
                  : stryMutAct_9fa48('7125')
                    ? false
                    : (stryCov_9fa48('7125', '7126'), value === null)) ||
                  (stryMutAct_9fa48('7128')
                    ? value !== undefined
                    : stryMutAct_9fa48('7127')
                      ? false
                      : (stryCov_9fa48('7127', '7128'), value === undefined)))
      ) {
        if (stryMutAct_9fa48('7129')) {
          {
          }
        } else {
          stryCov_9fa48('7129')
          throw new ValidationError(
            stryMutAct_9fa48('7130') ? `` : (stryCov_9fa48('7130'), `${fieldName} is required`),
            stryMutAct_9fa48('7131')
              ? {}
              : (stryCov_9fa48('7131'),
                {
                  field: fieldName,
                  received: value,
                  rule: stryMutAct_9fa48('7132') ? '' : (stryCov_9fa48('7132'), 'required')
                })
          )
        }
      }
      if (
        stryMutAct_9fa48('7135')
          ? typeof value === 'string' || value.trim() === ''
          : stryMutAct_9fa48('7134')
            ? false
            : stryMutAct_9fa48('7133')
              ? true
              : (stryCov_9fa48('7133', '7134', '7135'),
                (stryMutAct_9fa48('7137')
                  ? typeof value !== 'string'
                  : stryMutAct_9fa48('7136')
                    ? true
                    : (stryCov_9fa48('7136', '7137'),
                      typeof value ===
                        (stryMutAct_9fa48('7138') ? '' : (stryCov_9fa48('7138'), 'string')))) &&
                  (stryMutAct_9fa48('7140')
                    ? value.trim() !== ''
                    : stryMutAct_9fa48('7139')
                      ? true
                      : (stryCov_9fa48('7139', '7140'),
                        (stryMutAct_9fa48('7141')
                          ? value
                          : (stryCov_9fa48('7141'), value.trim())) ===
                          (stryMutAct_9fa48('7142')
                            ? 'Stryker was here!'
                            : (stryCov_9fa48('7142'), '')))))
      ) {
        if (stryMutAct_9fa48('7143')) {
          {
          }
        } else {
          stryCov_9fa48('7143')
          throw new ValidationError(
            stryMutAct_9fa48('7144') ? `` : (stryCov_9fa48('7144'), `${fieldName} cannot be empty`),
            stryMutAct_9fa48('7145')
              ? {}
              : (stryCov_9fa48('7145'),
                {
                  field: fieldName,
                  received: value,
                  rule: stryMutAct_9fa48('7146') ? '' : (stryCov_9fa48('7146'), 'non-empty string')
                })
          )
        }
      }
      if (
        stryMutAct_9fa48('7149')
          ? Array.isArray(value) || value.length === 0
          : stryMutAct_9fa48('7148')
            ? false
            : stryMutAct_9fa48('7147')
              ? true
              : (stryCov_9fa48('7147', '7148', '7149'),
                Array.isArray(value) &&
                  (stryMutAct_9fa48('7151')
                    ? value.length !== 0
                    : stryMutAct_9fa48('7150')
                      ? true
                      : (stryCov_9fa48('7150', '7151'), value.length === 0)))
      ) {
        if (stryMutAct_9fa48('7152')) {
          {
          }
        } else {
          stryCov_9fa48('7152')
          throw new ValidationError(
            stryMutAct_9fa48('7153') ? `` : (stryCov_9fa48('7153'), `${fieldName} cannot be empty`),
            stryMutAct_9fa48('7154')
              ? {}
              : (stryCov_9fa48('7154'),
                {
                  field: fieldName,
                  received: value,
                  rule: stryMutAct_9fa48('7155') ? '' : (stryCov_9fa48('7155'), 'non-empty array')
                })
          )
        }
      }
      return stryMutAct_9fa48('7156') ? false : (stryCov_9fa48('7156'), true)
    }
  }

  /**
   * Validate minimum string length
   * @param {string} value - String to validate
   * @param {number} minLength - Minimum length
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If string is too short
   */
  static validateMinLength(
    value,
    minLength,
    fieldName = stryMutAct_9fa48('7157') ? '' : (stryCov_9fa48('7157'), 'field')
  ) {
    if (stryMutAct_9fa48('7158')) {
      {
      }
    } else {
      stryCov_9fa48('7158')
      if (
        stryMutAct_9fa48('7161')
          ? typeof value === 'string'
          : stryMutAct_9fa48('7160')
            ? false
            : stryMutAct_9fa48('7159')
              ? true
              : (stryCov_9fa48('7159', '7160', '7161'),
                typeof value !==
                  (stryMutAct_9fa48('7162') ? '' : (stryCov_9fa48('7162'), 'string')))
      ) {
        if (stryMutAct_9fa48('7163')) {
          {
          }
        } else {
          stryCov_9fa48('7163')
          throw new ValidationError(
            stryMutAct_9fa48('7164')
              ? ``
              : (stryCov_9fa48('7164'), `${fieldName} must be a string`),
            stryMutAct_9fa48('7165')
              ? {}
              : (stryCov_9fa48('7165'),
                {
                  field: fieldName,
                  received: typeof value,
                  rule: stryMutAct_9fa48('7166') ? '' : (stryCov_9fa48('7166'), 'string required')
                })
          )
        }
      }
      if (
        stryMutAct_9fa48('7170')
          ? value.length >= minLength
          : stryMutAct_9fa48('7169')
            ? value.length <= minLength
            : stryMutAct_9fa48('7168')
              ? false
              : stryMutAct_9fa48('7167')
                ? true
                : (stryCov_9fa48('7167', '7168', '7169', '7170'), value.length < minLength)
      ) {
        if (stryMutAct_9fa48('7171')) {
          {
          }
        } else {
          stryCov_9fa48('7171')
          throw new ValidationError(
            stryMutAct_9fa48('7172')
              ? ``
              : (stryCov_9fa48('7172'), `${fieldName} must be at least ${minLength} characters`),
            stryMutAct_9fa48('7173')
              ? {}
              : (stryCov_9fa48('7173'),
                {
                  field: fieldName,
                  received: value.length,
                  minimum: minLength,
                  current: value
                })
          )
        }
      }
      return stryMutAct_9fa48('7174') ? false : (stryCov_9fa48('7174'), true)
    }
  }

  /**
   * Validate maximum string length
   * @param {string} value - String to validate
   * @param {number} maxLength - Maximum length
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If string is too long
   */
  static validateMaxLength(
    value,
    maxLength,
    fieldName = stryMutAct_9fa48('7175') ? '' : (stryCov_9fa48('7175'), 'field')
  ) {
    if (stryMutAct_9fa48('7176')) {
      {
      }
    } else {
      stryCov_9fa48('7176')
      if (
        stryMutAct_9fa48('7179')
          ? typeof value === 'string'
          : stryMutAct_9fa48('7178')
            ? false
            : stryMutAct_9fa48('7177')
              ? true
              : (stryCov_9fa48('7177', '7178', '7179'),
                typeof value !==
                  (stryMutAct_9fa48('7180') ? '' : (stryCov_9fa48('7180'), 'string')))
      ) {
        if (stryMutAct_9fa48('7181')) {
          {
          }
        } else {
          stryCov_9fa48('7181')
          throw new ValidationError(
            stryMutAct_9fa48('7182')
              ? ``
              : (stryCov_9fa48('7182'), `${fieldName} must be a string`),
            stryMutAct_9fa48('7183')
              ? {}
              : (stryCov_9fa48('7183'),
                {
                  field: fieldName,
                  received: typeof value,
                  rule: stryMutAct_9fa48('7184') ? '' : (stryCov_9fa48('7184'), 'string required')
                })
          )
        }
      }
      if (
        stryMutAct_9fa48('7188')
          ? value.length <= maxLength
          : stryMutAct_9fa48('7187')
            ? value.length >= maxLength
            : stryMutAct_9fa48('7186')
              ? false
              : stryMutAct_9fa48('7185')
                ? true
                : (stryCov_9fa48('7185', '7186', '7187', '7188'), value.length > maxLength)
      ) {
        if (stryMutAct_9fa48('7189')) {
          {
          }
        } else {
          stryCov_9fa48('7189')
          throw new ValidationError(
            stryMutAct_9fa48('7190')
              ? ``
              : (stryCov_9fa48('7190'), `${fieldName} must be at most ${maxLength} characters`),
            stryMutAct_9fa48('7191')
              ? {}
              : (stryCov_9fa48('7191'),
                {
                  field: fieldName,
                  received: value.length,
                  maximum: maxLength,
                  current: value
                })
          )
        }
      }
      return stryMutAct_9fa48('7192') ? false : (stryCov_9fa48('7192'), true)
    }
  }

  /**
   * Validate numeric ID
   * @param {*} id - ID to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {number} Validated ID
   * @throws {ValidationError} If ID is invalid
   */
  static validateId(id, fieldName = stryMutAct_9fa48('7193') ? '' : (stryCov_9fa48('7193'), 'id')) {
    if (stryMutAct_9fa48('7194')) {
      {
      }
    } else {
      stryCov_9fa48('7194')
      if (
        stryMutAct_9fa48('7197')
          ? id === null && id === undefined
          : stryMutAct_9fa48('7196')
            ? false
            : stryMutAct_9fa48('7195')
              ? true
              : (stryCov_9fa48('7195', '7196', '7197'),
                (stryMutAct_9fa48('7199')
                  ? id !== null
                  : stryMutAct_9fa48('7198')
                    ? false
                    : (stryCov_9fa48('7198', '7199'), id === null)) ||
                  (stryMutAct_9fa48('7201')
                    ? id !== undefined
                    : stryMutAct_9fa48('7200')
                      ? false
                      : (stryCov_9fa48('7200', '7201'), id === undefined)))
      ) {
        if (stryMutAct_9fa48('7202')) {
          {
          }
        } else {
          stryCov_9fa48('7202')
          throw new ValidationError(
            stryMutAct_9fa48('7203') ? `` : (stryCov_9fa48('7203'), `${fieldName} is required`),
            stryMutAct_9fa48('7204')
              ? {}
              : (stryCov_9fa48('7204'),
                {
                  field: fieldName,
                  received: id,
                  rule: stryMutAct_9fa48('7205') ? '' : (stryCov_9fa48('7205'), 'required')
                })
          )
        }
      }
      const numericId = Number(id)
      if (
        stryMutAct_9fa48('7207')
          ? false
          : stryMutAct_9fa48('7206')
            ? true
            : (stryCov_9fa48('7206', '7207'), isNaN(numericId))
      ) {
        if (stryMutAct_9fa48('7208')) {
          {
          }
        } else {
          stryCov_9fa48('7208')
          throw new ValidationError(
            stryMutAct_9fa48('7209')
              ? ``
              : (stryCov_9fa48('7209'), `${fieldName} must be a number`),
            stryMutAct_9fa48('7210')
              ? {}
              : (stryCov_9fa48('7210'),
                {
                  field: fieldName,
                  received: id,
                  rule: stryMutAct_9fa48('7211')
                    ? ''
                    : (stryCov_9fa48('7211'), 'numeric value required')
                })
          )
        }
      }
      if (
        stryMutAct_9fa48('7215')
          ? numericId > 0
          : stryMutAct_9fa48('7214')
            ? numericId < 0
            : stryMutAct_9fa48('7213')
              ? false
              : stryMutAct_9fa48('7212')
                ? true
                : (stryCov_9fa48('7212', '7213', '7214', '7215'), numericId <= 0)
      ) {
        if (stryMutAct_9fa48('7216')) {
          {
          }
        } else {
          stryCov_9fa48('7216')
          throw new ValidationError(
            stryMutAct_9fa48('7217')
              ? ``
              : (stryCov_9fa48('7217'), `${fieldName} must be positive`),
            stryMutAct_9fa48('7218')
              ? {}
              : (stryCov_9fa48('7218'),
                {
                  field: fieldName,
                  received: numericId,
                  rule: stryMutAct_9fa48('7219')
                    ? ''
                    : (stryCov_9fa48('7219'), 'positive number required')
                })
          )
        }
      }
      return numericId
    }
  }

  /**
   * Validate boolean value
   * @param {*} value - Value to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} Validated boolean
   * @throws {ValidationError} If value is not boolean
   */
  static validateBoolean(
    value,
    fieldName = stryMutAct_9fa48('7220') ? '' : (stryCov_9fa48('7220'), 'field')
  ) {
    if (stryMutAct_9fa48('7221')) {
      {
      }
    } else {
      stryCov_9fa48('7221')
      if (
        stryMutAct_9fa48('7224')
          ? typeof value === 'boolean'
          : stryMutAct_9fa48('7223')
            ? false
            : stryMutAct_9fa48('7222')
              ? true
              : (stryCov_9fa48('7222', '7223', '7224'),
                typeof value !==
                  (stryMutAct_9fa48('7225') ? '' : (stryCov_9fa48('7225'), 'boolean')))
      ) {
        if (stryMutAct_9fa48('7226')) {
          {
          }
        } else {
          stryCov_9fa48('7226')
          throw new ValidationError(
            stryMutAct_9fa48('7227')
              ? ``
              : (stryCov_9fa48('7227'), `${fieldName} must be a boolean`),
            stryMutAct_9fa48('7228')
              ? {}
              : (stryCov_9fa48('7228'),
                {
                  field: fieldName,
                  received: typeof value,
                  rule: stryMutAct_9fa48('7229') ? '' : (stryCov_9fa48('7229'), 'boolean required')
                })
          )
        }
      }
      return value
    }
  }

  /**
   * Validate phone number (Venezuelan format)
   * @param {string} phone - Phone number to validate
   * @returns {boolean} True if valid
   * @throws {ValidationError} If phone is invalid
   */
  static validatePhone(phone) {
    if (stryMutAct_9fa48('7230')) {
      {
      }
    } else {
      stryCov_9fa48('7230')
      if (
        stryMutAct_9fa48('7233')
          ? false
          : stryMutAct_9fa48('7232')
            ? true
            : stryMutAct_9fa48('7231')
              ? phone
              : (stryCov_9fa48('7231', '7232', '7233'), !phone)
      ) {
        if (stryMutAct_9fa48('7234')) {
          {
          }
        } else {
          stryCov_9fa48('7234')
          return stryMutAct_9fa48('7235') ? false : (stryCov_9fa48('7235'), true) // Phone is optional
        }
      }
      if (
        stryMutAct_9fa48('7238')
          ? typeof phone === 'string'
          : stryMutAct_9fa48('7237')
            ? false
            : stryMutAct_9fa48('7236')
              ? true
              : (stryCov_9fa48('7236', '7237', '7238'),
                typeof phone !==
                  (stryMutAct_9fa48('7239') ? '' : (stryCov_9fa48('7239'), 'string')))
      ) {
        if (stryMutAct_9fa48('7240')) {
          {
          }
        } else {
          stryCov_9fa48('7240')
          throw new ValidationError(
            stryMutAct_9fa48('7241') ? '' : (stryCov_9fa48('7241'), 'Phone must be a string'),
            stryMutAct_9fa48('7242')
              ? {}
              : (stryCov_9fa48('7242'),
                {
                  field: stryMutAct_9fa48('7243') ? '' : (stryCov_9fa48('7243'), 'phone'),
                  received: typeof phone,
                  rule: stryMutAct_9fa48('7244') ? '' : (stryCov_9fa48('7244'), 'string required')
                })
          )
        }
      }

      // Venezuelan phone validation
      const phoneRegex = stryMutAct_9fa48('7249')
        ? /^(?:\+58|0058|58)?[^0-9]{10}$/
        : stryMutAct_9fa48('7248')
          ? /^(?:\+58|0058|58)?[0-9]$/
          : stryMutAct_9fa48('7247')
            ? /^(?:\+58|0058|58)[0-9]{10}$/
            : stryMutAct_9fa48('7246')
              ? /^(?:\+58|0058|58)?[0-9]{10}/
              : stryMutAct_9fa48('7245')
                ? /(?:\+58|0058|58)?[0-9]{10}$/
                : (stryCov_9fa48('7245', '7246', '7247', '7248', '7249'),
                  /^(?:\+58|0058|58)?[0-9]{10}$/)
      if (
        stryMutAct_9fa48('7252')
          ? false
          : stryMutAct_9fa48('7251')
            ? true
            : stryMutAct_9fa48('7250')
              ? phoneRegex.test(phone.replace(/\s+/g, ''))
              : (stryCov_9fa48('7250', '7251', '7252'),
                !phoneRegex.test(
                  phone.replace(
                    stryMutAct_9fa48('7254')
                      ? /\S+/g
                      : stryMutAct_9fa48('7253')
                        ? /\s/g
                        : (stryCov_9fa48('7253', '7254'), /\s+/g),
                    stryMutAct_9fa48('7255') ? 'Stryker was here!' : (stryCov_9fa48('7255'), '')
                  )
                ))
      ) {
        if (stryMutAct_9fa48('7256')) {
          {
          }
        } else {
          stryCov_9fa48('7256')
          throw new ValidationError(
            stryMutAct_9fa48('7257')
              ? ''
              : (stryCov_9fa48('7257'), 'Invalid Venezuelan phone number format'),
            stryMutAct_9fa48('7258')
              ? {}
              : (stryCov_9fa48('7258'),
                {
                  field: stryMutAct_9fa48('7259') ? '' : (stryCov_9fa48('7259'), 'phone'),
                  received: phone,
                  rule: stryMutAct_9fa48('7260')
                    ? ''
                    : (stryCov_9fa48('7260'), 'valid format required'),
                  examples: stryMutAct_9fa48('7261')
                    ? []
                    : (stryCov_9fa48('7261'),
                      [
                        stryMutAct_9fa48('7262') ? '' : (stryCov_9fa48('7262'), '04141234567'),
                        stryMutAct_9fa48('7263') ? '' : (stryCov_9fa48('7263'), '584141234567'),
                        stryMutAct_9fa48('7264') ? '' : (stryCov_9fa48('7264'), '+584141234567')
                      ])
                })
          )
        }
      }
      return stryMutAct_9fa48('7265') ? false : (stryCov_9fa48('7265'), true)
    }
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {boolean} True if valid
   * @throws {ValidationError} If password is too weak
   */
  static validatePassword(password) {
    if (stryMutAct_9fa48('7266')) {
      {
      }
    } else {
      stryCov_9fa48('7266')
      if (
        stryMutAct_9fa48('7269')
          ? false
          : stryMutAct_9fa48('7268')
            ? true
            : stryMutAct_9fa48('7267')
              ? password
              : (stryCov_9fa48('7267', '7268', '7269'), !password)
      ) {
        if (stryMutAct_9fa48('7270')) {
          {
          }
        } else {
          stryCov_9fa48('7270')
          throw new ValidationError(
            stryMutAct_9fa48('7271') ? '' : (stryCov_9fa48('7271'), 'Password is required'),
            stryMutAct_9fa48('7272')
              ? {}
              : (stryCov_9fa48('7272'),
                {
                  field: stryMutAct_9fa48('7273') ? '' : (stryCov_9fa48('7273'), 'password'),
                  rule: stryMutAct_9fa48('7274') ? '' : (stryCov_9fa48('7274'), 'required')
                })
          )
        }
      }
      if (
        stryMutAct_9fa48('7277')
          ? typeof password === 'string'
          : stryMutAct_9fa48('7276')
            ? false
            : stryMutAct_9fa48('7275')
              ? true
              : (stryCov_9fa48('7275', '7276', '7277'),
                typeof password !==
                  (stryMutAct_9fa48('7278') ? '' : (stryCov_9fa48('7278'), 'string')))
      ) {
        if (stryMutAct_9fa48('7279')) {
          {
          }
        } else {
          stryCov_9fa48('7279')
          throw new ValidationError(
            stryMutAct_9fa48('7280') ? '' : (stryCov_9fa48('7280'), 'Password must be a string'),
            stryMutAct_9fa48('7281')
              ? {}
              : (stryCov_9fa48('7281'),
                {
                  field: stryMutAct_9fa48('7282') ? '' : (stryCov_9fa48('7282'), 'password'),
                  rule: stryMutAct_9fa48('7283') ? '' : (stryCov_9fa48('7283'), 'string required')
                })
          )
        }
      }

      // Minimum 8 characters, at least 1 letter and 1 number
      const passwordRegex = stryMutAct_9fa48('7294')
        ? /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\D@$!%*#?&]{8,}$/
        : stryMutAct_9fa48('7293')
          ? /^(?=.*[A-Za-z])(?=.*\d)[^A-Za-z\d@$!%*#?&]{8,}$/
          : stryMutAct_9fa48('7292')
            ? /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]$/
            : stryMutAct_9fa48('7291')
              ? /^(?=.*[A-Za-z])(?=.*\D)[A-Za-z\d@$!%*#?&]{8,}$/
              : stryMutAct_9fa48('7290')
                ? /^(?=.*[A-Za-z])(?=.\d)[A-Za-z\d@$!%*#?&]{8,}$/
                : stryMutAct_9fa48('7289')
                  ? /^(?=.*[A-Za-z])(?!.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
                  : stryMutAct_9fa48('7288')
                    ? /^(?=.*[^A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
                    : stryMutAct_9fa48('7287')
                      ? /^(?=.[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
                      : stryMutAct_9fa48('7286')
                        ? /^(?!.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
                        : stryMutAct_9fa48('7285')
                          ? /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}/
                          : stryMutAct_9fa48('7284')
                            ? /(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/
                            : (stryCov_9fa48(
                                '7284',
                                '7285',
                                '7286',
                                '7287',
                                '7288',
                                '7289',
                                '7290',
                                '7291',
                                '7292',
                                '7293',
                                '7294'
                              ),
                              /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)
      if (
        stryMutAct_9fa48('7297')
          ? false
          : stryMutAct_9fa48('7296')
            ? true
            : stryMutAct_9fa48('7295')
              ? passwordRegex.test(password)
              : (stryCov_9fa48('7295', '7296', '7297'), !passwordRegex.test(password))
      ) {
        if (stryMutAct_9fa48('7298')) {
          {
          }
        } else {
          stryCov_9fa48('7298')
          throw new ValidationError(
            stryMutAct_9fa48('7299')
              ? ''
              : (stryCov_9fa48('7299'),
                'Password must be at least 8 characters with at least 1 letter and 1 number'),
            stryMutAct_9fa48('7300')
              ? {}
              : (stryCov_9fa48('7300'),
                {
                  field: stryMutAct_9fa48('7301') ? '' : (stryCov_9fa48('7301'), 'password'),
                  rule: stryMutAct_9fa48('7302')
                    ? ''
                    : (stryCov_9fa48('7302'), 'minimum 8 characters, 1 letter, 1 number required')
                })
          )
        }
      }
      return stryMutAct_9fa48('7303') ? false : (stryCov_9fa48('7303'), true)
    }
  }

  /**
   * Validate price value
   * @param {number} price - Price to validate
   * @returns {boolean} True if valid
   * @throws {ValidationError} If price is invalid
   */
  static validatePrice(price) {
    if (stryMutAct_9fa48('7304')) {
      {
      }
    } else {
      stryCov_9fa48('7304')
      if (
        stryMutAct_9fa48('7307')
          ? price === null && price === undefined
          : stryMutAct_9fa48('7306')
            ? false
            : stryMutAct_9fa48('7305')
              ? true
              : (stryCov_9fa48('7305', '7306', '7307'),
                (stryMutAct_9fa48('7309')
                  ? price !== null
                  : stryMutAct_9fa48('7308')
                    ? false
                    : (stryCov_9fa48('7308', '7309'), price === null)) ||
                  (stryMutAct_9fa48('7311')
                    ? price !== undefined
                    : stryMutAct_9fa48('7310')
                      ? false
                      : (stryCov_9fa48('7310', '7311'), price === undefined)))
      ) {
        if (stryMutAct_9fa48('7312')) {
          {
          }
        } else {
          stryCov_9fa48('7312')
          return stryMutAct_9fa48('7313') ? false : (stryCov_9fa48('7313'), true) // Price is optional
        }
      }
      const numericPrice = Number(price)
      if (
        stryMutAct_9fa48('7315')
          ? false
          : stryMutAct_9fa48('7314')
            ? true
            : (stryCov_9fa48('7314', '7315'), isNaN(numericPrice))
      ) {
        if (stryMutAct_9fa48('7316')) {
          {
          }
        } else {
          stryCov_9fa48('7316')
          throw new ValidationError(
            stryMutAct_9fa48('7317') ? '' : (stryCov_9fa48('7317'), 'Price must be a number'),
            stryMutAct_9fa48('7318')
              ? {}
              : (stryCov_9fa48('7318'),
                {
                  field: stryMutAct_9fa48('7319') ? '' : (stryCov_9fa48('7319'), 'price'),
                  received: price,
                  rule: stryMutAct_9fa48('7320')
                    ? ''
                    : (stryCov_9fa48('7320'), 'numeric value required')
                })
          )
        }
      }
      if (
        stryMutAct_9fa48('7324')
          ? numericPrice >= 0
          : stryMutAct_9fa48('7323')
            ? numericPrice <= 0
            : stryMutAct_9fa48('7322')
              ? false
              : stryMutAct_9fa48('7321')
                ? true
                : (stryCov_9fa48('7321', '7322', '7323', '7324'), numericPrice < 0)
      ) {
        if (stryMutAct_9fa48('7325')) {
          {
          }
        } else {
          stryCov_9fa48('7325')
          throw new ValidationError(
            stryMutAct_9fa48('7326') ? '' : (stryCov_9fa48('7326'), 'Price cannot be negative'),
            stryMutAct_9fa48('7327')
              ? {}
              : (stryCov_9fa48('7327'),
                {
                  field: stryMutAct_9fa48('7328') ? '' : (stryCov_9fa48('7328'), 'price'),
                  received: numericPrice,
                  rule: stryMutAct_9fa48('7329')
                    ? ''
                    : (stryCov_9fa48('7329'), 'non-negative value required')
                })
          )
        }
      }
      if (
        stryMutAct_9fa48('7333')
          ? numericPrice <= 999999.99
          : stryMutAct_9fa48('7332')
            ? numericPrice >= 999999.99
            : stryMutAct_9fa48('7331')
              ? false
              : stryMutAct_9fa48('7330')
                ? true
                : (stryCov_9fa48('7330', '7331', '7332', '7333'), numericPrice > 999999.99)
      ) {
        if (stryMutAct_9fa48('7334')) {
          {
          }
        } else {
          stryCov_9fa48('7334')
          throw new ValidationError(
            stryMutAct_9fa48('7335') ? '' : (stryCov_9fa48('7335'), 'Price is too high'),
            stryMutAct_9fa48('7336')
              ? {}
              : (stryCov_9fa48('7336'),
                {
                  field: stryMutAct_9fa48('7337') ? '' : (stryCov_9fa48('7337'), 'price'),
                  received: numericPrice,
                  rule: stryMutAct_9fa48('7338')
                    ? ''
                    : (stryCov_9fa48('7338'), 'maximum value: 999999.99')
                })
          )
        }
      }
      return stryMutAct_9fa48('7339') ? false : (stryCov_9fa48('7339'), true)
    }
  }

  /**
   * Validate enum value
   * @param {*} value - Value to validate
   * @param {Array} validValues - Array of valid values
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If value is not in valid values
   */
  static validateEnum(
    value,
    validValues,
    fieldName = stryMutAct_9fa48('7340') ? '' : (stryCov_9fa48('7340'), 'field')
  ) {
    if (stryMutAct_9fa48('7341')) {
      {
      }
    } else {
      stryCov_9fa48('7341')
      if (
        stryMutAct_9fa48('7344')
          ? !validValues && !Array.isArray(validValues)
          : stryMutAct_9fa48('7343')
            ? false
            : stryMutAct_9fa48('7342')
              ? true
              : (stryCov_9fa48('7342', '7343', '7344'),
                (stryMutAct_9fa48('7345') ? validValues : (stryCov_9fa48('7345'), !validValues)) ||
                  (stryMutAct_9fa48('7346')
                    ? Array.isArray(validValues)
                    : (stryCov_9fa48('7346'), !Array.isArray(validValues))))
      ) {
        if (stryMutAct_9fa48('7347')) {
          {
          }
        } else {
          stryCov_9fa48('7347')
          throw new BadRequestError(
            stryMutAct_9fa48('7348')
              ? ''
              : (stryCov_9fa48('7348'), 'Valid values array is required')
          )
        }
      }
      if (
        stryMutAct_9fa48('7351')
          ? false
          : stryMutAct_9fa48('7350')
            ? true
            : stryMutAct_9fa48('7349')
              ? validValues.includes(value)
              : (stryCov_9fa48('7349', '7350', '7351'), !validValues.includes(value))
      ) {
        if (stryMutAct_9fa48('7352')) {
          {
          }
        } else {
          stryCov_9fa48('7352')
          throw new ValidationError(
            stryMutAct_9fa48('7353')
              ? ``
              : (stryCov_9fa48('7353'),
                `${fieldName} must be one of: ${validValues.join(stryMutAct_9fa48('7354') ? '' : (stryCov_9fa48('7354'), ', '))}`),
            stryMutAct_9fa48('7355')
              ? {}
              : (stryCov_9fa48('7355'),
                {
                  field: fieldName,
                  received: value,
                  validValues
                })
          )
        }
      }
      return stryMutAct_9fa48('7356') ? false : (stryCov_9fa48('7356'), true)
    }
  }

  /**
   * Validate object has required properties
   * @param {Object} obj - Object to validate
   * @param {Array} requiredProperties - Array of required property names
   * @param {string} objectName - Object name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If required properties are missing
   */
  static validateRequiredProperties(
    obj,
    requiredProperties,
    objectName = stryMutAct_9fa48('7357') ? '' : (stryCov_9fa48('7357'), 'object')
  ) {
    if (stryMutAct_9fa48('7358')) {
      {
      }
    } else {
      stryCov_9fa48('7358')
      this.validateRequired(obj, objectName)
      const missing = stryMutAct_9fa48('7359')
        ? requiredProperties
        : (stryCov_9fa48('7359'),
          requiredProperties.filter(prop => {
            if (stryMutAct_9fa48('7360')) {
              {
              }
            } else {
              stryCov_9fa48('7360')
              return stryMutAct_9fa48('7363')
                ? obj[prop] === undefined && obj[prop] === null
                : stryMutAct_9fa48('7362')
                  ? false
                  : stryMutAct_9fa48('7361')
                    ? true
                    : (stryCov_9fa48('7361', '7362', '7363'),
                      (stryMutAct_9fa48('7365')
                        ? obj[prop] !== undefined
                        : stryMutAct_9fa48('7364')
                          ? false
                          : (stryCov_9fa48('7364', '7365'), obj[prop] === undefined)) ||
                        (stryMutAct_9fa48('7367')
                          ? obj[prop] !== null
                          : stryMutAct_9fa48('7366')
                            ? false
                            : (stryCov_9fa48('7366', '7367'), obj[prop] === null)))
            }
          }))
      if (
        stryMutAct_9fa48('7371')
          ? missing.length <= 0
          : stryMutAct_9fa48('7370')
            ? missing.length >= 0
            : stryMutAct_9fa48('7369')
              ? false
              : stryMutAct_9fa48('7368')
                ? true
                : (stryCov_9fa48('7368', '7369', '7370', '7371'), missing.length > 0)
      ) {
        if (stryMutAct_9fa48('7372')) {
          {
          }
        } else {
          stryCov_9fa48('7372')
          throw new ValidationError(
            stryMutAct_9fa48('7373')
              ? ``
              : (stryCov_9fa48('7373'),
                `${objectName} is missing required properties: ${missing.join(stryMutAct_9fa48('7374') ? '' : (stryCov_9fa48('7374'), ', '))}`),
            stryMutAct_9fa48('7375')
              ? {}
              : (stryCov_9fa48('7375'),
                {
                  object: objectName,
                  missing,
                  received: Object.keys(obj)
                })
          )
        }
      }
      return stryMutAct_9fa48('7376') ? false : (stryCov_9fa48('7376'), true)
    }
  }

  /**
   * Validate array is not empty
   * @param {Array} arr - Array to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If array is empty
   */
  static validateArrayNotEmpty(
    arr,
    fieldName = stryMutAct_9fa48('7377') ? '' : (stryCov_9fa48('7377'), 'array')
  ) {
    if (stryMutAct_9fa48('7378')) {
      {
      }
    } else {
      stryCov_9fa48('7378')
      if (
        stryMutAct_9fa48('7381')
          ? false
          : stryMutAct_9fa48('7380')
            ? true
            : stryMutAct_9fa48('7379')
              ? Array.isArray(arr)
              : (stryCov_9fa48('7379', '7380', '7381'), !Array.isArray(arr))
      ) {
        if (stryMutAct_9fa48('7382')) {
          {
          }
        } else {
          stryCov_9fa48('7382')
          throw new ValidationError(
            stryMutAct_9fa48('7383')
              ? ``
              : (stryCov_9fa48('7383'), `${fieldName} must be an array`),
            stryMutAct_9fa48('7384')
              ? {}
              : (stryCov_9fa48('7384'),
                {
                  field: fieldName,
                  received: typeof arr,
                  rule: stryMutAct_9fa48('7385') ? '' : (stryCov_9fa48('7385'), 'array required')
                })
          )
        }
      }
      if (
        stryMutAct_9fa48('7388')
          ? arr.length !== 0
          : stryMutAct_9fa48('7387')
            ? false
            : stryMutAct_9fa48('7386')
              ? true
              : (stryCov_9fa48('7386', '7387', '7388'), arr.length === 0)
      ) {
        if (stryMutAct_9fa48('7389')) {
          {
          }
        } else {
          stryCov_9fa48('7389')
          throw new ValidationError(
            stryMutAct_9fa48('7390') ? `` : (stryCov_9fa48('7390'), `${fieldName} cannot be empty`),
            stryMutAct_9fa48('7391')
              ? {}
              : (stryCov_9fa48('7391'),
                {
                  field: fieldName,
                  rule: stryMutAct_9fa48('7392')
                    ? ''
                    : (stryCov_9fa48('7392'), 'non-empty array required')
                })
          )
        }
      }
      return stryMutAct_9fa48('7393') ? false : (stryCov_9fa48('7393'), true)
    }
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid
   * @throws {ValidationError} If URL is invalid
   */
  static validateUrl(url) {
    if (stryMutAct_9fa48('7394')) {
      {
      }
    } else {
      stryCov_9fa48('7394')
      if (
        stryMutAct_9fa48('7397')
          ? false
          : stryMutAct_9fa48('7396')
            ? true
            : stryMutAct_9fa48('7395')
              ? url
              : (stryCov_9fa48('7395', '7396', '7397'), !url)
      ) {
        if (stryMutAct_9fa48('7398')) {
          {
          }
        } else {
          stryCov_9fa48('7398')
          return stryMutAct_9fa48('7399') ? false : (stryCov_9fa48('7399'), true) // URL is optional
        }
      }
      try {
        if (stryMutAct_9fa48('7400')) {
          {
          }
        } else {
          stryCov_9fa48('7400')
          new URL(url)
          return stryMutAct_9fa48('7401') ? false : (stryCov_9fa48('7401'), true)
        }
      } catch (error) {
        if (stryMutAct_9fa48('7402')) {
          {
          }
        } else {
          stryCov_9fa48('7402')
          console.error(
            stryMutAct_9fa48('7403')
              ? ''
              : (stryCov_9fa48('7403'), '[ValidatorService] URL validation failed:'),
            stryMutAct_9fa48('7404')
              ? {}
              : (stryCov_9fa48('7404'),
                {
                  url,
                  error: error.message,
                  stack: error.stack
                })
          )
          throw new ValidationError(
            stryMutAct_9fa48('7405') ? '' : (stryCov_9fa48('7405'), 'Invalid URL format'),
            stryMutAct_9fa48('7406')
              ? {}
              : (stryCov_9fa48('7406'),
                {
                  field: stryMutAct_9fa48('7407') ? '' : (stryCov_9fa48('7407'), 'url'),
                  received: url,
                  rule: stryMutAct_9fa48('7408')
                    ? ''
                    : (stryCov_9fa48('7408'), 'valid URL format required'),
                  example: stryMutAct_9fa48('7409')
                    ? ''
                    : (stryCov_9fa48('7409'), 'https://example.com')
                })
          )
        }
      }
    }
  }

  /**
   * Validate date format
   * @param {string|Date} date - Date to validate
   * @param {string} fieldName - Field name for error messages
   * @returns {boolean} True if valid
   * @throws {ValidationError} If date is invalid
   */
  static validateDate(
    date,
    fieldName = stryMutAct_9fa48('7410') ? '' : (stryCov_9fa48('7410'), 'date')
  ) {
    if (stryMutAct_9fa48('7411')) {
      {
      }
    } else {
      stryCov_9fa48('7411')
      if (
        stryMutAct_9fa48('7414')
          ? false
          : stryMutAct_9fa48('7413')
            ? true
            : stryMutAct_9fa48('7412')
              ? date
              : (stryCov_9fa48('7412', '7413', '7414'), !date)
      ) {
        if (stryMutAct_9fa48('7415')) {
          {
          }
        } else {
          stryCov_9fa48('7415')
          return stryMutAct_9fa48('7416') ? false : (stryCov_9fa48('7416'), true) // Date is optional
        }
      }
      const dateObj = new Date(date)
      if (
        stryMutAct_9fa48('7418')
          ? false
          : stryMutAct_9fa48('7417')
            ? true
            : (stryCov_9fa48('7417', '7418'), isNaN(dateObj.getTime()))
      ) {
        if (stryMutAct_9fa48('7419')) {
          {
          }
        } else {
          stryCov_9fa48('7419')
          throw new ValidationError(
            stryMutAct_9fa48('7420')
              ? ``
              : (stryCov_9fa48('7420'), `${fieldName} must be a valid date`),
            stryMutAct_9fa48('7421')
              ? {}
              : (stryCov_9fa48('7421'),
                {
                  field: fieldName,
                  received: date,
                  rule: stryMutAct_9fa48('7422')
                    ? ''
                    : (stryCov_9fa48('7422'), 'valid date required')
                })
          )
        }
      }
      return stryMutAct_9fa48('7423') ? false : (stryCov_9fa48('7423'), true)
    }
  }

  /**
   * Validate pagination parameters
   * @param {Object} params - Pagination parameters
   * @returns {Object} Validated and normalized parameters
   * @throws {ValidationError} If parameters are invalid
   */
  static validatePagination(params = {}) {
    if (stryMutAct_9fa48('7424')) {
      {
      }
    } else {
      stryCov_9fa48('7424')
      const { limit, offset } = params
      if (
        stryMutAct_9fa48('7427')
          ? limit === undefined
          : stryMutAct_9fa48('7426')
            ? false
            : stryMutAct_9fa48('7425')
              ? true
              : (stryCov_9fa48('7425', '7426', '7427'), limit !== undefined)
      ) {
        if (stryMutAct_9fa48('7428')) {
          {
          }
        } else {
          stryCov_9fa48('7428')
          const numericLimit = Number(limit)
          if (
            stryMutAct_9fa48('7431')
              ? (isNaN(numericLimit) || numericLimit < 0) && numericLimit > 100
              : stryMutAct_9fa48('7430')
                ? false
                : stryMutAct_9fa48('7429')
                  ? true
                  : (stryCov_9fa48('7429', '7430', '7431'),
                    (stryMutAct_9fa48('7433')
                      ? isNaN(numericLimit) && numericLimit < 0
                      : stryMutAct_9fa48('7432')
                        ? false
                        : (stryCov_9fa48('7432', '7433'),
                          isNaN(numericLimit) ||
                            (stryMutAct_9fa48('7436')
                              ? numericLimit >= 0
                              : stryMutAct_9fa48('7435')
                                ? numericLimit <= 0
                                : stryMutAct_9fa48('7434')
                                  ? false
                                  : (stryCov_9fa48('7434', '7435', '7436'), numericLimit < 0)))) ||
                      (stryMutAct_9fa48('7439')
                        ? numericLimit <= 100
                        : stryMutAct_9fa48('7438')
                          ? numericLimit >= 100
                          : stryMutAct_9fa48('7437')
                            ? false
                            : (stryCov_9fa48('7437', '7438', '7439'), numericLimit > 100)))
          ) {
            if (stryMutAct_9fa48('7440')) {
              {
              }
            } else {
              stryCov_9fa48('7440')
              throw new ValidationError(
                stryMutAct_9fa48('7441')
                  ? ''
                  : (stryCov_9fa48('7441'), 'Limit must be a number between 0 and 100'),
                stryMutAct_9fa48('7442')
                  ? {}
                  : (stryCov_9fa48('7442'),
                    {
                      field: stryMutAct_9fa48('7443') ? '' : (stryCov_9fa48('7443'), 'limit'),
                      received: limit,
                      rule: stryMutAct_9fa48('7444')
                        ? ''
                        : (stryCov_9fa48('7444'), '0 <= limit <= 100')
                    })
              )
            }
          }
          params.limit = numericLimit
        }
      }
      if (
        stryMutAct_9fa48('7447')
          ? offset === undefined
          : stryMutAct_9fa48('7446')
            ? false
            : stryMutAct_9fa48('7445')
              ? true
              : (stryCov_9fa48('7445', '7446', '7447'), offset !== undefined)
      ) {
        if (stryMutAct_9fa48('7448')) {
          {
          }
        } else {
          stryCov_9fa48('7448')
          const numericOffset = Number(offset)
          if (
            stryMutAct_9fa48('7451')
              ? isNaN(numericOffset) && numericOffset < 0
              : stryMutAct_9fa48('7450')
                ? false
                : stryMutAct_9fa48('7449')
                  ? true
                  : (stryCov_9fa48('7449', '7450', '7451'),
                    isNaN(numericOffset) ||
                      (stryMutAct_9fa48('7454')
                        ? numericOffset >= 0
                        : stryMutAct_9fa48('7453')
                          ? numericOffset <= 0
                          : stryMutAct_9fa48('7452')
                            ? false
                            : (stryCov_9fa48('7452', '7453', '7454'), numericOffset < 0)))
          ) {
            if (stryMutAct_9fa48('7455')) {
              {
              }
            } else {
              stryCov_9fa48('7455')
              throw new ValidationError(
                stryMutAct_9fa48('7456')
                  ? ''
                  : (stryCov_9fa48('7456'), 'Offset must be a positive number'),
                stryMutAct_9fa48('7457')
                  ? {}
                  : (stryCov_9fa48('7457'),
                    {
                      field: stryMutAct_9fa48('7458') ? '' : (stryCov_9fa48('7458'), 'offset'),
                      received: offset,
                      rule: stryMutAct_9fa48('7459') ? '' : (stryCov_9fa48('7459'), 'offset >= 0')
                    })
              )
            }
          }
          params.offset = numericOffset
        }
      }
      return params
    }
  }

  /**
   * Sanitize string (remove dangerous characters)
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  static sanitizeString(str) {
    if (stryMutAct_9fa48('7460')) {
      {
      }
    } else {
      stryCov_9fa48('7460')
      if (
        stryMutAct_9fa48('7463')
          ? typeof str === 'string'
          : stryMutAct_9fa48('7462')
            ? false
            : stryMutAct_9fa48('7461')
              ? true
              : (stryCov_9fa48('7461', '7462', '7463'),
                typeof str !== (stryMutAct_9fa48('7464') ? '' : (stryCov_9fa48('7464'), 'string')))
      ) {
        if (stryMutAct_9fa48('7465')) {
          {
          }
        } else {
          stryCov_9fa48('7465')
          return str
        }
      }
      return stryMutAct_9fa48('7466')
        ? str.replace(/[<>'"]/g, '')
        : (stryCov_9fa48('7466'),
          str
            .trim()
            .replace(
              stryMutAct_9fa48('7467') ? /[^<>'"]/g : (stryCov_9fa48('7467'), /[<>'"]/g),
              stryMutAct_9fa48('7468') ? 'Stryker was here!' : (stryCov_9fa48('7468'), '')
            ))
    }
  }
}
export default ValidatorService
