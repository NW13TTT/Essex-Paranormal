-- 1. Create Gift Bookings Table
-- Gift bookings have different requirements: recipient details and personal messages.
CREATE TABLE IF NOT EXISTS public.gift_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gift_reference TEXT UNIQUE NOT NULL,
    
    -- Purchaser Details
    purchaser_name TEXT NOT NULL,
    purchaser_email TEXT NOT NULL,
    purchaser_phone TEXT NOT NULL,
    
    -- Recipient Details
    recipient_name TEXT NOT NULL,
    recipient_email TEXT,
    gift_message TEXT,
    
    -- Booking Details
    event_id TEXT NOT NULL,
    tickets_qty INTEGER NOT NULL CHECK (tickets_qty > 0),
    payment_type TEXT NOT NULL CHECK (payment_type IN ('deposit', 'full')),
    total_paid DECIMAL(10, 2) NOT NULL,
    balance_due DECIMAL(10, 2) NOT NULL,
    
    payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed, refunded
    booking_status TEXT NOT NULL DEFAULT 'reserved', -- reserved, confirmed, cancelled
    
    sumup_checkout_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    payment_confirmation_date TIMESTAMPTZ
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_gift_ref ON public.gift_bookings(gift_reference);
CREATE INDEX IF NOT EXISTS idx_gift_event ON public.gift_bookings(event_id);

-- RLS
ALTER TABLE public.gift_bookings ENABLE ROW LEVEL SECURITY;
-- Only service role can modify; limited lookup via a function (similar to bookings)
