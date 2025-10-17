# 🎯 PLAN DE MEJORAS FLORESYA V1 - REVISADO (KISS + ATÓMICO)

**Filosofía**: KISS First, Fail Fast, MVC Strict, Service Layer es Ley
**Priorización**: Crítico → Alto Impacto → Estratégico
**Enfoque**: Tareas atómicas, incrementales, medibles y alineadas con CLAUDE.md

---

## 📊 PRIORIZACIÓN ESTRATÉGICA

### Criterios de Prioridad

1. **P0 (CRÍTICO)**: Afecta funcionamiento core, seguridad o violaciones arquitecturales
2. **P1 (ALTO)**: Impacto directo en UX, conversión o performance
3. **P2 (MEDIO)**: Mejoras operacionales y administrativas
4. **P3 (BAJO)**: Innovación y escalabilidad futura

---

## 🔥 FASE 1: CRÍTICO - ARQUITECTURA & COMPLIANCE (Semana 1-2)

### P0.1: Auditoría y Corrección de Violaciones Arquitecturales

**Objetivo**: Garantizar 100% compliance con principios CLAUDE.md

- [ ] **P0.1.1** Auditar todos los controllers para detectar acceso directo a DB
  - **Acción**: Buscar imports de `supabaseClient` fuera de `api/services/`
  - **Validación**: `grep -r "import.*supabaseClient" api/controllers api/routes`
  - **KPI**: 0 violaciones detectadas

- [ ] **P0.1.2** Auditar manejo de errores silencioso (fallbacks `||`, `??`)
  - **Acción**: Buscar `||`, `??`, try-catch sin `console.error`, funciones sin throws
  - **Validación**: Todos los try-catch deben loguear y re-throw
  - **KPI**: 100% operaciones críticas con fail-fast

- [ ] **P0.1.3** Validar implementación de soft-delete en todos los servicios
  - **Acción**: Revisar que todos los servicios implementen `includeInactive` (default: false)
  - **Validación**: Auditar productService, orderService, occasionService, userService
  - **KPI**: 100% servicios con soft-delete compliant

- [ ] **P0.1.4** Verificar uso de clases de error personalizadas (AppError.js)
  - **Acción**: Buscar `new Error(` y reemplazar por BadRequestError, NotFoundError, DatabaseError
  - **Validación**: `grep -r "new Error(" api/ | grep -v node_modules`
  - **KPI**: 0 usos de `new Error()` genérico

- [ ] **P0.1.5** Auditar business rules: "venta cancelada no es venta"
  - **Acción**: Verificar que cálculos de ventas excluyan status='cancelled'
  - **Validación**: Revisar orderService, analytics, reportes
  - **KPI**: 100% queries de ventas filtran cancelled

---

### P0.2: OpenAPI Contract Enforcement

**Objetivo**: 100% sincronización API ↔ OpenAPI spec

- [ ] **P0.2.1** Regenerar OpenAPI spec desde JSDoc actualizado
  - **Acción**: `npm run generate:openapi` y verificar completitud
  - **Validación**: Todos los endpoints en routes/ tienen JSDoc completo
  - **KPI**: 100% endpoints documentados

- [ ] **P0.2.2** Validar contract enforcement en CI/CD
  - **Acción**: Ejecutar `npm run validate:contract:ci` y corregir divergencias
  - **Validación**: 0 errores en ci-contract-report.json
  - **KPI**: Contract validation passing

- [ ] **P0.2.3** Implementar validación de responses contra spec
  - **Acción**: Asegurar que middleware openapiValidator valida responses
  - **Validación**: Test en Postman/curl con respuestas inválidas
  - **KPI**: 400 Bad Request en violaciones de contrato

- [ ] **P0.2.4** Sincronizar frontend api-client.js con spec
  - **Acción**: `npm run validate:client:sync` y corregir desviaciones
  - **Validación**: api-client.js usa exactamente los mismos endpoints que spec
  - **KPI**: 100% sincronización cliente-servidor

---

### P0.3: Security - Parche de Vulnerabilidades Críticas

**Objetivo**: Mitigar riesgos de seguridad inmediatos

- [ ] **P0.3.1** Implementar RBAC básico (roles: admin, customer)
  - **Acción**: Crear middleware `authorize(['admin'])` en routes sensibles
  - **Validación**: Endpoints de admin solo accesibles con rol admin
  - **KPI**: 100% endpoints sensibles protegidos

