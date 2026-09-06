/* =========================================================
   ESSEX PARANORMAL
   WEBSITE JAVASCRIPT
   CINEMATIC UI + EXISTING API CONNECTION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       CINEMATIC ENTRY
       ===================================================== */

    const entryScreen =
        document.querySelector("#entry-screen");


    if (entryScreen) {

        document.body.style.overflow = "hidden";

        let entryFinished = false;


        const finishEntry = () => {

            if (entryFinished) {
                return;
            }

            entryFinished = true;

            entryScreen.classList.add(
                "entry-finished"
            );

            document.body.style.overflow = "";

            setTimeout(() => {

                if (entryScreen) {
                    entryScreen.remove();
                }

            }, 850);

        };


        /*
         * Short premium cinematic introduction.
         * CSS controls the visual animation.
         * This timer simply releases the page.
         */

        const reducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;


        const introDuration =
            reducedMotion
                ? 700
                : 3000;


        setTimeout(
            finishEntry,
            introDuration
        );

    }



    /* =====================================================
       API
       ===================================================== */

    /*
     * IMPORTANT:
     * Keep this endpoint unchanged.
     *
     * The public website consumes published investigation
     * information through the existing API architecture.
     */

    const API_BASE = "/api";



    /* =====================================================
       MOBILE NAVIGATION
       ===================================================== */

    const menuToggle =
        document.querySelector(".menu-toggle");

    const navLinks =
        document.querySelector("#main-navigation");


    if (menuToggle && navLinks) {


        const closeMenu = () => {

            navLinks.classList.remove("open");

            menuToggle.classList.remove("open");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.setAttribute(
                "aria-label",
                "Open navigation menu"
            );

            document.body.classList.remove(
                "nav-open"
            );

        };


        const openMenu = () => {

            navLinks.classList.add("open");

            menuToggle.classList.add("open");

            menuToggle.setAttribute(
                "aria-expanded",
                "true"
            );

            menuToggle.setAttribute(
                "aria-label",
                "Close navigation menu"
            );

            document.body.classList.add(
                "nav-open"
            );

        };


        menuToggle.addEventListener(
            "click",
            () => {

                const isOpen =
                    navLinks.classList.contains(
                        "open"
                    );


                if (isOpen) {
                    closeMenu();
                } else {
                    openMenu();
                }

            }
        );


        navLinks
            .querySelectorAll("a")
            .forEach((link) => {

                link.addEventListener(
                    "click",
                    () => {

                        closeMenu();

                    }
                );

            });


        /*
         * Close the mobile navigation when the user
         * taps outside the menu.
         */

        document.addEventListener(
            "click",
            (event) => {

                if (
                    navLinks.classList.contains("open") &&
                    !navLinks.contains(event.target) &&
                    !menuToggle.contains(event.target)
                ) {

                    closeMenu();

                }

            }
        );


        /*
         * Escape key closes the menu.
         */

        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Escape" &&
                    navLinks.classList.contains("open")
                ) {

                    closeMenu();

                    menuToggle.focus();

                }

            }
        );

    }



    /* =====================================================
       SMOOTH SCROLL
       ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach((link) => {

            link.addEventListener(
                "click",
                (event) => {

                    const targetId =
                        link.getAttribute("href");


                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }


                    const target =
                        document.querySelector(
                            targetId
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior:
                            window.matchMedia(
                                "(prefers-reduced-motion: reduce)"
                            ).matches
                                ? "auto"
                                : "smooth",

                        block: "start"
                    });


                    /*
                     * Keep the URL hash useful for navigation,
                     * but do not cause a second jump.
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

                }
            );

        });



    /* =====================================================
       BACK TO TOP
       ===================================================== */

    const backToTop =
        document.querySelector(
            ".back-to-top"
        );


    if (backToTop) {


        const updateBackToTop = () => {

            if (window.scrollY > 600) {

                backToTop.classList.add(
                    "visible"
                );

                backToTop.style.pointerEvents =
                    "auto";

            } else {

                backToTop.classList.remove(
                    "visible"
                );

                backToTop.style.pointerEvents =
                    "none";

            }

        };


        updateBackToTop();


        window.addEventListener(
            "scroll",
            updateBackToTop,
            {
                passive: true
            }
        );


        backToTop.addEventListener(
            "click",
            (event) => {

                event.preventDefault();


                window.scrollTo({

                    top: 0,

                    behavior:
                        window.matchMedia(
                            "(prefers-reduced-motion: reduce)"
                        ).matches
                            ? "auto"
                            : "smooth"

                });

            }
        );

    }



    /* =====================================================
       HEADER SCROLL EFFECT
       ===================================================== */

    const header =
        document.querySelector(
            ".site-header"
        );


    if (header) {


        const updateHeader = () => {

            if (window.scrollY > 30) {

                header.classList.add(
                    "scrolled"
                );

            } else {

                header.classList.remove(
                    "scrolled"
                );

            }

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



    /* =====================================================
       ACTIVE NAVIGATION
       ===================================================== */

    const sections =
        document.querySelectorAll(
            "section[id]"
        );


    const navigationLinks =
        document.querySelectorAll(
            "#main-navigation a"
        );


    if (
        sections.length &&
        navigationLinks.length &&
        "IntersectionObserver" in window
    ) {


        const observer =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach(
                        (entry) => {

                            if (
                                !entry.isIntersecting
                            ) {
                                return;
                            }


                            navigationLinks
                                .forEach(
                                    (link) => {

                                        link.classList.remove(
                                            "active"
                                        );

                                    }
                                );


                            const activeLink =
                                document.querySelector(
                                    `#main-navigation a[href="#${entry.target.id}"]`
                                );


                            if (activeLink) {

                                activeLink.classList.add(
                                    "active"
                                );

                            }

                        }
                    );

                },
                {
                    rootMargin:
                        "-35% 0px -55% 0px",

                    threshold: 0
                }
            );


        sections.forEach(
            (section) => {

                observer.observe(
                    section
                );

            }
        );

    }



    /* =====================================================
       INVESTIGATIONS API
       ===================================================== */

    async function loadInvestigations() {

        const investigationContainer =
            document.querySelector(
                "#investigation-list"
            );


        if (!investigationContainer) {
            return;
        }


        try {

            /*
             * EXISTING API CONNECTION
             *
             * Do not replace this with a dummy data source.
             */

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
                    `API returned ${response.status}`
                );

            }


            const data =
                await response.json();


            if (
                !data.success ||
                !Array.isArray(
                    data.investigations
                )
            ) {

                throw new Error(
                    "Invalid investigation data"
                );

            }


            /*
             * No fake cases.
             *
             * If the API has no published investigations,
             * display an honest empty state.
             */

            if (
                data.investigations.length === 0
            ) {

                investigationContainer.innerHTML = `

                    <article class="empty-state">

                        <span class="empty-state-code">
                            INVESTIGATION ARCHIVE
                        </span>

                        <h3>
                            No published investigations yet.
                        </h3>

                        <p>
                            When an investigation is published
                            through the Essex Paranormal system,
                            its verified information will appear
                            here.
                        </p>

                        <span class="empty-state-status">
                            AWAITING PUBLISHED CASE DATA
                        </span>

                    </article>

                `;

                return;

            }


            investigationContainer.innerHTML =
                "";


            data.investigations.forEach(
                (investigation) => {


                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "investigation-card";


                    const dateText =
                        investigation.date
                            ? investigation.date
                            : "Date pending";


                    /*
                     * All API-controlled text is escaped
                     * before being inserted into HTML.
                     */

                    card.innerHTML = `

                        <div class="investigation-card-top">

                            <span class="investigation-id">
                                ${escapeHTML(
                                    investigation.id
                                )}
                            </span>

                            <span class="investigation-status">
                                ${escapeHTML(
                                    investigation.status
                                )}
                            </span>

                        </div>


                        <h3>
                            ${escapeHTML(
                                investigation.title
                            )}
                        </h3>


                        <div class="investigation-meta">

                            <span>

                                LOCATION

                                <strong>
                                    ${escapeHTML(
                                        investigation.location
                                    )}
                                </strong>

                            </span>


                            <span>

                                DATE

                                <strong>
                                    ${escapeHTML(
                                        dateText
                                    )}
                                </strong>

                            </span>

                        </div>


                        <p>
                            ${escapeHTML(
                                investigation.description
                            )}
                        </p>


                        <a
                            href="#case-files"
                            class="investigation-link"
                        >
                            VIEW CASE FILE
                        </a>

                    `;


                    investigationContainer.appendChild(
                        card
                    );

                }
            );


        } catch (error) {

            console.error(
                "Essex Paranormal API error:",
                error
            );


            /*
             * Fail safely.
             *
             * We do not invent investigations when the
             * existing API is unavailable.
             */

            investigationContainer.innerHTML = `

                <article class="empty-state">

                    <span class="empty-state-code">
                        INVESTIGATION ARCHIVE
                    </span>

                    <h3>
                        Investigation archive unavailable.
                    </h3>

                    <p>
                        Published investigation information
                        could not be retrieved right now.
                        Please try again later.
                    </p>

                    <span class="empty-state-status">
                        SYSTEM TEMPORARILY UNAVAILABLE
                    </span>

                </article>

            `;

        }

    }



    /* =====================================================
       HTML SAFETY
       ===================================================== */

    function escapeHTML(value) {

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



    /* =====================================================
       IMAGE ERROR CHECK
       ===================================================== */

    document
        .querySelectorAll("img")
        .forEach((image) => {

            image.addEventListener(
                "error",
                () => {

                    image.classList.add(
                        "image-error"
                    );


                    console.warn(
                        "Essex Paranormal image could not be loaded:",
                        image.getAttribute(
                            "src"
                        )
                    );

                }
            );

        });



    /* =====================================================
       CURRENT YEAR
       ===================================================== */

    document
        .querySelectorAll(
            "[data-current-year]"
        )
        .forEach((element) => {

            element.textContent =
                new Date().getFullYear();

        });



    /* =====================================================
       LOAD INVESTIGATIONS
       ===================================================== */

    loadInvestigations();



    /* =====================================================
       PAGE READY
       ===================================================== */

    requestAnimationFrame(() => {

        document.body.classList.add(
            "page-ready"
        );

    });

});
