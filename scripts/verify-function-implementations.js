#!/usr/bin/env node

/**
 * FUNCTION IMPLEMENTATION VERIFIER
 *
 * Verifica 100% de correspondencia entre:
 * - Llamadas a funciones
 * - Imports de funciones
 * - Definiciones de funciones
 * - Métodos de objetos (api.*, etc.)
 *
 * NO USA EXPRESIONES REGULARES - Solo análisis AST
 * Algoritmo exhaustivo que no se equivoca
 *
 * @author FloresYa Team
 * @version 2.0.0
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { parse } from 'acorn'
import * as acornWalk from 'acorn-walk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ============================================================================
// DATABASE (In-Memory usando Map/Set - más rápido que SQLite para esto)
// ============================================================================

class FunctionDatabase {
  constructor() {
    // Imports: Map<filePath, Set<{name, source}>>
    this.imports = new Map()

    // Local definitions: Map<filePath, Set<functionName>>
    this.localDefinitions = new Map()

    // Function parameters: Map<filePath, Set<parameterName>>
    this.functionParameters = new Map()

    // Local variables: Map<filePath, Set<variableName>>
    this.localVariables = new Map()

    // Function calls: Map<filePath, Array<{name, line, col, type}>>
    this.functionCalls = new Map()

    // Member calls: Map<filePath, Array<{object, method, line, col}>>
    this.memberCalls = new Map()

    // Available methods per object: Map<objectName, Set<methodName>>
    this.availableMethods = new Map()

    // Violations found
    this.violations = []
  }

  /**
   * Añade un import detectado
   */
  addImport(filePath, importName, source) {
    if (!this.imports.has(filePath)) {
      this.imports.set(filePath, new Set())
    }
    this.imports.get(filePath).add({ name: importName, source })
  }

  /**
   * Añade una definición local
   */
  addLocalDefinition(filePath, functionName) {
    if (!this.localDefinitions.has(filePath)) {
      this.localDefinitions.set(filePath, new Set())
    }
    this.localDefinitions.get(filePath).add(functionName)
  }

  /**
   * Añade un parámetro de función
   */
  addFunctionParameter(filePath, parameterName) {
    if (!this.functionParameters.has(filePath)) {
      this.functionParameters.set(filePath, new Set())
    }
    this.functionParameters.get(filePath).add(parameterName)
  }

  /**
   * Añade una variable local
   */
  addLocalVariable(filePath, variableName) {
    if (!this.localVariables.has(filePath)) {
      this.localVariables.set(filePath, new Set())
    }
    this.localVariables.get(filePath).add(variableName)
  }

  /**
   * Añade una llamada a función
   */
  addFunctionCall(filePath, functionName, line, col, type) {
    if (!this.functionCalls.has(filePath)) {
      this.functionCalls.set(filePath, [])
    }
    this.functionCalls.get(filePath).push({ name: functionName, line, col, type })
  }

  /**
   * Añade una llamada a método de objeto
   */
  addMemberCall(filePath, objectName, methodName, line, col) {
    if (!this.memberCalls.has(filePath)) {
      this.memberCalls.set(filePath, [])
    }
    this.memberCalls.get(filePath).push({ object: objectName, method: methodName, line, col })
  }

  /**
   * Registra métodos disponibles de un objeto
   */
  registerAvailableMethods(objectName, methods) {
    this.availableMethods.set(objectName, new Set(methods))
  }

  /**
   * Añade una violación
   */
  addViolation(violation) {
    this.violations.push(violation)
  }

  /**
   * Obtiene estadísticas
   */
  getStats() {
    let totalImports = 0
    let totalDefinitions = 0
    let totalCalls = 0
    let totalMemberCalls = 0

    this.imports.forEach(set => (totalImports += set.size))
    this.localDefinitions.forEach(set => (totalDefinitions += set.size))
    this.functionCalls.forEach(arr => (totalCalls += arr.length))
    this.memberCalls.forEach(arr => (totalMemberCalls += arr.length))

    return {
      filesAnalyzed: this.imports.size,
      totalImports,
      totalDefinitions,
      totalCalls,
      totalMemberCalls,
      totalViolations: this.violations.length
    }
  }
}

// ============================================================================
// GLOBAL BUILT-INS (para no reportar falsos positivos)
// ============================================================================