- [ ] **P0.3.2** Agregar rate limiting por endpoint crítico
  - **Acción**: Configurar límites específicos para /api/orders, /api/payments (50 req/15min)
  - **Validación**: Test con Apache Bench o Artillery
  - **KPI**: 429 Too Many Requests después del límite

- [ ] **P0.3.3** Validar y sanitizar inputs en todos los controllers
  - **Acción**: Usar schemas.js y validate.js en TODOS los endpoints
  - **Validación**: Intentar XSS/SQL injection en forms
  - **KPI**: 0 endpoints sin validación de input

- [ ] **P0.3.4** Configurar CSP Report-Only mode
  - **Acción**: Agregar Content-Security-Policy header en modo reporte
  - **Validación**: Revisar logs de violaciones CSP en consola
  - **KPI**: 0 violaciones CSP en producción

- [ ] **P0.3.5** Implementar secure session management
  - **Acción**: Configurar httpOnly, secure, sameSite cookies
  - **Validación**: Inspeccionar cookies en DevTools
  - **KPI**: Todas las cookies con flags de seguridad

---

## 🚀 FASE 2: ALTO IMPACTO - UX & PERFORMANCE (Semana 3-4)

### P1.1: Mobile-First Responsive Design

**Objetivo**: +40% conversión móvil

- [ ] **P1.1.1** Implementar mobile-first breakpoints en Tailwind config
  - **Acción**: Definir breakpoints: sm(640px), md(768px), lg(1024px), xl(1280px)
  - **Validación**: Test en Chrome DevTools (320px, 375px, 768px)
  - **KPI**: Lighthouse mobile score >90

- [ ] **P1.1.2** Rediseñar navbar con hamburger menu animado
  - **Acción**: Crear componente `mobileNav.js` con slide-in drawer
  - **Validación**: Test en iOS Safari y Chrome Android
  - **KPI**: Touch target >44px, animación <300ms

- [ ] **P1.1.3** Optimizar product grid para mobile (1 columna <768px)
  - **Acción**: Ajustar grid layout con Tailwind responsive classes
  - **Validación**: Test en diferentes viewports
  - **KPI**: 0 scroll horizontal, contenido visible sin zoom

- [ ] **P1.1.4** Implementar touch-friendly interactions (swipe, tap)
  - **Acción**: Agregar swipe gestures para carousel, pull-to-refresh
  - **Validación**: Test en dispositivos reales (no emuladores)
  - **KPI**: Tasa de interacción móvil +30%

- [ ] **P1.1.5** Ajustar tipografías para legibilidad móvil
  - **Acción**: Mobile: 16px base, desktop: 18px base, line-height: 1.6
  - **Validación**: Test de legibilidad WCAG AAA
  - **KPI**: Contrast ratio >7:1

---

### P1.2: Performance Optimization - Critical Path

**Objetivo**: -60% tiempo de carga

- [ ] **P1.2.1** Implementar lazy loading para imágenes below-the-fold
  - **Acción**: Usar `loading="lazy"` + Intersection Observer
  - **Validación**: Lighthouse Performance audit
  - **KPI**: LCP <2.5s, CLS <0.1

- [ ] **P1.2.2** Optimizar imágenes a WebP con fallback
  - **Acción**: Crear script de conversión con Sharp, implementar `<picture>` + srcset
  - **Validación**: PageSpeed Insights
  - **KPI**: -70% tamaño de imágenes

- [ ] **P1.2.3** Implementar critical CSS inline
  - **Acción**: Extraer CSS above-the-fold y embeber en `<head>`
  - **Validación**: Test con Chrome Coverage tool
  - **KPI**: First Paint <1s

- [ ] **P1.2.4** Code splitting para rutas no críticas
  - **Acción**: Dynamic imports para pages/ (payment, order-confirmation)
  - **Validación**: Network tab - cargas diferidas
  - **KPI**: -40% bundle inicial

- [ ] **P1.2.5** Implementar service worker para cache offline
  - **Acción**: Crear sw.js con estrategia Cache First para assets estáticos
  - **Validación**: Test offline en DevTools
  - **KPI**: 100% assets estáticos cacheados

---

### P1.3: Database Query Optimization

**Objetivo**: -50% tiempo de respuesta API

