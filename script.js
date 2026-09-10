"use strict";

/* =========================================================
   ESSEX PARANORMAL
   COMPLETE WEBSITE SCRIPT
   SELF-CONTAINED STABLE VERSION
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
    initInvestigations();
    initImageFallbacks();
    initCurrentYear();
    initPageReady();

    /*
     * Apply website corrections after the original
     * page structure is available.
     */
    setTimeout(() => {
        applyWebsiteCorrections();
    }, 50);

});


/* =========================================================
   CINEMATIC ENTRY SCREEN
   =========================================================
   
   IMPORTANT:
   This is deliberately self-contained.
   
   There is NO external JavaScript dependency.
   
   A failsafe is also included so the website can
   never remain permanently trapped behind the
   cinematic entry screen because of a JavaScript
   timing problem.
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
        /* Continue normally. */
    }

    forceScrollTop();

    window.requestAnimationFrame(() => {
        forceScrollTop();
    });

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
     * Normal cinematic duration.
     */
    const displayTime =
        reducedMotion
            ? 700
            : 3000;

    /*
     * Normal exit.
     */
    window.setTimeout(() => {

        removeEntryScreen(
            entryScreen,
            reducedMotion
        );

    }, displayTime);

    /*
     * EMERGENCY FAILSAFE.
     *
     * If anything above fails, the website will
     * still become accessible.
     */
    window.setTimeout(() => {

        const currentEntryScreen =
            document.getElementById(
                "entry-screen"
            );

        if (currentEntryScreen) {

            currentEntryScreen.classList.add(
                "is-hidden"
            );

            window.setTimeout(() => {

                const screen =
                    document.getElementById(
                        "entry-screen"
                    );

                if (screen) {
                    screen.remove();
                }

                document.body.classList.remove(
                    "entry-active"
                );

            }, 900);

        }

    }, 5000);

}


/* =========================================================
   REMOVE ENTRY SCREEN
   ========================================================= */

function removeEntryScreen(
    entryScreen,
    reducedMotion
) {

    if (!entryScreen) {
        return;
    }

    entryScreen.classList.add(
        "is-hidden"
    );

    window.setTimeout(() => {

        if (entryScreen) {
            entryScreen.remove();
        }

        document.body.classList.remove(
            "entry-active"
        );

        forceScrollTop();

        window.requestAnimationFrame(() => {
            forceScrollTop();
        });

    }, reducedMotion ? 50 : 850);

}


/* =========================================================
   FORCE PAGE TO TOP
   ========================================================= */

