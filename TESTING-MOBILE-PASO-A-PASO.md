# 📱 Testing Móvil - Paso a Paso

## ⚠️ IMPORTANTE: Debes limpiar el cache PRIMERO

---

## 🔧 Paso 1: Limpiar Cache y Service Worker

### **Opción A: Usar la herramienta de limpieza**

1. Abre en tu navegador:

   ```
   http://localhost:3000/unregister-sw.html
   ```

2. Click en el botón **"🚀 Limpiar Todo"**

3. Espera el mensaje: "✅ Limpieza completada"

4. Cierra esta pestaña

---

### **Opción B: Limpieza manual (DevTools)**

1. Abre: `http://localhost:3000/index.html`

2. Presiona **F12** (abre DevTools)

3. Ve a la pestaña **"Application"** (o "Aplicación")

4. En el menú lateral izquierdo:
   - Click en **"Service Workers"**
   - Si hay algún SW, click en **"Unregister"**
   - Click en **"Storage"** → **"Clear site data"**
   - Marca TODAS las casillas
   - Click en **"Clear site data"**

5. Cierra DevTools

---

## 📱 Paso 2: Testear Botón Hamburguesa en Móvil

### **1. Abre en modo móvil:**

1. Presiona **F12** (abre DevTools)

2. Click en el icono **"Toggle device toolbar"** (icono de celular/tablet)
   - Atajo: `Ctrl+Shift+M` (Windows/Linux) o `Cmd+Shift+M` (Mac)

3. Selecciona dispositivo: **"iPhone SE"** o **"Pixel 5"**

4. Asegúrate que el ancho sea **375px o menos**

---

### **2. Hard Refresh (CRÍTICO):**

**Windows/Linux:**

```
Ctrl + Shift + R
```

**Mac:**

```
Cmd + Shift + R
```

Debes ver en la consola (F12 → Console):

```
✅ [index.js] Mobile navigation initialized successfully
```

---

### **3. Verifica el botón hamburguesa:**

**¿Qué VER?**

En la esquina superior derecha del navbar, debe haber un botón con **3 líneas horizontales** (≡):

```
┌─────────────────────────────────┐
│ 🌸 FloresYa        🛒 [≡]      │  ← Botón hamburguesa aquí
└─────────────────────────────────┘
```

**SI NO VES EL BOTÓN:**

- Estás en desktop mode (>768px width)
- Reduce el ancho a 375px
- Hard refresh de nuevo

---

### **4. Testea el botón:**

1. **Click en el botón hamburguesa (≡)**

**¿Qué debe pasar?**

- ✅ Un drawer (menú) se desliza desde la DERECHA
- ✅ Un overlay oscuro cubre el fondo
- ✅ Se ve el menú con: Inicio, Productos, Contacto, etc.

**Ejemplo visual:**

```
┌────────┬──────────────┐
│ Overlay│  ┌──────────┐│
│ oscuro │  │ • Inicio  ││ ← Drawer
│        │  │ • Productos││
│        │  │ • Contacto││
│        │  └──────────┘│
└────────┴──────────────┘
```

2. **Click en el overlay oscuro (fuera del drawer)**

**¿Qué debe pasar?**

- ✅ El drawer se cierra
- ✅ El overlay desaparece
- ✅ Vuelves a ver la página normal

---

### **❌ SI NO FUNCIONA:**

Abre la consola (F12 → Console) y busca errores:

**Error común:**

```
❌ MobileNav: Menu button not found with selector "#mobile-menu-btn"
```

**Solución:**

```bash
# Verifica que el HTML tiene el botón
cd /home/manager/Sync/floresya-v1
grep -n "mobile-menu-btn" public/index.html
```

Debe mostrar algo como:

```html
<button class="mobile-menu-toggle" id="mobile-menu-btn"></button>
```

---

## 🖼️ Paso 3: Testear Imágenes

### **1. Con DevTools abierto:**

1. Abre la pestaña **"Network"**

2. Filtra por: **"Img"**

3. **Hard Refresh de nuevo**: `Ctrl+Shift+R`

---

### **2. Observa la carga de imágenes:**

Busca en la lista de network requests:

**Primera imagen del carousel (debe aparecer casi inmediatamente):**

```
product_X_1_....webp
Priority: High     ← DEBE DECIR "High"
Time: < 300ms      ← Debe ser rápido
Status: 200
```

**Primeras imágenes del grid (primeros 8 productos):**

```
product_XX_1_....webp   Priority: High   Time: < 300ms
product_XX_1_....webp   Priority: High   Time: < 300ms
...
```

**Resto de imágenes (después del scroll):**

```
product_XX_1_....webp   Priority: Low    ← Estas sí pueden ser "Low"
```

---

### **3. Verifica visualmente:**

**¿Qué VER al cargar la página?**

✅ **ANTES de la reparación** (lo que NO debes ver):

