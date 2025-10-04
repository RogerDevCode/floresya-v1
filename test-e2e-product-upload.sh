#!/bin/bash
# E2E Test: Product Creation with Real Image Upload
# Tests: Sharp image processing + Supabase Storage + Database insertion

set -e  # Exit on error

API_URL="http://localhost:3000/api"
AUTH_TOKEN="Bearer admin:1:admin"
TEST_IMAGE="/tmp/test-orchid.jpg"
TIMESTAMP=$(date +%s)
UNIQUE_SKU="TEST-E2E-$TIMESTAMP"

echo "======================================"
echo "E2E Test: Product Upload Pipeline"
echo "======================================"
echo ""

# Step 1: Create product
echo "📦 Step 1: Creating product..."
PRODUCT_RESPONSE=$(curl -s -X POST "$API_URL/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: $AUTH_TOKEN" \
  -d '{
    "name": "TEST Orquídeas Rosadas E2E",
    "summary": "Producto de prueba E2E",
    "description": "Prueba de integración completa con Sharp + Supabase Storage",
    "price_usd": 99.99,
    "stock": 5,
    "sku": "'$UNIQUE_SKU'",
    "active": true,
    "featured": false
  }')

echo "$PRODUCT_RESPONSE" | python3 -m json.tool

PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")

if [ -z "$PRODUCT_ID" ]; then
  echo "❌ Failed to create product"
  exit 1
fi

echo "✅ Product created with ID: $PRODUCT_ID"
echo ""

# Step 2: Upload image (real file)
echo "📸 Step 2: Uploading image (Sharp will process 4 sizes)..."
IMAGE_RESPONSE=$(curl -s -X POST "$API_URL/products/$PRODUCT_ID/images" \
  -H "Authorization: $AUTH_TOKEN" \
  -F "image=@$TEST_IMAGE" \
  -F "image_index=1" \
  -F "is_primary=true")

echo "$IMAGE_RESPONSE" | python3 -m json.tool

IMAGE_COUNT=$(echo "$IMAGE_RESPONSE" | python3 -c "import sys, json; r=json.load(sys.stdin); print(len(r.get('data', [])))" 2>/dev/null || echo "0")

if [ "$IMAGE_COUNT" != "4" ]; then
  echo "❌ Expected 4 image sizes, got: $IMAGE_COUNT"
  exit 1
fi

echo "✅ Image uploaded and processed into 4 sizes (thumb, small, medium, large)"
echo ""

# Step 3: Verify product images
echo "🔍 Step 3: Verifying images in database..."
IMAGES_RESPONSE=$(curl -s "$API_URL/products/$PRODUCT_ID/images")

echo "$IMAGES_RESPONSE" | python3 -m json.tool

DB_IMAGE_COUNT=$(echo "$IMAGES_RESPONSE" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['data']))")

if [ "$DB_IMAGE_COUNT" != "4" ]; then
  echo "❌ Expected 4 images in DB, got: $DB_IMAGE_COUNT"
  exit 1
fi

echo "✅ All 4 image sizes found in database"
echo ""

# Step 4: Verify primary image
echo "🖼️  Step 4: Verifying primary image..."
PRIMARY_RESPONSE=$(curl -s "$API_URL/products/$PRODUCT_ID/images/primary")

echo "$PRIMARY_RESPONSE" | python3 -m json.tool

PRIMARY_URL=$(echo "$PRIMARY_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['url'])")

if [[ ! "$PRIMARY_URL" =~ ^https://.*\.supabase\.co/storage.* ]]; then
  echo "❌ Invalid Supabase Storage URL: $PRIMARY_URL"
  exit 1
fi

echo "✅ Primary image verified: $PRIMARY_URL"
echo ""

# Step 5: Verify Supabase Storage (check URL is accessible)
echo "☁️  Step 5: Verifying Supabase Storage accessibility..."
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$PRIMARY_URL")

if [ "$HTTP_STATUS" != "200" ]; then
  echo "❌ Supabase Storage URL returned HTTP $HTTP_STATUS"
  exit 1
fi

echo "✅ Image accessible from Supabase Storage (HTTP 200)"
echo ""

# Step 6: Get product details
echo "📄 Step 6: Fetching complete product details..."
PRODUCT_DETAILS=$(curl -s "$API_URL/products/$PRODUCT_ID")

echo "$PRODUCT_DETAILS" | python3 -m json.tool | head -30

echo ""
echo "======================================"
echo "✅ E2E TEST PASSED"
echo "======================================"
echo ""
echo "Summary:"
echo "  - Product created: #$PRODUCT_ID"
echo "  - Image processed: 4 sizes (Sharp)"
echo "  - Storage uploaded: Supabase ✓"
echo "  - Database records: 4 images"
echo "  - Primary image: Set ✓"
echo "  - URL accessible: HTTP 200 ✓"
echo ""
echo "🎉 Complete pipeline working!"
echo ""
echo "Cleanup: DELETE $API_URL/products/$PRODUCT_ID"
