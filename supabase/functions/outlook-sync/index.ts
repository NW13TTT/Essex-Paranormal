import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const MS_CLIENT_ID = Deno.env.get('MS_CLIENT_ID') || ''
const MS_CLIENT_SECRET = Deno.env.get('MS_CLIENT_SECRET') || ''
const MS_TENANT_ID = Deno.env.get('MS_TENANT_ID') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  try {
    const { booking_id } = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: booking, error: bError } = await supabase
      .from('bookings')
      .select('*, published_content(title, date, time)')
      .eq('id', booking_id)
      .single()

    if (bError || !booking) throw new Error('Booking not found')

    // 1. Get OAuth Access Token (Client Credentials or stored Refresh Token)
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${MS_TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: MS_CLIENT_ID,
        client_secret: MS_CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'Calendars.ReadWrite'
      })
    })
    
    const { access_token } = await tokenResponse.json()
    if (!access_token) throw new Error('MS Graph Token Acquisition Failed')

    // 2. Create Outlook Event
    const eventData = {
      subject: `Booking [${booking.booking_reference}] - ${booking.customer_name}`,
      body: {
        contentType: 'HTML',
        content: `Booking for ${booking.published_content.title}<br>Tickets: ${booking.tickets_qty}<br>Email: ${booking.customer_email}`
      },
      start: { dateTime: `${booking.published_content.date}T${booking.published_content.time || '20:00:00'}Z`, timeZone: 'UTC' },
      end: { dateTime: `${booking.published_content.date}T23:59:59Z`, timeZone: 'UTC' }
    }

    const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    })

    if (!graphResponse.ok) {
      console.error('Graph API Error:', await graphResponse.text())
      // We do NOT throw here as a way to fail the payment; we just log the failure for retry
      return new Response('Sync Attempted but Failed', { status: 202 })
    }

    return new Response('Synced to Outlook', { status: 200 })

  } catch (e) {
    console.error('Outlook Sync Error:', e)
    return new Response(JSON.stringify({ error: e.message }), { status: 500 })
  }
})
