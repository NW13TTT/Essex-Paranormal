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
    initInvestigations();
    initImageFallbacks();
    initCurrentYear();

    /*
     * IMPORTANT:
     * These corrections restore the original website
     * structure rather than creating a new design.
     */
    restoreOriginalInvestigationLayout();
    removeDuplicateArchive();
    removeDuplicateAshwellImage();
    ensureConstructionBanner();
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
        /* Ignore browser restriction. */
    }

    forceScrollTop();

    const reducedMotion =
        window.matchMedia &&
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    const displayTime =
        reducedMotion
            ? 700
            : 3000;


    /*
     * Normal cinematic exit.
     */

    window.setTimeout(() => {

        hideEntryScreen(
            entryScreen,
            reducedMotion
        );

    }, displayTime);


    /*
     * Emergency failsafe.
     *
     * The website MUST NEVER remain trapped
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
   FORCE TOP
   ========================================================= */

function forceScrollTop() {

    /*
     * Never destroy a deliberate section
     * link in the address bar.
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

                        let target;

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

                            behavior:
                                "smooth"

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
                window.scrollY > 40
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
            .map(
                (link) => {

                    const href =
                        link.getAttribute(
                            "href"
                        );

                    let section;

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
                window.innerHeight *
                0.32;

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

            links.forEach(
                (link) => {

                    link.classList.toggle(
                        "active",
                        link === current.link
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
   INVESTIGATION API
   ========================================================= */

async function initInvestigations() {

    const container =
        document.querySelector(
            "[data-investigations]"
        );

    /*
     * The homepage is STATIC.
     * Do not overwrite the homepage case card.
     */

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_BASE}/investigations`,
                {
                    headers: {
                        "Accept":
                            "application/json"
                    },
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        if (
            !data ||
            !Array.isArray(
                data.investigations
            )
        ) {

            throw new Error(
                "Invalid investigation data."
            );

        }

        renderInvestigations(
            container,
            data.investigations
        );

    } catch (error) {

        console.error(
            "Investigation archive error:",
            error
        );

        container.innerHTML = `

            <div class="empty-state">

                <span class="empty-code">
                    ARCHIVE STATUS
                </span>

                <h3>
                    INVESTIGATION ARCHIVE UNDER CONSTRUCTION
                </h3>

                <p>
                    New investigations will be published here
                    as they are completed and reviewed.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   RENDER INVESTIGATIONS
   ========================================================= */

function renderInvestigations(
    container,
    investigations
) {

    if (!investigations.length) {

        container.innerHTML = `

            <div class="empty-state">

                <span class="empty-code">
                    ARCHIVE STATUS
                </span>

                <h3>
                    INVESTIGATION ARCHIVE UNDER CONSTRUCTION
                </h3>

                <p>
                    New case files will be published here
                    as investigations are completed and reviewed.
                </p>

            </div>

        `;

        return;
    }

    container.innerHTML =
        investigations
            .map(
                renderInvestigation
            )
            .join("");

}


/* =========================================================
   RENDER INVESTIGATION
   ========================================================= */

function renderInvestigation(
    investigation
) {

    const title =
        investigation.title ||
        investigation.name ||
        "Investigation";

    const description =
        investigation.description ||
        investigation.summary ||
        "";

    const location =
        investigation.location ||
        "";

    return `

        <article class="investigation-card">

            <p class="eyebrow">
                INVESTIGATION
            </p>

            <h3>
                ${escapeHtml(title)}
            </h3>

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
                description
                    ? `
                        <p>
                            ${escapeHtml(description)}
                        </p>
                    `
                    : ""
            }

        </article>

    `;

}


/* =========================================================
   RESTORE ORIGINAL HOMEPAGE INVESTIGATION CARD
   =========================================================
   
   This is the important part.
   
   The current damaged homepage changed:
   
       investigation-feature
   
   into:
   
       ashwell-feature
   
   with a large injected image.
   
   We reverse that change here.
   ========================================================= */

function restoreOriginalInvestigationLayout() {

    const damagedFeature =
        document.querySelector(
            ".ashwell-feature"
        );

    if (!damagedFeature) {
        return;
    }


    /*
     * Remove the injected HMP image.
     */

    damagedFeature
        .querySelectorAll(
            ".ashwell-image"
        )
        .forEach(
            (image) => {

                image.remove();

            }
        );


    /*
     * Restore the original feature class.
     */

    damagedFeature.classList.remove(
        "ashwell-feature"
    );

    damagedFeature.classList.add(
        "investigation-feature"
    );


    /*
     * Restore original content class.
     */

    damagedFeature
        .querySelectorAll(
            ".ashwell-copy"
        )
        .forEach(
            (element) => {

                element.classList.remove(
                    "ashwell-copy"
                );

                element.classList.add(
                    "investigation-feature-content"
                );

            }
        );


    /*
     * Restore original location class.
     */

    damagedFeature
        .querySelectorAll(
            ".ashwell-location"
        )
        .forEach(
            (element) => {

                element.classList.remove(
                    "ashwell-location"
                );

                element.classList.add(
                    "investigation-feature-location"
                );

            }
        );


    /*
     * Restore original metadata class.
     */

    damagedFeature
        .querySelectorAll(
            ".ashwell-meta"
        )
        .forEach(
            (element) => {

                element.classList.remove(
                    "ashwell-meta"
                );

                element.classList.add(
                    "investigation-feature-meta"
                );

            }
        );

}


/* =========================================================
   REMOVE DUPLICATE ARCHIVE
   ========================================================= */

function removeDuplicateArchive() {

    const investigationSection =
        document.getElementById(
            "investigations"
        );

    if (!investigationSection) {
        return;
    }


    /*
     * Remove the old second archive block.
     */

    investigationSection
        .querySelectorAll(
            ".featured-investigation"
        )
        .forEach(
            (element) => {

                element.remove();

            }
        );


    /*
     * Remove any archive action created
     * by a previous correction layer.
     */

    investigationSection
        .querySelectorAll(
            ".homepage-archive-status"
        )
        .forEach(
            (element) => {

                element.remove();

            }
        );


    /*
     * There should now be exactly ONE
     * investigation archive action.
     */

    let archive =
        investigationSection.querySelector(
            ".investigation-archive-action"
        );


    if (!archive) {

        archive =
            document.createElement(
                "div"
            );

        archive.className =
            "investigation-archive-action";

        const feature =
            investigationSection.querySelector(
                ".investigation-feature"
            );

        if (feature) {

            feature.insertAdjacentElement(
                "afterend",
                archive
            );

        } else {

            investigationSection
                .querySelector(
                    ".container"
                )
                ?.appendChild(
                    archive
                );

        }

    }


    /*
     * Replace the inside of the archive
     * with ONE clean status and ONE button.
     */

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

}


/* =========================================================
   REMOVE DUPLICATE ASHWELL IMAGE
   =========================================================
   
   The HMP Ashwell case page currently contains:
   
   1. The correct hero image.
   2. A second identical image panel.
   
   We keep #1 and remove #2.
   ========================================================= */

function removeDuplicateAshwellImage() {

    const pathname =
        window.location.pathname
            .replace(/\/+$/, "");

    /*
     * Only run this on the HMP Ashwell
     * case page.
     */

    if (
        pathname !==
        "/investigations/hmp-ashwell"
    ) {
        return;
    }


    /*
     * Keep the case hero.
     */

    const hero =
        document.querySelector(
            ".case-hero-image"
        );


    /*
     * Find image panels containing the
     * same Ashwell photograph.
     */

    document
        .querySelectorAll(
            ".case-image-panel"
        )
        .forEach(
            (panel) => {

                const image =
                    panel.querySelector(
                        "img"
                    );

                if (!image) {
                    return;
                }

                const source =
                    image.getAttribute(
                        "src"
                    ) || "";

                if (
                    source
                        .toLowerCase()
                        .includes(
                            "hmp-ashwell"
                        )
                ) {

                    panel.remove();

                }

            }
        );


    /*
     * If there is another duplicate Ashwell
     * image outside the hero, remove it too.
     */

    let ashwellImages =
        Array.from(
            document.querySelectorAll(
                'img[src*="hmp-ashwell"]'
            )
        );


    if (
        hero &&
        ashwellImages.length > 1
    ) {

        ashwellImages
            .filter(
                (image) =>
                    image !== hero
            )
            .forEach(
                (image) => {

                    const panel =
                        image.closest(
                            ".case-image-panel"
                        );

                    if (panel) {

                        panel.remove();

                    } else {

                        image.remove();

                    }

                }
            );

    }

}


/* =========================================================
   CONSTRUCTION BANNER
   ========================================================= */

function ensureConstructionBanner() {

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


    /*
     * Only add the ticker CSS.
     * Do NOT alter the website's existing
     * visual design.
     */

    if (
        document.getElementById(
            "construction-ticker-style"
        )
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );

    style.id =
        "construction-ticker-style";

    style.textContent = `

        .construction-ticker {
            position: relative;
            z-index: 20;
            width: 100%;
            overflow: hidden;
            background: #050608;
            border-top:
                1px solid
                rgba(255,106,26,.25);
            border-bottom:
                1px solid
                rgba(255,106,26,.25);
            padding: 10px 0;
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
        }

        .construction-ticker-track span {
            display: block;
            flex-shrink: 0;
            padding-right: 70px;
            color: var(--white);
            font-family:
                "Barlow Condensed",
                sans-serif;
            font-size: .72rem;
            font-weight: 800;
            letter-spacing: .14em;
        }

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

        .investigation-archive-action {
            margin-top: 28px;
            padding: 28px;
            text-align: center;
            border:
                1px solid
                rgba(255,106,26,.18);
            background:
                rgba(5,6,8,.72);
        }

        .investigation-archive-action p {
            margin:
                9px 0 18px;
            color: var(--muted);
            font-size: 10px;
            font-weight: 800;
            letter-spacing: .16em;
        }

        .investigation-archive-action
        .empty-code {
            color: var(--orange);
        }

        #entry-screen.is-hidden {
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
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

                link.target =
                    "_blank";

                link.rel =
                    "noopener noreferrer";

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
                            "image-error"
                        );

                        image.onerror =
                            null;

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


    document
        .querySelectorAll(
            "#current-year, .current-year"
        )
        .forEach(
            (element) => {

                element.textContent =
                    year;

            }
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
   END
   ========================================================= */
