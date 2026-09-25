import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PapelUsuario } from '@prisma/client';
import { ArrayUnique, IsArray, IsEmail, IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { SENHA_REGEX, SENHA_REGEX_MENSAGEM } from '../senha.validacao.js';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  nome!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8, description: 'Precisa ter letra e número' })
  @IsString()
  @MinLength(8)
  @Matches(SENHA_REGEX, { message: SENHA_REGEX_MENSAGEM })
  senha!: string;

  @ApiProperty({ enum: PapelUsuario })
  @IsEnum(PapelUsuario)
  papel!: PapelUsuario;

  @ApiPropertyOptional({ type: [String], description: 'IDs dos locais aos quais o usuário tem acesso' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  locaisAcesso?: string[];
}
