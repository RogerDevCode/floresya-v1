#!/bin/bash
# Git Push Script - Flujo simple para USUARIO UNICO
# Usage: ./gitp.sh "commit message"

# --- Configuración ---
# Define la rama a la que siempre quieres hacer push (ej: main, master)
TARGET_BRANCH="main" 
# Define el remoto (normalmente 'origin')
REMOTE_NAME="origin"

# --- Verificación de entrada ---
if [ -z "$1" ]; then
  echo "❌ Error: Se requiere mensaje de commit"
  echo "Uso: ./gitp.sh \"tu mensaje de commit\""
  exit 1
fi

COMMIT_MESSAGE="$1"

# Asegura que el mensaje siga el formato de commit convencional (opcional pero recomendado)
if [[ ! "$COMMIT_MESSAGE" =~ ^[a-z]+(\([a-z]+\))?: ]]; then
  COMMIT_MESSAGE="chore: $COMMIT_MESSAGE"
fi

# --- Proceso Git ---

# 1. Chequear estado para ver si hay cambios que añadir
echo "📊 Chequeando estado de Git..."
git add . 

# Chequea si 'git add .' realmente ha preparado algo para commit (staged changes)
if git diff --cached --quiet; then
    echo "✅ No hay cambios nuevos que commitear."
    exit 0
fi

echo "📝 Archivos a commitear:"
git status --short

# 2. Commitear los cambios
echo "💾 Commiteando con mensaje: $COMMIT_MESSAGE"
git commit -m "$COMMIT_MESSAGE" || { echo "❌ Error: git commit falló"; exit 1; }

# 3. PUSH directo
echo "🚀 Pushing a $REMOTE_NAME/$TARGET_BRANCH..."

# Intenta hacer push. Si falla (ej. si hay cambios remotos que no tienes localmente), avisa.
git push $REMOTE_NAME $TARGET_BRANCH || { 
    echo "❌ Error: git push falló."
    echo "Parece que hay cambios en GitHub que no tienes localmente."
    echo "Por favor, ejecuta 'git pull' manualmente para resolver la situación."
    exit 1; 
}

echo "✅ ¡Listo! Commit y push completado exitosamente."
