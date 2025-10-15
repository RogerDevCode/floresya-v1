# 🔓 Admin Panel - Mock Authentication Guide

## ✅ What's Implemented

El panel de administrador ahora tiene **autenticación simulada (mock)** para desarrollo.

### **Cómo Funciona**

1. **Auto-login automático**
   - Al abrir cualquier página admin, se crea un usuario mock
   - No necesitas hacer login manualmente
   - Token mock se guarda en `localStorage`

2. **Token incluido en requests**
   - Todas las peticiones al backend incluyen `Authorization: Bearer <token>`
   - El backend acepta el token mock en modo desarrollo
   - Sin errores 401 Unauthorized

3. **Usuario Mock**

   ```javascript
   Email: admin@floresya.dev
   Role: admin
   Token: dev-mock-token-admin-floresya
   ```

4. **Warning Banner**
   - Banner amarillo al abrir el admin
   - Te recuerda que es modo desarrollo
   - Se auto-cierra en 10 segundos

---

## 📱 Cómo Usar

### **Desktop**

1. Abre: `https://floresya-v1.vercel.app/pages/admin/dashboard.html`
2. Verás banner amarillo: "⚠️ DEVELOPMENT MODE - Mock Authentication Active"
3. Dashboard carga datos automáticamente
4. ✅ Funciona todo sin login

### **Mobile**

1. Abre en tu móvil: `https://floresya-v1.vercel.app/pages/admin/dashboard.html`
2. Banner amarillo aparece (dismiss si molesta)
3. Click en hamburguesa (☰) para abrir sidebar
4. ✅ Navegación + datos funcionan

---

## 🔍 Verificar que Funciona

### **Test 1: Dashboard Stats**

- Abre dashboard
- Debes ver números en las tarjetas de stats:
  - Total Pedidos: [número]
  - Ventas Totales USD: [número]
  - Pendientes, Verificados, etc.
- ✅ Si ves números = funciona

### **Test 2: Console Logs**

Abre DevTools (F12) → Console:

```
╔═══════════════════════════════════════════════════════════╗
║  🔓 AUTH MOCK ACTIVE - DEVELOPMENT MODE                   ║
║  ⚠️  WARNING: No real authentication!                    ║
╚═══════════════════════════════════════════════════════════╝
```

- ✅ Si ves este log = mock activo

### **Test 3: Network Tab**

DevTools → Network → Refresh:

- Busca request a `/api/orders`
- Click en el request → Headers
- Verás: `Authorization: Bearer dev-mock-token-admin-floresya`
- ✅ Si ves el header = token enviado

### **Test 4: LocalStorage**

DevTools → Application → Local Storage:

```
auth_token: "dev-mock-token-admin-floresya"
auth_user: {"id":"...","email":"admin@floresya.dev","role":"admin"}
```

- ✅ Si ves estos valores = mock guardado

---

## ⚠️ Advertencias Importantes

### **1. Solo para Desarrollo**

```
⚠️ NUNCA uses esto en producción
⚠️ Cualquiera puede acceder al admin panel
⚠️ No hay seguridad real
```

### **2. Deshabilitar el Mock**

**Opción A: Cambiar variable en authMock.js**

```javascript
// public/js/services/authMock.js
const DEV_MODE = false // ← Cambiar a false
```

**Opción B: Remover import en dashboard.js**

```javascript
// public/pages/admin/dashboard.js
// Comentar o eliminar esta línea:
import '../../js/services/authMock.js'
```

**Opción C: Borrar token de localStorage**

```javascript
// En console del navegador:
localStorage.removeItem('auth_token')
localStorage.removeItem('auth_user')
```

### **3. Backend Requiere NODE_ENV=development**

El backend acepta el token mock **solo si**:

```javascript
// api/middleware/auth.js
const IS_DEV = process.env.NODE_ENV === 'development'
```

En **Vercel**, si `NODE_ENV !== 'development'`, el mock **NO funcionará**.

Verifica las variables de entorno en Vercel:

1. Dashboard de Vercel → Project Settings
2. Environment Variables
3. Busca `NODE_ENV`
4. Debe estar en `development` para que funcione

