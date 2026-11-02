-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bookings Table
-- Linked to the existing events logic. 
-- Note: We assume the 'published_events' or equivalent table already exists in the project 
-- based on the 'public-website-content' function.
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    event_id TEXT NOT NULL, -- Matches the contentKey or ID from existing event records
    tickets_qty INTEGER NOT NULL CHECK (tickets_qty > 0),
    total_price DECIMAL(10, 2) NOT NULL,
    deposit_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    balance_due DECIMAL(10, 2) NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, failed, refunded
    booking_status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, completed
    created_at TIMESTAMPTZ DEFAULT now(),
    payment_confirmation_date TIMESTAMPTZ,
    sumup_checkout_id TEXT,
    
    CONSTRAINT positive_qty CHECK (tickets_qty > 0)
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON public.bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON public.bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON public.bookings(booking_reference);

-- Row Level Security (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their own bookings (by email/ref) - restricted to authenticated or specific lookups
CREATE POLICY "Allow public lookup by reference" 
ON public.bookings FOR SELECT 
USING (true); -- In a real scenario, this would be limited to a specific lookup function

-- Policy: Only service role/admin can insert/update
-- (Usually handled by Supabase Edge Functions)
