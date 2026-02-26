(() => {
  "use strict";

  const wait = (timeMs) => new Promise((resolve) => {
    window.setTimeout(resolve, timeMs);
  });

  const initMicroInteractions = () => {
    const targets = document.querySelectorAll(
      'button, nav a, .beneficio, .caracteristica, .testimonio, .perfil-card'
    );

    if (!targets.length) {
      return;
    }

    targets.forEach((target) => {
      target.classList.add("interactive-surface", "ripple-target");

      target.addEventListener("click", (event) => {
        const rect = target.getBoundingClientRect();
        const ripple = document.createElement("span");
        const size = Math.max(rect.width, rect.height) * 1.2;
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.className = "ripple-ink";
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        target.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
      });
    });
  };

  const initFormSubmissionFeedback = () => {
    const form = document.querySelector("#contacto form");
    const submitButton = form?.querySelector('button[type="submit"]');

    if (!form || !submitButton) {
      return;
    }

    let isSubmitting = false;

    const getFeedbackElement = () => {
      let feedback = form.querySelector(".form-feedback");

      if (!feedback) {
        feedback = document.createElement("p");
        feedback.className = "form-feedback";
        form.appendChild(feedback);
      }

      return feedback;
    };

    const ensureSubmitDecorators = () => {
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
      submitButton.disabled = status;
      submitButton.classList.toggle("is-loading", status);
      form.classList.toggle("is-submitting", status);
      form.setAttribute("aria-busy", String(status));
    };

    ensureSubmitDecorators();

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      const feedback = getFeedbackElement();
      const fields = form.querySelectorAll("input[required], textarea[required]");
      const hasEmptyRequiredField = Array.from(fields).some((field) => !field.value.trim());

      if (hasEmptyRequiredField) {
        feedback.textContent = "Completa los campos obligatorios para continuar.";
        feedback.classList.add("error");
        feedback.classList.remove("loading", "success");
        return;
      }

      feedback.textContent = "Enviando mensaje...";
      feedback.classList.add("loading");
      feedback.classList.remove("error", "success");

      setSubmittingState(true);
      await wait(1300);

      feedback.textContent = "Mensaje enviado correctamente. Te contactaremos pronto.";
      feedback.classList.add("success");
      feedback.classList.remove("loading", "error");

      await wait(900);
      form.reset();
      setSubmittingState(false);
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    initMicroInteractions();
    initFormSubmissionFeedback();
  });
})();
