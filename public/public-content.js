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

  const renderLocation = (media) => {
    const panel = document.querySelector("[data-control-room-location]");
    if (!panel || !Array.isArray(media)) return;

    const candidates = media.filter((item) => (
      item?.metadata?.category === "Homepage location" &&
      (item.metadata.published === true || item.metadata.published === "true") &&
      item.metadata.type === "video/mp4"
    ));
    if (candidates.length !== 1) return;

    const { title, metadata, signedUrl } = candidates[0];
    if (![title, metadata.location, metadata.description].every(
      (value) => typeof value === "string" && value.trim()
    ) || typeof signedUrl !== "string") return;

    const source = new URL(signedUrl);
    const bucket = "/storage/v1/object/sign/website-media/";
    if (source.origin !== new URL(endpoint).origin ||
        !source.pathname.startsWith(bucket) || !source.searchParams.get("token")) return;

    const player = panel.querySelector("video");
    panel.querySelector("[data-location-video-title]").textContent = title.trim();
    panel.querySelector("[data-location-description]").textContent = metadata.description.trim();
    document.querySelector("[data-location-name]").textContent = metadata.location.trim();
    player.setAttribute("aria-label", title.trim());
    player.src = source.href;
    panel.hidden = false;
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
      renderLocation(payload.media);
    })
    .catch(() => {
      // Static website content remains the safe fallback.
    });
})();