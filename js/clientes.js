import { showToast, showConfirmToast } from "./ui.js";

let editingClienteId = null; // Armazena o ID do cliente que está sendo editado (null = nenhum)

// ----- Renderiza a tabela de clientes -----
// Busca os clientes no banco (alasql) e insere as linhas na tabela HTML.
// Também adiciona os eventos de editar e excluir em cada botão.
export function renderClientes() {
  const clientes = alasql("SELECT * FROM clientes"); // Busca todos os clientes
  const tbody = document.querySelector("#clientesTable tbody");
  tbody.innerHTML = ""; // Limpa conteúdo da tabela

  // Cria uma linha (<tr>) para cada cliente
  clientes.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.nome}</td>
      <td>${c.cpf}</td>
      <td>${c.dataNascimento}</td>
      <td>${c.telefone}</td>
      <td>${c.celular}</td>
      <td>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-primary viewEnderecosBtn" data-id="${c.id}">Endereços</button>
          <button class="btn btn-sm btn-warning editClienteBtn" data-id="${c.id}">Editar</button>
          <button class="btn btn-sm btn-danger deleteClienteBtn" data-id="${c.id}">Excluir</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Adiciona eventos aos botões de editar
  document
    .querySelectorAll(".editClienteBtn")
    .forEach((btn) =>
      btn.addEventListener("click", () =>
        startEditCliente(Number(btn.dataset.id))
      )
    );

  // Adiciona eventos aos botões de excluir
  document
    .querySelectorAll(".deleteClienteBtn")
    .forEach((btn) =>
      btn.addEventListener("click", () => deleteCliente(Number(btn.dataset.id)))
    );
}

//----- Cadastra um novo cliente -----
export function registerCliente(nome, cpf, dataNascimento, telefone, celular) {
  if (alasql("SELECT * FROM clientes WHERE cpf=?", [cpf]).length) {
    return { success: false, message: "CPF já cadastrado!" };
  }
  alasql(
    "INSERT INTO clientes (nome, cpf, dataNascimento, telefone, celular) VALUES (?, ?, ?, ?, ?)",
    [nome, cpf, dataNascimento, telefone, celular]
  );
  return { success: true, message: "Cliente cadastrado com sucesso!" };
}

// ----- Limpa bordas e estado do formulário de cliente -----
function resetClienteBorders() {
  const campos = [
    "clienteNome",
    "clienteCpf",
    "clienteDataNascimento",
    "clienteTelefone",
    "clienteCelular",
  ];

  campos.forEach((id) => {
    const input = document.getElementById(id);
    input.classList.remove("touched");
    input.dataset.submitError = "";
    input.style.borderColor = "transparent";
  });
}

// ----- Inicia edição de cliente -----
export function startEditCliente(id) {
  const cliente = alasql("SELECT * FROM clientes WHERE id = ?", [id])[0];
  if (!cliente) return showToast("Cliente não encontrado!", "danger");

  editingClienteId = id; // Marca o cliente que está sendo editado

  // Limpa bordas antigas antes de preencher
  resetClienteBorders();

  // Preenche os campos do formulário com os dados do cliente
  document.getElementById("clienteNome").value = cliente.nome;
  document.getElementById("clienteCpf").value = cliente.cpf;
  document.getElementById("clienteDataNascimento").value =
    cliente.dataNascimento;
  document.getElementById("clienteTelefone").value = cliente.telefone;
  document.getElementById("clienteCelular").value = cliente.celular;

  // Mostra a seção do formulário e esconde a lista de clientes
  document.getElementById("clienteFormSection").classList.remove("d-none");
  document.getElementById("clientesSection").classList.add("d-none");
}

export function saveCliente({ nome, cpf, dataNascimento, telefone, celular }) {
  const cpfInput = document.getElementById("clienteCpf");

  if (editingClienteId) {
    // Atualização de cliente existente
    try {
      alasql(
        "UPDATE clientes SET nome=?, cpf=?, dataNascimento=?, telefone=?, celular=? WHERE id=?",
        [nome, cpf, dataNascimento, telefone, celular, editingClienteId]
      );
      showToast("Cliente atualizado com sucesso!", "success");
      editingClienteId = null; // Reseta estado de edição
      return true;
    } catch (err) {
      console.error(err);
      showToast("Erro ao atualizar cliente!", "danger");
      return false;
    }
  } else {
    // Cadastro de novo cliente
    if (alasql("SELECT * FROM clientes WHERE cpf=?", [cpf]).length) {
      // CPF já existe → marca input vermelho e trava
      cpfInput.classList.add("touched");
      cpfInput.style.borderColor = "#dc2626";
      cpfInput.dataset.submitError = "cpfExists";
      showToast("CPF já cadastrado!", "danger");
      return false;
    }

    alasql(
      "INSERT INTO clientes (nome, cpf, dataNascimento, telefone, celular) VALUES (?, ?, ?, ?, ?)",
      [nome, cpf, dataNascimento, telefone, celular]
    );
    showToast("Cliente cadastrado com sucesso!", "success");
    return true;
  }
}

//----- Reseta estado de edição e limpa formulário -----
export function resetEditingCliente() {
  editingClienteId = null;
  document.getElementById("clienteForm").reset();
  resetClienteBorders();
}

// ----- Exclui cliente -----
export function deleteCliente(id) {
  showConfirmToast("Deseja realmente excluir este cliente?", () => {
    alasql("DELETE FROM clientes WHERE id=?", [id]);
    showToast("Cliente excluído!", "success");
    renderClientes(); // Recarrega a tabela após exclusão
  });
}
