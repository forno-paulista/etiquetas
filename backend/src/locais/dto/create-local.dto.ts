import { ApiProperty } from '@nestjs/swagger';
import { TipoLocal } from '@prisma/client';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class CreateLocalDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  nome!: string;

  @ApiProperty({ enum: TipoLocal })
  @IsEnum(TipoLocal)
  tipo!: TipoLocal;
}
