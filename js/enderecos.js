import { showToast } from "./ui.js";

// Armazena o ID do endereço que está sendo editado no momento
// Se for null, significa que está cadastrando um novo endereço
let editingEnderecoId = null;

// ----- Renderiza o select de clientes no formulário de endereços -----
export function renderClientesSelect() {
  const select = document.getElementById("selectCliente");
  const clientes = alasql("SELECT * FROM clientes");
  select.innerHTML = ""; // limpa antes de renderizar

  clientes.forEach((c) => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.nome;
    select.appendChild(option);
  });
}

// ----- Renderiza a tabela de endereços do cliente selecionado -----
export function renderEnderecos() {
  const clienteId = Number(document.getElementById("selectCliente").value);

  // Busca os endereços vinculados ao cliente selecionado
  const enderecos = alasql("SELECT * FROM enderecos WHERE clienteId = ?", [
    clienteId,
  ]);

  // Busca o cliente para pegar o nome
  const cliente = alasql("SELECT * FROM clientes WHERE id = ?", [clienteId])[0];

  // Limpa corpo da tabela antes de popular
  const tbody = document
    .getElementById("enderecosTable")
    .querySelector("tbody");
  tbody.innerHTML = "";

  // Cria uma linha para cada endereço
  enderecos.forEach((endereco) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${endereco.id}</td>
      <td>${cliente.nome}</td>   <!-- Nome do cliente -->
      <td>${endereco.cep}</td>
      <td>${endereco.rua}</td>
      <td>${endereco.bairro}</td>
      <td>${endereco.cidade}</td>
      <td>${endereco.estado}</td>
      <td>${endereco.pais}</td>
      <td>${endereco.principal ? "Sim" : "Não"}</td>
      <td>
        <button class="btn btn-warning btn-sm edit-endereco" data-id="${endereco.id}">Editar</button>
        <button class="btn btn-danger btn-sm delete-endereco" data-id="${endereco.id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Eventos dos botões "Editar" e "Excluir"
  tbody
    .querySelectorAll(".edit-endereco")
    .forEach((btn) =>
      btn.addEventListener("click", () => editEndereco(Number(btn.dataset.id)))
    );
  tbody
    .querySelectorAll(".delete-endereco")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        deleteEndereco(Number(btn.dataset.id))
      )
    );
}

// ----- Reseta o formulário e o estado de edição -----
export function resetEditingEndereco() {
  editingEnderecoId = null;
  document.getElementById("enderecoForm").reset();
  resetEnderecoBorders();
}

// ----- Limpa bordas e estado do formulário de Endereço -----
function resetEnderecoBorders() {
  const campos = [
    "enderecoCep",
    "enderecoRua",
    "enderecoBairro",
    "enderecoCidade",
    "enderecoEstado",
    "enderecoPais"
  ];
  
  campos.forEach(id => {
    const input = document.getElementById(id);
    input.classList.remove("touched");
    input.dataset.submitError = "";
    input.style.borderColor = "transparent";
  });
}

// ----- Carrega os dados de um endereço no formulário para edição -----
export function editEndereco(id) {
  const endereco = alasql("SELECT * FROM enderecos WHERE id = ?", [id])[0];
  if (!endereco) return;

  editingEnderecoId = id;

  // Limpa bordas antigas antes de preencher
  resetEnderecoBorders();

  // Preenche campos do formulário
  document.getElementById("enderecoCep").value = endereco.cep;
  document.getElementById("enderecoRua").value = endereco.rua;
  document.getElementById("enderecoBairro").value = endereco.bairro;
  document.getElementById("enderecoCidade").value = endereco.cidade;
  document.getElementById("enderecoEstado").value = endereco.estado;
  document.getElementById("enderecoPais").value = endereco.pais;
  document.getElementById("enderecoPrincipal").checked = endereco.principal;

  // Alterna visibilidade das seções
  document.getElementById("enderecoFormSection").classList.remove("d-none");
  document.getElementById("enderecosSection").classList.add("d-none");
}

// ----- Exclui um endereço do cliente -----
export function deleteEndereco(id) {
  const endereco = alasql("SELECT * FROM enderecos WHERE id = ?", [id])[0];
  if (!endereco) return;

  // Remove o endereço do banco
  alasql("DELETE FROM enderecos WHERE id = ?", [id]);

  // Se o endereço excluído era o principal, define outro como principal
  const enderecosCliente = alasql(
    "SELECT * FROM enderecos WHERE clienteId = ?",
    [endereco.clienteId]
  );
  if (endereco.principal && enderecosCliente.length > 0) {
    alasql("UPDATE enderecos SET principal = true WHERE id = ?", [
      enderecosCliente[0].id,
    ]);
  }

  showToast("Endereço excluído com sucesso!");
  renderEnderecos();
}

// ----- Salva um endereço (inserção ou atualização) -----
export function saveEndereco(e) {
  e.preventDefault();

  // Dados do formulário
  const clienteId = Number(document.getElementById("selectCliente").value);
  const cep = document.getElementById("enderecoCep").value.trim();
  const rua = document.getElementById("enderecoRua").value.trim();
  const bairro = document.getElementById("enderecoBairro").value.trim();
  const cidade = document.getElementById("enderecoCidade").value.trim();
  const estado = document.getElementById("enderecoEstado").value.trim();
  const pais = document.getElementById("enderecoPais").value.trim();
  let principal = document.getElementById("enderecoPrincipal").checked;

  // Endereços existentes do cliente
  const enderecosCliente = alasql(
    "SELECT * FROM enderecos WHERE clienteId = ?",
    [clienteId]
  );

  if (editingEnderecoId) {
    // --- Atualização ---
    if (principal) {
      // Se marcar como principal, desmarca os outros
      alasql(
        "UPDATE enderecos SET principal = false WHERE clienteId = ? AND id != ?",
        [clienteId, editingEnderecoId]
      );
    } else {
      // Se desmarcar principal, garante que outro continue sendo principal
      const outroPrincipal = enderecosCliente.find(
        (e) => e.principal && e.id !== editingEnderecoId
      );
      if (!outroPrincipal && enderecosCliente.length > 1) principal = true;
    }

    // Atualiza o registro no banco
    alasql(
      "UPDATE enderecos SET cep=?, rua=?, bairro=?, cidade=?, estado=?, pais=?, principal=? WHERE id=?",
      [cep, rua, bairro, cidade, estado, pais, principal, editingEnderecoId]
    );

    showToast("Endereço atualizado com sucesso!");
  } else {
    // --- Inserção ---
    if (enderecosCliente.length === 0) {
      // Primeiro endereço do cliente → sempre principal
      principal = true;
    } else if (principal) {
      // Se marcou como principal → desmarca os outros
      alasql("UPDATE enderecos SET principal = false WHERE clienteId = ?", [
        clienteId,
      ]);
    }

    // Insere novo endereço
    alasql(
      "INSERT INTO enderecos (clienteId, cep, rua, bairro, cidade, estado, pais, principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [clienteId, cep, rua, bairro, cidade, estado, pais, principal]
    );

    showToast("Endereço cadastrado com sucesso!");
  }

  // Reseta formulário e volta para a listagem
  resetEditingEndereco();
  document.getElementById("enderecoFormSection").classList.add("d-none");
  document.getElementById("enderecosSection").classList.remove("d-none");
  renderEnderecos();
}
