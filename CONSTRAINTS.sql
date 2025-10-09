/*
 * CONSTRAINTS.SQL
 *
 * Comprehensive database constraints for the FloresYa e-commerce platform
 *
 * Tables covered:
 * - products: Product catalog with pricing and inventory
 * - product_images: Product image management with multi-size support
 * - users: User account management with role-based access
 * - orders: Order management with delivery tracking
 * - order_items: Order line items with product details
 *
 * Constraints designed with business rules in mind:
 * - Price validation (positive values)
 * - Stock validation (non-negative values)
 * - Quantity validation (positive values for order items)
 * - Data integrity and referential integrity
 * - Format validation (emails, phone numbers, URLs)
 * - Business logic enforcement (status values, image sizes)
 */

-- Start transaction to ensure all constraints are applied together
BEGIN;

-- ================================================
-- PRODUCTS TABLE CONSTRAINTS
-- ================================================

-- Ensure positive prices (USD is required, VES is optional)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_usd_positive;
ALTER TABLE products ADD CONSTRAINT products_price_usd_positive
    CHECK (price_usd > 0);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_ves_positive;
ALTER TABLE products ADD CONSTRAINT products_price_ves_positive
    CHECK (price_ves IS NULL OR price_ves > 0);

-- Ensure non-negative stock
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_non_negative;
ALTER TABLE products ADD CONSTRAINT products_stock_non_negative
    CHECK (stock >= 0);

-- Ensure carousel_order is in valid range (0 to 7 as per business logic)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_carousel_order_range;
ALTER TABLE products ADD CONSTRAINT products_carousel_order_range
    CHECK (carousel_order IS NULL OR (carousel_order >= 0 AND carousel_order <= 7));

-- Ensure name is not empty when provided
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_name_not_empty;
ALTER TABLE products ADD CONSTRAINT products_name_not_empty
    CHECK (name IS NOT NULL AND TRIM(name) != '');

-- Ensure name does not exceed 255 characters
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_name_length;
ALTER TABLE products ADD CONSTRAINT products_name_length
    CHECK (LENGTH(name) <= 255);

-- Ensure description is not empty when active (business rule)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_description_not_empty_when_active;
ALTER TABLE products ADD CONSTRAINT products_description_not_empty_when_active
    CHECK (NOT (active = true AND description IS NOT NULL AND TRIM(description) = ''));

-- Ensure SKU is not empty when present
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_not_empty;
ALTER TABLE products ADD CONSTRAINT products_sku_not_empty
    CHECK (sku IS NULL OR TRIM(sku) != '');

-- Ensure SKU does not exceed 50 characters
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_length;
ALTER TABLE products ADD CONSTRAINT products_sku_length
    CHECK (sku IS NULL OR LENGTH(sku) <= 50);

-- ================================================
-- PRODUCT_IMAGES TABLE CONSTRAINTS
-- ================================================

-- Ensure image_index is positive (validation: image_index > 0)
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_image_index_positive;
ALTER TABLE product_images ADD CONSTRAINT product_images_image_index_positive
    CHECK (image_index > 0);

-- Ensure URL is not empty
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_url_not_empty;
ALTER TABLE product_images ADD CONSTRAINT product_images_url_not_empty
    CHECK (url IS NOT NULL AND TRIM(url) != '');

-- Ensure file_hash is properly formatted (SHA-256 hash format: 64 hex characters)
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_file_hash_format;
ALTER TABLE product_images ADD CONSTRAINT product_images_file_hash_format
    CHECK (file_hash IS NOT NULL AND file_hash ~ '^[a-fA-F0-9]{64}$');

-- Ensure mime_type is one of the allowed image types
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_mime_type_valid;
ALTER TABLE product_images ADD CONSTRAINT product_images_mime_type_valid
    CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'));

-- Ensure size is one of the valid enum values (thumb, small, medium, large)
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_size_valid;
ALTER TABLE product_images ADD CONSTRAINT product_images_size_valid
    CHECK (size IN ('thumb', 'small', 'medium', 'large'));

-- ================================================
-- USERS TABLE CONSTRAINTS
-- ================================================

-- Ensure email is properly formatted (RFC 5322 simplified)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_format;
ALTER TABLE users ADD CONSTRAINT users_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure email is not empty
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_not_empty;
ALTER TABLE users ADD CONSTRAINT users_email_not_empty
    CHECK (email IS NOT NULL AND TRIM(email) != '');

-- Ensure phone number follows Venezuelan format or international format
-- Venezuelan: +58 XXX XXX XXXX
-- International: + followed by 1-15 digits
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_format;
ALTER TABLE users ADD CONSTRAINT users_phone_format
    CHECK (phone IS NULL OR phone ~ '^\+58\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{4}$' OR phone ~ '^\+[1-9][0-9]{1,14}$');

