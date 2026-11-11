(() => {
  "use strict";

  const endpoint = "https://bluprrtwvubrqgzuimyc.supabase.co/functions/v1/public-website-content";
  const domain = "essexparanormal.com";

  const applyText = (element, value) => {
    if (typeof value !== "string" || value.trim() === "" || value.length > 10000) return;
    const text = value.trim();
    const emphasis = element.children.length === 1 ? element.firstElementChild : null;
    if (!emphasis) {
      if (element.children.length === 0) element.textContent = text;
      return;
    }
    if (!emphasis.matches("span, strong, em, b, i, small, mark, sub, sup") ||
        emphasis.children.length || element.lastChild !== emphasis &&
        element.lastChild.textContent.trim()) return;
    const originalTail = emphasis.textContent.trim();
    const words = text.split(/\s+/);
    const tailLength = Math.min(originalTail.split(/\s+/).length, words.length);
    const tail = words.slice(-tailLength).join(" ");
    const lead = words.slice(0, -tailLength).join(" ");
    emphasis.textContent = tail;
    element.replaceChildren(document.createTextNode(lead ? lead + " " : ""), emphasis);
  };

  const applyPublishedContent = (payload) => {
    const entries = new Map(payload.content.map((entry) => [entry?.contentKey, entry?.content]));
    const media = new Map((Array.isArray(payload.media) ? payload.media : [])
      .map((item) => [item?.id, item]));
    document.querySelectorAll("[data-control-room-content-key]").forEach((element) => {
      const record = entries.get(element.dataset.controlRoomContentKey);
      if (!record) return;
      const field = element.dataset.controlRoomContentField;
      if (field === "title" || field === "text") applyText(element, record[field]);
      if (field === "image" && element instanceof HTMLImageElement) {
        const image = media.get(record.imageMediaId);
        if (!image?.metadata?.type?.startsWith("image/") || typeof image.signedUrl !== "string") return;
        let url;
        try { url = new URL(image.signedUrl); } catch { return; }
        if (url.origin !== new URL(endpoint).origin ||
            !url.pathname.startsWith("/storage/v1/object/sign/website-media/")) return;
        const replacement = new Image();
        replacement.onload = () => {
          element.removeAttribute("srcset");
          element.src = url.href;
          if (typeof record.imageAlt === "string" && record.imageAlt.trim()) element.alt = record.imageAlt;
        };
        replacement.src = url.href;
      }
    });
    const homepage = entries.get("homepage");
    if (homepage) {
      document.querySelectorAll("[data-control-room-homepage-title]")
        .forEach((element) => applyText(element, homepage.title));
      document.querySelectorAll("[data-control-room-homepage-introduction]")
        .forEach((element) => applyText(element, homepage.text));
    }
  };

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain })
  })
    .then((response) => response.ok ? response.json() : null)
    .then((payload) => {
      if (!payload || payload.website?.domain !== domain || !Array.isArray(payload.content)) return;
      applyPublishedContent(payload);
      window.dispatchEvent(new CustomEvent("essex-public-content", { detail: payload }));
    })
    .catch(() => {
      // Static website content remains the safe fallback.
    });
})();