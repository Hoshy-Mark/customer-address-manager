import { showToast } from './ui.js';

export function loginUser(usuario, senha) {
  const result = alasql('SELECT * FROM usuarios WHERE usuario = ? AND senha = ?', [usuario, senha]);
  return result.length ? result[0] : null;
}

export function registerUser(nome, usuario, senha) {
  const exists = alasql('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
  if (exists.length) return false;
  alasql('INSERT INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)', [nome, usuario, senha]);
  return true;
}

export function logout() {
  document.querySelectorAll('section').forEach(sec => sec.classList.add('d-none'));
  document.getElementById('loginSection').classList.remove('d-none');
  document.getElementById('usuario').value = '';
  document.getElementById('senha').value = '';
  showToast('Logout efetuado com sucesso', 'success');
}