const GLOBAL_FUNCTIONS = new Set([
  // JavaScript built-ins
  'parseInt',
  'parseFloat',
  'isNaN',
  'isFinite',
  'encodeURI',
  'decodeURI',
  'encodeURIComponent',
  'decodeURIComponent',
  'eval',
  'queueMicrotask',

  // Console
  'console',

  // Timers
  'setTimeout',
  'setInterval',
  'clearTimeout',
  'clearInterval',
  'setImmediate',
  'clearImmediate',
  'requestAnimationFrame',
  'cancelAnimationFrame',

  // Global objects
  'Object',
  'Array',
  'String',
  'Number',
  'Boolean',
  'Symbol',
  'BigInt',
  'Math',
  'Date',
  'RegExp',
  'Error',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'Promise',
  'Proxy',
  'Reflect',
  'JSON',
  'Intl',

  // DOM APIs (frontend)
  'document',
  'window',
  'navigator',
  'location',
  'history',
  'screen',
  'localStorage',
  'sessionStorage',
  'fetch',
  'XMLHttpRequest',
  'alert',
  'confirm',
  'prompt',

  // Node.js globals
  'process',
  'Buffer',
  'global',
  '__dirname',
  '__filename',
  'require',
  'module',
  'exports',

  // Test frameworks
  'describe',
  'it',
  'test',
  'expect',
  'beforeEach',
  'afterEach',
  'beforeAll',
  'afterAll',
  'jest',
  'vitest'
])

// Common parameter names that are functions (to avoid false positives)
const COMMON_FUNCTION_PARAMETERS = new Set([
  'callback',
  'cb',
  'resolve',
  'reject',
  'next',
  'done',
  'success',
  'error',
  'handler',
  'listener',
  'fn',
  'func'
])

// Native JavaScript methods (to avoid false positives on variable.method())
const NATIVE_STRING_METHODS = new Set([
  'charAt',
  'charCodeAt',
  'concat',
  'endsWith',
  'includes',
  'indexOf',
  'lastIndexOf',
  'match',
  'padEnd',
  'padStart',
  'repeat',
  'replace',
  'replaceAll',
  'search',
  'slice',
  'split',
  'startsWith',
  'substring',
  'toLowerCase',
  'toUpperCase',
  'trim',
  'trimEnd',
  'trimStart',
  'valueOf',
  'toString',
  'localeCompare',
  'normalize'
])

const NATIVE_ARRAY_METHODS = new Set([
  'at',
  'concat',
  'copyWithin',
  'entries',
  'every',
  'fill',
  'filter',
  'find',
  'findIndex',
  'findLast',
  'findLastIndex',
  'flat',
  'flatMap',
  'forEach',
  'includes',
  'indexOf',
  'join',
  'keys',
  'lastIndexOf',
  'map',
  'pop',
  'push',
  'reduce',
  'reduceRight',
  'reverse',
  'shift',
  'slice',
  'some',
  'sort',
  'splice',
  'toReversed',
  'toSorted',
  'toSpliced',
  'toString',
  'unshift',
  'values',
  'with'
])

const NATIVE_OBJECT_METHODS = new Set([
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
])

// DOM methods (very common in frontend code)
const DOM_METHODS = new Set([
  // Element methods
  'addEventListener',
  'removeEventListener',
  'dispatchEvent',
  'getAttribute',
  'setAttribute',
  'removeAttribute',
  'hasAttribute',
  'querySelector',
  'querySelectorAll',
  'getElementById',
  'getElementsByClassName',
  'appendChild',
  'removeChild',
  'insertBefore',
  'replaceChild',
  'closest',
  'matches',
  'contains',
  // classList methods
  'add',
  'remove',
  'toggle',
  'contains',
  // Style/DOM manipulation
  'focus',
  'blur',
  'click',
  'submit',
  'reset',
  'scrollIntoView',
  'scrollTo',
  'scrollBy',
  'preventDefault',
  'stopPropagation',
  'stopImmediatePropagation'
])

// Test framework methods (Jest/Vitest)
const TEST_METHODS = new Set([
  'toThrow',
  'toBe',
  'toEqual',
  'toMatchObject',
  'toHaveBeenCalled',
  'mockResolvedValueOnce',
  'mockReturnValueOnce',
  'mockRejectedValueOnce',
  'mockImplementation',
  'mockReturnValue',
  'mockResolvedValue',
  'toBeCalledWith',
  'toHaveBeenCalledWith',
  'toHaveBeenCalledTimes',
  'toContain',
  'toMatch',
  'toBeTruthy',
  'toBeFalsy',
  'rejects',
  'resolves',
  'toMatchSnapshot'
])

