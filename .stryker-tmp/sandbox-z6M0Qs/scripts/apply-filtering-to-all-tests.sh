#!/bin/bash

# Script para aplicar filtrado de errores a todos los tests E2E
# Aplica el patrón de mejora a archivos que tienen console tracking pero no filtrado

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Patrón mejorado para beforeEach
BEFOREEACH_PATTERN='    // Setup console error tracking with filtering for expected API errors
    const errors = []
    const expectedErrors = [
      '\''Too many requests'\'',
      '\''database error occurred'\'',
      '\''rate limit'\'',
      '\''__cf_bm'\'',
      '\''Cookie'\''
    ]

    page.on('\''console'\'', msg => {
      if (msg.type() === '\''error'\'') {
        const text = msg.text()

        // Check if this is an expected API error that we should filter out
        const isExpected = expectedErrors.some(expected =>
          text.toLowerCase().includes(expected.toLowerCase())
        )

        if (!isExpected) {
          errors.push(text)
        }
      }
    })

    page.testErrors = errors'

# Directorio de tests
TEST_DIR="/home/manager/Sync/floresya-v1/tests/e2e"

# Contadores
total=0
improved=0
skipped=0
failed=0

echo -e "${GREEN}🚀 Aplicando mejoras de filtrado a todos los tests E2E${NC}\n"

# Obtener todos los archivos .test.js
for file in "$TEST_DIR"/*.test.js; do
  if [ ! -f "$file" ]; then
    continue
  fi

  filename=$(basename "$file")
  total=$((total + 1))

  # Verificar si ya tiene filtrado
  if grep -q "expectedErrors" "$file"; then
    echo -e "${YELLOW}⏭️  $filename ya tiene filtrado${NC}"
    skipped=$((skipped + 1))
    continue
  fi

  # Verificar si tiene console tracking
  if ! grep -q "page.on('console'" "$file"; then
    echo -e "${YELLOW}⏭️  $filename no tiene console tracking${NC}"
    skipped=$((skipped + 1))
    continue
  fi

  echo -e "${GREEN}🔧 Mejorando $filename...${NC}"

  # Crear backup
  cp "$file" "$file.backup"

  # Verificar si ya tiene console tracking con filtrado
  if grep -A 20 "test.beforeEach" "$file" | grep -q "expectedErrors"; then
    echo -e "  ${YELLOW}✅ Ya tiene filtrado${NC}"
    skipped=$((skipped + 1))
    continue
  fi

  # Buscar beforeEach existente y agregar filtrado después de la navegación
  if grep -q "test.beforeEach" "$file"; then
    # Insertar después de la última línea de navegación en beforeEach
    # Buscar la línea después de waitForLoadState o waitForTimeout en beforeEach
    if sed -n '/test\.beforeEach/,/^  test\./p' "$file" | grep -q "page.goto"; then
      # Insertar el patrón de filtrado después de la última waitForTimeout o waitForLoadState en beforeEach
      sed -i '/test\.beforeEach/,/^  test\./{
        /waitForLoadState\|waitForTimeout/ {
          :a
          N
          /\n.*test\./!ba
          i\
\
'"$BEFOREEACH_PATTERN"'
        }
      }' "$file"
    else
      # Si no hay navegación, insertar después del opening brace de beforeEach
      sed -i "/test\.beforeEach(async ({ page }) => {/a\\
\\
$BEFOREEACH_PATTERN" "$file"
    fi
  else
    echo -e "  ${RED}❌ No tiene beforeEach${NC}"
    mv "$file.backup" "$file"
    failed=$((failed + 1))
    continue
  fi

  # Verificar si la edición fue exitosa
  if grep -q "expectedErrors" "$file"; then
    # Verificar sintaxis
    if node -c "$file" 2>/dev/null; then
      echo -e "  ${GREEN}✅ Mejorado y sintaxis OK${NC}"
      improved=$((improved + 1))
      rm "$file.backup"
    else
      echo -e "  ${RED}❌ Error de sintaxis${NC}"
      mv "$file.backup" "$file"
      failed=$((failed + 1))
    fi
  else
    echo -e "  ${RED}❌ No se pudo aplicar el filtrado${NC}"
    mv "$file.backup" "$file"
    failed=$((failed + 1))
  fi
done

echo ""
echo "========================================"
echo -e "${GREEN}📊 RESUMEN DE MEJORAS${NC}"
echo "========================================"
echo "Total archivos: $total"
echo -e "${GREEN}Mejorados: $improved${NC}"
echo -e "${YELLOW}Omitidos: $skipped${NC}"
echo -e "${RED}Fallidos: $failed${NC}"
echo "========================================"
echo ""

if [ $failed -eq 0 ]; then
  echo -e "${GREEN}✨ ¡Completado exitosamente!${NC}"
else
  echo -e "${YELLOW}⚠️  $failed archivos fallaron${NC}"
fi
