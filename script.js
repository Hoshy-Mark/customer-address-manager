// ==========================================
// Criação das Tabelas no AlaSQL
// ==========================================

// Tabela de usuários
alasql('CREATE TABLE IF NOT EXISTS usuarios (\
  id INT IDENTITY, \
  nome STRING, \
  usuario STRING UNIQUE, \
  senha STRING \
)');

// Tabela de clientes
alasql('CREATE TABLE IF NOT EXISTS clientes (\
  id INT IDENTITY, \
  nome STRING, \
  cpf STRING UNIQUE, \
  dataNascimento DATE, \
  telefone STRING, \
  celular STRING \
)');

// Tabela de endereços
alasql('CREATE TABLE IF NOT EXISTS enderecos (\
  id INT IDENTITY, \
  clienteId INT, \
  cep STRING, \
  rua STRING, \
  bairro STRING, \
  cidade STRING, \
  estado STRING, \
  pais STRING, \
  principal BOOLEAN DEFAULT false \
)');


// Inserção de dados de teste


// Usuário teste
alasql('INSERT INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)', ['Administrador', 'admin', '123456']);

// Cliente teste
alasql('INSERT INTO clientes (nome, cpf, dataNascimento, telefone, celular) VALUES (?, ?, ?, ?, ?)', 
  ['João da Silva', '12345678900', '1990-01-01', '1111-1111', '99999-9999']);

// Endereço teste
alasql('INSERT INTO enderecos (clienteId, cep, rua, bairro, cidade, estado, pais, principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  [1, '12345-678', 'Rua A', 'Bairro B', 'Cidade C', 'Estado D', 'Brasil', true]);


// Testes de consulta
console.log("Usuários:", alasql('SELECT * FROM usuarios'));
console.log("Clientes:", alasql('SELECT * FROM clientes'));
console.log("Endereços:", alasql('SELECT * FROM enderecos'));

document.addEventListener('DOMContentLoaded', function() {

  // ===============================
  // Login
  // ===============================
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Pega os valores digitados pelo usuário e remove espaços extras
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value.trim();

    // Consulta o banco AlaSQL para verificar se existe um usuário com esses dados
    const result = alasql('SELECT * FROM usuarios WHERE usuario = ? AND senha = ?', [usuario, senha]);

    // Se encontrou um usuário correspondente, mostra mensagem de sucesso
    if(result.length > 0) {
      showToast(`Bem-vindo(a), ${result[0].nome}!`, 'success');
    } else {
      // Se não encontrou, mostra mensagem de erro
      showToast('Usuário ou senha inválidos!', 'danger');
    }
  });

  // ===============================
  // Cadastro de Usuário
  // ===============================
  const registerForm = document.getElementById('registerForm');

  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Pega os valores do formulário e remove espaços extras
    const nome = document.getElementById('nome').value.trim();
    const usuario = document.getElementById('novoUsuario').value.trim();
    const senha = document.getElementById('novaSenha').value.trim();

    // Verifica se já existe um usuário com o mesmo login
    const exists = alasql('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);

    if(exists.length > 0) {
      // Mostra toast de erro se usuário já existir
      showToast('Usuário já existe! Escolha outro.', 'danger');
    } else {
      // Insere novo usuário no banco e mostra toast de sucesso
      alasql('INSERT INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)', [nome, usuario, senha]);
      showToast('Usuário cadastrado com sucesso!', 'success');
      registerForm.reset();
    }
  });

  // ===============================
  // Alternância entre formulários
  // ===============================
  const showRegister = document.getElementById('showRegister');
  const showLogin = document.getElementById('showLogin');
  const formTitle = document.getElementById('formTitle');

  // Mostra formulário de cadastro e oculta o de login
  showRegister.addEventListener('click', () => {
    loginForm.classList.add('d-none');
    registerForm.classList.remove('d-none');
    formTitle.textContent = 'Cadastro de Usuário';
  });

  // Mostra formulário de login e oculta o de cadastro
  showLogin.addEventListener('click', () => {
    registerForm.classList.add('d-none');
    loginForm.classList.remove('d-none');
    formTitle.textContent = 'Login';
  });

});

function showToast(message, type = 'success') {
  // type pode ser 'success' ou 'danger'
  const toastContainer = document.getElementById('toastContainer');

  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 mb-2`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toast);

  // Inicializa o toast com Bootstrap
  const bsToast = new bootstrap.Toast(toast, { delay: 3000 }); // 3 segundos
  bsToast.show();

  // Remove do DOM após o fim da animação
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}