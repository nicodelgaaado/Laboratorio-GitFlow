document.addEventListener("DOMContentLoaded", () => {
  if (!("IntersectionObserver" in window)) {
    return;
  }

  const targets = document.querySelectorAll(
    "main section, main section article, #contacto .form-group, #contacto button, footer .footer-content"
  );

  if (!targets.length) {
    return;
  }

  document.body.classList.add("js-scroll");

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  targets.forEach((element, index) => {
    element.classList.add("fade-in-up");
    element.style.setProperty("--reveal-delay", `${(index % 4) * 80}ms`);
    observer.observe(element);
  });
});
