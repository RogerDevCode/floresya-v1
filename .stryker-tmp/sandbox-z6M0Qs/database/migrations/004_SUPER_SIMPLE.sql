-- ============================================================================
-- SUPER SIMPLE - Una vista a la vez
-- ============================================================================

-- 1. Desactivar RLS
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;

-- 2. Crear SOLO la vista de gastos (la más simple posible)
DROP VIEW IF EXISTS public.daily_expenses CASCADE;

CREATE VIEW public.daily_expenses AS
SELECT 
  expense_date,
  category,
  amount
FROM public.expenses
WHERE active = true;

-- 3. Verificar
SELECT * FROM public.daily_expenses LIMIT 5;

