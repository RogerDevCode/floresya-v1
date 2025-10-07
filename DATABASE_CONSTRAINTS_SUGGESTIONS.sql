-- =====================================================
-- SUGERENCIAS DE CONSTRAINTS ADICIONALES PARA FLORESYA
-- =====================================================
-- Basado en análisis del esquema actual y mejores prácticas

-- =====================================================
-- TABLA: products
-- =====================================================

-- 1. Precio USD debe ser mayor a 0 (ya existe, pero mejorar)
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_usd_check;
ALTER TABLE products ADD CONSTRAINT products_price_usd_positive
   CHECK (price_usd > 0)
   NOT VALID; -- Agregar sin validar datos existentes

-- 2. Precio VES debe ser mayor a 0 cuando se proporcione
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_ves_check;
ALTER TABLE products ADD CONSTRAINT products_price_ves_positive
   CHECK (price_ves IS NULL OR price_ves > 0)
   NOT VALID;

-- 3. Stock no puede ser negativo (ya existe, pero asegurar)
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_check;
ALTER TABLE products ADD CONSTRAINT products_stock_non_negative
   CHECK (stock >= 0)
   NOT VALID;

-- 4. Carousel order debe estar en rango válido (0-7) o null
-- ALTER TABLE products DROP CONSTRAINT IF EXISTS products_carousel_order_check;
ALTER TABLE products ADD CONSTRAINT products_carousel_order_range
   CHECK (carousel_order IS NULL OR (carousel_order >= 0 AND carousel_order <= 7))
   NOT VALID;

-- 5. SKU debe tener formato específico (letras, números, guiones)
ALTER TABLE products ADD CONSTRAINT products_sku_format
   CHECK (sku IS NULL OR sku ~ '^[A-Z0-9-]+$' AND length(sku) <= 50)
   NOT VALID;

-- 6. Nombre del producto no puede estar vacío
ALTER TABLE products ADD CONSTRAINT products_name_not_empty
   CHECK (length(trim(name)) > 0)
   NOT VALID;

-- =====================================================
-- TABLA: orders
-- =====================================================

-- 1. Email del cliente debe ser válido
ALTER TABLE orders ADD CONSTRAINT orders_customer_email_format
   CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
   NOT VALID;

-- 2. Teléfono debe tener formato básico
ALTER TABLE orders ADD CONSTRAINT orders_customer_phone_format
   CHECK (customer_phone IS NULL OR customer_phone ~ '^[\+]?[0-9\s\-\(\)]+$')
   NOT VALID;

-- 3. Total USD debe ser mayor a 0
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_amount_usd_check;
ALTER TABLE orders ADD CONSTRAINT orders_total_amount_positive
   CHECK (total_amount_usd > 0)
   NOT VALID;

-- 4. Total VES debe ser mayor a 0 cuando se proporcione
ALTER TABLE orders ADD CONSTRAINT orders_total_ves_positive
   CHECK (total_amount_ves IS NULL OR total_amount_ves > 0)
   NOT VALID;

-- 5. Currency rate debe ser positivo cuando se proporcione
ALTER TABLE orders ADD CONSTRAINT orders_currency_rate_positive
   CHECK (currency_rate IS NULL OR currency_rate > 0)
   NOT VALID;

-- 6. Status debe ser válido
-- ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check; -- Ya existe por ENUM

-- 7. Delivery date no puede ser en el pasado
ALTER TABLE orders ADD CONSTRAINT orders_delivery_date_future
   CHECK (delivery_date IS NULL OR delivery_date >= CURRENT_DATE)
   NOT VALID;

-- =====================================================
-- TABLA: order_items
-- =====================================================

-- 1. Cantidad debe ser positiva
-- ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_quantity_check;
ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_positive
   CHECK (quantity > 0)
   NOT VALID;

-- 2. Precio unitario USD debe ser mayor a 0
-- ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_unit_price_usd_check;
ALTER TABLE order_items ADD CONSTRAINT order_items_unit_price_positive
   CHECK (unit_price_usd > 0)
   NOT VALID;

-- 3. Precio unitario VES debe ser mayor a 0 cuando se proporcione
ALTER TABLE order_items ADD CONSTRAINT order_items_unit_price_ves_positive
   CHECK (unit_price_ves IS NULL OR unit_price_ves > 0)
   NOT VALID;

-- 4. Subtotal debe ser consistente con precio * cantidad
ALTER TABLE order_items ADD CONSTRAINT order_items_subtotal_consistent_usd
   CHECK (abs(subtotal_usd - (unit_price_usd * quantity)) < 0.01)
   NOT VALID;

ALTER TABLE order_items ADD CONSTRAINT order_items_subtotal_consistent_ves
   CHECK (unit_price_ves IS NULL OR subtotal_ves IS NULL OR
          abs(subtotal_ves - (unit_price_ves * quantity)) < 0.01)
   NOT VALID;

-- =====================================================
-- TABLA: users
-- =====================================================

-- 1. Email debe ser único y válido (ya existe unique, agregar formato)
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key; -- Ya existe
ALTER TABLE users ADD CONSTRAINT users_email_format
   CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
   NOT VALID;