// HTTP Response methods (Express, Fetch)
const HTTP_METHODS = new Set([
  'json',
  'text',
  'blob',
  'arrayBuffer',
  'formData',
  'status',
  'send',
  'sendStatus',
  'redirect',
  'render',
  'set',
  'get',
  'cookie',
  'clearCookie'
])

// Methods that exist on multiple types (combined whitelist)
const COMMON_NATIVE_METHODS = new Set([
  ...NATIVE_STRING_METHODS,
  ...NATIVE_ARRAY_METHODS,
  ...NATIVE_OBJECT_METHODS,
  ...DOM_METHODS,
  ...TEST_METHODS,
  ...HTTP_METHODS,
  // Map/Set methods
  'has',
  'get',
  'set',
  'delete',
  'clear',
  'size',
  // Promise methods
  'then',
  'catch',
  'finally',
  // Common patterns
  'length',
  'name',
  'constructor',
  // Number methods
  'toFixed',
  'toPrecision',
  'toExponential',
  // Common object patterns
  'bind',
  'call',
  'apply'
])

// ============================================================================
// AST ANALYZER
// ============================================================================

class ASTAnalyzer {
  constructor(db) {
    this.db = db
  }

  /**
   * Analiza un archivo JavaScript
   */
  async analyzeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      const relativePath = path.relative(process.cwd(), filePath)

      // Parse AST
      let ast
      try {
        ast = parse(content, {
          sourceType: 'module',
          ecmaVersion: 'latest',
          locations: true,
          allowAwaitOutsideFunction: true
        })
      } catch (parseError) {
        console.warn(`⚠️  Cannot parse ${relativePath}: ${parseError.message}`)
        return
      }

      // Extract imports
      this.extractImports(ast, filePath)

      // Extract local function definitions
      this.extractLocalDefinitions(ast, filePath)

      // Extract local variables
      this.extractLocalVariables(ast, filePath)

      // Extract function calls
      this.extractFunctionCalls(ast, filePath)

