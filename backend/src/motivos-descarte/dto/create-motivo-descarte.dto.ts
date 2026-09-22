import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateMotivoDescarteDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  nome!: string;
}
