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


    // Investigations
    if (url.pathname === "/api/investigations") {

      const investigations = [
        {
          id: "EP-001",
          title: "Investigation 001",
          location: "Location pending",
          date: null,
          status: "PENDING",
          description: "Investigation details will appear here once published."
        },
        {
          id: "EP-002",
          title: "Investigation 002",
          location: "Location pending",
          date: null,
          status: "PENDING",
          description: "Investigation details will appear here once published."
        },
        {
          id: "EP-003",
          title: "Investigation 003",
          location: "Location pending",
          date: null,
          status: "PENDING",
          description: "Investigation details will appear here once published."
        }
      ];

      return new Response(
        JSON.stringify({
          success: true,
          investigations
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
     * FUTURE API ROUTES
     * =====================================================
     *
     * /api/case-files
     * /api/evidence
     * /api/gallery
     * /api/locations
     * /api/bookings
     * /api/payments
     *
     * These will eventually connect to the Control Room
     * and database.
     */


    /*
     * =====================================================
     * WEBSITE
     * =====================================================
     */

    return env.ASSETS.fetch(request);
  }
};
