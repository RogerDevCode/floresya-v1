/**
 * FloresYa - Sistema de Contraste Mejorado
 * Aplica correcciones de contraste dinámico para resolver problemas identificados
 * en tiempo de ejecución
 */
// @ts-nocheck

import { enhancedContrastSystem } from './enhancedContrastSystem.js'

// Función para aplicar correcciones de contraste cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function () {
  console.log('🎨 [ContrastFixer] Aplicando correcciones de contraste mejoradas...')

  // Aplicar contraste mejorado a toda la página con un ratio más alto para garantizar AAA
  const elementsAdjusted = enhancedContrastSystem.enhancePageContrastWithFixes(7.0) // AAA contrast
  console.log(`✅ [ContrastFixer] Mejorados ${elementsAdjusted} elementos con contraste AAA`)

  // Aplicar contraste específico a áreas problemáticas identificadas
  const navbarAdjusted = enhancedContrastSystem.enhanceNavbarContrastWithFixes(7.0) // AAA para navegación crítica
  console.log(`✨ [ContrastFixer] Mejorados ${navbarAdjusted} elementos de navegación`)

  // Aplicar contraste a formularios (importante para accesibilidad)
  const forms = document.querySelectorAll('form')
  forms.forEach((form, index) => {
    const formAdjusted = enhancedContrastSystem.enhanceFormContrastWithFixes(form, 7.0) // AAA para formularios
    if (formAdjusted > 0) {
      console.log(`📋 [ContrastFixer] Formulario ${index + 1}: ${formAdjusted} elementos mejorados`)
    }
  })
})

// También aplicar cuando cambie un tema (en caso de que se cambie dinámicamente)
window.addEventListener('themeChanged', function (_event) {
  console.log('🎨 [ContrastFixer] Tema cambiado, aplicando contraste dinámico...')

  setTimeout(() => {
    // Dar tiempo a que el nuevo tema se aplique completamente
    const elementsAdjusted = enhancedContrastSystem.enhancePageContrastWithFixes(7.0)
    console.log(`✅ [ContrastFixer] Post-theme change - ${elementsAdjusted} elements enhanced`)
  }, 100) // Pequeño delay para asegurar que los estilos se han aplicado
})

// Exportar para uso en otros módulos si es necesario
export { runContrastFixes }

// Función auxiliar para correr las correcciones manualmente si es necesario
function runContrastFixes(minRatio = 7.0) {
  console.log(`🎨 [Manual Contrast Fixer] Running contrast enhancements with ratio ${minRatio}...`)

  const pageAdjusted = enhancedContrastSystem.enhancePageContrastWithFixes(minRatio)
  const navbarAdjusted = enhancedContrastSystem.enhanceNavbarContrastWithFixes(
    Math.min(minRatio, 7.0)
  ) // AAA para navbar
  const allAdjusted = pageAdjusted + navbarAdjusted

  console.log(
    `✅ [Manual Contrast Fixer] Total enhanced: ${allAdjusted} elements (page: ${pageAdjusted}, navbar: ${navbarAdjusted})`
  )
  return allAdjusted
}
