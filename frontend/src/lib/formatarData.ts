// Datas de validade/fabricação são datas de calendário, não instantes —
// "18/11/2026" chega da API como "2026-11-18T00:00:00.000Z" (meia-noite
// UTC). Formatar sem timeZone: 'UTC' deixa o navegador converter pro
// fuso local (ex.: GMT-3), o que empurra a data um dia pra trás. Sempre
// ler o calendário em UTC, nunca no fuso do usuário.
export function formatarData(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}
