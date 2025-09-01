// Importação de módulos
import { initDB, exportDB, loadJSONToDB } from "./db.js";
import { loginUser, registerUser } from "./auth.js";
import {
  showToast,
  setupFormValidation,
  setupFieldValidation,
  validateCEP,
  validateCPF,
  validateTelefone,
  validateCelular,
  validateFormAccumulated,
  resetTooltips,
} from "./ui.js";
import {
  renderClientes,
  saveCliente,
  resetEditingCliente,
} from "./clientes.js";
import {
  renderEnderecos,
  renderClientesSelect,
  saveEndereco,
  resetEditingEndereco,
  updateEnderecoPrincipalCheckbox
} from "./enderecos.js";

// ----- Inicialização da aplicação -----

document.addEventListener("DOMContentLoaded", () => {
  initDB(); // Inicializa o banco de dados

  // ----- Seleção de elementos do DOM -----

  const sections = {
    login: document.getElementById("loginSection"),
    register: document.getElementById("registerSection"),
    clientes: document.getElementById("clientesSection"),
    config: document.getElementById("configSection"),
    enderecos: document.getElementById("enderecosSection"),
    enderecoForm: document.getElementById("enderecoFormSection"),
    clienteForm: document.getElementById("clienteFormSection"),
  };

  const forms = {
    login: document.getElementById("loginForm"),
    register: document.getElementById("registerForm"),
    config: document.getElementById("configForm"),
    endereco: document.getElementById("enderecoForm"),
    cliente: document.getElementById("clienteForm"),
  };

  const buttons = {
    showRegister: document.getElementById("showRegister"),
    showLogin: document.getElementById("showLogin"),
    showConfig: document.getElementById("showConfig"),
    closeConfig: document.getElementById("closeConfig"),
    exportDb: document.getElementById("exportDbBtn"),
    showEnderecoForm: document.getElementById("showEnderecoForm"),
    voltarClientes: document.getElementById("voltarClientesBtn"),
    showClienteForm: document.getElementById("showClienteForm"),
    cancelarEndereco: document.getElementById("cancelarEndereco"),
    cancelarCliente: document.getElementById("cancelarCliente"),
    logout: document.getElementById("logoutBtn"),
  };

  const inputs = {
    usuario: document.getElementById("usuario"),
    senha: document.getElementById("senha"),
    novoUsuario: document.getElementById("novoUsuario"),
    novaSenha: document.getElementById("novaSenha"),
    nome: document.getElementById("nome"),
    clienteNome: document.getElementById("clienteNome"),
    clienteCpf: document.getElementById("clienteCpf"),
    clienteDataNascimento: document.getElementById("clienteDataNascimento"),
    clienteTelefone: document.getElementById("clienteTelefone"),
    clienteCelular: document.getElementById("clienteCelular"),
    selectCliente: document.getElementById("selectCliente"),
    enderecoCep: document.getElementById("enderecoCep"),
    enderecoRua: document.getElementById("enderecoRua"),
    enderecoBairro: document.getElementById("enderecoBairro"),
    enderecoCidade: document.getElementById("enderecoCidade"),
    enderecoEstado: document.getElementById("enderecoEstado"),
    enderecoPais: document.getElementById("enderecoPais"),
    jsonFile: document.getElementById("jsonFile"),
  };

  // ----- Variáveis auxiliares -----

  let lastCreatedClienteId = null;

  const loginInputs = [inputs.usuario, inputs.senha];
  const registerInputs = [inputs.nome, inputs.novoUsuario, inputs.novaSenha];
  const configInputs = [inputs.jsonFile];

  // ----- Funções utilitárias -----

  // Mostra apenas a seção desejada
  const showSection = (sectionKey) => {
    Object.values(sections).forEach((sec) => sec.classList.add("d-none"));
    if (sectionKey) sections[sectionKey].classList.remove("d-none");
  };

  // Limpa campos de formulário e reset de bordas
  function resetFormFields(formInputs) {
    formInputs.forEach((input) => {
      input.value = "";
      input.dataset.submitError = "";
      input.classList.remove("touched");
      input.style.borderColor = "#d1d5db";
    });
  }

  // Adiciona evento de abrir endereços ao clicar em botão
  const attachEnderecoButtons = () => {
    document
      .querySelectorAll(".viewEnderecosBtn")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          openEnderecos(Number(btn.dataset.id))
        )
      );
  };

  // Abre a seção de endereços de um cliente específico
  const openEnderecos = (clienteId) => {
    renderClientesSelect();
    inputs.selectCliente.value = clienteId;
    renderEnderecos();
    showSection("enderecos");
  };

  // Máscaras de inputs (CPF, telefone, celular, CEP)
  const maskInput = (input, pattern, maxLength) => {
    input.addEventListener("input", () => {
      let value = input.value.replace(/\D/g, "").slice(0, maxLength);
      pattern.forEach((p) => (value = value.replace(p.regex, p.repl)));
      input.value = value;
    });
  };

  maskInput(
    inputs.clienteCpf,
    [
      { regex: /(\d{3})(\d)/, repl: "$1.$2" },
      { regex: /(\d{3})(\d)/, repl: "$1.$2" },
      { regex: /(\d{3})(\d{1,2})$/, repl: "$1-$2" },
    ],
    11
  );

  maskInput(
    inputs.clienteTelefone,
    [
      { regex: /^(\d{2})(\d)/, repl: "($1) $2" },
      { regex: /(\d{4})(\d)/, repl: "$1-$2" }
    ],
    10
  );

  maskInput(
    inputs.clienteCelular,
    [
      { regex: /^(\d{2})(\d)/, repl: "($1) $2" },
      { regex: /(\d{5})(\d)/, repl: "$1-$2" }
    ],
    11
  );
  maskInput(inputs.enderecoCep, [{ regex: /(\d{5})(\d)/, repl: "$1-$2" }], 8);

  // ----- Configuração de validação -----

  const camposSemValidacao = [
    "usuario",
    "senha",
    "novoUsuario",
    "novaSenha",
    "nome",
    "clienteNome",
    "clienteDataNascimento",
    "enderecoRua",
    "enderecoBairro",
    "enderecoCidade",
    "enderecoEstado",
    "enderecoPais",
  ];

  camposSemValidacao.forEach((id) => setupFieldValidation(inputs[id]));

  // Campos com validação de formato
  setupFieldValidation(inputs.clienteCpf, validateCPF);
  inputs.clienteCpf.dataset.typeCheck = "cpf";

  setupFieldValidation(inputs.clienteTelefone, validateTelefone);
  inputs.clienteTelefone.dataset.typeCheck = "telefone";

  setupFieldValidation(inputs.clienteCelular, validateCelular);
  inputs.clienteCelular.dataset.typeCheck = "celular";

  setupFieldValidation(inputs.enderecoCep, validateCEP);
  inputs.enderecoCep.dataset.typeCheck = "cep";

  // Setup de formulários obrigatórios
  setupFormValidation("loginForm");
  setupFormValidation("registerForm");
  setupFormValidation("clienteForm");
  setupFormValidation("enderecoForm");

  // ----- Eventos globais de navegação -----

  buttons.showRegister.addEventListener("click", () => {
    showSection("register");
    resetFormFields(loginInputs);
  });

  buttons.showLogin.addEventListener("click", () => {
    showSection("login");
    resetFormFields(registerInputs);
  });

  buttons.showConfig.addEventListener("click", () => {
    showSection("config");
    resetFormFields(configInputs);
  });

  buttons.closeConfig.addEventListener("click", () => {
    showSection("login");
    resetFormFields(configInputs);
  });

  buttons.voltarClientes.addEventListener("click", () =>
    showSection("clientes")
  );
  inputs.selectCliente.addEventListener("change", renderEnderecos);

  buttons.logout.addEventListener("click", () => {
    showSection("login");
    resetFormFields(loginInputs);
    showToast("Logout efetuado com sucesso", "success");
  });

  buttons.exportDb.addEventListener("click", exportDB);

  buttons.showClienteForm.addEventListener("click", () => {
    resetEditingCliente();
    resetTooltips();
    showSection("clienteForm");
  });

  buttons.cancelarCliente.addEventListener("click", () =>
    showSection("clientes")
  );

  buttons.showEnderecoForm.addEventListener("click", () => {
    resetEditingEndereco();
    resetTooltips();

    const clienteId = Number(inputs.selectCliente.value);
    updateEnderecoPrincipalCheckbox(clienteId);

    showSection("enderecoForm");
  });

  buttons.cancelarEndereco.addEventListener("click", () => {
    if (lastCreatedClienteId !== null) {
      alasql("DELETE FROM clientes WHERE id = ?", [lastCreatedClienteId]);
      showToast("Cadastro de cliente cancelado.", "info");
      lastCreatedClienteId = null;
      renderClientes();
      attachEnderecoButtons();
      showSection("clientes");
    } else {
      showSection("enderecos");
    }
  });

  // ----- Login -----

  forms.login.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = inputs.usuario.value.trim();
    const password = inputs.senha.value.trim();
    const user = loginUser(username, password);

    if (user) {
      showToast(`Bem-vindo(a), ${user.nome}!`, "success");
      showSection("clientes");
      renderClientes();
      attachEnderecoButtons();
      [inputs.usuario, inputs.senha].forEach((input) => {
        input.dataset.submitError = "";
        input.classList.add("touched");
        input.style.borderColor = "#16a34a";
      });
    } else {
      showToast("Usuário ou senha inválidos!", "danger");
      [inputs.usuario, inputs.senha].forEach((input) => {
        input.dataset.submitError = "true";
        input.classList.add("touched");
        input.style.borderColor = "#dc2626";
      });
    }
  });

  // Atualiza bordas para verde quando campos preenchidos
  [inputs.usuario, inputs.senha].forEach((input) =>
    input.addEventListener("input", () => {
      if (inputs.usuario.value.trim() && inputs.senha.value.trim()) {
        [inputs.usuario, inputs.senha].forEach((inp) => {
          inp.dataset.submitError = "";
          inp.style.borderColor = "#16a34a";
        });
      }
    })
  );

  // ----- Registro de usuário -----

  forms.register.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateFormAccumulated(forms.register)) return;

    const success = registerUser(
      inputs.nome.value.trim(),
      inputs.novoUsuario.value.trim(),
      inputs.novaSenha.value.trim()
    );

    showToast(
      success ? "Usuário cadastrado com sucesso!" : "Usuário já existe!",
      success ? "success" : "danger"
    );

    if (success) forms.register.reset();
  });

  // -----  Configurações - Upload JSON -----

  forms.config.addEventListener("submit", (e) => {
    e.preventDefault();
    const file = inputs.jsonFile.files[0];
    if (!file) return showToast("Nenhum arquivo selecionado!", "danger");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        loadJSONToDB(JSON.parse(event.target.result));
        showToast("Banco carregado com sucesso!", "success");
        forms.config.reset();
        showSection("login");
      } catch (err) {
        console.error(err);
        showToast("Erro ao processar arquivo JSON!", "danger");
      }
    };
    reader.readAsText(file);
  });

  // ----- Cadastro de cliente -----

  forms.cliente.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateFormAccumulated(forms.cliente)) return;

    const clienteData = {
      nome: inputs.clienteNome.value.trim(),
      cpf: inputs.clienteCpf.value.trim(),
      dataNascimento: inputs.clienteDataNascimento.value,
      telefone: inputs.clienteTelefone.value.trim(),
      celular: inputs.clienteCelular.value.trim(),
    };

    if (saveCliente(clienteData)) {
      resetEditingCliente();
      forms.cliente.reset();
      renderClientes();
      attachEnderecoButtons();

      // Guarda o cliente recém-criado
      const clientes = alasql("SELECT * FROM clientes ORDER BY id DESC LIMIT 1");
      if (clientes.length > 0) lastCreatedClienteId = clientes[0].id;

      // Redireciona para cadastro de endereço
      renderClientesSelect();
      inputs.selectCliente.value = lastCreatedClienteId;
      resetEditingEndereco();
      const clienteId = Number(inputs.selectCliente.value);
      updateEnderecoPrincipalCheckbox(clienteId);
      showSection("enderecoForm");
    }
  });

  // Atualiza destaque de CPF duplicado
  inputs.clienteCpf.addEventListener("input", () => {
    if (inputs.clienteCpf.dataset.submitError === "cpfExists") {
      inputs.clienteCpf.dataset.submitError = "";
      inputs.clienteCpf.style.borderColor = "#16a34a";
      inputs.clienteCpf.classList.remove("touched");
    }
  });

  // ----- Cadastro de endereço -----

  forms.endereco.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateFormAccumulated(forms.endereco)) return;

    const enderecoData = {
      cep: inputs.enderecoCep.value.trim(),
      rua: inputs.enderecoRua.value.trim(),
      bairro: inputs.enderecoBairro.value.trim(),
      cidade: inputs.enderecoCidade.value.trim(),
      estado: inputs.enderecoEstado.value.trim(),
      pais: inputs.enderecoPais.value.trim(),
    };

    const clienteId = Number(inputs.selectCliente.value);
    const sucesso = saveEndereco(enderecoData);

    if (sucesso) {
      if (lastCreatedClienteId === clienteId) {
        // Primeiro endereço → volta para lista de clientes
        showToast("Cliente cadastrado com sucesso!", "success");
        lastCreatedClienteId = null;
        renderClientes();
        attachEnderecoButtons();
        showSection("clientes");
      } else {
        // Endereço adicional → mostra lista de endereços
        renderEnderecos();
        showSection("enderecos");
      }
    }
  });
});