function forceScrollTop() {

    /*
     * Do not interfere with genuine anchor
     * navigation to another section.
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


    /*
     * Close menu when a navigation link
     * is selected.
     */

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


    /*
     * Escape closes the menu.
     */

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


    /*
     * Reset mobile navigation when returning
     * to desktop width.
     */

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


/* =========================================================
   CLOSE MOBILE NAVIGATION
   ========================================================= */

function closeMobileNavigation() {

    const menuToggle =
        document.querySelector(
            ".menu-toggle"
        );

    const navigation =
        document.getElementById(
            "main-navigation"
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
   SMOOTH HASH NAVIGATION
   ========================================================= */

function initSmoothNavigation() {

    const links =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    links.forEach((link) => {

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

                const targetPosition =
                    target
                        .getBoundingClientRect()
                        .top +
                    window.scrollY -
                    headerHeight;

                window.scrollTo({

                    top:
                        Math.max(
                            0,
                            targetPosition
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
   HEADER SCROLL EFFECT
   ========================================================= */

function initHeaderScroll() {

    const header =
        document.querySelector(
            ".site-header"
        );

    if (!header) {
        return;
    }

    const updateHeader =
        () => {

            header.classList.toggle(
                "scrolled",
                window.scrollY > 40
            );

        };

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

    const navigation =
        document.getElementById(
            "main-navigation"
        );

    if (!navigation) {
        return;
    }

    const links =
        Array.from(
            navigation.querySelectorAll(
                'a[href^="#"]'
            )
        );

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

    const updateActiveNavigation =
        () => {

            const scrollPosition =
                window.scrollY +
                window.innerHeight * 0.32;

            let current =
                sections[0];

            sections.forEach(
                (item) => {

                    if (
                        item.section.offsetTop <=
                        scrollPosition
                    ) {

                        current =
                            item;

                    }

                }
            );

            links.forEach(
                (link) => {

                    link.classList.toggle(
                        "active",
                        link === current.link
                    );

                }
            );

        };

    updateActiveNavigation();

    window.addEventListener(
        "scroll",
        updateActiveNavigation,
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

    const updateVisibility =
        () => {

            const visible =
                window.scrollY > 600;

            buttons.forEach(
                (button) => {

                    button.style.opacity =
                        visible
                            ? "1"
                            : "0";

                    button.style.visibility =
                        visible
                            ? "visible"
                            : "hidden";

                    button.style.pointerEvents =
                        visible
                            ? "auto"
                            : "none";

                }
            );

        };

    updateVisibility();

    window.addEventListener(
        "scroll",
        updateVisibility,
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

                    try {

                        history.replaceState(
                            null,
                            "",
                            "#home"
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
   INVESTIGATIONS
   ========================================================= */

async function initInvestigations() {

    /*
     * The public archive is deliberately UNDER
     * CONSTRUCTION.
     *
     * Do not load API investigations onto the
     * archive page.
     */

    const pathname =
        window.location.pathname
            .replace(/\/+$/, "");

    if (
        pathname === "/investigations"
    ) {
        return;
    }

    const container =
        document.querySelector(
            "[data-investigations]"
        );

    if (!container) {
        return;
    }

    setInvestigationStatus(
        container,
        "LOADING INVESTIGATION ARCHIVE..."
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

                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                `Investigation request failed: ${response.status}`
            );

        }

        const data =
            await response.json();

        if (
            !data ||
            data.success !== true ||
            !Array.isArray(
                data.investigations
            )
        ) {

            throw new Error(
                "Invalid investigation response."
            );

        }

        renderInvestigations(
            container,
            data.investigations
        );

    } catch (error) {

        console.error(
            "Unable to load investigations:",
            error
        );

        renderInvestigationUnavailable(
            container
        );

    }

}


/* =========================================================
   INVESTIGATION STATUS
   ========================================================= */

function setInvestigationStatus(
    container,
    message
) {

    if (!container) {
        return;
    }

    container.innerHTML = `

        <div class="empty-state">

            <span class="empty-code">
                ARCHIVE
            </span>

            <h3>
                ${escapeHtml(message)}
            </h3>

            <p>
                Published investigations will appear here.
            </p>

            <span class="empty-status">
                ESSEX PARANORMAL
            </span>

        </div>

    `;

}


/* =========================================================
   RENDER INVESTIGATIONS
   ========================================================= */

function renderInvestigations(
    container,
    investigations
) {

    if (!container) {
        return;
    }

    if (!investigations.length) {

        container.innerHTML = `

            <div class="empty-state">

                <span class="empty-code">
                    ARCHIVE STATUS
                </span>

                <h3>
                    NO INVESTIGATIONS PUBLISHED YET
                </h3>

                <p>
                    The investigation archive is currently empty.
                    New investigations will appear here when
                    they are published.
                </p>

                <span class="empty-status">
                    CHECK BACK FOR FUTURE INVESTIGATIONS
                </span>

            </div>

        `;

        return;
    }

    container.innerHTML =
        investigations
            .map(
                renderInvestigationCard
            )
            .join("");

}


/* =========================================================
   RENDER SINGLE INVESTIGATION
   ========================================================= */

function renderInvestigationCard(
    investigation
) {

    const title =
        investigation.title ||
        investigation.name ||
        "Untitled Investigation";

    const description =
        investigation.description ||
        investigation.summary ||
        "Investigation information will be published here.";

    const location =
        investigation.location ||
        "";

    const date =
        investigation.date ||
        investigation.investigation_date ||
        "";

    const id =
        investigation.id ||
        "";

    const status =
        investigation.status ||
        "PUBLISHED";

    return `

        <article class="investigation-card">

            <div class="investigation-card-top">

                <span class="investigation-id">
                    ${escapeHtml(id)}
                </span>

                <span class="investigation-status">
                    ${escapeHtml(status)}
                </span>

            </div>

            <div class="investigation-card-content">

                <p class="eyebrow">
                    INVESTIGATION
                </p>

                <h3>
                    ${escapeHtml(title)}
                </h3>

                <p>
                    ${escapeHtml(description)}
                </p>

                ${
                    location
                        ? `
                            <span class="investigation-location">
                                ${escapeHtml(location)}
                            </span>
                        `
                        : ""
                }

                ${
                    date
                        ? `
                            <span class="investigation-date">
                                ${escapeHtml(date)}
                            </span>
                        `
                        : ""
                }

            </div>

        </article>

    `;

}


/* =========================================================
   INVESTIGATION UNAVAILABLE
   ========================================================= */

function renderInvestigationUnavailable(
    container
) {

    if (!container) {
        return;
    }

    container.innerHTML = `

        <div class="empty-state">

            <span class="empty-code">
                ARCHIVE STATUS
            </span>

            <h3>
                INVESTIGATION ARCHIVE UNDER CONSTRUCTION
            </h3>

            <p>
                New investigations, stories and evidence
                will be published here as they emerge.
            </p>

            <span class="empty-status">
                ESSEX PARANORMAL
            </span>

        </div>

    `;

}


/* =========================================================
   IMAGE FALLBACKS
   ========================================================= */

function initImageFallbacks() {

    const images =
        document.querySelectorAll(
            "img"
        );

    images.forEach(
        (image) => {

            image.addEventListener(
                "error",
                () => {

                    image.classList.add(
                        "image-error"
                    );

                    /*
                     * Do not repeatedly trigger
                     * the error handler.
                     */
                    image.onerror = null;

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
        new Date().getFullYear();

    document
        .querySelectorAll(
            "[data-current-year]"
        )
        .forEach(
            (element) => {

                element.textContent =
                    String(year);

            }
        );

    /*
     * Also support the common footer
     * year selector if present.
     */

    document
        .querySelectorAll(
            "#current-year, .current-year"
        )
        .forEach(
            (element) => {

                element.textContent =
                    String(year);

            }
        );

}


/* =========================================================
   PAGE READY
   ========================================================= */

function initPageReady() {

    document.body.classList.add(
        "page-ready"
    );

}


/* =========================================================
   WEBSITE CORRECTIONS
   ========================================================= */

function applyWebsiteCorrections() {

    /*
     * These functions preserve the approved
     * website changes without relying on another
     * JavaScript file.
     */

    addCorrectionStyles();
    addConstructionBanner();
    addAshwellPreview();
    fixArchiveArea();
    fixAshwellLinks();
    fixFacebookLinks();

}


/* =========================================================
   CORRECTION CSS
   ========================================================= */

function addCorrectionStyles() {

    if (
        document.getElementById(
            "essex-paranormal-corrections"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "essex-paranormal-corrections";

    style.textContent = `

        /*
         * =====================================================
         * ENTRY SCREEN FAILSAFE
         * =====================================================
         */

        #entry-screen {
            pointer-events: none;
        }

        #entry-screen.is-hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }


        /*
         * =====================================================
         * CONSTRUCTION TICKER
         * =====================================================
         */

        .construction-ticker {
            position: relative;
            z-index: 50;
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
            animation:
                constructionTickerMove
                24s
                linear
                infinite;
            will-change: transform;
        }

        .construction-ticker-track span {
            display: block;
            flex-shrink: 0;
            padding-right: 70px;
            color: #ffffff;
            font-family:
                "Barlow Condensed",
                sans-serif;
            font-size: .72rem;
            font-weight: 800;
            letter-spacing: .14em;
        }


        /*
         * LEFT TO RIGHT
         */

        @keyframes constructionTickerMove {

            from {
                transform:
                    translateX(-50%);
            }

            to {
                transform:
                    translateX(0);
            }

        }


        /*
         * =====================================================
         * HMP ASHWELL FEATURE
         * =====================================================
         */

        .ashwell-home-feature {
            display: grid !important;
            grid-template-columns:
                minmax(0, .95fr)
                minmax(0, 1.05fr) !important;
            overflow: hidden;
            border:
                1px solid
                rgba(255,255,255,.10);
            background:
                rgba(5,6,8,.62);
            box-shadow:
                0 20px 70px
                rgba(0,0,0,.35);
        }

        .ashwell-home-image {
            display: block;
            position: relative;
            overflow: hidden;
            min-height: 500px;
            background: #000;
        }

        .ashwell-home-image img {
            display: block;
            width: 100%;
            height: 100%;
            min-height: 500px;
            object-fit: cover;
            object-position: center;
            filter:
                brightness(.82)
                contrast(1.06);
            transition:
                transform .7s ease,
                filter .7s ease;
        }

        .ashwell-home-image:hover img {
            transform:
                scale(1.035);
            filter:
                brightness(.94)
                contrast(1.06);
        }


        /*
         * =====================================================
         * ARCHIVE STATUS
         * =====================================================
         */

        .homepage-archive-status {
            margin-top: 28px;
            padding: 28px;
            text-align: center;
            border:
                1px solid
                rgba(255,106,26,.18);
            background:
                rgba(5,6,8,.82);
        }

        .homepage-archive-status
        .empty-code {
            color: #ff6a1a;
        }

        .homepage-archive-status p {
            margin:
                9px 0 18px;
            color: #999;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .16em;
        }


        /*
         * =====================================================
         * ASHWELL CASE IMAGE
         * =====================================================
         */

        .ashwell-home-image::after {
            content:
                "HMP ASHWELL • CASE EP-001";
            position: absolute;
            left: 18px;
            bottom: 18px;
            padding:
                7px 10px;
            background:
                rgba(0,0,0,.72);
            border:
                1px solid
                rgba(255,106,26,.35);
            color:
                #ffffff;
            font-family:
                "Barlow Condensed",
                sans-serif;
            font-size:
                .68rem;
            font-weight:
                800;
            letter-spacing:
                .12em;
            pointer-events:
                none;
        }


        /*
         * =====================================================
         * MOBILE
         * =====================================================
         */

        @media (max-width: 900px) {

            .construction-ticker {
                padding:
                    9px 0;
            }

            .construction-ticker-track span {
                font-size:
                    .62rem;
                letter-spacing:
                    .10em;
                padding-right:
                    50px;
            }

            .ashwell-home-feature {
                grid-template-columns:
                    1fr !important;
            }

            .ashwell-home-image {
                min-height:
                    330px;
                height:
                    330px;
            }

            .ashwell-home-image img {
                min-height:
                    330px;
            }

            .homepage-archive-status {
                margin-top:
                    20px;
                padding:
                    22px 16px;
            }

        }


        /*
         * =====================================================
         * REDUCED MOTION
         * =====================================================
         */

        @media (prefers-reduced-motion: reduce) {

            .construction-ticker-track {
                animation:
                    none;
            }

            .ashwell-home-image img {
                transition:
                    none;
            }

        }

    `;

    document.head.appendChild(
        style
    );

}


/* =========================================================
   CONSTRUCTION BANNER
   ========================================================= */

function addConstructionBanner() {

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

}


/* =========================================================
   HMP ASHWELL HOMEPAGE PREVIEW
   ========================================================= */

function addAshwellPreview() {

    const investigations =
        document.getElementById(
            "investigations"
        );

    if (!investigations) {
        return;
    }

    if (
        investigations.querySelector(
            ".ashwell-home-image"
        )
    ) {
        return;
    }

    let feature =
        investigations.querySelector(
            ".investigation-feature"
        );

    if (!feature) {

        feature =
            investigations.querySelector(
                "article"
            );

    }

    if (!feature) {
        return;
    }

    feature.classList.add(
        "ashwell-home-feature"
    );

    const imageLink =
        document.createElement(
            "a"
        );

    imageLink.href =
        "/investigations/hmp-ashwell.html";

    imageLink.className =
        "ashwell-home-image";

    imageLink.setAttribute(
        "aria-label",
        "View HMP Ashwell case file"
    );

    imageLink.innerHTML = `

        <img
            src="/hmp-ashwell.PNG"
            alt="HMP Ashwell investigation"
            loading="lazy"
            decoding="async"
        >

    `;

    feature.insertBefore(
        imageLink,
        feature.firstChild
    );

}


/* =========================================================
   FIX ARCHIVE AREA
   =========================================================
   
   HOMEPAGE:
   ONE archive action only.
   
   ARCHIVE PAGE:
   left under construction.
   ========================================================= */

function fixArchiveArea() {

    const investigations =
        document.getElementById(
            "investigations"
        );

    if (!investigations) {
        return;
    }

    /*
     * Remove old duplicate archive blocks.
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


    /*
     * Remove duplicate archive links.
     */

    const archiveLinks =
        Array.from(
            investigations.querySelectorAll(
                'a[href="/investigations/"]'
            )
        );


    if (
        archiveLinks.length > 1
    ) {

        archiveLinks
            .slice(1)
            .forEach(
                (link) => {

                    const parent =
                        link.closest(
                            ".archive-action, .investigation-archive-action, .homepage-archive-status"
                        );

                    if (parent) {
                        parent.remove();
                    } else {
                        link.remove();
                    }

                }
            );

    }


    /*
     * If the corrected archive block already
     * exists, stop.
     */

    if (
        investigations.querySelector(
            ".homepage-archive-status"
        )
    ) {
        return;
    }


    /*
     * Find the one remaining archive link.
     */

    const archiveButton =
        investigations.querySelector(
            'a[href="/investigations/"]'
        );


    /*
     * Create the single archive status panel.
     */

    const status =
        document.createElement(
            "div"
        );

    status.className =
        "homepage-archive-status";

    status.innerHTML = `

        <span class="empty-code">
            ARCHIVE STATUS
        </span>

        <p>
            INVESTIGATION ARCHIVE UNDER CONSTRUCTION
        </p>

    `;


    if (archiveButton) {

        status.appendChild(
            archiveButton
        );

    } else {

        const button =
            document.createElement(
                "a"
            );

        button.href =
            "/investigations/";

        button.className =
            "button button-outline";

        button.innerHTML = `
            VIEW INVESTIGATION ARCHIVE
            <span>→</span>
        `;

        status.appendChild(
            button
        );

    }


    /*
     * Place it underneath the Ashwell feature.
     */

    const feature =
        investigations.querySelector(
            ".ashwell-home-feature"
        );

    if (feature) {

        feature.insertAdjacentElement(
            "afterend",
            status
        );

    } else {

        investigations.appendChild(
            status
        );

    }

}


/* =========================================================
   ASHWELL LINKS
   ========================================================= */

function fixAshwellLinks() {

    document
        .querySelectorAll(
            "a"
        )
        .forEach(
            (link) => {

                const text =
                    (
                        link.textContent ||
                        ""
                    ).toUpperCase();

                const aria =
                    (
                        link.getAttribute(
                            "aria-label"
                        ) ||
                        ""
                    ).toUpperCase();

                const href =
                    link.getAttribute(
                        "href"
                    ) || "";


                /*
                 * Do not change the investigation
                 * archive link.
                 */

                if (
                    href ===
                    "/investigations/"
                ) {
                    return;
                }


                /*
                 * Only change links that clearly
                 * refer to HMP Ashwell.
                 */

                if (
                    text.includes(
                        "ASHWELL"
                    ) ||
                    aria.includes(
                        "ASHWELL"
                    )
                ) {

                    link.href =
                        "/investigations/hmp-ashwell.html";

                }

            }
        );

}


/* =========================================================
   FACEBOOK
   ========================================================= */

function fixFacebookLinks() {

    const facebookURL =
        "https://www.facebook.com/share/g/1DWrfynuJ4/?mibextid=wwXIfr";


    /*
     * Find Facebook links already present.
     */

    document
        .querySelectorAll(
            'a[href*="facebook.com"]'
        )
        .forEach(
            (link) => {

                link.href =
                    facebookURL;

                link.target =
                    "_blank";

                link.rel =
                    "noopener noreferrer";

            }
        );


    /*
     * If there is a social-media section but
     * no Facebook link, add one.
     */

    const socialSection =
        document.querySelector(
            "#social-media, #social, .social-media, .social-section"
        );

    if (!socialSection) {
        return;
    }


    if (
        socialSection.querySelector(
            'a[href*="facebook.com"]'
        )
    ) {
        return;
    }


    /*
     * Do not create a duplicate if the page
     * already contains Facebook text.
     */

    if (
        socialSection.textContent
            .toUpperCase()
            .includes(
                "FACEBOOK"
            )
    ) {
        return;
    }


    const facebook =
        document.createElement(
            "a"
        );

    facebook.href =
        facebookURL;

    facebook.target =
        "_blank";

    facebook.rel =
        "noopener noreferrer";

    facebook.className =
        "social-button";

    facebook.setAttribute(
        "aria-label",
        "Essex Paranormal on Facebook"
    );

    facebook.innerHTML = `

        <span class="social-platform">
            FACEBOOK
        </span>

        <h3>
            ESSEX PARANORMAL
        </h3>

        <span class="social-handle">
            JOIN THE COMMUNITY
        </span>

    `;

    socialSection.appendChild(
        facebook
    );

}


/* =========================================================
   HTML ESCAPING
   ========================================================= */

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   GLOBAL EMERGENCY ENTRY FAILSAFE
   =========================================================
   
   This runs independently of DOMContentLoaded.
   
   If the entry screen exists and for any reason
   the normal startup sequence did not remove it,
   this guarantees that it cannot block the website
   indefinitely.
   ========================================================= */

(function emergencyEntryFailsafe() {

    function unlockWebsite() {

        const entry =
            document.getElementById(
                "entry-screen"
            );

        if (!entry) {
            return;
        }

        entry.classList.add(
            "is-hidden"
        );

        entry.style.pointerEvents =
            "none";

        entry.style.visibility =
            "hidden";

        window.setTimeout(() => {

            const current =
                document.getElementById(
                    "entry-screen"
                );

            if (current) {
                current.remove();
            }

        }, 1000);

    }


    /*
     * Give the cinematic intro time to play,
     * but never allow it to trap the visitor.
     */

    window.setTimeout(
        unlockWebsite,
        5200
    );

})();


/* =========================================================
   END OF ESSEX PARANORMAL SCRIPT
   ========================================================= */
