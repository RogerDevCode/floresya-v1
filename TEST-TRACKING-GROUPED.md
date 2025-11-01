# 📋 TRACKING DE TESTS FALLANDO - ANÁLISIS Y REPARACIÓN

**Fecha:** 2025-11-01
**Total de Tests Fallando:** 249
**Estrategia:** Reparación por grupos de 10 tests (25 grupos total)

---

## ✅ GRUPO 1 (Tests 1-10)

### Tests a Reparar:

- [ ] **Test 1** - `tests/integration/orders.integration.test.js` - Orders Integration
- [ ] **Test 2** - `tests/integration/robustness.integration.test.js` - Robustness Integration
- [ ] **Test 3** - `tests/orders.api.test.js` - GET /api/orders/:id should return 404 when order not found
- [ ] **Test 4** - `tests/orders.api.test.js` - PATCH /api/orders/:id/status should validate input
- [ ] **Test 5** - `tests/orders.api.test.js` - API should handle database errors gracefully
- [ ] **Test 6** - `tests/architecture/architectural-compliance.test.js` - Supabase Client Access outside services
- [ ] **Test 7** - `tests/architecture/architectural-compliance.test.js` - Database operations only in services/
- [ ] **Test 8** - `tests/architecture/architectural-compliance.test.js` - Controllers only call services
- [ ] **Test 9** - `tests/architecture/architectural-compliance.test.js` - MVC strict pattern compliance
- [ ] **Test 10** - `tests/architecture/business-rules-compliance.test.js` - Order status history for cancellations

### Análisis Requerido:

1. Revisar configuración de middlewares de autenticación
2. Verificar implementación de respuestas estandarizadas
3. Auditar dependencias y acceso a supabaseClient
4. Validar patrón MVC en todas las capas

---

## ✅ GRUPO 2 (Tests 11-20)

### Tests a Reparar:

- [ ] **Test 11** - `tests/architecture/custom-error-compliance.test.js` - Custom error classes usage
- [ ] **Test 12** - `tests/architecture/custom-error-compliance.test.js` - Error handling in controllers
- [ ] **Test 13** - `tests/architecture/custom-error-compliance.test.js` - Custom errors toJSON method
- [ ] **Test 14** - `tests/architecture/error-handling-compliance.test.js` - No fallback operators in critical ops
- [ ] **Test 15** - `tests/architecture/error-handling-compliance.test.js` - Fail-fast behavior
- [ ] **Test 16** - `tests/architecture/error-handling-compliance.test.js` - Error propagation in controllers
- [ ] **Test 17** - `tests/architecture/error-handling-compliance.test.js` - Custom error classes vs generic
- [ ] **Test 18** - `tests/integration/contractEnforcement.test.js` - Order creation contract - missing fields
- [ ] **Test 19** - `tests/integration/contractEnforcement.test.js` - Order creation contract - incorrect types
- [ ] **Test 20** - `tests/integration/contractEnforcement.test.js` - Product creation schema enforcement

### Análisis Requerido:

1. Revisar todas las clases de error personalizadas (api/errors/AppError.js)
2. Auditar manejo de errores en controllers
3. Validar esquema OpenAPI y anotaciones JSDoc
4. Verificar validación de respuestas

---

## ✅ GRUPO 3 (Tests 21-30)

### Tests a Reparar:

- [ ] **Test 21** - `tests/integration/contractEnforcement.test.js` - Parameter validation - invalid path params
- [ ] **Test 22** - `tests/integration/contractEnforcement.test.js` - Parameter validation - invalid query params
- [ ] **Test 23** - `tests/integration/contractEnforcement.test.js` - Contract divergence detection
- [ ] **Test 24** - `tests/integration/contractEnforcement.test.js` - Order schema validation
- [ ] **Test 25** - `tests/integration/order-api.integration.test.js` - Create order with items
- [ ] **Test 26** - `tests/integration/order-api.integration.test.js` - Retrieve created order by ID
- [ ] **Test 27** - `tests/integration/order-api.integration.test.js` - Retrieve all orders with filtering
- [ ] **Test 28** - `tests/integration/order-api.integration.test.js` - Update order status
- [ ] **Test 29** - `tests/integration/order-api.integration.test.js` - Update order details
- [ ] **Test 30** - `tests/integration/order-api.integration.test.js` - Get order status history

### Análisis Requerido:

1. Verificar middleware de validación (api/middleware/validation/)
2. Revisar servicios de orders (api/services/orderService.js)
3. Auditar controllers de orders (api/controllers/orderController.js)
4. Validar esquema de base de datos y restricciones

---

## ✅ GRUPO 4 (Tests 31-40)

### Tests a Reparar:

