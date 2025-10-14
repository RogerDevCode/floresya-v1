# 🐛 Debug: Carousel "Failed to Fetch" en Móvil

## 📸 Problema Reportado

**Captura de pantalla del usuario:**

- Carousel muestra: "Error al cargar productos destacado"
- Mensaje: "Failed to fetch"
- Dispositivo: Móvil (5G, 67% batería, 20:24)

---

## ✅ Verificación Inicial

### **1. El API Endpoint SÍ Funciona**

```bash
curl https://floresya-v1.vercel.app/api/products/carousel
```

**Resultado:**

```json
{
  "success": true,
  "data": [
    /* 7 productos con imágenes */
  ],
  "message": "Carousel products retrieved successfully"
}
```

✅ **El endpoint retorna datos correctamente**

---

### **2. El API Client Auto-Detecta Correctamente**

```javascript
// api-client.js
constructor(baseUrl) {
  if (!baseUrl) {
    const isLocalhost = window.location.hostname === 'localhost' ||
                       window.location.hostname === '127.0.0.1'
    this.baseUrl = isLocalhost ? 'http://localhost:3000' : ''  // Relativo en prod
  }
}
```

✅ **En Vercel usa URLs relativas (correcto)**

---

## 🔍 Posibles Causas del Error

### **Causa 1: Timing Issue (más probable)**

**Problema:**
El código del carousel se ejecuta ANTES de que:

- El `api` client esté completamente inicializado
- El DOM esté listo
- Los módulos estén cargados

**Indicador:**

```javascript
console.log('🔍 [DEBUG] API instance available:', !!api) // Podría ser false
```

**Solución Implementada:**

- Ya usamos `onDOMReady()` pero podría haber race condition
- Agregados logs para verificar disponibilidad del `api`

---

### **Causa 2: Network Issue en Móvil**

**Problema:**
La conexión móvil (5G en la screenshot) podría tener:

- Latencia alta
- Request timeout muy corto
- Firewall/proxy de operadora bloqueando

**Indicador:**

```
NetworkError when attempting to fetch resource
```

**Verificación:**

1. Probar en WiFi vs 5G
2. Verificar si otros endpoints funcionan
3. Revisar tiempo de timeout

---

### **Causa 3: Service Worker Cache Antiguo**

**Problema:**
Aunque eliminamos el SW, el móvil podría tener:

- SW antiguo aún registrado
- Cache corrupto del navegador
- Cache de PWA manifest

**Solución:**
Usuario debe:

1. Ir a `floresya-v1.vercel.app/unregister-sw.html`
2. Click "Limpiar Todo"
3. Hard refresh (en móvil: Menú → Refrescar)

---

### **Causa 4: CSP Blocking Fetch**

**Problema:**
Content Security Policy podría estar bloqueando:

- Fetch requests
- XHR requests
- URLs relativas

**Verificación:**
Revisar consola por errores CSP:

```
Content Security Policy: The page's settings blocked...
```

---

## 🔧 Mejoras Implementadas

### **1. Mejor Logging**

**ANTES:**

```javascript
console.log('🔍 [DEBUG] API Base URL:', 'http://localhost:3000') // Hardcodeado
```

**DESPUÉS:**

```javascript
console.log('🔍 [DEBUG] Current hostname:', window.location.hostname)
console.log('🔍 [DEBUG] API instance available:', !!api)
```

### **2. Error Message Mejorado**

**ANTES:**

```html
<p class="text-lg">Error al cargar productos destacado</p>
<p class="text-sm mt-2">${error.message}</p>
```

**DESPUÉS:**

```html
<p class="text-lg font-semibold">No se pudieron cargar los productos destacados</p>
<p class="text-sm">Error de conexión con el servidor. Por favor, verifica tu conexión.</p>
<button onclick="window.location.reload()">Reintentar</button>
```

### **3. Logging Extendido**

```javascript
console.error('❌ [DEBUG] Error details:', {
  message: error.message,
  stack: error.stack,
  name: error.name,
  hostname: window.location.hostname, // NUEVO
  apiAvailable: typeof api !== 'undefined' // NUEVO
})
```

---

## 📱 Instrucciones para el Usuario

### **Paso 1: Limpiar Cache (IMPORTANTE)**

1. **En tu móvil, abre:**

   ```
   https://floresya-v1.vercel.app/unregister-sw.html
   ```

2. **Click en**: "🚀 Limpiar Todo"

