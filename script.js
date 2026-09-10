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

    const displayTime =
        reducedMotion
            ? 700
            : 3000;


    window.setTimeout(() => {

        hideEntryScreen(
            entryScreen,
            reducedMotion
        );

    }, displayTime);


    /*
     * Emergency failsafe.
     *
     * The website must never remain trapped
     * behind the entry screen.
     */

    window.setTimeout(() => {

        const current =
            document.getElementById(
                "entry-screen"
            );

        if (!current) {
            return;
        }

        current.classList.add(
            "is-hidden"
        );

        current.style.opacity =
            "0";

        current.style.visibility =
            "hidden";

        current.style.pointerEvents =
            "none";

        window.setTimeout(() => {

            const screen =
                document.getElementById(
                    "entry-screen"
                );

            if (screen) {
                screen.remove();
            }

        }, 1000);

    }, 5000);

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

    entryScreen.style.pointerEvents =
        "none";

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

        window.scrollTo(
            0,
            0
        );

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
        .forEach(
            (link) => {

                link.addEventListener(
                    "click",
                    () => {

                        closeMobileNavigation();

                    }
                );

            }
        );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                closeMobileNavigation();

            }

        }
    );


    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 900
            ) {

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
        .forEach(
            (link) => {

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

                            top:
                                Math.max(
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

            }
        );

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

    const update =
        () => {

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
            .map(
                (link) => {

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

                }
            )
            .filter(Boolean);

    if (!sections.length) {
        return;
    }


    const update =
        () => {

            const position =
                window.scrollY +
                window.innerHeight * 0.32;

            let current =
                sections[0];

            sections.forEach(
                (item) => {

                    if (
                        item.section.offsetTop <=
                        position
                    ) {

                        current =
                            item;

                    }

                }
            );


            sections.forEach(
                (item) => {

                    item.link.classList.toggle(
                        "active",
                        item === current
                    );

                }
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


    const update =
        () => {

            const visible =
                window.scrollY > 600;

            buttons.forEach(
                (button) => {

                    button.classList.toggle(
                        "visible",
                        visible
                    );

                }
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


    buttons.forEach(
        (button) => {

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

        }
    );

}


/* =========================================================
   IMAGE FALLBACKS
   ========================================================= */

function initImageFallbacks() {

    document
        .querySelectorAll(
            "img"
        )
        .forEach(
            (image) => {

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

            }
        );

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
        .forEach(
            (element) => {

                element.textContent =
                    year;

            }
        );

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
            border-top: 1px solid rgba(255,106,26,.25);
            border-bottom: 1px solid rgba(255,106,26,.25);
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

    document.head.appendChild(
        style
    );

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
     * IMPORTANT:
     *
     * Do NOT remove the HMP Ashwell image.
     * Do NOT rename the Ashwell feature.
     * Do NOT replace the investigation card.
     */


    /*
     * Remove obsolete archive blocks that were
     * injected by previous correction scripts.
     */

    investigations
        .querySelectorAll(
            ".investigation-archive-action"
        )
        .forEach(
            (element) => {

                element.remove();

            }
        );


    investigations
        .querySelectorAll(
            ".featured-investigation"
        )
        .forEach(
            (element) => {

                element.remove();

            }
        );


    investigations
        .querySelectorAll(
            ".homepage-archive-status"
        )
        .forEach(
            (element) => {

                element.remove();

            }
        );


    /*
     * Keep exactly ONE existing archive-action.
     */

    const archiveBlocks =
        Array.from(
            investigations.querySelectorAll(
                ".archive-action"
            )
        );


    if (archiveBlocks.length > 1) {

        archiveBlocks
            .slice(1)
            .forEach(
                (element) => {

                    element.remove();

                }
            );

    }


    let archive =
        investigations.querySelector(
            ".archive-action"
        );


    /*
     * If the existing homepage has no archive
     * action at all, create exactly one.
     */

    if (!archive) {

        archive =
            document.createElement(
                "div"
            );

        archive.className =
            "archive-action";

        archive.innerHTML = `
            <span class="empty-code">
                ARCHIVE STATUS
            </span>

            <p>
                INVESTIGATION ARCHIVE UNDER CONSTRUCTION
            </p>

            <a
                href="/investigations/"
                class="button button-outline"
            >
                VIEW INVESTIGATION ARCHIVE
                <span>→</span>
            </a>
        `;


        const feature =
            investigations.querySelector(
                ".ashwell-feature, .investigation-feature"
            );

        if (feature) {

            feature.insertAdjacentElement(
                "afterend",
                archive
            );

        } else {

            investigations
                .querySelector(
                    ".container"
                )
                ?.appendChild(
                    archive
                );

        }

    }


    /*
     * Make sure the single archive block
     * has the correct wording.
     */

    const status =
        archive.querySelector(
            ".empty-code"
        );

    if (status) {

        status.textContent =
            "ARCHIVE STATUS";

    }


    const paragraph =
        archive.querySelector(
            "p"
        );

    if (paragraph) {

        paragraph.textContent =
            "INVESTIGATION ARCHIVE UNDER CONSTRUCTION";

    }


    const button =
        archive.querySelector(
            "a.button"
        );

    if (button) {

        button.href =
            "/investigations/";

        button.innerHTML =
            `
                VIEW INVESTIGATION ARCHIVE
                <span>→</span>
            `;

    }

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

    document.head.appendChild(
        style
    );

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
        .forEach(
            (link) => {

                link.href =
                    facebookURL;

            }
        );

}
