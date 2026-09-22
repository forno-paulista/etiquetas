import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusAjustePendente } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class FindAjustesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localId?: string;

  @ApiPropertyOptional({ enum: StatusAjustePendente })
  @IsOptional()
  @IsEnum(StatusAjustePendente)
  status?: StatusAjustePendente;
}
