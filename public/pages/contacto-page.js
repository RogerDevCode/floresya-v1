import { onDOMReady } from '/js/shared/dom-ready.js'

// Initialize Lucide icons
onDOMReady(function () {
  if (typeof window.lucide !== 'undefined') {
    window.lucide.createIcons()
  }
})