-- Ensure full_name is not empty when active (business rule)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_full_name_not_empty_when_active;
ALTER TABLE users ADD CONSTRAINT users_full_name_not_empty_when_active
    CHECK (NOT (is_active = true AND (full_name IS NULL OR TRIM(full_name) = '')));

-- Ensure role is one of the defined user roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_valid;
ALTER TABLE users ADD CONSTRAINT users_role_valid
    CHECK (role IN ('user', 'admin'));

-- ================================================
-- ORDERS TABLE CONSTRAINTS
-- ================================================

-- Ensure customer_email is properly formatted
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_email_format;
ALTER TABLE orders ADD CONSTRAINT orders_customer_email_format
    CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure customer_email is not empty
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_email_not_empty;
ALTER TABLE orders ADD CONSTRAINT orders_customer_email_not_empty
    CHECK (customer_email IS NOT NULL AND TRIM(customer_email) != '');

-- Ensure customer_name is not empty
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_name_not_empty;
ALTER TABLE orders ADD CONSTRAINT orders_customer_name_not_empty
    CHECK (customer_name IS NOT NULL AND TRIM(customer_name) != '');

-- Ensure delivery_address is not empty
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_address_not_empty;
ALTER TABLE orders ADD CONSTRAINT orders_delivery_address_not_empty
    CHECK (delivery_address IS NOT NULL AND TRIM(delivery_address) != '');

-- Ensure positive total amounts
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_amount_usd_positive;
ALTER TABLE orders ADD CONSTRAINT orders_total_amount_usd_positive
    CHECK (total_amount_usd > 0);

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_amount_ves_positive;
ALTER TABLE orders ADD CONSTRAINT orders_total_amount_ves_positive
    CHECK (total_amount_ves IS NULL OR total_amount_ves > 0);

-- Ensure currency_rate is positive when provided
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_currency_rate_positive;
ALTER TABLE orders ADD CONSTRAINT orders_currency_rate_positive
    CHECK (currency_rate IS NULL OR currency_rate > 0);

-- Ensure status is one of the valid enum values
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_valid;
ALTER TABLE orders ADD CONSTRAINT orders_status_valid
    CHECK (status IN ('pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled'));

-- ================================================
-- ORDER_ITEMS TABLE CONSTRAINTS
-- ================================================

-- Ensure product_name is not empty
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_name_not_empty;
ALTER TABLE order_items ADD CONSTRAINT order_items_product_name_not_empty
    CHECK (product_name IS NOT NULL AND TRIM(product_name) != '');

-- Ensure quantity is positive (validation: quantity > 0)
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_quantity_positive;
ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_positive
    CHECK (quantity > 0);

-- Ensure unit_price_usd is positive
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_unit_price_usd_positive;
ALTER TABLE order_items ADD CONSTRAINT order_items_unit_price_usd_positive
    CHECK (unit_price_usd > 0);

-- Ensure unit_price_ves is positive when provided
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_unit_price_ves_positive;
ALTER TABLE order_items ADD CONSTRAINT order_items_unit_price_ves_positive
    CHECK (unit_price_ves IS NULL OR unit_price_ves > 0);

-- Ensure subtotal_usd is positive and matches calculation
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_subtotal_usd_positive;
ALTER TABLE order_items ADD CONSTRAINT order_items_subtotal_usd_positive
    CHECK (subtotal_usd > 0);

-- Ensure subtotal_ves is positive when provided
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_subtotal_ves_positive;
ALTER TABLE order_items ADD CONSTRAINT order_items_subtotal_ves_positive
    CHECK (subtotal_ves IS NULL OR subtotal_ves > 0);

-- Ensure subtotal_usd matches unit_price_usd * quantity
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_subtotal_usd_matches_calculation;
ALTER TABLE order_items ADD CONSTRAINT order_items_subtotal_usd_matches_calculation
    CHECK (ABS(subtotal_usd - (unit_price_usd * quantity)) < 0.01);

-- ================================================
-- INDEX CREATION FOR PERFORMANCE
-- ================================================

-- Products: Index on price for faster price queries
CREATE INDEX IF NOT EXISTS idx_products_price_usd ON products (price_usd) WHERE active = true;

-- Products: Index on stock for faster stock queries
CREATE INDEX IF NOT EXISTS idx_products_stock ON products (stock) WHERE active = true;

-- Products: Index on SKU for unique lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON products (sku) WHERE sku IS NOT NULL;

-- Products: Index on featured flag
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (featured) WHERE active = true AND featured = true;

