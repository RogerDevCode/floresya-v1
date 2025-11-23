# MANDATORY RULES - READ ON EVERY SESSION START

**⚠️ CRITICAL: Read this file at the beginning of EVERY session and before writing ANY code.**

---

## 🚨 ESLint Rules - NEVER VIOLATE

### Rule 1: ALWAYS use curly braces

```javascript
// ❌ WRONG
if (condition) return value

// ✅ CORRECT
if (condition) {
  return value
}
```

### Rule 2: Use `const` by default

```javascript
// ❌ WRONG
let value = await someFunction()
// value is never reassigned

// ✅ CORRECT
const value = await someFunction()
```

### Rule 3: NO async without await

```javascript
// ❌ WRONG
async function getData() {
  return someValue
}

// ✅ CORRECT
function getData() {
  return someValue
}
```

### Rule 4: Unused variables must start with `_`

```javascript
// ❌ WRONG
try {
  // code
} catch (error) {
  // error not used
}

// ✅ CORRECT
try {
  // code
} catch (_error) {
  // Explicitly ignored
}
```

---

## 📋 Pre-Code Checklist

Before writing ANY code, I MUST:

- [ ] Check if ESLint config exists: `eslint.config.js`
- [ ] Review the rules: `curly`, `prefer-const`, `require-await`, `no-unused-vars`
- [ ] Understand the file structure from CLAUDE.md
- [ ] Identify if it's frontend (public/) or backend (api/)
- [ ] Check MVC layer compliance (Controllers → Services → Database)

---

## ✅ Post-Code Checklist

After writing code, I MUST:

- [ ] Run `npm run lint` to verify ESLint compliance
- [ ] Fix ALL errors and warnings before presenting to user
- [ ] Verify no direct DB access outside services/
- [ ] Check for hardcoded values that should be in .env
- [ ] Ensure all async functions have await statements
- [ ] Confirm all if/for/while have curly braces

---

## 🏗️ Architecture Rules (From CLAUDE.md)

### MVC Strict Flow

```
Routes → Middleware → Controllers → Services → Database
```

**NEVER:**

- ❌ Access database from controllers
- ❌ Import supabaseClient outside api/services/
- ❌ Use silent error handling (empty catch blocks)
- ❌ Use fallback operators (??, ||) on critical operations
- ❌ Skip validation in controllers

**ALWAYS:**

- ✅ Throw specific errors with context
- ✅ Use custom error classes from api/errors/AppError.js
- ✅ Log errors with console.error(error) before re-throwing
- ✅ Implement soft-delete with `active` or `is_active` flags
- ✅ Use fail-fast approach (throw immediately on error)

### Service Layer Rules

```javascript
// ✅ CORRECT Service Pattern
export async function getProductById(id, includeInactive = false) {
  try {
    // 1. Validate inputs (fail-fast)
    if (!id || typeof id !== 'number') {
      throw new BadRequestError('Invalid product ID', { productId: id })
    }

    // 2. Build query
    let query = supabase.from(TABLE).select('*').eq('id', id)
    if (!includeInactive) {
      query = query.eq('active', true)
    }

    // 3. Execute query
    const { data, error } = await query.single()

    // 4. Handle errors (fail-fast)
    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('Product', id)
      }
      throw new DatabaseError('SELECT', TABLE, error, { productId: id })
    }

    // 5. Validate result
    if (!data) {
      throw new NotFoundError('Product', id)
    }

    return data
  } catch (error) {
    // 6. Log and re-throw (NEVER swallow errors)
    console.error(`getProductById(${id}) failed:`, error)
    throw error
  }
}
```

---

## 🎨 Frontend Rules

### DOM Ready Pattern (MANDATORY)

```javascript
import { onDOMReady } from '/js/shared/dom-ready.js'

async function init() {
  try {
    // Initialize logic here
    document.documentElement.classList.add('loaded')
  } catch (error) {
    console.error('Initialization failed:', error)
    throw error
  }
}

onDOMReady(init)
```

**NEVER:**

- ❌ Use `document.addEventListener('DOMContentLoaded')`
- ❌ Use inline JS/CSS (`onclick`, `style=""`)
- ❌ Use `async` attribute on module scripts
- ❌ Direct `fetch()` calls (use api-client.js)

### API Client Usage

```javascript
// ❌ WRONG - Direct fetch
const response = await fetch('/api/products')

// ✅ CORRECT - Use generated client
import { api } from '/js/shared/api-client.js'
const products = await api.getAllProducts()
```

---

## 🔍 Verification Commands

After ANY code changes, run these IN ORDER:

```bash
# 1. ESLint check
npm run lint

# 2. If auto-fix available
npm run lint:fix

# 3. Run tests (if test files exist)
npm test

# 4. Check git status
git status
```

---

## 🚫 Common Mistakes to AVOID

1. **Writing code without checking eslint.config.js first**
2. **Using single-line if statements without braces**
3. **Declaring variables with `let` when `const` is sufficient**
4. **Adding `async` keyword when function has no `await`**
5. **Catching errors without using the error parameter**
6. **Accessing database from controllers or routes**
7. **Using silent fallbacks on critical operations**
8. **Skipping `npm run lint` after writing code**

---

## 📝 Session Start Protocol

When I start a new session or change models:

1. **READ THIS FILE COMPLETELY**
2. Acknowledge: "✅ MANDATORY_RULES.md loaded. ESLint compliance active."
3. Review CLAUDE.md if architectural questions arise
4. Check `git status` to understand current state
5. Ask user for task BEFORE writing any code

---

## 💡 When User Reports ESLint Errors

If user says "fix eslint errors":

1. Run `npm run lint` to see errors
2. Fix ALL errors (not just the first one)
3. Run `npm run lint` again to verify
4. Repeat until exit code is 0
5. NEVER present code with ESLint errors

---

## 🎯 Golden Rule

**"If ESLint would complain, don't write it in the first place."**

Every line of code I generate must pass ESLint on first try.
No exceptions. No excuses.

---

Last Updated: 2025-01-16
Project: FloresYa v1
ESLint Version: 9 (Flat Config)
