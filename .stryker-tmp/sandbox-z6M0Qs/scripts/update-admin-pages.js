/**
 * Script de Actualización Automática de Páginas Admin
 * Aplica el sistema de estandarización UI/UX a todas las páginas admin
 */
// @ts-nocheck

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.join(__dirname, '..')

// Configuración de páginas
const PAGES_CONFIG = {
  'user-form.html': {
    breadcrumbs: [{ name: 'Usuarios', url: null }],
    pageName: 'Gestión de Usuario'
  },
  'user-delete-confirm.html': {
    breadcrumbs: [
      { name: 'Usuarios', url: null },
      { name: 'Confirmar Eliminación', url: null }
    ],
    pageName: 'Confirmar Eliminación'
  },
  'dashboard.html': {
    breadcrumbs: [],
    pageName: 'Dashboard',
    hasSidebar: true
  },
  'occasions.html': {
    breadcrumbs: [{ name: 'Ocasiones', url: null }],
    pageName: 'Gestión de Ocasiones'
  },
  'orders.html': {
    breadcrumbs: [{ name: 'Órdenes', url: null }],
    pageName: 'Gestión de Órdenes'
  },
  'product-editor.html': {
    breadcrumbs: [
      { name: 'Productos', url: null },
      { name: 'Editor', url: null }
    ],
    pageName: 'Editor de Productos'
  },
  'contact-editor.html': {
    breadcrumbs: [
      { name: 'Configuración', url: null },
      { name: 'Contacto', url: null }
    ],
    pageName: 'Editor de Contacto'
  },
  'create-product.html': {
    breadcrumbs: [
      { name: 'Productos', url: null },
      { name: 'Crear', url: null }
    ],
    pageName: 'Crear Producto'
  },
  'edit-product.html': {
    breadcrumbs: [
      { name: 'Productos', url: null },
      { name: 'Editar', url: null }
    ],
    pageName: 'Editar Producto'
  }
}

const PAGES_DIR = path.join(PROJECT_ROOT, 'public/pages/admin')
const BACKUP_DIR = path.join(PROJECT_ROOT, 'public/pages/admin/.backup-' + Date.now())

/**
 * Generate standardized navbar HTML
 */
function generateNavbar(config) {
  const { breadcrumbs = [], hasSidebar = false } = config

  const breadcrumbsHTML = breadcrumbs
    .map(
      crumb => `
            <li class="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 dark:text-gray-600">
                <path d="m9 18 6-6-6-6" />
              </svg>
              ${
                crumb.url
                  ? `<a href="${crumb.url}" class="text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">${crumb.name}</a>`
                  : `<span class="text-gray-900 dark:text-gray-100 font-medium">${crumb.name}</span>`
              }
            </li>`
    )
    .join('')

  return `    <!-- Navbar Estandarizado -->
    <nav
      class="navbar bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md fixed top-0 left-0 right-0 z-50"
      role="navigation"
    >
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Left Section: Back Button ${hasSidebar ? '+ Sidebar Toggle' : ''} -->
          <div class="flex items-center gap-3">
            ${
              hasSidebar
                ? `<button
              id="admin-sidebar-toggle"
              class="md:hidden text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors p-2"
              title="Toggle menu"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>`
                : ''
            }
            <button
              id="back-btn"
              class="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Volver"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              <span class="hidden sm:inline text-sm font-medium">Volver</span>
            </button>
          </div>

          <!-- Center Section: Logo + Breadcrumb -->
          <div class="flex items-center space-x-3">
            <a href="../../index.html" class="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img src="../../images/logoFloresYa.jpeg" alt="Logo FloresYa Admin" class="h-10 w-10 rounded-full ring-2 ring-pink-200 dark:ring-pink-800" />
              <span class="text-xl font-bold text-pink-600 dark:text-pink-400 hidden md:block">FloresYa Admin</span>
            </a>

            <!-- Breadcrumb -->
            <nav class="hidden lg:flex items-center text-sm" aria-label="Breadcrumb">
              <ol id="breadcrumb-container" class="flex items-center space-x-2">
                <li>
                  <a href="./dashboard.html" class="text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">Dashboard</a>
                </li>${breadcrumbsHTML}
              </ol>
            </nav>
          </div>

          <!-- Right Section: Theme + Notifications + User + Logout -->
          <div class="flex items-center space-x-2">
            <!-- Theme Toggle -->
            <button
              id="theme-toggle-btn"
              class="p-2 text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Cambiar tema"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            </button>

            <!-- Notifications -->
            <div class="relative">
              <button
                id="notifications-btn"
                class="relative p-2 text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Notificaciones"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                <span id="notification-badge" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center hidden"></span>
              </button>

              <!-- Notifications Panel -->
              <div id="notifications-panel" class="hidden absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div class="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <h3 class="font-semibold text-gray-900 dark:text-gray-100">Notificaciones</h3>
                </div>
                <div id="notifications-list" class="max-h-96 overflow-y-auto"></div>
              </div>
            </div>

            <!-- User Info -->
            <div class="hidden md:flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
              <div class="flex items-center space-x-2">
                <div class="w-8 h-8 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-pink-600 dark:text-pink-400">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300" id="admin-user-display">Admin</span>
              </div>
            </div>

            <!-- Logout -->
            <button id="logout-btn" class="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" title="Cerrar sesión">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Spacer for fixed navbar -->
    <div class="h-16"></div>`
}