- [ ] **P1.3.1** Analizar slow queries con EXPLAIN ANALYZE
  - **Acción**: Ejecutar EXPLAIN en queries de productService, orderService
  - **Validación**: Identificar queries >100ms
  - **KPI**: 0 queries sin índices apropiados

- [ ] **P1.3.2** Crear índices compuestos faltantes
  - **Acción**: `CREATE INDEX idx_orders_customer_status ON orders(customer_id, status)`
  - **Validación**: EXPLAIN muestra Index Scan (no Seq Scan)
  - **KPI**: -80% tiempo en queries filtradas

- [ ] **P1.3.3** Implementar prepared statements para queries repetitivas
  - **Acción**: Usar preparedStatementService.js en productService, orderService
  - **Validación**: Logs de DB muestran statement caching
  - **KPI**: -30% parse time

- [ ] **P1.3.4** Optimizar búsqueda full-text con índices GIN
  - **Acción**: `CREATE INDEX idx_products_search_gin ON products USING GIN(to_tsvector('spanish', name || ' ' || description))`
  - **Validación**: Test búsqueda con acentos y sin acentos
  - **KPI**: Búsquedas <50ms

- [ ] **P1.3.5** Implementar query timeouts (5s max)
  - **Acción**: Configurar statement_timeout en supabaseClient
  - **Validación**: Test con query lenta simulada
  - **KPI**: 0 queries >5s en producción

---

### P1.4: Frontend Performance - Bundle Size

**Objetivo**: -50% bundle size

- [ ] **P1.4.1** Auditar y eliminar código muerto (dead code)
  - **Acción**: Usar Chrome Coverage + `grep -r "function.*{" public/js | grep -v "export"`
  - **Validación**: ESLint no-unused-vars
  - **KPI**: -20% líneas de código

- [ ] **P1.4.2** Implementar tree shaking para lucide-icons
  - **Acción**: Importar solo iconos usados: `import { ShoppingCart, User } from 'lucide'`
  - **Validación**: Bundle analyzer
  - **KPI**: -60% tamaño

- [ ] **P1.4.3** Minificar y comprimir CSS/JS con build tools
  - **Acción**: Configurar esbuild o Terser en npm scripts
  - **Validación**: Comparar tamaños antes/después
  - **KPI**: -40% bundle size

- [ ] **P1.4.4** Implementar gzip/brotli compression en server
  - **Acción**: Agregar compression middleware en Express
  - **Validación**: curl con Accept-Encoding: gzip
  - **KPI**: -70% tamaño transferido

- [ ] **P1.4.5** Mover librerías pesadas a CDN (Chart.js)
  - **Acción**: Usar Cloudflare CDN para Chart.js con integrity hash
  - **Validación**: Network tab - carga desde CDN
  - **KPI**: -200KB bundle local

---

## 🎨 FASE 3: MEJORAS OPERACIONALES (Semana 5-6)

### P2.1: Admin Tools - Automatización

**Objetivo**: -50% tareas manuales

- [ ] **P2.1.1** Implementar bulk product import/export (CSV)
  - **Acción**: Crear endpoint POST /api/admin/products/import con multer
  - **Validación**: Importar 100 productos desde CSV
  - **KPI**: Procesamiento <5s por 100 productos

- [ ] **P2.1.2** Crear dashboard de métricas administrativas
  - **Acción**: Página /admin/dashboard.html con Chart.js
  - **Validación**: Mostrar ventas, productos, órdenes en tiempo real
  - **KPI**: Dashboard carga <2s

- [ ] **P2.1.3** Implementar bulk order status updates
  - **Acción**: Endpoint PATCH /api/admin/orders/bulk con array de order IDs
  - **Validación**: Actualizar 50 órdenes simultáneamente
  - **KPI**: Procesamiento <3s

- [ ] **P2.1.4** Agregar sales report generator (PDF/CSV)
  - **Acción**: Endpoint GET /api/admin/reports/sales?format=pdf con fecha rango
  - **Validación**: Generar reporte mensual
  - **KPI**: Generación <10s

- [ ] **P2.1.5** Implementar inventory alerts (stock bajo)
  - **Acción**: Servicio que notifica cuando stock <5 unidades
  - **Validación**: Test con producto en stock bajo
  - **KPI**: Alerta en <1min después de umbral

---

### P2.2: Email Automation

**Objetivo**: 100% comunicación automatizada

