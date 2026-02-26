(() => {
  "use strict";

  const BREAKPOINT_MOBILE = 700;
  const revealTargets = [
    ".beneficio",
    ".caracteristica",
    ".testimonio",
    ".form-group"
  ];

  const getHeaderOffset = () => {
    const header = document.querySelector("header");
    return header ? header.offsetHeight + 8 : 0;
  };

  const scrollToElement = (element) => {
    if (!element) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = element.getBoundingClientRect().top + window.scrollY - getHeaderOffset();

    window.scrollTo({
      top,
      behavior: prefersReducedMotion ? "auto" : "smooth"
    });
  };

  const initResponsiveMenu = () => {
    const nav = document.querySelector("#main-navigation");
    const menuToggle = document.querySelector(".menu-toggle");

    if (!nav || !menuToggle) {
      return;
    }

    document.body.classList.add("has-js-menu");

    const closeMenu = () => {
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    };

    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= BREAKPOINT_MOBILE) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  };

  const initSmoothScroll = () => {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const targetId = link.getAttribute("href");

        if (!targetId || targetId === "#") {
          return;
        }

        const targetElement = document.querySelector(targetId);

        if (!targetElement) {
          return;
        }

        event.preventDefault();
        scrollToElement(targetElement);

        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, "", targetId);
        }
      });
    });
  };

  const initFormValidation = () => {
    const form = document.querySelector("#contacto form");

    if (!form) {
      return;
    }

    form.setAttribute("novalidate", "");

    const fields = form.querySelectorAll("input, textarea");

    const rules = {
      nombre: (value) => {
        if (value.length < 3) {
          return "Ingresa un nombre de al menos 3 caracteres.";
        }

        if (!/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(value)) {
          return "El nombre debe contener letras.";
        }

        return "";
      },
      email: (value) => {
        const normalizedValue = value.toLowerCase();
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

        if (!emailRegex.test(normalizedValue)) {
          return "Ingresa un correo electrónico válido.";
        }

        if (normalizedValue.includes("..")) {
          return "El correo no puede contener puntos consecutivos.";
        }

        return "";
      },
      telefono: (value) => {
        if (!value) {
          return "";
        }

        const cleanDigits = value.replace(/\D/g, "");
        const phoneRegex = /^[+]?[(\s\-\d)]{7,20}$/;

        if (!phoneRegex.test(value) || cleanDigits.length < 7) {
          return "El teléfono debe tener al menos 7 dígitos válidos.";
        }

        return "";
      },
      mensaje: (value) => {
        if (value.length < 12) {
          return "Describe tu consulta con al menos 12 caracteres.";
        }

        return "";
      }
    };

    const requiredMessages = {
      nombre: "El nombre completo es obligatorio.",
      email: "El correo electrónico es obligatorio.",
      mensaje: "El mensaje es obligatorio."
    };

    const getMessageElement = (field) => {
      const group = field.closest(".form-group");

      if (!group) {
        return null;
      }

      let messageElement = group.querySelector(".field-message");

      if (!messageElement) {
        messageElement = document.createElement("span");
        messageElement.className = "field-message";
        group.appendChild(messageElement);
      }

      return messageElement;
    };

    const setFieldState = (field, errorMessage) => {
      const group = field.closest(".form-group");
      const messageElement = getMessageElement(field);
      const hasValue = field.value.trim().length > 0;
      const hasError = Boolean(errorMessage);

      if (group) {
        group.classList.toggle("has-error", hasError);
        group.classList.toggle("has-success", !hasError && hasValue);
      }

      field.setAttribute("aria-invalid", String(hasError));

      if (messageElement) {
        if (hasError) {
          messageElement.textContent = errorMessage;
          messageElement.classList.add("error");
          messageElement.classList.remove("success");
        } else if (hasValue) {
          messageElement.textContent = "Campo válido.";
          messageElement.classList.add("success");
          messageElement.classList.remove("error");
        } else {
          messageElement.textContent = "";
          messageElement.classList.remove("error", "success");
        }
      }

      return !hasError;
    };

    const validateField = (field) => {
      const name = field.getAttribute("name");
      const rawValue = field.value.trim();
      const isRequired = field.hasAttribute("required");

      if (isRequired && !rawValue) {
        const customRequiredMessage = name ? requiredMessages[name] : null;
        return setFieldState(field, customRequiredMessage || "Este campo es obligatorio.");
      }

      const validator = name ? rules[name] : null;
      const errorMessage = validator ? validator(rawValue) : "";

      return setFieldState(field, errorMessage);
    };

    const getFeedbackElement = () => {
      let feedback = form.querySelector(".form-feedback");

      if (!feedback) {
        feedback = document.createElement("p");
        feedback.className = "form-feedback";
        form.appendChild(feedback);
      }

      return feedback;
    };

    fields.forEach((field) => {
      field.addEventListener("blur", () => {
        validateField(field);
      });

      field.addEventListener("input", () => {
        validateField(field);
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const feedback = getFeedbackElement();
      let firstInvalidField = null;

      let allValid = true;
      Array.from(fields).forEach((field) => {
        const valid = validateField(field);

        if (!valid && !firstInvalidField) {
          firstInvalidField = field;
        }

        if (!valid) {
          allValid = false;
        }
      });

      if (!allValid) {
        feedback.textContent = "Corrige los campos marcados para continuar.";
        feedback.classList.add("error");
        feedback.classList.remove("success");

        if (firstInvalidField) {
          firstInvalidField.focus();
        }

        return;
      }

      feedback.textContent = "Mensaje enviado correctamente. Te contactaremos pronto.";
      feedback.classList.add("success");
      feedback.classList.remove("error");

      form.reset();
      fields.forEach((field) => setFieldState(field, ""));
    });
  };

  const initCTAInteraction = () => {
    const ctaButton = document.querySelector("#cta-btn");
    const contactoSection = document.querySelector("#contacto");

    if (!ctaButton || !contactoSection) {
      return;
    }

    const modal = document.createElement("div");
    modal.className = "cta-modal";
    modal.setAttribute("hidden", "");
    modal.innerHTML = `
      <div class="cta-modal__overlay" data-close-modal></div>
      <div class="cta-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="cta-modal-title">
        <button class="cta-modal__close" type="button" aria-label="Cerrar" data-close-modal>&times;</button>
        <h3 class="cta-modal__title" id="cta-modal-title">Asesoría Apple personalizada</h3>
        <p class="cta-modal__copy">Un asesor puede ayudarte con equipos, financiamiento y promociones disponibles.</p>
        <button class="cta-modal__action" type="button" id="cta-modal-action">Ir al formulario</button>
      </div>
    `;

    document.body.appendChild(modal);

    let hideModalTimer = null;

    const closeModal = () => {
      modal.classList.remove("is-open");
      document.body.classList.remove("modal-open");
      hideModalTimer = window.setTimeout(() => {
        modal.setAttribute("hidden", "");
        hideModalTimer = null;
      }, 180);
    };

    const openModal = () => {
      if (hideModalTimer) {
        window.clearTimeout(hideModalTimer);
        hideModalTimer = null;
      }
      modal.removeAttribute("hidden");
      document.body.classList.add("modal-open");

      window.requestAnimationFrame(() => {
        modal.classList.add("is-open");
      });
    };

    ctaButton.addEventListener("click", () => {
      ctaButton.classList.add("is-active");
      window.setTimeout(() => {
        ctaButton.classList.remove("is-active");
      }, 160);

      openModal();
    });

    modal.querySelectorAll("[data-close-modal]").forEach((closeElement) => {
      closeElement.addEventListener("click", closeModal);
    });

    const modalAction = modal.querySelector("#cta-modal-action");
    if (modalAction) {
      modalAction.addEventListener("click", () => {
        closeModal();
        scrollToElement(contactoSection);
      });
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hasAttribute("hidden")) {
        closeModal();
      }
    });
  };

  const initScrollAnimations = () => {
    const elements = document.querySelectorAll(revealTargets.join(","));

    if (!elements.length) {
      return;
    }

    elements.forEach((element, index) => {
      element.classList.add("reveal-on-scroll");
      element.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
    });

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    elements.forEach((element) => observer.observe(element));
  };

  const initApp = () => {
    initResponsiveMenu();
    initSmoothScroll();
    initFormValidation();
    initCTAInteraction();
    initScrollAnimations();
  };

  document.addEventListener("DOMContentLoaded", initApp);
})();
