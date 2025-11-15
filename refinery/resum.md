# Resumen 80/20 de claude.md

## Principios Fundamentales (20% del contenido que aporta 80% del valor)

### Arquitectura y Estructura
- **Stack tecnológico**: Express 5 + Node.js + Supabase (PostgreSQL) + Tailwind v4 + ES6 Modules
- **MVC estricto**: Controllers → Services → DB únicamente. Prohibido acceso directo a DB desde controllers/routes
- **Service Layer**: Solo `api/services/` puede tocar `supabaseClient.js` mediante Repositorios

### Estándares de Calidad
- **KISS principle**: Mantener todo simple, sin abstracciones complejas
- **SOLID + DI Container + Repo-per-entity**: Código 100% limpio con ESLint
- **OpenAPI 3.1 contract-first**: Documentación completa en `api/docs/openapi-annotations.js`

### Manejo de Errores y Datos
- **Fail Fast**: Lanzar errores personalizados `AppError.js`, todo `try-catch` debe loguear y relanzar
- **Soft-delete obligatorio**: Usar flags `active`/`is_active`, consultas por defecto excluyen inactivos
- **Controller JSON spec**: Formato `{ success, data/error, message }` sin excepciones

### Proceso de Desarrollo
- **Ritual pre-código**: Leer archivos completos, mapear contexto, crear blueprint mental, escribir quirúrgicamente
- **Validación estricta**: `node -c` + ESLint, doble verificación lógica
- **Test validation**: Comparar resultados contra valores esperados, nunca adaptar assertions

### Límites Críticos
- **Rendimiento**: ≤50% CPU, ≤4 hilos background
- **Precisión**: Validar cada afirmación con ≥2 fuentes legítimas (MIT, Stanford, Google, AWS)
- **Código limpio**: Solo async con await, middleware wrapper para async, eliminar código muerto

## Easter Eggs
- "WFI" → "waiting for input"
- "QS" → "Questions & Suggestions"

## Recordatorio Final
Al finalizar cada tarea, terminar todos los procesos generados.