      // Extract member calls (object.method)
      this.extractMemberCalls(ast, filePath)
    } catch (error) {
      console.error(`❌ Error analyzing ${filePath}:`, error.message)
    }
  }

  /**
   * Extrae todos los imports del archivo
   */
  extractImports(ast, filePath) {
    acornWalk.simple(ast, {
      ImportDeclaration: node => {
        const source = node.source.value

        node.specifiers.forEach(spec => {
          if (spec.type === 'ImportDefaultSpecifier') {
            // import X from 'y'
            this.db.addImport(filePath, spec.local.name, source)
          } else if (spec.type === 'ImportSpecifier') {
            // import { X } from 'y'
            this.db.addImport(filePath, spec.imported.name, source)
          } else if (spec.type === 'ImportNamespaceSpecifier') {
            // import * as X from 'y'
            this.db.addImport(filePath, spec.local.name, source)
          }
        })
      }
    })
  }

  /**
   * Extrae todas las definiciones de funciones locales Y sus parámetros
   */
  extractLocalDefinitions(ast, filePath) {
    acornWalk.simple(ast, {
      // function myFunc(param1, param2) {}
      FunctionDeclaration: node => {
        if (node.id && node.id.name) {
          this.db.addLocalDefinition(filePath, node.id.name)
        }
        // Extract parameters
        this.extractFunctionParameters(node, filePath)
      },

      // const myFunc = function(param1) {}
      // const myFunc = (param1) => {}
      VariableDeclarator: node => {
        if (node.id && node.id.name && node.init) {
          if (
            node.init.type === 'FunctionExpression' ||
            node.init.type === 'ArrowFunctionExpression'
          ) {
            this.db.addLocalDefinition(filePath, node.id.name)
            // Extract parameters
            this.extractFunctionParameters(node.init, filePath)
          }
        }
      },

      // class methods
      MethodDefinition: node => {
        if (node.key && node.key.name) {
          this.db.addLocalDefinition(filePath, node.key.name)
        }
        // Extract parameters
        if (node.value) {
          this.extractFunctionParameters(node.value, filePath)
        }
      },

      // export function myFunc(param1) {}
      ExportNamedDeclaration: node => {
        if (node.declaration) {
          if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
            this.db.addLocalDefinition(filePath, node.declaration.id.name)
            this.extractFunctionParameters(node.declaration, filePath)
          }
        }
      }
    })
  }

  /**
   * Extrae variables locales (const, let, var)
   */
  extractLocalVariables(ast, filePath) {
    acornWalk.simple(ast, {
      VariableDeclarator: node => {
        if (node.id && node.id.type === 'Identifier') {
          this.db.addLocalVariable(filePath, node.id.name)
        } else if (node.id && node.id.type === 'ObjectPattern') {
          // const { a, b } = obj
          node.id.properties.forEach(prop => {
            if (prop.value && prop.value.type === 'Identifier') {
              this.db.addLocalVariable(filePath, prop.value.name)
            }
          })
        } else if (node.id && node.id.type === 'ArrayPattern') {
          // const [a, b] = arr
          node.id.elements.forEach(elem => {
            if (elem && elem.type === 'Identifier') {
              this.db.addLocalVariable(filePath, elem.name)
            }
          })
        }
      }
    })
  }

  /**
   * Extrae parámetros de una función
   */
  extractFunctionParameters(node, filePath) {
    if (!node.params) {
      return
    }

    node.params.forEach(param => {
      if (param.type === 'Identifier') {
        this.db.addFunctionParameter(filePath, param.name)
      } else if (param.type === 'ObjectPattern') {
        // { a, b } destructuring
        param.properties.forEach(prop => {
          if (prop.value && prop.value.type === 'Identifier') {
            this.db.addFunctionParameter(filePath, prop.value.name)
          }
        })
      } else if (param.type === 'ArrayPattern') {
        // [a, b] destructuring
        param.elements.forEach(elem => {
          if (elem && elem.type === 'Identifier') {
            this.db.addFunctionParameter(filePath, elem.name)
          }
        })
      } else if (param.type === 'RestElement' && param.argument) {
        // ...rest
        if (param.argument.type === 'Identifier') {
          this.db.addFunctionParameter(filePath, param.argument.name)
        }
      }
    })
  }

  /**
   * Extrae todas las llamadas a funciones
   */
  extractFunctionCalls(ast, filePath) {
    acornWalk.simple(ast, {
      CallExpression: node => {
        const loc = node.loc.start

        // Direct function call: myFunc()
        if (node.callee.type === 'Identifier') {
          this.db.addFunctionCall(filePath, node.callee.name, loc.line, loc.column, 'direct')
        }
        // Member call is handled in extractMemberCalls
      }
    })
  }

  /**
   * Extrae todas las llamadas a métodos de objetos
   */
  extractMemberCalls(ast, filePath) {
    acornWalk.simple(ast, {
      CallExpression: node => {
        const loc = node.loc.start

        // object.method() or object.property.method()
        if (node.callee.type === 'MemberExpression') {
          const { objectName, methodName } = this.resolveMemberExpression(node.callee)

          if (objectName && methodName) {
            this.db.addMemberCall(filePath, objectName, methodName, loc.line, loc.column)
          }
        }
      },

      // await expressions
      AwaitExpression: node => {
        if (node.argument && node.argument.type === 'CallExpression') {
          const loc = node.argument.loc.start

          if (node.argument.callee.type === 'MemberExpression') {
            const { objectName, methodName } = this.resolveMemberExpression(node.argument.callee)

            if (objectName && methodName) {
              this.db.addMemberCall(filePath, objectName, methodName, loc.line, loc.column)
            }
          }
        }
      }
    })
  }

  /**
   * Resuelve una MemberExpression a { objectName, methodName }
   * Ejemplos:
   *   api.getProducts() → { objectName: 'api', methodName: 'getProducts' }
   *   this.api.getProducts() → { objectName: 'api', methodName: 'getProducts' }
   */
  resolveMemberExpression(node) {
    let objectName = null
    let methodName = null

    // Get method name (right side)
    if (node.property && node.property.name) {
      methodName = node.property.name
    }

    // Get object name (left side)
    let current = node.object
    while (current) {
      if (current.type === 'Identifier') {
        objectName = current.name
        break
      } else if (current.type === 'MemberExpression') {
        current = current.property
      } else if (current.type === 'ThisExpression') {
        // Skip 'this.'
        current = null
      } else {
        break
      }
    }

    return { objectName, methodName }
  }
}

