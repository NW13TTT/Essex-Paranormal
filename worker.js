export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        /*
         * =====================================================
         * ESSEX PARANORMAL PUBLIC API
         * =====================================================
         *
         * Keep this Worker deliberately small and safe.
         *
         * The public website can consume published information
         * through these routes without exposing any private
         * Control Room, database, authentication or deployment
         * credentials.
         *
         * Future CMS / Control Room routes should only be added
         * when the real backend architecture is ready.
         */


        /* =====================================================
           API STATUS
           ===================================================== */

        if (
            request.method === "GET" &&
            url.pathname === "/api/status"
        ) {
            return jsonResponse({
                success: true,
                system: "Essex Paranormal API",
                status: "online",
                version: "1.0"
            });
        }


        /* =====================================================
           INVESTIGATIONS
           ===================================================== */

        if (
            request.method === "GET" &&
            url.pathname === "/api/investigations"
        ) {
            /*
             * Only return genuine published investigation data.
             *
             * Until the publishing backend supplies real records,
             * an empty array is intentional.
             *
             * DO NOT add fictional cases, locations, dates,
             * findings or investigation statuses here.
             */

            return jsonResponse({
                success: true,
                investigations: []
            });
        }


        /* =====================================================
           STATIC WEBSITE ASSETS
           ===================================================== */

        return env.ASSETS.fetch(request);
    }
};


/* =========================================================
   JSON RESPONSE HELPER
   ========================================================= */

function jsonResponse(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,

            headers: {
                "Content-Type":
                    "application/json; charset=UTF-8",

                "Cache-Control":
                    "no-store",

                "Access-Control-Allow-Origin":
                    "*"
            }
        }
    );
}
