-- Update products with random prices for testing
UPDATE products
SET 
    price_usd = (RANDOM() * 95 + 25)::numeric(10,2),
    price_ves = ((RANDOM() * 95 + 25) * 36)::numeric(10,2),
    rating = (RANDOM() * 1.5 + 3.5)::numeric(2,1)
WHERE is_active = true;

-- Verify the update
SELECT id, name, price_usd, rating
FROM products
WHERE is_active = true
ORDER BY price_usd ASC
LIMIT 10;
