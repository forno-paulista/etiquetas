import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';
import { SENHA_REGEX, SENHA_REGEX_MENSAGEM } from '../senha.validacao.js';

export class ResetSenhaDto {
  @ApiProperty({ minLength: 8, description: 'Precisa ter letra e número' })
  @IsString()
  @MinLength(8)
  @Matches(SENHA_REGEX, { message: SENHA_REGEX_MENSAGEM })
  senha!: string;
}
