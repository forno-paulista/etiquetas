// Compartilhado entre criação e redefinição de senha — mínimo pra não
// aceitar senha só numérica ou só de letras, sem virar medidor de força.
export const SENHA_REGEX = /^(?=.*[A-Za-z])(?=.*\d).+$/;
export const SENHA_REGEX_MENSAGEM = 'Senha precisa ter letras e números.';
