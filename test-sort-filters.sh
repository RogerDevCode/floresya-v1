#!/bin/bash

echo "🧪 TESTING ALL SORT FILTERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BASE_URL="http://localhost:3000/api/products"

# Test 1: price_asc (Menor a Mayor)
echo ""
echo "1️⃣ Testing: price_asc (Menor → Mayor)"
response=$(curl -s "${BASE_URL}?sortBy=price_asc&limit=5")
echo "Response: $(echo $response | jq -c '.data[] | {id, name, price}' 2>/dev/null | head -5)"

# Test 2: price_desc (Mayor a Menor)
echo ""
echo "2️⃣ Testing: price_desc (Mayor → Menor)"
response=$(curl -s "${BASE_URL}?sortBy=price_desc&limit=5")
echo "Response: $(echo $response | jq -c '.data[] | {id, name, price}' 2>/dev/null | head -5)"

# Test 3: created_desc (Más recientes)
echo ""
echo "3️⃣ Testing: created_desc (Más recientes)"
response=$(curl -s "${BASE_URL}?sortBy=created_desc&limit=5")
echo "Response: $(echo $response | jq -c '.data[] | {id, name, created_at}' 2>/dev/null | head -5)"

# Test 4: rating_desc (Mejor valorados)
echo ""
echo "4️⃣ Testing: rating_desc (Mejor valorados)"
response=$(curl -s "${BASE_URL}?sortBy=rating_desc&limit=5")
echo "Response: $(echo $response | jq -c '.data[] | {id, name, rating}' 2>/dev/null | head -5)"

# Test 5: Sin sortBy (default)
echo ""
echo "5️⃣ Testing: Sin sortBy (default = created_desc)"
response=$(curl -s "${BASE_URL}?limit=5")
echo "Response: $(echo $response | jq -c '.data[] | {id, name, created_at}' 2>/dev/null | head -5)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
