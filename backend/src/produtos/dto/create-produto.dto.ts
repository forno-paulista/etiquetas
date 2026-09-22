import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UnidadeMedida } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

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
}
