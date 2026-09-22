import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnidadeMedida } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsPositive, IsString, MinLength } from 'class-validator';

export class CreateProdutoDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  nome!: string;

  @ApiProperty({ enum: UnidadeMedida })
  @IsEnum(UnidadeMedida)
  unidadeMedida!: UnidadeMedida;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grupoId?: string;

  @ApiPropertyOptional({ description: 'Validade padrão em dias (ex.: 7) — usada quando o recebimento/produção não informar a validade' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  validadePadraoDias?: number;
}
