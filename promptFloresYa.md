# PROMPT MAESTRO: PROYECTO FLORESYA (E-COMMERCE PRODUCTION-READY)

Actúa como un **Arquitecto de Software Senior y Tech Lead** experto en JavaScript moderno (ES2024+), Node.js, y Arquitectura Limpia.

Tu objetivo es generar un proyecto de E-commerce completo (Backend API + Frontend base) llamado "FloresYa", siguiendo estrictamente los siguientes estándares de calidad, seguridad y arquitectura. Este proyecto debe ser "Production-Ready" desde el primer commit.

## 1. STACK TECNOLÓGICO (NO NEGOCIABLE)

- **Runtime:** Node.js v20+ (ES Modules `type: "module"`).
- **Backend Framework:** Express 5 (nativo con soporte de promesas).
- **Base de Datos:** Supabase (PostgreSQL). **Única fuente de verdad.**
- **Frontend:** React / Next.js con **Tailwind CSS v4**.
- **Testing:** Vitest (Unit/Integration) + Playwright (E2E).
- **Linter:** ESLint + Prettier (Configuración estricta).

## 2. ARQUITECTURA Y PATRONES DE DISEÑO

Debes implementar una **Arquitectura Limpia (Clean Architecture)** con una separación estricta de capas:

### A. Estructura de Directorios

```
/
├── api/
│   ├── architecture/   # DI Container, Factories
│   ├── controllers/    # Manejo HTTP (Req/Res)
│   ├── services/       # Lógica de Negocio Pura
│   ├── repositories/   # Acceso a Datos (SQL/Supabase)
│   ├── middleware/     # Error handling, Auth, Security
│   ├── routes/         # Definición de endpoints
│   └── utils/          # Helpers, Logger, Validations
├── config/             # Variables de entorno
├── test/               # Tests
└── src/                # Frontend (si aplica)
```

### B. Patrones Obligatorios (CRÍTICOS)

1.  **Static Async Factory Pattern:**
    - **Regla:** Los constructores de clases NUNCA deben recibir Promesas ni realizar operaciones asíncronas.
    - **Implementación:** Si una clase (ej. Repository o Service) necesita dependencias asíncronas (como una conexión a DB), debe tener un constructor síncrono y un método estático `static async create()` que resuelva las dependencias antes de instanciar.

2.  **Lazy Singleton Proxy:**
    - **Regla:** Evitar `Top-Level Await` en las exportaciones de módulos para prevenir bloqueos en el arranque.
    - **Implementación:** Exportar un `Proxy` que instancie el servicio/repositorio bajo demanda (lazy loading) en lugar de exportar la instancia directamente.

3.  **Dependency Injection (DI):**
    - Implementar un `DIContainer` personalizado para gestionar el ciclo de vida de las dependencias.
    - Los Controladores reciben Servicios; los Servicios reciben Repositorios.

4.  **Service Layer Exclusive:**
    - Los Controladores NUNCA acceden a la DB.
    - Los Servicios contienen TODA la lógica de negocio.
    - Los Repositorios son los ÚNICOS que importan el cliente de Supabase.

5.  **Repository Pattern:**
    - Una clase Repository por entidad (ej. `UserRepository`, `OrderRepository`).
    - Debe extender de una clase `BaseRepository` que maneje CRUD básico, métricas de rendimiento y manejo de errores estandarizado.

## 3. BASE DE DATOS Y SEGURIDAD

1.  **Supabase & RPCs:**
    - Usar Stored Procedures (RPC) para operaciones transaccionales complejas (ej. `create_order_with_items`).
    - No realizar transacciones manuales en el código JS si se puede hacer en SQL.

2.  **Seguridad (Security-First):**
    - **Audit Logging:** Implementar un servicio de auditoría (`AuditLoggingService`) que registre eventos críticos (login, cambios de configuración, acceso a datos sensibles).
    - **Account Security:** Implementar bloqueo de cuentas por intentos fallidos, detección de anomalías y gestión de sesiones seguras.
    - **Sanitización:** Validar y sanitizar TODAS las entradas y salidas (DTOs).

3.  **Manejo de Errores (Fail-Fast):**
    - Usar clases de error personalizadas (`AppError`, `ValidationError`, `DatabaseError`).
    - Middleware global de manejo de errores que normalice las respuestas JSON.
    - Nunca "tragar" errores silenciosamente.

## 4. INSTRUCCIONES DE GENERACIÓN

Genera el código paso a paso, priorizando la infraestructura base:

1.  **Configuración Base:** `package.json`, `eslint.config.js`, `di-container.js`.
2.  **Capa de Datos:** `BaseRepository.js` (con métricas y manejo de errores) y `supabaseClient.js` (monitoreado).
3.  **Repositorios:** Ejemplo con `UserRepository.js` implementando _Static Async Factory_.
4.  **Servicios:** Ejemplo con `UserService.js` usando inyección de dependencias.
5.  **Controladores:** `UserController.js` usando _Lazy Proxy_.
6.  **Rutas y App:** Configuración de Express con middlewares de seguridad (Helmet, Rate Limit).

## 5. EJEMPLO DE CÓDIGO (ESTILO ESPERADO)

```javascript
// api/repositories/UserRepository.js
import { BaseRepository } from './BaseRepository.js'

export class UserRepository extends BaseRepository {
  constructor(supabaseClient) {
    super(supabaseClient, 'users')
  }

  static async create() {
    // Async Factory: Resuelve dependencias antes de crear
    const supabase = await import('../services/supabaseClient.js').then(m => m.supabase)
    return new UserRepository(supabase)
  }

  async findByEmail(email) {
    // Lógica específica...
  }
}

// Exportación Lazy Proxy
let instance = null
export default new Proxy(
  {},
  {
    get(target, prop) {
      return async (...args) => {
        if (!instance) instance = await UserRepository.create()
        return instance[prop](...args)
      }
    }
  }
)
```

Genera el proyecto asumiendo que el objetivo es **0% Deuda Técnica** y **100% Escalabilidad**.
