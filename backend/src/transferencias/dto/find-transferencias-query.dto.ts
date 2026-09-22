import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatusTransferencia } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class FindTransferenciasQueryDto {
  @ApiPropertyOptional({ enum: StatusTransferencia })
  @IsOptional()
  @IsEnum(StatusTransferencia)
  status?: StatusTransferencia;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localOrigemId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  localDestinoId?: string;
}