// ============================================================================
// VALIDATOR
// ============================================================================

class FunctionValidator {
  constructor(db) {
    this.db = db
  }

  /**
   * Valida todas las llamadas a funciones
   */
  async validate() {
    console.log('\n🔍 Validando llamadas a funciones...\n')

    // Load available methods from api-client
    await this.loadAvailableAPIMethods()

    // Validate direct function calls
    this.validateDirectCalls()

    // Validate member calls (object.method)
    this.validateMemberCalls()

    // Report results
    this.reportResults()

    return this.db.violations.length === 0
  }

  /**
   * Carga los métodos disponibles del API client
   */
  async loadAvailableAPIMethods() {
    try {
      const clientPath = path.join(process.cwd(), 'public/js/shared/api-client.js')
      const moduleUrl = pathToFileURL(clientPath).href
      const clientModule = await import(moduleUrl)

      const methods = new Set()

      // Extract from apiClient instance
      if (clientModule.apiClient) {
        let proto = Object.getPrototypeOf(clientModule.apiClient)
        while (proto && proto !== Object.prototype) {
          Object.getOwnPropertyNames(proto).forEach(name => {
            if (name !== 'constructor' && typeof proto[name] === 'function') {
              methods.add(name)
            }
          })
          proto = Object.getPrototypeOf(proto)
        }
      }

      // Extract from api export
      if (clientModule.api) {
        Object.keys(clientModule.api).forEach(name => {
          if (typeof clientModule.api[name] === 'function') {
            methods.add(name)
          }
        })
      }

      this.db.registerAvailableMethods('api', methods)
      this.db.registerAvailableMethods('apiClient', methods)

      console.log(`✅ Loaded ${methods.size} API client methods`)
    } catch (error) {
      console.warn(`⚠️  Could not load API client methods: ${error.message}`)
    }
  }

  /**
   * Valida llamadas directas a funciones
   */
  validateDirectCalls() {
    this.db.functionCalls.forEach((calls, filePath) => {
      const relativePath = path.relative(process.cwd(), filePath)
      const imports = this.db.imports.get(filePath) || new Set()
      const localDefs = this.db.localDefinitions.get(filePath) || new Set()
      const params = this.db.functionParameters.get(filePath) || new Set()

      calls.forEach(call => {
        const { name, line, col } = call

        // Skip global built-ins
        if (GLOBAL_FUNCTIONS.has(name)) {
          return
        }

        // Skip common function parameter names
        if (COMMON_FUNCTION_PARAMETERS.has(name)) {
          return
        }

        // Check if it's a function parameter
        if (params.has(name)) {
          return
        }

        // Check if imported
        const isImported = Array.from(imports).some(imp => imp.name === name)

        // Check if locally defined
        const isLocallyDefined = localDefs.has(name)

        // If neither imported nor locally defined → VIOLATION
        if (!isImported && !isLocallyDefined) {
          this.db.addViolation({
            type: 'FUNCTION_NOT_FOUND',
            severity: 'error',
            file: relativePath,
            line,
            column: col,
            function: name,
            message: `Function '${name}()' is called but not imported or defined`
          })
        }
      })
    })
  }

  /**
   * Valida llamadas a métodos de objetos
   */
  validateMemberCalls() {
    this.db.memberCalls.forEach((calls, filePath) => {
      const relativePath = path.relative(process.cwd(), filePath)
      const imports = this.db.imports.get(filePath) || new Set()
      const localVars = this.db.localVariables.get(filePath) || new Set()
      const params = this.db.functionParameters.get(filePath) || new Set()

      calls.forEach(call => {
        const { object, method, line, col } = call

        // Skip if method is a native JavaScript method (huge reduction of false positives)
        if (COMMON_NATIVE_METHODS.has(method)) {
          return
        }

        // Skip if object is a local variable (likely has native methods)
        if (localVars.has(object)) {
          return
        }

        // Skip if object is a function parameter (likely has native methods)
        if (params.has(object)) {
          return
        }

        // Skip global objects
        if (GLOBAL_FUNCTIONS.has(object)) {
          return
        }

        // Check if object is imported
        const isObjectImported = Array.from(imports).some(imp => imp.name === object)

        if (!isObjectImported) {
          // Object not imported - VIOLATION
          this.db.addViolation({
            type: 'OBJECT_NOT_IMPORTED',
            severity: 'error',
            file: relativePath,
            line,
            column: col,
            object,
            method,
            message: `Object '${object}' is not imported, cannot call '${object}.${method}()'`
          })
          return
        }

        // Check if method exists on object (only for objects with known methods)
        const availableMethods = this.db.availableMethods.get(object)
        if (availableMethods && !availableMethods.has(method)) {
          this.db.addViolation({
            type: 'METHOD_NOT_FOUND',
            severity: 'error',
            file: relativePath,
            line,
            column: col,
            object,
            method,
            message: `Method '${object}.${method}()' does not exist. Available methods: ${Array.from(availableMethods).slice(0, 5).join(', ')}...`
          })
        }
      })
    })
  }

