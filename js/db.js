export function initDB() {
  alasql('CREATE TABLE IF NOT EXISTS usuarios (id INT IDENTITY, nome STRING, usuario STRING UNIQUE, senha STRING)');
  alasql('CREATE TABLE IF NOT EXISTS clientes (id INT IDENTITY, nome STRING, cpf STRING UNIQUE, dataNascimento DATE, telefone STRING, celular STRING)');
  alasql('CREATE TABLE IF NOT EXISTS enderecos (id INT IDENTITY, clienteId INT, cep STRING, rua STRING, bairro STRING, cidade STRING, estado STRING, pais STRING, principal BOOLEAN DEFAULT false)');

  // Dados iniciais
  if (!alasql('SELECT * FROM usuarios').length) {
    alasql('INSERT INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)', ['Administrador', 'admin', '123456']);
    alasql('INSERT INTO clientes (nome, cpf, dataNascimento, telefone, celular) VALUES (?, ?, ?, ?, ?)', 
      ['João da Silva', '123.456.890-10', '1990-01-01', '1111-1111', '99999-9999']);
    alasql('INSERT INTO enderecos (clienteId, cep, rua, bairro, cidade, estado, pais, principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [1, '12345-678', 'Rua A', 'Bairro B', 'Cidade C', 'Estado D', 'Brasil', true]);
  }
}

export function exportDB() {
  const data = {
    usuarios: alasql('SELECT * FROM usuarios'),
    clientes: alasql('SELECT * FROM clientes'),
    enderecos: alasql('SELECT * FROM enderecos')
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'banco.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function loadJSONToDB(data) {
  alasql('DELETE FROM usuarios');
  alasql('DELETE FROM clientes');
  alasql('DELETE FROM enderecos');

  data.usuarios?.forEach(u => alasql('INSERT INTO usuarios VALUES (?,?,?,?,?)', [u.id, u.nome, u.usuario, u.senha]));
  data.clientes?.forEach(c => alasql('INSERT INTO clientes VALUES (?,?,?,?,?,?)', [c.id, c.nome, c.cpf, c.dataNascimento, c.telefone, c.celular]));
  data.enderecos?.forEach(e => alasql('INSERT INTO enderecos VALUES (?,?,?,?,?,?,?,?,?,?)', [e.id, e.clienteId, e.cep, e.rua, e.bairro, e.cidade, e.estado, e.pais, e.principal]));
}
