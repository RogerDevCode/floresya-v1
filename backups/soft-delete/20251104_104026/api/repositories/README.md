# Repository Pattern - Documentación

## 🎯 **Propósito**

El **Repository Pattern** proporciona una capa de abstracción entre la capa de datos y la lógica de negocio, facilitando:

- ✅ **Testabilidad** (mocking fácil con DI)
- ✅ **Mantenibilidad** (cambios en un solo lugar)
- ✅ **Consistencia** (operaciones estandarizadas)
- ✅ **Separación de concerns** (lógica de negocio vs acceso a datos)

---

## 📁 **Estructura**

```
api/repositories/
├── BaseRepository.js          # Clase base con operaciones CRUD comunes
├── ProductRepository.js       # Repositorio específico para productos
├── UserRepository.js          # Repositorio específico para usuarios
├── OrderRepository.js         # Repositorio específico para pedidos
└── README.md                  # Esta documentación
```

---

## 🏗️ **Arquitectura**

```
┌─────────────────────────────────────┐
│           Controllers               │
│  (API Endpoints - Lógica HTTP)     │
└──────────────┬──────────────────────┘
               │
               │ Dependency Injection
               ▼
┌─────────────────────────────────────┐
│            Services                 │
│      (Lógica de Negocio)           │
└──────────────┬──────────────────────┘
               │
               │ Uses
               ▼
┌─────────────────────────────────────┐
│         Repositories                │
│     (Abstracción de Datos)          │
└──────────────┬──────────────────────┘
               │
               │ Access
               ▼
┌─────────────────────────────────────┐
│         Supabase Database           │
│         (PostgreSQL)                │
└─────────────────────────────────────┘
```

---

## 🚀 **Uso con Dependency Injection**

### **Registrar en DI Container:**

```javascript
// En api/architecture/di-config.js
import { createProductRepository } from './repositories/ProductRepository.js'
import { createUserRepository } from './repositories/UserRepository.js'
import { createOrderRepository } from './repositories/OrderRepository.js'

export function configureDIContainer() {
  // Registrar repositories como singletons
  DIContainer.register('ProductRepository', createProductRepository, ['SupabaseClient'])
  DIContainer.register('UserRepository', createUserRepository, ['SupabaseClient'])
  DIContainer.register('OrderRepository', createOrderRepository, ['SupabaseClient'])

  console.log('✅ Repositories registered in DI Container')
}
```

### **Usar en Services:**

```javascript
// En api/services/productService.js
export class ProductService {
  constructor(productRepository) {
    this.productRepository = productRepository
  }

  async getProductById(id) {
    return await this.productRepository.findById(id)
  }

  async getAllProducts(filters = {}, options = {}) {
    return await this.productRepository.findAllWithFilters(filters, options)
  }

  async createProduct(data) {
    return await this.productRepository.create(data)
  }
}
```

---

## 📚 **API Reference**

### **BaseRepository (Clase Abstracta)**

#### **Operaciones CRUD Básicas**

```javascript
// Crear registro
const product = await repository.create({ name: 'Rose', price: 50 })

// Obtener por ID
const product = await repository.findById(1)

// Obtener todos con filtros
const products = await repository.findAll({ featured: true }, { limit: 10 })

// Actualizar
const updated = await repository.update(1, { price: 60 })

// Soft delete
const deleted = await repository.delete(1, { deletedBy: 2, reason: 'Discontinued' })

// Reactivar
const reactivated = await repository.reactivate(1, 2)

// Verificar existencia
const exists = await repository.exists({ sku: 'R001' })

// Contar registros
const count = await repository.count({ is_active: true })
```

---

### **ProductRepository (Extiende BaseRepository)**

```javascript
const productRepo = DIContainer.resolve('ProductRepository')

// Operaciones específicas de productos
const product = await productRepo.findByIdWithImages(1, false, 'medium')
const featured = await productRepo.findFeatured(5)
const byOccasion = await productRepo.findByOccasion(3, { inStockOnly: true })
const updatedOrder = await productRepo.updateCarouselOrder(1, 5)
const updatedStock = await productRepo.updateStock(1, 100)

// Gestión de ocasiones
const occasions = await productRepo.getProductOccasions(1)
await productRepo.linkOccasion(1, 3)
await productRepo.unlinkOccasion(1, 3)
const relations = await productRepo.replaceOccasions(1, [3, 5, 7])

// Búsqueda por SKU
const bySku = await productRepo.findBySku('R-ROSE-001')
```

---

### **UserRepository (Extiende BaseRepository)**

```javascript
const userRepo = DIContainer.resolve('UserRepository')

// Operaciones específicas de usuarios
const user = await userRepo.findByEmail('user@example.com')
const verified = await userRepo.findByEmailVerificationStatus(true)
const byRole = await userRepo.findByRole('admin')
const search = await userRepo.searchUsers('john', false, 50)
const stats = await userRepo.getStats()

// Gestión de usuarios
const reactivated = await userRepo.createWithReactivation(userData)
await userRepo.verifyEmail(1)
await userRepo.updateLastAccess(1)
const audit = await userRepo.getAuditHistory(1)

// Verificación de permisos
const hasPermission = userRepo.hasPermission(user, 'admin')
```

---

### **OrderRepository (Extiende BaseRepository)**

