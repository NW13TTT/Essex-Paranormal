/* =========================================================
   ESSEX PARANORMAL
   Main Website JavaScript
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

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


        /* Close menu when navigation link is selected */

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


        /* Close menu when clicking outside it */

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
       ACTIVE NAVIGATION LINK
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
       PAGE READY
       ===================================================== */

    document.body.classList.add("page-ready");

});
