import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class FindLotesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  produtoId?: string;

  @ApiPropertyOptional({ description: 'Filtra pelo saldo do lote neste local' })
  @IsOptional()
  @IsString()
  localId?: string;

  @ApiPropertyOptional({
    description: 'Se true (padrão), só traz lotes com saldo > 0 — útil pra escolher lote em Transferência/Produção/Descarte/Consumo',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value !== 'false' : value))
  @IsBoolean()
  comSaldo?: boolean;
}
