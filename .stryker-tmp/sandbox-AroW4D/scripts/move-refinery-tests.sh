#!/bin/bash

# Script para mover tests de refinery/test a test/ de forma inteligente
# Con backup automático y preferencia por archivos originales

set -e

SOURCE_DIR="refinery/test"
TARGET_DIR="test"
BACKUP_DIR="test_backup_$(date +%Y%m%d_%H%M%S)"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Mover Tests: refinery/test → test/                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Validar que existe el directorio fuente
if [ ! -d "$SOURCE_DIR" ]; then
  echo -e "${RED}❌ Error: No existe $SOURCE_DIR${NC}"
  exit 1
fi

# Crear directorio destino si no existe
if [ ! -d "$TARGET_DIR" ]; then
  echo -e "${YELLOW}📁 Creando directorio $TARGET_DIR${NC}"
  mkdir -p "$TARGET_DIR"
fi

# Crear backup del directorio destino actual
echo -e "${YELLOW}💾 Creando backup de $TARGET_DIR → $BACKUP_DIR${NC}"
cp -r "$TARGET_DIR" "$BACKUP_DIR"
echo -e "${GREEN}✅ Backup creado en $BACKUP_DIR${NC}"
echo ""

# Contadores
total_files=0
moved_files=0
overwritten_files=0
skipped_files=0
conflicts_resolved=0

# Función para mover un archivo
move_file() {
  local src_file="$1"
  local rel_path="${src_file#$SOURCE_DIR/}"
  local dest_file="$TARGET_DIR/$rel_path"
  local dest_dir=$(dirname "$dest_file")
  
  total_files=$((total_files + 1))
  
  # Crear directorio destino si no existe
  mkdir -p "$dest_dir"
  
  # Verificar si el archivo destino ya existe
  if [ -f "$dest_file" ]; then
    # Comparar archivos
    if cmp -s "$src_file" "$dest_file"; then
      echo -e "${BLUE}⏭️  Idéntico: $rel_path${NC}"
      skipped_files=$((skipped_files + 1))
      return 0
    else
      # Archivos diferentes - sobreescribir con preferencia al original
      echo -e "${YELLOW}⚠️  Conflicto: $rel_path${NC}"
      echo -e "   ${YELLOW}→ Sobrescribiendo con archivo de refinery/test${NC}"
      cp -f "$src_file" "$dest_file"
      overwritten_files=$((overwritten_files + 1))
      conflicts_resolved=$((conflicts_resolved + 1))
    fi
  else
    # Archivo no existe en destino - mover
    echo -e "${GREEN}✅ Nuevo: $rel_path${NC}"
    cp "$src_file" "$dest_file"
    moved_files=$((moved_files + 1))
  fi
}

# Recorrer todos los archivos en refinery/test
echo -e "${BLUE}🔍 Escaneando archivos en $SOURCE_DIR...${NC}"
echo ""

while IFS= read -r -d '' file; do
  if [ -f "$file" ]; then
    move_file "$file"
  fi
done < <(find "$SOURCE_DIR" -type f -print0)

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    RESUMEN                               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "📊 Archivos procesados:     ${BLUE}$total_files${NC}"
echo -e "✅ Nuevos archivos movidos: ${GREEN}$moved_files${NC}"
echo -e "♻️  Archivos sobrescritos:  ${YELLOW}$overwritten_files${NC}"
echo -e "⏭️  Archivos idénticos:     ${BLUE}$skipped_files${NC}"
echo -e "⚠️  Conflictos resueltos:   ${YELLOW}$conflicts_resolved${NC}"
echo ""
echo -e "💾 Backup guardado en: ${GREEN}$BACKUP_DIR${NC}"
echo ""

# Preguntar si eliminar refinery/test
echo -e "${YELLOW}❓ ¿Deseas eliminar el directorio $SOURCE_DIR ahora que se movieron los archivos? (y/N)${NC}"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}🗑️  Eliminando $SOURCE_DIR...${NC}"
  rm -rf "$SOURCE_DIR"
  echo -e "${GREEN}✅ Directorio $SOURCE_DIR eliminado${NC}"
else
  echo -e "${BLUE}ℹ️  Manteniendo $SOURCE_DIR (puedes eliminarlo manualmente después)${NC}"
fi

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ PROCESO COMPLETADO                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Para restaurar el backup si es necesario:"
echo -e "  ${BLUE}rm -rf $TARGET_DIR && mv $BACKUP_DIR $TARGET_DIR${NC}"
echo ""

