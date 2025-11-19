-- ============================================================================
-- Construir vistas PASO A PASO
-- ============================================================================

-- PASO 1: Vista simple funcionó, ahora agregar GROUP BY
DROP VIEW IF EXISTS public.daily_expenses CASCADE;

CREATE VIEW public.daily_expenses AS
SELECT 
  expense_date,
  COUNT(*) as expenses_count,
  SUM(amount) as total_expenses
FROM public.expenses
WHERE active = true
GROUP BY expense_date
ORDER BY expense_date DESC;

-- Probar
SELECT * FROM public.daily_expenses LIMIT 5;

-- PASO 2: Vista de ventas
DROP VIEW IF EXISTS public.daily_sales CASCADE;

CREATE VIEW public.daily_sales AS
SELECT 
  DATE(created_at) as sale_date,
  COUNT(*) as orders_count,
  SUM(total_amount_usd) as total_sales,
  ROUND(AVG(total_amount_usd), 2) as avg_ticket
FROM public.orders
WHERE status IN ('verified', 'preparing', 'shipped', 'delivered')
  AND active = true
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- Probar
SELECT * FROM public.daily_sales LIMIT 5;

-- PASO 3: Vista P&L simple (sin jsonb_object_agg por ahora)
DROP VIEW IF EXISTS public.daily_profit_loss CASCADE;

CREATE VIEW public.daily_profit_loss AS
SELECT 
  COALESCE(s.sale_date, e.expense_date) as report_date,
  COALESCE(s.total_sales, 0) as sales,
  COALESCE(s.orders_count, 0) as orders_count,
  COALESCE(e.total_expenses, 0) as expenses,
  COALESCE(e.expenses_count, 0) as expenses_count,
  COALESCE(s.total_sales, 0) - COALESCE(e.total_expenses, 0) as net_profit,
  CASE 
    WHEN COALESCE(s.total_sales, 0) > 0 
    THEN ROUND((COALESCE(s.total_sales, 0) - COALESCE(e.total_expenses, 0)) / s.total_sales * 100, 2)
    ELSE 0
  END as profit_margin_pct
FROM public.daily_sales s
FULL OUTER JOIN public.daily_expenses e ON s.sale_date = e.expense_date
ORDER BY report_date DESC;

-- Probar
SELECT * FROM public.daily_profit_loss LIMIT 5;

-- Verificar las 3 vistas
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname IN ('daily_sales', 'daily_expenses', 'daily_profit_loss');

