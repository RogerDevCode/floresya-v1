/**
 * Product Editor Page Logic
 */
import { onDOMReady } from '../../js/shared/dom-ready.js'

onDOMReady(() => {
  // Initialize icons first
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons()
  }

  // Add event listeners for buttons
  document.getElementById('save-product-btn').addEventListener('click', () => {
    alert('Producto guardado exitosamente')
  })

  document.getElementById('cancel-product-btn').addEventListener('click', () => {
    window.location.href = './dashboard.html'
  })

  // Add event listener for image upload trigger
  document.getElementById('upload-trigger').addEventListener('click', () => {
    document.getElementById('image-upload').click()
  })

  // Add event listener for image upload
  document.getElementById('image-upload').addEventListener('change', e => {
    if (e.target.files.length > 0) {
      alert(`Seleccionadas ${e.target.files.length} imágenes para subir`)
    }
  })

  // Add event listeners for image deletion
  document.querySelectorAll('.delete-image-btn').forEach(button => {
    button.addEventListener('click', e => {
      if (confirm('¿Eliminar esta imagen?')) {
        e.target.closest('.relative').remove()
      }
    })
  })
})
