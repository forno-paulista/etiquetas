import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateGrupoDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  nome!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icone?: string;

  @ApiPropertyOptional({ description: 'Se preenchido, este grupo vira um subgrupo do grupo informado' })
  @IsOptional()
  @IsString()
  grupoPaiId?: string;
}