- [ ] **P2.2.1** Configurar email service (SendGrid/Resend)
  - **Acción**: Crear emailService.js con API key y templates
  - **Validación**: Enviar email de test
  - **KPI**: Deliverability >95%

- [ ] **P2.2.2** Implementar order confirmation emails
  - **Acción**: Trigger en orderService.createOrder()
  - **Validación**: Test con orden real
  - **KPI**: Email recibido <30s después de orden

- [ ] **P2.2.3** Crear shipping notification emails
  - **Acción**: Trigger en orderService.updateOrderStatus('shipped')
  - **Validación**: Test con cambio de estado
  - **KPI**: Email con tracking info

- [ ] **P2.2.4** Implementar delivery confirmation emails
  - **Acción**: Trigger en orderService.updateOrderStatus('delivered')
  - **Validación**: Test con orden entregada
  - **KPI**: Email con link de review

- [ ] **P2.2.5** Agregar abandoned cart recovery emails
  - **Acción**: Cron job que detecta carritos >24h sin checkout
  - **Validación**: Test con carrito abandonado
  - **KPI**: +10% conversión de carritos abandonados

---

### P2.3: Analytics Integration

**Objetivo**: Business intelligence real

- [ ] **P2.3.1** Implementar Google Analytics 4
  - **Acción**: Agregar gtag.js con CSP-compliant nonce
  - **Validación**: Verificar eventos en GA4 dashboard
  - **KPI**: 100% eventos críticos trackeados

- [ ] **P2.3.2** Configurar enhanced ecommerce tracking
  - **Acción**: Eventos: view_item, add_to_cart, begin_checkout, purchase
  - **Validación**: Test compra completa
  - **KPI**: Funnel tracking completo

- [ ] **P2.3.3** Implementar custom events para user interactions
  - **Acción**: Eventos: theme_change, filter_applied, search_performed
  - **Validación**: Verificar en GA4 Real-Time
  - **KPI**: >20 eventos custom trackeados

- [ ] **P2.3.4** Agregar conversion goals (purchase, signup)
  - **Acción**: Configurar goals en GA4 con valores monetarios
  - **Validación**: Test conversión
  - **KPI**: Conversion rate visible en dashboard

- [ ] **P2.3.5** Crear dashboard interno de métricas clave
  - **Acción**: Endpoint GET /api/admin/analytics/summary
  - **Validación**: Mostrar revenue, conversion rate, AOV
  - **KPI**: Métricas en tiempo real <5s delay

---

## 🌟 FASE 4: INNOVACIÓN & ESCALABILIDAD (Mes 2-3)

### P3.1: Progressive Web App (PWA)

**Objetivo**: App-like experience

- [ ] **P3.1.1** Crear manifest.json para PWA installation
  - **Acción**: Definir name, icons, theme_color, display: standalone
  - **Validación**: Test "Add to Home Screen" en Android
  - **KPI**: Lighthouse PWA score >90

- [ ] **P3.1.2** Implementar push notifications para order updates
  - **Acción**: Usar Web Push API con service worker
  - **Validación**: Test notificación en mobile
  - **KPI**: >50% usuarios opt-in

- [ ] **P3.1.3** Agregar offline page con estado de sincronización
  - **Acción**: Crear offline.html con cache status
  - **Validación**: Test con DevTools offline
  - **KPI**: 100% graceful degradation

- [ ] **P3.1.4** Implementar background sync para cart operations
  - **Acción**: Queue de operaciones pendientes en IndexedDB
  - **Validación**: Agregar al carrito offline, sincronizar al reconectar
  - **KPI**: 0 operaciones perdidas

---

### P3.2: Caching Layer (Redis)

**Objetivo**: -70% load en DB

- [ ] **P3.2.1** Configurar Redis server (Upstash o Redis Cloud)
  - **Acción**: Crear redisService.js con createClient
  - **Validación**: Test de conexión
  - **KPI**: Latencia <5ms

- [ ] **P3.2.2** Implementar cache para productos populares
  - **Acción**: Cache key: `product:${id}`, TTL: 1h
  - **Validación**: Test hit rate con Redis Monitor
  - **KPI**: >80% cache hit rate

- [ ] **P3.2.3** Configurar cache para API responses (GET)
  - **Acción**: Middleware de cache con Redis
  - **Validación**: Response headers: X-Cache-Status: HIT
  - **KPI**: -90% queries repetitivas

