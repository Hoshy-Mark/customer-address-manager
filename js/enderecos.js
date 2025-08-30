import { showToast } from "./ui.js";

let editingEnderecoId = null;

export function renderClientesSelect() {
  const select = document.getElementById('selectCliente');
  const clientes = alasql('SELECT * FROM clientes');
  select.innerHTML = '';
  clientes.forEach(c => {
    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = c.nome;
    select.appendChild(option);
  });
}

export function renderEnderecos() {
  const clienteId = Number(document.getElementById('selectCliente').value);
  const enderecos = alasql('SELECT * FROM enderecos WHERE clienteId = ?', [clienteId]);
  const tbody = document.getElementById('enderecosTable').querySelector('tbody');
  tbody.innerHTML = '';

  enderecos.forEach(endereco => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${endereco.cep}</td>
      <td>${endereco.rua}</td>
      <td>${endereco.bairro}</td>
      <td>${endereco.cidade}</td>
      <td>${endereco.estado}</td>
      <td>${endereco.pais}</td>
      <td>${endereco.principal ? 'Sim' : 'Não'}</td>
      <td>
        <button class="btn btn-warning btn-sm edit-endereco" data-id="${endereco.id}">Editar</button>
        <button class="btn btn-danger btn-sm delete-endereco" data-id="${endereco.id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.edit-endereco').forEach(btn =>
    btn.addEventListener('click', () => editEndereco(Number(btn.dataset.id)))
  );
  tbody.querySelectorAll('.delete-endereco').forEach(btn =>
    btn.addEventListener('click', () => deleteEndereco(Number(btn.dataset.id)))
  );
}

/**
 * Reseta o formulário e o estado de edição
 */
export function resetEditingEndereco() {
  editingEnderecoId = null;
  document.getElementById('enderecoForm').reset();
}

/**
 * Edita endereço existente
 */
export function editEndereco(id) {
  const endereco = alasql('SELECT * FROM enderecos WHERE id = ?', [id])[0];
  if (!endereco) return;

  editingEnderecoId = id;
  document.getElementById('enderecoCep').value = endereco.cep;
  document.getElementById('enderecoRua').value = endereco.rua;
  document.getElementById('enderecoBairro').value = endereco.bairro;
  document.getElementById('enderecoCidade').value = endereco.cidade;
  document.getElementById('enderecoEstado').value = endereco.estado;
  document.getElementById('enderecoPais').value = endereco.pais;
  document.getElementById('enderecoPrincipal').checked = endereco.principal;

  document.getElementById('enderecoFormSection').classList.remove('d-none');
  document.getElementById('enderecosSection').classList.add('d-none');
}

/**
 * Exclui endereço
 */
export function deleteEndereco(id) {
  const endereco = alasql('SELECT * FROM enderecos WHERE id = ?', [id])[0];
  if (!endereco) return;

  alasql('DELETE FROM enderecos WHERE id = ?', [id]);

  const enderecosCliente = alasql('SELECT * FROM enderecos WHERE clienteId = ?', [endereco.clienteId]);
  if (endereco.principal && enderecosCliente.length > 0) {
    alasql('UPDATE enderecos SET principal = true WHERE id = ?', [enderecosCliente[0].id]);
  }

  showToast('Endereço excluído com sucesso!');
  renderEnderecos();
}

/**
 * Salva (insere ou atualiza) um endereço
 */
export function saveEndereco(e) {
  e.preventDefault();
  const clienteId = Number(document.getElementById('selectCliente').value);
  const cep = document.getElementById('enderecoCep').value.trim();
  const rua = document.getElementById('enderecoRua').value.trim();
  const bairro = document.getElementById('enderecoBairro').value.trim();
  const cidade = document.getElementById('enderecoCidade').value.trim();
  const estado = document.getElementById('enderecoEstado').value.trim();
  const pais = document.getElementById('enderecoPais').value.trim();
  let principal = document.getElementById('enderecoPrincipal').checked;

  const enderecosCliente = alasql('SELECT * FROM enderecos WHERE clienteId = ?', [clienteId]);

  if (editingEnderecoId) {
    // Atualização
    if (principal) {
      alasql('UPDATE enderecos SET principal = false WHERE clienteId = ? AND id != ?', [clienteId, editingEnderecoId]);
    } else {
      const outroPrincipal = enderecosCliente.find(e => e.principal && e.id !== editingEnderecoId);
      if (!outroPrincipal && enderecosCliente.length > 1) principal = true;
    }

    alasql('UPDATE enderecos SET cep=?, rua=?, bairro=?, cidade=?, estado=?, pais=?, principal=? WHERE id=?',
      [cep, rua, bairro, cidade, estado, pais, principal, editingEnderecoId]);

    showToast('Endereço atualizado com sucesso!');
  } else {
    // Inserção
    if (enderecosCliente.length === 0) principal = true;
    else if (principal) alasql('UPDATE enderecos SET principal = false WHERE clienteId = ?', [clienteId]);

    alasql('INSERT INTO enderecos (clienteId, cep, rua, bairro, cidade, estado, pais, principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [clienteId, cep, rua, bairro, cidade, estado, pais, principal]);

    showToast('Endereço cadastrado com sucesso!');
  }

  resetEditingEndereco();
  document.getElementById('enderecoFormSection').classList.add('d-none');
  document.getElementById('enderecosSection').classList.remove('d-none');
  renderEnderecos();
}