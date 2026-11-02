
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SUMUP_API_KEY = Deno.env.get("SUMUP_API_KEY") ?? "";
const MERCHANT_CODE = "MBHEFYRS";

const corsHeaders = {
  "Content-Type": "application/json",
};

function reply(status: number, message: string) {
  return new Response(message, {
    status,
    headers: corsHeaders,
  });
}

serve(async (req) => {
  if (req.method !== "POST") {
    return reply(405, "Method not allowed");
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !SUMUP_API_KEY) {
    console.error("Webhook environment configuration missing.");
    return reply(500, "Configuration error");
  }

  const supabase = createClient(
    SUPABASE_URL,
    SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  try {
    const payload = await req.json();

    // SumUp checkout notifications use event_type and id.
    const checkoutId =
      typeof payload.id === "string" ? payload.id : "";

    const eventType =
      typeof payload.event_type === "string"
        ? payload.event_type
        : "";

    if (!checkoutId || !eventType) {
      return reply(400, "Invalid notification");
    }

    // Ignore unknown event types safely.
    if (eventType !== "CHECKOUT_STATUS_CHANGED") {
      return reply(200, "Event ignored");
    }

    // Retrieve the checkout directly from SumUp.
    // Never trust the notification itself as proof of payment.
    const sumupResponse = await fetch(
      `https://api.sumup.com/v0.1/checkouts/${encodeURIComponent(checkoutId)}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${SUMUP_API_KEY}`,
          "Accept": "application/json",
        },
      },
    );

    if (!sumupResponse.ok) {
      console.error("SumUp verification failed:", sumupResponse.status);
      return reply(502, "Could not verify checkout");
    }

    const checkout = await sumupResponse.json();

    if (
      checkout.id !== checkoutId ||
      checkout.merchant_code !== MERCHANT_CODE ||
      checkout.currency !== "GBP"
    ) {
      console.error("Checkout identity or currency mismatch.");
      return reply(400, "Checkout verification failed");
    }

    // Find the booking by the actual SumUp checkout ID.
    let booking: Record<string, any> | null = null;
    let table: "bookings" | "gift_bookings" = "bookings";
    let isGift = false;

    const { data: standardBooking, error: standardError } =
      await supabase
        .from("bookings")
        .select(
          "id, booking_reference, event_id, tickets_qty, deposit_amount, payment_status, booking_status",
        )
        .eq("sumup_checkout_id", checkoutId)
        .maybeSingle();

    if (standardError) throw standardError;

    if (standardBooking) {
      booking = standardBooking;
    } else {
      const { data: giftBooking, error: giftError } =
        await supabase
          .from("gift_bookings")
          .select(
            "id, gift_reference, event_id, tickets_qty, total_paid, payment_status, booking_status",
          )
          .eq("sumup_checkout_id", checkoutId)
          .maybeSingle();

      if (giftError) throw giftError;

      if (giftBooking) {
        booking = giftBooking;
        table = "gift_bookings";
        isGift = true;
      }
    }

    if (!booking) {
      console.error("No booking found for checkout:", checkoutId);
      return reply(404, "Booking not found");
    }

    // Check that the merchant reference matches our booking.
    const expectedReference = isGift
      ? booking.gift_reference
      : booking.booking_reference;

    if (checkout.checkout_reference !== expectedReference) {
      console.error("Checkout reference mismatch.");
      return reply(400, "Reference mismatch");
    }

    if (
      !Number.isInteger(booking.tickets_qty) ||
      booking.tickets_qty < 1
    ) {
      return reply(400, "Invalid booking quantity");
    }

    const expectedAmount = Number(
      (isGift ? booking.total_paid : booking.deposit_amount).toFixed(2),
    );

    if (
      typeof checkout.amount !== "number" ||
      Math.abs(checkout.amount - expectedAmount) > 0.001
    ) {
      console.error("Payment amount mismatch.");
      return reply(400, "Payment amount mismatch");
    }

    // Check the authoritative transaction record as well as checkout status.
    const transactions = Array.isArray(checkout.transactions)
      ? checkout.transactions
      : [];

    const successfulTransaction = transactions.some(
      (transaction: Record<string, any>) =>
        transaction.status === "SUCCESSFUL" &&
        transaction.currency === "GBP" &&
        Math.abs(transaction.amount - expectedAmount) <= 0.001 &&
        transaction.merchant_code === MERCHANT_CODE,
    );

    // A paid checkout without a matching successful transaction is not confirmed.
    if (checkout.status === "PAID") {
      if (!successfulTransaction) {
        console.error("Paid checkout has no matching successful transaction.");
        return reply(409, "Payment requires manual verification");
      }

      // Conditional update makes repeated webhook deliveries safe.
      const { data: confirmedRows, error: confirmError } =
        await supabase
          .from(table)
          .update({
            payment_status: "paid",
            booking_status: "confirmed",
            payment_confirmation_date: new Date().toISOString(),
          })
          .eq("id", booking.id)
          .eq("payment_status", "pending")
          .select("id");

      if (confirmError) throw confirmError;

      // Already processed: acknowledge without duplicating side effects.
      if (!confirmedRows || confirmedRows.length === 0) {
        return reply(200, "Already processed");
      }

      // sync_outbox references public.bookings.
      // Gift bookings are deliberately not inserted into that table.
      if (!isGift) {
        const { error: outboxError } = await supabase
          .from("sync_outbox")
          .insert({
            booking_id: booking.id,
            target_service: "outlook",
            payload: {
              action: "create_event",
              is_gift: false,
            },
            status: "pending",
          });

        if (outboxError) {
          // Payment is confirmed. Log the sync issue for recovery.
          console.error("Outlook outbox insertion failed:", outboxError);
        }
      }

      return reply(200, "Payment confirmed");
    }

    // Failed or expired checkout: cancel and release tickets once.
    if (checkout.status === "FAILED" || checkout.status === "EXPIRED") {
      const { data: cancelledRows, error: cancelError } =
        await supabase
          .from(table)
          .update({
            payment_status: "failed",
            booking_status: "cancelled",
          })
          .eq("id", booking.id)
          .eq("payment_status", "pending")
          .eq("booking_status", "reserved")
          .select("id");

      if (cancelError) throw cancelError;

      if (cancelledRows && cancelledRows.length > 0) {
        const { error: releaseError } = await supabase.rpc(
          "release_tickets",
          {
            target_event_id: booking.event_id,
            qty: booking.tickets_qty,
          },
        );

        if (releaseError) {
          console.error("Ticket release failed:", releaseError);
          return reply(500, "Ticket release requires recovery");
        }
      }

      return reply(200, "Checkout closed");
    }

    // Pending checkout: wait for another notification.
    return reply(200, "Checkout still pending");
  } catch (error) {
    console.error("SumUp webhook error:", error);
    return reply(500, "Webhook processing failed");
  }
});
