import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PapelUsuario } from '@prisma/client';
import { ArrayUnique, IsArray, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  nome!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
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
