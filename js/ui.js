// -----  Exibe uma notificação temporária (toast) na tela -----
export function showToast(message, type = "success") {
  // Contêiner onde os toasts serão inseridos (deve existir no HTML com id="toastContainer")
  const container = document.getElementById("toastContainer");

  // Cria o elemento principal do toast
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 mb-2`;
  toast.setAttribute("role", "alert"); // acessibilidade: indica que é um alerta
  toast.setAttribute("aria-live", "assertive"); // acessibilidade: alerta deve ser lido imediatamente
  toast.setAttribute("aria-atomic", "true"); // acessibilidade: garante que será lido como mensagem única

  // Estrutura interna do toast (mensagem + botão fechar)
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  // Adiciona o toast no contêiner
  container.appendChild(toast);

  // Inicializa o toast com tempo de exibição de 3 segundos
  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();

  // Remove o elemento do DOM após ele desaparecer
  toast.addEventListener("hidden.bs.toast", () => toast.remove());
}

// -----  Exibe um toast com botões de confirmação ("Confirmar" e "Cancelar") -----
export function showConfirmToast(message, onConfirm, onCancel) {
  const container = document.getElementById("toastContainer");

  // Cria o elemento principal do toast de confirmação
  const toast = document.createElement("div");
  toast.className = "toast align-items-center text-bg-warning border-0 mb-2";

  // Estrutura interna (mensagem + botões de ação)
  toast.innerHTML = `
    <div class="d-flex flex-column p-2">
      <div class="toast-body mb-2">${message}</div>
      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-sm btn-success confirmBtn">Confirmar</button>
        <button class="btn btn-sm btn-secondary cancelBtn">Cancelar</button>
      </div>
    </div>
  `;

  container.appendChild(toast);

  // Este toast não some automaticamente, só após uma ação do usuário
  const bsToast = new bootstrap.Toast(toast, { autohide: false });
  bsToast.show();

  // Evento do botão confirmar
  toast.querySelector(".confirmBtn").addEventListener("click", () => {
    onConfirm();
    bsToast.hide();
  });

  // Evento do botão cancelar (se definido)
  toast.querySelector(".cancelBtn").addEventListener("click", () => {
    onCancel?.();
    bsToast.hide();
  });

  // Remove o elemento do DOM após fechar
  toast.addEventListener("hidden.bs.toast", () => toast.remove());
}

// -----  Mostra apenas uma seção da tela e oculta todas as outras -----
export function showSection(sectionId) {
  // Esconde todas as seções (incluindo login, registro e config)
  document
    .querySelectorAll(
      "section, #loginSection, #registerSection, #configSection"
    )
    .forEach((sec) => sec.classList.add("d-none"));

  // Exibe a seção solicitada
  document.getElementById(sectionId).classList.remove("d-none");
}

// --- Validação de campos com e sem formato ---
export function setupFieldValidation(input, typeCheck = null) {
  const updateColor = () => {
    const value = input.value.trim();

    // Antes de interação ou submit → neutro
    if (!input.classList.contains("touched") && !input.dataset.submitError) {
      input.style.borderColor = "transparent";
      return;
    }

    if (!value) {
      input.style.borderColor = input.dataset.submitError
        ? "#dc2626"
        : "#facc15";
    } else if (typeCheck && !typeCheck(value)) {
      input.style.borderColor = "#dc2626";
    } else {
      input.style.borderColor = "#16a34a";
    }
  };

  input.addEventListener("input", () => {
    input.classList.add("touched");
    input.dataset.submitError = ""; // limpa erro de submit
    updateColor();
  });

  input.addEventListener("blur", () => {
    input.classList.add("touched");
    updateColor();
  });

  // Inicial
  updateColor();
}

// --- Formulário geral, campos obrigatórios ---
export function setupFormValidation(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.querySelectorAll("input[required]").forEach((input) => {
    const updateColor = () => {
      if (input.dataset.submitError) {
        input.style.borderColor = "#dc2626"; // vermelho de submit
      } else if (!input.classList.contains("touched")) {
        input.style.borderColor = "transparent"; // neutro antes da interação
      } else {
        input.style.borderColor = input.value ? "#16a34a" : "#facc15"; // verde ou amarelo
      }
    };

    input.addEventListener("input", () => {
      input.classList.add("touched");
      input.dataset.submitError = "";
      updateColor();
    });

    input.addEventListener("blur", () => {
      input.classList.add("touched");
      updateColor();
    });
  });

  form.addEventListener("reset", () => {
    form.querySelectorAll("input[required]").forEach((input) => {
      input.style.borderColor = "transparent";
      input.classList.remove("touched");
      input.dataset.submitError = "";
    });
  });
}

// --- Funções de validação de formato ---
export const validateCEP = (v) => /^\d{5}-\d{3}$/.test(v);
export const validateCPF = (v) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v);
export const validateTelefone = (v) => /^\d{4}-\d{4}$/.test(v);
export const validateCelular = (v) => /^\d{5}-\d{4}$/.test(v);

// Função para remover todos os tooltips ativos do DOM
export function resetTooltips() {
  // Seleciona todos os elementos com tooltip
  const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  
  tooltipElements.forEach((el) => {
    const instance = bootstrap.Tooltip.getInstance(el);
    if (instance) instance.dispose(); // destrói o tooltip
    el.removeAttribute('data-bs-toggle');
    el.removeAttribute('title');
  });
}

// ----- Validação acumulada -----
export function validateFormAccumulated(form) {
  let isValid = true;
  const invalidFields = [];
  const validators = {
    cpf: validateCPF,
    cep: validateCEP,
    telefone: validateTelefone,
    celular: validateCelular,
  };

  form.querySelectorAll("input").forEach((input) => {
    // Remove tooltip antigo se existir
    const oldTooltip = bootstrap.Tooltip.getInstance(input);
    if (oldTooltip) oldTooltip.dispose();
    input.removeAttribute("data-bs-toggle");
    input.removeAttribute("title");

    const value = input.value.trim();
    const typeCheckFn = input.dataset.typeCheck ? validators[input.dataset.typeCheck] : null;
    let errorMsg = "";
    let errorType = "";

    if (!value) {
      errorMsg = "Campo obrigatório";
      errorType = "warning";
    } else if (typeCheckFn && !typeCheckFn(value)) {
      errorMsg = "Formato inválido";
      errorType = "error";
    }

    if (errorMsg) {
      isValid = false;
      input.classList.add("touched");
      input.style.borderColor = errorType === "warning" ? "#facc15" : "#dc2626";

      // Configura tooltip
      input.setAttribute("data-bs-toggle", "tooltip");
      input.setAttribute("data-bs-placement", "top");
      input.setAttribute("title", errorMsg);

      const tooltip = new bootstrap.Tooltip(input, {
        trigger: "hover focus",
        customClass: errorType === "warning" ? "tooltip-warning" : "tooltip-error",
      });

      // Remove tooltip ao digitar algo
      input.addEventListener("input", () => {
        const instance = bootstrap.Tooltip.getInstance(input);
        if (instance) instance.dispose();
        input.removeAttribute("data-bs-toggle");
        input.removeAttribute("title");
      }, { once: true });

      invalidFields.push(input);
    } else {
      input.style.borderColor = "#16a34a"; // verde
    }
  });

  if (invalidFields.length > 0) {
    const fieldNames = invalidFields.map((f) => {
      const label = form.querySelector(`label[for="${f.id}"]`);
      return label ? label.innerText : f.id;
    });
    showToast(`Preencha corretamente os campos: ${fieldNames.join(", ")}`, "danger");
  }

  return isValid;
}