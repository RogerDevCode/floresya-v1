# Linting & Formatting Configuration

## Filosofía: Separación de Responsabilidades

- **ESLint**: Code quality & errores lógicos
- **Prettier**: Code formatting (estilo, espacios, comillas)

**Sin solapamientos, sin conflictos.**

---

## ESLint 9 (Flat Config)

### Responsabilidad

Detectar errores de código, malas prácticas y problemas lógicos.

### Configuración

Archivo: `eslint.config.js`

### Reglas activas (solo code quality)

```javascript
{
  // Best Practices
  'no-unused-vars': 'warn',      // Variables sin usar
  'no-console': 'off',            // Permitido en backend
  'prefer-const': 'error',        // Usar const cuando sea posible
  'no-var': 'error',              // Prohibir var
  'eqeqeq': 'error',              // Siempre usar === / !==
  'curly': 'error',               // Siempre usar llaves en if/for/while

  // Error Detection
  'no-undef': 'error',            // Variables no definidas
  'no-unreachable': 'error',      // Código inalcanzable
  'no-dupe-keys': 'error',        // Claves duplicadas en objetos
  'no-duplicate-imports': 'error', // Imports duplicados
  'no-self-compare': 'error',     // Comparaciones de sí mismo
  'no-throw-literal': 'error',    // Lanzar solo Errors
  'no-useless-return': 'warn',    // Returns innecesarios
  'require-await': 'warn',        // async sin await
  'no-implicit-globals': 'error'  // Evitar globales implícitas
}
```

### Scripts

```bash
npm run lint          # Check code quality
npm run lint:fix      # Auto-fix issues
```

### Archivos ignorados

```javascript
ignores: [
  'dist/',
  'node_modules/',
  'public/css/tailwind.css', // Generated file
  '*.config.js',
  'test-*.js' // Test files (optional)
]
```

---

## Prettier (Formatting Only)

### Responsabilidad

Formatear código automáticamente (indentación, comillas, espacios, punto y coma).

### Configuración

Archivo: `.prettierrc`

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": false,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css"
}
```

### Scripts

```bash
npm run format         # Auto-format all files
npm run format:check   # Check formatting (CI)
```

### Archivos ignorados

Archivo: `.prettierignore`

```
node_modules/
dist/
build/
.vercel/
public/css/tailwind.css
*.log
package-lock.json
*.min.js
*.min.css
.env
```

---

## Husky + lint-staged (Pre-commit Hook)

### Configuración

Archivo: `package.json`

```json
{
  "lint-staged": {
    "*.{js,css,json,md,html}": ["prettier --write"],
    "*.js": ["eslint --fix"]
  }
}
```

### Flujo en pre-commit

1. Detecta archivos staged (por tipo)
2. Ejecuta Prettier en `*.{js,css,json,md,html}`
3. Ejecuta ESLint en `*.js`
4. Si hay errores críticos (errors), bloquea el commit
5. Si hay warnings, permite commit pero los reporta

---

## Comparación: ¿Qué hace cada uno?

| Feature                  | ESLint | Prettier |
| ------------------------ | ------ | -------- |
| **Indentación**          | ❌     | ✅       |
| **Comillas**             | ❌     | ✅       |
| **Punto y coma**         | ❌     | ✅       |
| **Espacios**             | ❌     | ✅       |
| **Llaves (brace-style)** | ❌     | ✅       |
| **Trailing commas**      | ❌     | ✅       |
| **Variables sin usar**   | ✅     | ❌       |
| **=== vs ==**            | ✅     | ❌       |
| **const vs let/var**     | ✅     | ❌       |
| **Errores lógicos**      | ✅     | ❌       |
| **Código inalcanzable**  | ✅     | ❌       |
| **Imports duplicados**   | ✅     | ❌       |

---

## Ejemplos

### ESLint detecta errores lógicos

```javascript
// ❌ ESLint error: eqeqeq
if (product.id == '123') { ... }

// ✅ Correcto
if (product.id === 123) { ... }
```

```javascript
// ❌ ESLint error: no-var
var count = 0

// ✅ Correcto
const count = 0
```

```javascript
// ❌ ESLint error: curly
if (found) return true

// ✅ Correcto
if (found) {
  return true
}
```

### Prettier formatea código automáticamente

```javascript
// Antes (inconsistente)
const product = { name: 'Rosa', price: 20 }
function getProduct(id) {
  return products.find(p => p.id === id)
}

// Después (npm run format)
const product = { name: 'Rosa', price: 20 }
function getProduct(id) {
  return products.find(p => p.id === id)
}
```

---

## Workflow Completo

### Durante desarrollo

```bash
# Formatear código manualmente
npm run format

# Verificar errores de código
npm run lint
```

### En pre-commit (automático)

```bash
git add .
git commit -m "feat: add product carousel"

# Husky ejecuta automáticamente:
# 1. Prettier formatea archivos staged
# 2. ESLint verifica errores en archivos staged
# 3. Si hay errores críticos → commit bloqueado
# 4. Si solo warnings → commit permitido
```

### En CI/CD (GitHub Actions, Vercel)

```bash
# Verificar formatting
npm run format:check

# Verificar code quality
npm run lint

# Si falla alguno → build bloqueado
```

---

## Reglas importantes

### ✅ Hacer

- Ejecutar `npm run format` antes de commit
- Leer warnings de ESLint (aunque no bloqueen)
- Configurar IDE para auto-format on save (Prettier)
- Respetar las reglas configuradas

### ❌ NO hacer

- Ignorar warnings de ESLint con `// eslint-disable`
- Modificar `.prettierrc` sin consenso del equipo
- Agregar reglas de formatting a ESLint
- Agregar reglas de code quality a Prettier
- Desactivar Husky hooks sin razón

---

## Integración con IDE

### VS Code

Instalar extensiones:

- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)

Configurar `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Troubleshooting

### Prettier y ESLint entran en conflicto

**Solución**: Verificar que ESLint no tenga reglas de formatting (indent, quotes, semi, etc.). Solo debe tener reglas de code quality.

### Prettier no formatea un archivo

**Solución**: Verificar que el archivo no esté en `.prettierignore`.

### ESLint reporta errores en archivos generados

**Solución**: Agregar el archivo a `ignores` en `eslint.config.js`.

### Pre-commit hook muy lento

**Solución**: `lint-staged` solo procesa archivos staged, no todo el proyecto. Si sigue lento, revisar número de archivos en staging.

---

## Resumen

- **ESLint**: Code quality (errores, malas prácticas)
- **Prettier**: Code formatting (estilo, espacios)
- **Husky**: Pre-commit hooks (automático)
- **lint-staged**: Solo procesa archivos staged

**Sin solapamientos. Sin conflictos. Sin problemas.**