- [ ] **Test 31** - `tests/integration/order-api.integration.test.js` - Cancel the order
- [ ] **Test 32** - `tests/integration/product-api-PAIT-new.test.js` - PUT /api/products/:id - update successfully
- [ ] **Test 33** - `tests/integration/product-api-PAIT-new.test.js` - DELETE /api/products/:id - soft delete
- [ ] **Test 34** - `tests/integration/product-api-PAIT-new.test.js` - PATCH /api/products/:id/stock - update stock
- [ ] **Test 35** - `tests/integration/product-api-PAIT-new.test.js` - Handle validation errors
- [ ] **Test 36** - `tests/integration/product-api-PAIT-new.test.js` - Full CRUD flow
- [ ] **Test 37** - `tests/security/advanced-attack-vectors.test.js` - NoSQL Injection validation
- [ ] **Test 38** - `tests/security/fuzz-testing.test.js` - Path traversal fuzz testing
- [ ] **Test 39** - `tests/security/fuzz-testing.test.js` - Command injection fuzz testing
- [ ] **Test 40** - `tests/security/fuzz-testing.test.js` - Template injection fuzz testing

### Análisis Requerido:

1. Revisar endpoint de cancelación de orders
2. Auditar middleware de autenticación (401 responses)
3. Verificar rate limiting para fuzz testing
4. Validar sanitización de inputs

---

## ✅ GRUPO 5 (Tests 41-50)

### Tests a Reparar:

- [ ] **Test 41** - `tests/security/fuzz-testing.test.js` - Protocol injection fuzz testing
- [ ] **Test 42** - `tests/security/fuzz-testing.test.js` - Unicode fuzz testing
- [ ] **Test 43** - `tests/security/fuzz-testing.test.js` - Buffer overflow fuzz testing
- [ ] **Test 44** - `tests/security/fuzz-testing.test.js` - Multi-vector combined attacks
- [ ] **Test 45** - `tests/security/fuzz-testing.test.js` - Multi-vector special characters
- [ ] **Test 46** - `api/__tests__/integration/occasionController.int.test.js` - GET /api/occasions - get all active
- [ ] **Test 47** - `api/__tests__/integration/occasionController.int.test.js` - GET /api/occasions - handle limit
- [ ] **Test 48** - `api/__tests__/integration/occasionController.int.test.js` - GET /api/occasions - includeInactive
- [ ] **Test 49** - `api/__tests__/integration/occasionController.int.test.js` - GET /api/occasions/:id - get by ID
- [ ] **Test 50** - `api/__tests__/integration/occasionController.int.test.js` - GET /api/occasions/:id - return 404

### Análisis Requerido:

1. Verificar rate limiting configuration
2. Revisar ocasión controller (api/controllers/occasionController.js)
3. Auditar occasion service (api/services/occasionService.js)
4. Validar parámetros de paginación

---

## ✅ GRUPO 6 (Tests 51-60)

### Tests a Reparar:

- [ ] **Test 51** - `api/__tests__/integration/occasionController.int.test.js` - GET /api/occasions/:id - invalid ID
- [ ] **Test 52** - `api/__tests__/integration/occasionController.int.test.js` - GET /api/occasions/slug/:slug - get by slug
- [ ] **Test 53** - `api/__tests__/integration/occasionController.int.test.js` - GET /api/occasions/slug/:slug - return 404
- [ ] **Test 54** - `api/__tests__/integration/occasionController.int.test.js` - POST /api/occasions - create (admin only)
- [ ] **Test 55** - `api/__tests__/integration/occasionController.int.test.js` - POST /api/occasions - return 401
- [ ] **Test 56** - `api/__tests__/integration/occasionController.int.test.js` - POST /api/occasions - return 400
- [ ] **Test 57** - `api/__tests__/integration/occasionController.int.test.js` - PUT /api/occasions/:id - update
- [ ] **Test 58** - `api/__tests__/integration/occasionController.int.test.js` - PUT /api/occasions/:id - return 401
- [ ] **Test 59** - `api/__tests__/integration/occasionController.int.test.js` - PUT /api/occasions/:id - return 404
- [ ] **Test 60** - `api/__tests__/integration/occasionController.int.test.js` - PUT /api/occasions/:id - return 400

### Análisis Requerido:

1. Verificar validaciones de ID y slug
2. Revisar middleware de autenticación para admin
3. Auditar validaciones de create/update
4. Validar response structure consistency

---

## ✅ GRUPO 7 (Tests 61-70)

### Tests a Reparar:

