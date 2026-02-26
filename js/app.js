(() => {
  "use strict";

  const BREAKPOINT_MOBILE = 700;
  const revealTargets = [
    ".beneficio",
    ".caracteristica",
    ".testimonio",
    ".cv-card",
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
    const submitButton = form.querySelector('button[type="submit"]');
    let isSubmitting = false;

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

    const getFieldError = (field) => {
      const name = field.getAttribute("name");
      const rawValue = field.value.trim();
      const isRequired = field.hasAttribute("required");

      if (isRequired && !rawValue) {
        const customRequiredMessage = name ? requiredMessages[name] : null;
        return customRequiredMessage || "Este campo es obligatorio.";
      }

      const validator = name ? rules[name] : null;
      return validator ? validator(rawValue) : "";
    };

    const validateField = (field) => {
      const errorMessage = getFieldError(field);
      return setFieldState(field, errorMessage);
    };

    const updateSubmitState = () => {
      if (!submitButton) {
        return;
      }

      const canSubmit = Array.from(fields).every((field) => !getFieldError(field));
      const shouldDisable = isSubmitting || !canSubmit;

      submitButton.disabled = shouldDisable;
      submitButton.setAttribute("aria-disabled", String(shouldDisable));
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

    const wait = (timeMs) => new Promise((resolve) => {
      window.setTimeout(resolve, timeMs);
    });

    const ensureSubmitDecorators = () => {
      if (!submitButton) {
        return;
      }

      let label = submitButton.querySelector(".submit-label");

      if (!label) {
        label = document.createElement("span");
        label.className = "submit-label";
        label.textContent = submitButton.textContent.trim();
        submitButton.textContent = "";
        submitButton.appendChild(label);
      }

      let loader = submitButton.querySelector(".submit-loader");

      if (!loader) {
        loader = document.createElement("span");
        loader.className = "submit-loader";
        loader.setAttribute("aria-hidden", "true");
        submitButton.appendChild(loader);
      }
    };

    const setSubmittingState = (status) => {
      isSubmitting = status;

      form.classList.toggle("is-submitting", status);
      form.setAttribute("aria-busy", String(status));

      if (submitButton) {
        submitButton.classList.toggle("is-loading", status);
      }

      updateSubmitState();
    };

    ensureSubmitDecorators();

    fields.forEach((field) => {
      field.addEventListener("blur", () => {
        validateField(field);
        updateSubmitState();
      });

      field.addEventListener("input", () => {
        validateField(field);
        updateSubmitState();
      });
    });

    updateSubmitState();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

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
        feedback.classList.remove("success", "loading");

        if (firstInvalidField) {
          firstInvalidField.focus();
        }

        return;
      }

      feedback.textContent = "Enviando mensaje...";
      feedback.classList.add("loading");
      feedback.classList.remove("error", "success");

      setSubmittingState(true);
      await wait(1300);

      feedback.textContent = "Mensaje enviado correctamente. Te contactaremos pronto.";
      feedback.classList.add("success");
      feedback.classList.remove("error", "loading");

      form.classList.add("is-submitted");
      await wait(900);

      form.reset();
      fields.forEach((field) => setFieldState(field, ""));
      form.classList.remove("is-submitted");

      setSubmittingState(false);
      updateSubmitState();
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

  const initMicroInteractions = () => {
    const rippleTargets = document.querySelectorAll(
      'button, .cta-modal__action, .cta-modal__close, nav a, .beneficio, .caracteristica, .testimonio, .cv-card'
    );

    rippleTargets.forEach((target) => {
      target.classList.add("ripple-target", "interactive-surface");

      target.addEventListener("click", (event) => {
        const targetRect = target.getBoundingClientRect();
        const ripple = document.createElement("span");
        const size = Math.max(targetRect.width, targetRect.height) * 1.25;
        const x = event.clientX - targetRect.left - size / 2;
        const y = event.clientY - targetRect.top - size / 2;

        ripple.className = "ripple-ink";
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        target.appendChild(ripple);

        ripple.addEventListener("animationend", () => {
          ripple.remove();
        });
      });
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
    initMicroInteractions();
    initScrollAnimations();
  };

  document.addEventListener("DOMContentLoaded", initApp);
})();
