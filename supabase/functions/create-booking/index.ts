import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const SUMUP_API_KEY = Deno.env.get('SUMUP_API_KEY') || ''
const SUMUP_MERCHANT_CODE = 'MBHEFYRS'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const body = await req.json()
    const { 
      customer_name, customer_email, customer_phone, 
      event_id, tickets_qty, payment_type,
      is_gift, recipient_name, recipient_email, gift_message 
    } = body
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Atomic Ticket Reservation
    const { data: reservationSuccess, error: reserveError } = await supabase.rpc('reserve_tickets', {
      target_event_id: event_id,
      qty: tickets_qty
    })

    if (reserveError || !reservationSuccess) {
      return new Response(JSON.stringify({ error: 'Tickets no longer available' }), { status: 400 })
    }

    // 2. Calculate Prices
    const perTicketPrice = payment_type === 'full' ? 60.00 : 20.00
    const total_amount = tickets_qty * perTicketPrice
    const balance_due = payment_type === 'deposit' ? tickets_qty * 40.00 : 0.00
    const booking_reference = `EP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // 3. Store Booking
    let bookingId
    if (is_gift) {
      const { data: gift, error: gError } = await supabase
        .from('gift_bookings')
        .insert({
          gift_reference: booking_reference,
          purchaser_name: customer_name,
          purchaser_email: customer_email,
          purchaser_phone: customer_phone,
          recipient_name: recipient_name,
          recipient_email: recipient_email,
          gift_message: gift_message,
          event_id,
          tickets_qty,
          payment_type,
          total_paid: total_amount,
          balance_due: balance_due,
          sumup_checkout_id: `temp_${Date.now()}` // Updated on payment
        })
        .select().single()
      if (gError) throw gError
      bookingId = gift.id
    } else {
      const { data: booking, error: bError } = await supabase
        .from('bookings')
        .insert({
          booking_reference,
          customer_name,
          customer_email,
          customer_phone,
          event_id,
          tickets_qty,
          total_price: tickets_qty * 60.00,
          deposit_amount: total_amount,
          balance_due: balance_due,
          payment_status: 'pending',
          booking_status: 'reserved',
          sumup_checkout_id: `temp_${Date.now()}`
        })
        .select().single()
      if (bError) throw bError
      bookingId = booking.id
    }

    // 4. SumUp Checkout Creation (Boundary)
    // Real API call to SumUp would go here.
    const checkoutUrl = `https://checkout.sumup.com/pay?id=${bookingId}&amount=${total_amount}`

    return new Response(JSON.stringify({ 
      success: true, 
      booking_reference, 
      checkoutUrl 
    }), { status: 200 })

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
})
