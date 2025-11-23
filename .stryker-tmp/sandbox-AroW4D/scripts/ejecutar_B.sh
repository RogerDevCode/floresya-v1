#!/bin/bash

# Uso: ./ejecutar_B.sh archivo.js
# Ejecuta la plataforma B (kilocode) para validar/mejorar el archivo JS indicado.

archivo_js="$1"

if [ -z "$archivo_js" ]; then
  echo "Error: Debes indicar el archivo JS a procesar."
  echo "Uso: $0 archivo.js"
  exit 1
fi

if [ ! -f "$archivo_js" ]; then
  echo "Error: El archivo '$archivo_js' no existe."
  exit 1
fi

echo "Procesando $archivo_js con plataforma B..."

# Ejecuta kilocode directamente con archivo como argumento para evitar bloqueo
# Reemplaza este comando por el real que uses para tu plataforma B
kilocode --auto "follow the instructions in the file B.txt: $archivo_js"

# Compara el archivo temporal con el original para detectar cambios
if cmp -s "$archivo_js" "${archivo_js}.tmp"; then
  echo "No se detectaron cambios. El archivo original queda sin modificaciones."
  rm "${archivo_js}.tmp"
else
  echo "Cambios detectados. Actualizando archivo original."
  mv "${archivo_js}.tmp" "$archivo_js"
fi

echo "Proceso finalizado."
