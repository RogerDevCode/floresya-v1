/**
 * ProductService
 * Business logic for product operations
 * Supports both local (sample) and Supabase data
 * @typedef {import('../types/index.js').Product} Product
 */

import { supabase, isSupabaseConfigured } from './supabase.js'

export class ProductService {
  constructor() {
    this.products = []
    this.useSupabase = isSupabaseConfigured()
    this.loadSampleProducts()
  }

  loadSampleProducts() {
    this.products = [
      {
        id: 1,
        name: 'Ramo Tropical Vibrante',
        price: 45.99,
        image: '/products/vibrant-tropical-flower-bouquet-with-birds-of-para.jpg',
        description: 'Explosión de colores tropicales con aves del paraíso, heliconias y flores exóticas',
        occasion: 'amor',
        featured: true
      },
      {
        id: 2,
        name: 'Bouquet Arcoíris de Rosas',
        price: 52.99,
        image: '/products/rainbow-roses-bouquet-with-multicolored-roses-in-b.jpg',
        description: 'Rosas multicolores que forman un hermoso arcoíris de emociones',
        occasion: 'cumpleanos',
        featured: true
      },
      {
        id: 3,
        name: 'Girasoles Gigantes Alegres',
        price: 38.99,
        image: '/products/large-bright-sunflowers-bouquet-with-yellow-and-or.jpg',
        description: 'Girasoles enormes que irradian alegría y energía positiva',
        occasion: 'madre',
        featured: false
      },
      {
        id: 4,
        name: 'Orquídeas Fucsia Exóticas',
        price: 67.99,
        image: '/products/exotic-bright-pink-orchids-arrangement-in-elegant-.jpg',
        description: 'Orquídeas fucsia exóticas en un arreglo sofisticado y elegante',
        occasion: 'aniversario',
        featured: true
      },
      {
        id: 5,
        name: 'Mix Primaveral Colorido',
        price: 41.99,
        image: '/products/spring-flower-mix-with-tulips-daffodils-and-colorf.jpg',
        description: 'Mezcla primaveral con tulipanes, narcisos y flores de temporada',
        occasion: 'cumpleanos',
        featured: false
      },
      {
        id: 6,
        name: 'Rosas Coral Románticas',
        price: 49.99,
        image: '/products/coral-pink-roses-bouquet-romantic-arrangement-with.jpg',
        description: 'Rosas en tonos coral que expresan amor y ternura',
        occasion: 'amor',
        featured: true
      },
      {
        id: 7,
        name: 'Lirios Naranjas Vibrantes',
        price: 44.99,
        image: '/products/bright-orange-lilies-arrangement-with-vibrant-oran.jpg',
        description: 'Lirios naranjas que aportan energía y vitalidad a cualquier espacio',
        occasion: 'graduacion',
        featured: false
      },
      {
        id: 8,
        name: 'Peonías Rosa Suave',
        price: 58.99,
        image: '/products/soft-pink-peonies-arrangement-delicate-romantic-fl.jpg',
        description: 'Peonías delicadas en tonos rosa suave para momentos románticos',
        occasion: 'amor',
        featured: true
      },
      {
        id: 9,
        name: 'Claveles Multicolor Festivos',
        price: 35.99,
        image: '/products/multicolored-carnations-bouquet-with-bright-festiv.jpg',
        description: 'Claveles vibrantes en colores festivos perfectos para celebraciones',
        occasion: 'cumpleanos',
        featured: false
      },
      {
        id: 10,
        name: 'Bouquet Nupcial Elegante',
        price: 89.99,
        image: '/products/white-and-pink-bridal-bouquet-with-roses-peonies-a.jpg',
        description: 'Ramo nupcial con rosas blancas, peonías rosa y follaje elegante',
        occasion: 'aniversario',
        featured: true
      }
    ]
  }

  /**
   * Get all products
   * @returns {Promise<Product[]>}
   */
  async getAll() {
    if (this.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false })

        if (error) {
          throw error
        }

        return data
      } catch (error) {
        console.error('Failed to fetch from Supabase, using local:', error)
        return this.products
      }
    }

    return this.products
  }

  /**
   * Get product by ID
   * @param {number} id
   * @returns {Product|undefined}
   */
  getById(id) {
    return this.products.find(p => p.id === id)
  }

  /**
   * Get featured products
   * @returns {Product[]}
   */
  getFeatured() {
    return this.products.filter(p => p.featured)
  }

  /**
   * Filter products by occasion
   * @param {string} occasion
   * @returns {Product[]}
   */
  filterByOccasion(occasion) {
    if (!occasion) {
      return this.products
    }
    return this.products.filter(p => p.occasion === occasion)
  }

  /**
   * Search products by name or description
   * @param {string} query
   * @returns {Product[]}
   */
  search(query) {
    if (!query) {
      return this.products
    }
    const lowerQuery = query.toLowerCase()
    return this.products.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Get paginated products
   * @param {number} page
   * @param {number} perPage
   * @returns {{products: Product[], total: number, page: number, totalPages: number}}
   */
  getPaginated(page = 1, perPage = 8) {
    const start = (page - 1) * perPage
    const end = start + perPage
    const paginatedProducts = this.products.slice(start, end)

    return {
      products: paginatedProducts,
      total: this.products.length,
      page,
      totalPages: Math.ceil(this.products.length / perPage)
    }
  }
}