-- FloresYa Database Schema (extracted from OpenAPI 3.1 introspection)
-- Generated: 2025-10-03
-- Supabase PostgreSQL v13.0.4

-- ====================================================================
-- TABLES
-- ====================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    summary TEXT,
    description TEXT,
    price_usd NUMERIC(10, 2) NOT NULL CHECK (price_usd >= 0),
    price_ves NUMERIC(12, 2),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    sku TEXT UNIQUE,
    active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    carousel_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Images table
CREATE TABLE IF NOT EXISTS product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_index INTEGER NOT NULL DEFAULT 0,
    size TEXT CHECK (size IN ('thumb', 'small', 'medium', 'large')) NOT NULL,
    url TEXT NOT NULL,
    file_hash TEXT,
    mime_type TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (product_id, image_index, size)
);

-- Occasions table
CREATE TABLE IF NOT EXISTS occasions (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product-Occasions junction table
CREATE TABLE IF NOT EXISTS product_occasions (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    occasion_id BIGINT NOT NULL REFERENCES occasions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (product_id, occasion_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_city TEXT,
    delivery_state TEXT,
    delivery_zip TEXT,
    delivery_date DATE,
    delivery_time_slot TEXT,
    delivery_notes TEXT,
    status TEXT CHECK (status IN ('pending', 'verified', 'preparing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
    total_amount_usd NUMERIC(10, 2) NOT NULL CHECK (total_amount_usd >= 0),
    total_amount_ves NUMERIC(12, 2),
    currency_rate NUMERIC(10, 2),
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_summary TEXT,
    unit_price_usd NUMERIC(10, 2) NOT NULL CHECK (unit_price_usd >= 0),
    unit_price_ves NUMERIC(12, 2),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal_usd NUMERIC(10, 2) NOT NULL CHECK (subtotal_usd >= 0),
    subtotal_ves NUMERIC(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Status History table
CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    notes TEXT,
    changed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods table
CREATE TABLE IF NOT EXISTS payment_methods (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('bank_transfer', 'mobile_payment', 'cash', 'crypto', 'international')) NOT NULL,
    description TEXT,
    account_info JSONB,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method_id BIGINT REFERENCES payment_methods(id) ON DELETE SET NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    amount_usd NUMERIC(10, 2) NOT NULL CHECK (amount_usd >= 0),
    amount_ves NUMERIC(12, 2),
    currency_rate NUMERIC(10, 2),
    status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'partially_refunded')) DEFAULT 'pending',
    payment_method_name TEXT,
    transaction_id TEXT,
    reference_number TEXT,
    payment_details JSONB,
    receipt_image_url TEXT,
    admin_notes TEXT,
    payment_date TIMESTAMPTZ,
    confirmed_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id BIGSERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    type TEXT DEFAULT 'string',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES (for query optimization)
-- ====================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_carousel_order ON products(carousel_order) WHERE carousel_order IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON products(active, featured) WHERE active = true;

-- Product Images indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(product_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_product_images_size ON product_images(product_id, size);

-- Occasions indexes
CREATE INDEX IF NOT EXISTS idx_occasions_slug ON occasions(slug);
CREATE INDEX IF NOT EXISTS idx_occasions_is_active ON occasions(is_active);
CREATE INDEX IF NOT EXISTS idx_occasions_display_order ON occasions(display_order);

-- Product Occasions indexes
CREATE INDEX IF NOT EXISTS idx_product_occasions_product_id ON product_occasions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_occasions_occasion_id ON product_occasions(occasion_id);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);

-- Order Items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Order Status History indexes
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(order_id, created_at DESC);

-- Payment Methods indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_active ON payment_methods(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_type ON payment_methods(type);
CREATE INDEX IF NOT EXISTS idx_payment_methods_display_order ON payment_methods(display_order);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method_id ON payments(payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- Settings indexes
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_is_public ON settings(is_public);

-- ====================================================================
-- TRIGGERS (for updated_at auto-update)
-- ====================================================================

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_product_images BEFORE UPDATE ON product_images FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_occasions BEFORE UPDATE ON occasions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_product_occasions BEFORE UPDATE ON product_occasions FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_orders BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_order_items BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_payment_methods BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_payments BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
CREATE TRIGGER set_timestamp_settings BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- ====================================================================
-- STORED FUNCTIONS (from DB_FUNCTIONS in supabaseClient.js)
-- ====================================================================

-- Note: These functions are placeholders. Actual implementations 
-- should be created in Supabase SQL Editor with proper logic.

-- Function: get_products_with_occasions
-- Returns products with their associated occasions
COMMENT ON FUNCTION get_products_with_occasions IS 'Returns all products with their occasions (requires stored function implementation)';

-- Function: get_products_by_occasion
-- Returns products filtered by occasion_id
COMMENT ON FUNCTION get_products_by_occasion IS 'Returns products for a specific occasion (requires stored function implementation)';

-- Function: update_order_status_with_history
-- Updates order status and logs change in history
COMMENT ON FUNCTION update_order_status_with_history IS 'Atomically updates order status and creates history record (requires stored function implementation)';

-- Function: create_order_with_items
-- Creates order with items atomically
COMMENT ON FUNCTION create_order_with_items IS 'Creates order and order_items in single transaction (requires stored function implementation)';

-- ====================================================================
-- NOTES
-- ====================================================================
-- 1. All tables use soft-delete pattern where applicable (is_active, active)
-- 2. Indexes optimized for:
--    - GET /api/products (active, featured, carousel_order)
--    - GET /api/orders (status, created_at, user_id)
--    - GET /api/products/:id/images (product_id, is_primary)
--    - GET /api/orders/:id/status-history (order_id, created_at)
-- 3. Foreign keys use ON DELETE CASCADE for dependent data
-- 4. CHECK constraints enforce data integrity at DB level
-- 5. UNIQUE constraints prevent duplicate records
