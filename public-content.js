(() => {
  "use strict";

  const endpoint = "https://bluprrtwvubrqgzuimyc.supabase.co/functions/v1/public-website-content";
  const domain = "essexparanormal.com";

  const applyText = (selector, value) => {
    if (typeof value !== "string" || value.trim() === "" || value.length > 240) return;
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value.trim();
    });
  };

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain })
  })
    .then((response) => response.ok ? response.json() : null)
    .then((payload) => {
      if (!payload || payload.website?.domain !== domain || !Array.isArray(payload.content)) return;
      const homepage = payload.content.find((entry) => entry?.contentKey === "homepage");
      if (homepage && typeof homepage.content === "object") {
        applyText("[data-control-room-homepage-title]", homepage.content.title);
        applyText("[data-control-room-homepage-introduction]", homepage.content.text);
      }
      window.dispatchEvent(new CustomEvent("essex-public-content", { detail: payload }));
    })
    .catch(() => {
      // Static website content remains the safe fallback.
    });
})();