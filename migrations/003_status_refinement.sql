-- 1. Separate Payment and Booking Status
-- Update existing columns to reflect new independent states

-- Payment status: pending, paid, failed, refunded
-- Booking status: reserved, confirmed, cancelled

-- Since we are in development, we can redefine the columns if needed 
-- or just ensure the logic matches the table.
-- For this migration, we ensure the columns are named clearly.

ALTER TABLE public.bookings 
RENAME COLUMN payment_status TO payment_status; -- Keep name, refine values in logic

ALTER TABLE public.bookings 
RENAME COLUMN booking_status TO booking_status; -- Keep name, refine values in logic

-- We add a constraint to ensure only valid values are used
ALTER TABLE public.bookings 
ADD CONSTRAINT check_payment_status 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

ALTER TABLE public.bookings 
ADD CONSTRAINT check_booking_status 
CHECK (booking_status IN ('reserved', 'confirmed', 'cancelled'));

-- 2. Improve Public Booking Security
-- Remove the 'Allow public lookup by reference' policy that was too permissive
DROP POLICY IF EXISTS "Allow public lookup by reference" ON public.bookings;

-- Create a secure lookup function that returns a booking ONLY if both 
-- the reference AND email match. This prevents ID harvesting.
CREATE OR REPLACE FUNCTION get_booking_secure(ref TEXT, email TEXT)
RETURNS TABLE (
    booking_reference TEXT,
    customer_name TEXT,
    event_id TEXT,
    tickets_qty INTEGER,
    balance_due DECIMAL,
    payment_status TEXT,
    booking_status TEXT
) AS $$
BEGIN
    RETURN QUERY 
    SELECT b.booking_reference, b.customer_name, b.event_id, b.tickets_qty, b.balance_due, b.payment_status, b.booking_status
    FROM public.bookings b
    WHERE b.booking_reference = ref 
    AND b.customer_email = email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function to the public (or authenticated) role
GRANT EXECUTE ON FUNCTION get_booking_secure(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_booking_secure(TEXT, TEXT) TO authenticated;

-- New RLS Policy: No one can SELECT from bookings directly via API
-- All lookups must go through the get_booking_secure function.
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public lookup by reference" ON public.bookings;
-- No SELECT policy here means direct table access is denied, but SECURITY DEFINER function works.
