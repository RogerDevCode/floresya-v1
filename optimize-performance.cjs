/**
 * Script para optimizar el rendimiento de la aplicación
 * y mejorar el score de Lighthouse por encima de 90
 */

const fs = require('fs')
const path = require('path')

/**
 * Optimiza el HTML agregando más mejoras de rendimiento
 */
function optimizeHTML() {
  const htmlPath = path.join(__dirname, 'public', 'index.html')
  let html = fs.readFileSync(htmlPath, 'utf8')

  // Agregar más optimizaciones de rendimiento
  const optimizations = [
    // Agregar más meta tags para SEO y rendimiento
    '<meta name="robots" content="index, follow" />',
    '<meta name="googlebot" content="index, follow" />',
    '<meta name="format-detection" content="telephone=no" />',

    // Agregar preconnect para recursos externos
    '<link rel="preconnect" href="https://fonts.googleapis.com" />',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />',

    // Agregar DNS prefetch para recursos externos
    '<link rel="dns-prefetch" href="//fonts.googleapis.com" />',
    '<link rel="dns-prefetch" href="//fonts.gstatic.com" />',

    // Agregar manifest para PWA
    '<link rel="manifest" href="./manifest.json" />',

    // Agregar estructura de datos para SEO
    '<script type="application/ld+json">\n' +
      '{\n' +
      '  "@context": "https://schema.org",\n' +
      '  "@type": "Florist",\n' +
      '  "name": "FloresYa",\n' +
      '  "description": "Tu floristería en línea de confianza",\n' +
      '  "url": "https://floresya.com",\n' +
      '  "telephone": "+58412-1234567",\n' +
      '  "address": {\n' +
      '    "@type": "PostalAddress",\n' +
      '    "addressLocality": "Gran Caracas",\n' +
      '    "addressCountry": "VE"\n' +
      '  }\n' +
      '}\n' +
      '</script>'
  ]

  // Insertar optimizaciones después de los meta tags existentes
  const metaTagsEnd = html.indexOf('</title>') + '</title>'.length
  html =
    html.slice(0, metaTagsEnd) + '\n    ' + optimizations.join('\n    ') + html.slice(metaTagsEnd)

  // Optimizar el orden de carga de scripts
  html = html.replace(
    '<script type="module" src="./index.js"></script>',
    '<script type="module" src="./index.js" async></script>'
  )

  fs.writeFileSync(htmlPath, html, 'utf8')
  console.log('✅ HTML optimizado con mejoras de rendimiento')
}

/**
 * Crea un manifest.json para PWA
 */
function createManifest() {
  const manifest = {
    name: 'FloresYa - Floristería Online',
    short_name: 'FloresYa',
    description: 'Tu floristería en línea de confianza',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ec4899',
    orientation: 'portrait-primary',
    icons: [
      {
        src: './images/logoFloresYa.jpeg',
        sizes: '192x192',
        type: 'image/jpeg'
      },
      {
        src: './images/logoFloresYa.jpeg',
        sizes: '512x512',
        type: 'image/jpeg'
      }
    ]
  }

  const manifestPath = path.join(__dirname, 'public', 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
  console.log('✅ Manifest.json creado para PWA')
}

/**
 * Crea un service worker simple para caché
 */
function createServiceWorker() {
  const serviceWorker = `
// Service Worker para FloresYa
const CACHE_NAME = 'floresya-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/tailwind.css',

  '/js/shared/api-client.js',
  '/js/shared/cart.js',
  '/index.js',
  '/images/logoFloresYa.jpeg',
  '/images/hero-flowers.webp',
  '/images/placeholder-flower.svg'
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  )
})

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response
        }
        return fetch(event.request)
      }
    )
  )
})
`

  const swPath = path.join(__dirname, 'public', 'sw.js')
  fs.writeFileSync(swPath, serviceWorker, 'utf8')
  console.log('✅ Service Worker creado para caché')
}

/**
 * Registra el service worker en el HTML
 */
function registerServiceWorker() {
  const htmlPath = path.join(__dirname, 'public', 'index.html')
  let html = fs.readFileSync(htmlPath, 'utf8')

  // Agregar script para registrar el service worker
  const swScript = `
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js')
            .then(registration => {
              console.log('SW registered: ', registration)
            })
            .catch(registrationError => {
              console.log('SW registration failed: ', registrationError)
            })
        })
      }
    </script>
  `

  // Insertar antes del cierre del body
  html = html.replace('</body>', swScript + '\n  </body>')

  fs.writeFileSync(htmlPath, html, 'utf8')
  console.log('✅ Service Worker registrado en el HTML')
}

/**
 * Función principal de optimización
 */
function runOptimizations() {
  console.log('🚀 Iniciando optimizaciones de rendimiento...')

  try {
    optimizeHTML()
    createManifest()
    createServiceWorker()
    registerServiceWorker()

    console.log('\n✅ Optimizaciones completadas:')
    console.log('  - HTML optimizado con meta tags y preconnect')
    console.log('  - Manifest.json creado para PWA')
    console.log('  - Service Worker implementado para caché')
    console.log('  - Scripts cargados de forma asíncrona')
    console.log('\n🎯 Estas optimizaciones deberían mejorar el score de Lighthouse')
  } catch (error) {
    console.error('❌ Error durante las optimizaciones:', error)
  }
}

// Ejecutar optimizaciones si este script se ejecuta directamente
if (require.main === module) {
  runOptimizations()
}

module.exports = {
  optimizeHTML,
  createManifest,
  createServiceWorker,
  registerServiceWorker,
  runOptimizations
}
