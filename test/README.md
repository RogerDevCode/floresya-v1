# 🧪 Test Directory

Tests unitarios e integración para FloresYa v1.

## 📁 Estructura

```
test/
├── controllers/        # Tests de controladores
│   └── mocks/         # Mocks para controllers
├── integration/       # Tests de integración
├── middleware/        # Tests de middleware
├── repositories/      # Tests de repositorios
├── services/          # Tests de servicios
├── supabase-client/   # Tests de Supabase client
├── setup.js          # Configuración global de tests
└── *.test.js         # Tests individuales
```

## 🚀 Ejecutar Tests

### Todos los tests
```bash
npm test
```

### Tests específicos por categoría
```bash
# Middleware
npm test test/middleware

# Repositories
npm test test/repositories

# Services
npm test test/services

# Integration
npm test test/integration
```

### Tests individuales
```bash
npm test test/services/productService.test.js
```

## 📊 Categorías de Tests

### Middleware (7 tests)
- `advancedValidation.amount.test.js` - Validación de montos
- `advancedValidation.email.test.js` - Validación de emails
- `globalSanitize.test.js` - Sanitización global
- `performanceMonitor.test.js` - Monitoreo de performance
- `responseStandard.test.js` - Estandarización de respuestas
- `sanitize.test.js` - Sanitización de inputs
- `securityAudit.test.js` - Auditoría de seguridad

### Repositories (10 tests)
- `baseRepository.test.js` - Repositorio base
- `occasionRepository.test.js` - Repositorio de ocasiones
- `orderRepository.test.js` - Repositorio de órdenes
- `paymentMethodRepository.test.js` - Métodos de pago
- `paymentRepository.test.js` - Repositorio de pagos
- `productImageRepository.test.js` - Imágenes de productos
- `productRepository.test.js` - Repositorio de productos
- `settingsRepository.test.js` - Configuraciones
- `userRepository.test.js` - Repositorio de usuarios
- `setup.js` - Configuración de repositorios

### Services (14 tests)
- `authService.test.js` - Autenticación
- `carouselService.test.js` - Carrusel de imágenes
- `migrationService.test.js` - Migraciones
- `occasionService.test.js` - Servicio de ocasiones
- `orderService.test.js` - Servicio de órdenes
- `orderStatusService.test.js` - Estados de órdenes
- `paymentMethodService.test.js` - Métodos de pago
- `paymentService.test.js` - Servicio de pagos
- `productImageService.test.js` - Imágenes de productos
- `productService.test.js` - Servicio de productos
- `settingsService.test.js` - Configuraciones
- `supabaseStorageService.test.js` - Almacenamiento en Supabase
- `userService.test.js` - Servicio de usuarios
- `setup.js` - Configuración de servicios

### Integration (2 tests)
- `cross-service-workflows.test.js` - Flujos entre servicios
- `performance-stress-tests.test.js` - Tests de estrés

### Supabase Client (2 tests)
- `supabaseClient.test.js` - Cliente de Supabase
- `mocks/mocks.js` - Mocks para Supabase

## 🛠️ Configuración

### Setup Global
El archivo `setup.js` configura el entorno de pruebas global.

### Setup por Categoría
Cada categoría (repositories, services) tiene su propio `setup.js` para configuraciones específicas.

## 📋 Convenciones

### Nomenclatura
- Tests unitarios: `*.test.js`
- Mocks: `mocks/*.js`
- Setup: `setup.js`

### Estructura de Tests
```javascript
describe('Componente/Función', () => {
  beforeEach(() => {
    // Setup antes de cada test
  })

  it('should do something', () => {
    // Test case
    expect(result).toBe(expected)
  })

  afterEach(() => {
    // Cleanup después de cada test
  })
})
```

## 🔍 Coverage

Para generar reporte de cobertura:
```bash
npm run test:coverage
```

## 📝 Notas

- Los tests usan **Vitest** como test runner
- Los mocks se encuentran en subcarpetas `mocks/`
- Cada test debe ser independiente
- Los tests de integración requieren configuración de Supabase

## 📚 Documentación Adicional

- [MIGRATION_REPORT.md](./MIGRATION_REPORT.md) - Reporte de migración desde refinery/test

---

**Última actualización**: 2025-11-18  
**Total tests**: 38 archivos