- [ ] **Test 61** - `api/__tests__/integration/occasionController.int.test.js` - PATCH /api/occasions/:id/display-order
- [ ] **Test 62** - `api/__tests__/integration/occasionController.int.test.js` - PATCH /api/occasions/:id/display-order - 401
- [ ] **Test 63** - `api/__tests__/integration/occasionController.int.test.js` - PATCH /api/occasions/:id/display-order - 404
- [ ] **Test 64** - `api/__tests__/integration/occasionController.int.test.js` - PATCH /api/occasions/:id/display-order - 400
- [ ] **Test 65** - `api/__tests__/integration/occasionController.int.test.js` - DELETE /api/occasions/:id - soft delete
- [ ] **Test 66** - `api/__tests__/integration/occasionController.int.test.js` - DELETE /api/occasions/:id - 401
- [ ] **Test 67** - `api/__tests__/integration/occasionController.int.test.js` - DELETE /api/occasions/:id - 404
- [ ] **Test 68** - `api/__tests__/integration/occasionController.int.test.js` - PATCH /api/occasions/:id/reactivate
- [ ] **Test 69** - `api/__tests__/integration/occasionController.int.test.js` - PATCH /api/occasions/:id/reactivate - 401
- [ ] **Test 70** - `api/__tests__/integration/occasionController.int.test.js` - PATCH /api/occasions/:id/reactivate - 404

### Análisis Requerido:

1. Verificar endpoint de display-order
2. Revisar implementación de soft delete
3. Auditar función reactivate
4. Validar permisos de admin

---

## ✅ GRUPO 8 (Tests 71-80)

### Tests a Reparar:

- [ ] **Test 71** - `api/__tests__/integration/occasionController.int.test.js` - Response structure consistency
- [ ] **Test 72** - `api/__tests__/integration/occasionController.int.test.js` - HTTP status codes
- [ ] **Test 73** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders - filters (admin)
- [ ] **Test 74** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders - 401
- [ ] **Test 75** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders - query filters
- [ ] **Test 76** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders - status filter
- [ ] **Test 77** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders - date range filters
- [ ] **Test 78** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders - search parameter
- [ ] **Test 79** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders/:id - get by ID
- [ ] **Test 80** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders/:id - 401

### Análisis Requerido:

1. Verificar consistencia de estructura de respuesta
2. Revisar orderController (api/controllers/orderController.js)
3. Auditar filtros de búsqueda y paginación
4. Validar autenticación y permisos

---

## ✅ GRUPO 9 (Tests 81-90)

### Tests a Reparar:

- [ ] **Test 81** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders/:id - 404
- [ ] **Test 82** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders/:id - 400
- [ ] **Test 83** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders/user/:userId - get by user
- [ ] **Test 84** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders/user/:userId - status filter
- [ ] **Test 85** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders/user/:userId - 404
- [ ] **Test 86** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders/:id/status-history
- [ ] **Test 87** - `api/__tests__/integration/orderController.int.test.js` - GET /api/orders/:id/status-history - 404
- [ ] **Test 88** - `api/__tests__/integration/orderController.int.test.js` - POST /api/orders - create with items
- [ ] **Test 89** - `api/__tests__/integration/orderController.int.test.js` - POST /api/orders - return 400
- [ ] **Test 90** - `api/__tests__/integration/orderController.int.test.js` - POST /api/orders - return 404

### Análisis Requerido:

1. Verificar validación de IDs
2. Revisar endpoint de órdenes por usuario
3. Auditar status history implementation
4. Validar creación de órdenes

---

## ✅ GRUPO 10 (Tests 91-100)

### Tests a Reparar:

- [ ] **Test 91** - `api/__tests__/integration/orderController.int.test.js` - PUT /api/orders/:id - update
- [ ] **Test 92** - `api/__tests__/integration/orderController.int.test.js` - PUT /api/orders/:id - 401
- [ ] **Test 93** - `api/__tests__/integration/orderController.int.test.js` - PUT /api/orders/:id - 404
- [ ] **Test 94** - `api/__tests__/integration/orderController.int.test.js` - PUT /api/orders/:id - 400
- [ ] **Test 95** - `api/__tests__/integration/orderController.int.test.js` - PATCH /api/orders/:id/status - update status
- [ ] **Test 96** - `api/__tests__/integration/orderController.int.test.js` - PATCH /api/orders/:id/status - 401
- [ ] **Test 97** - `api/__tests__/integration/orderController.int.test.js` - PATCH /api/orders/:id/status - 404
- [ ] **Test 98** - `api/__tests__/integration/orderController.int.test.js` - PATCH /api/orders/:id/status - 400
- [ ] **Test 99** - `api/__tests__/integration/orderController.int.test.js` - PATCH /api/orders/:id/cancel - cancel order
- [ ] **Test 100** - `api/__tests__/integration/orderController.int.test.js` - PATCH /api/orders/:id/cancel - 404

### Análisis Requerido:

1. Verificar actualización de órdenes
2. Revisar cambio de status
3. Auditar endpoint de cancelación
4. Validar permisos de admin

---

## ✅ GRUPO 11 (Tests 101-110)

### Tests a Reparar:

