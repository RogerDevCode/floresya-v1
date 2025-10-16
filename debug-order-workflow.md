# Debug Workflow: Proceso de Creación de Pedido y Pago

## Flujo Completo de Creación de Pedido

### 1. Frontend - Inicio del proceso

#### 1.1 Usuario completa el formulario de pedido

```
[DATOS DEL PEDIDO ENVIADOS POR EL USUARIO]
{
  "customer_email": "cliente@example.com",
  "customer_name": "María González",
  "customer_phone": "+584121234567",
  "delivery_address": "Av. Principal, Urbanización Los Palos Grandes, Caracas",
  "delivery_date": "2025-10-20",
  "delivery_time_slot": "10:00-12:00",
  "delivery_notes": "Edificio Miraflores, apartamento 5A. Llamar al timbre.",
  "items": [
    {
      "product_id": 67,
      "product_name": "Ramo Tropical Vibrante",
      "product_summary": "Flores tropicales vibrantes",
      "unit_price_usd": 45.99,
      "unit_price_ves": 1839.6,
      "quantity": 2,
      "subtotal_usd": 91.98,
      "subtotal_ves": 3679.2
    }
  ],
  "total_amount_usd": 91.98,
  "total_amount_ves": 3679.2,
  "currency_rate": 40,
  "notes": "Para cumpleaños sorpresa"
}
```

#### 1.2 Frontend envía solicitud al backend

```
[REQUEST FRONTEND -> BACKEND]
POST /api/orders
Content-Type: application/json
{
  "order": {
    "customer_email": "cliente@example.com",
    "customer_name": "María González",
    "customer_phone": "+584121234567",
    "delivery_address": "Av. Principal, Urbanización Los Palos Grandes, Caracas",
    "delivery_date": "2025-10-20",
    "delivery_time_slot": "10:00-12:00",
    "delivery_notes": "Edificio Miraflores, apartamento 5A. Llamar al timbre.",
    "total_amount_usd": 91.98,
    "total_amount_ves": 3679.2,
    "currency_rate": 40,
    "notes": "Para cumpleaños sorpresa"
  },
  "items": [
    {
      "product_id": 67,
      "product_name": "Ramo Tropical Vibrante",
      "product_summary": "Flores tropicales vibrantes",
      "unit_price_usd": 45.99,
      "unit_price_ves": 1839.6,
      "quantity": 2,
      "subtotal_usd": 91.98,
      "subtotal_ves": 3679.2
    }
  ]
}
```

### 2. Backend - Recepción y procesamiento inicial

#### 2.1 API Route recibe la solicitud

```
[LOG] [ORDER API] POST /api/orders - Request received
[LOG] [ORDER API] Request body validation passed
[LOG] [ORDER API] Forwarding to orderController.createOrder
```

#### 2.2 Controller procesa la solicitud

```
[LOG] [ORDER CONTROLLER] createOrder called
[LOG] [ORDER CONTROLLER] Parsing order data from request body
[LOG] [ORDER CONTROLLER] Order data extracted:
{
  "customer_email": "cliente@example.com",
  "customer_name": "María González",
  "customer_phone": "+584121234567",
  "delivery_address": "Av. Principal, Urbanización Los Palos Grandes, Caracas",
  "delivery_date": "2025-10-20",
  "delivery_time_slot": "10:00-12:00",
  "delivery_notes": "Edificio Miraflores, apartamento 5A. Llamar al timbre.",
  "total_amount_usd": 91.98,
  "total_amount_ves": 3679.2,
  "currency_rate": 40,
  "notes": "Para cumpleaños sorpresa"
}

[LOG] [ORDER CONTROLLER] Items data extracted:
[
  {
    "product_id": 67,
    "product_name": "Ramo Tropical Vibrante",
    "product_summary": "Flores tropicales vibrantes",
    "unit_price_usd": 45.99,
    "unit_price_ves": 1839.6,
    "quantity": 2,
    "subtotal_usd": 91.98,
    "subtotal_ves": 3679.2
  }
]

[LOG] [ORDER CONTROLLER] Calling orderService.createOrderWithItems
```

