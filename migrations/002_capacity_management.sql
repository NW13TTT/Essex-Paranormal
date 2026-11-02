-- Add capacity tracking to the existing event records table if not present.
-- Assuming the table is 'published_content' based on 'public-website-content' logic.
-- If the architecture uses a different table for events, this needs adjustment.

ALTER TABLE public.published_content 
ADD COLUMN IF NOT EXISTS total_capacity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS remaining_tickets INTEGER DEFAULT 0;

-- Function to safely reserve tickets (Atomic Operation)
CREATE OR REPLACE FUNCTION reserve_tickets(target_event_id TEXT, qty INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_remaining INTEGER;
BEGIN
    -- Lock the row to prevent race conditions
    SELECT remaining_tickets INTO current_remaining 
    FROM public.published_content 
    WHERE content_key = target_event_id 
    FOR UPDATE;

    IF current_remaining >= qty THEN
        UPDATE public.published_content 
        SET remaining_tickets = remaining_tickets - qty 
        WHERE content_key = target_event_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to release tickets (on cancellation/failure)
CREATE OR REPLACE FUNCTION release_tickets(target_event_id TEXT, qty INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.published_content 
    SET remaining_tickets = remaining_tickets + qty 
    WHERE content_key = target_event_id;
END;
$$ LANGUAGE plpgsql;
