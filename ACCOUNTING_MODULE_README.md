# 📊 Módulo de Contabilidad - FloresYa

**Estado:** ✅ Backend 100% Completado  
**Fecha:** 2025-11-19  
**Versión:** 1.0.0  

---

## 🎯 RESUMEN EJECUTIVO

Módulo de contabilidad simple para PYME/floristería que permite:
- ✅ Registro de gastos operacionales
- ✅ Reportes semanales/mensuales automáticos
- ✅ Cálculo de ganancias netas
- ✅ Gastos por categoría
- ✅ Solo accesible por administradores

**Moneda:** USD  
**Control de acceso:** Solo Admin  

---

## 📦 ARCHIVOS CREADOS

### Backend (9 archivos):
```
api/middleware/auth/requireAdmin.js          - Middleware autorización admin
api/repositories/expenseRepository.js        - Data access layer
api/services/expenseService.js               - Business logic gastos
api/services/reportService.js                - Business logic reportes
api/controllers/expenseController.js         - HTTP handlers gastos
api/controllers/reportController.js          - HTTP handlers reportes
api/routes/accounting.routes.js              - Definición de rutas
api/app.js                                   - MODIFICADO (rutas integradas)
database/migrations/004_build_views_*.sql    - Schemas SQL
```

---

## 🗄️ BASE DE DATOS

### Tabla: `expenses`
```sql
- id (SERIAL)
- category (TEXT) - flores, transporte, empaque, personal, servicios, marketing, otros
- description (TEXT)
- amount (NUMERIC) - En USD
- expense_date (DATE)
- payment_method (TEXT)
- receipt_url (TEXT) - Opcional
- notes (TEXT)
- created_by (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- active (BOOLEAN) - Soft delete
```

### Vistas SQL:
- `daily_sales` - Ventas diarias agregadas
- `daily_expenses` - Gastos diarios por categoría
- `daily_profit_loss` - Ganancias/pérdidas diarias

---

## 🚀 API ENDPOINTS

**Base:** `/api/accounting`  
**Auth:** Requiere autenticación + rol admin  

### Gestión de Gastos:
```
POST   /api/accounting/expenses
       Body: { category, description, amount, expense_date?, payment_method?, notes? }
       
GET    /api/accounting/expenses
       Query: startDate?, endDate?, category?, limit?, offset?
       
GET    /api/accounting/expenses/:id
       
PUT    /api/accounting/expenses/:id
       Body: { category?, description?, amount?, ... }
       
DELETE /api/accounting/expenses/:id
       (Soft delete - marca active=false)
       
GET    /api/accounting/expenses/by-category
       Query: startDate, endDate (required)
```

### Reportes:
```
GET    /api/accounting/reports/dashboard
       Resumen últimos 7 días
       
GET    /api/accounting/reports/weekly
       Query: weekStart (YYYY-MM-DD - lunes de la semana)
       
GET    /api/accounting/reports/monthly
       Query: year, month
       
GET    /api/accounting/reports/current-week
       Semana actual automática
       
GET    /api/accounting/reports/current-month
       Mes actual automático
```

---

## 🧪 TESTING

### Iniciar servidor:
```bash
npm run dev
```

### Probar con cURL:
```bash
# Dashboard (requiere token de admin)
curl http://localhost:3001/api/accounting/reports/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Crear gasto
curl -X POST http://localhost:3001/api/accounting/expenses \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "flores",
    "description": "Rosas importadas",
    "amount": 180.50,
    "payment_method": "transferencia"
  }'

# Listar gastos
curl http://localhost:3001/api/accounting/expenses \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📋 VALIDACIONES

### Categorías válidas:
- `flores`
- `transporte`
- `empaque`
- `personal`
- `servicios`
- `marketing`
- `otros`

### Métodos de pago:
- `efectivo`
- `transferencia`
- `tarjeta_debito`
- `tarjeta_credito`
- `pago_movil`
- `zelle`
- `otro`

### Reglas de negocio:
- Amount > 0 (obligatorio)
- Category obligatoria y debe ser válida
- Description obligatoria
- expense_date default: hoy
- Soft delete (no se borra físicamente)

---

## 🔐 SEGURIDAD

- ✅ Middleware `requireAdmin` en todas las rutas
- ✅ Autenticación requerida
- ✅ Validación de rol admin
- ✅ Sanitización de inputs
- ✅ Validación de tipos
- ✅ RLS desactivado (control en backend)

---

## ⏭️ PENDIENTE (Frontend)

### Por implementar:
1. **Helper de autenticación frontend:**
   - `public/js/utils/adminAuth.js`
   - Verificar rol admin
   - Redirect si no es admin

2. **Dashboard UI:**
   - Sección de contabilidad en dashboard
   - Cards con métricas (ventas, gastos, ganancia)
   - Lista de gastos recientes

3. **Modal de gastos:**
   - Formulario crear/editar gasto
   - Validación frontend
   - Selector de categorías
   - Date picker

4. **Gráficos:**
   - Chart.js para visualización
   - Ventas vs Gastos (barras)
   - Gastos por categoría (pie)
   - Tendencia semanal/mensual

5. **Tema dark/light:**
   - Integrar con sistema existente
   - Variables CSS

6. **API Client:**
   - Métodos en `api-client.js`
   - Type definitions

---

## 📊 ESTRUCTURA DE REPORTES

### Dashboard (7 días):
```json
{
  "period": "last_7_days",
  "sales": 1250.00,
  "expenses": 450.00,
  "profit": 800.00,
  "recentExpenses": [...]
}
```

### Reporte Semanal:
```json
{
  "period": { "start": "2025-11-18", "end": "2025-11-24", "type": "weekly" },
  "sales": { "total": 2500.00, "orders": 15, "averageTicket": 166.67 },
  "expenses": { "total": 850.00, "byCategory": {...}, "count": 12 },
  "profit": { "net": 1650.00, "margin": 66.00 }
}
```

### Reporte Mensual:
```json
{
  "period": { "year": 2025, "month": 11, "type": "monthly" },
  "sales": { "total": 10500.00, "orders": 65, "averageDaily": 350.00 },
  "expenses": { "total": 3200.00, "byCategory": {...}, "averageDaily": 106.67 },
  "profit": { "net": 7300.00, "margin": 69.52 },
  "topProducts": [...]
}
```

---

## 🔧 TROUBLESHOOTING

### Error: "Admin access required"
- Verificar que el usuario tenga `user_metadata.role = 'admin'`
- Verificar token de autenticación válido

### Error: "Invalid category"
- Usar solo categorías válidas listadas arriba
- Case-sensitive

### Error: "Amount must be greater than 0"
- amount debe ser número positivo
- Formato: 123.45 (sin símbolo $)

---

## 📝 NOTAS TÉCNICAS

- **Currency:** Todos los montos en USD
- **Timezone:** UTC (se ajusta en frontend)
- **Soft Delete:** Los gastos eliminados tienen `active=false`
- **Performance:** Índices en expense_date, category, created_at
- **Trigger:** updated_at se actualiza automáticamente

---

## ✅ CHECKLIST DE DEPLOYMENT

- [x] Tabla expenses creada en Supabase
- [x] Vistas SQL creadas
- [x] Backend routes integradas
- [x] Middleware requireAdmin activo
- [x] Validaciones implementadas
- [ ] Frontend UI creado
- [ ] Tests E2E
- [ ] Documentación OpenAPI
- [ ] Logs de auditoría admin

---

**Última actualización:** 2025-11-19 15:34 UTC  
**Autor:** FloresYa Dev Team  
**Licencia:** Private  