---

## 🚀 Antes de Producción

### **Checklist de Limpieza**

- [ ] **Eliminar authMock.js**

  ```bash
  rm public/js/services/authMock.js
  ```

- [ ] **Remover import en dashboard.js**

  ```javascript
  // Eliminar esta línea:
  import '../../js/services/authMock.js'
  ```

- [ ] **Implementar login real**
  - Crear `/pages/admin/login.html`
  - Crear `/js/services/authService.js`
  - Integrar con Supabase Auth
  - Ver `ADMIN-AUTH-TODO.md` para guía completa

- [ ] **Cambiar NODE_ENV en Vercel**

  ```
  NODE_ENV=production
  ```

- [ ] **Testear en producción**
  - Verificar que login page funciona
  - Verificar que sin token = redirect a login
  - Verificar que token válido = acceso a admin

---

## 🐛 Troubleshooting

### **Problema: Sigo viendo 401 Unauthorized**

**Causa:** El token mock no se está enviando

**Solución:**

1. Abre DevTools → Console
2. Busca: "🔓 AUTH MOCK ACTIVE"
3. Si NO aparece:
   - El import de authMock no se ejecutó
   - Verifica que `import '../../js/services/authMock.js'` existe
   - Haz hard refresh (Ctrl + Shift + R)

4. Verifica localStorage:

   ```javascript
   console.log(localStorage.getItem('auth_token'))
   // Debe mostrar: "dev-mock-token-admin-floresya"
   ```

5. Si token existe pero sigue error 401:
   - El backend NO está en modo development
   - Verifica `NODE_ENV` en Vercel
   - O ejecuta localmente con `npm run dev`

---

### **Problema: Banner amarillo no desaparece**

**Causa:** Es normal, es un recordatorio

**Solución:**

```javascript
// Opción 1: Click en "Dismiss"
// Opción 2: Auto-desaparece en 10 segundos
// Opción 3: Remover con console:
document.getElementById('dev-auth-warning')?.remove()
```

---

### **Problema: Dashboard no carga datos**

**Causa:** Backend no acepta el token mock

**Verificar:**

1. ¿Está ejecutando en localhost?
   - `npm run dev` → `http://localhost:3000`
   - Backend acepta mock automáticamente

2. ¿Está en Vercel?
   - Verifica `NODE_ENV=development` en settings
   - Si es `production`, el mock NO funciona

**Solución temporal:**

```bash
# Ejecutar localmente
npm run dev
# Abrir: http://localhost:3000/pages/admin/dashboard.html
```

---

### **Problema: Quiero probarlo en móvil pero sigue con 401**

**Causa:** Vercel tiene `NODE_ENV=production`

**Solución:**

1. **Opción A: Cambiar env en Vercel (recomendado)**
   - Vercel Dashboard → Settings → Environment Variables
   - Cambiar `NODE_ENV` a `development`
   - Redeploy

2. **Opción B: Tunneling desde localhost**
   ```bash
   # Instalar ngrok o similar
   npm run dev  # Puerto 3000
   ngrok http 3000
   # Usar URL pública en móvil
   ```

---

## 📊 Deploy Status

```
Commit: 26efa25
Files: authMock.js (nuevo), api-client.js, dashboard.js
Status: ✅ Deployed to Vercel
Mock Auth: ✅ Active in development mode
```

---

## 📞 Next Steps

1. **Probar en desktop**
   - Dashboard debe cargar stats
   - No debe haber errores 401
   - Banner amarillo debe aparecer

2. **Probar en móvil**
   - Hamburger menu debe funcionar
   - Dashboard debe cargar datos
   - Banner debe ser responsive

3. **Desarrollar features admin**
   - Ya no hay fricción de auth
   - Puedes trabajar libremente
   - Mock se encarga de todo

4. **Implementar auth real cuando sea el momento**
   - Ver `ADMIN-AUTH-TODO.md`
   - Seguir checklist de limpieza
   - Testear en producción

---

**El panel de admin ya está listo para desarrollo sin fricción.** 🎉

**Última actualización:** 2025-01-14 (Commit: 26efa25)
