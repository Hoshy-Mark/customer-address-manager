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