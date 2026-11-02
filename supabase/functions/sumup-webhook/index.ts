import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const SUMUP_API_KEY = Deno.env.get('SUMUP_API_KEY') || ''

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const payload = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    if (!payload.event || !payload.checkout_id) {
      return new Response('Invalid Payload', { status: 400 })
    }

    const checkoutId = payload.checkout_id

    // 1. Find Booking (Standard or Gift)
    let booking = null
    let isGift = false

    const { data: stdBooking } = await supabase
      .from('bookings')
      .select('id, payment_status, sumup_checkout_id, deposit_amount')
      .eq('sumup_checkout_id', checkoutId)
      .single()

    if (stdBooking) {
      booking = stdBooking
    } else {
      const { data: giftBooking } = await supabase
        .from('gift_bookings')
        .select('id, payment_status, sumup_checkout_id, total_paid')
        .eq('sumup_checkout_id', checkoutId)
        .single()
      if (giftBooking) {
        booking = giftBooking
        isGift = true
      }
    }

    if (!booking) return new Response('Booking Not Found', { status: 404 })
    if (booking.payment_status === 'paid') return new Response('Already Processed', { status: 200 })

    // 2. VERIFICATION: Server-to-Server call to SumUp
    const sumupResponse = await fetch(`https://api.sumup.com/v0.1/checkouts/${checkoutId}`, {
      headers: { 'Authorization': `Bearer ${SUMUP_API_KEY}` }
    })

    if (!sumupResponse.ok) throw new Error(`SumUp API Error: ${sumupResponse.statusText}`)
    const checkoutData = await sumupResponse.json()
    
    const isPaid = checkoutData.status === 'PAID' 
    const isTransactionSuccessful = checkoutData.transaction?.status === 'SUCCESSFUL'
    const expectedAmount = isGift ? booking.total_paid : booking.deposit_amount
    const isCorrectAmount = checkoutData.amount === expectedAmount
    const isCorrectCurrency = checkoutData.currency === 'GBP'

    if (isPaid && isTransactionSuccessful && isCorrectAmount && isCorrectCurrency) {
      const table = isGift ? 'gift_bookings' : 'bookings'
      const { error: updateError } = await supabase
        .from(table)
        .update({ 
          payment_status: 'paid', 
          booking_status: 'confirmed',
          payment_confirmation_date: new Date().toISOString() 
        })
        .eq('id', booking.id)

      if (updateError) throw updateError

      // Durable Sync for Outlook
      await supabase.from('sync_outbox').insert({
        booking_id: booking.id,
        target_service: 'outlook',
        payload: { action: 'create_event', is_gift: isGift },
        status: 'pending'
      })
    } else if (payload.event === 'payment.failed' || checkoutData.status === 'FAILED') {
      const { data: bInfo } = await supabase
        .from(isGift ? 'gift_bookings' : 'bookings')
        .select('event_id, tickets_qty')
        .eq('id', booking.id)
        .single()

      if (bInfo) {
        await supabase.rpc('release_tickets', { target_event_id: bInfo.event_id, qty: bInfo.tickets_qty })
        await supabase.from(isGift ? 'gift_bookings' : 'bookings')
          .update({ payment_status: 'failed', booking_status: 'cancelled' })
          .eq('id', booking.id)
      }
    }

    return new Response('Webhook Processed', { status: 200 })

  } catch (e) {
    console.error('Webhook Error:', e)
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
})
