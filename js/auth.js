import { showToast } from "./ui.js";

// ----- Realiza login do usuário -----
// Verifica se existe um usuário com o nome e senha fornecidos.
export function loginUser(usuario, senha) {
  const result = alasql(
    "SELECT * FROM usuarios WHERE usuario = ? AND senha = ?",
    [usuario, senha]
  );
  return result.length ? result[0] : null; // Retorna o usuário ou null
}

// ----- Cadastra um novo usuário -----
export function registerUser(nome, usuario, senha) {
  const exists = alasql("SELECT * FROM usuarios WHERE usuario = ?", [usuario]);
  if (exists.length) return false; // Usuário já existe
  alasql("INSERT INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)", [
    nome,
    usuario,
    senha,
  ]);
  return true; // Cadastro realizado com sucesso
}

// ----- Realiza logout do usuário -----
export function logout() {
  // Esconde todas as seções da aplicação
  document
    .querySelectorAll("section")
    .forEach((sec) => sec.classList.add("d-none"));

  // Mostra a seção de login
  document.getElementById("loginSection").classList.remove("d-none");

  // Limpa os campos de usuário e senha
  document.getElementById("usuario").value = "";
  document.getElementById("senha").value = "";

  // Exibe mensagem de logout realizado
  showToast("Logout efetuado com sucesso", "success");
}
