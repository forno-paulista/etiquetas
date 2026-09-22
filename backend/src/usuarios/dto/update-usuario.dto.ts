import { ApiPropertyOptional } from '@nestjs/swagger';
import { PapelUsuario } from '@prisma/client';
import { ArrayUnique, IsArray, IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUsuarioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  nome?: string;

  @ApiPropertyOptional({ enum: PapelUsuario })
  @IsOptional()
  @IsEnum(PapelUsuario)
  papel?: PapelUsuario;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @ApiPropertyOptional({ type: [String], description: 'Substitui a lista completa de locais de acesso' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  locaisAcesso?: string[];
}
