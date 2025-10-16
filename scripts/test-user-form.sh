#!/bin/bash

# FloresYa - User Create Form E2E Test Runner
# Siguiendo CLAUDE.md: KISS, fail-fast, clear logging

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 FloresYa - User Create Form E2E Tests${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if server is running
echo -e "${YELLOW}📡 Verificando servidor...${NC}"

if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Servidor corriendo en http://localhost:3000${NC}\n"
else
    echo -e "${RED}❌ Error: El servidor no está corriendo${NC}"
    echo -e "${YELLOW}💡 Por favor, inicia el servidor con:${NC}"
    echo -e "${BLUE}   npm run dev${NC}\n"
    exit 1
fi

# Check Playwright installation
echo -e "${YELLOW}🔍 Verificando Playwright...${NC}"

if npx playwright --version > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Playwright instalado${NC}\n"
else
    echo -e "${RED}❌ Error: Playwright no está instalado${NC}"
    echo -e "${YELLOW}💡 Instalando Playwright...${NC}"
    npx playwright install
    echo -e "${GREEN}✅ Playwright instalado${NC}\n"
fi

# Parse arguments
TEST_TYPE="${1:-all}"

case $TEST_TYPE in
  "all")
    echo -e "${BLUE}🚀 Ejecutando TODOS los tests del formulario de usuario...${NC}\n"
    npx playwright test user-create-form.test.js --reporter=list
    ;;

  "modal")
    echo -e "${BLUE}🚀 Ejecutando tests de Modal Behavior...${NC}\n"
    npx playwright test user-create-form.test.js -g "Modal Behavior" --reporter=list
    ;;

  "cancel")
    echo -e "${BLUE}🚀 Ejecutando tests de Cancel with Unsaved Changes...${NC}\n"
    npx playwright test user-create-form.test.js -g "Cancel with Unsaved Changes" --reporter=list
    ;;

  "validation")
    echo -e "${BLUE}🚀 Ejecutando tests de Field Validation...${NC}\n"
    npx playwright test user-create-form.test.js -g "Field Validation" --reporter=list
    ;;

  "interaction")
    echo -e "${BLUE}🚀 Ejecutando tests de Form Interactions...${NC}\n"
    npx playwright test user-create-form.test.js -g "Form Interactions" --reporter=list
    ;;

  "submission")
    echo -e "${BLUE}🚀 Ejecutando tests de Form Submission...${NC}\n"
    npx playwright test user-create-form.test.js -g "Form Submission" --reporter=list
    ;;

  "accessibility")
    echo -e "${BLUE}🚀 Ejecutando tests de Accessibility...${NC}\n"
    npx playwright test user-create-form.test.js -g "Accessibility" --reporter=list
    ;;

  "chrome")
    echo -e "${BLUE}🚀 Ejecutando tests solo en Chrome...${NC}\n"
    npx playwright test user-create-form.test.js --project=chromium --reporter=list
    ;;

  "firefox")
    echo -e "${BLUE}🚀 Ejecutando tests solo en Firefox...${NC}\n"
    npx playwright test user-create-form.test.js --project=firefox --reporter=list
    ;;

  "ui")
    echo -e "${BLUE}🚀 Abriendo Playwright UI...${NC}\n"
    npx playwright test user-create-form.test.js --ui
    ;;

  "debug")
    echo -e "${BLUE}🚀 Ejecutando en modo debug...${NC}\n"
    npx playwright test user-create-form.test.js --debug
    ;;

  "report")
    echo -e "${BLUE}🚀 Ejecutando tests y generando reporte HTML...${NC}\n"
    npx playwright test user-create-form.test.js --reporter=html
    echo -e "\n${GREEN}✅ Reporte generado en: playwright-report/index.html${NC}"
    echo -e "${YELLOW}💡 Abre el reporte con: npx playwright show-report${NC}\n"
    ;;

  "help")
    echo -e "${YELLOW}Uso: ./scripts/test-user-form.sh [opción]${NC}\n"
    echo -e "${BLUE}Opciones disponibles:${NC}"
    echo -e "  ${GREEN}all${NC}          - Ejecutar todos los tests (default)"
    echo -e "  ${GREEN}modal${NC}        - Tests de comportamiento del modal"
    echo -e "  ${GREEN}cancel${NC}       - Tests de cancelar con cambios sin guardar"
    echo -e "  ${GREEN}validation${NC}   - Tests de validación de campos"
    echo -e "  ${GREEN}interaction${NC}  - Tests de interacción con formulario"
    echo -e "  ${GREEN}submission${NC}   - Tests de envío del formulario"
    echo -e "  ${GREEN}accessibility${NC}- Tests de accesibilidad"
    echo -e "  ${GREEN}chrome${NC}       - Solo en Chrome"
    echo -e "  ${GREEN}firefox${NC}      - Solo en Firefox"
    echo -e "  ${GREEN}ui${NC}           - Abrir interfaz UI de Playwright"
    echo -e "  ${GREEN}debug${NC}        - Modo debug"
    echo -e "  ${GREEN}report${NC}       - Generar reporte HTML"
    echo -e "  ${GREEN}help${NC}         - Mostrar esta ayuda\n"
    echo -e "${YELLOW}Ejemplos:${NC}"
    echo -e "  ${BLUE}./scripts/test-user-form.sh${NC}              # Todos los tests"
    echo -e "  ${BLUE}./scripts/test-user-form.sh modal${NC}        # Solo modal behavior"
    echo -e "  ${BLUE}./scripts/test-user-form.sh chrome${NC}       # Solo en Chrome"
    echo -e "  ${BLUE}./scripts/test-user-form.sh report${NC}       # Con reporte HTML\n"
    exit 0
    ;;

  *)
    echo -e "${RED}❌ Error: Opción no reconocida: $TEST_TYPE${NC}\n"
    echo -e "${YELLOW}💡 Usa './scripts/test-user-form.sh help' para ver las opciones disponibles${NC}\n"
    exit 1
    ;;
esac

# Test result check
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Tests completados exitosamente!${NC}\n"
else
    echo -e "\n${RED}❌ Algunos tests fallaron${NC}"
    echo -e "${YELLOW}💡 Revisa los errores arriba para más detalles${NC}\n"
    exit 1
fi