```
┌─────────────┐
│   [⬜]      │  ← Placeholders en blanco
│   [⬜][⬜]  │
│   [⬜][⬜]  │
└─────────────┘
  (espera ~500ms para ver imágenes)
```

✅ **DESPUÉS de la reparación** (lo que DEBES ver):

```
┌─────────────┐
│   [🌸]      │  ← Imágenes visibles INMEDIATAMENTE
│   [🌹][🌷]  │
│   [🌻][🌺]  │
└─────────────┘
  (< 200ms, sin placeholders)
```

---

## 🎯 Comparación Rápida

### **ANTES (con problemas):**

- ❌ Click en hamburguesa → No pasa nada
- ❌ Imágenes tardan ~500ms en aparecer
- ❌ Placeholders en blanco visibles

### **DESPUÉS (reparado):**

- ✅ Click en hamburguesa → Drawer se abre
- ✅ Imágenes aparecen en <200ms
- ✅ NO placeholders, página completa desde inicio

---

## 🐛 Debugging

### **Problema 1: Botón hamburguesa no aparece**

**Causa:** Estás en desktop mode (>768px)

**Solución:**

1. DevTools → Toggle device toolbar
2. Selecciona "iPhone SE" (375px width)
3. Hard refresh

---

### **Problema 2: Botón visible pero no funciona**

**Causa:** Cache antiguo del Service Worker

**Solución:**

1. Ve a: `http://localhost:3000/unregister-sw.html`
2. Click "🚀 Limpiar Todo"
3. Hard refresh en index.html

---

### **Problema 3: Imágenes aún lentas**

**Causa:** Cache del navegador

**Solución:**

1. F12 → Network
2. Check "Disable cache"
3. Hard refresh (Ctrl+Shift+R)
4. Verifica "Priority: High" en primeras imágenes

---

### **Problema 4: No veo diferencia en nada**

**Posibles causas:**

1. ❌ No hiciste hard refresh → `Ctrl+Shift+R`
2. ❌ Servidor no reiniciado → `npm run dev`
3. ❌ Cache no limpiado → Usa unregister-sw.html
4. ❌ Estás en desktop → Cambia a móvil (375px)

**Solución:**

```bash
# 1. Mata el servidor
pkill -f "node.*server.js"

# 2. Reinicia
npm run dev

# 3. En navegador:
# - Ve a: http://localhost:3000/unregister-sw.html
# - Click "Limpiar Todo"
# - Ve a: http://localhost:3000/index.html
# - F12 → Toggle device toolbar (móvil 375px)
# - Ctrl+Shift+R (hard refresh)
```

---

## ✅ Checklist Final

Marca cada ítem después de verificar:

### **Botón Hamburguesa:**

- [ ] Botón (≡) visible en esquina superior derecha (móvil)
- [ ] Click en botón abre drawer desde derecha
- [ ] Overlay oscuro cubre el fondo
- [ ] Click en overlay cierra el drawer
- [ ] Animación suave (250ms)
- [ ] Links del menú funcionan

### **Imágenes:**

- [ ] Primera imagen del carousel aparece <200ms
- [ ] Primeros 8 productos del grid cargan inmediatamente
- [ ] NO hay placeholders en blanco al inicio
- [ ] Network tab muestra "Priority: High" para primeras imágenes
- [ ] Resto de imágenes cargan al hacer scroll (lazy)

### **Console:**

- [ ] NO hay errores rojos
- [ ] Mensaje: "✅ [index.js] Mobile navigation initialized successfully"
- [ ] Mensaje: "✅ MobileNav: Initialized successfully"
- [ ] NO mensaje: "SW registered" (Service Worker debe estar eliminado)

---

## 📞 Si Aún No Funciona

Copia y pega esto en la consola (F12 → Console):

```javascript
// Test 1: Botón hamburguesa existe?
console.log('Botón hamburguesa:', document.querySelector('#mobile-menu-btn'))

// Test 2: MobileNav inicializado?
console.log('MobileNav instance:', window.mobileNavInstance)

// Test 3: Service Worker activo?
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log(
    'Service Workers:',
    regs.length === 0 ? '✅ Ninguno (correcto)' : '❌ ' + regs.length + ' activos'
  )
})

// Test 4: Primeras imágenes son eager?
const firstCarousel = document.querySelector('.carousel-product-image')
console.log('Primera imagen carousel loading:', firstCarousel?.loading)

const firstProduct = document.querySelector('.product-carousel-image')
console.log('Primera imagen producto loading:', firstProduct?.loading)
```

**Resultado esperado:**

```
Botón hamburguesa: <button id="mobile-menu-btn" ...>
MobileNav instance: MobileNav {isOpen: false, ...}
Service Workers: ✅ Ninguno (correcto)
Primera imagen carousel loading: eager
Primera imagen producto loading: eager
```

**Si alguno NO coincide, copia el output completo y avísame.**
