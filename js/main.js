// js/main.js
import { initDB, exportDB, loadJSONToDB } from './db.js';
import { loginUser, registerUser } from './auth.js';
import { showToast } from './ui.js';
import { renderClientes, saveCliente, resetEditingCliente } from './clientes.js';
import { renderEnderecos, renderClientesSelect, saveEndereco, resetEditingEndereco } from './enderecos.js';

document.addEventListener('DOMContentLoaded', () => {
  initDB();

  // ----- Referências das seções -----
  const loginSection = document.getElementById('loginSection');
  const registerSection = document.getElementById('registerSection');
  const clientesSection = document.getElementById('clientesSection');
  const configSection = document.getElementById('configSection');
  const configForm = document.getElementById('configForm'); 

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');

  const enderecosSection = document.getElementById('enderecosSection');
  const enderecoFormSection = document.getElementById('enderecoFormSection');
  const showEnderecoForm = document.getElementById('showEnderecoForm');
  const voltarClientesBtn = document.getElementById('voltarClientesBtn');
  const enderecoForm = document.getElementById('enderecoForm');
  const cancelarEndereco = document.getElementById('cancelarEndereco');

  const clienteFormSection = document.getElementById('clienteFormSection');
  const clienteForm = document.getElementById('clienteForm');
  const showClienteForm = document.getElementById('showClienteForm');
  const cancelarCliente = document.getElementById('cancelarCliente');

  // ----- Endereços -----
  function openEnderecos(clienteId) {
    renderClientesSelect(); 
    document.getElementById('selectCliente').value = clienteId;
    renderEnderecos();

    enderecosSection.classList.remove('d-none');
    clientesSection.classList.add('d-none');
  }

  function attachEnderecoButtons() {
    document.querySelectorAll('.viewEnderecosBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const clienteId = Number(btn.dataset.id);
        openEnderecos(clienteId);
      });
    });
  }

  voltarClientesBtn.addEventListener('click', () => {
    enderecosSection.classList.add('d-none');
    clientesSection.classList.remove('d-none');
  });

  document.getElementById('selectCliente').addEventListener('change', renderEnderecos);

  // Eventos do formulário de endereços
  enderecoForm.addEventListener('submit', saveEndereco);
  showEnderecoForm.addEventListener('click', () => {
    resetEditingEndereco();
    enderecoFormSection.classList.remove('d-none');
    enderecosSection.classList.add('d-none');
  });
  cancelarEndereco.addEventListener('click', () => {
    resetEditingEndereco();
    enderecoFormSection.classList.add('d-none');
    enderecosSection.classList.remove('d-none');
  });

  // ----- Logout -----
  document.getElementById('logoutBtn').addEventListener('click', () => {
    clientesSection.classList.add('d-none');
    clienteFormSection.classList.add('d-none');
    enderecosSection.classList.add('d-none');
    enderecoFormSection.classList.add('d-none');
    configSection.classList.add('d-none');

    loginSection.classList.remove('d-none');

    document.getElementById('usuario').value = '';
    document.getElementById('senha').value = '';
  });
  
  // ----- Exportar DB -----
  document.getElementById('exportDbBtn').addEventListener('click', exportDB);

  // ----- Login -----
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const user = loginUser(usuario, senha);

    if(user) {
      showToast(`Bem-vindo(a), ${user.nome}!`, 'success');

      clientesSection.classList.remove('d-none');
      loginSection.classList.add('d-none');
      registerSection.classList.add('d-none');
      configSection.classList.add('d-none');

      renderClientes();
      attachEnderecoButtons();
    } else {
      showToast('Usuário ou senha inválidos!', 'danger');
    }
  });

  // ----- Cadastro -----
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const usuario = document.getElementById('novoUsuario').value.trim();
    const senha = document.getElementById('novaSenha').value.trim();

    const success = registerUser(nome, usuario, senha);
    success ? showToast('Usuário cadastrado com sucesso!', 'success') 
            : showToast('Usuário já existe! Escolha outro.', 'danger');

    if(success) registerForm.reset();
  });

  // ----- Alternância entre formulários (login/cadastro) -----
  showRegister.addEventListener('click', () => {
    loginSection.classList.add('d-none');
    registerSection.classList.remove('d-none');
    clientesSection.classList.add('d-none');
    configSection.classList.add('d-none');
  });

  const showConfigRegister = document.getElementById('showConfigRegister');
  showConfigRegister.addEventListener('click', () => {
    configSection.classList.remove('d-none');
    loginSection.classList.add('d-none');
    registerSection.classList.add('d-none');
    clientesSection.classList.add('d-none');
  });
  
  showLogin.addEventListener('click', () => {
    registerSection.classList.add('d-none');
    loginSection.classList.remove('d-none');
    clientesSection.classList.add('d-none');
    configSection.classList.add('d-none');
  });

  // ----- Configurações / Upload JSON -----
  const showConfig = document.getElementById('showConfig');
  const closeConfig = document.getElementById('closeConfig');
  const jsonFileInput = document.getElementById('jsonFile');

  showConfig.addEventListener('click', () => {
    configSection.classList.remove('d-none');
    loginSection.classList.add('d-none');
    registerSection.classList.add('d-none');
    clientesSection.classList.add('d-none');
  });

  closeConfig.addEventListener('click', () => {
    configSection.classList.add('d-none');
    loginSection.classList.remove('d-none');
  });

  configSection.addEventListener('submit', function(e) {
    e.preventDefault();
    const file = jsonFileInput.files[0];
    if(!file) return showToast('Nenhum arquivo selecionado!', 'danger');

    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const data = JSON.parse(event.target.result);
        loadJSONToDB(data);
        showToast('Banco carregado com sucesso!', 'success');
        configForm.reset();
        configSection.classList.add('d-none');
        loginSection.classList.remove('d-none');
      } catch (err) {
        console.error(err);
        showToast('Erro ao processar arquivo JSON!', 'danger');
      }
    };
    reader.readAsText(file);
  });

  // ----- Cadastro / Edição de Clientes -----
  showClienteForm.addEventListener('click', () => {
    resetEditingCliente();
    clienteFormSection.classList.remove('d-none');
    clientesSection.classList.add('d-none');
  });

  cancelarCliente.addEventListener('click', () => {
    resetEditingCliente();
    clienteForm.reset();
    clienteFormSection.classList.add('d-none');
    clientesSection.classList.remove('d-none');
  });

  clienteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('clienteNome').value.trim();
    const cpf = document.getElementById('clienteCpf').value.trim();
    const dataNascimento = document.getElementById('clienteDataNascimento').value;
    const telefone = document.getElementById('clienteTelefone').value.trim();
    const celular = document.getElementById('clienteCelular').value.trim();

    if (!nome || !cpf || !dataNascimento || !telefone || !celular) {
      return showToast('Todos os campos são obrigatórios!', 'danger');
    }

    const success = saveCliente({ nome, cpf, dataNascimento, telefone, celular });
    if (!success) return;

    resetEditingCliente();
    clienteForm.reset();
    renderClientes();
    attachEnderecoButtons();
    clienteFormSection.classList.add('d-none');
    clientesSection.classList.remove('d-none');
  });

  //----- Máscaras -----
  function maskCPF(input) {
    input.addEventListener('input', function() {
      let value = input.value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      input.value = value;
    });
  }

  function maskTelefone(input) {
    input.addEventListener('input', function() {
      let value = input.value.replace(/\D/g, '');
      if (value.length > 8) value = value.slice(0, 8);
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
      input.value = value;
    });
  }

  function maskCelular(input) {
    input.addEventListener('input', function() {
      let value = input.value.replace(/\D/g, '');
      if (value.length > 9) value = value.slice(0, 9);
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
      input.value = value;
    });
  }

  function maskCEP(input) {
    input.addEventListener('input', function() {
      let value = input.value.replace(/\D/g, '');
      if (value.length > 8) value = value.slice(0, 8);
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
      input.value = value;
    });
  }

  const cpfInput = document.getElementById('clienteCpf');
  const telefoneInput = document.getElementById('clienteTelefone');
  const celularInput = document.getElementById('clienteCelular');
  const cepInput = document.getElementById('enderecoCep');

  maskCPF(cpfInput);
  maskTelefone(telefoneInput);
  maskCelular(celularInput);
  maskCEP(cepInput);
});
