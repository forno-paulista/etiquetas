import { ApiProperty } from '@nestjs/swagger';

// Visualização resumida de um lote via QR Code (autenticada — decisão
// revertida de "pública sem login", seção 13 do CLAUDE.md) — só o básico,
// não o histórico completo de movimentos/locais (isso é GET /lotes/:id).
export class LoteResumoResponseDto {
  @ApiProperty()
  produtoNome!: string;

  @ApiProperty()
  codigoLote!: string;

  @ApiProperty()
  dataValidade!: Date;

  @ApiProperty()
  vencido!: boolean;

  @ApiProperty()
  quantidadeAtualTotal!: string;

  @ApiProperty()
  unidadeMedida!: string;
}
