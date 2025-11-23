/**
 * FloresYa - Global Footer Component
 * Standardized footer for all pages with dynamic theme support
 */

export class FooterComponent {
  constructor(containerId = 'global-footer') {
    this.containerId = containerId
    this.container = document.getElementById(containerId)

    // If container doesn't exist, try to find 'footer' tag or create one at the end of body
    if (!this.container) {
      const existingFooter = document.querySelector('footer')
      if (existingFooter) {
        this.container = existingFooter
      } else {
        this.container = document.createElement('footer')
        this.container.id = 'global-footer'
        document.body.appendChild(this.container)
      }
    }

    this.init()
  }

  init() {
    this.render()
    this.applyStyles()
  }

  applyStyles() {
    // Add dynamic styles for the footer if not already present
    if (!document.getElementById('footer-dynamic-styles')) {
      const style = document.createElement('style')
      style.id = 'footer-dynamic-styles'
      style.textContent = `
        .theme-footer-gradient {
          background: var(--footer-gradient, linear-gradient(135deg, #1f2937 0%, #111827 100%));
          color: var(--footer-text, #f3f4f6);
          position: relative;
          overflow: hidden;
        }
        
        .theme-footer-gradient::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }

        .footer-link {
          color: var(--footer-text-light, #9ca3af);
          transition: color 0.2s ease;
        }

        .footer-link:hover {
          color: var(--footer-link-hover, #ffffff);
        }

        .footer-icon {
          color: var(--footer-heading, #ec4899);
        }
        
        .footer-heading {
          color: var(--footer-heading, #ec4899);
        }
      `
      document.head.appendChild(style)
    }
  }

  render() {
    const currentYear = new Date().getFullYear()

    this.container.className = 'footer-section theme-footer-gradient py-8 mt-auto'
    this.container.innerHTML = `
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Brand -->
          <div class="space-y-3">
            <div class="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-5 w-5 footer-heading"
              >
                <path
                  d="M12 7.5a4.5 4.5 0 1 1 4.5 4.5M12 7.5A4.5 4.5 0 1 0 7.5 12M12 7.5V9m-4.5 3a4.5 4.5 0 1 0 4.5 4.5M7.5 12H9m7.5 0a4.5 4.5 0 1 1-4.5 4.5m4.5-4.5H15m-3 4.5V15"
                />
                <circle cx="12" cy="12" r="1" />
                <path d="m8.7 3.4 6.9 6.9" />
                <path d="m3.4 8.7 6.9 6.9" />
                <path d="m8.7 20.6 6.9-6.9" />
                <path d="m20.6 15.3-6.9-6.9" />
              </svg>
              <span class="text-lg font-bold footer-heading">FloresYa</span>
            </div>
            <p class="footer-link text-sm leading-snug">
              Tu floristería en línea de confianza.
            </p>
            <div class="flex space-x-3">
              <a href="#" class="footer-link hover:scale-110 transition-transform" aria-label="Facebook">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-4 w-4"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" class="footer-link hover:scale-110 transition-transform" aria-label="Instagram">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-4 w-4"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a href="#" class="footer-link hover:scale-110 transition-transform" aria-label="Twitter">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-4 w-4"
                >
                  <path
                    d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <!-- Products -->
          <div class="space-y-2">
            <h6 class="font-bold text-base footer-heading">Productos</h6>
            <ul class="space-y-1 text-sm">
              <li><a href="/#productos" class="footer-link">Rosas</a></li>
              <li><a href="/#productos" class="footer-link">Bouquets</a></li>
              <li><a href="/#productos" class="footer-link">Plantas</a></li>
              <li><a href="/#productos" class="footer-link">Arreglos</a></li>
            </ul>
          </div>

          <!-- Occasions -->
          <div class="space-y-2">
            <h6 class="font-bold text-base footer-heading">Ocasiones</h6>
            <ul class="space-y-1 text-sm">
              <li><a href="/#productos" class="footer-link">Amor</a></li>
              <li><a href="/#productos" class="footer-link">Cumpleaños</a></li>
              <li><a href="/#productos" class="footer-link">Aniversarios</a></li>
              <li><a href="/#productos" class="footer-link">Día de la Madre</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div class="space-y-2">
            <h6 class="font-bold text-base footer-heading">Contacto</h6>
            <div class="space-y-1 text-sm">
              <p class="flex items-center footer-link">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-3 w-3 mr-2 footer-icon"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Gran Caracas, Venezuela
              </p>
              <p class="flex items-center footer-link">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-3 w-3 mr-2 footer-icon"
                >
                  <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                  />
                </svg>
                +58 412-1234567
              </p>
              <p class="flex items-center footer-link">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-3 w-3 mr-2 footer-icon"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                contacto@floresya.com
              </p>
              <p class="flex items-center text-xs footer-link">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="h-3 w-3 mr-2 footer-icon"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Lun-Vie: 8:00-18:00 | Sáb: 9:00-16:00
              </p>
            </div>
          </div>
        </div>

        <div class="border-t border-white/10 mt-6 pt-4 text-center md:text-left">
          <div class="flex flex-col md:flex-row justify-between items-center text-sm">
            <p class="footer-link mb-2 md:mb-0">
              &copy; ${currentYear} FloresYa.
            </p>
            <div class="flex space-x-4">
              <a href="#" class="footer-link hover:text-white transition-colors">Términos</a>
              <a href="#" class="footer-link hover:text-white transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

// Auto-initialize if the script is loaded directly
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new FooterComponent()
    })
  } else {
    new FooterComponent()
  }
}
