
"use strict";

/* =========================================================
   ESSEX PARANORMAL
   STABLE WEBSITE SCRIPT
   ========================================================= */

const API_BASE = "/api";


/* =========================================================
   STARTUP
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initEntryScreen();
    initMobileNavigation();
    initSmoothNavigation();
    initHeaderScroll();
    initActiveNavigation();
    initBackToTop();
    initImageFallbacks();
    initCurrentYear();

    /*
     * IMPORTANT
     *
     * This script does NOT rebuild the website.
     * It does NOT remove the HMP Ashwell image.
     * It does NOT rename the investigation card.
     *
     * The HTML remains the source of truth.
     */

    ensureConstructionBanner();
    normaliseHomepageArchive();
    fixAncientRamVideo();
    ensureFacebookLink();

});


/* =========================================================
   CINEMATIC ENTRY SCREEN
   ========================================================= */

function initEntryScreen() {

    const entryScreen =
        document.getElementById("entry-screen");

    if (!entryScreen) {
        return;
    }

    try {

        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }

    } catch (error) {
        /* Ignore browser restrictions. */
    }

    /*
     * Keep the page at the very top while
     * the cinematic introduction is playing.
     */

    forceScrollTop();

    let reducedMotion = false;

    try {

        reducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

    } catch (error) {

        reducedMotion = false;

    }

    /*
     * Lock page scrolling while the intro
     * is visible.
     *
     * The existing CSS controls the actual
     * cinematic effects.
     */

    document.body.classList.add(
        "entry-active"
    );

    /*
     * The cinematic introduction lasts
     * 7.5 seconds before the fade-out begins.
     */

    const displayTime = 7500;

    window.setTimeout(() => {

        hideEntryScreen(
            entryScreen,
            reducedMotion
        );

    }, displayTime);

    /*
     * Emergency failsafe.
     *
     * This is deliberately longer than the
     * normal 7.5 second introduction.
     */

    window.setTimeout(() => {

        const current =
            document.getElementById(
                "entry-screen"
            );

        if (!current) {

            document.body.classList.remove(
                "entry-active"
            );

            return;

        }

        current.classList.add(
            "is-hidden"
        );

        current.style.opacity = "0";
        current.style.visibility = "hidden";
        current.style.pointerEvents = "none";

        document.body.classList.remove(
            "entry-active"
        );

        window.setTimeout(() => {

            const screen =
                document.getElementById(
                    "entry-screen"
                );

            if (screen) {
                screen.remove();
            }

        }, 1000);

    }, 9000);

}


/* =========================================================
   HIDE ENTRY SCREEN
   ========================================================= */

function hideEntryScreen(
    entryScreen,
    reducedMotion
) {

    if (!entryScreen) {
        return;
    }

    entryScreen.classList.add(
        "is-hidden"
    );

    entryScreen.style.pointerEvents = "none";

    /*
     * Release the page after the intro
     * begins fading away.
     */

    document.body.classList.remove(
        "entry-active"
    );

    /*
     * Allow the existing CSS transition
     * to complete before removing the
     * entry screen from the document.
     */

    window.setTimeout(() => {

        if (entryScreen) {
            entryScreen.remove();
        }

        forceScrollTop();

    }, reducedMotion ? 50 : 850);

}


/* =========================================================
   FORCE PAGE TOP
   ========================================================= */

function forceScrollTop() {

    /*
     * Do not interfere with deliberate
     * section navigation.
     */

    if (
        window.location.hash &&
        window.location.hash !== "#home"
    ) {
        return;
    }

    try {

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        });

    } catch (error) {

        window.scrollTo(0, 0);

    }

}


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function initMobileNavigation() {

    const menuToggle =
        document.querySelector(
            ".menu-toggle"
        );

    const navigation =
        document.getElementById(
            "main-navigation"
        );

    if (
        !menuToggle ||
        !navigation
    ) {
        return;
    }

    menuToggle.addEventListener(
        "click",
        () => {

            const isOpen =
                navigation.classList.toggle(
                    "open"
                );

            menuToggle.classList.toggle(
                "open",
                isOpen
            );

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
            );

            document.body.classList.toggle(
                "menu-open",
                isOpen
            );

        }
    );

    navigation
        .querySelectorAll("a")
        .forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    closeMobileNavigation();

                }
            );

        });

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {
                closeMobileNavigation();
            }

        }
    );

    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth > 900) {
                closeMobileNavigation();
            }

        }
    );

}


