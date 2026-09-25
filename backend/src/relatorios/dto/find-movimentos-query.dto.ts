import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoMovimentoLote } from '@prisma/client';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';

export class FindMovimentosQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  produtoId?: string;

  @ApiPropertyOptional({ description: 'Filtra movimentos onde este local é origem ou destino' })
  @IsOptional()
  @IsString()
  localId?: string;

  @ApiPropertyOptional({ enum: TipoMovimentoLote })
  @IsOptional()
  @IsEnum(TipoMovimentoLote)
  tipo?: TipoMovimentoLote;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  dataInicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  dataFim?: string;
}
