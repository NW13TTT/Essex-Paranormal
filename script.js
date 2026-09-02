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
      isOpen ? "Close navigation menu" : "Open navigation menu"
    );
  });
}


/* Close mobile menu after selecting a link */

document.querySelectorAll("#navLinks a").forEach((link) => {
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


/* Placeholder social links */

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