- [ ] **P3.2.4** Implementar cache invalidation strategy
  - **Acción**: Invalidar cache en create/update/delete
  - **Validación**: Test actualización de producto
  - **KPI**: 0 datos stale >5min

- [ ] **P3.2.5** Agregar session storage en Redis
  - **Acción**: Migrar express-session a Redis store
  - **Validación**: Test persistencia de sesión
  - **KPI**: Sessions distribuidas para horizontal scaling

---

### P3.3: CDN & Edge Caching

**Objetivo**: -80% latencia global

- [ ] **P3.3.1** Configurar Cloudflare CDN
  - **Acción**: Proxy DNS a través de Cloudflare
  - **Validación**: Test desde múltiples regiones (geolocation tools)
  - **KPI**: Latencia <100ms global

- [ ] **P3.3.2** Implementar cache headers para assets estáticos
  - **Acción**: Cache-Control: public, max-age=31536000 para /public/
  - **Validación**: curl headers
  - **KPI**: 100% assets con cache headers

- [ ] **P3.3.3** Configurar edge caching para API responses
  - **Acción**: Cloudflare page rules para /api/products (cache: 1h)
  - **Validación**: Response headers: CF-Cache-Status: HIT
  - **KPI**: >60% API requests desde edge

- [ ] **P3.3.4** Implementar image optimization CDN
  - **Acción**: Cloudflare Images o Cloudinary integration
  - **Validación**: Test resize automático
  - **KPI**: -80% bandwidth imágenes

- [ ] **P3.3.5** Agregar DDoS protection (Cloudflare)
  - **Acción**: Activar protección L7, challenge page
  - **Validación**: Simular ataque con Apache Bench
  - **KPI**: 0 downtime durante ataque simulado

---

### P3.4: Advanced Features

**Objetivo**: Ventaja competitiva

- [ ] **P3.4.1** Implementar AI product recommendations
  - **Acción**: Algoritmo de collaborative filtering (compras similares)
  - **Validación**: Test recomendaciones en product detail
  - **KPI**: +15% cross-sell

- [ ] **P3.4.2** Crear personalized email marketing
  - **Acción**: Segmentación por RFM (Recency, Frequency, Monetary)
  - **Validación**: Campaña a segmento específico
  - **KPI**: +25% open rate vs genérico

- [ ] **P3.4.3** Agregar real-time order tracking
  - **Acción**: WebSocket connection para updates en vivo
  - **Validación**: Test actualización de estado
  - **KPI**: <2s latencia de actualización

- [ ] **P3.4.4** Implementar loyalty points system
  - **Acción**: Tabla `loyalty_points`, 1 punto = $1 gastado
  - **Validación**: Test acumulación y redención
  - **KPI**: +20% repeat purchase rate

- [ ] **P3.4.5** Crear subscription model (suscripción flores mensuales)
  - **Acción**: Tabla `subscriptions`, Stripe Billing integration
  - **Validación**: Test suscripción y cobro recurrente
  - **KPI**: >100 suscriptores en 3 meses

---

## 📊 MÉTRICAS DE ÉXITO Y KPIS

### Fase 1 (Crítico)

- **Arquitectura**: 0 violaciones de MVC Strict, Service Layer, Fail Fast
- **OpenAPI**: 100% endpoints documentados, 0 divergencias
- **Security**: 0 vulnerabilidades críticas, 100% endpoints con validación

### Fase 2 (Alto Impacto)

- **Mobile**: Lighthouse mobile score >90, +40% conversión móvil
- **Performance**: LCP <2.5s, TTI <3.5s, -60% tiempo de carga
- **Database**: 0 queries >100ms, -50% tiempo de respuesta API

### Fase 3 (Operacional)

- **Admin**: -50% tareas manuales, dashboard <2s load
- **Email**: >95% deliverability, 100% eventos automatizados
- **Analytics**: Funnel tracking completo, >20 eventos custom

### Fase 4 (Innovación)

- **PWA**: Lighthouse PWA score >90, >50% opt-in notificaciones
- **Cache**: >80% hit rate, -70% load en DB
- **CDN**: <100ms latencia global, -80% bandwidth

---

## 🔄 PROCESO DE EJECUCIÓN (Por Tarea)

### Workflow Obligatorio

