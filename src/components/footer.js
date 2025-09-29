/**
 * Footer Component
 */

export class Footer {
  render() {
    const currentYear = new Date().getFullYear()

    return `
      <footer class="bg-forest-900 text-white py-12 mt-20">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Brand -->
            <div>
              <div class="flex items-center space-x-3 mb-4">
                <div class="w-10 h-10 bg-coral-500 rounded-full flex items-center justify-center">
                  <i data-lucide="flower" class="h-6 w-6 text-white"></i>
                </div>
                <span class="text-2xl font-bold">FloresYa</span>
              </div>
              <p class="text-forest-300">
                Flores frescas y coloridas para cada ocasión especial.
                Entrega en Caracas.
              </p>
            </div>

            <!-- Links -->
            <div>
              <h3 class="font-bold text-lg mb-4">Navegación</h3>
              <ul class="space-y-2">
                <li><a href="#productos" class="text-forest-300 hover:text-coral-400 transition-colors">Productos</a></li>
                <li><a href="#servicios" class="text-forest-300 hover:text-coral-400 transition-colors">Servicios</a></li>
                <li><a href="#contacto" class="text-forest-300 hover:text-coral-400 transition-colors">Contacto</a></li>
                <li><a href="#about" class="text-forest-300 hover:text-coral-400 transition-colors">Nosotros</a></li>
              </ul>
            </div>

            <!-- Info -->
            <div>
              <h3 class="font-bold text-lg mb-4">Información</h3>
              <ul class="space-y-2">
                <li><a href="#" class="text-forest-300 hover:text-coral-400 transition-colors">Política de Privacidad</a></li>
                <li><a href="#" class="text-forest-300 hover:text-coral-400 transition-colors">Términos y Condiciones</a></li>
                <li><a href="#" class="text-forest-300 hover:text-coral-400 transition-colors">Envíos y Devoluciones</a></li>
                <li><a href="#" class="text-forest-300 hover:text-coral-400 transition-colors">FAQ</a></li>
              </ul>
            </div>

            <!-- Contact -->
            <div>
              <h3 class="font-bold text-lg mb-4">Contacto</h3>
              <ul class="space-y-2">
                <li class="flex items-center text-forest-300">
                  <i data-lucide="mail" class="h-4 w-4 mr-2"></i>
                  info@floresya.com
                </li>
                <li class="flex items-center text-forest-300">
                  <i data-lucide="phone" class="h-4 w-4 mr-2"></i>
                  +58 414-123-4567
                </li>
                <li class="flex items-center text-forest-300">
                  <i data-lucide="map-pin" class="h-4 w-4 mr-2"></i>
                  Caracas, Venezuela
                </li>
              </ul>

              <!-- Social -->
              <div class="flex gap-4 mt-4">
                <a href="#" class="w-10 h-10 bg-forest-800 hover:bg-coral-500 rounded-full flex items-center justify-center transition-colors">
                  <i data-lucide="instagram" class="h-5 w-5"></i>
                </a>
                <a href="#" class="w-10 h-10 bg-forest-800 hover:bg-coral-500 rounded-full flex items-center justify-center transition-colors">
                  <i data-lucide="facebook" class="h-5 w-5"></i>
                </a>
                <a href="#" class="w-10 h-10 bg-forest-800 hover:bg-coral-500 rounded-full flex items-center justify-center transition-colors">
                  <i data-lucide="twitter" class="h-5 w-5"></i>
                </a>
              </div>
            </div>
          </div>

          <div class="border-t border-forest-800 mt-8 pt-8 text-center text-forest-400">
            <p>&copy; ${currentYear} FloresYa. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    `
  }
}