/**
 * Update HTML file with new navbar and theme
 */
async function updateHTMLFile(filename, config) {
  const filepath = path.join(PAGES_DIR, filename)
  let content = await fs.readFile(filepath, 'utf-8')

  // 1. Add admin-theme.css if not present
  if (!content.includes('admin-theme.css')) {
    content = content.replace(
      /<link rel="stylesheet" href="\.\.\/\.\.\/css\/tailwind\.css" \/>/,
      `<link rel="stylesheet" href="../../css/tailwind.css" />
    <link rel="stylesheet" href="../../css/admin-theme.css" />`
    )
  }

  // 2. Replace navbar section
  const navbarHTML = generateNavbar(config)

  // Find existing navbar and replace
  const navStartRegex = /<!-- (?:Navbar|Navigation)(?: Estandarizado)? -->\s*<nav/
  const navEndRegex = /<\/nav>\s*(?:<!--[^>]*-->)?\s*(?:<div class="h-16"><\/div>)?/

  if (navStartRegex.test(content)) {
    // Find the complete navbar block
    const navStart = content.search(navStartRegex)
    const afterNavStart = content.substring(navStart)
    const navEndMatch = afterNavStart.match(navEndRegex)

    if (navEndMatch) {
      const navEnd = navStart + navEndMatch.index + navEndMatch[0].length
      const before = content.substring(0, navStart)
      const after = content.substring(navEnd)

      content = before + navbarHTML + '\n' + after
    }
  }

  // 3. Add admin-navbar.js script if not present
  if (!content.includes('admin-navbar.js')) {
    const scriptTag = `    <script type="module" src="../../js/components/admin-navbar.js"></script>`

    // Add before closing </body>
    content = content.replace('</body>', `${scriptTag}\n  </body>`)
  }

  // 4. Update body classes for theme support
  content = content.replace(
    /<body class="([^"]*)">/,
    '<body class="$1" data-page="' + filename.replace('.html', '') + '">'
  )

  // 5. Add footer if not present (before scripts)
  if (!content.includes('admin-footer.html') && !content.includes('<!-- Footer -->')) {
    const footerComment = `    <!-- Footer - Información de Contacto -->\n    <!-- TODO: Incluir componente de footer aquí -->\n`
    content = content.replace(/\s*<script/, `\n${footerComment}\n    <script`)
  }

  return content
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Iniciando actualización de páginas admin...\n')

  try {
    // Create backup directory
    await fs.mkdir(BACKUP_DIR, { recursive: true })
    console.log(`✅ Backup creado en: ${BACKUP_DIR}\n`)

    let successCount = 0
    let errorCount = 0

    // Process each page
    for (const [filename, config] of Object.entries(PAGES_CONFIG)) {
      try {
        console.log(`📄 Procesando: ${filename}`)

        const filepath = path.join(PAGES_DIR, filename)

        // Check if file exists
        try {
          await fs.access(filepath)
        } catch {
          console.log(`   ⚠️  Archivo no existe, saltando...\n`)
          continue
        }

        // Backup original
        const backupPath = path.join(BACKUP_DIR, filename)
        await fs.copyFile(filepath, backupPath)
        console.log(`   💾 Backup guardado`)

        // Update file
        const updatedContent = await updateHTMLFile(filename, config)
        await fs.writeFile(filepath, updatedContent, 'utf-8')
        console.log(`   ✅ Actualizado exitosamente\n`)

        successCount++
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`)
        errorCount++
      }
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════════')
    console.log('📊 RESUMEN DE ACTUALIZACIÓN')
    console.log('═══════════════════════════════════════════════════════')
    console.log(`✅ Actualizados: ${successCount}`)
    console.log(`❌ Errores: ${errorCount}`)
    console.log(`📁 Backup: ${BACKUP_DIR}`)
    console.log('═══════════════════════════════════════════════════════\n')

    if (successCount > 0) {
      console.log('🎉 Actualización completada!')
      console.log('📝 Próximo paso: Ejecutar tests E2E\n')
    }
  } catch (error) {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  }
}

// Execute
main()
