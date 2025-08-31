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
  validateFormAccumulated
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
} from "./enderecos.js";

document.addEventListener("DOMContentLoaded", () => {
  // ----- Inicialização do banco -----
  initDB();

  // ----- Mapear seções e formulários -----
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

  // ----- Funções utilitárias -----
  const showSection = (sectionKey) => {
    Object.values(sections).forEach((sec) => sec.classList.add("d-none"));
    if (sectionKey) sections[sectionKey].classList.remove("d-none");
  };

  const attachEnderecoButtons = () => {
    document
      .querySelectorAll(".viewEnderecosBtn")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          openEnderecos(Number(btn.dataset.id))
        )
      );
  };

  const openEnderecos = (clienteId) => {
    renderClientesSelect();
    inputs.selectCliente.value = clienteId;
    renderEnderecos();
    showSection("enderecos");
  };

  function resetFormFields(formInputs) {
    formInputs.forEach(input => {
      input.value = "";
      input.dataset.submitError = "";
      input.classList.remove("touched");
      input.style.borderColor = "transparent";
    });
  }

  const loginInputs = [inputs.usuario, inputs.senha];
  const registerInputs = [inputs.nome, inputs.novoUsuario, inputs.novaSenha];
  const configInputs = [inputs.jsonFile];

  // ----- Eventos globais -----
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

  // Vai para Registro → limpa Login
  buttons.showRegister.addEventListener("click", () => {
    showSection("register");
    resetFormFields(loginInputs);
  });

  // Vai para Login → limpa Registro
  buttons.showLogin.addEventListener("click", () => {
    showSection("login");
    resetFormFields(registerInputs);
  });

  // Vai para Config → limpa campos de Config
  buttons.showConfig.addEventListener("click", () => {
    showSection("config");
    resetFormFields(configInputs);
  });

  // Fecha Config → limpa campos de Config
  buttons.closeConfig.addEventListener("click", () => {
    showSection("login");
    resetFormFields(configInputs);
  });


  buttons.showClienteForm.addEventListener("click", () => {
    resetEditingCliente();
    showSection("clienteForm");
  });

  buttons.cancelarCliente.addEventListener("click", () =>
    showSection("clientes")
  );
  buttons.showEnderecoForm.addEventListener("click", () => {
    resetEditingEndereco();
    showSection("enderecoForm");
  });
  buttons.cancelarEndereco.addEventListener("click", () =>
    showSection("enderecos")
  );

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
      // reseta bordas do login
      inputs.usuario.dataset.submitError = "";
      inputs.senha.dataset.submitError = "";
      inputs.usuario.classList.add("touched");
      inputs.senha.classList.add("touched");
      inputs.usuario.style.borderColor = "#16a34a";
      inputs.senha.style.borderColor = "#16a34a";
    } else {
      showToast("Usuário ou senha inválidos!", "danger");
      // marca erro de submit nos dois campos
      inputs.usuario.dataset.submitError = "true";
      inputs.senha.dataset.submitError = "true";
      inputs.usuario.classList.add("touched");
      inputs.senha.classList.add("touched");
      inputs.usuario.style.borderColor = "#dc2626";
      inputs.senha.style.borderColor = "#dc2626";
    }
  });

  // coloca ambos verde se estiverem preenchidos após ser invalido e haver mudança
  [inputs.usuario, inputs.senha].forEach((input) => {
    input.addEventListener("input", () => {
      const username = inputs.usuario.value.trim();
      const password = inputs.senha.value.trim();

      // se houver valores nos dois campos, mostra verde
      if (username && password) {
        inputs.usuario.dataset.submitError = "";
        inputs.senha.dataset.submitError = "";
        inputs.usuario.style.borderColor = "#16a34a";
        inputs.senha.style.borderColor = "#16a34a";
      }
    });
  });
  // ----- Cadastro de usuário -----
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

  // ----- Configurações / Upload JSON -----
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

  // ----- Máscaras de input -----
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
    [{ regex: /(\d{4})(\d)/, repl: "$1-$2" }],
    8
  );
  maskInput(
    inputs.clienteCelular,
    [{ regex: /(\d{5})(\d)/, repl: "$1-$2" }],
    9
  );
  maskInput(inputs.enderecoCep, [{ regex: /(\d{5})(\d)/, repl: "$1-$2" }], 8);

  // ----- Configura validação dos campos -----
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

  // ----- Setup formulários obrigatórios -----
  setupFormValidation("loginForm");
  setupFormValidation("registerForm");
  setupFormValidation("clienteForm");
  setupFormValidation("enderecoForm");

  // ----- Salvar Cliente -----
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
      showSection("clientes");
    }
  });

  // Verifica se CPF dupliado teve alteração
  inputs.clienteCpf.addEventListener("input", () => {
    // Se o erro for CPF já existente, remove o destaque vermelho ao digitar
    if (inputs.clienteCpf.dataset.submitError === "cpfExists") {
      inputs.clienteCpf.dataset.submitError = "";
      inputs.clienteCpf.style.borderColor = "#16a34a"; // verde
      inputs.clienteCpf.classList.remove("touched");
    }
  });

  // ----- Salvar Endereço -----
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

    if (saveEndereco(enderecoData)) {
      resetEditingEndereco();
      forms.endereco.reset();
      renderEnderecos();
      showSection("enderecos");
    }
  });

});
