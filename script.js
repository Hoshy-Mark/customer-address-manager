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
// Inicialização do DOM e Event Listeners
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  initDB(); // Cria tabelas e dados iniciais

  // ----- Login -----
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Evita recarregamento da página
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const user = loginUser(usuario, senha);
    user ? showToast(`Bem-vindo(a), ${user.nome}!`, 'success') 
         : showToast('Usuário ou senha inválidos!', 'danger');
  });

  // ----- Cadastro -----
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const usuario = document.getElementById('novoUsuario').value.trim();
    const senha = document.getElementById('novaSenha').value.trim();

    const success = registerUser(nome, usuario, senha);
    success ? showToast('Usuário cadastrado com sucesso!', 'success') 
            : showToast('Usuário já existe! Escolha outro.', 'danger');

    if(success) registerForm.reset(); // Limpa formulário se sucesso
  });

  // ----- Alternância entre formulários (login/cadastro) -----
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  const formTitle = document.getElementById('formTitle');

  // Mostra formulário de cadastro e oculta login
  showRegister.addEventListener('click', () => {
    loginForm.classList.add('d-none');
    registerForm.classList.remove('d-none');
    formTitle.textContent = 'Cadastro de Usuário';
  });

  // Mostra formulário de login e oculta cadastro
  showLogin.addEventListener('click', () => {
    registerForm.classList.add('d-none');
    loginForm.classList.remove('d-none');
    formTitle.textContent = 'Login';
  });

  // ----- Configurações / Upload JSON -----
  const showConfig = document.getElementById('showConfig'); // botão para abrir config
  const closeConfig = document.getElementById('closeConfig'); // botão para fechar config
  const configForm = document.getElementById('configForm'); // formulário de upload
  const jsonFileInput = document.getElementById('jsonFile'); // input de arquivo JSON

  // Mostra formulário de configuração
  showConfig.addEventListener('click', () => configForm.classList.remove('d-none'));

  // Fecha formulário de configuração
  closeConfig.addEventListener('click', () => configForm.classList.add('d-none'));

  // Evento de upload e atualização do banco a partir do JSON
  configForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const file = jsonFileInput.files[0];
    if(!file) return showToast('Nenhum arquivo selecionado!', 'danger');

    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const data = JSON.parse(event.target.result); // transforma JSON em objeto
        loadJSONToDB(data); // atualiza banco
        showToast('Banco carregado com sucesso!', 'success');
        configForm.reset();
        configForm.classList.add('d-none'); // fecha o formulário após upload
      } catch (err) {
        console.error(err);
        showToast('Erro ao processar arquivo JSON!', 'danger');
      }
    };
    reader.readAsText(file);
  });
});