- [ ] **Test 101** - `api/__tests__/integration/orderController.int.test.js` - PATCH /api/orders/:id/cancel - 400
- [ ] **Test 102** - `api/__tests__/integration/orderController.int.test.js` - Response structure consistency
- [ ] **Test 103** - `api/__tests__/integration/orderController.int.test.js` - HTTP status codes
- [ ] **Test 104** - `api/__tests__/integration/paymentController.int.test.js` - GET /api/payments - filters (admin)
- [ ] **Test 105** - `api/__tests__/integration/paymentController.int.test.js` - GET /api/payments - 401
- [ ] **Test 106** - `api/__tests__/integration/paymentController.int.test.js` - GET /api/payments - query filters
- [ ] **Test 107** - `api/__tests__/integration/paymentController.int.test.js` - GET /api/payments - status filter
- [ ] **Test 108** - `api/__tests__/integration/paymentController.int.test.js` - GET /api/payments - date range filters
- [ ] **Test 109** - `api/__tests__/integration/paymentController.int.test.js` - GET /api/payments/:id - get by ID
- [ ] **Test 110** - `api/__tests__/integration/paymentController.int.test.js` - GET /api/payments/:id - 401

### Análisis Requerido:

1. Verificar cancelación de órdenes ya canceladas
2. Revisar paymentController (api/controllers/paymentController.js)
3. Auditar filtros de pagos
4. Validar estructura de respuesta

---

## ✅ GRUPO 12 (Tests 111-120)

### Tests a Reparar:

- [ ] **Test 111** - `api/__tests__/integration/paymentController.int.test.js` - GET /api/payments/:id - 404
- [ ] **Test 112** - `api/__tests__/integration/paymentController.int.test.js` - GET /api/payments/order/:orderId
- [ ] **Test 113** - `api/__tests__/integration/paymentController.int.test.js` - GET /api/payments/order/:orderId - 404
- [ ] **Test 114** - `api/__tests__/integration/paymentController.int.test.js` - GET /api/payments/user/:userId
- [ ] **Test 115** - `api/__tests__/integration/paymentController.int.test.js` - GET /api/payments/user/:userId - 404
- [ ] **Test 116** - `api/__tests__/integration/paymentController.int.test.js` - POST /api/payments - create
- [ ] **Test 117** - `api/__tests__/integration/paymentController.int.test.js` - POST /api/payments - 401
- [ ] **Test 118** - `api/__tests__/integration/paymentController.int.test.js` - POST /api/payments - 400
- [ ] **Test 119** - `api/__tests__/integration/paymentController.int.test.js` - POST /api/payments - 404
- [ ] **Test 120** - `api/__tests__/integration/paymentController.int.test.js` - PUT /api/payments/:id - update

### Análisis Requerido:

1. Verificar endpoints de pagos por orden y usuario
2. Revisar creación de pagos
3. Auditar validaciones
4. Validar referencias a órdenes

---

## ✅ GRUPO 13 (Tests 121-130)

### Tests a Reparar:

- [ ] **Test 121** - `api/__tests__/integration/paymentController.int.test.js` - PUT /api/payments/:id - 401
- [ ] **Test 122** - `api/__tests__/integration/paymentController.int.test.js` - PUT /api/payments/:id - 404
- [ ] **Test 123** - `api/__tests__/integration/paymentController.int.test.js` - PUT /api/payments/:id - 400
- [ ] **Test 124** - `api/__tests__/integration/paymentController.int.test.js` - PATCH /api/payments/:id/status - update
- [ ] **Test 125** - `api/__tests__/integration/paymentController.int.test.js` - PATCH /api/payments/:id/status - 401
- [ ] **Test 126** - `api/__tests__/integration/paymentController.int.test.js` - PATCH /api/payments/:id/status - 404
- [ ] **Test 127** - `api/__tests__/integration/paymentController.int.test.js` - PATCH /api/payments/:id/status - 400
- [ ] **Test 128** - `api/__tests__/integration/paymentController.int.test.js` - DELETE /api/payments/:id - soft delete
- [ ] **Test 129** - `api/__tests__/integration/paymentController.int.test.js` - DELETE /api/payments/:id - 401
- [ ] **Test 130** - `api/__tests__/integration/paymentController.int.test.js` - DELETE /api/payments/:id - 404

### Análisis Requerido:

1. Verificar actualización de pagos
2. Revisar cambio de status de pagos
3. Auditar soft delete de pagos
4. Validar permisos admin

---

## ✅ GRUPO 14 (Tests 131-140)

### Tests a Reparar:

