/* =========================================================
   ESSEX PARANORMAL
   Website JavaScript + Control Room API Connection
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       API
       ===================================================== */

    const API_BASE = "/api";


    /* =====================================================
       MOBILE NAVIGATION
       ===================================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector("#main-navigation");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            const isOpen = navLinks.classList.toggle("open");

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            menuToggle.setAttribute(
                "aria-label",
                isOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
            );

        });


        navLinks.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );

            });

        });


        document.addEventListener("click", (event) => {

            if (
                navLinks.classList.contains("open") &&
                !navLinks.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {

                navLinks.classList.remove("open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );

            }

        });

    }


    /* =====================================================
       SMOOTH SCROLL
       ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") {
                return;
            }

            const target = document.querySelector(targetId);

            if (!target) {
                return;
            }

            event.preventDefault();

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    /* =====================================================
       BACK TO TOP
       ===================================================== */

    const backToTop = document.querySelector(".back-to-top");

    if (backToTop) {

        const updateBackToTop = () => {

            if (window.scrollY > 600) {

                backToTop.style.opacity = "1";
                backToTop.style.visibility = "visible";
                backToTop.style.pointerEvents = "auto";

            } else {

                backToTop.style.opacity = "0";
                backToTop.style.visibility = "hidden";
                backToTop.style.pointerEvents = "none";

            }

        };

        updateBackToTop();

        window.addEventListener(
            "scroll",
            updateBackToTop,
            { passive: true }
        );


        backToTop.addEventListener("click", (event) => {

            event.preventDefault();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }


    /* =====================================================
       HEADER SCROLL EFFECT
       ===================================================== */

    const header = document.querySelector(".site-header");

    if (header) {

        const updateHeader = () => {

            if (window.scrollY > 30) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }

        };

        updateHeader();

        window.addEventListener(
            "scroll",
            updateHeader,
            { passive: true }
        );

    }


    /* =====================================================
       ACTIVE NAVIGATION
       ===================================================== */

    const sections = document.querySelectorAll("section[id]");
    const navigationLinks =
        document.querySelectorAll("#main-navigation a");

    if (sections.length && navigationLinks.length) {

        const observer = new IntersectionObserver(
            (entries) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) {
                        return;
                    }

                    navigationLinks.forEach((link) => {
                        link.classList.remove("active");
                    });

                    const activeLink =
                        document.querySelector(
                            `#main-navigation a[href="#${entry.target.id}"]`
                        );

                    if (activeLink) {
                        activeLink.classList.add("active");
                    }

                });

            },
            {
                rootMargin: "-35% 0px -55% 0px",
                threshold: 0
            }
        );

        sections.forEach((section) => {
            observer.observe(section);
        });

    }


    /* =====================================================
       CONTROL ROOM API
       ===================================================== */

    async function loadInvestigations() {

        const investigationContainer =
            document.querySelector("#investigation-list");

        if (!investigationContainer) {
            return;
        }

        try {

            const response =
                await fetch(`${API_BASE}/investigations`);

            if (!response.ok) {
                throw new Error(
                    `API returned ${response.status}`
                );
            }

            const data = await response.json();

            if (
                !data.success ||
                !Array.isArray(data.investigations)
            ) {
                throw new Error(
                    "Invalid investigation data"
                );
            }

            investigationContainer.innerHTML = "";


            data.investigations.forEach((investigation) => {

                const card =
                    document.createElement("article");

                card.className = "investigation-card";


                const dateText =
                    investigation.date
                        ? investigation.date
                        : "Date pending";


                card.innerHTML = `
                    <div class="investigation-card-top">

                        <span class="investigation-id">
                            ${escapeHTML(investigation.id)}
                        </span>

                        <span class="investigation-status">
                            ${escapeHTML(investigation.status)}
                        </span>

                    </div>

                    <h3>
                        ${escapeHTML(investigation.title)}
                    </h3>

                    <div class="investigation-meta">

                        <span>
                            LOCATION
                            <strong>
                                ${escapeHTML(investigation.location)}
                            </strong>
                        </span>

                        <span>
                            DATE
                            <strong>
                                ${escapeHTML(dateText)}
                            </strong>
                        </span>

                    </div>

                    <p>
                        ${escapeHTML(investigation.description)}
                    </p>

                    <a
                        href="#case-files"
                        class="investigation-link"
                    >
                        VIEW CASE FILE
                    </a>
                `;


                investigationContainer.appendChild(card);

            });


        } catch (error) {

            console.error(
                "Essex Paranormal API error:",
                error
            );

            investigationContainer.innerHTML = `
                <div class="api-error">
                    <strong>INVESTIGATION ARCHIVE TEMPORARILY UNAVAILABLE</strong>
                    <span>Please check back shortly.</span>
                </div>
            `;

        }

    }


    /* =====================================================
       HTML SAFETY
       ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       IMAGE LOAD CHECK
       ===================================================== */

    document.querySelectorAll("img").forEach((image) => {

        image.addEventListener("error", () => {

            image.classList.add("image-error");

            console.warn(
                "Essex Paranormal image could not be loaded:",
                image.getAttribute("src")
            );

        });

    });


    /* =====================================================
       PLACEHOLDER SOCIAL LINKS
       ===================================================== */

    document
        .querySelectorAll('[data-placeholder="true"]')
        .forEach((link) => {

            link.addEventListener("click", (event) => {

                event.preventDefault();

                alert(
                    "This Essex Paranormal social-media link has not been connected yet."
                );

            });

        });


    /* =====================================================
       CURRENT YEAR
       ===================================================== */

    document
        .querySelectorAll("[data-current-year]")
        .forEach((element) => {

            element.textContent =
                new Date().getFullYear();

        });


    /* =====================================================
       LOAD CONTROL ROOM DATA
       ===================================================== */

    loadInvestigations();


    /* =====================================================
       PAGE READY
       ===================================================== */

    document.body.classList.add("page-ready");

});
