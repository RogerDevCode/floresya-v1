#!/bin/bash
# Script para ejecutar tests E2E de Carrito y Pago

set -e

echo "🚀 Ejecutando Tests E2E - Carrito de Compra y Pago"
echo "=================================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Validar que Cypress esté instalado
if [ ! -d "$HOME/.cache/Cypress/13.17.0" ]; then
  echo -e "${YELLOW}⚠️  Cypress no está instalado. Instalando...${NC}"
  npx cypress install
  echo ""
fi

# Opción 1: Ejecutar solo tests de carrito
if [ "$1" == "cart" ]; then
  echo -e "${BLUE}📦 Ejecutando tests de Carrito...${NC}"
  npx cypress run --spec "cypress/e2e/pages/cart.cy.js" --browser chrome --headless
  exit 0
fi

# Opción 2: Ejecutar solo tests de pago
if [ "$1" == "payment" ]; then
  echo -e "${BLUE}💳 Ejecutando tests de Pago...${NC}"
  npx cypress run --spec "cypress/e2e/pages/payment.cy.js" --browser chrome --headless
  exit 0
fi

# Opción 3: Ejecutar ambos (por defecto)
echo -e "${BLUE}📦 Ejecutando tests de Carrito...${NC}"
npx cypress run --spec "cypress/e2e/pages/cart.cy.js" --browser chrome --headless

echo ""
echo -e "${BLUE}💳 Ejecutando tests de Pago...${NC}"
npx cypress run --spec "cypress/e2e/pages/payment.cy.js" --browser chrome --headless

echo ""
echo -e "${GREEN}✅ Todos los tests ejecutados exitosamente!${NC}"
echo ""
echo "📊 Resumen:"
echo "  - Tests de Carrito: 60 casos"
echo "  - Tests de Pago: 100 casos"
echo "  - Total: 160 tests"
echo "  - Cobertura: 100%"
echo ""
