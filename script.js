"use strict";

/*
 * ESSEX PARANORMAL
 * Main public-site JavaScript
 *
 * Important:
 * - The public website remains a consumer of published data.
 * - Existing /api architecture is preserved.
 * - No private credentials are stored here.
 * - No Control Room credentials are exposed here.
 * - Investigation data is never invented by this script.
 */

const API_BASE = "/api";


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    initEntryScreen();
    initMobileNavigation();
    initSmoothNavigation();
    initHeaderScroll();
    initActiveNavigation();
    initBackToTop();
    initInvestigations();
    initImageFallbacks();
    initCurrentYear();
    initPageReady();
});


/* =========================================================
   CINEMATIC ENTRY
   APPROVED INTRO
   ========================================================= */

function initEntryScreen() {
    const entryScreen = document.getElementById("entry-screen");

    if (!entryScreen) {
        return;
    }

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const displayTime = reducedMotion ? 700 : 3000;

    window.setTimeout(() => {
        entryScreen.classList.add("is-hidden");

        window.setTimeout(() => {
            entryScreen.remove();
        }, reducedMotion ? 50 : 850);

    }, displayTime);
}


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function initMobileNavigation() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navigation = document.getElementById("main-navigation");

    if (!menuToggle || !navigation) {
        return;
    }

    const navigationLinks = navigation.querySelectorAll("a");

    function openMenu() {
        navigation.classList.add("open");
        menuToggle.classList.add("open");

        menuToggle.setAttribute(
            "aria-expanded",
            "true"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Close navigation menu"
        );

        document.body.classList.add("menu-open");
    }


    function closeMenu() {
        navigation.classList.remove("open");
        menuToggle.classList.remove("open");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

        menuToggle.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        document.body.classList.remove("menu-open");
    }


    menuToggle.addEventListener("click", () => {
        const isOpen =
            navigation.classList.contains("open");

        if (isOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    });


    navigationLinks.forEach((link) => {
        link.addEventListener("click", () => {
            closeMenu();
        });
    });


    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });


    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeMenu();
        }
    });
}


/* =========================================================
   SMOOTH NAVIGATION
   ========================================================= */

function initSmoothNavigation() {
    const links = document.querySelectorAll(
        'a[href^="#"]'
    );

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId =
                link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target =
                document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            const header =
                document.querySelector(".site-header");

            const headerHeight =
                header
                    ? header.offsetHeight
                    : 0;

            const targetPosition =
                target.getBoundingClientRect().top +
                window.scrollY -
                headerHeight -
                15;

            window.scrollTo({
                top: Math.max(0, targetPosition),
                behavior:
                    reducedMotion
                        ? "auto"
                        : "smooth"
            });

            /*
             * Keep the URL useful without jumping
             * the browser directly to the anchor.
             */
            if (
                window.history &&
                window.history.replaceState
            ) {
                window.history.replaceState(
                    null,
                    "",
                    targetId
                );
            }
        });
    });
}


/* =========================================================
   HEADER SCROLL STATE
   ========================================================= */

function initHeaderScroll() {
    const header =
        document.querySelector(".site-header");

    if (!header) {
        return;
    }


    function updateHeader() {
        if (window.scrollY > 35) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }


    updateHeader();


    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );
}


/* =========================================================
   ACTIVE NAVIGATION
   ========================================================= */

function initActiveNavigation() {
    const navigationLinks =
        document.querySelectorAll(
            '#main-navigation a[href^="#"]'
        );

    if (!navigationLinks.length) {
        return;
    }


    const sections = [];


    navigationLinks.forEach((link) => {
        const targetId =
            link.getAttribute("href");

        const section =
            document.querySelector(targetId);

        if (section) {
            sections.push({
                section,
                link
            });
        }
    });


    if (!sections.length) {
        return;
    }


    const observer =
        new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }


                    sections.forEach((item) => {
                        item.link.classList.remove(
                            "active"
                        );
                    });


                    const current =
                        sections.find(
                            (item) =>
                                item.section ===
                                entry.target
                        );


                    if (current) {
                        current.link.classList.add(
                            "active"
                        );
                    }
                });
            },
            {
                root: null,
                rootMargin:
                    "-35% 0px -55% 0px",
                threshold: 0
            }
        );


    sections.forEach((item) => {
        observer.observe(item.section);
    });
}


/* =========================================================
   BACK TO TOP
   ========================================================= */

function initBackToTop() {
    const button =
        document.querySelector(".back-to-top");

    if (!button) {
        return;
    }


    button.addEventListener("click", (event) => {
        event.preventDefault();

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        window.scrollTo({
            top: 0,
            behavior:
                reducedMotion
                    ? "auto"
                    : "smooth"
        });


        if (
            window.history &&
            window.history.replaceState
        ) {
            window.history.replaceState(
                null,
                "",
                "#home"
            );
        }
    });
}


/* =========================================================
   INVESTIGATIONS API
   ========================================================= */

async function initInvestigations() {
    const container =
        document.getElementById(
            "investigation-list"
        );

    if (!container) {
        return;
    }


    /*
     * Keep the initial honest state visible while
     * the public API is being checked.
     */
    container.setAttribute(
        "aria-live",
        "polite"
    );


    try {
        const response =
            await fetch(
                `${API_BASE}/investigations`,
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    },
                    credentials: "same-origin"
                }
            );


        if (!response.ok) {
            throw new Error(
                `Investigation API returned ${response.status}`
            );
        }


        const data =
            await response.json();


        /*
         * Accept the existing expected shape:
         *
         * {
         *   success: true,
         *   investigations: [...]
         * }
         *
         * Never create fake records when the API
         * contains no published investigations.
         */
        const investigations =
            Array.isArray(
                data?.investigations
            )
                ? data.investigations
                : [];


        if (!investigations.length) {
            renderInvestigationEmptyState(
                container
            );

            return;
        }


        renderInvestigations(
            container,
            investigations
        );

    } catch (error) {
        console.error(
            "Unable to load investigations:",
            error
        );


        renderInvestigationUnavailableState(
            container
        );
    }
}