### 3. Service Layer - Validación y creación

#### 3.1 Service recibe los datos para procesamiento

```
[LOG] [ORDER SERVICE] createOrderWithItems called
[LOG] [ORDER SERVICE] Validating order data...
[LOG] [ORDER SERVICE] Order validation passed
[LOG] [ORDER SERVICE] Validating order items (count: 1)...
```

#### 3.2 Validación de stock para cada producto

```
[LOG] [ORDER SERVICE] Validating stock for item:
{
  "product_id": 67,
  "product_name": "Ramo Tropical Vibrante",
  "quantity": 2
}

[LOG] [ORDER SERVICE] Checking product stock...
[QUERY] SELECT id, name, stock, active FROM products WHERE id = 67
[RESULT] {
  "id": 67,
  "name": "Ramo Tropical Vibrante",
  "stock": 15,
  "active": true
}

[LOG] [ORDER SERVICE] Product validation passed:
- Available stock: 15
- Required quantity: 2
- Product active: true
```

#### 3.3 Preparación de datos para inserción atómica

```
[LOG] [ORDER SERVICE] Preparing order data for atomic insertion
[LOG] [ORDER SERVICE] Sanitizing order data...
[LOG] [ORDER SERVICE] Order payload prepared:
{
  "user_id": null,
  "customer_email": "cliente@example.com",
  "customer_name": "María González",
  "customer_phone": "+584121234567",
  "delivery_address": "Av. Principal, Urbanización Los Palos Grandes, Caracas",
  "delivery_date": "2025-10-20",
  "delivery_time_slot": "10:00-12:00",
  "delivery_notes": "Edificio Miraflores, apartamento 5A. Llamar al timbre.",
  "status": "pending",
  "total_amount_usd": 91.98,
  "total_amount_ves": 3679,
  "currency_rate": 40,
  "notes": "Para cumpleaños sorpresa",
  "admin_notes": null
}

[LOG] [ORDER SERVICE] Preparing items data...
[LOG] [ORDER SERVICE] Items payload prepared:
[
  {
    "product_id": 67,
    "product_name": "Ramo Tropical Vibrante",
    "product_summary": "Flores tropicales vibrantes",
    "unit_price_usd": 45.99,
    "unit_price_ves": 1839,
    "quantity": 2,
    "subtotal_usd": 91.98,
    "subtotal_ves": 3678
  }
]
```

### 4. Database - Ejecución de función atómica

#### 4.1 Llamada a función almacenada RPC

```
[LOG] [ORDER SERVICE] Calling RPC function: create_order_with_items
[RPC CALL] SELECT * FROM rpc('create_order_with_items', {
  "order_data": {
    "user_id": null,
    "customer_email": "cliente@example.com",
    "customer_name": "María González",
    "customer_phone": "+584121234567",
    "delivery_address": "Av. Principal, Urbanización Los Palos Grandes, Caracas",
    "delivery_date": "2025-10-20",
    "delivery_time_slot": "10:00-12:00",
    "delivery_notes": "Edificio Miraflores, apartamento 5A. Llamar al timbre.",
    "status": "pending",
    "total_amount_usd": 91.98,
    "total_amount_ves": 3679,
    "currency_rate": 40,
    "notes": "Para cumpleaños sorpresa",
    "admin_notes": null
  },
  "order_items": [
    {
      "product_id": 67,
      "product_name": "Ramo Tropical Vibrante",
      "product_summary": "Flores tropicales vibrantes",
      "unit_price_usd": 45.99,
      "unit_price_ves": 1839,
      "quantity": 2,
      "subtotal_usd": 91.98,
      "subtotal_ves": 3678
    }
  ]
})
```

