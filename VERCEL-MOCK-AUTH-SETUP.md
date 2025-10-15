# 🔧 Configurar Mock Auth en Vercel

## ⚠️ Problema Actual

El panel de administrador **NO funciona en Vercel** porque:

- ✅ Frontend envía token mock correctamente
- ✅ Backend recibe el token
- ❌ Backend lo **rechaza** porque `NODE_ENV=production`

**Error:** `401 Unauthorized - Please log in to continue`

---

## ✅ Solución: Variable de Entorno

He agregado una flag `ALLOW_MOCK_AUTH` que permite el mock auth en Vercel **sin cambiar NODE_ENV**.

### **Cómo Funciona:**

```javascript
// Backend (api/middleware/auth.js)
const ALLOW_MOCK_AUTH = process.env.ALLOW_MOCK_AUTH === 'true' || IS_DEV

if (ALLOW_MOCK_AUTH && token === 'dev-mock-token-admin-floresya') {
  // ✅ Acepta el token mock
  req.user = DEV_MOCK_USER
  return next()
}

// Si no es mock, verifica JWT normal con Supabase
```

---

## 📋 Configuración en Vercel (5 Pasos)

### **Paso 1: Ir a Vercel Dashboard**

```
https://vercel.com/dashboard
```

1. Haz login en Vercel
2. Busca tu proyecto: **floresya-v1**
3. Click en el proyecto

---

### **Paso 2: Abrir Settings**

1. En el proyecto, click en **"Settings"** (arriba)
2. En el sidebar izquierdo, click en **"Environment Variables"**

---

### **Paso 3: Agregar Nueva Variable**

1. Click en el botón **"Add New"** (o "Add")
2. Verás un formulario con estos campos:
   - **Name:** `ALLOW_MOCK_AUTH`
   - **Value:** `true`
   - **Environment:** Selecciona **Production**, **Preview**, y **Development** (todas)

3. Click **"Save"**

---

### **Paso 4: Redeploy**

**Opción A: Desde Vercel Dashboard**

```
1. Ve a "Deployments" (tab superior)
2. Busca el deployment más reciente
3. Click en los "..." (3 puntos)
4. Click "Redeploy"
5. Confirma
```

**Opción B: Desde Git**

```bash
# Cualquier push dispara redeploy automático
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

---

### **Paso 5: Verificar**

1. **Espera ~3 minutos** (deploy de Vercel)

2. **Abre el admin panel:**

   ```
   https://floresya-v1.vercel.app/pages/admin/dashboard.html
   ```

3. **Verifica en Console (F12):**

   ```
   ⚠️ MOCK AUTH ENABLED IN PRODUCTION
   ⚠️ MOCK AUTH: Accepted mock token in production
   ```

4. **Dashboard debe cargar datos:**
   - Total Pedidos: [número]
   - Ventas Totales: [número]
   - Stats visibles

5. ✅ **Si ves datos = FUNCIONA**

---

## 🔍 Verificar Configuración

### **Check 1: Variable Existe**

En Vercel:

1. Settings → Environment Variables
2. Busca: `ALLOW_MOCK_AUTH`
3. Value debe ser: `true`
4. Environment: Production, Preview, Development

### **Check 2: Logs del Backend**

En Vercel:

1. Ve a "Deployments"
2. Click en el deployment actual
3. Click en "Functions" tab
4. Click en cualquier función (ej: `/api/orders`)
5. Busca log: `⚠️ MOCK AUTH ENABLED IN PRODUCTION`

Si ves ese log = Variable configurada correctamente

### **Check 3: Request Headers**

En navegador (F12 → Network):

1. Refresh admin dashboard
2. Busca request a `/api/orders`
3. Click → Headers
4. Verifica: `Authorization: Bearer dev-mock-token-admin-floresya`

Si el header existe pero sigue 401:

- La variable NO está configurada
- O el deployment NO incluyó el cambio

---

## 🐛 Troubleshooting

### **Problema 1: Sigue con 401 después de configurar**

**Causa:** El deployment no incluyó el cambio

**Solución:**

```bash
# Forzar nuevo deployment
cd /home/manager/Sync/floresya-v1
git commit --allow-empty -m "redeploy: enable mock auth"
git push origin main

