import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class FindAlertasQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localId?: string;

  @ApiPropertyOptional({ default: 7, description: 'Tamanho da janela "a vencer" além de hoje/amanhã' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  diasAlerta?: number;
}