-- 2. Role debe ser válido (ya existe por ENUM)
-- 3. Email_verified debe ser boolean (ya existe por DEFAULT false)

-- 4. Full name no puede estar vacío cuando se proporcione
ALTER TABLE users ADD CONSTRAINT users_full_name_not_empty
   CHECK (full_name IS NULL OR length(trim(full_name)) > 0)
   NOT VALID;

-- 5. Phone format validation
ALTER TABLE users ADD CONSTRAINT users_phone_format
   CHECK (phone IS NULL OR phone ~ '^[\+]?[0-9\s\-\(\)]+$')
   NOT VALID;

-- =====================================================
-- TABLA: payments
-- =====================================================

-- 1. Monto USD debe ser mayor a 0
-- ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_amount_usd_check;
ALTER TABLE payments ADD CONSTRAINT payments_amount_positive
   CHECK (amount_usd > 0)
   NOT VALID;

-- 2. Monto VES debe ser mayor a 0 cuando se proporcione
ALTER TABLE payments ADD CONSTRAINT payments_amount_ves_positive
   CHECK (amount_ves IS NULL OR amount_ves > 0)
   NOT VALID;

-- 3. Currency rate debe ser positivo cuando se proporcione
ALTER TABLE payments ADD CONSTRAINT payments_currency_rate_positive
   CHECK (currency_rate IS NULL OR currency_rate > 0)
   NOT VALID;

-- 4. Payment method name no puede estar vacío
ALTER TABLE payments ADD CONSTRAINT payments_method_name_not_empty
   CHECK (length(trim(payment_method_name)) > 0)
   NOT VALID;

-- 5. Transaction ID format (si se proporciona)
ALTER TABLE payments ADD CONSTRAINT payments_transaction_id_format
   CHECK (transaction_id IS NULL OR length(transaction_id) >= 3)
   NOT VALID;

-- =====================================================
-- TABLA: product_images
-- =====================================================

-- 1. URL debe ser válida (debe comenzar con http)
ALTER TABLE product_images ADD CONSTRAINT product_images_url_format
   CHECK (url ~ '^https?://')
   NOT VALID;

-- 2. File hash debe tener formato hexadecimal
ALTER TABLE product_images ADD CONSTRAINT product_images_file_hash_format
   CHECK (file_hash ~ '^[a-f0-9]+$')
   NOT VALID;

-- 3. Mime type debe ser imagen válida
ALTER TABLE product_images ADD CONSTRAINT product_images_mime_type_valid
   CHECK (mime_type ~ '^image/(jpeg|jpg|png|webp|gif|svg\+xml)$')
   NOT VALID;

-- 4. Image index debe estar en rango válido (1-5)
-- ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_image_index_check;
ALTER TABLE product_images ADD CONSTRAINT product_images_image_index_range
   CHECK (image_index >= 1 AND image_index <= 5)
   NOT VALID;

-- =====================================================
-- TABLA: occasions
-- =====================================================

-- 1. Slug debe tener formato URL-friendly
ALTER TABLE occasions ADD CONSTRAINT occasions_slug_format
   CHECK (slug ~ '^[a-z0-9-]+$')
   NOT VALID;

-- 2. Display order debe ser no negativo
ALTER TABLE occasions ADD CONSTRAINT occasions_display_order_non_negative
   CHECK (display_order >= 0)
   NOT VALID;

-- 3. Name no puede estar vacío
ALTER TABLE occasions ADD CONSTRAINT occasions_name_not_empty
   CHECK (length(trim(name)) > 0)
   NOT VALID;

-- =====================================================
-- TABLA: settings
-- =====================================================

-- 1. Key debe tener formato snake_case
ALTER TABLE settings ADD CONSTRAINT settings_key_format
   CHECK (key ~ '^[a-z0-9_]+$')
   NOT VALID;

-- 2. Key no puede estar vacío
ALTER TABLE settings ADD CONSTRAINT settings_key_not_empty
   CHECK (length(trim(key)) > 0)
   NOT VALID;

-- 3. Type debe ser válido
ALTER TABLE settings ADD CONSTRAINT settings_type_valid
   CHECK (type IN ('string', 'number', 'boolean', 'json', 'array'))
   NOT VALID;

-- =====================================================
-- TABLA: payment_methods
-- =====================================================

-- 1. Name no puede estar vacío
ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_name_not_empty
   CHECK (length(trim(name)) > 0)
   NOT VALID;

-- 2. Display order debe ser no negativo
ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_display_order_non_negative
   CHECK (display_order >= 0)
   NOT VALID;

-- =====================================================
-- CONSTRAINTS ADICIONALES AVANZADOS
-- =====================================================

-- 1. Business Logic: Un producto no puede tener stock negativo después de una venta
ALTER TABLE products ADD CONSTRAINT products_stock_after_sale_trigger
   CHECK (stock >= 0) DEFERRABLE INITIALLY DEFERRED;

-- 2. Business Logic: Orders deben tener al menos un item
-- (Esto se maneja mejor en application logic que en constraint)

