/*
 * CONSTRAINTS.SQL
 * 
 * Comprehensive database constraints for the FloresYa e-commerce platform
 * 
 * Tables covered:
 * - products: Product catalog with pricing and inventory
 * - product_images: Product image management
 * - users: User account management
 * 
 * Constraints designed with business rules in mind:
 * - Price validation (positive values)
 * - Stock validation (non-negative values)
 * - Data integrity
 * - Format validation (emails, phone numbers)
 * - Referential integrity
 */

-- Start transaction to ensure all constraints are applied together
BEGIN;

-- ================================================
-- PRODUCTS TABLE CONSTRAINTS
-- ================================================

-- Ensure positive prices
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

-- Ensure carousel_order is in valid range (0 to 7 as per existing constraint)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_carousel_order_range;
ALTER TABLE products ADD CONSTRAINT products_carousel_order_range 
    CHECK (carousel_order IS NULL OR (carousel_order >= 0 AND carousel_order <= 7));

-- Ensure name is not empty when active
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_name_not_empty;
ALTER TABLE products ADD CONSTRAINT products_name_not_empty 
    CHECK (name IS NULL OR TRIM(name) != '');

-- Ensure description is not empty when active
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_description_not_empty_when_active;
ALTER TABLE products ADD CONSTRAINT products_description_not_empty_when_active 
    CHECK (NOT (active = true AND description IS NOT NULL AND TRIM(description) = ''));

-- Ensure SKU is not empty when present
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_not_empty;
ALTER TABLE products ADD CONSTRAINT products_sku_not_empty 
    CHECK (sku IS NULL OR TRIM(sku) != '');

-- ================================================
-- PRODUCT_IMAGES TABLE CONSTRAINTS
-- ================================================

-- Ensure image_index is positive
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_image_index_positive;
ALTER TABLE product_images ADD CONSTRAINT product_images_image_index_positive 
    CHECK (image_index > 0);

-- Ensure URL is not empty
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_url_not_empty;
ALTER TABLE product_images ADD CONSTRAINT product_images_url_not_empty 
    CHECK (url IS NULL OR TRIM(url) != '');

-- Ensure file_hash is properly formatted (SHA-256 hash format)
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_file_hash_format;
ALTER TABLE product_images ADD CONSTRAINT product_images_file_hash_format 
    CHECK (file_hash IS NULL OR file_hash ~ '^[a-fA-F0-9]{64}$');

-- Ensure mime_type is one of the allowed image types
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_mime_type_valid;
ALTER TABLE product_images ADD CONSTRAINT product_images_mime_type_valid 
    CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'));

-- ================================================
-- USERS TABLE CONSTRAINTS
-- ================================================

-- Ensure email is properly formatted
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_format;
ALTER TABLE users ADD CONSTRAINT users_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Ensure email is not empty when provided
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_not_empty;
ALTER TABLE users ADD CONSTRAINT users_email_not_empty 
    CHECK (email IS NULL OR TRIM(email) != '');

-- Ensure phone number follows Venezuelan format or international format
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_format;
ALTER TABLE users ADD CONSTRAINT users_phone_format 
    CHECK (phone IS NULL OR phone ~ '^\+58\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{4}$' OR phone ~ '^\+[1-9][0-9]{1,14}$');

-- Ensure full_name is not empty when active
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_full_name_not_empty_when_active;
ALTER TABLE users ADD CONSTRAINT users_full_name_not_empty_when_active 
    CHECK (NOT (is_active = true AND (full_name IS NULL OR TRIM(full_name) = '')));

-- Ensure role is one of the defined user roles
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_valid;
ALTER TABLE users ADD CONSTRAINT users_role_valid 
    CHECK (role IN ('user', 'admin'));

-- ================================================
-- INDEX CREATION FOR PERFORMANCE
-- ================================================

-- Index on products for faster price queries
CREATE INDEX IF NOT EXISTS idx_products_price_usd ON products (price_usd) WHERE active = true;

-- Index on products for faster stock queries
CREATE INDEX IF NOT EXISTS idx_products_stock ON products (stock) WHERE active = true;

-- Index to ensure each product can only have one primary image per size
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_only_one_primary_per_size 
    ON product_images (product_id, size) 
    WHERE is_primary = true;

-- Index on product_images for faster product lookups
CREATE INDEX IF NOT EXISTS idx_product_images_product_id_active ON product_images (product_id) WHERE is_primary = true;

-- Index on users for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users (email) WHERE is_active = true;

-- Index on users for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role) WHERE is_active = true;

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
        'products_price_usd_positive',
        'products_price_ves_positive', 
        'products_stock_non_negative',
        'products_carousel_order_range',
        'products_name_not_empty',
        'products_description_not_empty_when_active',
        'products_sku_not_empty',
        'product_images_image_index_positive',
        'product_images_url_not_empty',
        'product_images_file_hash_format',
        'product_images_mime_type_valid',
        'users_email_format',
        'users_email_not_empty',
        'users_phone_format',
        'users_full_name_not_empty_when_active',
        'users_role_valid'
    );
    
    RAISE NOTICE 'Successfully applied % constraints', constraint_count;
    
    -- We created 16 constraints
    IF constraint_count < 16 THEN
        RAISE EXCEPTION 'Some constraints were not applied successfully';
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
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_usd_positive;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_ves_positive;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_non_negative;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_carousel_order_range;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_name_not_empty;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_description_not_empty_when_active;
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_not_empty;
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_image_index_positive;
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_url_not_empty;
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_file_hash_format;
ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_mime_type_valid;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_format;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_not_empty;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_format;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_full_name_not_empty_when_active;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_valid;

-- Drop indexes
DROP INDEX IF EXISTS idx_products_price_usd;
DROP INDEX IF EXISTS idx_products_stock;
DROP INDEX IF EXISTS idx_product_images_only_one_primary_per_size;
DROP INDEX IF EXISTS idx_product_images_product_id_active;
DROP INDEX IF EXISTS idx_users_email_active;
DROP INDEX IF EXISTS idx_users_role;

COMMIT;
*/