1. **Plan**: Definir criterios de aceptación específicos
2. **Code**: Implementar siguiendo principios CLAUDE.md
3. **Test**: Unit + Integration + E2E (Playwright)
4. **Review**: ESLint + Prettier + Manual code review
5. **Deploy**: Vercel preview → Production con rollback plan
6. **Monitor**: Logs, métricas, alertas post-deployment

### Checklist Pre-Deploy

- [ ] ESLint passing (`npm run lint`)
- [ ] Prettier formatting (`npm run format:check`)
- [ ] Tests passing (`npm test` + `npm run test:e2e`)
- [ ] OpenAPI spec regenerado (`npm run generate:openapi`)
- [ ] Contract validation passing (`npm run validate:full`)
- [ ] Performance audit (Lighthouse >85)
- [ ] Security headers verificados
- [ ] Rollback plan documentado

---

## 🎯 ROADMAP TEMPORAL

### Semana 1

- **Día 1-2**: P0.1 - Auditoría arquitectural
- **Día 3-4**: P0.2 - OpenAPI contract enforcement
- **Día 5**: P0.3 - Security patches

### Semana 2

- **Día 1-2**: P1.1 - Mobile-first responsive design
- **Día 3-4**: P1.2 - Performance optimization
- **Día 5**: P1.3 - Database query optimization

### Semana 3

- **Día 1-3**: P1.4 - Frontend bundle optimization
- **Día 4-5**: P2.1 - Admin tools (inicio)

### Semana 4

- **Día 1-2**: P2.1 - Admin tools (fin)
- **Día 3-4**: P2.2 - Email automation
- **Día 5**: P2.3 - Analytics integration

### Semana 5-6

- **Semana 5**: P3.1 - PWA implementation
- **Semana 6**: P3.2 - Caching layer (Redis)

### Mes 2-3

- **Semana 7-8**: P3.3 - CDN & Edge caching
- **Semana 9-10**: P3.4 - Advanced features

---

## ✅ DIFERENCIAS CLAVE vs PLAN ANTERIOR

### Mejoras Aplicadas

1. **Atomicidad**: Cada tarea es independiente y completable en <1 día
2. **KISS First**: Eliminadas abstracciones innecesarias (e.g., heatmaps, sentiment analysis)
3. **Priorización Real**: Orden basado en criticidad arquitectural → UX → innovación
4. **Validación Específica**: KPIs medibles y comandos de verificación concretos
5. **Compliance CLAUDE.md**: Todas las tareas alineadas con principios fundamentales
6. **Dependencies Claras**: Orden secuencial lógico, sin bloqueos innecesarios

### Tareas Eliminadas/Simplificadas

- ❌ Haptic feedback (complejidad innecesaria)
- ❌ Heatmaps/session recording (overhead sin ROI claro)
- ❌ A/B testing framework (prematuro)
- ❌ AI image recognition (fuera de scope)
- ❌ Sentiment analysis (over-engineering)
- ✅ Enfoque en fundamentals: arquitectura, performance, UX core

### Tareas Nuevas (Críticas)

- ✅ P0.1: Auditoría de violaciones arquitecturales
- ✅ P0.2: Contract enforcement real
- ✅ P0.3: Security básico pero sólido
- ✅ Validación específica con comandos ejecutables

---

## 🎓 FILOSOFÍA DE EJECUCIÓN

**"Go all out! Don't hold back, just do it. Go hard or go home."**

### Reglas de Oro

1. **KISS > Complejidad**: Si hay 2 soluciones, elige la más simple
2. **Fail Fast en Dev**: Lanza errores, no los ocultes
3. **Service Layer es Ley**: NUNCA accedas a DB fuera de services/
4. **MVC Strict**: Controllers → Services → Database (sin excepciones)
5. **OpenAPI First**: Documenta antes de implementar
6. **Soft-Delete Siempre**: Nunca `DELETE`, siempre `UPDATE active=false`
7. **Test Before Deploy**: No hay deployment sin tests passing

### Maximum Proactivity

- Anticipa validaciones faltantes
- Refactoriza código duplicado
- Corrige violaciones agresivamente
- Reemplaza fallbacks con fail-fast
- Elimina código muerto sin piedad

---

**Plan Revisado Creado**: 2025-01-11
**Próxima Revisión**: Después de Fase 1 (Semana 2)
**Estado**: ✅ Listo para ejecución atómica

**AFI**: ✅ Entendido. Tarea actual completada. 🎯 Esperando instrucciones para próximo paso.