- [ ] **Test 131** - `api/__tests__/integration/paymentController.int.test.js` - Response structure consistency
- [ ] **Test 132** - `api/__tests__/integration/paymentController.int.test.js` - HTTP status codes
- [ ] **Test 133** - `api/__tests__/integration/paymentMethod.int.test.js` - GET /api/payment-methods - all active
- [ ] **Test 134** - `api/__tests__/integration/paymentMethod.int.test.js` - GET /api/payment-methods - invalid limit
- [ ] **Test 135** - `api/__tests__/integration/paymentMethod.int.test.js` - GET /api/payment-methods/:id
- [ ] **Test 136** - `api/__tests__/integration/paymentMethod.int.test.js` - GET /api/payment-methods/:id - 404
- [ ] **Test 137** - `api/__tests__/integration/paymentMethod.int.test.js` - GET /api/payment-methods/:id - 400
- [ ] **Test 138** - `api/__tests__/integration/paymentMethod.int.test.js` - POST /api/payment-methods - create
- [ ] **Test 139** - `api/__tests__/integration/paymentMethod.int.test.js` - POST /api/payment-methods - 401
- [ ] **Test 140** - `api/__tests__/integration/paymentMethod.int.test.js` - POST /api/payment-methods - 400

### Análisis Requerido:

1. Verificar paymentMethod controller
2. Revisar paymentMethod service
3. Auditar validaciones de métodos de pago
4. Validar paginación

---

## ✅ GRUPO 15 (Tests 141-150)

### Tests a Reparar:

- [ ] **Test 141** - `api/__tests__/integration/paymentMethod.int.test.js` - PUT /api/payment-methods/:id - update
- [ ] **Test 142** - `api/__tests__/integration/paymentMethod.int.test.js` - PUT /api/payment-methods/:id - 401
- [ ] **Test 143** - `api/__tests__/integration/paymentMethod.int.test.js` - PUT /api/payment-methods/:id - 404
- [ ] **Test 144** - `api/__tests__/integration/paymentMethod.int.test.js` - DELETE /api/payment-methods/:id
- [ ] **Test 145** - `api/__tests__/integration/paymentMethod.int.test.js` - DELETE /api/payment-methods/:id - 401
- [ ] **Test 146** - `api/__tests__/integration/paymentMethod.int.test.js` - PATCH /api/payment-methods/:id/reactivate
- [ ] **Test 147** - `api/__tests__/integration/paymentMethod.int.test.js` - PATCH /api/payment-methods/:id/reactivate - 401
- [ ] **Test 148** - `api/__tests__/integration/paymentMethod.int.test.js` - PATCH /api/payment-methods/:id/display-order
- [ ] **Test 149** - `api/__tests__/integration/paymentMethod.int.test.js` - PATCH /api/payment-methods/:id/display-order - 401
- [ ] **Test 150** - `api/__tests__/integration/paymentMethod.int.test.js` - PATCH /api/payment-methods/:id/display-order - 400

### Análisis Requerido:

1. Verificar CRUD de métodos de pago
2. Revisar soft delete y reactivate
3. Auditar display-order functionality
4. Validar permisos admin

---

## ✅ GRUPO 16 (Tests 151-160)

### Tests a Reparar:

- [ ] **Test 151** - `api/__tests__/integration/paymentMethodController.int.test.js` - GET /api/payment-methods
- [ ] **Test 152** - `api/__tests__/integration/paymentMethodController.int.test.js` - GET /api/payment-methods - limit
- [ ] **Test 153** - `api/__tests__/integration/paymentMethodController.int.test.js` - GET /api/payment-methods - invalid limit
- [ ] **Test 154** - `api/__tests__/integration/paymentMethodController.int.test.js` - GET /api/payment-methods/:id
- [ ] **Test 155** - `api/__tests__/integration/paymentMethodController.int.test.js` - GET /api/payment-methods/:id - 404
- [ ] **Test 156** - `api/__tests__/integration/paymentMethodController.int.test.js` - GET /api/payment-methods/:id - 400
- [ ] **Test 157** - `api/__tests__/integration/paymentMethodController.int.test.js` - POST /api/payment-methods
- [ ] **Test 158** - `api/__tests__/integration/paymentMethodController.int.test.js` - POST /api/payment-methods - 401
- [ ] **Test 159** - `api/__tests__/integration/paymentMethodController.int.test.js` - POST /api/payment-methods - 400
- [ ] **Test 160** - `api/__tests__/integration/paymentMethodController.int.test.js` - PUT /api/payment-methods/:id

### Análisis Requerido:

1. Verificar paymentMethodController implementation
2. Revisar diferencias con paymentMethod
3. Auditar consistencies
4. Validar parámetros

---

## ✅ GRUPO 17 (Tests 161-170)

### Tests a Reparar:

- [ ] **Test 161** - `api/__tests__/integration/paymentMethodController.int.test.js` - PUT /api/payment-methods/:id - 401
- [ ] **Test 162** - `api/__tests__/integration/paymentMethodController.int.test.js` - PUT /api/payment-methods/:id - 404
- [ ] **Test 163** - `api/__tests__/integration/paymentMethodController.int.test.js` - PUT /api/payment-methods/:id - 400
- [ ] **Test 164** - `api/__tests__/integration/paymentMethodController.int.test.js` - DELETE /api/payment-methods/:id
- [ ] **Test 165** - `api/__tests__/integration/paymentMethodController.int.test.js` - DELETE /api/payment-methods/:id - 401
- [ ] **Test 166** - `api/__tests__/integration/paymentMethodController.int.test.js` - DELETE /api/payment-methods/:id - 404
- [ ] **Test 167** - `api/__tests__/integration/paymentMethodController.int.test.js` - PATCH /api/payment-methods/:id/reactivate
- [ ] **Test 168** - `api/__tests__/integration/paymentMethodController.int.test.js` - PATCH /api/payment-methods/:id/reactivate - 401
- [ ] **Test 169** - `api/__tests__/integration/paymentMethodController.int.test.js` - PATCH /api/payment-methods/:id/reactivate - 404
- [ ] **Test 170** - `api/__tests__/integration/paymentMethodController.int.test.js` - PATCH /api/payment-methods/:id/display-order

### Análisis Requerido:

1. Verificar update/delete endpoints
2. Revisar reactivate functionality
3. Auditar display-order
4. Validar 401/404 responses

---

## ✅ GRUPO 18 (Tests 171-180)

### Tests a Reparar:

- [ ] **Test 171** - `api/__tests__/integration/paymentMethodController.int.test.js` - PATCH /api/payment-methods/:id/display-order - 401
- [ ] **Test 172** - `api/__tests__/integration/paymentMethodController.int.test.js` - PATCH /api/payment-methods/:id/display-order - 404
- [ ] **Test 173** - `api/__tests__/integration/paymentMethodController.int.test.js` - PATCH /api/payment-methods/:id/display-order - 400
- [ ] **Test 174** - `api/__tests__/integration/paymentMethodController.int.test.js` - Response structure consistency
- [ ] **Test 175** - `api/__tests__/integration/paymentMethodController.int.test.js` - HTTP status codes
- [ ] **Test 176** - `api/__tests__/integration/productController.int.test.js` - GET /api/products - filters
- [ ] **Test 177** - `api/__tests__/integration/productController.int.test.js` - GET /api/products - featured filter
- [ ] **Test 178** - `api/__tests__/integration/productController.int.test.js` - GET /api/products - search query
- [ ] **Test 179** - `api/__tests__/integration/productController.int.test.js` - GET /api/products - pagination
- [ ] **Test 180** - `api/__tests__/integration/productController.int.test.js` - GET /api/products - includeInactive

### Análisis Requerido:

1. Verificar response consistency
2. Revisar productController (api/controllers/productController.js)
3. Auditar filtros de productos
4. Validar paginación

---

## ✅ GRUPO 19 (Tests 181-190)

### Tests a Reparar:

- [ ] **Test 181** - `api/__tests__/integration/productController.int.test.js` - GET /api/products/:id - get by ID
- [ ] **Test 182** - `api/__tests__/integration/productController.int.test.js` - GET /api/products/:id - 404
- [ ] **Test 183** - `api/__tests__/integration/productController.int.test.js` - GET /api/products/:id - 400
- [ ] **Test 184** - `api/__tests__/integration/productController.int.test.js` - GET /api/products/sku/:sku
- [ ] **Test 185** - `api/__tests__/integration/productController.int.test.js` - GET /api/products/sku/:sku - 404
- [ ] **Test 186** - `api/__tests__/integration/productController.int.test.js` - GET /api/products/carousel
- [ ] **Test 187** - `api/__tests__/integration/productController.int.test.js` - GET /api/products/with-occasions
- [ ] **Test 188** - `api/__tests__/integration/productController.int.test.js` - GET /api/products/with-occasions - pagination
- [ ] **Test 189** - `api/__tests__/integration/productController.int.test.js` - GET /api/products/occasion/:occasionId
- [ ] **Test 190** - `api/__tests__/integration/productController.int.test.js` - GET /api/products/occasion/:occasionId - 404

### Análisis Requerido:

1. Verificar endpoints por ID y SKU
2. Revisar carousel functionality
3. Auditar productos con ocasiones
4. Validar paginación

---

## ✅ GRUPO 20 (Tests 191-200)

### Tests a Reparar:

- [ ] **Test 191** - `api/__tests__/integration/productController.int.test.js` - GET /api/products/occasion/:occasionId - limit
- [ ] **Test 192** - `api/__tests__/integration/productController.int.test.js` - POST /api/products - create
- [ ] **Test 193** - `api/__tests__/integration/productController.int.test.js` - POST /api/products - 401
- [ ] **Test 194** - `api/__tests__/integration/productController.int.test.js` - POST /api/products - 400
- [ ] **Test 195** - `api/__tests__/integration/productController.int.test.js` - PUT /api/products/:id - update
- [ ] **Test 196** - `api/__tests__/integration/productController.int.test.js` - PUT /api/products/:id - 401
- [ ] **Test 197** - `api/__tests__/integration/productController.int.test.js` - PUT /api/products/:id - 404
- [ ] **Test 198** - `api/__tests__/integration/productController.int.test.js` - PUT /api/products/:id - 400
- [ ] **Test 199** - `api/__tests__/integration/productController.int.test.js` - DELETE /api/products/:id - soft delete
- [ ] **Test 200** - `api/__tests__/integration/productController.int.test.js` - DELETE /api/products/:id - 401

