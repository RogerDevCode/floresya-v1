/**
 * Dashboard Refactor TDD Tests
 * Validate HTML structure and components after refactoring
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { JSDOM } from 'jsdom'

const DASHBOARD_PATH = join(process.cwd(), 'public/pages/admin/dashboard.html')

describe('Dashboard Refactor - TDD Validation', () => {
  let dom
  let document

  beforeAll(() => {
    const html = readFileSync(DASHBOARD_PATH, 'utf-8')
    dom = new JSDOM(html)
    document = dom.window.document
  })

  describe('1. Stats Grid Redesign', () => {
    it('should have exactly 4 main stats cards', () => {
      const mainStatsGrid = document.querySelector('#main-stats-grid')
      expect(mainStatsGrid).toBeTruthy()

      const statsCards = mainStatsGrid.querySelectorAll('.stat-card')
      expect(statsCards.length).toBe(4)
    })

    it('should have correct main stats: Total Pedidos, Ventas, Pendientes, Entregados', () => {
      const mainStatsGrid = document.querySelector('#main-stats-grid')
      const titles = Array.from(mainStatsGrid.querySelectorAll('.stat-title')).map(el =>
        el.textContent.trim()
      )

      expect(titles).toContain('Total Pedidos')
      expect(titles).toContain('Ventas Totales USD')
      expect(titles).toContain('Pendientes')
      expect(titles).toContain('Entregados')
    })

    it('should have secondary stats in collapsible panel', () => {
      const secondaryPanel = document.querySelector('#secondary-stats-panel')
      expect(secondaryPanel).toBeTruthy()

      const toggleBtn = document.querySelector('#toggle-secondary-stats')
      expect(toggleBtn).toBeTruthy()
    })

    it('secondary panel should contain 4 status stats', () => {
      const secondaryPanel = document.querySelector('#secondary-stats-content')
      expect(secondaryPanel).toBeTruthy()

      const secondaryCards = secondaryPanel.querySelectorAll('.stat-card')
      expect(secondaryCards.length).toBe(4)
    })

    it('secondary stats should be: Verificados, Preparando, Enviados, Cancelados', () => {
      const secondaryPanel = document.querySelector('#secondary-stats-content')
      const titles = Array.from(secondaryPanel.querySelectorAll('.stat-title')).map(el =>
        el.textContent.trim()
      )

      expect(titles).toContain('Verificados')
      expect(titles).toContain('Preparando')
      expect(titles).toContain('Enviados')
      expect(titles).toContain('Cancelados')
    })
  })

  describe('2. Filters Section', () => {
    it('should have filters outside welcome banner', () => {
      const welcomeBanner = document.querySelector('.welcome-banner')
      expect(welcomeBanner).toBeTruthy()

      // Filters should NOT be inside banner
      const filtersInBanner = welcomeBanner.querySelector('#dashboard-filters-section')
      expect(filtersInBanner).toBeFalsy()
    })

    it('should have dedicated filters section with ID dashboard-filters-section', () => {
      const filtersSection = document.querySelector('#dashboard-filters-section')
      expect(filtersSection).toBeTruthy()
    })

    it('filters section should contain year and period selects', () => {
      const yearFilter = document.querySelector('#dashboard-year-filter')
      const dateFilter = document.querySelector('#dashboard-date-filter')

      expect(yearFilter).toBeTruthy()
      expect(dateFilter).toBeTruthy()
    })

    it('should have apply filters button', () => {
      const applyBtn = document.querySelector('#apply-dashboard-filters')
      expect(applyBtn).toBeTruthy()
      expect(applyBtn.textContent).toContain('Aplicar')
    })

    it('should have clear filters button', () => {
      const clearBtn = document.querySelector('#clear-dashboard-filters')
      expect(clearBtn).toBeTruthy()
    })
  })

  describe('3. Unified Styles', () => {
    it('all main sections should have consistent classes', () => {
      const sections = [
        { id: '#secondary-stats-panel', isWrapper: true },
        { id: '#chart-section', isWrapper: true },
        { id: '#top-products-section', isWrapper: true }
      ]

      sections.forEach(({ id, isWrapper }) => {
        const section = document.querySelector(id)
        expect(section).toBeTruthy()

        if (isWrapper) {
          const parent = section.closest('.admin-card, .bg-white')
          expect(parent).toBeTruthy()
          expect(parent.classList.contains('rounded-xl')).toBe(true)
          expect(parent.classList.contains('shadow-md')).toBe(true)
        }
      })

      // Main stats grid should exist and have proper grid classes
      const mainStats = document.querySelector('#main-stats-grid')
      expect(mainStats).toBeTruthy()
      expect(mainStats.classList.contains('grid')).toBe(true)
      expect(mainStats.classList.contains('mx-6')).toBe(true)
    })

    it('stats should use consistent color scheme', () => {
      const mainStats = document.querySelector('#main-stats-grid')
      const statIcons = mainStats.querySelectorAll('.stat-icon')

      expect(statIcons.length).toBe(4)

      // Check color classes exist
      const colorClasses = Array.from(statIcons).map(icon =>
        Array.from(icon.classList).find(
          c => c.includes('pink') || c.includes('green') || c.includes('blue')
        )
      )

      expect(colorClasses.some(c => c?.includes('pink'))).toBe(true) // Primary
      expect(colorClasses.some(c => c?.includes('green'))).toBe(true) // Success
    })
  })

  describe('4. Dead Code Removal', () => {
    it('should NOT have commented modal confirm-delete-modal', () => {
      const html = readFileSync(DASHBOARD_PATH, 'utf-8')
      expect(html).not.toMatch(/<!--[\s\S]*confirm-delete-modal[\s\S]*-->/)
    })

    it('should NOT have empty Orders View placeholder', () => {
      const ordersView = document.querySelector('#orders-view')

      if (ordersView) {
        const content = ordersView.textContent.trim()
        expect(content).not.toContain('Sección de gestión de pedidos en desarrollo')
      }
    })

    it('should NOT have Contact Editor View placeholder', () => {
      const contactView = document.querySelector('#contact-editor-view')

      if (contactView) {
        const content = contactView.textContent.trim()
        expect(content).not.toContain('Editor de la página de contacto')
      }
    })
  })

  describe('5. Responsive Design', () => {
    it('main stats grid should be 1/2/4 columns responsive', () => {
      const mainStats = document.querySelector('#main-stats-grid')
      const classes = mainStats.className

      expect(classes).toMatch(/grid-cols-1/)
      expect(classes).toMatch(/md:grid-cols-2/)
      expect(classes).toMatch(/lg:grid-cols-4/)
    })

    it('secondary stats should be 1/2/4 columns responsive', () => {
      const secondaryStats = document.querySelector('#secondary-stats-content')
      const classes = secondaryStats.className

      expect(classes).toMatch(/grid-cols-1/)
      expect(classes).toMatch(/md:grid-cols-2/)
      expect(classes).toMatch(/lg:grid-cols-4/)
    })
  })

  describe('6. Accessibility', () => {
    it('collapsible panel should have proper ARIA attributes', () => {
      const toggleBtn = document.querySelector('#toggle-secondary-stats')
      expect(toggleBtn).toBeTruthy()

      const ariaExpanded = toggleBtn.getAttribute('aria-expanded')
      const ariaControls = toggleBtn.getAttribute('aria-controls')

      expect(ariaExpanded).toBeTruthy()
      expect(ariaControls).toBe('secondary-stats-content')
    })

    it('filter buttons should have descriptive text or aria-label', () => {
      const applyBtn = document.querySelector('#apply-dashboard-filters')
      const clearBtn = document.querySelector('#clear-dashboard-filters')

      expect(applyBtn.textContent.trim().length > 0 || applyBtn.getAttribute('aria-label')).toBe(
        true
      )
      expect(clearBtn.textContent.trim().length > 0 || clearBtn.getAttribute('aria-label')).toBe(
        true
      )
    })
  })

  describe('7. Chart Section', () => {
    it('chart section should have consistent styling', () => {
      const chartSection = document.querySelector('#chart-section')
      expect(chartSection).toBeTruthy()

      const container = chartSection.closest('.admin-card, .bg-white')
      expect(container.classList.contains('mx-6')).toBe(true)
      expect(container.classList.contains('mb-6')).toBe(true)
    })

    it('chart filter should remain in chart panel', () => {
      const chartSection = document.querySelector('#chart-section')
      const chartFilter = document.querySelector('#chart-status-filter')

      expect(chartFilter).toBeTruthy()
      expect(chartSection.contains(chartFilter)).toBe(true)
    })
  })

  describe('8. Top Products Section', () => {
    it('should have consistent styling with other sections', () => {
      const topProductsSection = document.querySelector('#top-products-section')
      expect(topProductsSection).toBeTruthy()

      const container = topProductsSection.closest('.admin-card, .bg-white')
      expect(container.classList.contains('mx-6')).toBe(true)
    })

    it('should have proper heading', () => {
      const topProductsSection = document.querySelector('#top-products-section')
      const heading = topProductsSection.querySelector('h2')

      expect(heading).toBeTruthy()
      expect(heading.textContent).toContain('Productos Más Vendidos')
    })
  })
})
