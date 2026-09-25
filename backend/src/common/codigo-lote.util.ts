// Regra de negócio (CLAUDE.md § 18.4, decisão a partir do mapeamento do
// Suflex): o código do lote é texto livre e opcional — quem rastreia de
// verdade é o `qrCodeId` (gerado pelo banco, nunca digitado). Não há
// exigência de unicidade. Quando o usuário não informa nada, geramos um
// código só pra não deixar a etiqueta com "Lote " em branco — não é uma
// tentativa de identificador único.
export function gerarCodigoLotePadrao(dataBase: Date = new Date()): string {
  const data = dataBase.toISOString().slice(2, 10).replace(/-/g, '');
  const sufixo = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AUTO-${data}-${sufixo}`;
}