function closeMobileNavigation() {

    const navigation =
        document.getElementById(
            "main-navigation"
        );

    const menuToggle =
        document.querySelector(
            ".menu-toggle"
        );

    if (navigation) {

        navigation.classList.remove(
            "open"
        );

    }

    if (menuToggle) {

        menuToggle.classList.remove(
            "open"
        );

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

    }

    document.body.classList.remove(
        "menu-open"
    );

}


/* =========================================================
   SMOOTH NAVIGATION
   ========================================================= */

function initSmoothNavigation() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach((link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const href =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        !href ||
                        href === "#" ||
                        href === "#!"
                    ) {
                        return;
                    }

                    let target = null;

                    try {

                        target =
                            document.querySelector(
                                href
                            );

                    } catch (error) {

                        return;

                    }

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    const header =
                        document.querySelector(
                            ".site-header"
                        );

                    const headerHeight =
                        header
                            ? header.offsetHeight
                            : 0;

                    const position =
                        target
                            .getBoundingClientRect()
                            .top +
                        window.scrollY -
                        headerHeight;

                    window.scrollTo({

                        top: Math.max(
                            0,
                            position
                        ),

                        left: 0,
                        behavior: "smooth"

                    });

                    try {

                        history.replaceState(
                            null,
                            "",
                            href
                        );

                    } catch (error) {
                        /* Ignore history errors. */
                    }

                }
            );

        });

}


/* =========================================================
   HEADER SCROLL
   ========================================================= */

function initHeaderScroll() {

    const header =
        document.querySelector(
            ".site-header"
        );

    if (!header) {
        return;
    }

    const update = () => {

        header.classList.toggle(
            "scrolled",
            window.scrollY > 30
        );

    };

    update();

    window.addEventListener(
        "scroll",
        update,
        {
            passive: true
        }
    );

}


/* =========================================================
   ACTIVE NAVIGATION
   ========================================================= */

function initActiveNavigation() {

    const links =
        Array.from(
            document.querySelectorAll(
                '#main-navigation a[href^="#"]'
            )
        );

    if (!links.length) {
        return;
    }

    const sections =
        links
            .map((link) => {

                const href =
                    link.getAttribute(
                        "href"
                    );

                let section = null;

                try {

                    section =
                        document.querySelector(
                            href
                        );

                } catch (error) {

                    return null;

                }

                if (!section) {
                    return null;
                }

                return {
                    link,
                    section
                };

            })
            .filter(Boolean);

    if (!sections.length) {
        return;
    }

    const update = () => {

        const position =
            window.scrollY +
            window.innerHeight * 0.32;

        let current = sections[0];

        sections.forEach((item) => {

            if (
                item.section.offsetTop <=
                position
            ) {
                current = item;
            }

        });

        sections.forEach((item) => {

            item.link.classList.toggle(
                "active",
                item === current
            );

        });

    };

    update();

    window.addEventListener(
        "scroll",
        update,
        {
            passive: true
        }
    );

}


/* =========================================================
   BACK TO TOP
   ========================================================= */

function initBackToTop() {

    const buttons =
        document.querySelectorAll(
            ".back-to-top"
        );

    if (!buttons.length) {
        return;
    }

    const update = () => {

        const visible =
            window.scrollY > 600;

        buttons.forEach((button) => {

            button.classList.toggle(
                "visible",
                visible
            );

        });

    };

    update();

    window.addEventListener(
        "scroll",
        update,
        {
            passive: true
        }
    );

    buttons.forEach((button) => {

        button.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                window.scrollTo({

                    top: 0,
                    left: 0,
                    behavior: "smooth"

                });

            }
        );

    });

}


/* =========================================================
   IMAGE FALLBACKS
   ========================================================= */

function initImageFallbacks() {

    document
        .querySelectorAll("img")
        .forEach((image) => {

            image.addEventListener(
                "error",
                () => {

                    image.classList.add(
                        "image-load-failed"
                    );

                },
                {
                    once: true
                }
            );

        });

}


