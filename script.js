// ==========================================
// AlaSQL - Criação de Tabelas e Dados Iniciais
// ==========================================
function initDB() {
  // Criação da tabela de usuários
  alasql('CREATE TABLE IF NOT EXISTS usuarios (id INT IDENTITY, nome STRING, usuario STRING UNIQUE, senha STRING)');

  // Criação da tabela de clientes
  alasql('CREATE TABLE IF NOT EXISTS clientes (id INT IDENTITY, nome STRING, cpf STRING UNIQUE, dataNascimento DATE, telefone STRING, celular STRING)');

  // Criação da tabela de endereços
  alasql('CREATE TABLE IF NOT EXISTS enderecos (id INT IDENTITY, clienteId INT, cep STRING, rua STRING, bairro STRING, cidade STRING, estado STRING, pais STRING, principal BOOLEAN DEFAULT false)');

  // Inserção de dados de teste iniciais
  alasql('INSERT INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)', ['Administrador', 'admin', '123456']);
  alasql('INSERT INTO clientes (nome, cpf, dataNascimento, telefone, celular) VALUES (?, ?, ?, ?, ?)', 
          ['João da Silva', '12345678900', '1990-01-01', '1111-1111', '99999-9999']);
  alasql('INSERT INTO enderecos (clienteId, cep, rua, bairro, cidade, estado, pais, principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [1, '12345-678', 'Rua A', 'Bairro B', 'Cidade C', 'Estado D', 'Brasil', true]);
}

// ==========================================
// Funções de Toast (mensagens temporárias)
// ==========================================
function showToast(message, type = 'success') {
  // Obtém o container de toasts do HTML
  const toastContainer = document.getElementById('toastContainer');

  // Cria um elemento toast dinamicamente
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 mb-2`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toast);

  // Inicializa o toast usando Bootstrap e define delay de 3 segundos
  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();

  // Remove o elemento do DOM após desaparecer
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// ==========================================
// Funções de Autenticação
// ==========================================

// Verifica login do usuário
function loginUser(usuario, senha) {
  const result = alasql('SELECT * FROM usuarios WHERE usuario = ? AND senha = ?', [usuario, senha]);
  return result.length > 0 ? result[0] : null; // retorna o usuário ou null
}

// Cadastra novo usuário, retorna true se sucesso ou false se já existe
function registerUser(nome, usuario, senha) {
  const exists = alasql('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
  if (exists.length > 0) return false;
  alasql('INSERT INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)', [nome, usuario, senha]);
  return true;
}

// ==========================================
// Função para carregar JSON no DB
// ==========================================
function loadJSONToDB(data) {
  // Limpa todas as tabelas
  alasql('DELETE FROM usuarios');
  alasql('DELETE FROM clientes');
  alasql('DELETE FROM enderecos');

  // Popula tabela de usuários
  if (data.usuarios) data.usuarios.forEach(u => 
    alasql('INSERT INTO usuarios (id, nome, usuario, senha) VALUES (?, ?, ?, ?)', [u.id, u.nome, u.usuario, u.senha])
  );

  // Popula tabela de clientes
  if (data.clientes) data.clientes.forEach(c => 
    alasql('INSERT INTO clientes (id, nome, cpf, dataNascimento, telefone, celular) VALUES (?, ?, ?, ?, ?, ?)',
           [c.id, c.nome, c.cpf, c.dataNascimento, c.telefone, c.celular])
  );

  // Popula tabela de endereços
  if (data.enderecos) data.enderecos.forEach(a => 
    alasql('INSERT INTO enderecos (id, clienteId, cep, rua, bairro, cidade, estado, pais, principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
           [a.id, a.clienteId, a.cep, a.rua, a.bairro, a.cidade, a.estado, a.pais, a.principal])
  );
}

// ==========================================
// Renderiza clientes na tabela
// ==========================================
function renderClientes() {
  const clientes = alasql('SELECT * FROM clientes');
  const tbody = document.querySelector('#clientesTable tbody');
  tbody.innerHTML = ''; // limpa tabela antes de preencher

  clientes.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.nome}</td>
      <td>${c.cpf}</td>
      <td>${c.dataNascimento}</td>
      <td>${c.telefone}</td>
      <td>${c.celular}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================
// Inicialização do DOM e Event Listeners
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  initDB(); // Cria tabelas e dados iniciais

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

  // ----- Login -----
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const user = loginUser(usuario, senha);

    if(user) {
      showToast(`Bem-vindo(a), ${user.nome}!`, 'success');

      // Mostra tela de clientes e esconde todas as seções de login/cadastro/config
      clientesSection.classList.remove('d-none');
      loginSection.classList.add('d-none');
      registerSection.classList.add('d-none');
      configSection.classList.add('d-none');

      // Renderiza tabela de clientes
      renderClientes();
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

  // ----- Cadastro de Clientes -----
  const clienteFormSection = document.getElementById('clienteFormSection');
  const clienteForm = document.getElementById('clienteForm');
  const showClienteForm = document.getElementById('showClienteForm');
  const cancelarCliente = document.getElementById('cancelarCliente');

  // Mostrar formulário de cadastro e esconder lista
  showClienteForm.addEventListener('click', () => {
    clientesSection.classList.add('d-none');
    clienteFormSection.classList.remove('d-none');
  });

  // Cancelar cadastro e voltar para lista
  cancelarCliente.addEventListener('click', () => {
    clienteForm.reset();
    clienteFormSection.classList.add('d-none');
    clientesSection.classList.remove('d-none');
  });

  // Salvar novo cliente
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

    alasql(
      'INSERT INTO clientes (nome, cpf, dataNascimento, telefone, celular) VALUES (?, ?, ?, ?, ?)',
      [nome, cpf, dataNascimento, telefone, celular]
    );

    showToast('Cliente cadastrado com sucesso!', 'success');

    clienteForm.reset();
    clienteFormSection.classList.add('d-none');
    clientesSection.classList.remove('d-none');

    renderClientes(); // Atualiza a tabela
  });
});