"use strict";

/*
 * ESSEX PARANORMAL
 * Website correction layer
 *
 * This keeps the existing Essex Paranormal website behaviour
 * and applies the approved homepage corrections:
 *
 * - Construction banner
 * - HMP Ashwell homepage preview
 * - Correct Ashwell case-file link
 * - One Investigation Archive action
 * - Archive marked UNDER CONSTRUCTION
 * - Existing navigation retained
 */

const ORIGINAL_SCRIPT =
    "https://raw.githubusercontent.com/NW13TTT/Essex-Paranormal/3b895d72e334c5436a488b0b66250ec97fc3d0e9/script.js";

(function () {
    "use strict";

    /*
     * Load the original website JavaScript first.
     * This preserves the existing navigation, animations,
     * scrolling and other website behaviour.
     */
    const originalScript = document.createElement("script");

    originalScript.src = ORIGINAL_SCRIPT;
    originalScript.async = false;

    originalScript.onload = function () {
        document.dispatchEvent(
            new Event("EssexOriginalScriptLoaded")
        );
    };

    document.head.appendChild(originalScript);

    /*
     * Add the approved visual correction CSS.
     */
    function addCorrectionStyles() {
        if (document.getElementById("essex-paranormal-corrections")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "essex-paranormal-corrections";

        style.textContent = `
            /*
             * WEBSITE UNDER CONSTRUCTION TICKER
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
                animation: constructionTickerMove 24s linear infinite;
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

            /*
             * LEFT TO RIGHT
             */

            @keyframes constructionTickerMove {
                from {
                    transform: translateX(-50%);
                }

                to {
                    transform: translateX(0);
                }
            }

            /*
             * HMP ASHWELL HOMEPAGE PREVIEW
             */

            .ashwell-home-feature {
                display: grid !important;
                grid-template-columns:
                    minmax(0, .95fr)
                    minmax(0, 1.05fr) !important;

                overflow: hidden;

                border: 1px solid rgba(255,255,255,.10);

                background:
                    rgba(5,6,8,.62);

                box-shadow:
                    0 20px 70px rgba(0,0,0,.35);
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
                transform: scale(1.035);

                filter:
                    brightness(.94)
                    contrast(1.06);
            }

            /*
             * ARCHIVE STATUS
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

            .homepage-archive-status .empty-code {
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
             * MOBILE
             */

            @media (max-width: 900px) {

                .construction-ticker {
                    padding: 9px 0;
                }

                .construction-ticker-track span {
                    font-size: .62rem;
                    letter-spacing: .10em;
                    padding-right: 50px;
                }

                .ashwell-home-feature {
                    grid-template-columns: 1fr !important;
                }

                .ashwell-home-image {
                    min-height: 330px;
                    height: 330px;
                }

                .ashwell-home-image img {
                    min-height: 330px;
                }

                .homepage-archive-status {
                    margin-top: 20px;
                    padding: 22px 16px;
                }
            }

            /*
             * REDUCED MOTION
             */

            @media (prefers-reduced-motion: reduce) {

                .construction-ticker-track {
                    animation: none;
                }

                .ashwell-home-image img {
                    transition: none;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /*
     * Add construction banner.
     */
    function addConstructionBanner() {
        if (document.querySelector(".construction-ticker")) {
            return;
        }

        const header =
            document.querySelector(".site-header");

        if (!header) {
            return;
        }

        const ticker =
            document.createElement("div");

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

    /*
     * Create the HMP Ashwell homepage preview.
     */
    function addAshwellPreview() {
        const investigations =
            document.getElementById(
                "investigations"
            );

        if (!investigations) {
            return;
        }

        /*
         * Do not add it twice.
         */
        if (
            investigations.querySelector(
                ".ashwell-home-image"
            )
        ) {
            return;
        }

        /*
         * Find the existing investigation feature.
         */
        let feature =
            investigations.querySelector(
                ".investigation-feature"
            );

        /*
         * Fallback selectors in case the
         * existing HTML uses a different class.
         */
        if (!feature) {
            feature =
                investigations.querySelector(
                    "article"
                );
        }

        if (!feature) {
            return;
        }

        /*
         * Make the existing feature into
         * the two-column Ashwell preview.
         */
        feature.classList.add(
            "ashwell-home-feature"
        );

        /*
         * Create image link.
         */
        const imageLink =
            document.createElement("a");

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

    /*
     * Correct the homepage archive area.
     *
     * There must only be ONE archive action.
     */
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
            .forEach(function (element) {
                element.remove();
            });

        /*
         * Remove additional archive actions,
         * but keep the first actual archive link.
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
                .forEach(function (link) {

                    const parent =
                        link.closest(
                            ".archive-action, .investigation-archive-action"
                        );

                    if (parent) {
                        parent.remove();
                    } else {
                        link.remove();
                    }
                });
        }

        /*
         * If our corrected archive block already
         * exists, do nothing.
         */
        if (
            investigations.querySelector(
                ".homepage-archive-status"
            )
        ) {
            return;
        }

        /*
         * Locate the first valid archive button.
         */
        const archiveButton =
            investigations.querySelector(
                'a[href="/investigations/"]'
            );

        /*
         * Create one archive status panel.
         */
        const status =
            document.createElement("div");

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

            /*
             * Move the existing button into
             * the single archive status panel.
             */
            status.appendChild(
                archiveButton
            );

        } else {

            /*
             * Create the button if the old
             * homepage did not contain one.
             */
            const button =
                document.createElement("a");

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
         * Put the archive status after
         * the main Ashwell feature.
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

    /*
     * Correct the Ashwell case-file links.
     */
    function fixAshwellLinks() {
        const investigations =
            document.getElementById(
                "investigations"
            );

        if (!investigations) {
            return;
        }

        /*
         * Any link that visibly refers to the
         * Ashwell case should use the correct URL.
         */
        investigations
            .querySelectorAll("a")
            .forEach(function (link) {

                const text =
                    (
                        link.textContent || ""
                    ).toUpperCase();

                const aria =
                    (
                        link.getAttribute(
                            "aria-label"
                        ) || ""
                    ).toUpperCase();

                if (
                    text.includes("ASHWELL") ||
                    aria.includes("ASHWELL") ||
                    text.includes("CASE FILE")
                ) {
                    /*
                     * Do not touch the archive button.
                     */
                    if (
                        link.getAttribute(
                            "href"
                        ) === "/investigations/"
                    ) {
                        return;
                    }

                    link.href =
                        "/investigations/hmp-ashwell.html";
                }
            });
    }

    /*
     * Run all corrections.
     */
    function applyCorrections() {
        addCorrectionStyles();
        addConstructionBanner();
        addAshwellPreview();
        fixArchiveArea();
        fixAshwellLinks();
    }

    /*
     * DOM ready.
     */
    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                setTimeout(
                    applyCorrections,
                    50
                );
            }
        );

    } else {

        setTimeout(
            applyCorrections,
            50
        );
    }

    /*
     * Run again after the original
     * website JavaScript has loaded.
     */
    document.addEventListener(
        "EssexOriginalScriptLoaded",
        function () {

            setTimeout(
                applyCorrections,
                100
            );
        }
    );

})();
