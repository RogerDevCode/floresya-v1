#!/bin/bash
# Verify Cache Headers - Quick validation script
# Usage: ./scripts/verify-cache-headers.sh

echo "🔍 Verificando Cache Headers..."
echo ""

# Check if server is running
if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
  echo "❌ Servidor no está corriendo en localhost:3000"
  echo "   Ejecuta: npm run dev"
  exit 1
fi

echo "✅ Servidor activo en localhost:3000"
echo ""

# Function to test cache headers
test_cache() {
  local url="$1"
  local expected="$2"
  local name="$3"
  
  echo "🧪 Testing: $name"
  echo "   URL: $url"
  
  local cache_header=$(curl -sI "$url" 2>/dev/null | grep -i "^cache-control:" | cut -d' ' -f2- | tr -d '\r\n')
  
  if [ -z "$cache_header" ]; then
    echo "   ❌ NO Cache-Control header found"
    return 1
  fi
  
  echo "   ✅ Cache-Control: $cache_header"
  
  # Check if expected pattern exists in header
  if echo "$cache_header" | grep -iq "$expected"; then
    echo "   ✅ PASS: Contains '$expected'"
  else
    echo "   ⚠️  WARN: Expected to contain '$expected'"
  fi
  
  echo ""
}

# Test different resource types
test_cache "http://localhost:3000/css/tailwind.css" "max-age=31536000" "CSS (Static Asset)"
test_cache "http://localhost:3000/index.html" "max-age=86400" "HTML (Semi-dynamic)"
test_cache "http://localhost:3000/api/products" "no-cache" "API Endpoint"

# Check for Service Worker
echo "🔍 Verificando que NO hay Service Worker..."
if [ -f "public/sw.js" ]; then
  echo "   ❌ FAIL: Service Worker file still exists (public/sw.js)"
else
  echo "   ✅ PASS: Service Worker file removed"
fi

# Check index.html for unregister code
echo ""
echo "🔍 Verificando código de desregistro en index.html..."
if grep -q "navigator.serviceWorker.getRegistrations" public/index.html; then
  echo "   ✅ PASS: Auto-unregister code present"
else
  echo "   ⚠️  WARN: Auto-unregister code not found"
fi

echo ""
echo "🎯 Verificación completa"
echo ""
echo "Próximos pasos:"
echo "1. Abre http://localhost:3000 en tu navegador"
echo "2. Abre DevTools (F12) → Application → Service Workers"
echo "3. Debe estar VACÍO (sin service workers registrados)"
echo "4. Recarga con Ctrl+Shift+R para forzar cache refresh"