3. **Espera**: Mensaje de éxito

4. **Cierra** la pestaña

---

### **Paso 2: Hard Refresh**

1. **Abre:** `https://floresya-v1.vercel.app`

2. **En el menú del navegador:**
   - Android Chrome: Menú (⋮) → ⚙️ → "Borrar datos de navegación"
   - iOS Safari: Configuración → Safari → "Borrar historial y datos"

3. **Recarga** la página

---

### **Paso 3: Verificar Consola (DevTools Remoto)**

**Si tienes acceso a DevTools remoto:**

1. **En desktop Chrome:** chrome://inspect
2. **Conecta** tu móvil vía USB
3. **Abre** floresya-v1.vercel.app en el móvil
4. **Click** "Inspect" en desktop
5. **Ve a Console** y busca:

```
🔍 [DEBUG] Starting carousel products fetch...
🔍 [DEBUG] Current hostname: floresya-v1.vercel.app
🔍 [DEBUG] API instance available: true  ← Debe ser true
```

**Si `apiAvailable` es `false`:**

- Hay un problema de importación de módulos
- El `api` client no se cargó correctamente

---

### **Paso 4: Probar Conexión Directa**

**En tu móvil, abre directamente el endpoint:**

```
https://floresya-v1.vercel.app/api/products/carousel
```

**Debes ver:**

```json
{
  "success": true,
  "data": [
    /* 7 productos */
  ],
  "message": "Carousel products retrieved successfully"
}
```

**Si NO se ve:**

- Problema de DNS
- Problema de red móvil
- Firewall/proxy bloqueando

---

## 🧪 Tests Adicionales

### **Test 1: Probar en WiFi vs Datos Móviles**

1. Conecta a WiFi
2. Abre `floresya-v1.vercel.app`
3. ¿Funciona el carousel?

**Si funciona en WiFi pero NO en móvil:**

- La operadora móvil (LTE/5G) está bloqueando o throttling

---

### **Test 2: Probar en Navegador Diferente**

1. Instala otro navegador (Firefox, Brave, Opera)
2. Abre `floresya-v1.vercel.app`
3. ¿Funciona el carousel?

**Si funciona en otro navegador:**

- El navegador original tiene cache corrupto o SW antiguo

---

### **Test 3: Probar Modo Incógnito**

1. Abre navegador en modo incógnito/privado
2. Abre `floresya-v1.vercel.app`
3. ¿Funciona el carousel?

**Si funciona en incógnito:**

- Cache del navegador está corrupto
- SW antiguo aún registrado

---

## 📊 Deploy Status

```
Commit: 6c109ab
Mensaje: fix: improve carousel error handling and logging
Status: ✅ Pushed to main
Vercel: Deploy en progreso (~3 minutos)
```

---

## ⏱️ Próximos Pasos

### **Después de que Vercel termine el deploy (~3 min):**

1. **Abre en móvil:** `https://floresya-v1.vercel.app`

2. **Hard refresh** (Menú → Refrescar)

3. **Observa** el carousel:
   - ✅ Si carga: Problema resuelto
   - ❌ Si error: Ahora verás mejor información con botón "Reintentar"

4. **Si sigue el error:**
   - Click en "Reintentar"
   - Si persiste, reporta con screenshot de la consola

---

## 🆘 Si Aún No Funciona

**Envía:**

1. **Screenshot** del error (con botón "Reintentar" visible)

2. **Screenshot** de la consola (si es posible con DevTools remoto):
   - Busca logs que empiecen con `🔍 [DEBUG]`
   - Busca logs que empiecen con `❌ [DEBUG]`

3. **Información del dispositivo:**
   - Navegador (Chrome, Safari, Firefox)
   - Versión del navegador
   - Sistema operativo (Android, iOS)
   - Conexión (WiFi, 4G, 5G)

4. **Test del endpoint directo:**
   - ¿Funciona `https://floresya-v1.vercel.app/api/products/carousel` en el móvil?
   - Sí / No / Error específico

Con esta información podré identificar exactamente el problema.

---

## 📝 Resumen de Cambios

**Mejoras aplicadas:**

1. ✅ Logging mejorado (hostname, apiAvailable)
2. ✅ Error message más claro y user-friendly
3. ✅ Botón "Reintentar" para UX
4. ✅ Debugging extendido en consola
5. ✅ Guía de troubleshooting para usuario

**El deploy estará listo en ~3 minutos.** 🚀
