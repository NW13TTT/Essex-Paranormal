export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Future server-side/API features can go here.
    // Example:
    // if (url.pathname.startsWith("/api/")) {
    //   return new Response("API");
    // }

    return env.ASSETS.fetch(request);
  }
};