/* =========================================================
   CURRENT YEAR
   ========================================================= */

function initCurrentYear() {

    const year =
        String(
            new Date().getFullYear()
        );

    document
        .querySelectorAll(
            "[data-current-year]"
        )
        .forEach((element) => {

            element.textContent = year;

        });

}


/* =========================================================
   WEBSITE UNDER CONSTRUCTION BANNER
   ========================================================= */

function ensureConstructionBanner() {

    /*
     * Never create a second banner.
     */

    if (
        document.querySelector(
            ".construction-ticker"
        )
    ) {
        return;
    }

    const header =
        document.querySelector(
            ".site-header"
        );

    if (!header) {
        return;
    }

    const ticker =
        document.createElement(
            "div"
        );

    ticker.className =
        "construction-ticker";

    ticker.setAttribute(
        "role",
        "status"
    );

    ticker.setAttribute(
        "aria-label",
        "Website under construction"
    );

    ticker.innerHTML = `
        <div class="construction-ticker-track">

            <span>
                WEBSITE UNDER CONSTRUCTION • NEW INVESTIGATIONS, STORIES &amp; CONTENT ARE EMERGING • WATCH THIS SPACE
            </span>

            <span aria-hidden="true">
                WEBSITE UNDER CONSTRUCTION • NEW INVESTIGATIONS, STORIES &amp; CONTENT ARE EMERGING • WATCH THIS SPACE
            </span>

        </div>
    `;

    header.insertAdjacentElement(
        "afterend",
        ticker
    );

    const style =
        document.createElement(
            "style"
        );

    style.setAttribute(
        "data-ep-construction",
        "true"
    );

    style.textContent = `

        .construction-ticker {
            position: relative;
            z-index: 20;
            width: 100%;
            overflow: hidden;
            background: #050608;
            border-top: 1px solid rgba(183,255,0,.25);
            border-bottom: 1px solid rgba(183,255,0,.25);
            padding: 11px 0;
        }

        .construction-ticker-track {
            display: flex;
            width: max-content;
            white-space: nowrap;
            animation: epConstructionTicker 24s linear infinite;
            will-change: transform;
        }

        .construction-ticker-track span {
            display: block;
            flex-shrink: 0;
            padding-right: 70px;
            color: #ffffff;
            font-family: "Barlow Condensed", sans-serif;
            font-size: .72rem;
            font-weight: 800;
            letter-spacing: .14em;
        }

        @keyframes epConstructionTicker {

            from {
                transform: translateX(-50%);
            }

            to {
                transform: translateX(0);
            }

        }

        @media (max-width: 900px) {

            .construction-ticker {
                padding: 9px 0;
            }

            .construction-ticker-track span {
                font-size: .62rem;
                letter-spacing: .10em;
                padding-right: 50px;
            }

        }

        @media (prefers-reduced-motion: reduce) {

            .construction-ticker-track {
                animation: none;
                transform: none;
            }

        }

    `;

    document.head.appendChild(style);

}


/* =========================================================
   HOMEPAGE ARCHIVE
   ========================================================= */

function normaliseHomepageArchive() {

    const investigations =
        document.getElementById(
            "investigations"
        );

    if (!investigations) {
        return;
    }

    /*
     * The HTML is the source of truth.
     *
     * Keep the existing featured investigation cards.
     * Keep the correct .archive-coming-soon panel.
     *
     * Remove only obsolete archive blocks that were
     * injected by previous versions of this script.
     *
     * Do not create a replacement archive block here.
     * Do not rewrite archive wording here.
     */

    investigations
        .querySelectorAll(
            ".archive-action, " +
            ".investigation-archive-action, " +
            ".homepage-archive-status"
        )
        .forEach((element) => {

            element.remove();

        });

}


/* =========================================================
   ANCIENT RAM INN VIDEO
   ========================================================= */

