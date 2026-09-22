import { ApiProperty } from '@nestjs/swagger';
import { PapelUsuario } from '@prisma/client';

class LocalResumoDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;
}

export class UsuarioResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: PapelUsuario })
  papel!: PapelUsuario;

  @ApiProperty()
  ativo!: boolean;

  @ApiProperty({ type: [LocalResumoDto] })
  locaisAcesso!: LocalResumoDto[];
}
