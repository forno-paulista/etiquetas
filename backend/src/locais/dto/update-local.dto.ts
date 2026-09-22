import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoLocal } from '@prisma/client';
import { IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateLocalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  nome?: string;

  @ApiPropertyOptional({ enum: TipoLocal })
  @IsOptional()
  @IsEnum(TipoLocal)
  tipo?: TipoLocal;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
