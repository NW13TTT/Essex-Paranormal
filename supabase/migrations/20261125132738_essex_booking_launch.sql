-- Existing checkout schema and essex_reserve must be installed before this migration.
alter table essex_checkout.holds add column if not exists request_id uuid;
create unique index if not exists essex_holds_request_id_idx
    on essex_checkout.holds (request_id) where request_id is not null;

-- Only the checkout Edge Function can read these capacity aggregates.
create or replace function public.essex_booking_availability()
returns table (event_id uuid, content_key text, remaining integer)
language sql stable security definer set search_path = ''
as $$
    select c.id, c.content_key,
           greatest(0, s.capacity - coalesce(b.places, 0) - coalesce(h.places, 0))::integer
    from public.websites w
    join public.website_content c on c.website_id = w.id and c.tenant_id = w.tenant_id
    join public.published_website_content p on p.website_content_id = c.id
        and p.website_id = w.id and p.tenant_id = w.tenant_id
    join public.event_booking_settings s on s.event_content_id = c.id
        and s.website_id = w.id and s.tenant_id = w.tenant_id
    left join lateral (
        select sum(attendee_count) as places from public.event_bookings b
        where b.event_content_id = c.id and b.website_id = w.id and b.tenant_id = w.tenant_id
            and b.status = 'CONFIRMED'
    ) b on true
    left join lateral (
        select sum(quantity) as places from essex_checkout.holds h
        where h.event_id = c.id and h.state = 'pending'
    ) h on true
    where w.domain = 'essexparanormal.com' and w.site_lifecycle in ('APPROVED', 'PUBLISHED')
        and c.content_status = 'PUBLISHED'
        and lower(coalesce(c.content->>'recordType', c.content->>'section', '')) in ('event', 'events')
        and upper(coalesce(c.content->>'eventStatus', 'UPCOMING')) = 'UPCOMING'
        and lower(coalesce(c.content->>'eventType', 'bookable')) = 'bookable'
        and c.content->>'date' >= (now() at time zone 'Europe/London')::date::text;
$$;

-- Serialise retries by request, then use the existing event-capacity lock.
create or replace function public.essex_start_checkout(
    p_request uuid, p_event uuid, p_quantity integer, p_type text, p_customer jsonb
)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
    h essex_checkout.holds%rowtype;
    reservation jsonb;
begin
    if p_request is null then
        raise exception using errcode = '22023', message = 'A checkout request ID is required';
    end if;
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_request::text, 0));

    select * into h from essex_checkout.holds where request_id = p_request;
    if found then
        if h.event_id is distinct from p_event or h.quantity is distinct from p_quantity
            or h.payment_type is distinct from p_type or h.customer is distinct from p_customer then
            raise exception using errcode = '22023', message = 'Checkout request details changed';
        end if;
        return jsonb_build_object('id', h.id, 'amount_pence', h.amount_pence,
            'checkout_id', h.checkout_id, 'state', h.state, 'create_checkout', false);
    end if;

    -- Acquire the same row lock before rechecking publication and availability.
    perform 1 from public.event_booking_settings where event_content_id = p_event for update;
    if not found or not exists (
        select 1 from public.essex_booking_availability() a
        where a.event_id = p_event and a.remaining >= p_quantity
    ) then
        raise exception using errcode = 'P0001', message = 'Event is not available for booking';
    end if;

    reservation := public.essex_reserve(p_event, p_quantity, p_type, p_customer);
    update essex_checkout.holds set request_id = p_request where id = (reservation->>'id')::uuid;
    return reservation || jsonb_build_object('state', 'pending', 'create_checkout', true);
end;
$$;

revoke all on function public.essex_booking_availability() from public, anon, authenticated;
grant execute on function public.essex_booking_availability() to service_role;
revoke all on function public.essex_start_checkout(uuid, uuid, integer, text, jsonb) from public, anon, authenticated;
grant execute on function public.essex_start_checkout(uuid, uuid, integer, text, jsonb) to service_role;

-- Keep Essex private appointments out of the existing public RPC, including direct callers.
CREATE OR REPLACE FUNCTION public.get_public_website_content_payload(requested_domain text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select jsonb_build_object(
    'website', jsonb_build_object('name', website.name, 'domain', website.domain, 'website_settings', website.website_settings),
    'content', coalesce((select jsonb_agg(jsonb_build_object('content_key', content.content_key, 'content', content.content, 'updated_at', content.updated_at, 'content_status', content.content_status) order by content.updated_at desc) from public.website_content as content join public.published_website_content as published on published.website_content_id = content.id where content.website_id = website.id and content.tenant_id = website.tenant_id and content.content_status = 'PUBLISHED'
      and (website.domain <> 'essexparanormal.com' or not (
        lower(btrim(coalesce(content.content->>'eventType', ''))) in ('private','internal','appointment','private_investigation')
        or lower(btrim(coalesce(content.content->>'recordType', ''))) in ('private','internal','appointment','private_investigation')
        or lower(btrim(coalesce(content.content->>'visibility', ''))) in ('private','internal')
      ))), '[]'::jsonb),
    'pages', coalesce((select jsonb_agg(jsonb_build_object('title', page.title, 'slug', page.slug, 'page_type', page.page_type, 'visibility', page.visibility, 'sort_order', page.sort_order, 'published', page.published) order by page.sort_order) from public.website_pages as page where page.website_id = website.id and page.published and page.visibility), '[]'::jsonb),
    'social_links', coalesce((select jsonb_agg(jsonb_build_object('platform', link.platform, 'url', link.url) order by link.platform) from public.social_links as link where link.website_id = website.id and link.tenant_id = website.tenant_id and link.url like 'https://%'), '[]'::jsonb),
    'media', coalesce((select jsonb_agg(jsonb_build_object('id', media.id, 'title', media.title, 'metadata', media.metadata) order by media.created_at desc) from public.media as media where media.website_id = website.id and media.tenant_id = website.tenant_id and media.metadata ->> 'published' = 'true'), '[]'::jsonb)
  )
  from public.websites as website
  where website.domain = lower(btrim(requested_domain))
    and website.domain in ('newittmedia.co.uk', 'essexparanormal.com')
    and website.site_lifecycle in ('APPROVED', 'PUBLISHED')
  limit 1;
$function$;
