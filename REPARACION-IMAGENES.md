# 🔧 Reparación de Imágenes - Service Worker Corrupto

## 🎯 Problema Identificado

El **Service Worker estaba cacheando respuestas 503** de errores temporales de Supabase, causando que todas las imágenes retornen 503 indefinidamente del cache corrupto.

## ✅ Solución Implementada

### Cambios en `sw.js`:

1. **URLs externas NUNCA se cachean** (Supabase, CDNs)
2. **Solo respuestas exitosas (200-299) se cachean**
3. **Errores 503 NO se almacenan en cache**
4. **Cache version actualizada** a `floresya-v2-fixed`
5. **Auto-limpieza de caches antiguos** en evento `activate`

---

## 🚀 Pasos para Reparar (OBLIGATORIOS)

### Opción 1: Limpieza Automática (Recomendada)

1. **Abre en tu navegador**:

   ```
   http://localhost:3000/unregister-sw.html
   ```

2. **Haz clic en "🚀 Limpiar Todo"**

3. **Espera el mensaje de éxito**

4. **Recarga con hard refresh**:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

5. **Vuelve a index.html**:

   ```
   http://localhost:3000/index.html
   ```

6. **Verifica las imágenes** (deberían cargar correctamente)

---

### Opción 2: Limpieza Manual desde DevTools

1. **Abre DevTools** (F12)

2. **Ve a la pestaña "Application"** (o "Aplicación")

3. **En el menú lateral**:
   - Click en "Service Workers"
   - Click en "Unregister" para cada SW registrado
   - Click en "Clear storage" → "Clear site data"

4. **Pestaña "Network"**:
   - Check "Disable cache"
   - Recarga la página (Ctrl+Shift+R)

5. **Verifica que el nuevo SW se registró**:
   - En "Application" → "Service Workers"
   - Deberías ver `floresya-v2-fixed` en el cache name

---

## 🧪 Verificación

### Paso 1: Verifica que Supabase funciona

Abre en tu navegador esta URL directamente:

```
https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/small/product_107_1_fb1aa7b52a915ae07c3792d0e471f459d3bcb953f27b665675672d762374bda5.webp
```

✅ Debería mostrar una imagen de flores.

### Paso 2: Verifica la consola

En DevTools (F12) → Console, busca:

✅ **Logs buenos** (deberías ver):

```
🔧 [SW] Installing new Service Worker...
✅ [SW] Activating new Service Worker...
🗑️ [SW] Deleting old cache: floresya-v1
🌐 [SW] External request bypassed: dcbavpdlkcjdtjdkntde.supabase.co
```

❌ **NO deberías ver**:

```
HTTP/1.1 503
Failed to load product image
```

### Paso 3: Verifica las imágenes en la página

En `index.html`:

- Carousel debería mostrar 7 productos con imágenes
- Products grid debería mostrar 16 productos con imágenes
- NO deberías ver placeholders genéricos

---

## 🛡️ Prevención Futura

El nuevo Service Worker:

1. ✅ **Nunca cachea URLs externas** (Supabase, CDNs)
2. ✅ **Solo cachea respuestas OK (200-299)**
3. ✅ **Logs claros** para debugging
4. ✅ **Auto-limpieza** de caches antiguos

---

## 🆘 Si Aún No Funciona

### Debug Checklist:

1. **¿El servidor está corriendo?**

   ```bash
   npm run dev
   ```

2. **¿Variables de entorno configuradas?**

   ```bash
   cat .env.local | grep SUPABASE
   ```

   Deberías ver:

   ```
   SUPABASE_URL=https://dcbavpdlkcjdtjdkntde.supabase.co
   SUPABASE_KEY=...
   ```

3. **¿Hard refresh ejecutado?**
   - `Ctrl+Shift+R` (Windows/Linux)
   - `Cmd+Shift+R` (Mac)

4. **¿Service Worker desregistrado?**
   - F12 → Application → Service Workers → Debería estar vacío o mostrar solo `floresya-v2-fixed`

5. **¿Cache limpiado?**
   - F12 → Application → Storage → Clear site data

6. **¿Supabase Storage funciona?**
   ```bash
   curl -I "https://dcbavpdlkcjdtjdkntde.supabase.co/storage/v1/object/public/product-images/small/product_107_1_fb1aa7b52a915ae07c3792d0e471f459d3bcb953f27b665675672d762374bda5.webp"
   ```
   Debería retornar `HTTP/2 200`

---

## 📝 Archivos Modificados

```
✅ public/sw.js                     - Service Worker reparado
✅ public/unregister-sw.html        - Herramienta de limpieza
✅ REPARACION-IMAGENES.md           - Esta guía
```

---

## 🎯 Resultado Esperado

Después de seguir estos pasos:

- ✅ Imágenes del carousel cargan correctamente
- ✅ Imágenes del products grid cargan correctamente
- ✅ NO hay errores 503 en la consola
- ✅ Service Worker solo cachea recursos locales
- ✅ Supabase Storage funciona sin interceptación

**¡Las imágenes deberían estar funcionando ahora!** 🎉
