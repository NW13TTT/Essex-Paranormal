
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const SUMUP_API_KEY = Deno.env.get("SUMUP_API_KEY") ?? "";
const SUMUP_MERCHANT_CODE = "MBHEFYRS";

const TICKET_PRICE = 60;
const DEPOSIT_PRICE = 20;
const BALANCE_PER_DEPOSIT_TICKET = 40;
const MAX_TICKETS = 10;

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://essexparanormal.com",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function respond(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

function validEmail(value: unknown): value is string {
  return typeof value === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function clean(value: unknown, max = 500): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return respond({ success: false, error: "Method not allowed" }, 405);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUMUP_API_KEY) {
    console.error("Required server environment variables are missing.");
    return respond({
      success: false,
      error: "Booking service is temporarily unavailable.",
    }, 503);
  }

  let eventId = "";
  let quantity = 0;
  let reservationMade = false;
  let bookingId: string | null = null;
  let bookingTable: "bookings" | "gift_bookings" = "bookings";

  const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  try {
    const body = await req.json();

    const customerName = clean(body.customer_name, 150);
    const customerEmail = clean(body.customer_email, 254).toLowerCase();
    const customerPhone = clean(body.customer_phone, 40);

    eventId = clean(body.event_id, 200);
    quantity = Number(body.tickets_qty);

    const paymentType = body.payment_type;
    const isGift = body.is_gift === true;

    const recipientName = clean(body.recipient_name, 150);
    const recipientEmail = clean(body.recipient_email, 254).toLowerCase();
    const giftMessage = clean(body.gift_message, 1000);

    // Validate customer and booking details.
    if (
      !customerName ||
      !validEmail(customerEmail) ||
      !customerPhone ||
      !eventId
    ) {
      return respond({
        success: false,
        error: "Please provide your name, valid email, phone and event.",
      }, 400);
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > MAX_TICKETS
    ) {
      return respond({
        success: false,
        error: `You can book between 1 and ${MAX_TICKETS} tickets.`,
      }, 400);
    }

    if (paymentType !== "deposit" && paymentType !== "full") {
      return respond({
        success: false,
        error: "Please select deposit or full payment.",
      }, 400);
    }

    if (isGift && !recipientName) {
      return respond({
        success: false,
        error: "Please enter the gift recipient's name.",
      }, 400);
    }

    if (recipientEmail && !validEmail(recipientEmail)) {
      return respond({
        success: false,
        error: "The recipient email address is invalid.",
      }, 400);
    }

    // Calculate the amount in GBP.
    const amountPerTicket =
      paymentType === "full" ? TICKET_PRICE : DEPOSIT_PRICE;

    const amountToPay = Number(
      (quantity * amountPerTicket).toFixed(2),
    );

    const balanceDue = paymentType === "deposit"
      ? quantity * BALANCE_PER_DEPOSIT_TICKET
      : 0;

    // Unique reference for this booking and SumUp checkout.
    const bookingReference =
      `EP-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;

    // Reserve tickets atomically using the existing database RPC.
    const { data: reservationSuccess, error: reserveError } =
      await supabase.rpc("reserve_tickets", {
        target_event_id: eventId,
        qty: quantity,
      });

    if (reserveError) {
      console.error("Ticket reservation error:", reserveError);
      throw new Error("Unable to reserve tickets.");
    }

    if (reservationSuccess !== true) {
      return respond({
        success: false,
        error: "These tickets are no longer available.",
      }, 409);
    }

    reservationMade = true;

    // Create the pending booking before requesting payment.
    if (isGift) {
      bookingTable = "gift_bookings";

      const { data, error } = await supabase
        .from("gift_bookings")
        .insert({
          gift_reference: bookingReference,
          purchaser_name: customerName,
          purchaser_email: customerEmail,
          purchaser_phone: customerPhone,
          recipient_name: recipientName,
          recipient_email: recipientEmail || null,
          gift_message: giftMessage || null,
          event_id: eventId,
          tickets_qty: quantity,
          payment_type: paymentType,
          total_paid: amountToPay,
          balance_due: balanceDue,
          payment_status: "pending",
          booking_status: "reserved",
          sumup_checkout_id: null,
        })
        .select("id")
        .single();

      if (error) throw error;
      bookingId = data.id;
    } else {
      bookingTable = "bookings";

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          booking_reference: bookingReference,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          event_id: eventId,
          tickets_qty: quantity,
          total_price: quantity * TICKET_PRICE,
          deposit_amount: amountToPay,
          balance_due: balanceDue,
          payment_status: "pending",
          booking_status: "reserved",
          sumup_checkout_id: null,
        })
        .select("id")
        .single();

      if (error) throw error;
      bookingId = data.id;
    }

    // Create a genuine SumUp hosted checkout.
    const sumupResponse = await fetch(
      "https://api.sumup.com/v0.1/checkouts",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${SUMUP_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkout_reference: bookingReference,
          amount: amountToPay,
          currency: "GBP",
          merchant_code: SUMUP_MERCHANT_CODE,
          description: isGift
            ? `Essex Paranormal Gift Hunt - ${quantity} ticket(s)`
            : `Essex Paranormal Ghost Hunt - ${quantity} ticket(s)`,
          hosted_checkout: {
            enabled: true,
          },
        }),
      },
    );

    const checkout = await sumupResponse.json();

    if (!sumupResponse.ok) {
      console.error("SumUp checkout creation failed:", checkout);
      throw new Error("Unable to create payment checkout.");
    }

    const checkoutId = clean(checkout.id, 200);
    const checkoutUrl = clean(checkout.hosted_checkout_url, 1000);

    if (
      !checkoutId ||
      !checkoutUrl ||
      !checkoutUrl.startsWith("https://checkout.sumup.com/")
    ) {
      console.error("Invalid SumUp checkout response.");
      throw new Error("Payment provider returned an invalid checkout.");
    }

    // Save the genuine SumUp checkout ID against the booking.
    const { error: updateError } = await supabase
      .from(bookingTable)
      .update({
        sumup_checkout_id: checkoutId,
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Could not save SumUp checkout ID:", updateError);
      throw new Error("Unable to save payment details.");
    }

    // Payment is still pending. Only the verified webhook can confirm it.
    return respond({
      success: true,
      booking_reference: bookingReference,
      checkoutUrl,
      amount: amountToPay,
      currency: "GBP",
      payment_status: "pending",
    });
  } catch (error) {
    console.error("Create booking error:", error);

    // Remove incomplete booking and release its ticket reservation.
    if (bookingId) {
      const { error: deleteError } = await supabase
        .from(bookingTable)
        .delete()
        .eq("id", bookingId);

      if (deleteError) {
        console.error("Could not remove incomplete booking:", deleteError);
      }
    }

    if (reservationMade && eventId && quantity > 0) {
      const { error: releaseError } = await supabase.rpc(
        "release_tickets",
        {
          target_event_id: eventId,
          qty: quantity,
        },
      );

      if (releaseError) {
        console.error("Could not release reserved tickets:", releaseError);
      }
    }

    return respond({
      success: false,
      error: "We could not start your booking. Please try again.",
    }, 500);
  }
});
