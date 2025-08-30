// js/clientes.js
import { showToast, showConfirmToast } from "./ui.js";

let editingClienteId = null;

// Renderiza a tabela de clientes
export function renderClientes() {
  const clientes = alasql("SELECT * FROM clientes");
  const tbody = document.querySelector("#clientesTable tbody");
  tbody.innerHTML = "";

  clientes.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.nome}</td>
      <td>${c.cpf}</td>
      <td>${c.dataNascimento}</td>
      <td>${c.telefone}</td>
      <td>${c.celular}</td>
      <td>
        <button class="btn btn-sm btn-primary viewEnderecosBtn" data-id="${c.id}">Endereços</button>
        <button class="btn btn-sm btn-warning editClienteBtn" data-id="${c.id}">Editar</button>
        <button class="btn btn-sm btn-danger deleteClienteBtn" data-id="${c.id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.querySelectorAll(".editClienteBtn").forEach((btn) =>
    btn.addEventListener("click", () => startEditCliente(Number(btn.dataset.id)))
  );

  document.querySelectorAll(".deleteClienteBtn").forEach((btn) =>
    btn.addEventListener("click", () => deleteCliente(Number(btn.dataset.id)))
  );
}

// Cadastra um novo cliente
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

// Inicia edição de cliente
export function startEditCliente(id) {
  const cliente = alasql("SELECT * FROM clientes WHERE id = ?", [id])[0];
  if (!cliente) return showToast("Cliente não encontrado!", "danger");

  editingClienteId = id;

  // Preenche o formulário com os dados do cliente
  document.getElementById("clienteNome").value = cliente.nome;
  document.getElementById("clienteCpf").value = cliente.cpf;
  document.getElementById("clienteDataNascimento").value = cliente.dataNascimento;
  document.getElementById("clienteTelefone").value = cliente.telefone;
  document.getElementById("clienteCelular").value = cliente.celular;

  document.getElementById("clienteFormSection").classList.remove("d-none");
  document.getElementById("clientesSection").classList.add("d-none");
}

// Salva cliente (novo ou editado)
export function saveCliente({ nome, cpf, dataNascimento, telefone, celular }) {
  if (editingClienteId) {
    try {
      alasql(
        "UPDATE clientes SET nome=?, cpf=?, dataNascimento=?, telefone=?, celular=? WHERE id=?",
        [nome, cpf, dataNascimento, telefone, celular, editingClienteId]
      );
      showToast("Cliente atualizado com sucesso!", "success");
      editingClienteId = null;
      return true;
    } catch (err) {
      console.error(err);
      showToast("Erro ao atualizar cliente!", "danger");
      return false;
    }
  } else {
    const result = registerCliente(nome, cpf, dataNascimento, telefone, celular);
    showToast(result.message, result.success ? "success" : "danger");
    return result.success;
  }
}

// Reseta estado de edição e limpa formulário
export function resetEditingCliente() {
  editingClienteId = null;
  document.getElementById("clienteForm").reset();
}

// Exclui cliente
export function deleteCliente(id) {
  showConfirmToast("Deseja realmente excluir este cliente?", () => {
    alasql("DELETE FROM clientes WHERE id=?", [id]);
    showToast("Cliente excluído!", "success");
    renderClientes();
  });
}
