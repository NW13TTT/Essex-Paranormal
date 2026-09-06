export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /*
     * =====================================================
     * ESSEX PARANORMAL API
     * =====================================================
     */

    // Health check
    if (url.pathname === "/api/status") {
      return new Response(
        JSON.stringify({
          success: true,
          system: "Essex Paranormal API",
          status: "online",
          version: "1.0"
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }


    /*
     * =====================================================
     * INVESTIGATIONS
     * =====================================================
     *
     * The public website must never display invented
     * investigations or placeholder cases.
     *
     * Real investigations will be supplied by the
     * Control Room / publishing system when that
     * connection is implemented.
     *
     * Until then, return an honest empty collection.
     */

    if (url.pathname === "/api/investigations") {
      return new Response(
        JSON.stringify({
          success: true,
          investigations: []
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }


    /*
     * =====================================================
     * FUTURE CONTROL ROOM / CMS API ROUTES
     * =====================================================
     *
     * These routes are intentionally NOT fabricated here.
     *
     * When the Control Room publishing connection is added,
     * the public website can consume published content from
     * the existing system without exposing private storage,
     * credentials or administrative functionality.
     *
     * Planned areas include:
     *
     * /api/case-files
     * /api/evidence
     * /api/gallery
     * /api/locations
     * /api/bookings
     * /api/payments
     *
     * No dummy data is returned for these routes.
     */


    /*
     * =====================================================
     * WEBSITE
     * =====================================================
     */

    return env.ASSETS.fetch(request);
  }
};
