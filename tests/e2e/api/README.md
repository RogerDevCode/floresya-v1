# API E2E Tests

Tests de extremo a extremo para validar los endpoints críticos de la API FloresYa.

## 📋 Endpoints Críticos Cubiertos

### 1. **Orders** (Más crítico)

- ✅ `POST /api/orders` - Crear orden completa
- ✅ `GET /api/orders` - Listar órdenes (admin)
- ✅ `GET /api/orders/:id` - Obtener orden por ID
- ✅ `PATCH /api/orders/:id/status` - Actualizar status
- ✅ `PATCH /api/orders/:id/cancel` - Cancelar orden

### 2. **Products**

- ✅ `GET /api/products` - Listar productos
- ✅ `GET /api/products/:id` - Obtener producto
- ✅ `POST /api/products` - Crear producto (admin)
- ✅ `PUT /api/products/:id` - Actualizar producto (admin)
- ✅ `DELETE /api/products/:id` - Eliminar producto (admin)

### 3. **Payments**

- ✅ `POST /api/payments/:id/confirm` - Confirmar pago

### 4. **Payment Methods**

- ✅ `GET /api/payment-methods` - Listar métodos de pago
- ✅ `POST /api/payment-methods` - Crear método (admin)
- ✅ `PUT /api/payment-methods/:id` - Actualizar método (admin)

### 5. **Users**

- ✅ `GET /api/users` - Listar usuarios (admin)
- ✅ `POST /api/users` - Crear usuario
- ✅ `GET /api/users/:id` - Obtener usuario

## 🎯 Prioridad de Tests

### Alta Prioridad (Business Critical)

1. **Order Creation Flow** - Flujo completo de creación de orden
2. **Payment Confirmation** - Confirmar pago de orden
3. **Order Status Updates** - Cambios de status de órdenes
4. **Product CRUD** - Operaciones básicas de productos

### Media Prioridad

1. **Payment Methods Management** - CRUD de métodos de pago
2. **User Management** - Operaciones de usuarios
3. **Order Cancellation** - Cancelación de órdenes

### Baja Prioridad

1. **Occasions Management** - CRUD de ocasiones
2. **Settings Management** - Configuración del sistema

## 🚀 Ejecutar Tests

```bash
# Todos los tests E2E de API
npm test tests/e2e/api/

# Test específico
npm test tests/e2e/api/orders-api.test.js

# Con coverage
npm test -- --coverage tests/e2e/api/
```

## 📊 Cobertura Esperada

- **Orders**: 100% endpoints críticos
- **Products**: 80% endpoints
- **Payments**: 100% endpoints disponibles
- **Payment Methods**: 60% endpoints

## 🔧 Configuración

Los tests usan:

- **Playwright** para simulación de navegador
- **Supabase Test DB** para datos de prueba
- **Mock Auth** para autenticación simplificada

## 📝 Estructura de Tests

Cada archivo de test sigue el patrón:

1. Setup (crear datos de prueba)
2. Execute (llamar endpoint)
3. Assert (validar respuesta)
4. Cleanup (limpiar datos de prueba)
