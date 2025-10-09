/**
 * UPDATE create_order_with_items() FUNCTION TO DECREMENT STOCK
 *
 * This script updates the create_order_with_items() stored function to:
 * 1. Create the order and order items (existing behavior)
 * 2. DECREMENT product stock for each order item (NEW)
 * 3. Return the complete order with items
 *
 * IMPORTANT: Run this script in Supabase SQL Editor
 */

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.create_order_with_items(jsonb, jsonb[]);

-- Create the updated function with stock decrement logic
CREATE OR REPLACE FUNCTION public.create_order_with_items(
    order_data jsonb,
    order_items jsonb[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_order_id INTEGER;
    item_record JSONB;
    result_order JSONB;
    product_id_var INTEGER;
    quantity_var INTEGER;
BEGIN
    -- Start transaction (implicit in function)

    -- Insert order
    INSERT INTO public.orders (
        user_id,
        customer_email,
        customer_name,
        customer_phone,
        delivery_address,
        delivery_city,
        delivery_state,
        delivery_zip,
        delivery_date,
        delivery_time_slot,
        delivery_notes,
        status,
        total_amount_usd,
        total_amount_ves,
        currency_rate,
        notes,
        admin_notes
    ) VALUES (
        (order_data->>'user_id')::INTEGER,
        order_data->>'customer_email',
        order_data->>'customer_name',
        order_data->>'customer_phone',
        order_data->>'delivery_address',
        order_data->>'delivery_city',
        order_data->>'delivery_state',
        order_data->>'delivery_zip',
        (order_data->>'delivery_date')::DATE,
        order_data->>'delivery_time_slot',
        order_data->>'delivery_notes',
        (order_data->>'status')::order_status,
        (order_data->>'total_amount_usd')::NUMERIC,
        (order_data->>'total_amount_ves')::NUMERIC,
        (order_data->>'currency_rate')::NUMERIC,
        order_data->>'notes',
        order_data->>'admin_notes'
    ) RETURNING id INTO new_order_id;

    -- Insert order items AND decrement stock
    FOREACH item_record IN ARRAY order_items LOOP
        -- Extract product_id and quantity for stock update
        product_id_var := (item_record->>'product_id')::INTEGER;
        quantity_var := (item_record->>'quantity')::INTEGER;

        -- Insert order item
        INSERT INTO public.order_items (
            order_id,
            product_id,
            product_name,
            product_summary,
            unit_price_usd,
            unit_price_ves,
            quantity,
            subtotal_usd,
            subtotal_ves
        ) VALUES (
            new_order_id,
            product_id_var,
            item_record->>'product_name',
            item_record->>'product_summary',
            (item_record->>'unit_price_usd')::NUMERIC,
            (item_record->>'unit_price_ves')::NUMERIC,
            quantity_var,
            (item_record->>'subtotal_usd')::NUMERIC,
            (item_record->>'subtotal_ves')::NUMERIC
        );

        -- 🆕 DECREMENT PRODUCT STOCK
        -- This ensures stock is reduced when an order is placed
        UPDATE public.products
        SET
            stock = stock - quantity_var,
            updated_at = NOW()
        WHERE
            id = product_id_var
            AND active = true
            AND stock >= quantity_var;  -- Fail-safe: only update if sufficient stock

        -- Verify the stock was actually decremented (row was updated)
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Failed to decrement stock for product_id %: insufficient stock or product inactive', product_id_var;
        END IF;

    END LOOP;

    -- Insert initial status history
    INSERT INTO public.order_status_history (
        order_id,
        old_status,
        new_status,
        notes
    ) VALUES (
        new_order_id,
        NULL,
        (order_data->>'status')::order_status,
        'Order created and stock decremented'
    );

    -- Return complete order with items
    SELECT jsonb_build_object(
        'id', o.id,
        'user_id', o.user_id,
        'customer_email', o.customer_email,
        'customer_name', o.customer_name,
        'customer_phone', o.customer_phone,
        'delivery_address', o.delivery_address,
        'delivery_city', o.delivery_city,
        'delivery_state', o.delivery_state,
        'delivery_zip', o.delivery_zip,
        'delivery_date', o.delivery_date,
        'delivery_time_slot', o.delivery_time_slot,
        'delivery_notes', o.delivery_notes,
        'status', o.status,
        'total_amount_usd', o.total_amount_usd,
        'total_amount_ves', o.total_amount_ves,
        'currency_rate', o.currency_rate,
        'notes', o.notes,
        'admin_notes', o.admin_notes,
        'created_at', o.created_at,
        'updated_at', o.updated_at,
        'items', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', oi.id,
                    'order_id', oi.order_id,
                    'product_id', oi.product_id,
                    'product_name', oi.product_name,
                    'product_summary', oi.product_summary,
                    'unit_price_usd', oi.unit_price_usd,
                    'unit_price_ves', oi.unit_price_ves,
                    'quantity', oi.quantity,
                    'subtotal_usd', oi.subtotal_usd,
                    'subtotal_ves', oi.subtotal_ves,
                    'created_at', oi.created_at,
                    'updated_at', oi.updated_at
                )
            )
            FROM public.order_items oi
            WHERE oi.order_id = o.id
        )
    ) INTO result_order
    FROM public.orders o
    WHERE o.id = new_order_id;

    RETURN result_order;

EXCEPTION
    WHEN OTHERS THEN
        -- Transaction will be rolled back automatically (including stock decrements)
        RAISE EXCEPTION 'Failed to create order: %', SQLERRM;
END;
$$;

-- Grant necessary permissions
GRANT ALL ON FUNCTION public.create_order_with_items(jsonb, jsonb[]) TO anon;
GRANT ALL ON FUNCTION public.create_order_with_items(jsonb, jsonb[]) TO authenticated;
GRANT ALL ON FUNCTION public.create_order_with_items(jsonb, jsonb[]) TO service_role;
GRANT ALL ON FUNCTION public.create_order_with_items(jsonb, jsonb[]) TO prisma;

-- Verify the function was created successfully
SELECT 'create_order_with_items() function updated successfully with stock decrement logic!' AS status;
