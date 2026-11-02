-- Create a durable sync outbox to replace fire-and-forget calls
CREATE TABLE IF NOT EXISTS public.sync_outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    target_service TEXT NOT NULL, -- 'outlook', 'email'
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processed, failed
    retry_count INTEGER DEFAULT 0,
    last_attempt TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT valid_service CHECK (target_service IN ('outlook', 'email'))
);

CREATE INDEX IF NOT EXISTS idx_outbox_status ON public.sync_outbox(status);
CREATE INDEX IF NOT EXISTS idx_outbox_booking ON public.sync_outbox(booking_id);

-- Policy: Only service role can manage the outbox
ALTER TABLE public.sync_outbox ENABLE ROW LEVEL SECURITY;