#### 4.2 Ejecución en la base de datos (PostgreSQL function)

```
[DB LOG] Function create_order_with_items started
[DB LOG] Step 1: Validating order data
[DB LOG] - Customer email: cliente@example.com
[DB LOG] - Total amount USD: 91.98
[DB LOG] - Currency rate: 40

[DB LOG] Step 2: Validating order items
[DB LOG] - Item count: 1
[DB LOG] - Item 1: Product ID 67, Quantity 2

[DB LOG] Step 3: Checking product existence and stock
[DB QUERY] SELECT id, name, stock, active FROM products WHERE id = 67 FOR UPDATE
[DB RESULT] {
  "id": 67,
  "name": "Ramo Tropical Vibrante",
  "stock": 15,
  "active": true
}

[DB LOG] - Product validation passed
- Available stock: 15
- Required quantity: 2
- Product active: true

[DB LOG] Step 4: Beginning transaction
[DB TRANSACTION] BEGIN

[DB LOG] Step 5: Inserting order
[DB QUERY] INSERT INTO orders (
  user_id, customer_email, customer_name, customer_phone,
  delivery_address, delivery_date, delivery_time_slot, delivery_notes,
  status, total_amount_usd, total_amount_ves, currency_rate,
  notes, admin_notes
) VALUES (
  NULL, 'cliente@example.com', 'María González', '+584121234567',
  'Av. Principal, Urbanización Los Palos Grandes, Caracas', '2025-10-20', '10:00-12:00', 'Edificio Miraflores, apartamento 5A. Llamar al timbre.',
  'pending', 91.98, 3679, 40,
  'Para cumpleaños sorpresa', NULL
) RETURNING id, created_at

[DB RESULT] {
  "id": 1001,
  "created_at": "2025-10-15 14:30:45"
}

[DB LOG] Step 6: Inserting order items
[DB QUERY] INSERT INTO order_items (
  order_id, product_id, product_name, product_summary,
  unit_price_usd, unit_price_ves, quantity,
  subtotal_usd, subtotal_ves
) VALUES (
  1001, 67, 'Ramo Tropical Vibrante', 'Flores tropicales vibrantes',
  45.99, 1839, 2,
  91.98, 3678
) RETURNING id

[DB RESULT] {
  "id": 2001
}

[DB LOG] Step 7: Updating product stock
[DB QUERY] UPDATE products SET stock = stock - 2 WHERE id = 67 RETURNING stock
[DB RESULT] {
  "stock": 13
}

[DB LOG] Step 8: Committing transaction
[DB TRANSACTION] COMMIT

[DB LOG] Function create_order_with_items completed successfully
[DB RESULT] {
  "order_id": 1001,
  "order_items_ids": [2001],
  "remaining_stock": 13
}
```

### 5. Service Layer - Respuesta y retorno

#### 5.1 Recepción de respuesta de la base de datos

```
[LOG] [ORDER SERVICE] RPC call successful
[LOG] [ORDER SERVICE] Order created with ID: 1001
[LOG] [ORDER SERVICE] Order items created: [2001]
[LOG] [ORDER SERVICE] Product stock updated successfully

[LOG] [ORDER SERVICE] Fetching complete order data...
[QUERY] SELECT * FROM orders WHERE id = 1001
[QUERY] SELECT * FROM order_items WHERE order_id = 1001

[RESULT] {
  "id": 1001,
  "customer_email": "cliente@example.com",
  "customer_name": "María González",
  "customer_phone": "+584121234567",
  "delivery_address": "Av. Principal, Urbanización Los Palos Grandes, Caracas",
  "delivery_date": "2025-10-20",
  "delivery_time_slot": "10:00-12:00",
  "delivery_notes": "Edificio Miraflores, apartamento 5A. Llamar al timbre.",
  "status": "pending",
  "total_amount_usd": 91.98,
  "total_amount_ves": 3679,
  "currency_rate": 40,
  "notes": "Para cumpleaños sorpresa",
  "created_at": "2025-10-15T14:30:45Z",
  "updated_at": "2025-10-15T14:30:45Z",
  "order_items": [
    {
      "id": 2001,
      "order_id": 1001,
      "product_id": 67,
      "product_name": "Ramo Tropical Vibrante",
      "product_summary": "Flores tropicales vibrantes",
      "unit_price_usd": 45.99,
      "unit_price_ves": 1839,
      "quantity": 2,
      "subtotal_usd": 91.98,
      "subtotal_ves": 3678,
      "created_at": "2025-10-15T14:30:45Z",
      "updated_at": "2025-10-15T14:30:45Z"
    }
  ]
}

[LOG] [ORDER SERVICE] Returning complete order data to controller
```

