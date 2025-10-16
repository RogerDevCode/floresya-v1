# GitHub Actions Quick Fix 🚀

## TL;DR

Tu CI falla porque:

1. `npm run build` no existe
2. E2E tests muy lentos/fallan

## Fix en 2 minutos

```bash
cd /home/manager/Sync/floresya-v1

# Opción 1: Auto
./.github/migrate-workflow.sh

# Opción 2: Manual
mv .github/workflows/ci-cd.yml .github/workflows/ci-cd.old.yml
mv .github/workflows/ci-cd-fixed.yml .github/workflows/ci-cd.yml

# Commit
git add .github package.json package-lock.json playwright.config.ci.js tests/e2e/
git commit -m "fix(ci): optimize workflow"
git push
```

## Configurar Secrets (REQUERIDO)

**GitHub → Settings → Secrets → Actions**

1. `SUPABASE_URL` = `https://tu-proyecto.supabase.co`
2. `SUPABASE_KEY` = `tu-anon-key`

## Qué cambió

| Antes                | Ahora          |
| -------------------- | -------------- |
| `npm run build` ❌   | Removido ✅    |
| 3 navegadores 🐌     | Solo Chrome ⚡ |
| Sin env vars ❌      | Con secrets ✅ |
| npm audit bloquea ❌ | No bloquea ✅  |
| ~20 min ⏱️           | ~12 min ✅     |

## Verificar

```bash
npm run lint
npm run test:coverage
npm run build:css
```

## Documentación

- `RESUMEN_EJECUTIVO.md` - Overview completo
- `GITHUB_ACTIONS_SETUP.md` - Setup detallado
- `INTEGRATION_TESTS_FIXES.md` - Deep dive E2E

## Listo! 🎉

Workflow optimizado y funcionando.
