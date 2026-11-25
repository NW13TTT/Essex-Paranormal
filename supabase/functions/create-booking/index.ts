
const env = (key: string) => Deno.env.get(key);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const project = env("SUPABASE_URL");
const merchant = env("ESSEX_SUMUP_MERCHANT_CODE");

async function rpc(name: string, payload: object) {
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(project + "/rest/v1/rpc/" + name, {
    method: "POST", headers: { apikey: key!, Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(8000),
  });
  const result = await response.json();
  if (!response.ok) {
    if (result.code === "23514" || result.code === "P0001") throw new Error("availability");
    if (result.code === "22023") throw new Error("request conflict");
    throw new Error("database");
  }
  return result;
}

async function sumup(path: string, payload?: object) {
  const response = await fetch("https://api.sumup.com/v0.1/checkouts" + path, {
    method: payload ? "POST" : "GET",
    headers: { Authorization: "Bearer " + env("ESSEX_SUMUP_API_KEY"), "Content-Type": "application/json" },
    body: payload ? JSON.stringify(payload) : undefined, signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("payment provider");
  return response.json();
}

Deno.serve(async (request) => {
  const origin = request.headers.get("Origin");
  const headers = new Headers({ "Cache-Control": "no-store", Vary: "Origin" });
  if (origin && origin === env("ESSEX_BOOKING_ORIGIN")) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
  }
  const fail = (status: number, error: string) => Response.json({success:false,error}, {status,headers});
  const pathname = new URL(request.url).pathname;
  const trustedOrigin = Boolean(origin && origin === env("ESSEX_BOOKING_ORIGIN"));
  const enabled = env("ESSEX_CHECKOUT_ENABLED") === "true"
    && Boolean(project && merchant && env("ESSEX_SUMUP_API_KEY") && env("SUPABASE_SERVICE_ROLE_KEY"));

  if (request.method === "OPTIONS") return new Response(null,{status:204,headers});
  try {
    if (pathname.endsWith("/availability")) {
      if (request.method !== "GET") return fail(405,"Method not allowed.");
      if (!trustedOrigin) return fail(403,"Origin not allowed.");
      const availability = await rpc("essex_booking_availability", {});
      return Response.json({ enabled, availability }, { headers });
    }
    if (request.method !== "POST") return fail(405,"Method not allowed.");
    if (!enabled) return fail(503,"Online booking is temporarily unavailable.");
    if (Number(request.headers.get("content-length")) > 8192) return fail(413,"Request is too large.");
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > 8192) return fail(413,"Request is too large.");
    const input = JSON.parse(raw);
    if (!input || typeof input !== "object" || Array.isArray(input)) return fail(400,"Invalid JSON.");
    if (pathname.endsWith("/sumup-webhook")) {
      if (input.event_type !== "CHECKOUT_STATUS_CHANGED") return new Response(null,{status:204});
      if (typeof input.id !== "string" || !uuid.test(input.id)) return fail(400,"Invalid checkout ID.");
      const checkout = await sumup("/" + input.id);
      if (checkout.id !== input.id || checkout.merchant_code !== merchant || checkout.currency !== "GBP" ||
          !uuid.test(checkout.checkout_reference) || !Number.isFinite(checkout.amount)) return fail(400,"Checkout verification failed.");
      // A failed attempt may still be retried on the provider checkout.
      if (["PAID","EXPIRED"].includes(checkout.status)) {
        const state = await rpc("essex_settle_checkout",{p_checkout:checkout.id,p_reference:checkout.checkout_reference,
          p_pence:Math.round(checkout.amount*100),p_status:checkout.status});
        if (state === null) return fail(503,"Checkout record unavailable.");
      }
      return new Response(null,{status:204});
    }
    if (!trustedOrigin) return fail(403,"Origin not allowed.");
    const {event_id,tickets_qty,payment_type,is_gift,request_id} = input;
    const field = (name: string, limit: number) => typeof input[name] === "string" ? input[name].trim().slice(0,limit+1) : "";
    const customer_name = field("customer_name",200), customer_email = field("customer_email",254);
    const customer_phone = field("customer_phone",40), recipient_name = field("recipient_name",200);
    const recipient_email = field("recipient_email",254), gift_message = field("gift_message",1000);
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof request_id !== "string" || !uuid.test(request_id)
        || typeof event_id !== "string" || !uuid.test(event_id) || !Number.isInteger(tickets_qty) || tickets_qty<1 || tickets_qty>10 ||
        !["deposit","full"].includes(payment_type) || !customer_name || customer_name.length>200 ||
        customer_email.length>254 || !email.test(customer_email) || customer_phone.length>40 ||
        (is_gift === true && (!recipient_name || recipient_name.length>200 || recipient_email.length>254 ||
          (recipient_email && !email.test(recipient_email)) || gift_message.length>1000))) return fail(400,"Check your booking details.");
    const customer = {customer_name,customer_email,customer_phone,is_gift:is_gift===true,
      ...(is_gift===true ? {recipient_name,recipient_email,gift_message} : {})};
    const hold = await rpc("essex_start_checkout", {
      p_request: request_id, p_event: event_id, p_quantity: tickets_qty,
      p_type: payment_type, p_customer: customer,
    });
    if (hold.state === "paid") {
      return Response.json({ success: true, booking_reference: hold.id, payment_status: "paid" }, { headers });
    }
    if (hold.state !== "pending") return fail(409,"This checkout is closed. Start a new booking.");

    let checkout;
    if (hold.create_checkout) {
      checkout = await sumup("", {
        checkout_reference: hold.id, amount: hold.amount_pence / 100,
        currency: "GBP", merchant_code: merchant, description: "Essex Paranormal tickets",
        hosted_checkout: { enabled: true },
        valid_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        return_url: project + "/functions/v1/create-booking/sumup-webhook",
      });
    } else if (hold.checkout_id) {
      checkout = await sumup("/" + encodeURIComponent(hold.checkout_id));
    } else {
      // The original creation request may still be in flight.
      const matches = await sumup("?checkout_reference=" + encodeURIComponent(hold.id));
      if (!Array.isArray(matches) || matches.length !== 1) {
        return fail(409,"Checkout is being prepared. Wait a moment and retry with the same details.");
      }
      checkout = matches[0];
    }
    const checkoutId = checkout?.id;
    if (typeof checkoutId !== "string" || !uuid.test(checkoutId)
        || (hold.checkout_id && hold.checkout_id !== checkoutId)
        || checkout.checkout_reference !== hold.id || checkout.merchant_code !== merchant
        || checkout.currency !== "GBP" || !Number.isFinite(checkout.amount)
        || Math.round(checkout.amount * 100) !== hold.amount_pence) {
      return fail(502,"Secure checkout could not be verified.");
    }
    if (checkout.status === "PAID") {
      await rpc("essex_attach_checkout", { p_hold: hold.id, p_checkout: checkoutId });
      const state = await rpc("essex_settle_checkout", {
        p_checkout: checkoutId, p_reference: hold.id, p_pence: hold.amount_pence, p_status: "PAID",
      });
      if (state !== "paid") return fail(503,"Payment confirmation is being verified.");
      return Response.json({ success: true, booking_reference: hold.id, payment_status: "paid" }, { headers });
    }
    if (checkout.status !== "PENDING"
        || typeof checkout.hosted_checkout_url !== "string"
        || new URL(checkout.hosted_checkout_url).origin !== "https://checkout.sumup.com") {
      return fail(409,"The payment provider has not returned an open checkout.");
    }
    if (!await rpc("essex_attach_checkout", { p_hold: hold.id, p_checkout: checkoutId })) {
      return fail(503,"Secure checkout could not be saved. Retry with the same details.");
    }
    return Response.json({
      success: true, booking_reference: hold.id, payment_status: "pending", checkoutUrl: checkout.hosted_checkout_url,
    }, { headers });
  } catch(error) {
    if (error instanceof SyntaxError) return fail(400,"Invalid JSON.");
    if (error instanceof Error && error.message === "request conflict") return fail(409,"Checkout details changed. Start a new booking.");
    if (error instanceof Error && error.message === "availability") return fail(409,"This event has insufficient ticket availability.");
    return fail(503,"Online booking is temporarily unavailable.");
  }
});