### 6. Controller - Preparación de respuesta

#### 6.1 Controller recibe datos completos del service

```
[LOG] [ORDER CONTROLLER] Received complete order data from service
[LOG] [ORDER CONTROLLER] Preparing JSON response
[LOG] [ORDER CONTROLLER] Response data:
{
  "success": true,
  "data": {
    "id": 1001,
    "customer_email": "cliente@example.com",
    "customer_name": "María González",
    "customer_phone": "+584121234567",
    "delivery_address": "Av. Principal, Urbanización Los Palos Grandes, Caracas",
    "delivery_date": "2025-10-20",
    "delivery_time_slot": "10:00-12:00",
    "delivery_notes": "Edificio Miraflores, apartamento 5A. Llamar al timbre.",
    "status": "pending",
    "total_amount_usd": 91.98,
    "total_amount_ves": 3679,
    "currency_rate": 40,
    "notes": "Para cumpleaños sorpresa",
    "created_at": "2025-10-15T14:30:45Z",
    "updated_at": "2025-10-15T14:30:45Z",
    "order_items": [
      {
        "id": 2001,
        "order_id": 1001,
        "product_id": 67,
        "product_name": "Ramo Tropical Vibrante",
        "product_summary": "Flores tropicales vibrantes",
        "unit_price_usd": 45.99,
        "unit_price_ves": 1839,
        "quantity": 2,
        "subtotal_usd": 91.98,
        "subtotal_ves": 3678,
        "created_at": "2025-10-15T14:30:45Z",
        "updated_at": "2025-10-15T14:30:45Z"
      }
    ]
  },
  "message": "Order created successfully"
}

[LOG] [ORDER CONTROLLER] Sending 201 Created response
```

### 7. Frontend - Recepción y procesamiento

#### 7.1 Frontend recibe respuesta exitosa

```
[LOG] [FRONTEND] Order creation response received
[LOG] [FRONTEND] Status: 201 Created
[LOG] [FRONTEND] Response data:
{
  "success": true,
  "data": {
    "id": 1001,
    "customer_email": "cliente@example.com",
    "customer_name": "María González",
    "customer_phone": "+584121234567",
    "delivery_address": "Av. Principal, Urbanización Los Palos Grandes, Caracas",
    "delivery_date": "2025-10-20",
    "delivery_time_slot": "10:00-12:00",
    "delivery_notes": "Edificio Miraflores, apartamento 5A. Llamar al timbre.",
    "status": "pending",
    "total_amount_usd": 91.98,
    "total_amount_ves": 3679,
    "currency_rate": 40,
    "notes": "Para cumpleaños sorpresa",
    "created_at": "2025-10-15T14:30:45Z",
    "updated_at": "2025-10-15T14:30:45Z",
    "order_items": [
      {
        "id": 2001,
        "order_id": 1001,
        "product_id": 67,
        "product_name": "Ramo Tropical Vibrante",
        "product_summary": "Flores tropicales vibrantes",
        "unit_price_usd": 45.99,
        "unit_price_ves": 1839,
        "quantity": 2,
        "subtotal_usd": 91.98,
        "subtotal_ves": 3678,
        "created_at": "2025-10-15T14:30:45Z",
        "updated_at": "2025-10-15T14:30:45Z"
      }
    ]
  },
  "message": "Order created successfully"
}

[LOG] [FRONTEND] Redirecting to payment page for order 1001
```

