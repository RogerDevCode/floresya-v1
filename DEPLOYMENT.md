# FloresYa - Deployment Guide

Guía completa para desplegar FloresYa en Vercel con Supabase.

## 📋 Pre-requisitos

- [x] Cuenta de Vercel
- [x] Cuenta de Supabase
- [x] Node.js >= 18.0.0
- [x] npm >= 9.0.0

## 🗄️ Paso 1: Configurar Supabase

### 1.1 Crear Proyecto

1. Ir a [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Configurar:
   - **Name**: floresya-v1
   - **Database Password**: [generar contraseña segura]
   - **Region**: Seleccionar más cercana (ej: us-east-1)

### 1.2 Ejecutar Schema SQL

1. En Supabase Dashboard → SQL Editor
2. Copiar contenido de `/database/schema.sql`
3. Ejecutar

Esto creará:
- ✅ Tablas: `profiles`, `products`, `orders`, `order_items`, `reviews`
- ✅ Índices para performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers para `updated_at`
- ✅ 10 productos de ejemplo

### 1.3 Obtener Credenciales

En **Project Settings → API**:

```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # ⚠️ NUNCA compartir
```

### 1.4 Configurar Auth (Opcional)

En **Authentication → Providers**:
- Email/Password: ✅ Enabled
- Confirm email: Desactivar para desarrollo

## 🚀 Paso 2: Deploy en Vercel

### 2.1 Conectar Repositorio

```bash
# Inicializar git (si no existe)
git init
git add .
git commit -m "Initial commit"

# Crear repo en GitHub
git remote add origin https://github.com/TU_USUARIO/floresya-v1.git
git push -u origin main
```

### 2.2 Import en Vercel

1. Ir a [https://vercel.com/new](https://vercel.com/new)
2. Import Git Repository
3. Seleccionar `floresya-v1`
4. Configurar:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.3 Environment Variables

En Vercel → Project Settings → Environment Variables, agregar:

```bash
# Frontend (VITE_ prefix)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_APP_NAME=FloresYa
VITE_APP_ENV=production
VITE_APP_URL=https://floresya.vercel.app

# Backend (para serverless functions)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx... # Service role key
```

⚠️ **IMPORTANTE**: `SUPABASE_SERVICE_ROLE_KEY` es para serverless functions SOLAMENTE.

### 2.4 Deploy

Click **Deploy** → Esperar ~2 minutos → ✅ Listo!

Tu app estará en: `https://floresya-xxx.vercel.app`

## 🔧 Paso 3: Verificar Deployment

### 3.1 Checklist

- [ ] App carga correctamente
- [ ] Productos se muestran
- [ ] Búsqueda funciona
- [ ] Filtros por ocasión funcionan
- [ ] Carrito guarda en LocalStorage
- [ ] Favicon e imágenes cargan
- [ ] Console sin errores críticos

### 3.2 Test Supabase Integration

Abrir Developer Console:

```javascript
// Debe mostrar:
// "✅ Supabase client initialized"
// O
// "ℹ️ Running in local mode (no Supabase)"
```

### 3.3 Test Serverless Functions

```bash
# Test products API
curl https://floresya-xxx.vercel.app/api/products

# Debe retornar:
# {
#   "success": true,
#   "data": [...],
#   "count": 10
# }
```

## 📁 Estructura de Archivos Post-Deploy

```
/floresya-v1
├── /api                    # Vercel Serverless Functions
│   ├── products.js         # GET /api/products
│   └── orders.js           # POST /api/orders, GET /api/orders
│
├── /database
│   └── schema.sql          # Schema inicial (ejecutar en Supabase)
│
├── /src
│   ├── /services
│   │   ├── supabase.js     # Cliente configurado
│   │   ├── auth.service.js # Auth service
│   │   ├── order.service.js # Order service
│   │   ├── product.service.js # Dual mode (local/Supabase)
│   │   └── cart.service.js
│   └── ...
│
├── /public                 # Assets estáticos
│   ├── /products           # ⚠️ Subir imágenes reales aquí
│   ├── /assets
│   └── /images
│
└── dist/                   # Build generado (auto)
```

## 🖼️ Paso 4: Subir Imágenes Reales

Las imágenes actuales son placeholders (0 bytes). Para producción:

### Opción A: Usar Supabase Storage

```javascript
// Subir a Supabase Storage
const { data, error } = await supabase.storage
  .from('products')
  .upload('ramo-tropical.jpg', file)

// URL: https://xxx.supabase.co/storage/v1/object/public/products/ramo-tropical.jpg
```

### Opción B: Usar CDN Externo

- Cloudinary
- ImgIx
- AWS S3 + CloudFront

### Opción C: Reemplazar en /public/products

1. Colocar imágenes reales en `/public/products/`
2. Mismo nombre que placeholder
3. `git add . && git commit -m "Add product images" && git push`
4. Vercel redeploy automático

## 🔐 Seguridad

### Variables de Entorno

✅ **Seguro exponer** (client-side):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_*`

❌ **NUNCA exponer** (server-only):
- `SUPABASE_SERVICE_ROLE_KEY`

### Row Level Security (RLS)

Ya configurado en `schema.sql`:
- Users solo ven sus propias órdenes
- Products son públicos (activos)
- Reviews tienen ownership

## 🔄 Continuous Deployment

Vercel hace deploy automático en cada `git push`:

```bash
git add .
git commit -m "Update feature"
git push

# Vercel detecta push → Build → Deploy (~2 min)
```

### Preview Deployments

Cada branch/PR genera preview URL:
- `https://floresya-xxx-git-feature-usuario.vercel.app`

## 📊 Monitoreo

### Vercel Analytics

En Vercel Dashboard → Analytics:
- Page views
- Unique visitors
- Top pages
- Performance metrics

### Supabase Logs

En Supabase Dashboard → Logs:
- SQL queries
- Auth attempts
- API requests

## 🐛 Troubleshooting

### Error: "Supabase not configured"

✅ Verificar variables en Vercel
✅ Redeploy después de agregar variables
✅ Check console: `import.meta.env.VITE_SUPABASE_URL`

### Error: "Products not loading"

1. Check Supabase SQL Editor: `SELECT * FROM products LIMIT 1`
2. Verify RLS policies
3. Check browser console for errors

### Error: "Orders API 401 Unauthorized"

✅ Usuario debe estar autenticado
✅ Token en header: `Authorization: Bearer xxx`

### Build fails

```bash
# Local test
npm run build
npm run lint
```

## 🎯 Next Steps

1. **Auth UI**: Implementar login/register components
2. **Checkout Real**: Integrar Stripe/PayPal
3. **Admin Panel**: CRUD productos desde UI
4. **Email Notifications**: SendGrid integration
5. **Analytics**: Google Analytics / Vercel Analytics

## 📞 Soporte

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: https://github.com/TU_USUARIO/floresya-v1/issues

---

**Status**: ✅ Ready for production deployment