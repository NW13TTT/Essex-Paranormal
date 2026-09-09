"use strict";


/* =========================================================
   ESSEX PARANORMAL
   COMPLETE PUBLIC WEBSITE SCRIPT
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

});


/* =========================================================
   CINEMATIC ENTRY
   ========================================================= */

function initEntryScreen() {

    const entryScreen =
        document.getElementById("entry-screen");


    if (!entryScreen) {
        return;
    }


    /*
     * Prevent the browser from restoring an
     * old scroll position while the cinematic
     * introduction is being displayed.
     */

    try {

        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }

    } catch (error) {

        /*
         * Continue normally if the browser does
         * not allow scrollRestoration to be changed.
         */

    }


    forceScrollTop();


    window.requestAnimationFrame(() => {
        forceScrollTop();
    });


    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    /*
     * Normal cinematic duration.
     * Reduced-motion users receive a shorter
     * introduction.
     */

    const displayTime =
        reducedMotion
            ? 700
            : 3000;


    window.setTimeout(() => {

        entryScreen.classList.add(
            "is-hidden"
        );


        window.setTimeout(() => {

            if (entryScreen) {
                entryScreen.remove();
            }


            forceScrollTop();


            window.requestAnimationFrame(() => {
                forceScrollTop();
            });

        }, reducedMotion ? 50 : 850);

    }, displayTime);

}


/* =========================================================
   FORCE PAGE TO HOME TOP
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


    window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto"
    });

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
     * Close navigation after selecting
     * a navigation link.
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
     * Escape closes the mobile menu.
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
     * Reset the mobile menu when returning
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


                /*
                 * Update the address bar without
                 * creating another history entry.
                 */

                try {

                    history.replaceState(
                        null,
                        "",
                        href
                    );

                } catch (error) {

                    /*
                     * Ignore history errors.
                     */

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

                        /*
                         * Ignore history errors.
                         */

                    }

                }
            );

        }
    );

}


/* =========================================================
   INVESTIGATIONS
   =========================================================
   
   The homepage can contain a static featured
   investigation without being overwritten.

   The API is only used when an element with
   [data-investigations] exists.

   This means:
   - Homepage featured case remains intact.
   - Investigation archive can still use the API.
   - Future investigations can be added safely.
   ========================================================= */

async function initInvestigations() {

    const container =
        document.querySelector(
            "[data-investigations]"
        );


    /*
     * No API container on this page.
     * Nothing needs to be loaded.
     */

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
                    location || date
                        ? `

                            <div class="investigation-card-meta">

                                ${
                                    location
                                        ? `
                                            <span>
                                                ${escapeHtml(location)}
                                            </span>
                                        `
                                        : ""
                                }


                                ${
                                    date
                                        ? `
                                            <span>
                                                ${escapeHtml(date)}
                                            </span>
                                        `
                                        : ""
                                }

                            </div>

                        `
                        : ""
                }

            </div>

        </article>

    `;

}


/* =========================================================
   INVESTIGATION API UNAVAILABLE
   ========================================================= */

function renderInvestigationUnavailable(
    container
) {

    container.innerHTML = `

        <div class="empty-state">

            <span class="empty-code">
                ARCHIVE STATUS
            </span>

            <h3>
                INVESTIGATION ARCHIVE TEMPORARILY UNAVAILABLE
            </h3>

            <p>
                The archive could not be loaded right now.
                Please try again later.
            </p>

            <span class="empty-status">
                NO UNPUBLISHED CONTENT HAS BEEN INVENTED
            </span>

        </div>

    `;

}


/* =========================================================
   HTML SAFETY
   ========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
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
                     * Record that the image failed
                     * without attempting to replace
                     * the supplied image automatically.
                     */

                    image.dataset.fallbackApplied =
                        "true";


                    console.warn(
                        "Essex Paranormal image could not be loaded:",
                        image.getAttribute(
                            "src"
                        )
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

    document
        .querySelectorAll(
            "[data-current-year]"
        )
        .forEach(
            (element) => {

                element.textContent =
                    new Date().getFullYear();

            }
        );

}


/* =========================================================
   PAGE READY
   ========================================================= */

function initPageReady() {

    /*
     * Allow the CSS to reveal the page once
     * the initial JavaScript setup has completed.
     */

    requestAnimationFrame(() => {

        document.body.classList.add(
            "page-ready"
        );

    });

}