-- 3. Data Integrity: Email normalization consistency
ALTER TABLE users ADD CONSTRAINT users_email_normalized_consistent
   CHECK (lower(email) = email_normalized)
   NOT VALID;

ALTER TABLE orders ADD CONSTRAINT orders_customer_email_normalized_consistent
   CHECK (lower(customer_email) = customer_email_normalized)
   NOT VALID;

-- 4. Performance: Partial index para productos activos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_only
   ON products (id, name, price_usd)
   WHERE active = true;

-- 5. Performance: Partial index para productos featured
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_featured_only
   ON products (id, name, price_usd, carousel_order)
   WHERE active = true AND featured = true;

-- =====================================================
-- FUNCIONES DE VALIDACIÓN AVANZADA
-- =====================================================

-- 1. Función para validar email format
CREATE OR REPLACE FUNCTION validate_email_format(email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
   RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Función para validar phone format
CREATE OR REPLACE FUNCTION validate_phone_format(phone TEXT)
RETURNS BOOLEAN AS $$
BEGIN
   RETURN phone IS NULL OR phone ~ '^[\+]?[0-9\s\-\(\)]+$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Función para validar URL format
CREATE OR REPLACE FUNCTION validate_url_format(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
   RETURN url ~ '^https?://';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- TRIGGERS PARA MANTENER CONSISTENCIA
-- =====================================================

-- 1. Trigger para actualizar updated_at automáticamente
-- (Ya existe update_updated_at_column())

-- 2. Trigger para validar datos antes de INSERT/UPDATE
CREATE OR REPLACE FUNCTION validate_row_data()
RETURNS TRIGGER AS $$
BEGIN
   -- Validar email si se proporciona
   IF NEW.customer_email IS NOT NULL AND NOT validate_email_format(NEW.customer_email) THEN
       RAISE EXCEPTION 'Invalid email format: %', NEW.customer_email;
   END IF;

   -- Validar phone si se proporciona
   IF NEW.customer_phone IS NOT NULL AND NOT validate_phone_format(NEW.customer_phone) THEN
       RAISE EXCEPTION 'Invalid phone format: %', NEW.customer_phone;
   END IF;

   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
-- DROP TRIGGER IF EXISTS validate_orders_data ON orders;
-- CREATE TRIGGER validate_orders_data
--     BEFORE INSERT OR UPDATE ON orders
--     FOR EACH ROW EXECUTE FUNCTION validate_row_data();

-- =====================================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- =====================================================

-- 1. Índice compuesto para búsquedas de productos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search
   ON products (name_normalized, description_normalized)
   WHERE active = true;

-- 2. Índice para búsquedas de órdenes por fecha y status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_date_status
   ON orders (created_at DESC, status)
   WHERE status IN ('pending', 'verified', 'preparing');

-- 3. Índice para productos con stock disponible
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_in_stock
   ON products (id, name, price_usd, stock)
   WHERE active = true AND stock > 0;

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON CONSTRAINT products_price_usd_positive ON products IS 'Precio en USD debe ser mayor a 0';
COMMENT ON CONSTRAINT products_carousel_order_range ON products IS 'Orden en carousel debe estar entre 0-7 o ser null';
COMMENT ON CONSTRAINT orders_customer_email_format ON orders IS 'Email del cliente debe tener formato válido';
COMMENT ON CONSTRAINT order_items_subtotal_consistent_usd ON order_items IS 'Subtotal debe ser consistente con precio * cantidad';

-- =====================================================
-- VALIDACIÓN DE CONSTRAINTS EXISTENTES
-- =====================================================

-- Verificar constraints actuales
SELECT
   tc.table_name,
   tc.constraint_name,
   tc.constraint_type,
   cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc
   ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
   AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name, tc.constraint_name;

-- =====================================================
-- EJECUCIÓN SEGURA (RECOMENDADO)
-- =====================================================

-- 1. Primero crear constraints como NOT VALID
-- 2. Validar datos existentes
-- 3. Hacer VALID los constraints
-- 4. Probar en ambiente de staging antes de producción

-- Ejemplo de validación:
-- SELECT COUNT(*) FROM products WHERE price_usd <= 0; -- Debería ser 0
-- SELECT COUNT(*) FROM orders WHERE total_amount_usd <= 0; -- Debería ser 0

-- =====================================================
-- MANTENIMIENTO Y MONITOREO
-- =====================================================

-- Query para monitorear constraint violations
CREATE OR REPLACE VIEW constraint_violations AS
SELECT
   'products' as table_name,
   COUNT(*) as violations,
   'price_usd <= 0' as issue
FROM products
WHERE price_usd <= 0
UNION ALL
SELECT
   'orders' as table_name,
   COUNT(*) as violations,
   'total_amount_usd <= 0' as issue
FROM orders
WHERE total_amount_usd <= 0
UNION ALL
SELECT
   'order_items' as table_name,
   COUNT(*) as violations,
   'quantity <= 0' as issue
FROM order_items
WHERE quantity <= 0;

-- Query para ver constraint_violations:
-- SELECT * FROM constraint_violations WHERE violations > 0;