function fixAncientRamVideo() {

    const video =
        document.querySelector(
            '.upcoming-event-video video[src], .upcoming-event-video video'
        );

    if (!video) {
        return;
    }

    const wrapper =
        video.closest(
            ".upcoming-event-video"
        );

    if (!wrapper) {
        return;
    }

    /*
     * The video must behave like a controlled
     * 16:9 preview, not a giant vertical block.
     */

    const style =
        document.createElement(
            "style"
        );

    style.setAttribute(
        "data-ep-ram-video",
        "true"
    );

    style.textContent = `

        .upcoming-event-video {
            position: relative !important;
            width: 100% !important;
            aspect-ratio: 16 / 9 !important;
            min-height: 0 !important;
            height: auto !important;
            overflow: hidden !important;
            background: #000 !important;
        }

        .upcoming-event-video video {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            height: 100% !important;
            display: block !important;
            object-fit: cover !important;
            background: #000 !important;
        }

        @media (max-width: 900px) {

            .upcoming-event-video {
                aspect-ratio: 16 / 9 !important;
                min-height: 0 !important;
                height: auto !important;
            }

        }

    `;

    document.head.appendChild(style);

}


/* =========================================================
   FACEBOOK
   ========================================================= */

function ensureFacebookLink() {

    const facebookURL =
        "https://www.facebook.com/share/g/1DWrfynuJ4/?mibextid=wwXIfr";

    document
        .querySelectorAll(
            'a[href*="facebook.com"]'
        )
        .forEach((link) => {

            link.href = facebookURL;

        });

}


