// Inicializa o banco de dados em memória com as tabelas necessárias.
// Cria as tabelas caso não existam e insere dados iniciais.
export function initDB() {
  // Tabela de usuários do sistema
  alasql(
    "CREATE TABLE IF NOT EXISTS usuarios (id INT IDENTITY, nome STRING, usuario STRING UNIQUE, senha STRING)"
  );

  // Tabela de clientes cadastrados
  alasql(
    "CREATE TABLE IF NOT EXISTS clientes (id INT IDENTITY, nome STRING, cpf STRING UNIQUE, dataNascimento DATE, telefone STRING, celular STRING)"
  );

  // Tabela de endereços vinculados aos clientes
  alasql(
    "CREATE TABLE IF NOT EXISTS enderecos (id INT IDENTITY, clienteId INT, cep STRING, rua STRING, bairro STRING, cidade STRING, estado STRING, pais STRING, principal BOOLEAN DEFAULT false)"
  );

  // Insere dados iniciais apenas se a tabela de usuários estiver vazia
  if (!alasql("SELECT * FROM usuarios").length) {
    // Usuário padrão
    alasql("INSERT INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)", [
      "Administrador",
      "admin",
      "123456",
    ]);

    // Cliente exemplo
    alasql(
      "INSERT INTO clientes (nome, cpf, dataNascimento, telefone, celular) VALUES (?, ?, ?, ?, ?)",
      [
        "João da Silva",
        "123.456.890-10",
        "1990-01-01",
        "(11) 1111-1111",
        "(11) 99999-9999",
      ]
    );

    // Endereço do cliente exemplo
    alasql(
      "INSERT INTO enderecos (clienteId, cep, rua, bairro, cidade, estado, pais, principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        1,
        "12345-678",
        "Rua A",
        "Bairro B",
        "Cidade C",
        "Estado D",
        "Brasil",
        true,
      ]
    );
  }
}

// Exporta o banco de dados para um arquivo JSON.
// Gera um objeto com todas as tabelas e cria um download automático.
export function exportDB() {
  // Extrai os dados das tabelas
  const data = {
    usuarios: alasql("SELECT * FROM usuarios"),
    clientes: alasql("SELECT * FROM clientes"),
    enderecos: alasql("SELECT * FROM enderecos"),
  };

  // Converte para JSON formatado
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  // Cria um link temporário para download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "banco.json"; // nome do arquivo
  a.click();

  // Libera o objeto da memória
  URL.revokeObjectURL(url);
}

// Carrega dados de um arquivo JSON para o banco.
// Substitui os dados existentes pelos do arquivo.
export function loadJSONToDB(data) {
  // Limpa tabelas antes de inserir os novos dados
  alasql("DELETE FROM usuarios");
  alasql("DELETE FROM clientes");
  alasql("DELETE FROM enderecos");

  // Reinsere os registros vindos do JSON
  data.usuarios?.forEach((u) =>
    alasql("INSERT INTO usuarios VALUES (?,?,?,?,?)", [
      u.id,
      u.nome,
      u.usuario,
      u.senha,
    ])
  );

  data.clientes?.forEach((c) =>
    alasql("INSERT INTO clientes VALUES (?,?,?,?,?,?)", [
      c.id,
      c.nome,
      c.cpf,
      c.dataNascimento,
      c.telefone,
      c.celular,
    ])
  );

  data.enderecos?.forEach((e) =>
    alasql("INSERT INTO enderecos VALUES (?,?,?,?,?,?,?,?,?,?)", [
      e.id,
      e.clienteId,
      e.cep,
      e.rua,
      e.bairro,
      e.cidade,
      e.estado,
      e.pais,
      e.principal,
    ])
  );
}
