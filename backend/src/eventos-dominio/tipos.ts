// Um valor por fato de negócio que gera MovimentoLote (mapeamento 1:1 com
// TipoMovimentoLote, exceto Transferência, que tem dois — envio e
// confirmação são dois fatos distintos no tempo). Const em vez de enum do
// Prisma porque este é vocabulário do log de eventos, não do schema — não
// devia exigir migração pra um adaptador novo aprender um tipo existente.
export const TIPO_EVENTO = {
  LOTE_RECEBIDO: 'lote.recebido',
  PRODUCAO_REALIZADA: 'producao.realizada',
  TRANSFERENCIA_ENVIADA: 'transferencia.enviada',
  TRANSFERENCIA_CONFIRMADA: 'transferencia.confirmada',
  DESCARTE_REGISTRADO: 'descarte.registrado',
  CONSUMO_REGISTRADO: 'consumo.registrado',
  CONTAGEM_DIVERGENTE: 'contagem.divergente',
} as const;

export type TipoEvento = (typeof TIPO_EVENTO)[keyof typeof TIPO_EVENTO];