/* Published Control Room records. Static site content remains the fallback. */
(() => {
    "use strict";

    const text = (value, limit = 160) =>
        typeof value === "string" ? value.trim().slice(0, limit) : "";

    const isInvestigationRecord = (entry) => {
        const data = entry?.content;
        if (!data || typeof data !== "object" || Array.isArray(data)) return false;
        const type = text(data.recordType, 40).toLowerCase();
        const section = text(data.section, 120).toLowerCase();
        const category = text(data.category, 120).toLowerCase();
        const key = text(entry.contentKey, 160).toLowerCase();
        if (["event", "events"].includes(type) || ["event", "events"].includes(section)) return false;
        if (["investigation", "investigations"].includes(type) || ["investigation", "investigations"].includes(section)) return true;
        return ["investigation", "investigations"].includes(category)
            || /(^|[-_ ])investigations?($|[-_ ])/.test(key);
    };

    const renderInvestigations = (payload) => {
        const container = document.querySelector("#investigation-list");
        if (!container || !Array.isArray(payload?.content)) return;
        const records = payload.content.filter(isInvestigationRecord);
        if (!records.length) return;
        const fragment = document.createDocumentFragment();
        records.forEach((entry) => {
            const data = entry.content;
            const card = document.createElement("article");
            card.className = "published-investigation-card";
            card.id = `investigation-${text(entry.contentKey, 160).toLowerCase().replace(/[^a-z0-9_-]+/g, "-")}`;
            const title = document.createElement("h3");
            title.textContent = text(data.title) || "Paranormal Investigation";
            card.append(title);
            const category = text(data.category, 120);
            if (category && !["investigation", "investigations"].includes(category.toLowerCase())) {
                const label = document.createElement("p");
                label.className = "published-record-category";
                label.textContent = category;
                card.append(label);
            }
            const date = text(data.date, 80);
            if (date) {
                const dateElement = document.createElement("p");
                dateElement.className = "published-record-date";
                dateElement.textContent = date;
                card.append(dateElement);
            }
            const description = text(data.text, 10000);
            if (description) {
                const paragraph = document.createElement("p");
                paragraph.textContent = description;
                card.append(paragraph);
            }
            fragment.append(card);
        });
        container.replaceChildren(fragment);
    };

    const renderEvents = (payload) => {
        const container = document.querySelector("#event-list");
        if (!container || !Array.isArray(payload?.content)) return;
        const emptyState = document.querySelector("#event-empty-state");
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const records = payload.content.filter((entry) => {
            const data = entry?.content;
            if (!data || typeof data !== "object" || Array.isArray(data)) return false;
            const type = text(data.recordType, 40).toLowerCase();
            const section = text(data.section ?? data.category, 120).toLowerCase();
            const key = text(entry.contentKey, 160).toLowerCase();
            const date = text(data.date, 80);
            const endDate = text(data.endDate, 80) || date;
            const isEvent = ["event", "events"].includes(type)
                ? true
                : ["investigation", "investigations"].includes(type)
                    ? false
                    : ["event", "events"].includes(section)
                        || /(^|[-_ ])events?($|[-_ ])/.test(key);
            const isISODate = (value) => {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
                const parsed = new Date(`${value}T00:00:00Z`);
                return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
            };
            return isEvent && isISODate(date) && isISODate(endDate) && endDate >= today;
        }).sort((a, b) => a.content.date.localeCompare(b.content.date));
        if (!records.length) {
            container.replaceChildren();
            if (emptyState) emptyState.hidden = false;
            return;
        }
        if (emptyState) emptyState.hidden = true;
        const fragment = document.createDocumentFragment();
        records.forEach((entry) => {
            const data = entry.content;
            const card = document.createElement("article");
            card.className = "published-event-card";
            const content = document.createElement("div");
            content.className = "upcoming-event-content";
            const title = document.createElement("h3");
            title.textContent = text(data.title) || "Essex Paranormal Event";
            content.append(title);
            const date = text(data.date, 80);
            const endDate = text(data.endDate, 80);
            if (date) {
                const dateElement = document.createElement("p");
                dateElement.className = "upcoming-event-description";
                dateElement.textContent = endDate && endDate !== date ? `${date} – ${endDate}` : date;
                content.append(dateElement);
            }
            const description = text(data.text, 10000);
            if (description) {
                const paragraph = document.createElement("p");
                paragraph.className = "upcoming-event-description";
                paragraph.textContent = description;
                content.append(paragraph);
            }
            const linkedKey = text(data.investigationKey, 160);
            const related = payload.content.find((candidate) =>
                text(candidate?.contentKey, 160) === linkedKey && isInvestigationRecord(candidate));
            if (related) {
                const link = document.createElement("a");
                link.href = `#investigation-${linkedKey.toLowerCase().replace(/[^a-z0-9_-]+/g, "-")}`;
                link.className = "button button-secondary";
                link.textContent = `Related investigation: ${text(related.content?.title) || linkedKey}`;
                content.append(link);
            }
            card.append(content);
            fragment.append(card);
        });
        container.replaceChildren(fragment);
    };

    const renderMedia = (payload) => {
        const container = document.querySelector("#public-media");
        if (!container || !Array.isArray(payload?.media)) return;
        const records = payload.media.filter((item) => {
            const type = text(item?.metadata?.type, 100);
            return text(item?.signedUrl, 2048) && /^(image|video|audio)\//.test(type);
        });
        if (!records.length) return;
        container.replaceChildren();
        records.slice(0, 18).forEach((item) => {
            const figure = document.createElement("figure");
            const type = text(item?.metadata?.type, 100);
            const element = document.createElement(type.startsWith("image/") ? "img" : type.startsWith("video/") ? "video" : "audio");
            element.src = text(item.signedUrl, 2048);
            element.controls = !type.startsWith("image/");
            element.preload = type.startsWith("audio/") ? "none" : "metadata";
            if (type.startsWith("image/")) element.alt = text(item.title) || "Essex Paranormal archive media";
            figure.append(element);
            if (text(item.title)) {
                const caption = document.createElement("figcaption");
                caption.textContent = text(item.title);
                figure.append(caption);
            }
            container.append(figure);
        });
    };

    const renderSocialLinks = (payload) => {
        const container = document.querySelector("#social-links");
        if (!container || !Array.isArray(payload?.socialLinks) || !payload.socialLinks.length) return;
        container.replaceChildren();
        payload.socialLinks.forEach((item) => {
            const url = text(item?.url, 2048);
            const platform = text(item?.platform, 80);
            if (!platform || !/^https:\/\//.test(url)) return;
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.target = "_blank";
            anchor.rel = "noopener noreferrer";
            anchor.textContent = platform;
            container.append(anchor);
        });
        if (!container.childElementCount) container.textContent = "Information coming soon.";
    };

    addEventListener("essex-public-content", (event) => {
        renderMedia(event.detail);
        renderSocialLinks(event.detail);
        renderInvestigations(event.detail);
        renderEvents(event.detail);
    });
})();
