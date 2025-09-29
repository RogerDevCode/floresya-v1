/**
 * Hero Component
 */

export class Hero {
  render() {
    return `
      <section class="hero-floral pt-20">
        <div class="container mx-auto px-4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div class="text-center lg:text-left">
              <h1 class="text-5xl lg:text-6xl font-bold text-forest-900 mb-6 text-balance">
                Flores Frescas
                <span class="text-coral-500">Llenas de Color</span>
              </h1>
              <p class="text-xl text-forest-700 mb-8 text-pretty">
                Descubre nuestra hermosa colección de ramos vibrantes, arreglos únicos y plantas llenas de vida.
                Entrega fresca y puntual en toda Caracas.
              </p>

              <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button onclick="window.scrollToProducts()" class="btn-coral text-lg px-8 py-4">
                  <i data-lucide="flower" class="h-5 w-5 mr-2"></i>
                  Explorar Catálogo
                </button>
                <button onclick="window.showSpecialSection()" class="btn-sunshine text-lg px-8 py-4">
                  <i data-lucide="heart" class="h-5 w-5 mr-2"></i>
                  Bodas Especiales
                </button>
              </div>

              <!-- Features -->
              <div class="flex flex-wrap gap-6 mt-8 justify-center lg:justify-start">
                <div class="flex items-center text-forest-600">
                  <i data-lucide="truck" class="h-5 w-5 text-coral-500 mr-2"></i>
                  <span class="font-medium">Entrega Gratis</span>
                </div>
                <div class="flex items-center text-forest-600">
                  <i data-lucide="shield-check" class="h-5 w-5 text-forest-500 mr-2"></i>
                  <span class="font-medium">Garantía Fresca</span>
                </div>
                <div class="flex items-center text-forest-600">
                  <i data-lucide="sparkles" class="h-5 w-5 text-sunshine-500 mr-2"></i>
                  <span class="font-medium">Arreglos Únicos</span>
                </div>
              </div>
            </div>

            <div class="relative">
              <div class="flower-grid">
                <img src="/products/vibrant-tropical-flower-bouquet-with-birds-of-para.jpg"
                     alt="Ramo Tropical"
                     class="rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300">
              </div>
            </div>
          </div>
        </div>
      </section>
    `
  }
}