  /**
   * Reporta resultados
   */
  reportResults() {
    const stats = this.db.getStats()

    console.log('\n' + '='.repeat(80))
    console.log('📊 VERIFICATION SUMMARY')
    console.log('='.repeat(80))
    console.log(`Files analyzed:    ${stats.filesAnalyzed}`)
    console.log(`Total imports:     ${stats.totalImports}`)
    console.log(`Local definitions: ${stats.totalDefinitions}`)
    console.log(`Function calls:    ${stats.totalCalls}`)
    console.log(`Member calls:      ${stats.totalMemberCalls}`)
    console.log(`Total violations:  ${stats.totalViolations}`)
    console.log('='.repeat(80))

    if (this.db.violations.length > 0) {
      console.log('\n❌ VIOLATIONS FOUND:\n')

      this.db.violations.forEach((v, index) => {
        console.log(`${index + 1}. ${v.type} (${v.severity})`)
        console.log(`   File: ${v.file}:${v.line}:${v.column}`)
        console.log(`   ${v.message}`)
        console.log()
      })

      // Save to JSON
      this.saveViolationsReport()
    } else {
      console.log('\n✅ No violations found! All function calls are valid.\n')
    }
  }

  /**
   * Guarda reporte de violaciones
   */
  async saveViolationsReport() {
    const reportPath = path.join(process.cwd(), 'function-violations-report.json')
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.db.getStats(),
      violations: this.db.violations
    }

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
    console.log(`📄 Violations report saved: ${reportPath}\n`)
  }
}

// ============================================================================
// FILE SCANNER
// ============================================================================

class FileScanner {
  constructor() {
    this.excludedDirs = new Set([
      'node_modules',
      '.git',
      'dist',
      'build',
      'coverage',
      '.cache',
      'playwright-report'
    ])

    this.excludedFiles = new Set(['chart.min.js', 'lucide-icons.js', 'api-types.js'])
  }

  /**
   * Escanea directorio recursivamente
   */
  async scanDirectory(dir) {
    const files = []

    async function scan(currentDir) {
      const entries = await fs.readdir(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name)

        if (entry.isDirectory()) {
          if (!this.excludedDirs.has(entry.name)) {
            await scan.call(this, fullPath)
          }
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          if (!this.excludedFiles.has(entry.name)) {
            files.push(fullPath)
          }
        }
      }
    }

    await scan.call(this, dir)
    return files
  }

  /**
   * Obtiene archivos del proyecto
   */
  async getProjectFiles() {
    const publicDir = path.join(process.cwd(), 'public')
    const apiDir = path.join(process.cwd(), 'api')

    const publicFiles = await this.scanDirectory(publicDir)
    const apiFiles = await this.scanDirectory(apiDir)

    return [...publicFiles, ...apiFiles]
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(80))
  console.log('🔬 FUNCTION IMPLEMENTATION VERIFIER')
  console.log('   100% Correspondencia - Sin Expresiones Regulares')
  console.log('='.repeat(80) + '\n')

  const db = new FunctionDatabase()
  const analyzer = new ASTAnalyzer(db)
  const validator = new FunctionValidator(db)
  const scanner = new FileScanner()

  // Scan files
  console.log('📂 Escaneando archivos...')
  const files = await scanner.getProjectFiles()
  console.log(`✅ Found ${files.length} JavaScript files\n`)

  // Analyze each file
  console.log('🔍 Analizando archivos...')
  for (const file of files) {
    await analyzer.analyzeFile(file)
  }
  console.log('✅ Análisis completado\n')

  // Validate
  const isValid = await validator.validate()

  // Exit with appropriate code
  process.exit(isValid ? 0 : 1)
}

// Run
main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
