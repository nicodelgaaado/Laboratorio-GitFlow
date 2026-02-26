document.addEventListener("DOMContentLoaded", () => {
  const headerNav = document.querySelector("header nav");
  if (!headerNav) {
    return;
  }

  const links = Array.from(headerNav.querySelectorAll('a[href^="#"]'));
  if (!links.length) {
    return;
  }

  const targets = links
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      if (!id) {
        return null;
      }

      const section = document.getElementById(id);
      if (!section) {
        return null;
      }

      return { id, link, section };
    })
    .filter(Boolean);

  if (!targets.length) {
    return;
  }

  const setActiveLink = (activeId) => {
    targets.forEach(({ id, link }) => {
      const isActive = id === activeId;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  let currentActiveId = targets[0].id;
  setActiveLink(currentActiveId);

  const pickVisibleSection = () => {
    const headerOffset = (document.querySelector("header")?.offsetHeight || 0) + 16;
    let nextActiveId = currentActiveId;

    targets.forEach(({ id, section }) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= headerOffset && rect.bottom >= headerOffset) {
        nextActiveId = id;
      }
    });

    if (nextActiveId !== currentActiveId) {
      currentActiveId = nextActiveId;
      setActiveLink(currentActiveId);
    }
  };

  if ("IntersectionObserver" in window) {
    const visibleRatios = new Map();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
          visibleRatios.set(id, ratio);
        });

        let bestId = currentActiveId;
        let bestRatio = 0;

        targets.forEach(({ id }) => {
          const ratio = visibleRatios.get(id) || 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        if (bestRatio > 0 && bestId !== currentActiveId) {
          currentActiveId = bestId;
          setActiveLink(currentActiveId);
        }
      },
      {
        threshold: [0.2, 0.4, 0.6],
        rootMargin: "-20% 0px -55% 0px",
      }
    );

    targets.forEach(({ section }) => observer.observe(section));
  }

  window.addEventListener("scroll", pickVisibleSection, { passive: true });
  window.addEventListener("resize", pickVisibleSection);
  pickVisibleSection();

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const id = link.getAttribute("href")?.slice(1);
      if (!id) {
        return;
      }
      currentActiveId = id;
      setActiveLink(currentActiveId);
    });
  });
});
