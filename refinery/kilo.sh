#!/bin/bash

# kilo → Ejecuta kilocode en modo --auto leyendo instructions.txt
# → Totalmente silencioso (sin salida de kilocode)
# → Solo muestra estado final del script
# → Devuelve el código de salida EXACTO de kilocode

set -euo pipefail

INSTRUCCIONES="instructions.txt"

# Colores solo para nuestro propio feedback
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Verificaciones rápidas y silenciosas
command -v kilocode >/dev/null 2>&1 || {
    echo -e "${RED}✗ kilocode CLI no está instalado${NC}" >&2
    echo "   npm install -g @kilocode/cli" >&2
    exit 127
}

[[ -f "$INSTRUCCIONES" ]] || {
    echo -e "${RED}✗ No existe $INSTRUCCIONES en $(pwd)$NC" >&2
    exit 2
}

# 2. Mensaje de inicio (opcional, puedes borrarlo si quieres silencio total)
echo -e "${BLUE}▶ Ejecutando kilocode (silenciado) → $INSTRUCCIONES${NC}"

# 3. Ejecución 100 % silenciosa de kilocode + captura del código de salida real
# cat "$INSTRUCCIONES" | kilocode --auto >/dev/null 2>&1
cat "$INSTRUCCIONES" | kilocode --auto
EXIT_CODE=$?

# 4. Feedback final limpio (solo éxito o error)
if [[ $EXIT_CODE -eq 0 ]]; then
    echo -e "${GREEN}✓ Completado con éxito${NC}"
elif [[ $EXIT_CODE -eq 124 ]]; then
    echo -e "${RED}✗ Timeout excedido${NC}"
else
    echo -e "${RED}✗ Falló (código $EXIT_CODE)$NC"
fi

# clave Kimi sk-XsTKnsgvu5jibffJtkEaOHizmToWgHdLkMQZP1YBy2Rco3JR
# 5. Importante: retransmitir el código de salida original
exit $EXIT_CODE