# Esperar 3 minutos
# Probar de nuevo
```

---

### **Problema 2: Variable no aparece en Vercel**

**Causa:** No se guardó correctamente

**Solución:**

1. Vercel Dashboard → Settings → Environment Variables
2. Verificar que existe `ALLOW_MOCK_AUTH`
3. Si NO existe, agregarla de nuevo:
   - Name: `ALLOW_MOCK_AUTH`
   - Value: `true` (sin comillas)
   - Environment: Todas las opciones marcadas
4. Save
5. Redeploy

---

### **Problema 3: Backend log no muestra warning**

**Causa:** Variable mal configurada o deployment antiguo

**Verificar:**

1. Settings → Environment Variables
2. `ALLOW_MOCK_AUTH` debe ser exactamente `true` (lowercase)
3. **No** usar: `"true"`, `True`, `TRUE`, `1`, `yes`
4. **Usar:** `true`

**Fix:**

1. Editar la variable
2. Cambiar valor a: `true`
3. Save
4. Redeploy

---

### **Problema 4: Funciona en localhost pero NO en Vercel**

**Causa:** Variable solo en Production pero estás en Preview

**Solución:**

1. Settings → Environment Variables
2. Editar `ALLOW_MOCK_AUTH`
3. Asegurar que está marcada en:
   - ☑ Production
   - ☑ Preview
   - ☑ Development
4. Save
5. Redeploy

---

## ⚠️ Advertencias de Seguridad

### **1. Solo para Desarrollo**

```
⚠️ NUNCA dejar esto en producción real
⚠️ Cualquiera con URL puede acceder al admin
⚠️ No hay validación de usuario real
```

### **2. Remover Antes de Lanzamiento**

**Checklist pre-producción:**

- [ ] Implementar login page real
- [ ] Integrar Supabase Auth
- [ ] Remover ALLOW_MOCK_AUTH de Vercel
- [ ] Remover bypass del backend (auth.js)
- [ ] Testear con usuarios reales

### **3. Logs Visibles**

El backend loguea cada uso del mock:

```
⚠️ MOCK AUTH: Accepted mock token in production
email: dev@floresya.local
role: admin
path: /api/orders
```

Estos logs son visibles en Vercel → Functions → Logs

---

## 📊 Resumen de Cambios

### **Backend (api/middleware/auth.js)**

```javascript
// ANTES
const IS_DEV = process.env.NODE_ENV === 'development'
if (IS_DEV) {
  // Mock auth solo en localhost
}

// DESPUÉS
const ALLOW_MOCK_AUTH = process.env.ALLOW_MOCK_AUTH === 'true' || IS_DEV
if (ALLOW_MOCK_AUTH && token === MOCK_TOKEN) {
  // Mock auth también en Vercel (temporal)
}
```

### **Vercel Environment Variables**

```
ALLOW_MOCK_AUTH=true  ← AGREGAR ESTA
SUPABASE_URL=...
SUPABASE_KEY=...
NODE_ENV=production
```

---

## 📞 Siguiente Paso

**Después de configurar:**

1. ✅ Verifica que `ALLOW_MOCK_AUTH=true` está en Vercel
2. ✅ Haz redeploy (push o manual)
3. ✅ Espera 3 minutos
4. ✅ Abre: `https://floresya-v1.vercel.app/pages/admin/dashboard.html`
5. ✅ Verifica que carga datos sin 401

**Si funciona:**

- 🎉 Admin panel operativo
- Puedes desarrollar sin fricción
- Mock auth activo hasta implementar auth real

**Si NO funciona:**

- Ver troubleshooting arriba
- Verificar logs en Vercel
- Confirmar que variable está configurada
- Asegurar que deployment incluyó cambios

---

## 🚀 Deploy Status

```
Commit: 9074f01
Changes: ALLOW_MOCK_AUTH flag in auth.js
Status: ✅ Pushed to main
Vercel: Deploy automático (~3 min)
```

**Después del deploy, configura la variable y redeploy para que funcione.** 🔧

---

**Last Updated:** 2025-01-14 (Commit: 9074f01)
