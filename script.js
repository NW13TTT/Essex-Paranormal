// =========================================
// ESSEX PARANORMAL
// Main website JavaScript
// =========================================


// MOBILE NAVIGATION

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#navLinks");

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

}


// CLOSE MOBILE MENU WHEN A LINK IS SELECTED

document
  .querySelectorAll("#navLinks a")
  .forEach((link) => {

    link.addEventListener("click", () => {

      navLinks?.classList.remove("open");

      menuToggle?.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle?.setAttribute(
        "aria-label",
        "Open navigation menu"
      );

    });

  });


// PLACEHOLDER SOCIAL LINKS

document
  .querySelectorAll('[data-placeholder="true"]')
  .forEach((link) => {

    link.addEventListener("click", (event) => {

      event.preventDefault();

      alert(
        "This social-media link is currently a placeholder. Add the real Essex Paranormal link before publishing."
      );

    });

  });