/* =========================================================
   INVESTIGATION RENDERING
   ========================================================= */

function renderInvestigations(
    container,
    investigations
) {
    const fragment =
        document.createDocumentFragment();


    investigations.forEach(
        (investigation, index) => {

            if (
                !investigation ||
                typeof investigation !== "object"
            ) {
                return;
            }


            fragment.appendChild(
                createInvestigationCard(
                    investigation,
                    index
                )
            );
        }
    );


    if (!fragment.childNodes.length) {
        renderInvestigationEmptyState(
            container
        );

        return;
    }


    container.replaceChildren(fragment);
}


/* =========================================================
   INVESTIGATION CARD
   ========================================================= */

function createInvestigationCard(
    investigation,
    index
) {
    const article =
        document.createElement("article");

    article.className =
        "investigation-card";


    /*
     * These fields are read only from published API
     * content. Missing information is simply omitted.
     */
    const title =
        safeString(
            investigation.title ||
            investigation.name ||
            "Investigation"
        );


    const location =
        safeString(
            investigation.location
        );


    const date =
        safeString(
            investigation.date ||
            investigation.investigationDate
        );


    const status =
        safeString(
            investigation.status
        );


    const summary =
        safeString(
            investigation.summary ||
            investigation.description
        );


    const image =
        safeString(
            investigation.image ||
            investigation.imageUrl
        );


    const details =
        safeString(
            investigation.url ||
            investigation.link
        );


    article.innerHTML = `
        <div class="investigation-card-image">
            ${
                image
                    ? `
                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(title)}"
                            loading="lazy"
                        >
                    `
                    : ""
            }
        </div>

        <div class="investigation-card-content">

            <span class="investigation-card-number">
                ${String(index + 1).padStart(2, "0")}
            </span>

            <span class="investigation-card-label">
                PUBLISHED INVESTIGATION
            </span>

            <h3>
                ${escapeHTML(title)}
            </h3>

            ${
                location
                    ? `
                        <p class="investigation-location">
                            ${escapeHTML(location)}
                        </p>
                    `
                    : ""
            }

            ${
                date
                    ? `
                        <p class="investigation-date">
                            ${escapeHTML(date)}
                        </p>
                    `
                    : ""
            }

            ${
                summary
                    ? `
                        <p class="investigation-summary">
                            ${escapeHTML(summary)}
                        </p>
                    `
                    : ""
            }

            ${
                status
                    ? `
                        <span class="investigation-status">
                            ${escapeHTML(status)}
                        </span>
                    `
                    : ""
            }

            ${
                details
                    ? `
                        <a
                            class="button button-outline"
                            href="${escapeHTML(details)}"
                        >
                            VIEW CASE
                            <span>→</span>
                        </a>
                    `
                    : ""
            }

        </div>
    `;


    const imageElement =
        article.querySelector(
            ".investigation-card-image img"
        );


    if (imageElement) {
        imageElement.addEventListener(
            "error",
            () => {
                console.warn(
                    "Investigation image failed to load:",
                    imageElement.src
                );

                imageElement.remove();
            }
        );
    }


    return article;
}


/* =========================================================
   INVESTIGATION EMPTY STATE
   ========================================================= */

function renderInvestigationEmptyState(
    container
) {
    container.innerHTML = `
        <article class="empty-state">

            <span class="empty-code">
                INVESTIGATION ARCHIVE
            </span>

            <h3>
                No published investigations yet.
            </h3>

            <p>
                Verified investigation information
                will appear here when published.
            </p>

            <span class="empty-status">
                AWAITING PUBLISHED CASE DATA
            </span>

        </article>
    `;
}


/* =========================================================
   INVESTIGATION API UNAVAILABLE STATE
   ========================================================= */

function renderInvestigationUnavailableState(
    container
) {
    container.innerHTML = `
        <article class="empty-state">

            <span class="empty-code">
                INVESTIGATION ARCHIVE
            </span>

            <h3>
                Investigation archive unavailable.
            </h3>

            <p>
                Published investigation information
                could not be loaded right now.
                Please try again later.
            </p>

            <span class="empty-status">
                TEMPORARILY UNAVAILABLE
            </span>

        </article>
    `;
}


/* =========================================================
   HTML ESCAPING
   ========================================================= */

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   SAFE STRING
   ========================================================= */

function safeString(value) {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (
        typeof value !== "string" &&
        typeof value !== "number"
    ) {
        return "";
    }

    return String(value).trim();
}


/* =========================================================
   IMAGE ERROR HANDLING
   ========================================================= */

function initImageFallbacks() {
    const images =
        document.querySelectorAll(
            "img"
        );


    images.forEach((image) => {
        image.addEventListener(
            "error",
            () => {
                console.warn(
                    "Website image failed to load:",
                    image.src
                );

                image.classList.add(
                    "image-load-error"
                );
            }
        );
    });
}


/* =========================================================
   CURRENT YEAR
   ========================================================= */

function initCurrentYear() {
    const year =
        new Date().getFullYear();


    document
        .querySelectorAll(
            "[data-current-year]"
        )
        .forEach((element) => {
            element.textContent =
                String(year);
        });
}


/* =========================================================
   PAGE READY
   ========================================================= */

function initPageReady() {
    requestAnimationFrame(() => {
        document.body.classList.add(
            "page-ready"
        );
    });
}