```javascript
const orderRepo = DIContainer.resolve('OrderRepository')

// Operaciones específicas de pedidos
const order = await orderRepo.findByIdWithItems(1)
const byUser = await orderRepo.findByUserId(2, { limit: 10 })
const byStatus = await orderRepo.findByStatus('pending')
const byPayment = await orderRepo.findByPaymentStatus('paid')
const byDateRange = await orderRepo.findByDateRange('2025-01-01', '2025-12-31')
const search = await orderRepo.searchOrders('john@', false, 50)

// Gestión de estados
await orderRepo.updateStatus(1, 'shipped')
await orderRepo.updatePaymentStatus(1, 'paid', 'credit_card')
await orderRepo.cancel(1, 'Customer request')

// Estadísticas
const stats = await orderRepo.getStats({ dateFrom: '2025-01-01' })

// Cálculo de totales
const total = orderRepo.calculateOrderTotal([
  { price: 50, quantity: 2, discount: 5 },
  { price: 30, quantity: 1, discount: 0 }
])
```

---

## 🧪 **Testing con Repositories**

### **Mock Repository para Tests**

```javascript
// Test con DI Container
import { DIContainer } from '../architecture/di-container.js'

describe('ProductService', () => {
  let productService
  let mockRepository

  beforeEach(() => {
    DIContainer.clear()
    mockRepository = {
      findById: jest.fn(),
      findAllWithFilters: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
    DIContainer.register('ProductRepository', mockRepository)
    productService = DIContainer.resolve('ProductService')
  })

  it('should get product by id', async () => {
    const mockProduct = { id: 1, name: 'Rose' }
    mockRepository.findById.mockResolvedValue(mockProduct)

    const product = await productService.getProductById(1)

    expect(product).toEqual(mockProduct)
    expect(mockRepository.findById).toHaveBeenCalledWith(1)
  })
})
```

### **Test de Repository Real**

```javascript
describe('ProductRepository', () => {
  let repository

  beforeAll(() => {
    repository = createProductRepository(supabaseClient)
  })

  it('should create product', async () => {
    const product = await repository.create({
      name: 'Test Rose',
      sku: 'TEST-001',
      price: 50
    })

    expect(product).toHaveProperty('id')
    expect(product.name).toBe('Test Rose')
  })
})
```

---

## 🔄 **Migración de Services Existentes**

### **Antes (Acceso directo a Supabase):**

```javascript
// api/services/productService.js
export async function getProductById(id) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()

  if (error) throw error
  return data
}
```

### **Después (Con Repository Pattern):**

```javascript
// api/services/productService.js
import { createProductRepository } from '../repositories/ProductRepository.js'

export class ProductService {
  constructor(supabaseClient) {
    this.productRepository = createProductRepository(supabaseClient)
  }

  async getProductById(id) {
    return await this.productRepository.findById(id)
  }
}

// Factory
export function createProductService(supabaseClient = supabase) {
  return new ProductService(supabaseClient)
}
```

---

## 📊 **Beneficios**

| Aspecto            | Antes                        | Después                      |
| ------------------ | ---------------------------- | ---------------------------- |
| **Testabilidad**   | Difícil (Supabase acoplado)  | Fácil (mocking de repos)     |
| **Reutilización**  | Código duplicado             | Operaciones centralizadas    |
| **Mantenibilidad** | Cambios en múltiples lugares | Cambios en un solo lugar     |
| **Consistencia**   | Validaciones manuales        | Validaciones centralizadas   |
| **Abstracción**    | Dependencia directa          | Capa de abstracción          |
| **Flexibilidad**   | Difícil cambiar DB           | Fácil cambiar implementación |

---

## 🎯 **Mejores Prácticas**

### ✅ **Hacer:**

- Usar Repositories para TODAS las operaciones de datos
- Inyectar repositories en Services via DI
- Mantener lógica de negocio en Services, no en Repositories
- Usar métodos específicos del repository cuando existan
- Aplicar el patrón **Fail Fast** en validaciones

### ❌ **No hacer:**

- No mezclar lógica de negocio en Repositories
- No acceder directamente a Supabase desde Controllers
- No crear queries complejas en Controllers
- No dupliqué lógica de acceso a datos

---

## 📦 **Instalación y Configuración**

### **1. Registrar en DI Container:**

```javascript
// api/architecture/di-config.js
import { createProductRepository } from '../repositories/ProductRepository.js'
import { createUserRepository } from '../repositories/UserRepository.js'
import { createOrderRepository } from '../repositories/OrderRepository.js'

export function configureDIContainer() {
  // Repositories
  DIContainer.register('ProductRepository', createProductRepository, ['SupabaseClient'])
  DIContainer.register('UserRepository', createUserRepository, ['SupabaseClient'])
  DIContainer.register('OrderRepository', createOrderRepository, ['SupabaseClient'])
}
```

### **2. Usar en Services:**

```javascript
// En constructors
constructor(productRepository, userRepository) {
  this.productRepository = productRepository
  this.userRepository = userRepository
}
```

---

## 🔗 **Integración con Otros Patrones**

### **+ Clean Architecture:**

- Controllers → Services → Repositories → Database

### **+ Dependency Injection:**

- DI Container registra y resuelve repositories automáticamente

### **+ Soft Delete:**

- Repositories implementan soft delete por defecto

### **+ Validator Service:**

- Services pueden usar ValidatorService antes de guardar

---

## 📚 **Referencias**

- [Martin Fowler - Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [DI Container Documentation](./di-container.js)

---

**Última actualización:** 2025-11-02
**Versión:** 1.0.0
**Estado:** Implementado
