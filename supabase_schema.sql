-- 🌸 FloresYa Database Schema
-- Generated: 2025-09-30T02:21:46.261Z
-- Extracted using programmatic queries

-- Table: products
CREATE TABLE public.products (
  id uuid,
  name varchar(255),
  summary varchar(255),
  description text,
  price_usd numeric,
  price_ves text,
  stock text,
  sku text,
  active boolean,
  featured boolean,
  carousel_order text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

-- Table: product_images
CREATE TABLE public.product_images (
  id uuid,
  product_id uuid,
  image_index integer,
  size varchar(255),
  url varchar(336),
  file_hash varchar(255),
  mime_type varchar(255),
  is_primary boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

-- Foreign key constraints for table product_images
-- ALTER TABLE product_images ADD CONSTRAINT product_images_product_id_fkey 
--   FOREIGN KEY (product_id) REFERENCES products(id);

-- Table: occasions
CREATE TABLE public.occasions (
  id uuid,
  name varchar(255),
  description varchar(255),
  is_active boolean,
  display_order integer,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  slug varchar(255)
);

-- Table: orders
CREATE TABLE public.orders (
);

-- Foreign key constraints for table orders
-- ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
--   FOREIGN KEY (user_id) REFERENCES users(id);

-- Table: order_items
CREATE TABLE public.order_items (
);

-- Foreign key constraints for table order_items
-- ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey 
--   FOREIGN KEY (order_id) REFERENCES orders(id);
-- ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey 
--   FOREIGN KEY (product_id) REFERENCES products(id);

-- Table: order_status_history
CREATE TABLE public.order_status_history (
);

-- Table: users
CREATE TABLE public.users (
  id uuid,
  email varchar(255),
  password_hash text,
  full_name varchar(255),
  phone varchar(255),
  role varchar(255),
  is_active boolean,
  email_verified boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

-- NOTES:
-- This schema was extracted programmatically from the live database
-- Column types are based on information_schema where possible
-- Some data was inferred from sample data when direct schema access wasn't available
-- NOTE: Indexes and foreign key constraints were inferred based on common patterns
-- and may not reflect the actual database implementation
-- To get actual indexes, constraints, and comprehensive schema directly from Supabase:
--   1. Use the Supabase Dashboard SQL Editor
--   2. Query the information_schema directly:
--      SELECT * FROM information_schema.table_constraints WHERE table_name = 'your_table';
--      SELECT * FROM information_schema.key_column_usage WHERE table_name = 'your_table';
--      SELECT * FROM pg_indexes WHERE tablename = 'your_table';
-- Generated on: 2025-09-30T02:21:49.357Z
