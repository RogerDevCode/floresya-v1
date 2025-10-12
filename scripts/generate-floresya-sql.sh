#!/bin/bash

# =====================================================
# FloresYa - Exportación Completa de Base de Datos
# =====================================================
# Este script exporta la base de datos de Supabase con
# todas las optimizaciones recién agregadas
# =====================================================

set -e  # Detenerse en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando exportación completa de FloresYa DB${NC}"

# Configuración de conexión
DB_HOST="aws-1-sa-east-1.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.dcbavpdlkcjdtjdkntde"
DB_PASSWORD="xhd294CcshhHFCx"
DB_SCHEMA="public"

# Archivo de salida
OUTPUT_FILE="floresya.sql"
BACKUP_FILE="floresya-backup-$(date +%Y%m%d-%H%M%S).sql"

echo -e "${YELLOW}📦 Creando backup del archivo existente...${NC}"
if [ -f "$OUTPUT_FILE" ]; then
    cp "$OUTPUT_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup creado: $BACKUP_FILE${NC}"
fi

echo -e "${YELLOW}🔍 Verificando conexión a la base de datos...${NC}"
export PGPASSWORD="$DB_PASSWORD"

# Test de conexión
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: No se puede conectar a la base de datos${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Conexión exitosa${NC}"

echo -e "${YELLOW}📋 Obteniendo lista de objetos en el esquema public...${NC}"

# Obtener lista de tablas, funciones y otros objetos
TABLES=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
")

FUNCTIONS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT routine_name
    FROM information_schema.routines
    WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
    ORDER BY routine_name;
")

VIEWS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT table_name
    FROM information_schema.views
    WHERE table_schema = 'public'
    ORDER BY table_name;
")

echo -e "${BLUE}📊 Estadísticas encontradas:${NC}"
echo -e "   Tablas: $(echo "$TABLES" | wc -l)"
echo -e "   Funciones: $(echo "$FUNCTIONS" | wc -l)"
echo -e "   Vistas: $(echo "$VIEWS" | wc -l)"

echo -e "${YELLOW}🗄️  Iniciando exportación con pg_dump...${NC}"

# Comando pg_dump con opciones esenciales y compatibles
pg_dump_command="pg_dump \
    -h \"$DB_HOST\" \
    -p \"$DB_PORT\" \
    -U \"$DB_USER\" \
    -d \"$DB_NAME\" \
    -n \"$DB_SCHEMA\" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --quote-all-identifiers \
    --exclude-table-data='query_timeouts_log' \
    --exclude-table-data='busquedas_log' \
    --encoding=UTF8 \
    --no-owner \
    --no-privileges \
    --disable-triggers \
    --inserts \
    --column-inserts \
    --rows-per-insert=1000 \
    --format=plain \
    --file=\"$OUTPUT_FILE\""

echo -e "${BLUE}🔧 Ejecutando:${NC}"
echo "$pg_dump_command"

# Ejecutar el comando
eval "$pg_dump_command"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Exportación completada exitosamente${NC}"
else
    echo -e "${RED}❌ Error durante la exportación${NC}"
    exit 1
fi

echo -e "${YELLOW}🔧 Post-procesando el archivo SQL...${NC}"

# Agregar header con información de la exportación
HEADER="-- FloresYa Database Dump
-- Exportado: $(date)
-- Versión: Con optimizaciones de rendimiento
-- Tablas: $(echo "$TABLES" | wc -l)
-- Funciones: $(echo "$FUNCTIONS" | wc -l)
-- Vistas: $(echo "$VIEWS" | wc -l)

-- Extensiones incluidas:
--   - pg_stat_statements (para análisis de consultas)
--   - pg_trgm (si está disponible, para búsqueda difusa)

-- Configuraciones especiales:
--   - TEXT SEARCH CONFIGURATION: floresya_spanish
--   - Nuevas tablas de monitoreo y analytics
--   - Funciones de optimización de consultas

"

# Crear archivo temporal con header
temp_file=$(mktemp)
echo "$HEADER" > "$temp_file"
cat "$OUTPUT_FILE" >> "$temp_file"
mv "$temp_file" "$OUTPUT_FILE"

echo -e "${YELLOW}📈 Generando reporte de la exportación...${NC}"

# Crear reporte
cat > "export-report-$(date +%Y%m%d-%H%M%S).txt" << EOF
 FloresYa - Reporte de Exportación de Base de Datos
 =============================================

 Fecha: $(date)
 Archivo: $OUTPUT_FILE
 Tamaño: $(du -h "$OUTPUT_FILE" | cut -f1)

 Tablas exportadas:
 $(echo "$TABLES" | sed 's/^/   - /')

 Funciones exportadas:
 $(echo "$FUNCTIONS" | sed 's/^/   - /')

 Vistas exportadas:
 $(echo "$VIEWS" | sed 's/^/   - /')

 Nuevas tablas de monitoreo:
   - query_timeouts_log (registros de timeouts)
   - busquedas_log (analytics de búsquedas)

 Nuevas columnas:
   - products.search_vector (búsqueda full-text)

 Nuevas configuraciones:
   - floresya_spanish (configuración de búsqueda española)
   - pg_stat_statements (extensión de análisis)

 Optimizaciones aplicadas:
   - Índices de rendimiento para tablas principales
   - Funciones de análisis de consultas
   - Vistas de monitoreo de conexiones
   - Sistema de timeouts para consultas lentas

EOF

echo -e "${GREEN}🎉 Exportación completada con éxito!${NC}"
echo -e "${GREEN}📄 Archivo generado: $OUTPUT_FILE${NC}"
echo -e "${GREEN}📊 Reporte creado: export-report-*.txt${NC}"

if [ -f "$BACKUP_FILE" ]; then
    echo -e "${BLUE}🔄 Backup anterior: $BACKUP_FILE${NC}"
fi

echo -e "${YELLOW}💡 Siguiente pasos recomendados:${NC}"
echo -e "   1. Verificar el archivo $OUTPUT_FILE"
echo -e "   2. Actualizar api/services/supabaseClient.js con nuevas tablas"
echo -e "   3. Crear services para las nuevas funcionalidades"

unset PGPASSWORD
echo -e "${GREEN}✨ Listo!${NC}"