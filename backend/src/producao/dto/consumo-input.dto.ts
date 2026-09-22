import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsPositive, IsString, MinLength, ValidateIf } from 'class-validator';

// Um lote de origem consumido numa Produção — ou, se a origem for
// desconhecida, a descrição obrigatória no lugar do lote (CLAUDE.md § 5,
// regra 11). Exatamente um dos dois caminhos, nunca os dois nem nenhum —
// validado no service, não dá pra expressar isso limpo só com decorators.
export class ConsumoInputDto {
  @ApiPropertyOptional({ description: 'Obrigatório se origemDesconhecida for false' })
  @IsOptional()
  @IsString()
  loteOrigemId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  origemDesconhecida?: boolean;

  @ApiPropertyOptional({ description: 'Obrigatório se origemDesconhecida for true' })
  @ValidateIf((o) => o.origemDesconhecida === true)
  @IsString()
  @MinLength(1)
  descricaoOrigem?: string;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidadeConsumida!: number;
}