## Posibles Puntos de Fallo y Errores Comunes

### 1. Validación de Datos

```
[ERROR] [VALIDATION] Order validation failed
[DETAILS] {
  "customer_email": "Email is required and must be valid",
  "total_amount_usd": "Must be a positive number"
}
```

### 2. Stock Insuficiente

```
[ERROR] [STOCK] Insufficient stock for product
[DETAILS] {
  "product_id": 67,
  "product_name": "Ramo Tropical Vibrante",
  "requested": 5,
  "available": 3
}
```

### 3. Producto Inactivo

```
[ERROR] [PRODUCT] Product is not active
[DETAILS] {
  "product_id": 67,
  "product_name": "Ramo Tropical Vibrante"
}
```

### 4. Error de Base de Datos

```
[ERROR] [DATABASE] RPC call failed
[DETAILS] {
  "function": "create_order_with_items",
  "error_code": "23505",
  "message": "duplicate key value violates unique constraint"
}
```

### 5. Error de Conexión

```
[ERROR] [NETWORK] Database connection failed
[DETAILS] {
  "message": "Connection timeout",
  "timeout": 30000
}
```

### 6. Error de Transacción

```
[ERROR] [TRANSACTION] Transaction rollback
[DETAILS] {
  "step": "updating product stock",
  "message": "deadlock detected"
}
```

## Comandos de Diagnóstico

### 1. Verificar estado del pedido

```sql
-- Verificar si el pedido fue creado
SELECT * FROM orders WHERE id = 1001;

-- Verificar items del pedido
SELECT * FROM order_items WHERE order_id = 1001;

-- Verificar stock del producto
SELECT id, name, stock, active FROM products WHERE id = 67;
```

### 2. Verificar logs del sistema

```bash
# Ver logs de la aplicación
tail -f /var/log/floresya/app.log

# Ver logs de errores
tail -f /var/log/floresya/error.log

# Ver logs de base de datos
tail -f /var/log/postgresql/postgresql-13-main.log
```

### 3. Verificar conectividad

```bash
# Verificar conexión a la base de datos
ping -c 4 $SUPABASE_URL

# Verificar variables de entorno
echo $SUPABASE_URL
echo $SUPABASE_KEY
```

## Solución de Problemas Comunes

### 1. Si el pedido no se crea

1. **Verificar datos de entrada** - Asegurarse que todos los campos requeridos están presentes
2. **Verificar stock del producto** - Confirmar que hay suficiente inventario
3. **Verificar estado del producto** - Asegurarse que el producto está activo
4. **Revisar logs de error** - Buscar mensajes específicos de fallo

### 2. Si hay error de validación

1. **Revisar formato de email** - Debe ser válido
2. **Revisar montos** - Deben ser números positivos
3. **Revisar fechas** - Deben estar en formato YYYY-MM-DD
4. **Revisar cantidades** - Deben ser enteros positivos

### 3. Si hay error de stock

1. **Verificar disponibilidad real** - Consultar tabla products
2. **Verificar pedidos pendientes** - Pueden estar reservando stock
3. **Considerar tiempos de espera** - Pedidos pueden liberar stock después de expirar

### 4. Si hay error de base de datos

1. **Verificar conexión** - Asegurarse que el servicio está disponible
2. **Verificar credenciales** - Confirmar que las variables de entorno son correctas
3. **Verificar espacio en disco** - La base de datos puede estar llena
4. **Revisar límites de conexión** - Puede haber demasiadas conexiones simultáneas

Este workflow exhaustivo debería ayudarte a identificar exactamente dónde ocurre el error en el proceso de creación de pedidos.