### Análisis Requerido:

1. Verificar productos por ocasión
2. Revisar CRUD de productos
3. Auditar validaciones
4. Validar permisos admin

---

## ✅ GRUPO 21 (Tests 201-210)

### Tests a Reparar:

- [ ] **Test 201** - `api/__tests__/integration/productController.int.test.js` - DELETE /api/products/:id - 404
- [ ] **Test 202** - `api/__tests__/integration/productController.int.test.js` - PATCH /api/products/:id/reactivate
- [ ] **Test 203** - `api/__tests__/integration/productController.int.test.js` - PATCH /api/products/:id/reactivate - 401
- [ ] **Test 204** - `api/__tests__/integration/productController.int.test.js` - PATCH /api/products/:id/reactivate - 404
- [ ] **Test 205** - `api/__tests__/integration/productController.int.test.js` - Response structure consistency
- [ ] **Test 206** - `api/__tests__/integration/productController.int.test.js` - HTTP status codes
- [ ] **Test 207** - `api/__tests__/integration/productImageController.int.test.js` - GET /api/product-images - filters
- [ ] **Test 208** - `api/__tests__/integration/productImageController.int.test.js` - GET /api/product-images - product_id filter
- [ ] **Test 209** - `api/__tests__/integration/productImageController.int.test.js` - GET /api/product-images - pagination
- [ ] **Test 210** - `api/__tests__/integration/productImageController.int.test.js` - GET /api/product-images/:id

### Análisis Requerido:

1. Verificar reactivate de productos
2. Revisar productImageController
3. Auditar filtros de imágenes
4. Validar estructura de respuesta

---

## ✅ GRUPO 22 (Tests 211-220)

### Tests a Reparar:

- [ ] **Test 211** - `api/__tests__/integration/productImageController.int.test.js` - GET /api/product-images/:id - 404
- [ ] **Test 212** - `api/__tests__/integration/productImageController.int.test.js` - GET /api/product-images/:id - 400
- [ ] **Test 213** - `api/__tests__/integration/productImageController.int.test.js` - GET /api/product-images/product/:productId
- [ ] **Test 214** - `api/__tests__/integration/productImageController.int.test.js` - GET /api/product-images/product/:productId - 404
- [ ] **Test 215** - `api/__tests__/integration/productImageController.int.test.js` - POST /api/product-images - create
- [ ] **Test 216** - `api/__tests__/integration/productImageController.int.test.js` - POST /api/product-images - 401
- [ ] **Test 217** - `api/__tests__/integration/productImageController.int.test.js` - POST /api/product-images - 400
- [ ] **Test 218** - `api/__tests__/integration/productImageController.int.test.js` - POST /api/product-images - 404
- [ ] **Test 219** - `api/__tests__/integration/productImageController.int.test.js` - PUT /api/product-images/:id - update
- [ ] **Test 220** - `api/__tests__/integration/productImageController.int.test.js` - PUT /api/product-images/:id - 401

### Análisis Requerido:

1. Verificar imágenes por producto
2. Revisar creación de imágenes
3. Auditar validaciones
4. Validar referencias a productos

---

## ✅ GRUPO 23 (Tests 221-230)

### Tests a Reparar:

- [ ] **Test 221** - `api/__tests__/integration/productImageController.int.test.js` - PUT /api/product-images/:id - 404
- [ ] **Test 222** - `api/__tests__/integration/productImageController.int.test.js` - PUT /api/product-images/:id - 400
- [ ] **Test 223** - `api/__tests__/integration/productImageController.int.test.js` - DELETE /api/product-images/:id
- [ ] **Test 224** - `api/__tests__/integration/productImageController.int.test.js` - DELETE /api/product-images/:id - 401
- [ ] **Test 225** - `api/__tests__/integration/productImageController.int.test.js` - DELETE /api/product-images/:id - 404
- [ ] **Test 226** - `api/__tests__/integration/productImageController.int.test.js` - PATCH /api/product-images/:id/reactivate
- [ ] **Test 227** - `api/__tests__/integration/productImageController.int.test.js` - PATCH /api/product-images/:id/reactivate - 401
- [ ] **Test 228** - `api/__tests__/integration/productImageController.int.test.js` - PATCH /api/product-images/:id/reactivate - 404
- [ ] **Test 229** - `api/__tests__/integration/productImageController.int.test.js` - Response structure consistency
- [ ] **Test 230** - `api/__tests__/integration/productImageController.int.test.js` - HTTP status codes

### Análisis Requerido:

1. Verificar update/delete de imágenes
2. Revisar reactivate de imágenes
3. Auditar response consistency
4. Validar HTTP status codes

---

## ✅ GRUPO 24 (Tests 231-240)

### Tests a Reparar:

- [ ] **Test 231** - `api/controllers/__tests__/userController.test.js` - getAllUsers - default filters
- [ ] **Test 232** - `api/controllers/__tests__/userController.test.js` - getAllUsers - search filter
- [ ] **Test 233** - `api/controllers/__tests__/userController.test.js` - getAllUsers - role filter
- [ ] **Test 234** - `api/controllers/__tests__/userController.test.js` - getAllUsers - include inactive
- [ ] **Test 235** - `api/controllers/__tests__/userController.test.js` - getAllUsers - pagination
- [ ] **Test 236** - `tests/unit/client/dom-ready-DRUD-new.test.js` - onDOMReady - complete state
- [ ] **Test 237** - `tests/unit/client/dom-ready-DRUD-new.test.js` - onDOMReady - interactive state
- [ ] **Test 238** - `tests/unit/client/dom-ready-DRUD-new.test.js` - onDOMReady - multiple callbacks
- [ ] **Test 239** - `tests/unit/client/dom-ready-DRUD-new.test.js` - onWindowLoad - already loaded
- [ ] **Test 240** - `tests/unit/client/dom-ready-DRUD-new.test.js` - initSequence - execute in sequence

### Análisis Requerido:

1. Verificar userController
2. Revisar filtros de usuarios
3. Auditar DOM ready utilities
4. Validar callbacks y secuencias

---

## ✅ GRUPO 25 (Tests 241-249)

### Tests a Reparar:

- [ ] **Test 241** - `tests/unit/client/dom-ready-DRUD-new.test.js` - initSequence - non-function callbacks
- [ ] **Test 242** - `tests/unit/client/dom-ready-DRUD-new.test.js` - initSequence - reject on error
- [ ] **Test 243** - `tests/unit/client/dom-ready-DRUD-new.test.js` - initSequence - work without callbacks
- [ ] **Test 244** - `tests/unit/client/dom-ready-DRUD-new.test.js` - waitForElement - MutationObserver
- [ ] **Test 245** - `tests/unit/client/dom-ready-DRUD-new.test.js` - waitForElement - default timeout
- [ ] **Test 246** - `tests/unit/client/dom-ready-DRUD-new.test.js` - safeQuerySelector - after DOM ready
- [ ] **Test 247** - `tests/unit/client/dom-ready-DRUD-new.test.js` - safeQuerySelector - return null
- [ ] **Test 248** - `tests/unit/client/dom-ready-DRUD-new.test.js` - safeQuerySelectorAll - after DOM ready
- [ ] **Test 249** - `tests/unit/client/dom-ready-DRUD-new.test.js` - safeQuerySelectorAll - empty NodeList

### Análisis Requerido:

1. Verificar manejo de errores en initSequence
2. Revisar waitForElement implementation
3. Auditar safeQuerySelector functions
4. Validar timeouts y observadores

---

## 🎯 RESUMEN EJECUTIVO

### Patrones de Fallas Detectados:

1. **Autenticación/Autorización (401)**: Fallas masivas en endpoints que requieren admin
2. **Validación de Parámetros (400/404)**: Problemas con validaciones de entrada
3. **Respuestas Estructuradas**: Inconsistencias en formato de respuesta JSON
4. **Código de Estado HTTP**: Errores en códigos de estado retornados
5. **Middleware de Rate Limiting**: Faltante o mal configurado para fuzz testing
6. **Arquitectura MVC**: Violaciones en separación de capas
7. **Manejo de Errores**: Uso incorrecto de clases de error personalizadas
8. **Soft Delete**: Problemas con flags `is_active` y reactivación

### Próximos Pasos:

1. ✅ **Completado**: Lista de 249 tests con numeración y agrupamiento
2. 🔄 **En Progreso**: Plan de análisis por grupos de 10
3. ⏳ **Pendiente**: Reparación del Grupo 1 (Tests 1-10)
4. ⏳ **Pendiente**: Reparación del Grupo 2 (Tests 11-20)
5. ⏳ **Pendiente**: Reparación del Grupo 3 (Tests 21-30)
6. ⏳ **Pendiente**: Reparación del Grupo 4 (Tests 31-40)
7. ⏳ **Pendiente**: Reparación del Grupo 5 (Tests 41-50)

---

## 📝 NOTAS IMPORTANTES

- **No saturar CPU**: Mantener carga < 50% durante análisis y reparación
- **Prioridad P0**: Tests de arquitectura y compliance (Tests 6-17)
- **Prioridad P1**: Tests de integración de API
- **Prioridad P2**: Tests unitarios de cliente
- **Confirmación requerida**: Entre cada grupo de 10 tests reparados
- **Seguimiento**: Marcar tests como `[✓]` al ser reparados
