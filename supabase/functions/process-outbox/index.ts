import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const { data: pendingJobs, error: fetchError } = await supabase
    .from('sync_outbox')
    .select('*')
    .eq('status', 'pending')
    .or('and(status.eq.failed,retry_count.lt.5)')
    .limit(10)

  if (fetchError || !pendingJobs) return new Response('No jobs', { status: 200 })

  for (const job of pendingJobs) {
    try {
      if (job.target_service === 'outlook') {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/outlook-sync`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
          body: JSON.stringify({ booking_id: job.booking_id })
        })
        if (!res.ok) throw new Error(`Sync failed: ${res.statusText}`)
      }
      
      await supabase.from('sync_outbox').update({ status: 'processed', last_attempt: new Date().toISOString() }).eq('id', job.id)
    } catch (e) {
      await supabase.from('sync_outbox').update({ 
        status: 'failed', 
        retry_count: job.retry_count + 1, 
        last_attempt: new Date().toISOString() 
      }).eq('id', job.id)
    }
  }

  return new Response('Outbox Processed', { status: 200 })
})
