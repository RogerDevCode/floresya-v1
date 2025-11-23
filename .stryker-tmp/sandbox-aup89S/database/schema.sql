-- FloresYa Database Schema
-- Supabase PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT DEFAULT 'Caracas',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL,
  occasion TEXT NOT NULL CHECK (occasion IN ('amor', 'cumpleanos', 'madre', 'aniversario', 'graduacion', 'condolencias')),
  category TEXT DEFAULT 'ramos',
  featured BOOLEAN DEFAULT FALSE,
  stock INTEGER DEFAULT 100 CHECK (stock >= 0),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'delivering', 'delivered', 'cancelled')),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  delivery_address TEXT NOT NULL,
  delivery_notes TEXT,
  phone TEXT NOT NULL,
  recipient_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL CHECK (product_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_occasion ON products(occasion);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read all, but only update their own
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Products: Everyone can read active products
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (active = TRUE);

-- Orders: Users can only see their own orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Order items: Users can see items from their orders
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Reviews: Everyone can read, users can create/update own
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Functions

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products
INSERT INTO products (name, description, price, image_url, occasion, featured) VALUES
('Ramo Tropical Vibrante', 'Explosión de colores tropicales con aves del paraíso, heliconias y flores exóticas', 45.99, '/products/vibrant-tropical-flower-bouquet-with-birds-of-para.jpg', 'amor', TRUE),
('Bouquet Arcoíris de Rosas', 'Rosas multicolores que forman un hermoso arcoíris de emociones', 52.99, '/products/rainbow-roses-bouquet-with-multicolored-roses-in-b.jpg', 'cumpleanos', TRUE),
('Girasoles Gigantes Alegres', 'Girasoles enormes que irradian alegría y energía positiva', 38.99, '/products/large-bright-sunflowers-bouquet-with-yellow-and-or.jpg', 'madre', FALSE),
('Orquídeas Fucsia Exóticas', 'Orquídeas fucsia exóticas en un arreglo sofisticado y elegante', 67.99, '/products/exotic-bright-pink-orchids-arrangement-in-elegant-.jpg', 'aniversario', TRUE),
('Mix Primaveral Colorido', 'Mezcla primaveral con tulipanes, narcisos y flores de temporada', 41.99, '/products/spring-flower-mix-with-tulips-daffodils-and-colorf.jpg', 'cumpleanos', FALSE),
('Rosas Coral Románticas', 'Rosas en tonos coral que expresan amor y ternura', 49.99, '/products/coral-pink-roses-bouquet-romantic-arrangement-with.jpg', 'amor', TRUE),
('Lirios Naranjas Vibrantes', 'Lirios naranjas que aportan energía y vitalidad a cualquier espacio', 44.99, '/products/bright-orange-lilies-arrangement-with-vibrant-oran.jpg', 'graduacion', FALSE),
('Peonías Rosa Suave', 'Peonías delicadas en tonos rosa suave para momentos románticos', 58.99, '/products/soft-pink-peonies-arrangement-delicate-romantic-fl.jpg', 'amor', TRUE),
('Claveles Multicolor Festivos', 'Claveles vibrantes en colores festivos perfectos para celebraciones', 35.99, '/products/multicolored-carnations-bouquet-with-bright-festiv.jpg', 'cumpleanos', FALSE),
('Bouquet Nupcial Elegante', 'Ramo nupcial con rosas blancas, peonías rosa y follaje elegante', 89.99, '/products/white-and-pink-bridal-bouquet-with-roses-peonies-a.jpg', 'aniversario', TRUE)
ON CONFLICT DO NOTHING;