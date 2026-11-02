
-- Essex Paranormal
-- Migration 006: Expire abandoned pending bookings
--
-- Releases tickets from unpaid reservations after 20 minutes.
-- Only pending and reserved bookings are eligible.
-- Paid or confirmed bookings are never released.

CREATE OR REPLACE FUNCTION public.expire_pending_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    released_count INTEGER := 0;
BEGIN

    -- Expire standard bookings.
    WITH expired AS (
        UPDATE public.bookings
        SET
            payment_status = 'failed',
            booking_status = 'cancelled'
        WHERE
            payment_status = 'pending'
            AND booking_status = 'reserved'
            AND created_at < now() - INTERVAL '20 minutes'
        RETURNING event_id, tickets_qty
    ),
    totals AS (
        SELECT event_id, SUM(tickets_qty)::INTEGER AS qty
        FROM expired
        GROUP BY event_id
    )
    UPDATE public.published_content AS events
    SET remaining_tickets =
        COALESCE(events.remaining_tickets, 0) + totals.qty
    FROM totals
    WHERE events.content_key = totals.event_id;

    GET DIAGNOSTICS released_count = ROW_COUNT;

    -- Expire gift bookings.
    WITH expired AS (
        UPDATE public.gift_bookings
        SET
            payment_status = 'failed',
            booking_status = 'cancelled'
        WHERE
            payment_status = 'pending'
            AND booking_status = 'reserved'
            AND created_at < now() - INTERVAL '20 minutes'
        RETURNING event_id, tickets_qty
    ),
    totals AS (
        SELECT event_id, SUM(tickets_qty)::INTEGER AS qty
        FROM expired
        GROUP BY event_id
    )
    UPDATE public.published_content AS events
    SET remaining_tickets =
        COALESCE(events.remaining_tickets, 0) + totals.qty
    FROM totals
    WHERE events.content_key = totals.event_id;

    GET DIAGNOSTICS released_count = ROW_COUNT;

    RETURN released_count;
END;
$$;

-- Only the service role may run this maintenance function.
REVOKE ALL ON FUNCTION public.expire_pending_bookings() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.expire_pending_bookings() FROM anon;
REVOKE ALL ON FUNCTION public.expire_pending_bookings() FROM authenticated;

GRANT EXECUTE ON FUNCTION public.expire_pending_bookings()
TO service_role;

-- Prevent duplicate SumUp checkout IDs.
CREATE UNIQUE INDEX IF NOT EXISTS
    idx_bookings_sumup_checkout_id
ON public.bookings(sumup_checkout_id)
WHERE sumup_checkout_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS
    idx_gift_bookings_sumup_checkout_id
ON public.gift_bookings(sumup_checkout_id)
WHERE sumup_checkout_id IS NOT NULL;
