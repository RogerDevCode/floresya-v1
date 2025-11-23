-- Check products table for price column
SELECT 
    id, 
    name, 
    price,
    rating,
    created_at
FROM products 
WHERE is_active = true 
ORDER BY id 
LIMIT 10;
