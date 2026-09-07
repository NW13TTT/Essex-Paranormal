"use strict";


/* =========================================================
   ESSEX PARANORMAL
   PUBLIC WEBSITE SCRIPT
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
   =========================================================
   The approved cinematic itself is not changed.

   When it finishes:
   1. The intro fades.
   2. It is removed.
   3. The page is forced back to the top of Home.
   ========================================================= */

function initEntryScreen() {
    const entryScreen = document.getElementById("entry-screen");

    if (!entryScreen) {
        return;
    }


    /*
     * Stop the browser restoring an old scroll position
     * after returning to the page.
     */

    try {
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }
    } catch (error) {
        /*
         * Continue normally if the browser does not allow
         * scrollRestoration to be changed.
         */
    }


    /*
     * Immediately establish Home as the starting position.
     */

    forceScrollTop();


    /*
     * Give the browser one frame to apply the position.
     */

    window.requestAnimationFrame(() => {
        forceScrollTop();
    });


    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /*
     * Keep the existing cinematic timing.
     */

    const displayTime = reducedMotion ? 700 : 3000;


    window.setTimeout(() => {

        entryScreen.classList.add("is-hidden");


        window.setTimeout(() => {

            entryScreen.remove();


            /*
             * Final safety check.
             * Home is always where the visitor lands
             * after the cinematic.
             */

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
        document.querySelector(".menu-toggle");

    const navigation =
        document.getElementById("main-navigation");


    if (!menuToggle || !navigation) {
        return;
    }


    menuToggle.addEventListener("click", () => {

        const isOpen =
            navigation.classList.toggle("open");


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

    });


    /*
     * Close the menu after selecting a navigation link.
     */

    navigation
        .querySelectorAll("a")
        .forEach((link) => {

            link.addEventListener("click", () => {
                closeMobileNavigation();
            });

        });


    /*
     * Escape key closes the mobile navigation.
     */

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {
            closeMobileNavigation();
        }

    });


    /*
     * If the browser is resized back to desktop,
     * make sure the mobile menu is reset.
     */

    window.addEventListener("resize", () => {

        if (window.innerWidth > 900) {
            closeMobileNavigation();
        }

    });

}


/* =========================================================
   CLOSE MOBILE NAVIGATION
   ========================================================= */

function closeMobileNavigation() {

    const menuToggle =
        document.querySelector(".menu-toggle");

    const navigation =
        document.getElementById("main-navigation");


    if (navigation) {
        navigation.classList.remove("open");
    }


    if (menuToggle) {

        menuToggle.classList.remove("open");

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

        link.addEventListener("click", (event) => {

            const href =
                link.getAttribute("href");


            if (
                !href ||
                href === "#" ||
                href === "#!"
            ) {
                return;
            }


            const target =
                document.querySelector(href);


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
             * creating another browser-history entry.
             */

            try {

                history.replaceState(
                    null,
                    "",
                    href
                );

            } catch (error) {
                /*
                 * Ignore browsers that prevent
                 * history manipulation.
                 */
            }

        });

    });

}


/* =========================================================
   HEADER SCROLL EFFECT
   ========================================================= */

function initHeaderScroll() {

    const header =
        document.querySelector(".site-header");


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
                    link.getAttribute("href");


                const section =
                    document.querySelector(href);


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


            sections.forEach((item) => {

                if (
                    item.section.offsetTop <=
                    scrollPosition
                ) {
                    current = item;
                }

            });


            links.forEach((link) => {

                link.classList.toggle(
                    "active",
                    link === current.link
                );

            });

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

    });

}


/* =========================================================
   INVESTIGATIONS
   ========================================================= */

async function initInvestigations() {

    const container =
        document.querySelector(
            "[data-investigations]"
        );


    if (!container) {
        return;
    }


    /*
     * Never invent investigation records.
     * The public website only displays data
     * actually published by the Control Room API.
     */

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


    return `
        <article class="investigation-card">

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
   IMAGE FALLBACKS
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

                image.classList.add(
                    "image-error"
                );


                /*
                 * Do not repeatedly trigger the
                 * error handler if a fallback is
                 * already being attempted.
                 */

                if (
                    image.dataset.fallbackApplied ===
                    "true"
                ) {
                    return;
                }


                image.dataset.fallbackApplied =
                    "true";

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

            element.textContent =
                year;

        });

}


/* =========================================================
   PAGE READY
   ========================================================= */

function initPageReady() {

    requestAnimationFrame(() => {

        document.documentElement.classList.add(
            "page-ready"
        );

        document.body.classList.add(
            "page-ready"
        );

    });

}


/* =========================================================
   SAFE HTML
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
