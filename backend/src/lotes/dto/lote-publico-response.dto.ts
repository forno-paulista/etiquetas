import { ApiProperty } from '@nestjs/swagger';

// Visualização pública do QR Code (sem login) — seção 13 do CLAUDE.md:
// só o básico, nunca o histórico completo de movimentos/locais.
export class LotePublicoResponseDto {
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
