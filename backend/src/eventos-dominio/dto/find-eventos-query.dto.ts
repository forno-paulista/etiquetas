import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FindEventosQueryDto {
  @ApiPropertyOptional({ description: 'Ex.: "descarte.registrado" — ver eventos-dominio/tipos.ts' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ description: 'Ex.: "Descarte", "Transferencia", "Lote"' })
  @IsOptional()
  @IsString()
  agregado?: string;

  @ApiPropertyOptional({ description: 'Cursor — devolve só eventos com id maior que este (paginação por polling)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  desde?: number;
}
