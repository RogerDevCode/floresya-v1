/**
 * Demo MCP Integration - FloresYa
 * Script para demostración de funcionalidades MCP
 */

;(function () {
  'use strict'

  /**
   * Inicializar demo MCP
   */
  function initMcpDemo() {
    console.log('🌟 Demo MCP Integration initialized')

    // Crear botón de demo si no existe
    createDemoButton()

    // Configurar event listeners
    setupEventListeners()

    // Mostrar mensaje de bienvenida
    showWelcomeMessage()
  }

  /**
   * Crear botón de demostración
   */
  function createDemoButton() {
    const button = document.createElement('button')
    button.id = 'mcp-demo-button'
    button.textContent = '🚀 Demo MCP'
    button.className = 'mcp-demo-btn'
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      z-index: 1000;
      transition: transform 0.2s ease;
    `

    document.body.appendChild(button)
  }

  /**
   * Configurar event listeners
   */
  function setupEventListeners() {
    const button = document.getElementById('mcp-demo-button')
    if (button) {
      button.addEventListener('click', () => {
        showDemoModal()
      })

      button.addEventListener('mouseover', () => {
        button.style.transform = 'scale(1.05)'
      })

      button.addEventListener('mouseout', () => {
        button.style.transform = 'scale(1)'
      })
    }
  }

  /**
   * Mostrar modal de demostración
   */
  function showDemoModal() {
    const modal = document.createElement('div')
    modal.id = 'mcp-demo-modal'
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    `

    const content = document.createElement('div')
    content.style.cssText = `
      background: white;
      padding: 40px;
      border-radius: 12px;
      max-width: 600px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    `

    content.innerHTML = `
      <h2 style="color: #667eea; margin-bottom: 20px;">🌟 Demo MCP Integration</h2>
      <p style="color: #666; margin-bottom: 30px;">
        Esta es una demostración de las capacidades de MCP (Model Context Protocol)
        integradas con FloresYa.
      </p>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-bottom: 15px;">Características disponibles:</h3>
        <ul style="text-align: left; color: #666; line-height: 1.8;">
          <li>✅ Integración con shadcn/ui</li>
          <li>✅ Componentes reactivos</li>
          <li>✅ Gestión de estado avanzada</li>
          <li>✅ API REST optimizada</li>
        </ul>
      </div>
      <button id="close-mcp-modal" style="
        background: #667eea;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
      ">Cerrar</button>
    `

    modal.appendChild(content)
    document.body.appendChild(modal)

    // Cerrar modal
    const closeBtn = content.querySelector('#close-mcp-modal')
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal)
    })

    modal.addEventListener('click', e => {
      if (e.target === modal) {
        document.body.removeChild(modal)
      }
    })
  }

  /**
   * Mostrar mensaje de bienvenida
   */
  function showWelcomeMessage() {
    console.log('🎉 ¡Demo MCP listo para usar!')
    console.log('💡 Haz clic en el botón "🚀 Demo MCP" para ver la demostración')
  }

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMcpDemo)
  } else {
    initMcpDemo()
  }
})()
