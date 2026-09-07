export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        /*
         * =====================================================
         * API STATUS
         * =====================================================
         */

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


        /*
         * =====================================================
         * PUBLIC INVESTIGATIONS API
         * =====================================================
         *
         * IMPORTANT:
         *
         * This remains an honest public endpoint.
         * No investigations are invented here.
         *
         * When the real published investigation system is
         * connected, this endpoint can return published data.
         *
         * We are deliberately NOT adding a fake database,
         * Supabase credentials, Control Room credentials,
         * or private routing information here.
         *
         */

        if (
            request.method === "GET" &&
            url.pathname === "/api/investigations"
        ) {
            return jsonResponse({
                success: true,
                investigations: []
            });
        }


        /*
         * =====================================================
         * STATIC WEBSITE ASSETS
         * =====================================================
         *
         * Everything else is handled by Cloudflare Assets.
         */

        return env.ASSETS.fetch(request);
    }
};


/* =========================================================
   JSON RESPONSE
   ========================================================= */

function jsonResponse(
    data,
    status = 200
) {
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