-- Product Images: Ensure only one primary image per product per size
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_only_one_primary_per_size
    ON product_images (product_id, size)
    WHERE is_primary = true;

-- Product Images: Index on product_id for faster product image lookups
CREATE INDEX IF NOT EXISTS idx_product_images_product_id_active ON product_images (product_id) WHERE is_primary = true;

-- Product Images: Index on file_hash for deduplication checks
CREATE INDEX IF NOT EXISTS idx_product_images_file_hash ON product_images (file_hash);

-- Users: Index on email for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users (email) WHERE is_active = true;

-- Users: Index on role for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role) WHERE is_active = true;

-- Orders: Index on user_id for faster user order lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id) WHERE user_id IS NOT NULL;

-- Orders: Index on status for faster status-based queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- Orders: Index on created_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

-- Orders: Index on customer_email for guest order lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders (customer_email);

-- Order Items: Index on order_id for faster order item lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- Order Items: Index on product_id for product sales analytics
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items (product_id);

-- ================================================
-- FINAL VERIFICATION
-- ================================================

-- Verify all constraints are in place
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    -- Count all constraints we just added
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE constraint_name IN (
        -- Products (9 constraints)
        'products_price_usd_positive',
        'products_price_ves_positive',
        'products_stock_non_negative',
        'products_carousel_order_range',
        'products_name_not_empty',
        'products_name_length',
        'products_description_not_empty_when_active',
        'products_sku_not_empty',
        'products_sku_length',

        -- Product Images (5 constraints)
        'product_images_image_index_positive',
        'product_images_url_not_empty',
        'product_images_file_hash_format',
        'product_images_mime_type_valid',
        'product_images_size_valid',

        -- Users (5 constraints)
        'users_email_format',
        'users_email_not_empty',
        'users_phone_format',
        'users_full_name_not_empty_when_active',
        'users_role_valid',

        -- Orders (8 constraints)
        'orders_customer_email_format',
        'orders_customer_email_not_empty',
        'orders_customer_name_not_empty',
        'orders_delivery_address_not_empty',
        'orders_total_amount_usd_positive',
        'orders_total_amount_ves_positive',
        'orders_currency_rate_positive',
        'orders_status_valid',

        -- Order Items (7 constraints)
        'order_items_product_name_not_empty',
        'order_items_quantity_positive',
        'order_items_unit_price_usd_positive',
        'order_items_unit_price_ves_positive',
        'order_items_subtotal_usd_positive',
        'order_items_subtotal_ves_positive',
        'order_items_subtotal_usd_matches_calculation'
    );

    RAISE NOTICE 'Successfully applied % constraints', constraint_count;

    -- We created 34 constraints (9 + 5 + 5 + 8 + 7)
    IF constraint_count < 34 THEN
        RAISE WARNING 'Expected 34 constraints but found %. Some constraints may not have been applied.', constraint_count;
    END IF;
END $$;

-- Commit all changes
COMMIT;

-- ================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ================================================
/*
-- If any issues occur, you can rollback with:
BEGIN;

-- Remove all added constraints
-- Products
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_usd_positive;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_ves_positive;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_non_negative;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_carousel_order_range;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_name_not_empty;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_name_length;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_description_not_empty_when_active;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_not_empty;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_length;

-- Product Images
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_image_index_positive;
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_url_not_empty;
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_file_hash_format;
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_mime_type_valid;
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_size_valid;

-- Users
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_format;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_not_empty;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_format;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_full_name_not_empty_when_active;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_valid;

-- Orders
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_email_format;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_email_not_empty;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_name_not_empty;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_delivery_address_not_empty;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_amount_usd_positive;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_amount_ves_positive;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_currency_rate_positive;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_valid;

-- Order Items
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_name_not_empty;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_quantity_positive;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_unit_price_usd_positive;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_unit_price_ves_positive;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_subtotal_usd_positive;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_subtotal_ves_positive;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_subtotal_usd_matches_calculation;

-- Drop indexes
DROP INDEX IF EXISTS idx_products_price_usd;
DROP INDEX IF EXISTS idx_products_stock;
DROP INDEX IF EXISTS idx_products_sku;
DROP INDEX IF EXISTS idx_products_featured;
DROP INDEX IF EXISTS idx_product_images_only_one_primary_per_size;
DROP INDEX IF EXISTS idx_product_images_product_id_active;
DROP INDEX IF EXISTS idx_product_images_file_hash;
DROP INDEX IF EXISTS idx_users_email_active;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_orders_customer_email;
DROP INDEX IF EXISTS idx_order_items_order_id;
DROP INDEX IF EXISTS idx_order_items_product_id;

COMMIT;
*/
