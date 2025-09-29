FloresYa - Enterprise E-commerce Platform
Objective
Develop a TypeScript e-commerce platform for flower delivery adhering to Silicon Valley standards: zero technical debt, clean code, SOLID/DRY principles, strong typing, rigid structure, automated validation, and fail-fast over fallbacks for robust, maintainable, scalable code emulating Java-like strictness.
Core Principles

Single Source of Truth (SSOT): Consolidate all types, interfaces, enums in src/shared/types/index.ts. No duplicates.
tRPC Type Safety: Use tRPC for end-to-end type-safe APIs. Eliminate legacy REST or manual typing.
TypeSafe Database: Employ TypeSafeDatabaseService with Supabase-generated types. No any types.
Service Layer Exclusivity: Services are the ONLY layer authorized to access TypeSafeDatabaseService. tRPC routers, Controllers, and Routes MUST use Services for all database operations.
Zero Tolerance: Enforce no ESLint/TypeScript errors, duplicate files. Strict mode (strict: true, all rules: noImplicitAny, strictNullChecks, etc.).
Fail Fast: In development, prioritize immediate failure in user-facing functions. Wrap code in try-catch with logging and termination on errors; no fallbacks.

Architecture

Backend: Node.js/Express, tRPC routers in src/app/trpc/, Supabase PostgreSQL.
Frontend: Vanilla TypeScript, tRPC hooks in src/frontend/trpc/, Tailwind CSS.
Shared: Types/utilities in src/shared/.
Service Layer: Business logic in src/services/ - ONLY layer authorized to access TypeSafeDatabaseService.
Data Access Pattern: tRPC Routers → Services → TypeSafeDatabaseService → Supabase
Deployment: Vercel via npm run build and vercel-build.

## Service Layer Architecture Rules

CRITICAL: Services are the exclusive gateway to database operations. This enforces:
- Single Responsibility: Each service manages one domain (User, Product, Order, Occasions)
- Dependency Inversion: Higher layers depend on service interfaces, not database implementation
- DRY Principle: Reusable business logic without duplication
- Type Safety: Centralized validation and type conversion
- Maintainability: Business logic changes isolated to service layer

Development Rules
Mandatory

Apply SOLID (Single Responsibility, Open-Closed, etc.) and DRY (Don't Repeat Yourself).
Source all types from src/shared/types/index.ts.
Run npm run validate:quick pre-commit.
Use strict TypeScript and ESLint (zero warnings/errors).
Ensure type-safe, atomic database transactions.
Implement fail-fast: Enclose user-facing functions in try-catch; log errors and throw to terminate.
Enforce Service Layer Architecture: All database access MUST go through Service classes (UserService, ProductService, OrderService, OccasionsService, etc.).

Prohibited

any types, unsafe assertions/casts.
Duplicate types, filenames, or code.
Legacy imports/services.
Direct modifications to dist/ files.
Fallbacks in user-facing functions during development.
Direct TypeSafeDatabaseService imports in tRPC routers, Controllers, or Routes - use Services instead.

Fail-Fast Implementation
typescript// ✅ CORRECT: Fail fast
export async function processOrder(userId: string, order: OrderInput) {
  try {
    const validatedOrder = OrderSchema.parse(order); // Zod validation
    const user = await db.getUser(userId);
    if (!user) throw new Error(`User ${userId} not found`);
    const result = await db.createOrder(validatedOrder);
    return result;
  } catch (error) {
    console.error(`Order processing failed for user ${userId}:`, error);
    throw error; // Terminate
  }
}

// ❌ WRONG: Fallback
export async function processOrder(userId: string, order: OrderInput) {
  const validatedOrder = OrderSchema.parse(order) || defaultOrder; // Avoid
  const user = (await db.getUser(userId)) || defaultUser; // Avoid
  return await db.createOrder(validatedOrder); // No handling
}
Build & Validation
bashnpm run build          # Production build
npm run dev            # Development mode
npm run type:check     # TypeScript check
npm run lint           # ESLint check
npm run test           # Vitest tests
npm run validate       # Full validation
npm run validate:quick # Quick validation
node scripts/validate-ssot.js # SSOT check
Testing

Vitest with V8 coverage.
Mandatory unit/integration tests, including fail-fast error scenarios.

Environment
Required variables: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, NODE_ENV.
Code Quality

Enforce clean code: type guards, Zod runtime validation, consistent imports.
Require try-catch in user-facing functions with logging and immediate failure.
Automated rejection via Master Validator (TypeSafety, Architecture, Security, Performance).

Workflow Example

### ✅ CORRECT: Service Layer Architecture
```typescript
// tRPC Router - uses Service, never direct database access
export const orderRouter = router({
  createOrder: protectedProcedure
    .input(z.object({ userId: z.string(), order: OrderSchema }))
    .output(z.object({ success: z.boolean(), data: OrderSchema }))
    .mutation(async ({ input, ctx }) => {
      try {
        const orderService = new OrderService(); // Use Service
        const result = await orderService.createOrder(input.order);
        return { success: true, data: result };
      } catch (error) {
        console.error(`Order creation failed:`, error);
        throw error; // Fail fast
      }
    }),
});

// Service Layer - ONLY layer that accesses TypeSafeDatabaseService
export class OrderService {
  public async createOrder(orderData: OrderCreateRequest): Promise<Order> {
    // Business logic + database access
    const data = await typeSafeDatabaseService.createOrder(orderData);
    return data;
  }
}
```

### ❌ WRONG: Direct Database Access
```typescript
// BAD: tRPC Router bypassing Service Layer
export const orderRouter = router({
  createOrder: protectedProcedure
    .mutation(async ({ input }) => {
      // VIOLATION: Direct TypeSafeDatabaseService usage
      const result = await typeSafeDatabaseService.createOrder(input.order);
      return result;
    }),
});
```

// Client: Type-safe hook
const { createOrder } = useOrder();
const result = await createOrder({ userId, order });
if (result.success) console.log(result.data); // Fully typed
AI Code Reviewer Guidelines
You are an AI code reviewer for FloresYa. Strictly follow these when analyzing/modifying code:
Mandatory Actions (Platform Must Do)

Eliminate unsafe type assertions (replace data as SomeType with Zod/type guards).
Strengthen Zod schemas to match functions/database exactly.
Implement error handling for validations, mismatches, RPC returns.
Use type guards for runtime checks before access/casting.
Enforce RPC type safety; avoid unknown/direct casts.
Standardize API responses: { success: boolean, data: T, message: string, error?: string }.
Mirror backend responses in frontend interfaces.
Add client-side validation matching backend Zod.
Expand tRPC to all endpoints for type safety.
Define shared types in src/shared/types/index.ts for alignment.
Implement API versioning to avoid breaking changes.
Add integration tests for responses/expectations (pagination, images, orders, auth).
Ensure consistent data handling (images, occasions, currencies, errors).

Prohibited Actions (AI Must Not Do)

Use type assertions/any to bypass validation/checking.
Allow mismatches in parameters/returns/schemas between callers/functions/backend/frontend.
Bypass strict TypeScript/ESLint rules.
Introduce inconsistent structures (e.g., varying image URLs, nested/flat objects).
Map validated data to legacy formats without safety.
Ignore validation errors/unsafe access on unknown types.
Commit with type gaps in integrations/controllers/tRPC.
Change formats without updating shared types/tests.
Allow direct TypeSafeDatabaseService imports in tRPC routers, Controllers, or Routes.
Create database access bypasses that violate Service Layer Architecture.  
    
"Go all out!"  
"Don't hold back, just do it."
"Go hard or go home."
"No warnings, no tears."