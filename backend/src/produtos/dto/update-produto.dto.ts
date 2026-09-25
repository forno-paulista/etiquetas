import { ApiPropertyOptional } from '@nestjs/swagger';
import { UnidadeMedida } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class UpdateProdutoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  nome?: string;

  @ApiPropertyOptional({ enum: UnidadeMedida })
  @IsOptional()
  @IsEnum(UnidadeMedida)
  unidadeMedida?: UnidadeMedida;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grupoId?: string;

  @ApiPropertyOptional({ description: 'Validade padrão em dias — usada quando o recebimento/produção não informar a validade' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  validadePadraoDias?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
